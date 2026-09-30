from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import numpy as np
import pandas as pd
from PIL import Image

from .config import EMBEDDINGS_PATH, METADATA_PATH
from .embeddings import Embedder


@dataclass
class SearchResult:
    product_id: str
    name: str
    category: str
    color: str
    price: float
    store: str
    image_path: str
    similarity: float


class VisualSearchEngine:
    def __init__(self, embedder: Embedder, embeddings_path: Path = EMBEDDINGS_PATH,
                 metadata_path: Path = METADATA_PATH):
        self.embedder = embedder
        self.embeddings_path = Path(embeddings_path)
        self.metadata_path = Path(metadata_path)
        self.embeddings: np.ndarray | None = None
        self.metadata: pd.DataFrame | None = None

    def load(self) -> None:
        self.embeddings = np.load(self.embeddings_path).astype(np.float32)
        self.metadata = pd.read_csv(self.metadata_path)
        if len(self.metadata) != len(self.embeddings):
            raise ValueError("Metadata and embedding counts do not match")

    def _ensure_loaded(self) -> None:
        if self.embeddings is None or self.metadata is None:
            self.load()

    def search(self, image: Image.Image, top_k: int = 8, category: str | None = None,
               max_price: float | None = None) -> list[SearchResult]:
        self._ensure_loaded()
        assert self.embeddings is not None and self.metadata is not None

        q = self.embedder.encode_image(image).astype(np.float32)
        if q.shape[0] != self.embeddings.shape[1]:
            raise ValueError(
                f"Embedding dimension mismatch: query={q.shape[0]} index={self.embeddings.shape[1]}. "
                "Re-index the catalog with the same embedder."
            )

        mask = np.ones(len(self.metadata), dtype=bool)
        if category and category.lower() != "all":
            mask &= self.metadata["category"].str.lower().eq(category.lower()).to_numpy()
        if max_price is not None:
            mask &= self.metadata["price"].astype(float).to_numpy() <= float(max_price)

        candidate_idx = np.flatnonzero(mask)
        if len(candidate_idx) == 0:
            return []

        scores = self.embeddings[candidate_idx] @ q
        order = np.argsort(-scores)[:top_k]
        selected = candidate_idx[order]

        out: list[SearchResult] = []
        for idx in selected:
            row = self.metadata.iloc[idx]
            out.append(SearchResult(
                product_id=str(row["product_id"]),
                name=str(row["name"]),
                category=str(row["category"]),
                color=str(row["color"]),
                price=float(row["price"]),
                store=str(row["store"]),
                image_path=str(row["image_path"]),
                similarity=float(self.embeddings[idx] @ q),
            ))
        return out
