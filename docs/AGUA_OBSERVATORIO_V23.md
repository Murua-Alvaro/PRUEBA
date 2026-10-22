# Observatorio del Agua · interfaz institucional

Se reemplaza la presentación del visor por un espacio de consulta institucional con navegación temática azul profundo, cabecera contextual, mapa ampliable, tablas ordenables, fichas técnicas y biblioteca de descargas. El inspector se abre al seleccionar un registro y puede cerrarse para ampliar el área de análisis.

Se incorporan al visor los archivos ya presentes en el proyecto: 210 presas nacionales, 6,095 observaciones de calidad de 223 sitios de Sinaloa, 1,018 observaciones mensuales y 30,652 diarias de tres presas de Jalisco. Se mantienen riego, acuíferos, clima, tendencias y los cortes parciales de Sinaloa de V9. No se agregan registros REPDA. Las cuencas siguen siendo metadatos, sin polígonos inventados.

Las gráficas separan estado y clave, permiten seleccionar la serie y cortan las líneas ante intervalos sin observación. No se agregan volúmenes de presas diferentes. Los valores nulos y censurados se conservan; las observaciones de calidad no reciben fechas ni clasificaciones normativas. El catálogo nacional mantiene las entidades faltantes como no reportadas, excepto claves vinculadas exactamente con el inventario territorial V9. La fuente nacional secundaria no constituye un nuevo censo oficial.

Construcción: `python3 scripts/build-water.py`, seguido del copiado de recursos agrícolas definido en render.yaml. Este script mantiene sincronizados el código y los estilos embebidos en index.html, necesarios para la versión existente. Los JSON completos siguen en dist/agua.

Verificación: análisis sintáctico JS; pruebas de adaptación e integridad con datos reales en tests/agua-observatory-v23.test.cjs; revisión en navegador del atlas, navegación, frecuencia diaria y mensual, filtros anuales, ordenamiento y apertura de fichas. Las 43 pruebas Python ejecutan 42 correctamente; la prueba antigua test_no_new_backend_or_external_tracking falla por un fetch ya existente en app.js (archivo sin modificaciones en este cambio). No se alteró esa prueba. No se completó una revisión visual en un dispositivo móvil.

Publicación: el servicio Render tiene despliegue automático desactivado. Un commit en GitHub no cambia por sí solo la página pública; se necesita confirmar el espacio de trabajo y ejecutar el despliegue correspondiente.
