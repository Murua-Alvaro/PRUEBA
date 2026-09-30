from __future__ import annotations

import os
import pandas as pd
from PIL import Image
import gradio as gr

from src.embeddings import get_embedder
from src.search import VisualSearchEngine
from src.config import ROOT
from src.category_classifier import get_category_classifier

EMBEDDER_KIND = os.environ.get("FASHION_EMBEDDER", "classic")
embedder = get_embedder(EMBEDDER_KIND)
engine = VisualSearchEngine(embedder)
engine.load()
classifier = get_category_classifier()


def do_search(image, category, max_price, top_k):
    empty = pd.DataFrame(columns=["product", "store", "price", "visual_score"])
    if image is None:
        return "Sube una imagen para comenzar.", [], empty

    pil = Image.fromarray(image) if not isinstance(image, Image.Image) else image
    price = None if max_price in (None, 0) else float(max_price)

    effective_category = category
    detection_note = ""
    if category == "auto":
        try:
            pred = classifier.predict(pil)
            effective_category = pred.category if pred.category != "all" else "all"
            detection_note = (
                f"**Categoría detectada:** {pred.label} → `{effective_category}` "
                f"(score interno {pred.confidence:.2f}; fuente: {pred.source})."
            )
        except Exception as exc:
            effective_category = "all"
            detection_note = (
                "**Clasificación automática no disponible temporalmente.** "
                "La búsqueda continúa sin filtro semántico."
            )
    else:
        detection_note = f"**Categoría fijada manualmente:** `{category}`."

    results = engine.search(pil, int(top_k), effective_category, price)

    gallery = []
    rows = []
    for r in results:
        img_path = ROOT / r.image_path
        caption = f"{r.name} · ${r.price:,.0f} · score {r.similarity:.3f}"
        gallery.append((str(img_path), caption))
        rows.append({
            "product": r.name,
            "store": r.store,
            "price": f"${r.price:,.0f}",
            "visual_score": f"{r.similarity:.3f}",
        })
    return detection_note, gallery, pd.DataFrame(rows)


categories = ["auto", "all", "shirt", "pants", "dress", "skirt", "shoe"]

CSS = """
.gradio-container {max-width: 1180px !important; margin: 0 auto;}
.hero {padding: 24px 6px 8px 6px;}
.hero h1 {font-size: 2.3rem; margin-bottom: .35rem;}
.hero p {font-size: 1.05rem; opacity: .78;}
"""

with gr.Blocks(title="ModaMatch MVP") as demo:
    gr.HTML("""<div class='hero'><h1>ModaMatch</h1><p>Sube una prenda y encuentra alternativas visualmente similares.</p></div>""")
    gr.Markdown(
        "**Motor demo v3:** clasificación automática de tipo de prenda + ranking visual por color, silueta, textura y bordes. "
        "El *visual score* ordena resultados; **no es una probabilidad ni una confianza del modelo**."
    )
    with gr.Row():
        with gr.Column(scale=1):
            image = gr.Image(type="numpy", label="Prenda de referencia")
            category = gr.Dropdown(categories, value="auto", label="Categoría")
            max_price = gr.Number(value=0, label="Precio máximo (0 = sin límite)")
            top_k = gr.Slider(1, 12, value=8, step=1, label="Resultados")
            btn = gr.Button("Encontrar similares", variant="primary")
            detected = gr.Markdown("La categoría se detectará automáticamente.")
        with gr.Column(scale=2):
            gallery = gr.Gallery(label="Resultados", columns=4, height=520)
            table = gr.Dataframe(label="Ranking", interactive=False)
    btn.click(do_search, [image, category, max_price, top_k], [detected, gallery, table])

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "7860"))
    demo.launch(server_name="0.0.0.0", server_port=port, css=CSS)
