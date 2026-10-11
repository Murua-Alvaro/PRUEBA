"""Regression checks for the published DGSIAP analytical rules."""
import math
import unittest
from decimal import Decimal
from pipeline.dgsiap import crop_profile, group_sum, millions


class CropProfileTests(unittest.TestCase):
    def row(self, value, area, volume, unit="Tonelada"):
        return {"Valorproduccion":str(value), "Cosechada":str(area),
                "Volumenproduccion":str(volume), "Nomunidad":unit}

    def test_missing_year_is_not_zero(self):
        p=crop_profile(self.row(800,10,30),None)
        self.assertIsNone(p["delta_million"])
        self.assertIsNone(p["change_percent"])

    def test_incompatible_units_disable_decomposition(self):
        p=crop_profile(self.row(1000,10,20,"Planta"),self.row(500,10,10,"Tonelada"))
        self.assertEqual(p["delta_million"],0.5)
        self.assertIsNone(p["price_yield_area_log_pct"])

    def test_zero_baseline_no_growth(self):
        p=crop_profile(self.row(200,4,8),self.row(0,4,0))
        self.assertIsNone(p["change_percent"])
        self.assertIsNone(p["price_yield_area_log_pct"])

    def test_log_components_reconcile(self):
        p=crop_profile(self.row(2400,12,36),self.row(1000,10,20))
        parts=p["price_yield_area_log_pct"]
        self.assertIsNotNone(parts)
        self.assertAlmostEqual(sum(parts[k] for k in ("area","yield","implicit_price")),
                               100*math.log(2.4), delta=.04)

    def test_reported_mxn_units(self):
        self.assertEqual(millions(Decimal("49615220.54")),49615.221)

    def test_decimal_grouping(self):
        rows=[{"name":"Ahome","value":"0.1"},{"name":"Ahome","value":"0.2"}]
        self.assertEqual(group_sum(rows,"value","name")[("Ahome",)],Decimal("0.3"))


if __name__=="__main__":
    unittest.main()
