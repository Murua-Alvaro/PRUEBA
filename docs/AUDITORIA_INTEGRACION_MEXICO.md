# Auditoría de integración — Agricultura de México 2003–2025
**Fecha:** 11 de octubre de 2026
**Objeto:** comprobar la correspondencia de los datos y las fichas de la sección «México» del observatorio Growa con el informe *Agricultura de México 2003–2025: estructura, trayectorias y cambio territorial*, 115 páginas.

## Alcance real
Esta revisión compara la **transcripción digital** y su lógica de navegación con **cuadros e interpretaciones publicados en el PDF**. No es una nueva auditoría de las 879.785 filas del ZIP nacional original. Ese archivo todavía no se ha incorporado al repositorio agrícola. En consecuencia, la sección México muestra los diez cultivos, estados y municipios seleccionados por el documento, no un buscador exhaustivo de las 32 entidades y los 2.452 municipios históricos declarados.

## Controles principales de integración
- **Cuadro de selección, página 18:** diez cultivos con variación de cuota calculada como diferencia entre el promedio anual 2023–2025 y el de 2003–2005. Se verifican el signo, la magnitud y el valor bruto nominal del cierre 2025.
- **Perfiles de cultivos, páginas 19–68:** diez capítulos de cinco páginas. La nueva ficha agrega los tres estados líderes y las principales variedades con valores extraídos de los cuadros de estructura de las páginas 21, 26, 31, 36, 41, 46, 51, 56, 61 y 66. Las categorías varietales no necesariamente equivalen a variedades genéticas.
- **Estados, páginas 69–71 y 77–86:** cinco mayores aumentos y cinco mayores reducciones de cuota nacional, con diez fichas descriptivas y participación de sus tres cultivos líderes.
- **Municipios, páginas 73–75 y 87–96:** cinco mayores aumentos y reducciones de participación, con diez fichas descriptivas y concentración en sus tres cultivos líderes. Las unidades territoriales no se asumen geográficamente constantes.
- **Auditoría, páginas 10 y 113:** existen **dos criterios diferentes** de discrepancia monetaria, que no deben confundirse: 79 registros fuera de la tolerancia definida en la auditoría del paquete y 115 casos de error relativo superior al 1 % en la verificación independiente (de los cuales 58 superan el 5 %). El PDF también informa cuatro repeticiones dimensionales adicionales (ocho filas involucradas) y dos registros de superficie cosechada mayor que sembrada.
- **Conciliación oficial descrita en la página 114:** el informe señala que contrastó 23 archivos anuales municipales de DGSIAP, con diferencias máximas nacional-anuales de 7.327,10 pesos. **No se ha reproducido ese contraste en esta actualización web**.
- **Cobertura, páginas 5 y 115:** el catálogo observable cae a 78 cultivos tanto en 2020 como en 2021. Es una ruptura de cobertura; no se imputa producción cero ni se atribuye a una contracción productiva automática.

## Comprobaciones de consistencia realizadas
1. Diez filas de cada ranking nacional, sin duplicación de nombres.
2. Identidad aritmética entre cuotas iniciales, finales y diferencias dentro de la precisión de publicación (hasta 0,015 puntos porcentuales para los cultivos).
3. Los montos de los tres líderes por cultivo, estado y municipio no superan el valor de su agregado.
4. La participación calculada de los tres cultivos estatales y municipales coincide con la cuota publicada dentro de 0,16 puntos porcentuales, compatible con el redondeo a un decimal.
5. Cruce territorial entre Sinaloa (49.615,2 millones de pesos) y Guasave (8.333,3 millones de pesos), consistente con los agregados del cierre de Sinaloa.
6. Se corrigió un error de ámbito JavaScript que impedía acceder a las tablas suplementarias de cultivos dentro del módulo nacional. Tras el ajuste, se verificó la evaluación del módulo con elementos de interfaz simulados y la generación de todos sus paneles.

## Distinciones metodológicas esenciales
Los valores se expresan en pesos nominales. Las cuotas se comparan frente al total nacional observado, no frente a un deflactor. Un cultivo o municipio que pierde cuota no necesariamente reduce su valor nominal, volumen o rentabilidad. Los volúmenes con unidades físicas distintas no deben sumarse. El informe nacional advierte que el grupo de **Chile (verde y seco)** reúne clasificaciones distintas, y que el municipio de Ensenada no conserva límites constantes por la creación de San Quintín.

## Mejoras integradas en el sitio
- Información ampliada de las tres entidades líderes y principales variedades de cada uno de los diez cultivos.
- Paneles individuales con concentración de los tres cultivos líderes para los diez estados y municipios seleccionados.
- Descarga CSV de los tres rankings, con referencias a páginas del informe.
- Diferenciación explícita de la auditoría original y la independiente.
- Pruebas de regresión en `tests/test_national_report.py` para mantener cifras, dimensiones y referencias comparables entre versiones.

## Pendientes
1. Recibir e inspeccionar el ZIP nacional original con los 32 CSV por entidad y sus manifiestos. Su incorporación permitiría verificar los 879.785 registros y construir series históricas consultables de todas las entidades y municipios.
2. Reconciliar nomenclaturas y unidades, especialmente para Chile (verde y seco), alfalfa, fresa y pastos.
3. Realizar contrastación independiente con la extracción oficial DGSIAP, incluidas las dos discrepancias físicas identificadas en la página 114.
4. Validar la interfaz final en un navegador real en entorno público, además de pruebas de lógica y publicación de Render.

**Dictamen de esta etapa:** la versión web presenta y cruza los principales resultados publicados en el informe; no debe anunciarse como un banco nacional completo ni como una nueva auditoría independiente de los registros fuente.
