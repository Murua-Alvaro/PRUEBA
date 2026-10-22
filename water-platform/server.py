"""GROWA Water API: reproducible indexed archive, stateless read-only HTTP queries."""
from __future__ import annotations
import csv,gzip,hashlib,io,json,math,os,re,sqlite3,threading,time,unicodedata
from pathlib import Path
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from urllib.parse import urlparse,parse_qs
from functools import lru_cache
ROOT=Path(__file__).resolve().parents[1]
STATIC=ROOT/'dist'/'agua'
VERSION='water-platform-1.0.0'
def norm(v):return ''.join(c for c in unicodedata.normalize('NFD',str(v or '')).casefold() if not unicodedata.combining(c))
def state(v):
 v=norm(v)
 aliases={'michoacan':'Michoacán','estado de mexico':'Estado de México','nuevo leon':'Nuevo León','queretaro':'Querétaro','san luis potosi':'San Luis Potosí','yucatan':'Yucatán','michoacan de ocampo':'Michoacán','veracruz de ignacio de la llav':'Veracruz','coahuila de zaragoza':'Coahuila'}
 return aliases.get(v,str(v).title() if v else 'Sin entidad reportada')
def numeric(v):return v if isinstance(v,(int,float)) and not isinstance(v,bool) and math.isfinite(v) else None
CAT={
 'presas':dict(title='Presas y embalses',category='Infraestructura',description='Inventario nacional de fuente secundaria. NAMO es capacidad de diseño, no almacenamiento actual.',metric='namo',unit='hm³',kind='catalog',columns={'namo':['Capacidad NAMO','hm³'],'name_cap':['Capacidad NAME','hm³'],'altura':['Altura de cortina','m']},geo=True),
 'acuiferos':dict(title='Acuíferos',category='Disponibilidad',description='Balances administrativos de disponibilidad. No representan nivel piezométrico observado.',metric='disponibilidad',unit='hm³/año',kind='snapshot',columns={'recarga':['Recarga','hm³/año'],'extraccion':['Extracción reportada','hm³/año'],'disponibilidad':['Disponibilidad','hm³/año']}),
 'riego':dict(title='Uso agrícola del agua',category='Series históricas',description='Agregados estatales por año inicial de ciclo. No equivalen a microdatos distritales.',metric='volumen',unit='hm³',kind='series',columns={'volumen':['Volumen distribuido','hm³'],'superficie':['Superficie registrada','ha']}),
 'clima':dict(title='Clima y balance',category='Series históricas',description='Agregados anuales de la edición territorial V9. Balance: precipitación menos ET₀.',metric='precipitacion',unit='mm',kind='series',columns={'precipitacion':['Precipitación','mm'],'et0':['Evapotranspiración ET₀','mm'],'balance':['Balance climático','mm']}),
 'mensual':dict(title='Almacenamiento mensual',category='Series históricas',description='Medias mensuales de tres presas de Jalisco, con días observados. No representan toda la entidad.',metric='volumen',unit='hm³',kind='series',columns={'volumen':['Almacenamiento medio','hm³'],'minimo':['Mínimo mensual','hm³'],'maximo':['Máximo mensual','hm³'],'fraccion_namo':['Fracción del NAMO','proporción'],'dias':['Días observados','días']}),
 'diario':dict(title='Almacenamiento diario',category='Series históricas',description='Cortes históricos observados de tres presas de Jalisco. Ceros y huecos conservados.',metric='volumen',unit='hm³',kind='series',columns={'volumen':['Almacenamiento','hm³'],'elevacion':['Elevación','m'],'fraccion_namo':['Fracción del NAMO','proporción']}),
 'sinaloa':dict(title='Cortes de Sinaloa',category='Series históricas',description='Cortes individuales y agregados de sistemas, conservados como series separadas. Cobertura parcial.',metric='volumen',unit='hm³',kind='series',columns={'volumen':['Almacenamiento','hm³']}),
 'calidad':dict(title='Calidad del agua',category='Mediciones',description='6,095 observaciones sin fecha de muestreo verificable. No permiten inferir tendencia, potabilidad ni cumplimiento normativo.',metric='ph',unit='pH',kind='undated',columns={'ph':['pH de campo','pH'],'temperatura':['Temperatura de origen','unidad no verificada'],'conductividad':['Conductividad de origen','unidad no verificada'],'od':['Oxígeno disuelto','%'],'sst':['Sólidos suspendidos','unidad no verificada'],'nitrogeno':['N total','unidad no verificada'],'fosforo':['P total','unidad no verificada']}),
 'tendencias':dict(title='Tendencias de riego',category='Análisis documental',description='Estimaciones y clasificaciones de origen. No constituyen predicción ni inferencia causal.',metric='pendiente',unit='unidad de origen',kind='analysis',columns={'pendiente':['Estimación de origen','unidad de origen'],'observaciones':['Observaciones','registros']}),
 'cobertura':dict(title='Cuencas y cobertura',category='Documentación',description='Inventario documental y cobertura declarada. No se dispone de polígonos verificados ni de todas las observaciones descritas.',metric='cantidad',unit='registros declarados',kind='metadata',columns={'cantidad':['Registros declarados','registros declarados']})}
