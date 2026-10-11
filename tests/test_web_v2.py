"""End-to-end tests for deterministic Sinaloa API v2 analytical products.

Use the real embedded source annex; no mock economic data.
Run: python -m unittest tests.test_web_v2 -v
"""
import json
import math
import tempfile
import unittest
from decimal import Decimal
from pathlib import Path

from pipeline.build_web_v2 import (
    ROOT, DEFAULT_SOURCE, REPORT_PAGES, decode_pack, corpus,
    concentration, compare_crops, slug, write_outputs
)


class WebV2Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.document,cls.tables=decode_pack(DEFAULT_SOURCE)
        cls.products=corpus(cls.document,cls.tables)

    def test_coverage_and_report_index(self):
        self.assertEqual(len(self.products["catalogos.json"]["municipios"]),18)
        self.assertEqual(len(self.products["cultivos.json"]["catalogo"]),113)
        self.assertEqual(len([k for k in self.products if k.startswith("municipios/")]),18)
        self.assertEqual(len(REPORT_PAGES),18)
        self.assertEqual(self.products["state.json"]["annual"][0]["anio"],2003)
        self.assertEqual(self.products["state.json"]["annual"][-1]["anio"],2025)

    def test_state_total_reconciles(self):
        total=self.products["state.json"]["annual"][-1]["valor_mdp"]
        self.assertAlmostEqual(total,49615.22054,places=3)
        municipalities=self.products["catalogos.json"]["municipios"]
        self.assertAlmostEqual(sum(x["valor_2025_mdp"] for x in municipalities),total,delta=.03)
        for field in ("Nommodalidad","Nomcicloproductivo","TipoMercado"):
            subtotals=self.products["state.json"]["dimensions_2025"][field]
            self.assertAlmostEqual(sum(x["valor_mdp"] for x in subtotals),total,delta=.02)

    def test_2025_details_preserved(self):
        details=sum(len(self.products[k]["cierre_2025"]["registros_detalle"])
                    for k in self.products if k.startswith("municipios/"))
        self.assertEqual(details,637)
        rows=self.products["municipios/ahome.json"]["cierre_2025"]["registros_detalle"]
        self.assertTrue(any(x["Nomcultivo"]=="Papa" for x in rows))

    def test_no_fake_missing_years(self):
        catalog=self.products["cultivos.json"]["catalogo"]
        for item in catalog:
            self.assertEqual(len(item["anios_reportados"]),len(item["serie_valor_mdp"]))
            self.assertEqual(
                item["anios_reportados"],
                [x["anio"] for x in item["serie_valor_mdp"]])
        self.assertTrue(any(len(x["anios_reportados"])<23 for x in catalog))

    def test_log_decomposition_not_causality(self):
        p="municipios/ahome.json"
        items=self.products[p]["comparacion_2024_2025"]
        self.assertTrue(any(x["descomposicion_log_puntos"] for x in items))
        for item in items:
            parts=item["descomposicion_log_puntos"]
            if parts:
                self.assertAlmostEqual(
                    parts["superficie"]+parts["rendimiento"]+parts["precio_implicito"],
                    parts["total_variacion_log"],delta=.0003)
        self.assertTrue(any(not x["2024_reportado"] or not x["2025_reportado"]
                            for x in items))

    def test_dimensions_have_valid_shares(self):
        data=self.products["state.json"]["dimensions_2025"]
        for field in ("Nommodalidad","Nomcicloproductivo","TipoTecnologia",
                      "TipoProduccion","TipoMercado"):
            shares=[x["participacion_valor_pct"] for x in data[field]]
            self.assertAlmostEqual(sum(shares),100,delta=.01)

    def test_central_cautions(self):
        issues=self.products["calidad.json"]["advertencias"]
        text=" ".join(issues).lower()
        for term in ("2020", "2025", "historical", "not", "causal"):
            self.assertIn(term,text)

    def test_deterministic_manifest(self):
        with tempfile.TemporaryDirectory() as dirname:
            d=Path(dirname)
            m1=write_outputs(self.products,d)
            m2=write_outputs(self.products,d)
            self.assertEqual(m1,m2)
            self.assertEqual(m1["files"],22)
            for x in m1["products"]:
                self.assertEqual((d/x["file"]).stat().st_size,x["bytes"])


if __name__=="__main__":
    unittest.main()
