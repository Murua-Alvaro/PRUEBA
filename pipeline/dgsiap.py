"""Validated DGSIAP Sinaloa data pipeline; only Python standard library.

Build reproducible municipal crop profiles and validation evidence:
python -m pipeline.dgsiap ANEXOS.zip --output data/indicators-v1.json
"""
from __future__ import annotations
import argparse
import csv
import io
import json
import math
import zipfile
from collections import defaultdict
from decimal import Decimal
from pathlib import Path

DATASETS = {
    "state": "serie_estatal_2003_2025.csv",
    "municipal": "series_municipales_2003_2025.csv",
    "crops": "series_cultivo_2003_2025.csv",
    "current": "registros_originales_2025.csv",
    "municipal2025": "indicadores_municipales_2025.csv",
}
EXPECTED = {"state": 23, "municipal": 414, "crops": 8217, "current": 637, "municipal2025": 18}
PESO_SCALE = Decimal("1000")
TOLERANCE = Decimal("0.10")  # Source units: thousands of MXN.


def n(value):
    return Decimal(str(value or "0"))


def millions(value):
    return round(float(value / PESO_SCALE), 3)


def read_archive(path):
    tables = {}
    with zipfile.ZipFile(path) as archive:
        names = set(archive.namelist())
        for key, filename in DATASETS.items():
            if filename not in names:
                raise ValueError(f"Missing required source: {filename}")
            with archive.open(filename) as binary:
                text = io.TextIOWrapper(binary, encoding="utf-8-sig", newline="")
                tables[key] = list(csv.DictReader(text))
        audit = json.loads(archive.read("auditoria_integridad.json").decode("utf-8"))
    return tables, audit


def ensure(condition, message):
    if not condition:
        raise ValueError(message)


def group_sum(records, field, *keys):
    groups = defaultdict(lambda: Decimal("0"))
    for row in records:
        groups[tuple(row[k] for k in keys)] += n(row[field])
    return dict(groups)


def validate(tables, original_audit):
    for name, expected in EXPECTED.items():
        ensure(len(tables[name]) == expected,
               f"{name}: expected {expected} records, found {len(tables[name])}")
    state = tables["state"]
    years = sorted(int(r["Anio"]) for r in state)
    ensure(years == list(range(2003, 2026)), "Expected 2003–2025 inclusive")
    municipalities = {r["Nommunicipio"] for r in tables["municipal"]}
    ensure(len(municipalities) == 18, "Municipality count mismatch")
    seen = set()
    for row in tables["municipal"]:
        key = (row["Nommunicipio"], row["Anio"])
        ensure(key not in seen, f"Duplicate municipality/year: {key}")
        seen.add(key)
    seen_crop = set()
    for row in tables["crops"]:
        ensure(row["Nommunicipio"] in municipalities, "Unknown municipality in crop series")
        key = (row["Nommunicipio"], row["Anio"], row["Nomcultivo"])
        ensure(key not in seen_crop, f"Duplicate municipal crop series key: {key}")
        seen_crop.add(key)
    by_mun = group_sum(tables["municipal"], "Valorproduccion", "Anio")
    by_crop = group_sum(tables["crops"], "Valorproduccion", "Anio")
    by_current = group_sum(tables["current"], "Valorproduccion", "Nommunicipio")
    by_reference = {r["Nommunicipio"]:n(r["value"]) for r in tables["municipal2025"]}
    controls = []
    for row in state:
        year = row["Anio"]
        expected = n(row["value"])
        delta_m = by_mun.get((year,), Decimal("0"))-expected
        delta_c = by_crop.get((year,), Decimal("0"))-expected
        ensure(abs(delta_m) <= TOLERANCE, f"{year}: municipal total mismatch ({delta_m})")
        ensure(abs(delta_c) <= TOLERANCE, f"{year}: crop total mismatch ({delta_c})")
        controls.append({"year":int(year), "municipal_difference_thousands":float(delta_m),
                         "crop_difference_thousands":float(delta_c)})
    state_2025 = n(next(x["value"] for x in state if x["Anio"]=="2025"))
    ensure(abs(sum(by_current.values(), Decimal("0"))-state_2025) <= TOLERANCE,
           "Original 2025 records do not reconcile with state total")
    for name, value in by_reference.items():
        ensure(abs(by_current.get((name,), Decimal("0"))-value) <= TOLERANCE,
               f"Original 2025 records do not reconcile for {name}")
    ensure(int(original_audit["filas"])==15276, "Unexpected audited original population")
    return {
        "ok":True, "counts":{key:len(rows) for key,rows in tables.items()},
        "audited_original_rows":int(original_audit["filas"]),
        "municipalities":len(municipalities), "years":[2003,2025],
        "state_2025_millions_mxn":millions(state_2025),
        "reconciliation":controls,
        "cautions":[
            "Nominal values are not inflation-adjusted, and are not profit.",
            "Summed crop/cycle hectares are not unique physical land.",
            "Historical 18 municipalities must not be reassigned to new municipal boundaries.",
            "Catalog changes in 2020–2021 need independent explanation.",
            "The 2025 siniestrada figure of 3 ha is reported, not corrected.",
            "Original annex audit claims are not an independent external data validation."
        ]
    }