def read(p):return json.loads((ROOT/p).read_text())
DB=sqlite3.connect(':memory:',check_same_thread=False)
DB.row_factory=sqlite3.Row
DB.create_function('normalize',1,norm,deterministic=True)
DB.executescript('''CREATE TABLE records(id INTEGER PRIMARY KEY,dataset TEXT,state TEXT,entity TEXT,name TEXT,municipality TEXT,date TEXT,year INTEGER,lat REAL,lon REAL,fields TEXT,source TEXT,source_url TEXT,search TEXT); CREATE INDEX scope ON records(dataset,state,year);CREATE INDEX entity_time ON records(dataset,entity,date);''')
def add(dataset,st,key,name,fields,municipality=None,date=None,lat=None,lon=None,source='Archivo territorial GROWA / V9',url=None):
 date=str(date) if date is not None else None
 yr=int(date[:4]) if date and re.match(r'^\d{4}',date) else None
 DB.execute('INSERT INTO records(dataset,state,entity,name,municipality,date,year,lat,lon,fields,source,source_url,search) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',(dataset,st,str(key),name,municipality,date,yr,numeric(lat),numeric(lon),json.dumps(fields,ensure_ascii=False,allow_nan=False),source,url,norm(' '.join(str(v or '') for v in [st,key,name,municipality]))))
def initialize():
 d=read('data/agua-v9.json');n=read('dist/agua/presas-nacionales-v1.json');legacy={r[1]:r for r in d['presas']}
 for r in n['rows']:
  r=list(r)+[None]*max(0,19-len(r))
  old=legacy.get(r[0]);st=r[3] or (old[0] if old else None)
  add('presas',state(st),r[0],r[1] or r[2],dict(namo=r[17],name_cap=r[15],altura=r[18],region=r[5],uso=r[8],corriente=r[9]),r[4],lat=r[6],lon=r[7],source=n['fuente'],url=n.get('url'))
 for r in d['acuiferos']:add('acuiferos',state(r[0]),r[1],r[2],dict(recarga=r[3],extraccion=r[4],disponibilidad=r[5],deficit_reportado=r[6]))
 for r in d['riego']:add('riego',state(r[0]),state(r[0]),state(r[0]),dict(volumen=r[2],superficie=r[3]),date=r[1])
 for r in d['clima']:add('clima',state(r[0]),state(r[0]),state(r[0]),dict(precipitacion=r[2],et0=r[3],balance=r[4]),date=r[1])
 month=read('dist/agua/jalisco-mensual-v1.json')
 names={r[0]:r[1] for r in n['rows']}
 for r in month['rows']:add('mensual','Jalisco',r[0],names.get(r[0],r[0]),dict(dias=r[2],volumen=r[3],minimo=r[4],maximo=r[5],fraccion_namo=r[6]),date=r[1],source=month['fuente'],url=month.get('url'))
 for i in [1,2,3]:
  daily=read(f'dist/agua/jalisco-diario-{i}.json')
  for r in daily['rows']:add('diario','Jalisco',r[1],names.get(r[1],r[1]),dict(volumen=r[2],elevacion=r[3],fraccion_namo=r[4]),date=r[0],source='Réplica histórica SIH / GROWA',url=daily.get('source'))
 for r in d['sinaloa']:add('sinaloa','Sinaloa',r[0],names.get(r[0],r[0]),dict(volumen=r[2],dato_origen=r[3]),date=r[1],source=r[4])
 for r in d['sistemas']:add('sinaloa','Sinaloa',r[0],r[0],dict(volumen=r[3],dato_origen=r[4],presas_reportadas=r[2]),date=r[1],source='Cortes agregados de sistemas / V9')
 quality=read('dist/agua/calidad-sinaloa-observaciones-v1.json')
 for r in quality['rows']:add('calidad','Sinaloa',r[1],r[2],dict(observacion=r[0],conductividad=r[3],ph=r[4],temperatura=r[5],od=r[6],sst=r[7],nitrogeno=r[8],fosforo=r[9],caudal_texto=r[10]),source=quality['fuente'],url=quality.get('origen'))
 for r in d['tendencias']:add('tendencias',state(r[0]),r[1],r[2],dict(observaciones=r[3],pendiente=r[4],estadistico=r[5],clasificacion=r[6]))
 for i,r in enumerate(d['cobertura']):add('cobertura',state(r[0]),str(i),r[1],dict(cantidad=r[2],inicio=r[3],fin=r[4],tipo=r[5]))
 DB.commit();DB.execute('PRAGMA query_only=ON')
