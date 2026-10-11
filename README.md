# Growa | Observatorio agrícola de Sinaloa 2003–2025

Aplicación web de consulta sobre producción agrícola municipal de Sinaloa. Basada en el informe **Agricultura de Sinaloa 2003–2025** y sus **Anexos de Auditoría, revisión octubre de 2026**, preparados con registros de cierres agrícolas municipales de DGSIAP.

## Contenido implementado

- **Panorama estatal:** valor nominal, evolución anual 2003–2025, superficie sembrada y cosechada, cultivos principales y distribución entre los 18 municipios de la fuente.
- **Municipios:** perfil de los 18 municipios con serie de valor 2003–2025, cultivos de mayor valor en 2025, comparación 2024–2025 por cultivo, estructura de riego/temporal, ciclos y tecnología.
- **Cultivos y variedades:** los 113 cultivos identificados en la serie municipal 2003–2025, filtro por estado/municipio, series, posición territorial, variedades y modalidad hídrica del cierre 2025.
- **Calidad estadística:** controles de integridad del anexo, alteraciones de catálogo y advertencias metodológicas.
- **Descargas CSV:** series estatales, municipales y de cultivo filtradas directamente desde el navegador.

## Datos integrados en la plataforma

Archivo `data/analysis-pack.b64`: base JSON comprimida con GZIP, codificada en Base64. La aplicación la descomprime localmente al abrir la página. No depende de conexión con una base de datos externa ni de servicios de pago.

| Tabla | Registros |
| --- | ---: |
| Serie estatal anual | 23 |
| Series municipio–año | 414 |
| Series municipio–cultivo–año | 8,217 |
| Registros productivos originales de 2025 | 637 |
| Indicadores municipales de 2025 | 18 |

**Valores originales:** el campo `Valorproduccion` y las columnas de valor de los anexos están expresados en *miles de pesos*. La interfaz divide entre 1,000 para presentarlos en millones de pesos nominales. El valor agregado de 2025 es **49,615.2 millones de pesos**, igual a la cifra del informe.

**Lógica de integridad:** el arranque verifica los cinco conjuntos, sus conteos y que la suma del valor original de 2025 coincida con el total estatal publicado en el anexo. Si falla, el visor no representa cifras parciales.

## Visualización

La aplicación consta de `index.html`, `styles.css`, `app.js` y la carpeta `data/`. Para ejecutar localmente:

1. Clonar/descargar el repositorio.
2. En la raíz, iniciar `python -m http.server 8000`.
3. Abrir `http://localhost:8000`.

Para despliegue estático se puede activar GitHub Pages en **Settings → Pages → Deploy from a branch → main / root**. Requiere navegador moderno con `DecompressionStream('gzip')`.

## Fuentes

- DGSIAP: cierres agrícolas municipales 2003–2025, extraídos, organizados y auditados por el usuario.
- Informe de 395 páginas **Sinaloa_2003_2025_Informe(1).pdf** adjunto al proyecto de ChatGPT; se utiliza como referencia de presentación y criterios de interpretación.
- ZIP **Anexos_Auditoria_Agricultura_Sinaloa_2003_2025_Revision(1).zip**, fuente exacta de los cinco datasets incorporados.

El anexo de auditoría identifica un SHA-256 para la extracción original de Sinaloa. Se consigna en la interfaz pero no se presenta como hash de este paquete comprimido.

## Advertencias estadísticas

- Valor bruto de producción a precios nominales, sin deflactar: no es rentabilidad ni utilidad neta.
- Superficies sumadas por cultivo y ciclo: no representan superficie física única.
- Los 18 municipios corresponden a claves históricas DGSIAP; no se reasignan a Eldorado o Juan José Ríos sin cruce geográfico oficial.
- Se reportan cambios de catálogo en 2020–2021 y el dato de 3 ha siniestradas en 2025 sin corregirlos arbitrariamente.
- Las series por cultivo se agregan por *valor monetario*. No se suman volúmenes físicos cuando las unidades son incompatibles.
- Las comparaciones entre dos años no deben confundirse con relaciones causales.
- La auditoría mostrada es la que acompaña a los anexos, no una revalidación independiente contra sistemas oficiales en línea.

