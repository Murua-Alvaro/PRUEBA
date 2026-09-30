from __future__ import annotations

import os
import pandas as pd
from PIL import Image
import gradio as gr

from src.embeddings import get_embedder
from src.search import VisualSearchEngine
from src.config import ROOT

EMBEDDER_KIND = os.environ.get("FASHION_EMBEDDER", "classic")
embedder = get_embedder(EMBEDDER_KIND)
engine = VisualSearchEngine(embedder)
engine.load()


def do_search(image, category, max_price, top_k):
    if image is None:
        return [], pd.DataFrame(columns=["product", "store", "price", "similarity"])
    pil = Image.fromarray(image) if not isinstance(image, Image.Image) else image
    price = None if max_price in (None, 0) else float(max_price)
    results = engine.search(pil, int(top_k), category, price)

    gallery = []
    rows = []
    for r in results:
        img_path = ROOT / r.image_path
        caption = f"{r.name} · ${r.price:,.0f} · {r.similarity*100:.1f}%"
        gallery.append((str(img_path), caption))
        rows.append({
            "product": r.name,
            "store": r.store,
            "price": f"${r.price:,.0f}",
            "similarity": f"{r.similarity*100:.1f}%",
        })
    return gallery, pd.DataFrame(rows)


categories = ["all", "shirt", "pants", "dress", "shoe"]

CSS = """
.gradio-container {max-width: 1180px !important; margin: 0 auto;}
.hero {padding: 24px 6px 8px 6px;}
.hero h1 {font-size: 2.3rem; margin-bottom: .35rem;}
.hero p {font-size: 1.05rem; opacity: .78;}
"""

with gr.Blocks(title="ModaMatch MVP", css=CSS) as demo:
    gr.HTML("""<div class='hero'><h1>ModaMatch</h1><p>Sube una prenda y encuentra alternativas visualmente similares. Prototipo técnico de búsqueda de moda.</p></div>""")
    gr.Markdown("**Motor actual:** `" + EMBEDDER_KIND + "` · Catálogo demo indexado automáticamente en el servidor.")
    with gr.Row():
        with gr.Column(scale=1):
            image = gr.Image(type="numpy", label="Prenda de referencia")
            category = gr.Dropdown(categories, value="all", label="Categoría")
            max_price = gr.Number(value=0, label="Precio máximo (0 = sin límite)")
            top_k = gr.Slider(1, 12, value=8, step=1, label="Resultados")
            btn = gr.Button("Encontrar similares", variant="primary")
        with gr.Column(scale=2):
            gallery = gr.Gallery(label="Resultados", columns=4, height=520)
            table = gr.Dataframe(label="Ranking", interactive=False)
    btn.click(do_search, [image, category, max_price, top_k], [gallery, table])

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "7860"))
    demo.launch(server_name="0.0.0.0", server_port=port)
