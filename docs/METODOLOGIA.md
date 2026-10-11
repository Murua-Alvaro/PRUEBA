# Metodología y control estadístico — Agricultura de Sinaloa, 2003–2025

**Estado:** fuente documental y tablas de auditoría facilitadas en octubre de 2026; las cifras NO se han cotejado externamente con una extracción independiente de DGSIAP.

## Fuentes y unidades

El análisis utiliza los anexos del informe *Agricultura de Sinaloa 2003–2025*:
- Serie estatal: 23 años (2003–2025).
- Serie municipio-año: 414 filas (18 claves históricas × 23 años).
- Serie municipio-cultivo-año: 8,217 filas.
- Cierre 2025: 637 observaciones, 61 cultivos y 18 claves municipales.
- Auditoría histórica declarada: 15,276 observaciones y 23 columnas originales.

En los CSV de origen, **Valorproduccion y value se expresan en miles de pesos**; los indicadores publicados en millones de pesos usan exactamente valor_origen / 1,000. Todas las cantidades monetarias están expresadas a **precios corrientes**. No se deben interpretar variaciones nominales como variaciones reales. Valor de producción bruto no es margen, utilidad, flujo de caja ni ingreso neto del productor.

Sembrada, Cosechada y Siniestrada se expresan en hectáreas registradas por cultivo y ciclo. Su suma NO equivale a suelo físico único. Los volúmenes NO se agregan indiscriminadamente entre cultivos/unidades. El cierre 2025 presenta unidades Tonelada y Planta.

## Cifras de control 2025

| Indicador | Dato del anexo |
|---|---:|
| Valor agrícola nominal | 49,615.22054 millones MXN |
| Superficie sembrada, suma por cultivo/ciclo | 700,021.18 ha |
| Superficie cosechada, suma por cultivo/ciclo | 691,717.04 ha |
| Filas del cierre | 637 |
| Cultivos distintos | 61 |
| Municipios históricos con registros | 18 |

## Validaciones ejecutadas de manera independiente sobre el ZIP recibido

1. Existencia de las cinco tablas requeridas y conteos de filas esperados.
2. Integridad de la serie estatal de 2003 a 2025 sin saltos.
3. Ausencia de duplicados de claves (municipio, año) y (municipio, cultivo, año) en las tablas consolidadas.
4. Conciliación anual del valor estatal contra la suma municipal y la suma municipio-cultivo, con tolerancia de **0.10 miles de pesos** por redondeo tabular.
5. Conciliación del valor de las 637 filas originales de 2025 contra el estatal y contra cada indicador municipal de 2025.
6. Conservación de la población declarada en el anexo (15,276 filas).

Estas pruebas sí se ejecutan en `pipeline/dgsiap.py`. Los controles adicionales listados en `auditoria_integridad.json` (nulos, duplicados exactos del conjunto completo, rendimientos, valor implícito) son **resultados reportados por el anexo**. No afirmamos haber vuelto a ejecutar esos controles sobre 15,276 filas originales, porque ese archivo íntegro no se almacena en el repositorio.

## Indicadores derivados

- **Variación interanual nominal**, municipio: `100 × (V_2025 / V_2024 - 1)` cuando `V_2024 > 0`.
- **Participación de cultivo en municipio**, `100 × V_m,c / V_m`.
- **HHI por valor de cultivo**: suma de cuadrados de las participaciones de cultivos en el valor municipal 2025. Mide concentración monetaria observada; NO competencia, margen ni eficiencia.
- **Ganancias/pérdidas por cultivo (M$)**: `V_m,c,2025 - V_m,c,2024` únicamente si hay registros de ambos años. Si no hay registro en uno de los años se indica sin comparación; **ausencia de registro no es un cero**.
- **Descomposición contable del cambio de valor nominal**, solo para cultivo-municipio con igual unidad, superficies/volúmenes y valores positivos en ambos cierres. Se utiliza la identidad `V = A × (Q/A) × (V/Q)`, donde A es superficie cosechada, Q el volumen, y V/Q el precio implícito. Los aportes se expresan como `100 × ln(ratio)`. Estos aportes suman el cambio logarítmico de V por construcción matemática. **No identifican causalidad** climática, tecnológica o de precios de mercado.

Todas las vistas, el análisis del informe y los futuros reportes deben diferenciar descripción, identidad contable y modelos causales.

## Alertas que deben mantenerse visibles

- **2020–2021:** cambios en el número de cultivos reportados; evitar atribuirlos automáticamente a desapareción/creación de cultivos.
- **2025:** el total registrado de superficie siniestrada es de 3 ha; conservar el dato con advertencia, no imputarlo arbitrariamente.
- **Municipios:** se utilizan las 18 claves históricas de la fuente, sin reasignaciones automáticas a Eldorado y Juan José Ríos.
- **Alcance documental:** el PDF adjunto tiene **395 páginas**, mientras que `resumen.txt` del ZIP dice **359**. Hasta conciliar las versiones no se debe emplear ese resumen como número definitivo de páginas.
- No extrapolar condiciones climáticas, costos, seguridad hídrica o rentabilidad con datos que no figuran en la serie DGSIAP.

## Referencias de trabajo

- Informe PDF original aportado por el usuario: *Sinaloa 2003–2025 — Informe*.
- Paquete de anexos: *Anexos Auditoría Agricultura Sinaloa 2003–2025 — Revisión*.
- `pipeline/dgsiap.py`: lectura, conciliación y perfiles derivados.
- `data/analysis-pack.b64`: paquete consolidado actual para la interfaz experimental.
- `data/municipal-summary-v1.json`: resumen ligero de 18 municipios para futuros consumidores de datos.

La publicación debe citar DGSIAP y distinguir claramente *elaboración estadística propia sobre los anexos recibidos* de *auditoría independiente de las fuentes oficiales*.