## Preparación de la próxima plataforma web (octubre de 2026)

Esta etapa prioriza **los fundamentos analíticos** antes de rediseñar la interfaz. Se incorporó:

- [Pipeline DGSIAP reproducible](pipeline/dgsiap.py): lee el ZIP de auditoría y genera un JSON con perfiles de los 18 municipios, composición por cultivo, HHI y principales aumentos/contracciones nominales de 2024 a 2025.
- [Resumen municipal listo para consultar](data/municipal-summary-v1.json): contrato compacto y versionado del cierre 2025 con cifras reales.
- [Pruebas de regresión](tests/test_pipeline.py) y [ejecución automática en GitHub Actions](.github/workflows/auditoria-agricola.yml).
- [Metodología y límites de la fuente](docs/METODOLOGIA.md), [contrato de datos](docs/CONTRATO_DATOS.md) y [arquitectura futura](docs/ARQUITECTURA_FUTURA.md).

Para regenerar el análisis sobre el ZIP original (que debe proporcionarse localmente):

```bash
python -m pipeline.dgsiap "/ruta/Anexos_Auditoria_Agricultura_Sinaloa_2003_2025_Revision.zip" --output data/indicators-v1.json
python -m unittest discover -s tests -v
```

**Alcance de validación:** se conciliaron las tablas incluidas en el ZIP proporcionado, pero esto **no equivale a una verificación externa contra los servidores oficiales**. El motor web definitivo, la actualización automática y la vinculación climática siguen pendientes.

## Alcance actual

Esta versión convierte la investigación y los anexos en un **observatorio consultable**. No reproduce automáticamente cada párrafo del informe municipal ni incorpora todavía un sistema editorial para publicar nuevos PDFs, actualización del DGSIAP, mapas con georreferencias o modelos predictivos. Esas funciones requieren una siguiente etapa.

---

Growa · Estudios Económicos Territoriales · Octubre de 2026


## Avances del núcleo analítico — segunda etapa

Se incorporó un generador de productos de datos versionados para una futura aplicación web, **sin cambiar el diseño actual**. Reutiliza el paquete DGSIAP ya almacenado en el repositorio (data/analysis-pack.b64) y permite generar **22 productos JSON**: 18 fichas municipales con detalle por cultivo y 2025, y cuatro índices estatales/de calidad/de cultivos/de catálogos.

- Constructor de la salida: [pipeline/build_web_v2.py](pipeline/build_web_v2.py).
- Validaciones con datos reales: [tests/test_web_v2.py](tests/test_web_v2.py).
- Descomposición económica Shapley: [pipeline/shapley.py](pipeline/shapley.py).
- Comparación con seis resultados del informe: [tests/test_shapley_reports.py](tests/test_shapley_reports.py) y [documentación](docs/SHAPLEY_REPORTES.md).
- [Hallazgos económicos 2025](docs/HALLAZGOS_2025.md).
- [Método y contratos](docs/METODOLOGIA.md) y [arquitectura futura](docs/ARQUITECTURA_FUTURA.md).

### Generación local de los productos

Ejecutar en la raíz del repositorio, con Python 3.11 o posterior:

~~~bash
python -m unittest discover -s tests -v
python -m pipeline.build_web_v2 --output data/api/v2
~~~

El resultado incluye 23 años estatales, fichas de los 18 municipios históricos y series de 113 cultivos. La dimensión variedad/tecnología/ciclo/mercado y las observaciones originales detalladas están disponibles para **2025** únicamente; no deben extrapolarse retrospectivamente.

### Estado de automatización

Se configuró [GitHub Actions](.github/workflows/generar-datos-v2.yml) para ejecutar pruebas y generar los JSON. **Las ejecuciones de GitHub Actions están fallando antes de iniciar los pasos y los logs no estuvieron disponibles en la consulta realizada; por ello la compilación automática y la publicación de data/api/v2 en GitHub NO están confirmadas.** Hasta resolver el servicio de Actions, el generador puede ejecutarse con el comando local anterior. No afirmar que la carpeta está publicada sin verificar su presencia en main.

