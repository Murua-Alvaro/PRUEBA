"""Regression audit for national figures transcribed from the 115-page report.

Does not assert independent verification of DGSIAP microdata. Uses only
the PDF-derived figure controls and the embedded presentation module.
Run: python -m unittest tests.test_national_report -v
"""
import json
import math
import re
import shutil
import subprocess
import unittest
from pathlib import Path

SRC=Path(__file__).resolve().parents[1]/"app.js"
MARKER="/* GROWA NATIONAL REPORT MODULE */"

def extract(name,next_name):
    text=SRC.read_text(encoding="utf-8")
    module=text.split(MARKER,1)[1]
    begin=module.index("const "+name+"=")+len("const "+name+"=")
    end=module.index("const "+next_name+"=",begin)
    return json.loads(module[begin:end].strip().rstrip(";").strip())


class NationalFiguresTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.crops=extract("crops","cropFacts")
        cls.crop_facts=extract("cropFacts","states")
        cls.states=extract("states","munis")
        cls.munis=extract("munis","stateFacts")
        cls.state_facts=extract("stateFacts","muniFacts")
        cls.muni_facts=extract("muniFacts","fmt")

    def test_scope_and_coverage(self):
        text=SRC.read_text(encoding="utf-8")
        self.assertLess(text.index(MARKER),text.index("const stateFacts="))
        self.assertLess(text.index(MARKER),text.index("const muniFacts="))
        self.assertEqual([len(self.crops),len(self.states),len(self.munis)],[10,10,10])
        self.assertEqual([len(self.crop_facts),len(self.state_facts),len(self.muni_facts)],[10,10,10])

    def test_crop_pdf_reference_table_page_18(self):
        # change in average annual national value share, 2003-05 vs 2023-25
        expected=[3.68,2.61,1.81,1.26,1.25,-2.05,-1.90,-1.72,-1.52,-1.35]
        values=[59589.7,15798.6,24396.8,8544.0,15803.4,56055.5,37134.6,16601.9,29602.3,19064.2]
        for item,change,value in zip(self.crops,expected,values):
            self.assertAlmostEqual(item[3],change,delta=.005)
            self.assertAlmostEqual(item[4],value,delta=.05)
            self.assertAlmostEqual(item[2]-item[1],item[3],delta=.015)

    def test_state_and_municipal_pdf_tables(self):
        # Source report: states p.69, municipalities p.73.
        state_values=[104321.5,82669.5,43981.9,50841.8,7814.8,24196.7,22132.6,49615.2,32011.8,18813.4]
        muni_values=[4078.9,2143.4,7604.3,4511.5,5043.2,954.0,9843.3,8333.3,935.2,2303.4]
        for item,value in zip(self.states,state_values):
            self.assertAlmostEqual(item[4],value,delta=.05)
            self.assertAlmostEqual(item[2]-item[1],item[3],delta=.004)
        for item,value in zip(self.munis,muni_values):
            self.assertAlmostEqual(item[5],value,delta=.05)
            self.assertAlmostEqual(item[3]-item[2],item[4],delta=.003)

    def test_crop_top_three_states_and_varieties(self):
        # Source: structure p.21, 26, 31, 36, 41, 46, 51, 56, 61, 66.
        for info,record in zip(self.crop_facts,self.crops):
            self.assertEqual(info["states"][0][0],record[8])
            self.assertAlmostEqual(info["states"][0][1],record[9],delta=.05)
            self.assertLessEqual(sum(v for _,v in info["states"]),record[4]+.25)
            self.assertLessEqual(sum(v for _,v in info["varieties"]),record[4]+.25)
            self.assertGreaterEqual(info["irrigation"],0)
            self.assertLessEqual(info["irrigation"],100)
            self.assertGreaterEqual(info["export"],0)
            self.assertLessEqual(info["export"],100)

    def test_territory_top_three_reconciliation(self):
        # Source: leading crops per territory p.70-71 and 74-75.
        for info,record in zip(self.state_facts,self.states):
            total=sum(v for _,v in info["top"])
            self.assertLessEqual(total,record[4]+.25)
            self.assertAlmostEqual(total/record[4]*100,info["share"],delta=.16)
        for info,record in zip(self.muni_facts,self.munis):
            total=sum(v for _,v in info["top"])
            self.assertLessEqual(total,record[5]+.25)
            self.assertAlmostEqual(total/record[5]*100,info["share"],delta=.16)

    def test_key_crosscheck_sinaloa_and_guasave(self):
        sinaloa=next(r for r in self.states if r[0]=="Sinaloa")
        guasave=next(r for r in self.munis if r[0]=="Guasave")
        self.assertAlmostEqual(sinaloa[4],49615.2,places=1)
        self.assertAlmostEqual(guasave[5],8333.3,places=1)
        self.assertTrue("2020" in SRC.read_text(encoding="utf-8"))

    @unittest.skipUnless(shutil.which("node"),"Node.js not installed")
    def test_javascript_syntax(self):
        result=subprocess.run(["node","--check",str(SRC)],capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stderr)


if __name__=="__main__":
    unittest.main()
