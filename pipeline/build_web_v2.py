"""Build versioned, static data products for a future Sinaloa agricultural portal.

All input comes from the uploaded DGSIAP audit annex already embedded in
data/analysis-pack.b64. This script does not download or fabricate observations.

Run: python -m pipeline.build_web_v2
"""
from __future__ import annotations

import argparse
import base64
import csv
import gzip
import hashlib
import io
import json
import math
import re
import unicodedata
from collections import defaultdict
from decimal import Decimal
from pathlib import Path

from .dgsiap import validate, derive, n, millions

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "data" / "analysis-pack.b64"
DEFAULT_OUTPUT = ROOT / "data" / "api" / "v2"

DATASET_LINKS = {
    "state": "state",
    "municipal": "municipal",
    "crops": "crops",
    "records2025": "current",
    "municipal2025": "municipal2025",
}
DETAIL_FIELDS = [
    "Idestado", "Idmunicipio", "Nommunicipio", "Anio", "Nomcultivo",
    "Nomvariedad", "Nomunidad", "Nommodalidad", "Nomcicloproductivo",
    "TipoTecnologia", "TipoProduccion", "TipoMercado", "Sembrada",
    "Cosechada", "Siniestrada", "Volumenproduccion", "RendimientoDGSIAP",
    "PrecioMedioRuralDGSIAP", "Valorproduccion", "ConsultaID",
]
DIMENSIONS = ["Nommodalidad", "Nomcicloproductivo", "TipoTecnologia",
              "TipoProduccion", "TipoMercado", "Nomcultivo", "Nomvariedad"]
METRICS = ("Sembrada", "Cosechada", "Siniestrada", "Valorproduccion")
REPORT_PAGES = {
    "Ahome": (7, 32), "Angostura": (35, 53),
    "Badiraguato": (56, 69), "Choix": (72, 86),
    "Concordia": (89, 107), "Cosalá": (110, 124),
    "Culiacán": (127, 152), "El Fuerte": (155, 176),
    "Elota": (179, 199), "Escuinapa": (202, 218),
    "Guasave": (221, 242), "Mazatlán": (245, 263),
    "Mocorito": (266, 283), "Navolato": (286, 309),
    "Rosario": (312, 329), "Salvador Alvarado": (332, 347),
    "San Ignacio": (350, 367), "Sinaloa": (370, 391)
}
EXPECTED = {"state": 23, "municipal": 414, "crops": 8217,
            "records2025": 637, "municipal2025": 18}
MONEY = Decimal("1000")
THRESHOLD = Decimal("0.10")


