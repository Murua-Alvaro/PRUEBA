# Hallazgos del cierre agrícola de Sinaloa, 2025

**Fuente:** anexos DGSIAP Sinaloa 2003–2025 aportados en octubre de 2026. **Criterio:** elaboración sobre los archivos recibidos, no verificación externa en los servidores de origen. Todos los importes son millones de pesos corrientes.

## Balance estatal

| Indicador | 2024 | 2025 | Variación |
|---|---:|---:|---:|
| Valor bruto nominal, millones MXN | 58,818.03 | 49,615.22 | −15.65 % |
| Superficie sembrada, ha por cultivo/ciclo | 767,965.57 | 700,021.18 | −8.85 % |
| Superficie cosechada, ha por cultivo/ciclo | 739,994.52 | 691,717.04 | −6.52 % |
| Cultivos presentes en registro | 71 | 61 | −10 |
| Superficie siniestrada reportada, ha | 21,509.91 | 3.00 | Requiere verificar cobertura |

No interpretar las superficies sumadas como extensión física única. La variación del valor está expresada en pesos nominales y no representa variación real ni rentabilidad.

## Principales cultivos de 2025

| Cultivo | Valor, M$ | Participación |
|---|---:|---:|
| Maíz grano | 13,213.42 | 26.63 % |
| Chile verde | 7,664.83 | 15.45 % |
| Frijol | 5,011.79 | 10.10 % |
| Papa | 4,766.13 | 9.61 % |
| Tomate rojo (jitomate) | 3,701.39 | 7.46 % |

Los tres primeros aportan **52.18 %** del valor bruto agrícola estatal de 2025. **Culiacán, Guasave y Ahome** reúnen **50.34 %** del valor estatal.

## Estructura reportada en 2025

| Dimensión | % del valor bruto |
|---|---:|
| Riego | 94.01 % |
| Temporal | 5.99 % |
| Otoño–Invierno | 85.18 % |
| Perennes | 12.50 % |
| Primavera–Verano | 2.32 % |
| Mercado de exportación, según la categoría de la fuente | 13.89 % |
| Mercado nacional | 86.11 % |
| Cielo abierto | 87.98 % |
| Invernadero | 2.95 % |
| Malla sombra | 9.07 % |

Se trata de cuotas del **valor**, no de superficie hídrica, eficiencia técnica, utilidad o desempeño causal.

## Mayores diferencias nominales 2024–2025 por cultivo

Solo se muestran cultivos observados en ambos cierres; no se sustituyen ausencias por valores cero.

| Cultivo con aumento | M$ | Cultivo con contracción | M$ |
|---|---:|---|---:|
| Frijol | +1,026.29 | Tomate rojo (jitomate) | −4,286.46 |
| Arándano | +321.71 | Maíz grano | −2,191.09 |
| Caña de azúcar | +207.24 | Pepino | −1,149.66 |
| Cacahuate | +170.10 | Chile verde | −716.77 |
| Elote | +152.50 | Papa | −573.64 |

**Interpretación:** estas son contribuciones contables al cambio del valor bruto, NO explicaciones causales.

## Mayores cambios municipales

| Contracciones nominales | M$ | Variación |
|---|---:|---:|
| Escuinapa | −2,342.33 | −54.57 % |
| Angostura | −1,744.43 | −50.46 % |
| Elota | −1,419.36 | −35.74 % |
| Guasave | −1,216.07 | −12.73 % |

| Incrementos nominales | M$ | Variación |
|---|---:|---:|
| Rosario | +408.51 | +17.10 % |
| Mazatlán | +374.57 | +43.59 % |
| Salvador Alvarado | +303.82 | +41.31 % |
| Choix | +302.86 | +231.61 % |

Una tasa alta con base monetaria pequeña no supone necesariamente un incremento absoluto mayor.

## Alertas metodológicas

1. La serie municipio-cultivo llega a 2003–2025 y cuenta con **113 cultivos históricos**. El detalle por variedad/ciclo/tecnología/mercado/agua procede de **637 observaciones originales del cierre 2025**; no se debe presentar ese detalle como histórico.
2. El catálogo presenta 63 cultivos en 2019, 35 en 2020 y 38 en 2021. Se debe corroborar si el cambio refleja cobertura, nomenclatura o un fenómeno productivo antes de asignar causas.
3. El registro de **3 ha siniestradas en 2025** se preserva, pero requiere contraste oficial independiente antes de realizar inferencias sobre pérdidas agrícolas.
4. Las 18 claves municipales son históricas. No reasignar automáticamente a nuevas demarcaciones municipales sin una tabla de correspondencia oficial.
5. Los valores son nominales; no existen aquí costos individuales de producción, márgenes, deflactores ni un conjunto integrado de NASA POWER que permita identificar causas.
6. Las pruebas de tablas cruzadas se realizan localmente, pero los controles reportados por los anexos NO son una auditoría externa renovada.

## Archivos de trabajo

- Paquete fuente incorporado: data/analysis-pack.b64.
- Validación de tablas originales: pipeline/dgsiap.py.
- Constructor de contratos estáticos para la futura web: pipeline/build_web_v2.py.
- Pruebas integradas: tests/test_web_v2.py.
- Productos derivados a generar: data/api/v2/.
- Informe original: 395 páginas, con inicio y cierre de cada capítulo municipal indexados en el constructor.

La generación automática de la salida debe confirmarse por una ejecución exitosa, no por la mera presencia de un script en el repositorio.
