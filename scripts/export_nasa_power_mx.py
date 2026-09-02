import json,time,shutil,traceback
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor,as_completed
from datetime import datetime
import requests,pandas as pd,numpy as np,pyarrow as pa,pyarrow.parquet as pq

START,END="20030101","20260824"
ROOT=Path("work/NASA_POWER_Municipios_Agricolas_MX_2003_2026"); PUB=Path("public")
META=ROOT/"metadata"; DATA=ROOT/"datos"; TOOLS=ROOT/"herramientas"
for p in [META,DATA/"solar",DATA/"meteorologia",DATA/"imerg",TOOLS,PUB]: p.mkdir(parents=True,exist_ok=True)

STATES={"25":"Sinaloa","14":"Jalisco","16":"Michoacán de Ocampo","26":"Sonora","08":"Chihuahua",
"30":"Veracruz de Ignacio de la Llave","11":"Guanajuato","15":"México","21":"Puebla","07":"Chiapas"}
CODES=list(STATES)
SOLAR=["ALLSKY_SFC_SW_DWN","CLRSKY_SFC_SW_DWN","ALLSKY_SFC_SW_DNI","ALLSKY_SFC_SW_DIFF","TOA_SW_DWN",
"ALLSKY_SFC_PAR_TOT","CLRSKY_SFC_PAR_TOT","ALLSKY_SFC_UVA","ALLSKY_SFC_UVB","ALLSKY_SFC_UV_INDEX","ALLSKY_SFC_LW_DWN"]
MET=["T2M","T2MDEW","T2MWET","TS","T2M_RANGE","T2M_MAX","T2M_MIN","QV2M","RH2M","PRECTOTCORR","PS",
"WS2M","WS2M_MAX","WS2M_MIN","WS2M_RANGE","WD2M","WS10M","WS10M_MAX","WS10M_MIN","WS10M_RANGE","WD10M",
"GWETTOP","GWETROOT","GWETPROF"]
LABELS={
"ALLSKY_SFC_SW_DWN":"All Sky Surface Shortwave Downward Irradiance","CLRSKY_SFC_SW_DWN":"Clear Sky Surface Shortwave Downward Irradiance",
"ALLSKY_SFC_SW_DNI":"All Sky Surface Shortwave Downward Direct Normal Irradiance","ALLSKY_SFC_SW_DIFF":"All Sky Surface Shortwave Diffuse Irradiance",
"TOA_SW_DWN":"Top-Of-Atmosphere Shortwave Downward Irradiance","ALLSKY_SFC_PAR_TOT":"All Sky Surface Photosynthetically Active Radiation (PAR) Total",
"CLRSKY_SFC_PAR_TOT":"Clear Sky Surface Photosynthetically Active Radiation (PAR) Total","ALLSKY_SFC_UVA":"All Sky Surface UVA Irradiance",
"ALLSKY_SFC_UVB":"All Sky Surface UVB Irradiance","ALLSKY_SFC_UV_INDEX":"All Sky Surface UV Index",
"ALLSKY_SFC_LW_DWN":"All Sky Surface Longwave Downward Irradiance","T2M":"Temperature at 2 Meters","T2MDEW":"Dew/Frost Point at 2 Meters",
"T2MWET":"Wet Bulb Temperature at 2 Meters","TS":"Earth Skin Temperature","T2M_RANGE":"Temperature at 2 Meters Range",
"T2M_MAX":"Temperature at 2 Meters Maximum","T2M_MIN":"Temperature at 2 Meters Minimum","QV2M":"Specific Humidity at 2 Meters",
"RH2M":"Relative Humidity at 2 Meters","PRECTOTCORR":"Precipitation","PS":"Surface Pressure","WS2M":"Wind Speed at 2 Meters",
"WS2M_MAX":"Wind Speed at 2 Meters Maximum","WS2M_MIN":"Wind Speed at 2 Meters Minimum","WS2M_RANGE":"Wind Speed at 2 Meters Range",
"WD2M":"Wind Direction at 2 Meters","WS10M":"Wind Speed at 10 Meters","WS10M_MAX":"Wind Speed at 10 Meters Maximum",
"WS10M_MIN":"Wind Speed at 10 Meters Minimum","WS10M_RANGE":"Wind Speed at 10 Meters Range","WD10M":"Wind Direction at 10 Meters",
"GWETTOP":"Surface Soil Wetness (surface to 5 cm below)","GWETROOT":"Root Zone Soil Wetness (surface to 100 cm below)",
"GWETPROF":"Profile Soil Moisture (surface to bedrock)"}
SES=requests.Session(); SES.headers["User-Agent"]="NASA-POWER-MX-export/1.0"
SES.mount("https://",requests.adapters.HTTPAdapter(pool_connections=8,pool_maxsize=8))

