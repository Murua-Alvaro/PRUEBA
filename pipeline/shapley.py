"""Exact three-factor Shapley decomposition of observed nominal agricultural value.

V (million MXN) = harvested hectares × yield (unit/ha) × implicit
price (MXN/unit) / 1_000_000.

The source DGSIAP Valorproduccion is expressed in THOUSANDS of pesos.
The Shapley decomposition averages all six factor-update orders; it
distributes the cross-factor interaction symmetrically and adds exactly
to the observed value difference. It is an ACCOUNTING IDENTITY, not
causal attribution.

Requires physical unit compatibility and strictly positive components.
"""
from __future__ import annotations

from itertools import permutations
from math import isfinite


FACTORS = ("superficie","rendimiento","precio_implicito")


def _number(row: dict, key: str) -> float:
    return float(row[key])


def shapley_bridge(previous: dict | None, current: dict | None) -> dict | None:
    if previous is None or current is None:
        return None
    if previous["Nomunidad"].casefold()!=current["Nomunidad"].casefold():
        return None
    old_area,new_area=_number(previous,"Cosechada"),_number(current,"Cosechada")
    old_volume,new_volume=_number(previous,"Volumenproduccion"),_number(current,"Volumenproduccion")
    old_value,new_value=_number(previous,"Valorproduccion"),_number(current,"Valorproduccion")
    if not all(isfinite(v) and v>0 for v in
               (old_area,new_area,old_volume,new_volume,old_value,new_value)):
        return None
    old={
        "superficie":old_area,
        "rendimiento":old_volume/old_area,
        "precio_implicito":1000*old_value/old_volume,
    }
    new={
        "superficie":new_area,
        "rendimiento":new_volume/new_area,
        "precio_implicito":1000*new_value/new_volume,
    }
    def gross_value_million(values):
        return values["superficie"]*values["rendimiento"]*values["precio_implicito"]/1_000_000
    effects={factor:0.0 for factor in FACTORS}
    for order in permutations(FACTORS):
        current_point=old.copy()
        for factor in order:
            before=gross_value_million(current_point)
            current_point[factor]=new[factor]
            effects[factor]+=(gross_value_million(current_point)-before)/6.0
    observed=(new_value-old_value)/1000.0
    if abs(sum(effects.values())-observed)>max(1e-7,abs(observed)*1e-10):
        raise ArithmeticError("Shapley contributions do not reconcile")
    return {
        **{factor:round(effects[factor],5) for factor in FACTORS},
        "cambio_observado_mdp":round(observed,5),
        "unidad":current["Nomunidad"],
        "metodo":"Shapley simetrico, 6 ordenes; descomposicion no causal",
    }
