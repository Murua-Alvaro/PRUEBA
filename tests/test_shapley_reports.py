"""Regression tests comparing Shapley bridges against the user's 395-page Sinaloa report.

The reference numbers appear, respectively, on PDF pages 33, 264 and 392.
"""
import unittest
from pipeline.build_web_v2 import DEFAULT_SOURCE, decode_pack
from pipeline.shapley import shapley_bridge


class ReportShapleyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        _,tables=decode_pack(DEFAULT_SOURCE)
        cls.crops={(r["Nommunicipio"],r["Nomcultivo"],int(r["Anio"])):r for r in tables["crops"]}

    def check(self, municipality, crop, expected):
        a=self.crops[(municipality,crop,2024)]
        b=self.crops[(municipality,crop,2025)]
        result=shapley_bridge(a,b)
        self.assertIsNotNone(result)
        for factor,reference in expected.items():
            self.assertAlmostEqual(result[factor],reference,delta=.052,
                msg=f"{municipality} / {crop} / {factor} differs from report")
        self.assertAlmostEqual(sum(result[k] for k in (
            "superficie","rendimiento","precio_implicito")),
            result["cambio_observado_mdp"],delta=.00003)

    def test_ahome_frijol_page_33(self):
        self.check("Ahome","Frijol",{
            "superficie":845.9,"rendimiento":-79.6,"precio_implicito":-195.8})

    def test_ahome_maize_page_33(self):
        self.check("Ahome","Maíz grano",{
            "superficie":-1117.0,"rendimiento":118.8,"precio_implicito":288.5})

    def test_mazatlan_chile_page_264(self):
        self.check("Mazatlán","Chile verde",{
            "superficie":138.3,"rendimiento":-4.1,"precio_implicito":75.8})

    def test_mazatlan_mango_page_264(self):
        self.check("Mazatlán","Mango",{
            "superficie":0.0,"rendimiento":0.0,"precio_implicito":-36.1})

    def test_sinaloa_chile_page_392(self):
        self.check("Sinaloa","Chile verde",{
            "superficie":57.4,"rendimiento":31.1,"precio_implicito":71.4})

    def test_sinaloa_garbanzo_page_392(self):
        self.check("Sinaloa","Garbanzo grano",{
            "superficie":-229.3,"rendimiento":-25.9,"precio_implicito":-62.1})

    def test_zero_value_not_attributed(self):
        row={"Nomunidad":"Tonelada","Cosechada":"2","Volumenproduccion":"1",
             "Valorproduccion":"0"}
        self.assertIsNone(shapley_bridge(row,row))


if __name__=="__main__":
    unittest.main()