def get(url,params=None,timeout=240,tries=6):
    err=None
    for i in range(tries):
        try:
            r=SES.get(url,params=params,timeout=timeout)
            if r.status_code==200:return r
            err=RuntimeError(f"HTTP {r.status_code}: {r.text[:300]}")
            if r.status_code in (400,404,422): raise err
        except Exception as e: err=e
        time.sleep(min(18,1.8**i))
    raise err

def centroid(g):
    if not g:return (None,None)
    polys=g.get("coordinates") or []; rings=polys[:1] if g.get("type")=="Polygon" else [x[0] for x in polys if x]
    best=None; ba=0
    for ring in rings:
        a=cx=cy=0.0
        for i in range(max(0,len(ring)-1)):
            x1,y1=ring[i];x2,y2=ring[i+1];z=x1*y2-x2*y1;a+=z;cx+=(x1+x2)*z;cy+=(y1+y2)*z
        if abs(a)>ba and abs(a)>1e-12:ba=abs(a);best=(cy/(3*a),cx/(3*a))
    return best or (None,None)

def municipalities():
    base="https://lcidsig.inegi.org.mx/server/rest/services/Hosted/Municipios_2025/FeatureServer"
    svc=get(base,{"f":"json"},90).json(); lid=(svc.get("layers") or [{"id":0}])[0]["id"]; q=f"{base}/{lid}/query"
    where="CVE_ENT IN ("+",".join("'"+x+"'" for x in CODES)+")"; feats=[];off=0
    while 1:
        o=get(q,{"where":where,"outFields":"*","returnGeometry":"true","outSR":"4326","resultOffset":off,
                 "resultRecordCount":1000,"f":"geojson"},120).json(); b=o.get("features") or []
        feats+=b
        if len(b)<1000:break
        off+=len(b)
    rows=[]
    for f in feats:
        p={str(k).upper():v for k,v in (f.get("properties") or {}).items()}
        cg=str(p.get("CVEGEO") or p.get("CVE_GEO") or ""); ent=str(p.get("CVE_ENT") or cg[:2]).zfill(2)
        if ent not in STATES:continue
        mun=str(p.get("CVE_MUN") or cg[-3:]).zfill(3); cg=(cg.zfill(5) if cg else ent+mun)
        lat,lon=centroid(f.get("geometry"))
        if lat is None:continue
        rows.append([ent,STATES[ent],mun,cg,str(p.get("NOMGEO") or p.get("NOM_MUN") or cg),lat,lon])
    d=pd.DataFrame(rows,columns=["cve_ent","estado","cve_mun","cvegeo","municipio","latitud_representativa","longitud_representativa"])
    d=d.drop_duplicates("cvegeo").sort_values(["cve_ent","cve_mun"])
    if len(d)<500:raise RuntimeError(f"Cobertura municipal incompleta: {len(d)}")
    return d

def snap(x,step,offset):return round((x-offset)/step)*step+offset
def mappings(m):
    specs={"solar":(1,1,.5,.5,"SYN1deg"),"meteorologia":(.5,.625,0,0,"MERRA2"),"imerg":(.1,.1,.05,.05,"IMERG")}
    out={}
    for group,(a,b,oa,ob,pref) in specs.items():
        z=m[["cvegeo","cve_ent","estado","cve_mun","municipio"]].copy()
        z["grid_lat"]=[snap(x,a,oa) for x in m.latitud_representativa]; z["grid_lon"]=[snap(x,b,ob) for x in m.longitud_representativa]
        z["cell_id"]=[f"{pref}_{x:+08.3f}_{y:+09.3f}".replace("+","p").replace("-","m") for x,y in zip(z.grid_lat,z.grid_lon)]
        z["resolucion_lat_grados"]=a;z["resolucion_lon_grados"]=b
        z.to_csv(META/f"municipio_celda_{group}.csv",index=False,encoding="utf-8-sig");out[group]=z
    return out

def pmap(o):
    p=o.get("properties",{}) if isinstance(o,dict) else {}
    for x in [p.get("parameter"),p.get("parameters"),o.get("parameter") if isinstance(o,dict) else None,o.get("parameters") if isinstance(o,dict) else None]:
        if isinstance(x,dict):return x
    return {}

def point(lat,lon,codes,start=START,end=END,ts="LST",timeout=300):
    return get("https://power.larc.nasa.gov/api/temporal/daily/point",
      {"parameters":",".join(codes),"community":"AG","longitude":f"{lon:.5f}","latitude":f"{lat:.5f}",
       "start":start,"end":end,"format":"JSON","time-standard":ts},timeout).json()