initialize()
TOTAL=DB.execute('SELECT COUNT(*) FROM records').fetchone()[0]
def params(q):return {k:v[-1] for k,v in parse_qs(q,keep_blank_values=True).items()}
def integer(p,k,default,lo,hi):
 try:v=int(p.get(k,default))
 except (TypeError,ValueError):raise ValueError(f'{k}: entero inválido')
 if not lo<=v<=hi:raise ValueError(f'{k}: fuera de rango')
 return v
def scope(p):
 dataset=p.get('dataset','presas')
 if dataset not in CAT:raise ValueError('Conjunto desconocido')
 clauses=['dataset=?'];values=[dataset]
 for field in ['state','entity']:
  if p.get(field) and p[field]!='all':clauses.append(field+'=?');values.append(p[field][:160])
 if p.get('q'):clauses.append('search LIKE ?');values.append('%'+norm(p['q'][:150])+'%')
 for key,op in [('from','>='),('to','<=')]:
  if p.get(key):clauses.append('year'+op+'?');values.append(integer(p,key,2000,1900,2100))
 if p.get('bbox'):
  try:a,b,c,d=map(float,p['bbox'].split(','))
  except Exception:raise ValueError('Extensión geográfica inválida')
  if not(-180<=a<=c<=180 and -90<=b<=d<=90):raise ValueError('Extensión fuera de rango')
  clauses.extend(['lon BETWEEN ? AND ?','lat BETWEEN ? AND ?']);values.extend([a,c,b,d])
 return dataset,' AND '.join(clauses),values
def rows(p):
 ds,where,args=scope(p);return ds,[dict(r) for r in DB.execute('SELECT * FROM records WHERE '+where+' ORDER BY date,entity,id',args)]
def decode(r):
 x=dict(r);x['fields']=json.loads(x['fields']);x.pop('search',None);return x
def catalog():
 result=[]
 for key,c in CAT.items():
  stats=dict(DB.execute('SELECT COUNT(*) records,COUNT(DISTINCT entity) entities,MIN(date) start,MAX(date) end,SUM(CASE WHEN lat IS NOT NULL AND lon IS NOT NULL THEN 1 ELSE 0 END) geolocated FROM records WHERE dataset=?',(key,)).fetchone())
  states=[r[0] for r in DB.execute('SELECT DISTINCT state FROM records WHERE dataset=? ORDER BY state',(key,))]
  result.append(dict(id=key,**c,**stats,states=states))
 return dict(version=VERSION,total=TOTAL,datasets=result,archive_cutoff='2026-10-13',generated_from='Archivos integrados; no telemetría en vivo')
def query(p):
 ds,where,args=scope(p);page=integer(p,'page',1,1,100000);limit=integer(p,'limit',40,1,250)
 metric=p.get('metric',CAT[ds]['metric']);allowed=CAT[ds]['columns']
 if metric not in allowed:raise ValueError('Variable no disponible')
 sort=p.get('sort','name');direction='DESC' if p.get('direction')=='desc' else 'ASC'
 if sort not in ['name','date','state','municipality','value']:raise ValueError('Orden no permitido')
 expr="CASE WHEN json_type(fields,'$."+metric+"') IN ('integer','real') THEN json_extract(fields,'$."+metric+"') END" if sort=='value' else sort
 count=DB.execute('SELECT COUNT(*) FROM records WHERE '+where,args).fetchone()[0]
 data=DB.execute('SELECT * FROM records WHERE '+where+' ORDER BY ('+expr+') IS NULL, '+expr+' '+direction+', id ASC LIMIT ? OFFSET ?',args+[limit,(page-1)*limit])
 return dict(dataset=ds,total=count,page=page,limit=limit,rows=[decode(r) for r in data])