def crop_profile(current, previous):
    """Observed change and optional NON-CAUSAL log area × yield × price identity."""
    result = {
        "value_2024_million":millions(n(previous["Valorproduccion"])) if previous else None,
        "value_2025_million":millions(n(current["Valorproduccion"])) if current else None,
        "delta_million":None, "change_percent":None, "price_yield_area_log_pct":None
    }
    if not (current and previous):
        return result
    v0,v1 = n(previous["Valorproduccion"]),n(current["Valorproduccion"])
    result["delta_million"] = millions(v1-v0)
    if v0:
        result["change_percent"] = round(float((v1/v0-1)*100),2)
    if current["Nomunidad"].casefold()!=previous["Nomunidad"].casefold():
        return result
    a0,a1 = n(previous["Cosechada"]),n(current["Cosechada"])
    q0,q1 = n(previous["Volumenproduccion"]),n(current["Volumenproduccion"])
    if min(a0,a1,q0,q1,v0,v1)<=0:
        return result
    area = math.log(float(a1/a0))*100
    yield_part = math.log(float((q1/a1)/(q0/a0)))*100
    price = math.log(float((v1/q1)/(v0/q0)))*100
    result["price_yield_area_log_pct"] = {
        "area":round(area,2), "yield":round(yield_part,2),
        "implicit_price":round(price,2), "unit":current["Nomunidad"]
    }
    return result


def derive(tables, audit):
    validation=validate(tables,audit)
    prev={(r["Nommunicipio"],r["Nomcultivo"]):r
          for r in tables["crops"] if r["Anio"]=="2024"}
    groups=defaultdict(list)
    for r in tables["current"]:
        groups[(r["Nommunicipio"],r["Nomcultivo"])].append(r)
    current={}
    for key,rows in groups.items():
        units={r["Nomunidad"] for r in rows}
        current[key]={
            "Nomunidad":next(iter(units)) if len(units)==1 else "MIXED",
            "Valorproduccion":str(sum((n(r["Valorproduccion"]) for r in rows),Decimal("0"))),
            "Cosechada":str(sum((n(r["Cosechada"]) for r in rows),Decimal("0"))),
            "Volumenproduccion":str(sum((n(r["Volumenproduccion"]) for r in rows),Decimal("0")))
        }
    annual={(r["Nommunicipio"],r["Anio"]):r for r in tables["municipal"]}
    municipalities=sorted({r["Nommunicipio"] for r in tables["municipal"]})
    profiles=[]
    for name in municipalities:
        crop_names=sorted({key[1] for key in set(prev)|set(current) if key[0]==name})
        items=[]
        for crop in crop_names:
            present=current.get((name,crop))
            earlier=prev.get((name,crop))
            data=crop_profile(present,earlier)
            data.update({"crop":crop,"reported_2024":earlier is not None,
                         "reported_2025":present is not None})
            items.append(data)
        now=n(annual[(name,"2025")]["Valorproduccion"])
        old=n(annual[(name,"2024")]["Valorproduccion"])
        active=sorted((x for x in items if x["reported_2025"]),
                      key=lambda x:x["value_2025_million"],reverse=True)
        comparable=[x for x in items if x["delta_million"] is not None]
        summed=sum((n(x["value_2025_million"]) for x in active),Decimal("0"))
        hhi=sum((float(n(x["value_2025_million"])/summed)**2
                 for x in active),0.0) if summed>0 else None
        winners=sorted((x for x in comparable if x["delta_million"]>0),
                       key=lambda x:x["delta_million"],reverse=True)
        losers=sorted((x for x in comparable if x["delta_million"]<0),
                      key=lambda x:x["delta_million"])
        profiles.append({
            "municipality":name,"year":2025,
            "value_2025_million":millions(now),"value_2024_million":millions(old),
            "delta_million":millions(now-old),
            "change_percent":round(float((now/old-1)*100),2) if old else None,
            "crop_count_2025":len(active),
            "hhi_value_2025":round(hhi,5) if hhi is not None else None,
            "top_3_value_share_pct":round(sum(x["value_2025_million"]
                                           for x in active[:3])/millions(now)*100,2) if now else None,
            "top_crops":active[:10],
            "gainers_2024_2025":winners[:5],
            "losers_2024_2025":losers[:5],
            "newly_reported_2025":[x["crop"] for x in active if not x["reported_2024"]],
            "not_reported_2025":[x["crop"] for x in items
                                 if x["reported_2024"] and not x["reported_2025"]]
        })
    return {
        "schema_version":"1.0.0","source":"DGSIAP, audit annex Sinaloa 2003–2025 (Oct 2026)",
        "scope":{"state":"Sinaloa","historical_years":[2003,2025],
                 "source_municipalities":18,"currency":"MXN nominal",
                 "value_display_unit":"million MXN"},
        "validation":validation,
        "municipalities":profiles,
        "methodology":{
            "year_comparison":"Compare only crops present in both closings.",
            "absent_crop":"Absent source row does not prove zero production.",
            "hhi":"Sum of squared crop shares in 2025 nominal municipal value (0 to 1).",
            "decomposition":"Log identity: value = harvested area × output/area × implicit price.",
            "log_component":"100 × natural logarithm of each factor ratio; log percentage points.",
            "price_caveat":"Observed implicit price is not profit margin or causal evidence."
        }
    }


def main():
    parser=argparse.ArgumentParser(description="Build validated Sinaloa agriculture indicators")
    parser.add_argument("source_zip",type=Path)
    parser.add_argument("--output",type=Path,default=Path("data/indicators-v1.json"))
    args=parser.parse_args()
    tables,audit=read_archive(args.source_zip)
    document=derive(tables,audit)
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(document,ensure_ascii=False,indent=2,allow_nan=False)+"\n",
                           encoding="utf-8")
    print(f"Validated {document['validation']['counts']}; output {args.output}")


if __name__=="__main__":
    main()
