# GROWA Agua · Diseño institucional V10

**Proyecto:** observatorio agrícola `Murua-Alvaro/PRUEBA`  
**Alcance:** modernización de la sección Agua, sin reemplazar las páginas agrícolas existentes.  
**Fecha de integración:** 13 de octubre de 2026.

## Principios del diseño

El diseño traduce tres patrones de portales de información hídrica: mapas y leyendas explorables (USGS National Water Dashboard), análisis comparativo por indicador y ubicación (WRI Aqueduct) y separación entre información geográfica, estadística y documental (SINA/CONAGUA). No replica su identidad gráfica ni inventa datos.

Se privilegia un **entorno de trabajo** con navegación en ocho vistas, panel de cobertura, controles persistentes por estado, mapas de infraestructura, tabla vinculada y fichas individuales, series históricas e indicadores con unidades explícitas. Los componentes se adaptan a escritorio, tableta y móvil; el usuario puede descargar CSV, copiar un vínculo filtrado e imprimir o guardar una vista como PDF desde el navegador.

## Arquitectura

- `index.html`: sección `#panel-agua`, cabecera, controles y navegación.
- `agua.js`: carga de V9, exploración, mapa Leaflet, indicadores, comparador, filtros y CSV.
- `agua.css`: estilos base de compatibilidad.
- `agua-pro.css`: dirección visual final, responsive y estilos de impresión.
- `data/agua-v9.json`: subconjunto de datos V9 para consulta web (no copia total de la base SQLite).
- `render.yaml`: build estático incluye archivos del módulo.
- `tests/agua-integracion.test.cjs`: control de estructura, series, inventarios, sintaxis y build.

## Vistas y utilidad

1. **Panorama:** indicadores, series de riego y clima, tabla multie­statal, notas metodológicas.
2. **Explorador geográfico:** presas georreferenciadas, búsqueda, umbral de capacidad NAMO, selección mapa–tabla, ficha y almacenamiento histórico cuando existe.
3. **Acuíferos:** recarga, volumen VEAS, disponibilidad media anual, filtro por signo del balance, lista ordenable conceptualmente, fórmula DMA = R − DNC − VEAS.
4. **Cuencas y caudales:** 757 registros nacionales y catálogo de estaciones; se explica la ausencia de polígonos oficiales validados y mediciones históricas descargadas.
5. **Series históricas:** riego por ciclo y clima por año calendario, tendencias Theil–Sen / Kendall con q FDR.
6. **Comparador:** dos estados, cuatro indicadores, año o ciclo, diferencia observada y exportación del panel comparado.
7. **Calidad:** sitios sinaloenses recuperados, búsqueda y pH descriptivo, **sin tendencia histórica** ni inferencia sanitaria.
8. **Metodología:** fichas de las fuentes y límites de interpretación.

## Temporalidad y límites

- Riego: observaciones de 1997/98 a 2023/24, distribuciones brutas, no consumo efectivo agrícola.
- Clima: 2003–2025, promedios municipales, no sequía oficial ni estrés hídrico normativo.
- Presas: inventario transversal de cinco estados; Jalisco conserva 1000 de 1018 registros mensuales en la **edición web** y Sinaloa mantiene cortes individuales y la serie parcial del sistema de cuatro presas.
- Acuíferos: balances de corte único, sin cotejo normativo nacional exhaustivo.
- Cuencas: catálogo 2020, sin geometrías verificadas por entidad en esta edición.
- Calidad: Sinaloa, registros de sitio sin fecha de muestreo certificada.
- Caudales: sin históricos diarios descargados en la V9.

Las capacidades NAMO **nunca** se presentan como almacenamiento real ni se asignan a municipios. No se muestran inventarios como series. Los datos ausentes se presentan como ausentes.

## Validación y publicación

Ejecutar desde el repositorio:
```bash
node tests/agua-integracion.test.cjs
```
Render está configurado como **despliegue automático desactivado**. Los commits en GitHub **no actualizan el sitio público** hasta que se ejecute y confirme un despliegue en el servicio correspondiente. El build debe copiar `agua-pro.css`, `agua.js`, `agua.css` y `data/agua-v9.json` a `dist/`.

## Fuentes de referencia para el diseño

- USGS National Water Dashboard: https://dashboard.waterdata.usgs.gov/
- WRI Aqueduct Water Risk Atlas: https://www.wri.org/aqueduct
- SINA/CONAGUA: https://app.conagua.gob.mx/sistemasdeagua/