def summary(p):
 ds,rs=rows(p);metric=p.get('metric',CAT[ds]['metric'])
 if metric not in CAT[ds]['columns']:raise ValueError('Variable no disponible')
 vals=[numeric(json.loads(r['fields']).get(metric)) for r in rs];valid=[v for v in vals if v is not None]
 dates=[r['date'] for r in rs if r['date']]
 es={r['entity']:r['name'] for r in rs}
 return dict(dataset=ds,records=len(rs),entities=len(es),states=len({r['state'] for r in rs}),valid=len(valid),missing=len(rs)-len(valid),minimum=min(valid) if valid else None,maximum=max(valid) if valid else None,mean=sum(valid)/len(valid) if valid else None,start=min(dates) if dates else None,end=max(dates) if dates else None,unit=CAT[ds]['columns'][metric][1],metric=metric,entity_options=[dict(id=k,name=v) for k,v in sorted(es.items(),key=lambda t:t[1])],warning=CAT[ds]['description'])
def series(p):
 ds,rs=rows(p);metric=p.get('metric',CAT[ds]['metric'])
 if metric not in CAT[ds]['columns']:raise ValueError('Variable no disponible')
 if CAT[ds]['kind']!='series':return dict(series=[],reason='El conjunto no contiene una serie temporal homologada.')
 selected=[s for s in p.get('entities','').split(',') if s][:4]
 if not selected:selected=list(dict.fromkeys(r['entity'] for r in rs))[:1]
 groups={}
 for r in rs:
  if r['entity'] not in selected:continue
  key=(r['state'],r['entity']);g=groups.setdefault(key,dict(id=r['entity'],state=r['state'],name=r['name'],points=[]))
  g['points'].append(dict(date=r['date'],value=numeric(json.loads(r['fields']).get(metric))))
 return dict(series=list(groups.values()),metric=metric,unit=CAT[ds]['columns'][metric][1],gap_days=2 if ds=='diario' else 45 if ds=='mensual' else 550 if ds in ['clima','riego'] else 7,warning='No se interpolan huecos ni se suman series diferentes.')
def compare(p):
 ds,rs=rows(p);metric=p.get('metric',CAT[ds]['metric'])
 if metric not in CAT[ds]['columns']:raise ValueError('Variable no disponible')
 selected=p.get('entities','').split(',')[:4];groups={}
 for r in rs:
  if r['entity'] not in selected:continue
  g=groups.setdefault((r['state'],r['entity']),dict(id=r['entity'],name=r['name'],state=r['state'],values=[],dates=[]))
  v=numeric(json.loads(r['fields']).get(metric))
  if v is not None:g['values'].append(v);g['dates'].append(r['date'])
 out=[]
 for g in groups.values():
  vs=g.pop('values');dates=g.pop('dates');out.append(dict(**g,observations=len(vs),mean=sum(vs)/len(vs) if vs else None,minimum=min(vs) if vs else None,maximum=max(vs) if vs else None,last=vs[-1] if vs else None,last_date=dates[-1] if dates else None))
 return dict(rows=out,unit=CAT[ds]['columns'][metric][1],warning='Estadística descriptiva de la selección. Fechas y cobertura pueden diferir entre series.')
def feature_collection(p):
 ds,rs=rows(p);features=[]
 for r in rs:
  if r['lat'] is None or r['lon'] is None or not(-90<=r['lat']<=90 and -180<=r['lon']<=180):continue
  x=decode(r);lat=x.pop('lat');lon=x.pop('lon');features.append(dict(type='Feature',geometry=dict(type='Point',coordinates=[lon,lat]),properties=x))
 return dict(type='FeatureCollection',features=features)
@lru_cache(maxsize=128)
def api_response(path,qs):
 p=params(qs)
 if path=='/api/catalog':return catalog()
 if path=='/api/query':return query(p)
 if path=='/api/summary':return summary(p)
 if path=='/api/series':return series(p)
 if path=='/api/compare':return compare(p)
 if path=='/api/map':return feature_collection(p)
 if path=='/api/record':
  id=integer(p,'id',0,1,TOTAL);r=DB.execute('SELECT * FROM records WHERE id=?',(id,)).fetchone()
  if not r:raise ValueError('Registro no encontrado')
  return decode(r)
 raise KeyError(path)
