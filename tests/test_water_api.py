import importlib.util,json,threading,unittest,urllib.request,urllib.error,gzip
from pathlib import Path
spec=importlib.util.spec_from_file_location('water_server',Path(__file__).resolve().parents[1]/'water-platform/server.py');api=importlib.util.module_from_spec(spec);spec.loader.exec_module(api)
class WaterAPI(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.server=api.ThreadingHTTPServer(('127.0.0.1',0),api.Handler);cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start();cls.url='http://127.0.0.1:'+str(cls.server.server_port)
 @classmethod
 def tearDownClass(cls):cls.server.shutdown();cls.server.server_close()
 def get(self,path):
  with urllib.request.urlopen(self.url+path) as r:return json.load(r)
 def test_catalog_actual_counts(self):
  d=self.get('/api/catalog');self.assertEqual(d['total'],38641);counts={x['id']:x['records'] for x in d['datasets']};self.assertEqual(counts['diario'],30652);self.assertEqual(counts['calidad'],6095);self.assertEqual(counts['mensual'],1018)
 def test_server_pagination_and_numeric_order(self):
  r=self.get('/api/query?dataset=presas&state=Sinaloa&sort=value&direction=desc&limit=4&page=2');self.assertEqual(r['total'],11);self.assertEqual(len(r['rows']),4);v=[x['fields']['namo'] for x in r['rows']];self.assertEqual(v,sorted(v,reverse=True))
 def test_series_do_not_join_different_units(self):
  r=self.get('/api/series?dataset=mensual&entities=REDJL,EGCJL&metric=volumen&from=2024&to=2024');self.assertEqual(len(r['series']),2);self.assertTrue(all(p['date'].startswith('2024') for s in r['series'] for p in s['points']))
 def test_quality_no_fabricated_dates(self):
  r=self.get('/api/query?dataset=calidad&q=OCPNO4445&limit=250');self.assertTrue(all(x['date'] is None for x in r['rows']));self.assertTrue(any(isinstance(x['fields']['caudal_texto'],str) and x['fields']['caudal_texto'].startswith('<') for x in r['rows']));self.assertEqual(self.get('/api/series?dataset=calidad')['series'],[])
 def test_compare_matches_source_mean(self):
  r=self.get('/api/compare?dataset=mensual&entities=REDJL&metric=volumen&from=2024&to=2024')['rows'][0];source=[x[3] for x in api.read('dist/agua/jalisco-mensual-v1.json')['rows'] if x[0]=='REDJL' and x[1].startswith('2024')];self.assertEqual(r['observations'],len(source));self.assertAlmostEqual(r['mean'],sum(source)/len(source))
 def test_map_bbox(self):
  g=self.get('/api/map?dataset=presas&bbox=-110,22,-105,29');self.assertTrue(g['features']);self.assertTrue(all(-110<=f['geometry']['coordinates'][0]<=-105 and 22<=f['geometry']['coordinates'][1]<=29 for f in g['features']))
 def test_validation(self):
  for path in ['/api/query?dataset=unknown','/api/query?dataset=presas&sort=drop%20table','/api/query?dataset=presas&metric=hack','/api/map?bbox=1,2,0,0','/api/query?limit=500000']:
   with self.assertRaises(urllib.error.HTTPError) as e:self.get(path)
   self.assertEqual(e.exception.code,400)
 def test_compressed_response_and_health(self):
  self.assertEqual(self.get('/health')['status'],'ready');req=urllib.request.Request(self.url+'/api/map',headers={'Accept-Encoding':'gzip'})
  with urllib.request.urlopen(req) as r:self.assertEqual(r.headers['Content-Encoding'],'gzip');self.assertEqual(json.loads(gzip.decompress(r.read()))['type'],'FeatureCollection')
 def test_export_all_filtered_rows(self):
  import csv,io
  with urllib.request.urlopen(self.url+'/api/export?dataset=calidad&q=PICACHOS') as r:text=r.read().decode('utf-8-sig')
  data=list(csv.DictReader(io.StringIO(text)));self.assertTrue(data);self.assertIn('caudal_texto',data[0]);self.assertEqual(len(data),self.get('/api/query?dataset=calidad&q=PICACHOS')['total'])
if __name__=='__main__':unittest.main()
