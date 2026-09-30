from __future__ import annotations

import csv
from pathlib import Path
from PIL import Image, ImageDraw
import random
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / "data" / "images"
CATALOG = ROOT / "data" / "catalog.csv"
IMG_DIR.mkdir(parents=True, exist_ok=True)

COLORS = {
    "black": (30, 30, 32),
    "white": (230, 230, 226),
    "beige": (205, 184, 150),
    "blue": (50, 95, 165),
    "red": (180, 55, 58),
    "green": (24, 112, 72),
    "pink": (210, 105, 150),
    "brown": (120, 78, 52),
}
CATEGORIES = ["shirt", "pants", "dress", "skirt", "shoe"]
PATTERNS = ["solid", "floral", "striped", "dots"]


def polygon_for(category):
    if category == "shirt":
        return [(82,60),(56,78),(70,106),(88,94),(88,184),(168,184),(168,94),(186,106),(200,78),(174,60),(154,52),(144,76),(112,76),(102,52)]
    if category == "pants":
        return [(92,42),(164,42),(170,110),(154,220),(127,220),(128,118),(104,220),(76,220),(86,110)]
    if category == "dress":
        return [(105,38),(151,38),(160,85),(181,135),(210,225),(46,225),(75,135),(96,85)]
    if category == "skirt":
        return [(96,72),(160,72),(190,220),(66,220)]
    return [(55,150),(120,142),(150,116),(166,132),(174,154),(205,165),(202,187),(68,187),(47,176)]


def make_image(category, color_name, pattern, variant, out_path):
    img = Image.new("RGB", (256, 256), (250, 250, 248))
    shape = Image.new("L", img.size, 0)
    sd = ImageDraw.Draw(shape)
    poly = polygon_for(category)
    sd.polygon(poly, fill=255)

    color = COLORS[color_name]
    base = color if pattern == "solid" else (235, 232, 222)
    img.paste(Image.new("RGB", img.size, base), (0, 0), shape)

    if pattern != "solid":
        overlay = Image.new("RGB", img.size, (0, 0, 0))
        alpha = Image.new("L", img.size, 0)
        od = ImageDraw.Draw(overlay)
        ad = ImageDraw.Draw(alpha)
        rng = random.Random(1000 + variant * 19 + hash((category, color_name, pattern)) % 997)

        if pattern == "floral":
            count = 58 if category in {"dress", "skirt"} else 34
            for _ in range(count):
                x, y = rng.randint(38, 218), rng.randint(34, 226)
                rr = rng.randint(3, 8)
                od.ellipse((x-rr, y-rr, x+rr, y+rr), fill=color)
                ad.ellipse((x-rr, y-rr, x+rr, y+rr), fill=255)
        elif pattern == "striped":
            for x in range(24 + variant * 4, 235, 18):
                od.rectangle((x, 24, x+7, 232), fill=color)
                ad.rectangle((x, 24, x+7, 232), fill=255)
        elif pattern == "dots":
            offset = variant * 5
            for y in range(38, 232, 22):
                for x in range(42 + offset, 222, 22):
                    od.ellipse((x-4, y-4, x+4, y+4), fill=color)
                    ad.ellipse((x-4, y-4, x+4, y+4), fill=255)

        intersection = ((np.asarray(alpha, dtype=np.uint16) * np.asarray(shape, dtype=np.uint16)) // 255).astype(np.uint8)
        img.paste(overlay, (0, 0), Image.fromarray(intersection))

    # Slight variant geometry cue without adding disconnected color artifacts.
    if variant == 1 and category != "shoe":
        draw = ImageDraw.Draw(img)
        draw.line((70, 224, 186, 224), fill=(215, 215, 210), width=2)

    img.save(out_path)


def main():
    random.seed(7)
    rows = []
    i = 1
    stores = ["Demo Moda", "Boutique Norte", "Reventa Demo", "Concept Store"]
    prices = [349, 449, 549, 699, 799, 999, 1299, 1499]

    # 5 categories x 8 colors x 4 patterns x 2 variants = 320 demo products.
    for category in CATEGORIES:
        for color in COLORS:
            for pattern in PATTERNS:
                for variant in range(2):
                    pid = f"P{i:04d}"
                    fn = f"{pid}_{category}_{color}_{pattern}.png"
                    make_image(category, color, pattern, variant, IMG_DIR / fn)
                    rows.append({
                        "product_id": pid,
                        "name": f"{category.title()} {color.title()} {pattern.title()} {variant+1}",
                        "category": category,
                        "color": color,
                        "pattern": pattern,
                        "price": random.choice(prices),
                        "store": random.choice(stores),
                        "image_path": str((IMG_DIR / fn).relative_to(ROOT)),
                    })
                    i += 1

    CATALOG.parent.mkdir(parents=True, exist_ok=True)
    with CATALOG.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)
    print(f"Generated {len(rows)} demo products -> {CATALOG}")


if __name__ == "__main__":
    main()
