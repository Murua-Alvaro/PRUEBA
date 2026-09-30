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
    source: str = "onnx"


class FashionCategoryClassifier:
    """Coarse garment-family gate before visual ranking.

    Uses a tiny ONNX Fashion-MNIST classifier plus a silhouette hint for clean
    white-background product photos. It is intentionally only a gate: the visual
    search engine still ranks products within the chosen family.
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

    @staticmethod
    def _shape_hint(image: Image.Image) -> str | None:
        """Return a strong family hint for isolated garments on light backgrounds."""
        rgb = np.asarray(image.convert("RGB").resize((224, 224)), dtype=np.float32)
        border = np.concatenate(
            [rgb[0, :, :], rgb[-1, :, :], rgb[:, 0, :], rgb[:, -1, :]], axis=0
        )
        bg = np.median(border, axis=0)
        # Only trust this heuristic for near-neutral, bright product backgrounds.
        if float(bg.mean()) < 190 or float(bg.max() - bg.min()) > 35:
            return None
        dist = np.linalg.norm(rgb - bg[None, None, :], axis=2)
        mask = dist > 38
        ys, xs = np.where(mask)
        if len(xs) < 700:
            return None
        y0, y1 = int(ys.min()), int(ys.max())
        x0, x1 = int(xs.min()), int(xs.max())
        h = max(1, y1 - y0 + 1)
        w = max(1, x1 - x0 + 1)
        m = mask[y0 : y1 + 1, x0 : x1 + 1]
        row_width = m.sum(axis=1).astype(np.float32)
        q = len(row_width)
        if q < 12:
            return None
        upper = float(np.mean(row_width[int(0.16*q):int(0.42*q)]))
        lower = float(np.mean(row_width[int(0.68*q):int(0.92*q)]))
        ratio = upper / max(lower, 1.0)
        aspect = h / max(w, 1)

        # Tops: sleeves/shoulders broader than the lower torso.
        if ratio > 1.18 and aspect < 1.75:
            return "shirt"
        # Dresses/skirts: lower body fans out substantially.
        if ratio < 0.72 and aspect > 1.05:
            return "dress"
        return None

    def predict(self, image: Image.Image) -> CategoryPrediction:
        hint = self._shape_hint(image)
        self._load()

        gray = ImageOps.autocontrast(image.convert("L")).resize((28, 28), Image.Resampling.LANCZOS)
        x = np.asarray(gray, dtype=np.float32) / 255.0
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
        category = CATEGORY_MAP[label]
        confidence = float(probs[0, idx])

        # Strong clean-background silhouette evidence wins over a cross-domain
        # Fashion-MNIST prediction when the two disagree.
        if hint == "shirt" and category != "shirt":
            return CategoryPrediction("Top / T-shirt", "shirt", max(confidence, 0.70), "silhouette+onnx")
        if hint == "dress" and category not in {"dress", "pants"}:
            return CategoryPrediction("Dress / skirt family", "dress", max(confidence, 0.65), "silhouette+onnx")

        return CategoryPrediction(label, category, confidence, "onnx")


@lru_cache(maxsize=1)
def get_category_classifier() -> FashionCategoryClassifier:
    return FashionCategoryClassifier()