class Handler(BaseHTTPRequestHandler):
 protocol_version='HTTP/1.1'
 def log_message(self,fmt,*args):print(self.address_string(),fmt%args,flush=True)
 def headers_for(self,status,typ,size):
  self.send_response(status);self.send_header('Content-Type',typ);self.send_header('Content-Length',str(size));self.send_header('X-Content-Type-Options','nosniff');self.send_header('Referrer-Policy','strict-origin-when-cross-origin');self.send_header('Access-Control-Allow-Origin','*');self.send_header('Cache-Control','public, max-age=60' if status==200 else 'no-store')
 def send_json(self,payload,status=200):
  data=json.dumps(payload,ensure_ascii=False,allow_nan=False,separators=(',',':')).encode();encoded='gzip' in self.headers.get('Accept-Encoding','') and len(data)>1500
  if encoded:data=gzip.compress(data)
  etag='"'+hashlib.sha256(data).hexdigest()[:20]+'"'
  if self.headers.get('If-None-Match')==etag:
   self.send_response(304);self.send_header('ETag',etag);self.send_header('Access-Control-Allow-Origin','*');self.end_headers();return
  self.headers_for(status,'application/json; charset=utf-8',len(data));self.send_header('ETag',etag)
  if encoded:self.send_header('Content-Encoding','gzip');self.send_header('Vary','Accept-Encoding')
  self.end_headers();self.wfile.write(data)
 def do_OPTIONS(self):self.send_response(204);self.send_header('Access-Control-Allow-Origin','*');self.send_header('Access-Control-Allow-Methods','GET, OPTIONS');self.send_header('Content-Length','0');self.end_headers()
 def do_GET(self):
  u=urlparse(self.path)
  try:
   if u.path=='/health':return self.send_json(dict(status='ready',version=VERSION,records=TOTAL))
   if u.path=='/api/export':
    p=params(u.query);ds,rs=rows(p);extra=sorted({k for r in rs for k in json.loads(r['fields'])}-set(CAT[ds]['columns']));columns=['id','state','entity','name','municipality','date']+list(CAT[ds]['columns'])+extra+['source','source_url'];buf=io.StringIO();w=csv.writer(buf);w.writerow(columns)
    for r in rs:
     r=decode(r);r.update(r.pop('fields'));values=[]
     for k in columns:
      v=str(r.get(k) if r.get(k) is not None else '')
      if v.startswith(('=','+','@','\t','\r')) or (v.startswith('-') and numeric(r.get(k)) is None):v="'"+v
      values.append(v)
     w.writerow(values)
    data=('\ufeff'+buf.getvalue()).encode();self.headers_for(200,'text/csv; charset=utf-8',len(data));self.send_header('Content-Disposition',f'attachment; filename="GROWA_{ds}.csv"');self.end_headers();self.wfile.write(data);return
   if u.path.startswith('/api/'):return self.send_json(api_response(u.path,u.query))
   route=u.path.removeprefix('/agua').lstrip('/') or 'index.html'
   if route=='config.js':
    data=b'window.GROWA_WATER_API="";';self.headers_for(200,'text/javascript',len(data));self.end_headers();self.wfile.write(data);return
   f=(STATIC/route).resolve()
   if not f.is_relative_to(STATIC.resolve()) or not f.is_file():raise KeyError(route)
   import mimetypes
   data=f.read_bytes();self.headers_for(200,mimetypes.guess_type(str(f))[0] or 'application/octet-stream',len(data));self.end_headers();self.wfile.write(data)
  except ValueError as e:self.send_json(dict(error=str(e)),400)
  except KeyError:self.send_json(dict(error='Ruta no encontrada'),404)
  except (BrokenPipeError,ConnectionResetError):pass
  except Exception as e:
   print('REQUEST ERROR',repr(e),flush=True);self.send_json(dict(error='No se pudo completar la consulta'),500)
if __name__=='__main__':
 port=int(os.environ.get('PORT','4173'));print(f'GROWA Water {VERSION}: {TOTAL} records; 0.0.0.0:{port}',flush=True);ThreadingHTTPServer(('0.0.0.0',port),Handler).serve_forever()
