from __future__ import annotations

import argparse
from pathlib import Path
import sys
import numpy as np
import pandas as pd
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.config import CATALOG_PATH, EMBEDDINGS_PATH, METADATA_PATH, ARTIFACTS_DIR
from src.embeddings import get_embedder


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--embedder", default="classic", choices=["classic", "openclip"])
    p.add_argument("--catalog", default=str(CATALOG_PATH))
    args = p.parse_args()

    catalog = pd.read_csv(args.catalog)
    embedder = get_embedder(args.embedder)
    vectors = []

    for n, row in catalog.iterrows():
        path = ROOT / row["image_path"]
        with Image.open(path) as img:
            vectors.append(embedder.encode_image(img))
        if (n + 1) % 10 == 0 or n + 1 == len(catalog):
            print(f"Indexed {n+1}/{len(catalog)}")

    X = np.vstack(vectors).astype(np.float32)
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    np.save(EMBEDDINGS_PATH, X)
    catalog.to_csv(METADATA_PATH, index=False)
    (ARTIFACTS_DIR / "embedder.txt").write_text(embedder.name, encoding="utf-8")
    print(f"Saved embeddings {X.shape} -> {EMBEDDINGS_PATH}")


if __name__ == "__main__":
    main()
