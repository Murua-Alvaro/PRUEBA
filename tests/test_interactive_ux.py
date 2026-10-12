"""Interactive interface contracts for Growa Agriculture.

These tests check static UI wiring and JavaScript syntax. They do NOT pretend
to replace automated end-to-end browser testing or external DGSIAP verification.
Run: python -m unittest tests.test_interactive_ux -v
"""
import re
import shutil
import subprocess
import unittest
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/"index.html").read_text(encoding="utf-8")
JS=(ROOT/"app.js").read_text(encoding="utf-8")
CSS=(ROOT/"styles.css").read_text(encoding="utf-8")
MODULE="/* GROWA PRO UX ENGINE"
UX=JS.split(MODULE,1)[1] if MODULE in JS else ""


class IDParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids=[]
    def handle_starttag(self,tag,attrs):
        props=dict(attrs)
        if props.get("id"):self.ids.append(props["id"])


class InteractiveUXTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        doc=IDParser()
        doc.feed(HTML)
        cls.ids=doc.ids

    def test_unique_dom_ids(self):
        duplicates=[x for x,count in Counter(self.ids).items() if count>1]
        self.assertEqual(duplicates,[])

    def test_all_buttons_are_bound(self):
        actions=re.findall(r"action\('([^']+)'",UX)
        self.assertGreaterEqual(len(actions),20)
        self.assertEqual(set(actions)-set(self.ids),set())

    def test_contextual_workbench(self):
        for node in ("ux-workbench","ux-view-title","ux-expand-all",
                     "ux-collapse-all","ux-copy-link","ux-bookmark",
                     "ux-focus","ux-toc-menu","ux-dialog","ux-toast"):
            with self.subTest(node=node):
                self.assertIn(node,self.ids)

    def test_available_controls(self):
        for node in ("ux-year-prev","ux-year-next","ux-compare-swap",
                     "ux-open-report","ux-close-report","ux-report-print",
                     "ux-open-crop-details","ux-close-crop-details",
                     "ux-density-normal","ux-density-compact"):
            with self.subTest(node=node):self.assertIn(node,self.ids)

    def test_scope_boundaries_and_data_are_preserved(self):
        self.assertIn("window.GrowaNationalData=Object.freeze",JS)
        self.assertIn("data/analysis-pack.b64",JS)
        self.assertIn("879,785",HTML)
        self.assertIn("La consulta exhaustiva",HTML)
        self.assertIn("Los años 2020 y 2021",HTML)

    def test_unified_search_for_national_profiles(self):
        for name in ("mx-cultivo","mx-estado","mx-municipio"):
            self.assertIn(name,JS)
        self.assertIn("Ctrl K",HTML)

    def test_filters_comparisons_and_accessibility(self):
        self.assertIn("aria-modal=\"true\"",HTML)
        self.assertIn("aria-expanded=\"false\"",HTML)
        self.assertIn("data-filter-mode",JS)
        self.assertIn("data-sort-mode",JS)
        self.assertIn("data-side=\"a\"",JS)
        self.assertIn("data-side=\"b\"",JS)
        self.assertIn("event.key==='Escape'",UX)
        self.assertIn("prefers-reduced-motion",CSS)

    def test_no_new_backend_or_external_tracking(self):
        self.assertNotIn("fetch(",UX)
        self.assertNotIn("XMLHttpRequest",UX)
        self.assertNotIn("analytics.google",UX)

    @unittest.skipUnless(shutil.which("node"),"Node.js not available")
    def test_javascript_syntax(self):
        result=subprocess.run(["node","--check",str(ROOT/"app.js")],text=True,capture_output=True)
        self.assertEqual(result.returncode,0,result.stderr)


if __name__=="__main__":
    unittest.main()
