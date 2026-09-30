from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
IMAGES_DIR = DATA_DIR / "images"
ARTIFACTS_DIR = ROOT / "artifacts"
CATALOG_PATH = DATA_DIR / "catalog.csv"
EMBEDDINGS_PATH = ARTIFACTS_DIR / "embeddings.npy"
METADATA_PATH = ARTIFACTS_DIR / "metadata.csv"