def validate():
    ok={"solar":[],"meteorologia":[]}; rows=[]
    for group,codes in [("solar",SOLAR),("meteorologia",MET)]:
        for c in codes:
            try:
                pm=pmap(point(23.25,-106.4,[c],"20250101","20250103","LST",90)); good=c in pm and bool(pm[c])
            except Exception as e:good=False
            if good:ok[group].append(c)
            rows.append([c,LABELS[c],group,"LST","disponible" if good else "no_disponible"])
    im=None
    for c in ["PRECIPITATIONCAL","PRECTOT_IMERG","PRECTOTCORR_IMERG","IMERG_PRECTOT"]:
        try:
            pm=pmap(point(23.25,-106.4,[c],"20250101","20250103","UTC",90))
            if c in pm and pm[c]:im=c;break
        except:pass
    rows.append([im or "NO_DETECTADO","Precipitation (IMERG)","imerg","UTC","disponible" if im else "no_disponible"])
    pd.DataFrame(rows,columns=["codigo","parametro","grupo","time_standard","estado"]).to_csv(META/"control_calidad_parametros.csv",index=False,encoding="utf-8-sig")
    return ok,im

def cell_df(cid,lat,lon,codes,ts):
    dates=pd.date_range("2003-01-01","2026-08-24");d=pd.DataFrame({"date":dates})
    for c in codes:d[c]=np.nan
    for i in range(0,len(codes),20):
        batch=codes[i:i+20];pm=pmap(point(lat,lon,batch,ts=ts))
        for c in batch:
            v=pm.get(c) or {}
            if not isinstance(v,dict):continue
            s=pd.Series(v); idx=pd.to_datetime(s.index,format="%Y%m%d",errors="coerce");num=pd.to_numeric(s,errors="coerce")
            num=num.mask(num.isin([-999,-99,-9999])); d[c]=d.date.map(pd.Series(num.values,index=idx))
    d.insert(0,"cell_id",cid);d.insert(2,"grid_lat",np.float32(lat));d.insert(3,"grid_lon",np.float32(lon))
    for c in codes:d[c]=pd.to_numeric(d[c],errors="coerce").astype("float32")
    return d

def download_group(group,mp,codes,ts):
    if not codes:return {"cells":0,"params":0,"rows":0,"errors":0}
    cells=mp[["cell_id","grid_lat","grid_lon"]].drop_duplicates(); writers={};errs=[];nrows=0
    schema=pa.schema([pa.field("cell_id",pa.string()),pa.field("date",pa.date32()),pa.field("grid_lat",pa.float32()),pa.field("grid_lon",pa.float32())]+[pa.field(c,pa.float32()) for c in codes])
    def w(y):
        if y not in writers:writers[y]=pq.ParquetWriter(DATA/group/f"{group}_{y}.parquet",schema,compression="zstd",compression_level=7)
        return writers[y]
    def job(r):
        try:return r.cell_id,cell_df(r.cell_id,float(r.grid_lat),float(r.grid_lon),codes,ts),None
        except Exception as e:return r.cell_id,None,str(e)
    with ThreadPoolExecutor(max_workers=5) as ex:
        fs=[ex.submit(job,r) for r in cells.itertuples()]
        for k,f in enumerate(as_completed(fs),1):
            cid,d,e=f.result()
            if e:errs.append([cid,e[:400]])
            else:
                for y,p in d.groupby(d.date.dt.year):
                    p=p[["cell_id","date","grid_lat","grid_lon"]+codes].copy();p["date"]=p.date.dt.date
                    w(int(y)).write_table(pa.Table.from_pandas(p,schema=schema,preserve_index=False,safe=False));nrows+=len(p)
            if k%25==0 or k==len(fs):print(group,k,"/",len(fs),"errors",len(errs),flush=True)
    for x in writers.values():x.close()
    if errs:pd.DataFrame(errs,columns=["cell_id","error"]).to_csv(META/f"errores_{group}.csv",index=False)
    return {"cells":len(cells),"params":len(codes),"rows":nrows,"errors":len(errs)}

EXPANDER='''import argparse
from pathlib import Path
import pandas as pd
p=argparse.ArgumentParser();p.add_argument("--anio",type=int,required=True);p.add_argument("--estado");p.add_argument("--municipio");p.add_argument("--formato",choices=["parquet","csv"],default="parquet");p.add_argument("--salida",required=True);a=p.parse_args()
r=Path(__file__).resolve().parents[1];m=pd.read_csv(r/"metadata/municipios.csv",dtype={"cvegeo":str,"cve_ent":str,"cve_mun":str})
if a.estado:m=m[m.estado.str.casefold()==a.estado.casefold()]
if a.municipio:m=m[m.municipio.str.casefold()==a.municipio.casefold()]
base=m[["cvegeo","cve_ent","estado","cve_mun","municipio"]];out=None
for g in ["solar","meteorologia","imerg"]:
 mp=pd.read_csv(r/f"metadata/municipio_celda_{g}.csv",dtype={"cvegeo":str})[["cvegeo","cell_id"]];f=r/f"datos/{g}/{g}_{a.anio}.parquet"
 if not f.exists():continue
 x=mp[mp.cvegeo.isin(base.cvegeo)].merge(pd.read_parquet(f),on="cell_id").drop(columns=["cell_id","grid_lat","grid_lon"],errors="ignore")
 out=x if out is None else out.merge(x,on=["cvegeo","date"],how="outer")
out=base.merge(out,on="cvegeo").sort_values(["cvegeo","date"])
out.to_csv(a.salida,index=False,encoding="utf-8-sig") if a.formato=="csv" else out.to_parquet(a.salida,index=False,compression="zstd")
print(len(out),a.salida)
'''

