from __future__ import annotations

import csv
from pathlib import Path
from PIL import Image, ImageDraw
import random

ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / "data" / "images"
CATALOG = ROOT / "data" / "catalog.csv"
IMG_DIR.mkdir(parents=True, exist_ok=True)

COLORS = {
    "black": (28, 28, 30),
    "white": (235, 235, 232),
    "beige": (205, 184, 150),
    "blue": (50, 95, 165),
    "red": (180, 55, 58),
    "green": (72, 118, 86),
}
CATEGORIES = ["shirt", "pants", "dress", "shoe"]


def draw_shirt(draw, c):
    draw.polygon([(82,60),(56,78),(70,106),(88,94),(88,184),(168,184),(168,94),(186,106),(200,78),(174,60),(154,52),(144,76),(112,76),(102,52)], fill=c)


def draw_pants(draw, c):
    draw.polygon([(92,48),(164,48),(170,112),(154,208),(126,208),(128,118),(104,208),(76,208),(86,112)], fill=c)


def draw_dress(draw, c):
    draw.polygon([(104,48),(152,48),(160,92),(194,204),(62,204),(96,92)], fill=c)
    draw.rectangle((112,40,144,68), fill=c)


def draw_shoe(draw, c):
    draw.polygon([(55,150),(120,142),(150,116),(166,132),(174,154),(205,165),(202,187),(68,187),(47,176)], fill=c)
    draw.line((65,171,191,171), fill=(90,90,90), width=4)


def make_image(category, color_name, variant, out_path):
    img = Image.new("RGB", (256,256), (250,250,248))
    draw = ImageDraw.Draw(img)
    c = COLORS[color_name]
    {"shirt": draw_shirt, "pants": draw_pants, "dress": draw_dress, "shoe": draw_shoe}[category](draw, c)
    if variant % 2:
        draw.line((40, 220, 216, 220), fill=(215,215,210), width=2)
    if variant % 3 == 0:
        draw.ellipse((205,30,221,46), fill=c)
    img.save(out_path)


def main():
    random.seed(7)
    rows = []
    i = 1
    stores = ["Demo Moda", "Boutique Norte", "Reventa Demo"]
    for category in CATEGORIES:
        for color in COLORS:
            for variant in range(2):
                pid = f"P{i:04d}"
                fn = f"{pid}_{category}_{color}.png"
                make_image(category, color, variant, IMG_DIR / fn)
                rows.append({
                    "product_id": pid,
                    "name": f"{category.title()} {color.title()} {variant+1}",
                    "category": category,
                    "color": color,
                    "price": random.choice([349,449,549,699,799,999,1299]),
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
