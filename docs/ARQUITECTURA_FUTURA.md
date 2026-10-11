# Arquitectura del Observatorio Agrícola de Sinaloa

## Decisión actual

**Primero:** consolidar ciencia de datos, diccionario, validaciones y productos analíticos estables. **Después:** desarrollar la aplicación web final. El HTML experimental existente es una prueba de consulta, no la arquitectura definitiva del producto.

## Estructura de investigación

- **Fuentes observadas:** cierres municipales DGSIAP 2003–2025 y registro 2025, sin cambiar sus categorías.
- **Integridad:** conciliación estatal ↔ municipios ↔ cultivos; conteos de series y esquema; registro de advertencias.
- **Indicadores reproducibles:** cambios nominales, composición por cultivo, concentración monetaria HHI, descomposición contable por precio/rendimiento/superficie.
- **Resultados analíticos:** diagnósticos por municipio, cultivos ganadores/perdedores con comparación válida, anomalías de fuente separadas de cambios reales.
- **Presentación:** primero archivos JSON versionados; luego API y portal.

## Estado de componentes

| Componente | Estado |
|---|---|
| Base histórica estatal, municipal y por cultivo | Disponible en `data/analysis-pack.b64` |
| Interface exploratoria HTML | Existe; NO es el destino definitivo |
| Indicadores municipales de 2025 | Archivo JSON ligero versionado |
| Procesador reproducible de anexos ZIP | `pipeline/dgsiap.py` |
| Tests de lógica de comparación y unidades | `tests/test_pipeline.py` |
| Auditoría de fuentes externas, independiente | Pendiente |
| Infraestructura georreferenciada y mapas | Pendiente |
| Dataset normalizado con agua y NASA POWER | Pendiente, no imputar |
| API backend y persistencia | Por diseñar en etapa web |
| Modelos econométricos y ML en producción | No implementados en este repositorio |

## Esquema provisional para futuros endpoints

Este es un **contrato propuesto**, aún **sin API servida**:

- `GET /api/v1/estado?anio=2025`: total, superficies, concentración municipal, trazabilidad.
- `GET /api/v1/municipios`: catálogo de 18 claves históricas.
- `GET /api/v1/municipios/{id}?anio=2025`: perfil económico municipal, serie y calidad.
- `GET /api/v1/cultivos?municipio={id}&anio=2025`: especies, variedades y modalidades.
- `GET /api/v1/series?municipio={id}&cultivo={clave}`: historial de valor y superficies.
- `GET /api/v1/auditoria`: controles efectuados, advertencias y metadatos de fuentes.

En la primera página web bastará el JSON estático y el dataset existente. Neon/Render o una API solo serán necesarios para cargar datos más grandes, actualizaciones automatizadas, autenticación o cálculos persistentes.

## Secuencia de trabajo

1. Integrar y mantener la conciliación de todos los años (implementado).
2. Definir API/data contracts y versionar resultados por municipio (parcial).
3. Auditar las conclusiones del informe por municipio y explicar límites de cada afirmación.
4. Incorporar detalle por **cultivo → variedad → ciclo → riego/temporal**, conservando las unidades originales.
5. Incorporar factores externos (clima, agua, costos) solo después de una unión espacial y temporal explícita y validada.
6. Diseñar la interfaz web definitiva: selector territorial, fichas, series comparables, indicadores y descargas.
7. Ejecutar pruebas de usabilidad, rendimiento, seguridad, reproducibilidad y contraste con fuentes oficiales antes de una publicación institucional.

## Qué no debe hacerse

- Construir una interfaz atractiva a partir de estadísticas de ejemplo o de datos inventados.
- Mostrar rendimientos agregados entre unidades heterogéneas.
- Atribuir descensos de valor a sequía, precios o costos sin bases complementarias.
- Confundir productos ausentes en un año con producción cero.
- Publicar fechas/hashes de auditorías de origen como si fueran certificaciones nuevas.
