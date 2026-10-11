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

## Alcance actual

Esta versión convierte la investigación y los anexos en un **observatorio consultable**. No reproduce automáticamente cada párrafo del informe municipal ni incorpora todavía un sistema editorial para publicar nuevos PDFs, actualización del DGSIAP, mapas con georreferencias o modelos predictivos. Esas funciones requieren una siguiente etapa.

---

Growa · Estudios Económicos Territoriales · Octubre de 2026
