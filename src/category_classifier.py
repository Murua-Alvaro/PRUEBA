from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
import numpy as np
from PIL import Image, ImageOps

LABELS = {
    0: "T-shirt/top",
    1: "Trouser",
    2: "Pullover",
    3: "Dress",
    4: "Coat",
    5: "Sandal",
    6: "Shirt",
    7: "Sneaker",
    8: "Bag",
    9: "Ankle boot",
}

CATEGORY_MAP = {
    "T-shirt/top": "shirt",
    "Pullover": "shirt",
    "Shirt": "shirt",
    "Coat": "shirt",
    "Trouser": "pants",
    "Dress": "dress",
    "Sandal": "shoe",
    "Sneaker": "shoe",
    "Ankle boot": "shoe",
    "Bag": "all",
}


@dataclass
class CategoryPrediction:
    label: str
    category: str
    confidence: float


class FashionCategoryClassifier:
    """Lightweight Fashion-MNIST ONNX gate used before visual ranking.

    This classifier is deliberately a coarse gate. It keeps obviously different
    garment families out of the candidate pool; the visual embedder still ranks
    items inside the selected family.
    """

    def __init__(self):
        self._session = None
        self._model_path = None

    def _load(self):
        if self._session is not None:
            return
        import onnxruntime as ort
        from huggingface_hub import hf_hub_download

        self._model_path = hf_hub_download(
            repo_id="tsilva/fashion-mnist-classifier-cnn",
            filename="model.onnx",
        )
        self._session = ort.InferenceSession(
            self._model_path,
            providers=["CPUExecutionProvider"],
        )

    @staticmethod
    def _softmax(x: np.ndarray) -> np.ndarray:
        x = x - np.max(x, axis=1, keepdims=True)
        e = np.exp(x)
        return e / np.sum(e, axis=1, keepdims=True)

    def predict(self, image: Image.Image) -> CategoryPrediction:
        self._load()
        # Fashion-MNIST is grayscale. Use autocontrast so clean e-commerce photos
        # preserve the garment silhouette even when colors differ substantially.
        gray = ImageOps.autocontrast(image.convert("L")).resize((28, 28), Image.Resampling.LANCZOS)
        x = np.asarray(gray, dtype=np.float32) / 255.0

        # Fashion-MNIST clothing is typically bright on a dark field. Product
        # photos are often dark garment on white; invert when the border is bright.
        border = np.concatenate([x[0, :], x[-1, :], x[:, 0], x[:, -1]])
        if float(border.mean()) > 0.55:
            x = 1.0 - x

        x = (x - 0.2860) / 0.3530
        x = x[None, None, :, :].astype(np.float32)

        inp = self._session.get_inputs()[0].name
        out_name = self._session.get_outputs()[0].name
        logits = self._session.run([out_name], {inp: x})[0]
        probs = self._softmax(np.asarray(logits, dtype=np.float32))
        idx = int(np.argmax(probs[0]))
        label = LABELS[idx]
        return CategoryPrediction(
            label=label,
            category=CATEGORY_MAP[label],
            confidence=float(probs[0, idx]),
        )


@lru_cache(maxsize=1)
def get_category_classifier() -> FashionCategoryClassifier:
    return FashionCategoryClassifier()