def main():
    print("INEGI municipalities",flush=True);m=municipalities();m.to_csv(META/"municipios.csv",index=False,encoding="utf-8-sig")
    states=pd.DataFrame([{"cve_ent":c,"estado":STATES[c],"criterio":"solicitado" if c in ("25","14") else "adicional_alta_relevancia_agricola","municipios":int((m.cve_ent==c).sum())} for c in CODES])
    states.to_csv(META/"estados_seleccionados.csv",index=False,encoding="utf-8-sig")
    mp=mappings(m);print("municipios",len(m),"cells",{g:x.cell_id.nunique() for g,x in mp.items()},flush=True)
    valid,im=validate();dic=[]
    for g,codes in [("solar",SOLAR),("meteorologia",MET)]:
        for c in codes:dic.append([c,LABELS[c],g,"LST"])
    dic.append([im or "NO_DETECTADO","Precipitation (IMERG)","imerg","UTC"])
    pd.DataFrame(dic,columns=["codigo","parametro","grupo","time_standard"]).to_csv(META/"diccionario_parametros.csv",index=False,encoding="utf-8-sig")
    rs=download_group("solar",mp["solar"],valid["solar"],"LST");rm=download_group("meteorologia",mp["meteorologia"],valid["meteorologia"],"LST")
    ri=download_group("imerg",mp["imerg"],[im],"UTC") if im else {"cells":0,"params":0,"rows":0,"errors":0}
    (TOOLS/"expandir_municipio.py").write_text(EXPANDER,encoding="utf-8");(TOOLS/"requirements.txt").write_text("pandas>=2.2\npyarrow>=16\n")
    man={"generado_utc":datetime.utcnow().isoformat()+"Z","historico":"2003-01-01/2025-12-31","2026":"2026-01-01/2026-08-24 provisional",
         "municipios":len(m),"estados":states.to_dict("records"),"celdas":{g:int(x.cell_id.nunique()) for g,x in mp.items()},
         "descarga":{"solar":rs,"meteorologia":rm,"imerg":ri},"imerg_code":im}
    (META/"manifest.json").write_text(json.dumps(man,ensure_ascii=False,indent=2),encoding="utf-8")
    readme=f'''NASA POWER - Municipios agrícolas de México
Cobertura: Sinaloa y Jalisco completos + Michoacán, Sonora, Chihuahua, Veracruz, Guanajuato, Estado de México, Puebla y Chiapas.
Diario: 2003-01-01 a 2025-12-31; 2026 hasta 2026-08-24 como provisional/NRT.
La base está normalizada por celda climática: los archivos municipio_celda_*.csv relacionan cada municipio con su celda POWER.
datos/solar, datos/meteorologia y datos/imerg contienen Parquet por año. metadata contiene catálogo, diccionario y auditoría.
Para crear un CSV municipio-día:
pip install -r herramientas/requirements.txt
python herramientas/expandir_municipio.py --anio 2025 --estado Sinaloa --formato csv --salida Sinaloa_2025.csv
Radiación: malla nativa aproximada 1 grado. Meteorología MERRA-2/GEOS: 0.5 x 0.625 grados. IMERG: 0.1 x 0.1 grados, diario UTC.
Municipios incluidos: {len(m)}.
'''
    (ROOT/"README.txt").write_text(readme,encoding="utf-8")
    z=PUB/"NASA_POWER_Municipios_Agricolas_MX_2003_2026";shutil.make_archive(str(z),"zip",root_dir=ROOT.parent,base_dir=ROOT.name)
    shutil.copy2(META/"manifest.json",PUB/"manifest.json");size=z.with_suffix(".zip").stat().st_size
    (PUB/"index.html").write_text(f'''<!doctype html><meta charset="utf-8"><h1>NASA POWER Municipios agrícolas MX</h1><p>{len(m)} municipios.</p><a href="/NASA_POWER_Municipios_Agricolas_MX_2003_2026.zip">Descargar ZIP ({size/1048576:.1f} MB)</a><br><a href="/manifest.json">Auditoría</a>''',encoding="utf-8")
    print("ZIP_BYTES",size,json.dumps(man,ensure_ascii=False)[:5000],flush=True)
if __name__=="__main__":main()
