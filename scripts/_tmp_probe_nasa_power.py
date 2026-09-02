import json
import requests
import fsspec
import xarray as xr

print('=== NASA POWER parameter manager ===')
url='https://power.larc.nasa.gov/api/system/manager/parameters'
r=requests.get(url, params={'community':'AG','temporal':'DAILY','metadata':'true','user':'chatgpt-export'}, timeout=60)
print('manager status', r.status_code, 'bytes', len(r.content))
try:
    obj=r.json()
    print('manager type', type(obj).__name__)
    if isinstance(obj, dict):
        print('manager keys', list(obj)[:20])
        text=json.dumps(obj)
        for key in ['IMERG','PRECTOT','GWETROOT','GWETPROF','ALLSKY_SFC_SW_DNI','ALLSKY_SFC_SW_DIFF','TOA_SW_DWN']:
            print(key, key in text)
except Exception as e:
    print('manager parse error', repr(e), r.text[:1000])

print('\n=== NASA POWER Zarr probes ===')
candidates=[
 ('merra2_daily_lst','https://nasa-power.s3.us-west-2.amazonaws.com/merra2/temporal/power_merra2_daily_temporal_lst.zarr'),
 ('merra2_daily_utc','https://nasa-power.s3.us-west-2.amazonaws.com/merra2/temporal/power_merra2_daily_temporal_utc.zarr'),
 ('syn1deg_daily_lst','https://nasa-power.s3.us-west-2.amazonaws.com/syn1deg/temporal/power_syn1deg_daily_temporal_lst.zarr'),
 ('syn1deg_daily_utc','https://nasa-power.s3.us-west-2.amazonaws.com/syn1deg/temporal/power_syn1deg_daily_temporal_utc.zarr'),
 ('imerg_daily_utc','https://nasa-power.s3.us-west-2.amazonaws.com/imerg/temporal/power_imerg_daily_temporal_utc.zarr'),
]
for name,path in candidates:
    try:
        ds=xr.open_zarr(fsspec.get_mapper(path), consolidated=True)
        print(name, 'OK dims=', dict(ds.sizes), 'vars=', list(ds.data_vars)[:100])
        for v in list(ds.data_vars)[:10]:
            print(' ', v, dict(ds[v].attrs))
    except Exception as e:
        print(name, 'FAIL', type(e).__name__, str(e)[:500])

print('\n=== INEGI Municipios 2025 probe ===')
base='https://lcidsig.inegi.org.mx/server/rest/services/Hosted/Municipios_2025/FeatureServer'
r=requests.get(base, params={'f':'json'}, timeout=60)
print('inegi service', r.status_code, r.text[:1000])
try:
    svc=r.json(); layers=svc.get('layers',[]); print('layers', layers)
    if layers:
        lid=layers[0]['id']
        q=f'{base}/{lid}/query'
        rr=requests.get(q, params={'where':'1=1','outFields':'*','returnGeometry':'true','outSR':'4326','resultRecordCount':2,'f':'geojson'}, timeout=60)
        print('query status', rr.status_code, 'bytes', len(rr.content))
        gj=rr.json(); print('feature count sample', len(gj.get('features',[])))
        if gj.get('features'): print('properties', gj['features'][0].get('properties'))
except Exception as e:
    print('INEGI parse error', repr(e))

print('\n=== Direct API one-day IMERG name probes ===')
for p in ['PRECTOT_IMERG','PRECTOTCORR_IMERG','IMERG_PRECTOT','PRECTOT']:
    try:
        rr=requests.get('https://power.larc.nasa.gov/api/temporal/daily/point', params={
            'parameters':p,'community':'AG','longitude':-106.4,'latitude':23.25,
            'start':'20250101','end':'20250103','format':'JSON','time-standard':'UTC'
        }, timeout=60)
        print(p, rr.status_code, rr.text[:700].replace('\n',' '))
    except Exception as e:
        print(p, 'ERROR', repr(e))
