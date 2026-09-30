from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol
import numpy as np
from PIL import Image, ImageFilter


class Embedder(Protocol):
    name: str
    dim: int
    def encode_image(self, image: Image.Image) -> np.ndarray: ...


def _l2_normalize(x: np.ndarray) -> np.ndarray:
    x = x.astype(np.float32, copy=False)
    norm = np.linalg.norm(x)
    return x / max(norm, 1e-12)


@dataclass
class ClassicVisualEmbedder:
    """Dependency-light visual baseline for the public MVP."""
    name: str = "classic-offline"
    dim: int = 1072

    def encode_image(self, image: Image.Image) -> np.ndarray:
        rgb_img = image.convert("RGB").resize((128, 128))
        rgb = np.asarray(rgb_img, dtype=np.uint8)

        hist_parts = []
        for channel in range(3):
            h, _ = np.histogram(rgb[:, :, channel], bins=16, range=(0, 256), density=False)
            hist_parts.append(h.astype(np.float32))
        hist = np.concatenate(hist_parts)
        hist /= max(float(hist.sum()), 1.0)

        low = np.asarray(rgb_img.resize((16, 16), Image.Resampling.BILINEAR), dtype=np.float32) / 255.0
        low = low.flatten()

        edge = rgb_img.convert("L").filter(ImageFilter.FIND_EDGES)
        edge = np.asarray(edge.resize((16, 16), Image.Resampling.BILINEAR), dtype=np.float32) / 255.0
        edge = edge.flatten()

        return _l2_normalize(np.concatenate([hist, low, edge]).astype(np.float32))


class OpenCLIPEmbedder:
    """Optional production-grade OpenCLIP image embedder."""

    def __init__(self, model_name: str = "ViT-B-32", pretrained: str = "laion2b_s34b_b79k"):
        try:
            import torch
            import open_clip
        except ImportError as exc:
            raise RuntimeError("OpenCLIP is not installed. Run: pip install open_clip_torch") from exc

        self.torch = torch
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            model_name, pretrained=pretrained, device=self.device
        )
        self.model.eval()
        self.name = f"openclip:{model_name}:{pretrained}"
        self.dim = None

    def encode_image(self, image: Image.Image) -> np.ndarray:
        x = self.preprocess(image.convert("RGB")).unsqueeze(0).to(self.device)
        with self.torch.no_grad():
            features = self.model.encode_image(x)
            features = features / features.norm(dim=-1, keepdim=True)
        vec = features[0].detach().cpu().float().numpy().astype(np.float32)
        if self.dim is None:
            self.dim = int(vec.shape[0])
        return vec


def get_embedder(kind: str = "classic") -> Embedder:
    kind = kind.lower().strip()
    if kind in {"classic", "offline", "baseline"}:
        return ClassicVisualEmbedder()
    if kind in {"openclip", "clip"}:
        return OpenCLIPEmbedder()
    raise ValueError(f"Unknown embedder kind: {kind}")
