# Contrato de datos v1.0.0

## Archivos existentes

- `data/analysis-pack.b64`: JSON comprimido (GZIP) y codificado en Base64. Paquete exploratorio histórico. Su carga requiere descompresión local.
- `data/municipal-summary-v1.json`: datos municipales listos para consulta. Estructura de objeto: `schema_version`, `fuente`, `fecha_corte`, `valor_unidad`, `metodologia`, `campos`, `filas`.

En el resumen municipal, la tabla es compacta y sus filas se interpretan **por posición según `campos`**; nunca deben interpretarse índices a mano sin verificar el esquema. Los valores monetarios se expresan en **millones de pesos nominales**. El HHI oscila entre 0 y 1; a mayor HHI, mayor concentración del valor observado entre cultivos, sin implicar causalidad ni juicio de rentabilidad.

## Salida reproducible del procesamiento

Ejecutar desde la raíz del repositorio:

```bash
python -m pipeline.dgsiap "Anexos_Auditoria_Agricultura_Sinaloa_2003_2025_Revision.zip" --output data/indicators-v1.json
python -m unittest discover -s tests -v
```

El archivo ZIP original es un **insumo externo** y NO se sube de forma automática al repositorio. El script detiene la ejecución si los conteos o la conciliación monetaria no son consistentes.

`indicators-v1.json` está diseñado para una API futura y contiene `scope`, `validation`, `municipalities` y `methodology`. En `municipalities` incluye valores 2024/2025, cambios nominales, principales cultivos y contribuciones, concentración HHI y descomposición logarítmica descriptiva cuando es identificable.

**Diferenciar:** `delta_million` es cambio absoluto en millones; `change_percent` es variación aritmética porcentual; `price_yield_area_log_pct` son puntos porcentuales logarítmicos, NO porcentajes de crecimiento convencionales.

## Control de versiones

Las rutas nuevas deberán usar versiones (`-v1`, `-v2`) si cambian columnas, reglas de agregación o definición del indicador. Nunca sobrescribir los datos observados sin preservar su fuente ni sustituir 18 municipios históricos por una cartografía reciente sin correspondencia documentada.
