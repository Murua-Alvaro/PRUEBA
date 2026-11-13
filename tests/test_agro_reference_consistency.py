"""Auditoría de integridad del atlas agroclimático publicado de GROWA.

Los puntos son referencias municipales, no polígonos de parcelas.
Ejecutar: python -m unittest tests.test_agro_reference_consistency -v
"""
from pathlib import Path
import json
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


class AgroReferenceConsistencyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.dataset = json.loads(
            (ROOT / "data/growa-nacional-10-estados-piloto.json").read_text(encoding="utf-8")
        )

    def test_pilot_dataset_dimensions(self):
        data = self.dataset
        self.assertEqual(len(data["states"]), 10)
        self.assertEqual(len(data["crops"]), 22)
        self.assertEqual(len(data["points"]), 529)
        self.assertEqual(len(data["links2025"]), 3738)
        self.assertEqual(len(data["cropAnnual"]), 3933)
        self.assertEqual(len(data["climateAnnual"]), 230)
        self.assertEqual(len(data["climateFields"]), 8)

    def test_georeferences_have_valid_state_crop_and_coordinates(self):
        data = self.dataset
        points = {}
        for point in data["points"]:
            pid, state_index, municipality, latitude, longitude = point[:5]
            self.assertNotIn(pid, points)
            self.assertTrue(0 <= state_index < len(data["states"]))
            self.assertTrue(municipality.strip())
            self.assertTrue(14 <= latitude <= 33)
            self.assertTrue(-119 <= longitude <= -86)
            points[pid] = state_index
        for link in data["links2025"]:
            self.assertIn(link[0], points)
            self.assertTrue(0 <= link[1] < len(data["crops"]))
        maize = data["crops"].index("Maíz grano")
        covered = {points[link[0]] for link in data["links2025"] if link[1] == maize}
        self.assertEqual(covered, set(range(10)))

    def test_production_and_climate_sources_are_not_confused(self):
        for name in ("app.js", "advanced.js"):
            with self.subTest(source=name):
                js = (ROOT / name).read_text(encoding="utf-8")
                self.assertIn('region+" · promedio estatal"', js)
                self.assertIn("NO es el clima del municipio o punto seleccionado", js)
                self.assertIn("const supported=isNational()?new Set(N.links2025", js)
                self.assertIn("if(isNational()&&!selectedPoint)window.GrowaClimate?.sync?.", js)
                self.assertIn("referencias geográficas verificadas de 2025", js)

    def test_embedded_national_bundle_matches_pilot(self):
        # Render currently publishes index.html + app.js, not the separate JSON.
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn('id="growa-bundled-data"', html)
        self.assertIn("window.GrowaBundledNational=", html)
        self.assertIn('const embedded=window.GrowaBundledNational;', (ROOT / "app.js").read_text(encoding="utf-8"))
        self.assertIn("states?.length!==10", (ROOT / "app.js").read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
