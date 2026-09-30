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


def _foreground_crop(image: Image.Image) -> tuple[Image.Image, np.ndarray]:
    """Estimate a foreground mask from border color and normalize framing.

    This is intentionally lightweight for the public demo. It works best for
    product/person photos on a simple background and is not a segmentation model.
    """
    im = image.convert("RGB").resize((192, 192))
    arr = np.asarray(im).astype(np.int16)

    border = np.concatenate([
        arr[:8].reshape(-1, 3),
        arr[-8:].reshape(-1, 3),
        arr[:, :8].reshape(-1, 3),
        arr[:, -8:].reshape(-1, 3),
    ])
    bg = np.median(border, axis=0)
    dist = np.linalg.norm(arr - bg, axis=2)
    sat = arr.max(axis=2) - arr.min(axis=2)

    mask = (dist > 20) | ((sat > 28) & (arr.mean(axis=2) < 248))
    mask_img = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(3))
    mask = np.asarray(mask_img) > 0

    ys, xs = np.where(mask)
    if len(xs) < 200:
        return im.resize((160, 192)), np.ones((192, 160), dtype=bool)

    x0, x1 = max(int(xs.min()) - 5, 0), min(int(xs.max()) + 6, 192)
    y0, y1 = max(int(ys.min()) - 5, 0), min(int(ys.max()) + 6, 192)

    cropped = im.crop((x0, y0, x1, y1)).resize((160, 192))
    cropped_mask = Image.fromarray((mask[y0:y1, x0:x1] * 255).astype(np.uint8)).resize(
        (160, 192), Image.Resampling.NEAREST
    )
    return cropped, np.asarray(cropped_mask) > 0


@dataclass
class ClassicVisualEmbedder:
    """Lightweight visual baseline: color + silhouette + texture + edges.

    This is a CPU-friendly demo descriptor, not a semantic fashion model.
    """
    name: str = "classic-v2"
    dim: int = 0

    def encode_image(self, image: Image.Image) -> np.ndarray:
        im, mask = _foreground_crop(image)
        arr = np.asarray(im).astype(np.uint8)
        hsv = np.asarray(im.convert("HSV"))

        valid = mask & (arr.mean(axis=2) < 251)
        r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
        skin = (r > 95) & (g > 40) & (b > 20) & (r > g) & (r > b) & ((r - g) > 12)
        cloth = valid & ~skin
        if int(cloth.sum()) < 100:
            cloth = valid

        parts: list[np.ndarray] = []

        hue_hist = np.histogram(
            hsv[:, :, 0][cloth],
            bins=24,
            range=(0, 256),
            weights=(hsv[:, :, 1][cloth] / 255.0 + 0.1),
        )[0]
        parts.append(_l2_normalize(hue_hist) * 2.3)

        sat_hist = np.histogram(hsv[:, :, 1][cloth], bins=8, range=(0, 256))[0]
        val_hist = np.histogram(hsv[:, :, 2][cloth], bins=8, range=(0, 256))[0]
        parts.append(_l2_normalize(sat_hist) * 1.2)
        parts.append(_l2_normalize(val_hist) * 0.7)

        mask_img = Image.fromarray((mask * 255).astype(np.uint8))
        silhouette = np.asarray(
            mask_img.resize((16, 16), Image.Resampling.BILINEAR), dtype=np.float32
        ).reshape(-1) / 255.0
        parts.append(_l2_normalize(silhouette) * 3.6)

        row_profile = mask.mean(axis=1)
        col_profile = mask.mean(axis=0)
        row16 = np.interp(np.linspace(0, len(row_profile) - 1, 16), np.arange(len(row_profile)), row_profile)
        col16 = np.interp(np.linspace(0, len(col_profile) - 1, 16), np.arange(len(col_profile)), col_profile)
        parts.append(_l2_normalize(np.concatenate([row16, col16])) * 4.2)

        gray = im.convert("L")
        edge = np.asarray(gray.filter(ImageFilter.FIND_EDGES), dtype=np.float32)
        edge[~mask] = 0
        edge16 = np.asarray(
            Image.fromarray(np.uint8(np.clip(edge, 0, 255))).resize((16, 16), Image.Resampling.BILINEAR),
            dtype=np.float32,
        ).reshape(-1) / 255.0
        parts.append(_l2_normalize(edge16) * 1.8)

        gray_arr = np.asarray(gray, dtype=np.float32)
        texture = []
        for yy in range(0, 192, 24):
            for xx in range(0, 160, 20):
                block = gray_arr[yy:yy + 24, xx:xx + 20]
                block_mask = mask[yy:yy + 24, xx:xx + 20]
                texture.append(float(block[block_mask].std() / 64.0) if block_mask.any() else 0.0)
        parts.append(_l2_normalize(np.asarray(texture, dtype=np.float32)) * 2.8)

        vec = _l2_normalize(np.concatenate(parts).astype(np.float32))
        self.dim = int(vec.shape[0])
        return vec


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
        self.dim = 0

    def encode_image(self, image: Image.Image) -> np.ndarray:
        x = self.preprocess(image.convert("RGB")).unsqueeze(0).to(self.device)
        with self.torch.no_grad():
            features = self.model.encode_image(x)
            features = features / features.norm(dim=-1, keepdim=True)
        vec = features[0].detach().cpu().float().numpy().astype(np.float32)
        self.dim = int(vec.shape[0])
        return vec


def get_embedder(kind: str = "classic") -> Embedder:
    kind = kind.lower().strip()
    if kind in {"classic", "offline", "baseline"}:
        return ClassicVisualEmbedder()
    if kind in {"openclip", "clip"}:
        return OpenCLIPEmbedder()
    raise ValueError(f"Unknown embedder kind: {kind}")
