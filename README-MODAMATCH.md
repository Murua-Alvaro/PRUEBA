# ModaMatch MVP

Prototipo técnico público para búsqueda visual de moda.

## Flujo

`imagen -> embedding -> similitud coseno -> filtros -> Top K`

La versión desplegada usa un descriptor visual ligero para operar en infraestructura gratuita. La arquitectura permite sustituirlo después por OpenCLIP sin rehacer la interfaz ni el buscador.

## Render

Build command:

```bash
pip install -r requirements.txt && python scripts/generate_demo_catalog.py && python scripts/index_catalog.py --embedder classic
```

Start command:

```bash
python app.py
```

Branch de despliegue: `fashion-visual-mvp`.