def slug(text: str) -> str:
    plain = unicodedata.normalize("NFKD", str(text))
    plain = "".join(c for c in plain if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", plain.casefold()).strip("-")


def decode_pack(path: Path) -> tuple[dict, dict]:
    encoded = "".join(path.read_text(encoding="utf-8").split())
    raw = gzip.decompress(base64.b64decode(encoded, validate=True))
    doc = json.loads(raw)
    tables = {}
    for name, reference in DATASET_LINKS.items():
        table = doc[name]
        fields = table["columns"]
        tables[reference] = [
            dict(zip(fields, (str(value) if value is not None else "" for value in row)))
            for row in table["rows"]
        ]
    return doc, tables


def plain_number(value) -> float:
    return round(float(n(value)), 4)


def value_millions(value) -> float:
    return round(float(n(value)/MONEY), 5)


def group_metrics(rows: list[dict], key: str) -> list[dict]:
    store = {}
    for row in rows:
        label = row[key] or "Sin clasificar"
        if label not in store:
            store[label] = {"categoria": label, "filas": 0,
                            **{k:Decimal("0") for k in METRICS}}
        rec = store[label]
        rec["filas"] += 1
        for metric in METRICS:
            rec[metric] += n(row[metric])
    total = sum((r["Valorproduccion"] for r in store.values()), Decimal("0"))
    result = []
    for r in store.values():
        result.append({
            "categoria":r["categoria"], "registros":r["filas"],
            "valor_mdp":value_millions(r["Valorproduccion"]),
            "participacion_valor_pct":round(float(r["Valorproduccion"]/total*100),3) if total else None,
            "sembrada_ha":plain_number(r["Sembrada"]),
            "cosechada_ha":plain_number(r["Cosechada"]),
            "siniestrada_ha":plain_number(r["Siniestrada"]),
        })
    return sorted(result,key=lambda v:(-v["valor_mdp"],v["categoria"]))


def dimension_view(rows: list[dict]) -> dict:
    return {key:group_metrics(rows,key) for key in DIMENSIONS}


def concentration(crop_values: list[Decimal]) -> float | None:
    total = sum(crop_values,Decimal("0"))
    if total<=0:
        return None
    return round(sum((float(value/total)**2 for value in crop_values if value>0)),6)


def historical_concentration(crops: list[dict], group_key: str) -> list[dict]:
    buckets = defaultdict(list)
    for r in crops:
        buckets[(r[group_key],int(r["Anio"]))].append(n(r["Valorproduccion"]))
    return [
        {"categoria":key,"anio":year,"hhi_valor":concentration(values),
         "cultivos_observados":len(values)}
        for (key,year),values in sorted(buckets.items())
    ]


def trend(rows: list[dict]) -> list[dict]:
    return [
        {"anio":int(r["Anio"]),
         "valor_mdp":value_millions(r["Valorproduccion"]),
         "sembrada_ha":plain_number(r["Sembrada"]),
         "cosechada_ha":plain_number(r["Cosechada"]),
         "siniestrada_ha":plain_number(r["Siniestrada"])}
        for r in sorted(rows,key=lambda x:int(x["Anio"]))
    ]


def crop_trend(rows: list[dict]) -> list[dict]:
    return [
        {"anio":int(r["Anio"]),
         "valor_mdp":value_millions(r["Valorproduccion"]),
         "sembrada_ha":plain_number(r["Sembrada"]),
         "cosechada_ha":plain_number(r["Cosechada"]),
         "siniestrada_ha":plain_number(r["Siniestrada"]),
         "volumen":plain_number(r["Volumenproduccion"]),
         "unidad":r["Nomunidad"]}
        for r in sorted(rows,key=lambda x:int(x["Anio"]))
    ]


def compare_crops(last: list[dict], previous: list[dict]) -> list[dict]:
    # Missing observations stay null; do not manufacture zero production.
    by_key = {(r["Nomcultivo"],int(r["Anio"])):r for r in last+previous}
    names = sorted({crop for crop,year in by_key})
    items = []
    for crop in names:
        a=by_key.get((crop,2024));b=by_key.get((crop,2025))
        v0=n(a["Valorproduccion"]) if a else None
        v1=n(b["Valorproduccion"]) if b else None
        delta=v1-v0 if a and b else None
        item = {
            "cultivo":crop,"2024_reportado":a is not None,"2025_reportado":b is not None,
            "valor_2024_mdp":value_millions(v0) if a else None,
            "valor_2025_mdp":value_millions(v1) if b else None,
            "diferencia_mdp":value_millions(delta) if delta is not None else None,
            "variacion_nominal_pct":round(float((v1/v0-1)*100),3)
                if delta is not None and v0>0 else None,
            "descomposicion_log_puntos":None
        }
        if a and b and a["Nomunidad"]==b["Nomunidad"]:
            a0,a1=n(a["Cosechada"]),n(b["Cosechada"])
            q0,q1=n(a["Volumenproduccion"]),n(b["Volumenproduccion"])
            if min(a0,a1,q0,q1,v0,v1)>0:
                components={
                    "superficie":100*math.log(float(a1/a0)),
                    "rendimiento":100*math.log(float((q1/a1)/(q0/a0))),
                    "precio_implicito":100*math.log(float((v1/q1)/(v0/q0)))
                }
                item["descomposicion_log_puntos"]={
                    **{k:round(v,4) for k,v in components.items()},
                    "total_variacion_log":round(100*math.log(float(v1/v0)),4),
                    "unidad":a["Nomunidad"]
                }
        items.append(item)
    return sorted(items,key=lambda x:(-(x["valor_2025_mdp"] or 0),x["cultivo"]))


def from_record(r: dict) -> dict:
    out={}
    for key in DETAIL_FIELDS:
        value=r[key]
        if key in ("Anio","Idestado","Idmunicipio"):
            out[key]=int(value)
        elif key in ("Sembrada","Cosechada","Siniestrada","Volumenproduccion",
                     "RendimientoDGSIAP","PrecioMedioRuralDGSIAP"):
            out[key]=plain_number(value)
        elif key=="Valorproduccion":
            out["valor_mdp"]=value_millions(value)
        else:
            out[key]=value
    return out


def corpus(doc: dict, tables: dict) -> dict:
    audit=validate({
        "state":tables["state"],"municipal":tables["municipal"],
        "crops":tables["crops"],"current":tables["current"],
        "municipal2025":tables["municipal2025"]},doc["audit"])
    annual_state=tables["state"]; municipal=tables["municipal"]; crops=tables["crops"]
    current=tables["current"]
    state_2025=next(r for r in annual_state if r["Anio"]=="2025")
    assert len(REPORT_PAGES)==18

    # Run additional checks on all six dimensions of source 2025 observations.
    for field,expected in (("Nomcultivo",61),("Nomvariedad",113),("Nommunicipio",18)):
        actual=len({r[field] for r in current})
        if actual!=expected:
            raise ValueError(f"2025 {field}: expected {expected}, got {actual}")
    if any(n(row["Valorproduccion"])<0 for row in current):
        raise ValueError("Negative 2025 reported value")
    for row in current:
        if n(row["Cosechada"])>n(row["Sembrada"])+Decimal("0.001"):
            raise ValueError(f"Harvest exceeds planted area: {row['ConsultaID']}")
    municipalities=sorted({r["Nommunicipio"] for r in municipal})
    if set(municipalities)!=set(REPORT_PAGES):
        raise ValueError("Report index does not match historical municipalities")
    current_total=sum((n(r["Valorproduccion"]) for r in current), Decimal("0"))
    state_total=n(state_2025["value"])
    if abs(current_total-state_total)>THRESHOLD:
        raise ValueError("2025 record totals differ from state total")

    state_annual=[{
        "anio":int(r["Anio"]),"valor_mdp":value_millions(r["value"]),
        "sembrada_ha":plain_number(r["area"]),
        "cosechada_ha":plain_number(r["harvest"]),
        "siniestrada_ha":plain_number(r["loss"]),
        "registros":int(r["rows"]),"cultivos":int(r["crops"])
    } for r in annual_state]
    current_mun=group_metrics(current,"Nommunicipio")
    history_muni=historical_concentration(crops,"Nommunicipio")
    by_muni=defaultdict(list)
    by_crop=defaultdict(list)
    by_muni_crop=defaultdict(list)
    by_original=defaultdict(list)
    for r in municipal:by_muni[r["Nommunicipio"]].append(r)
    for r in crops:
        by_crop[r["Nomcultivo"]].append(r)
        by_muni_crop[(r["Nommunicipio"],r["Nomcultivo"])].append(r)
    for r in current:by_original[r["Nommunicipio"]].append(r)
    profile_2025={x["municipality"]:x for x in derive({
        "state":tables["state"],"municipal":tables["municipal"],
        "crops":tables["crops"],"current":tables["current"],
        "municipal2025":tables["municipal2025"]},doc["audit"])["municipalities"]}

    result={}
    result["state.json"]={
        "schema_version":"2.0.0","source":"DGSIAP audit annex, October 2026",
        "state":"Sinaloa","period":[2003,2025],"annual":state_annual,
        "dimensions_2025":dimension_view(current),
        "municipalities_2025":current_mun,
        "hhi_municipal_2025":concentration([n(x["value"]) for x in tables["municipal2025"]]),
        "hhi_crop_2025":concentration([n(x["Valorproduccion"]) for x in group_annual_crops(crops,2025)]),
        "nominal_currency":"MXN","source_value_unit":"thousands MXN"
    }

    profiles=[]
    for name in municipalities:
        rows=by_muni[name]
        detail=by_original[name]
        group=by_muni_crop
        current_crops=sorted({r["Nomcultivo"] for r in detail})
        current_milli=sum((n(r["Valorproduccion"]) for r in detail),Decimal("0"))
        crops_payload={}
        for crop in sorted({c for (m,c) in group if m==name}):
            historical=group[(name,crop)]
            typed=crop_trend(historical)
            rows_2025=[r for r in detail if r["Nomcultivo"]==crop]
            crops_payload[slug(crop)]={
                "nombre":crop,"serie":typed,
                "anio_2025_reportado":bool(rows_2025),
                "composicion_2025":dimension_view(rows_2025) if rows_2025 else None
            }
        compares=compare_crops([r for r in crops if r["Nommunicipio"]==name and r["Anio"]=="2025"],
                                [r for r in crops if r["Nommunicipio"]==name and r["Anio"]=="2024"])
        reports=REPORT_PAGES[name]
        obj={
            "schema_version":"2.0.0","municipio":name,"slug":slug(name),
            "periodo":[2003,2025],"serie":trend(rows),
            "concentracion_historica":[r for r in history_muni if r["categoria"]==name],
            "cierre_2025":{"valor_mdp":value_millions(current_milli),
                "registros":len(detail),"cultivos":len(current_crops),
                "composicion":dimension_view(detail),
                "registros_detalle":[from_record(x) for x in detail]},
            "cultivos":crops_payload,
            "comparacion_2024_2025":compares,
            "perfil_analitico":profile_2025[name],
            "informe_pdf":{"pagina_perfil":reports[0],"pagina_conclusiones":reports[1],
                           "conclusiones_paginas":[reports[1],reports[1]+2],
                           "note":"One-indexed pages of the attached 395-page report; report PDF is not hosted here"}
        }
        result[f"municipios/{slug(name)}.json"]=obj
        profiles.append({"municipio":name,"slug":slug(name),
                         "valor_2025_mdp":value_millions(current_milli),
                         "cultivos":len(current_crops),
                         "ruta":f"municipios/{slug(name)}.json"})

    crop_index=[]
    for crop,rows in sorted(by_crop.items()):
        year_values=defaultdict(lambda:Decimal("0"))
        territorial=defaultdict(lambda:Decimal("0"))
        for row in rows:
            year_values[int(row["Anio"])]+=n(row["Valorproduccion"])
            if row["Anio"]=="2025":territorial[row["Nommunicipio"]]+=n(row["Valorproduccion"])
        current_rows=[r for r in current if r["Nomcultivo"]==crop]
        crop_index.append({
            "cultivo":crop,"slug":slug(crop),
            "anios_reportados":sorted(year_values),"serie_valor_mdp":[
                {"anio":year,"valor_mdp":value_millions(value)}
                for year,value in sorted(year_values.items())],
            "municipios_2025":[{"municipio":name,"valor_mdp":value_millions(value)}
                                for name,value in sorted(territorial.items(),
                                                  key=lambda x:x[1],reverse=True)],
            "valor_2025_mdp":value_millions(year_values[2025]) if 2025 in year_values else None,
            "variedades_2025":[{"nombre":x["categoria"],"valor_mdp":x["valor_mdp"],
                                "participacion_pct":x["participacion_valor_pct"]}
                               for x in group_metrics(current_rows,"Nomvariedad")]
        })
    # A historical missing year remains absent, never inserted as a fabricated zero.
    result["cultivos.json"]={
        "schema_version":"2.0.0","catalogo":sorted(crop_index,key=lambda x:x["cultivo"]),
        "observacion":"Years without an observation are not zero-production years"
    }
    result["catalogos.json"]={
        "schema_version":"2.0.0",
        "municipios":profiles,
        "cultivos":[{"nombre":r["cultivo"],"slug":r["slug"]} for r in crop_index],
        "modalidades":sorted({r["Nommodalidad"] for r in current}),
        "ciclos":sorted({r["Nomcicloproductivo"] for r in current}),
        "tecnologias":sorted({r["TipoTecnologia"] for r in current}),
        "tipos_produccion":sorted({r["TipoProduccion"] for r in current}),
        "mercados":sorted({r["TipoMercado"] for r in current}),
        "unidades":sorted({r["Nomunidad"] for r in current}),
        "campo_historico_variedades":"Not available: varieties only from original 2025 closing",
        "cobertura_municipal":"18 historical DGSIAP municipal codes; no automatic reassignment"
    }
    result["calidad.json"]={
        "schema_version":"2.0.0","origen":"Uploaded October 2026 audited annex",
        "auditoria_declarada_por_anexos":doc["audit"],
        "conciliacion_computada":audit,
        "verificaciones_adicionales":{
            "cultivos_distintos_2025":61,
            "nombres_variedades_distintos_2025":113,
            "filas_originales_2025":len(current),
            "cosechada_mayor_sembrada_2025":0,
            "valor_2025_calculado_mdp":value_millions(current_total),
            "unidad_no_tonelada":[{"municipio":r["Nommunicipio"],"cultivo":r["Nomcultivo"],
                 "unidad":r["Nomunidad"]} for r in current if r["Nomunidad"]!="Tonelada"]
        },
        "advertencias":[
            "All monetary totals are nominal gross value, not inflation-adjusted, margins or profits.",
            "Historical varieties and irrigated/rainfed breakdown are unavailable in these annex series before 2025.",
            "Summed agricultural area across crops/cycles is not unique land area.",
            "No missing crop-year records are imputed as zero production.",
            "2020–2021 crop counts change markedly; source catalog coverage must be verified.",
            "The 2025 3 ha of siniestrada is uncorrected and should not be generalized.",
            "The 18 source municipality keys are historical; new municipality boundaries require crosswalk.",
            "The annex-provided SHA-256 is not a new validation against the official DGSIAP service.",
            "Log change decomposition is an accounting identity, not a causal model."
        ]
    }
    return result


def group_annual_crops(rows,year):
    aggregated=defaultdict(lambda:Decimal("0"))
    for row in rows:
        if int(row["Anio"])==year:
            aggregated[row["Nomcultivo"]]+=n(row["Valorproduccion"])
    return [{"Nomcultivo":name,"Valorproduccion":str(value)}
            for name,value in aggregated.items()]


def write_outputs(payload: dict, directory: Path) -> dict:
    directory.mkdir(parents=True,exist_ok=True)
    entries=[]
    for name,object_ in sorted(payload.items()):
        path=directory/name
        path.parent.mkdir(parents=True,exist_ok=True)
        contents=(json.dumps(object_,ensure_ascii=False,sort_keys=True,
                             separators=(",",":"),allow_nan=False)+"\n").encode("utf-8")
        path.write_bytes(contents)
        entries.append({"file":name,"bytes":len(contents),
                        "sha256":hashlib.sha256(contents).hexdigest()})
    manifest={
        "version":"2.0.0","source":"data/analysis-pack.b64",
        "products":entries,"files":len(entries),
        "purpose":"Static, versioned data contracts for the future agricultural portal",
        "warning":"No external verification of original DGSIAP extraction."
    }
    (directory/"manifest.json").write_text(
        json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    return manifest


def main(argv=None):
    parser=argparse.ArgumentParser(description="Build deterministic Sinaloa data API v2")
    parser.add_argument("--input",type=Path,default=DEFAULT_SOURCE)
    parser.add_argument("--output",type=Path,default=DEFAULT_OUTPUT)
    args=parser.parse_args(argv)
    doc,tables=decode_pack(args.input)
    result=corpus(doc,tables)
    manifest=write_outputs(result,args.output)
    print("Validated and generated",manifest["files"],"JSON products.")
    for entry in manifest["products"]:
        print(entry["file"],entry["bytes"],entry["sha256"][:12])


if __name__=="__main__":
    main()
