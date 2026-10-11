# Descomposición contable del valor agrícola: Shapley

## Por qué se incorporó

El PDF de 395 páginas entregado por el usuario utiliza una descomposición **simétrica de Shapley** en las páginas de cierre municipal / II. El módulo analítico anterior calculaba también una identidad logarítmica. **No son la misma descomposición**: Shapley entrega contribuciones **absolutas en millones de pesos**, mientras la identidad logarítmica entrega cambios en puntos porcentuales logarítmicos.

La plataforma futura deberá mostrar preferentemente el puente Shapley para reproducir las cifras del informe, y mantener la descomposición logarítmica como indicador alternativo debidamente rotulado.

## Definición

Para un cultivo-municipio con unidad física homogénea en ambos cierres:

- A = superficie cosechada (ha).
- Q = volumen de producción (unidades físicas compatibles).
- Y = Q / A = rendimiento agregado.
- P = valor de producción en pesos / Q = precio implícito.
- V = A × Y × P / 1,000,000 = valor bruto en millones de pesos.

A continuación se calcula la variación de V al sustituir sucesivamente A, Y y P de 2024 por los valores de 2025 en **cada una de las seis permutaciones posibles**. Cada efecto Shapley es el promedio de su aportación marginal en esas seis rutas.

La suma de los tres efectos es exactamente el cambio nominal de valor, antes de redondear. Para una base de origen en miles de pesos, P se obtiene multiplicando el valor de origen por 1,000 y dividiendo entre Q.

**Esto no es causalidad.** Los cambios en P pueden mezclar calidades, variedades y mercados; tampoco se observan costos y utilidades. La descomposición devuelve null si hay observaciones ausentes, unidades físicas distintas, superficies no positivas, volumen no positivo o valores no positivos.

## Pruebas frente al informe

Los valores siguientes son contribuciones Shapley en millones de pesos nominales. El reporte publica un decimal; las cifras reproducidas abajo también se redondean a un decimal.

| Municipio y cultivo | Página PDF | Superficie | Rendimiento | Precio implícito | Cambio de valor |
|---|---:|---:|---:|---:|---:|
| Ahome — Frijol | 33 | +845.9 | −79.6 | −195.8 | +570.5 |
| Ahome — Maíz grano | 33 | −1,117.0 | +118.8 | +288.5 | −709.8 |
| Mazatlán — Chile verde | 264 | +138.3 | −4.1 | +75.8 | +209.9 |
| Mazatlán — Mango | 264 | 0.0 | −0.0 | −36.1 | −36.1 |
| Sinaloa (municipio) — Chile verde | 392 | +57.4 | +31.1 | +71.4 | +160.0 |
| Sinaloa (municipio) — Garbanzo grano | 392 | −229.3 | −25.9 | −62.1 | −317.3 |

Los seis pares fueron recalculados contra los CSV del ZIP fuente del usuario y concuerdan con los valores del PDF al redondear a un decimal.

## Implementación

- Código reutilizable: pipeline/shapley.py
- Constructor de salida municipal: pipeline/build_web_v2.py (campo descomposicion_shapley_mdp).
- Pruebas contra los seis casos documentados: tests/test_shapley_reports.py.
- Fuente: series_cultivo_2003_2025.csv de los anexos.

**Pendiente:** contraste contra todas las páginas de cierre / II del PDF, no solo los seis ejemplos controlados. Hasta entonces no afirmar validación exhaustiva del texto publicado.
