"""Regresiones de la consola agrícola pública.

Comprueba la estructura, los módulos preservados y la sintaxis JavaScript sin
simular datos: la fuente sigue siendo data/analysis-pack.b64.
"""
import re
import shutil
import subprocess
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class Structure(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.tabs = []
        self.scripts = []

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        if props.get("id"):
            self.ids.append(props["id"])
        if props.get("data-tab"):
            self.tabs.append(props["data-tab"])
        if tag == "script" and props.get("src"):
            self.scripts.append(props["src"])


class ConsoleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.styles = (ROOT / "styles.css").read_text(encoding="utf-8")
        cls.app = (ROOT / "app.js").read_text(encoding="utf-8")
        cls.document = Structure()
        cls.document.feed(cls.html)

    def test_control_ids_unique(self):
        self.assertEqual(len(self.document.ids), len(set(self.document.ids)))

    def test_query_and_result_modules_present(self):
        required = {
            "agx-console", "agx-historic", "agx-municipio",
            "agx-cultivo", "agx-metric", "agx-year",
            "agx-total", "agx-growth", "agx-crops-count",
            "agx-munis-count", "agx-plot", "agx-series-table",
            "agx-rank", "agx-observation", "agx-rank-count",
        }
        self.assertFalse(required.difference(self.document.ids))

    def test_existing_program_sections_preserved(self):
        required = {
            "panel-panorama", "panel-explorar-estados",
            "panel-explorar-cultivos", "panel-agua",
            "panel-laboratorio", "panel-metodologia",
            "chart-state", "comparison-chart",
        }
        self.assertFalse(required.difference(self.document.ids))
        self.assertIn("app.js", self.document.scripts)
        self.assertIn("agua", self.document.tabs)

    def test_real_source_and_export_controls(self):
        self.assertIn("window.GrowaSinaloaData", self.app)
        self.assertIn("for(const row of data.crops)", self.app)
        self.assertIn("growa:data-ready", self.app)
        self.assertIn("GROWA AGRICULTURA | REGISTRO TABULAR V5", self.app)
        self.assertIn("allRows=source.crops", self.app)
        for element in ("ag5-records", "ag5-records-body", "ag5-sort", "ag5-search", "ag5-next", "ag5-prev"):
            self.assertIn(element, self.document.ids)
        for action in ("export-series", "export-ranking", "reset", "share"):
            self.assertIn('data-agx-action="' + action + '"', self.html)
        self.assertIn("valor:row.value===null?'':row.value", self.app)

    def test_css_scoped_and_responsive(self):
        self.assertIn("GROWA AGRICULTURA — SISTEMA DE CONSULTA V5", self.styles)
        self.assertIn('body[data-view="panorama"] .masthead', self.styles)
        self.assertIn("@media(max-width:790px)", self.styles)
        self.assertIn('body[data-view="agua"] .ag-nav-toggle', self.styles)

    @unittest.skipUnless(shutil.which("node"), "Node.js no disponible")
    def test_javascript_syntax(self):
        run = subprocess.run(
            ["node", "--check", str(ROOT / "app.js")],
            capture_output=True, text=True, timeout=30, check=False,
        )
        self.assertEqual(run.returncode, 0, run.stderr)


if __name__ == "__main__":
    unittest.main()
