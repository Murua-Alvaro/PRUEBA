# GROWA AGRICULTURA / LABORATORIO DE ANÁLISIS
**Versión:** octubre 2026 · Fuente: DGSIAP / anexos originales de Sinaloa.

## Propósito
Complementar los exploradores de **Estados** y **Cultivos** con un entorno analítico multidimensional. La interfaz permite combinar hasta 18 municipios, 113 cultivos históricos, un intervalo de 2003–2025 y el indicador de interés, sin construir informes ficticios.

## Base integrada y universo estadístico
- **Sinaloa:** 23 cierres (2003–2025), 18 municipios, 8.217 registros históricos agregados municipio–cultivo–año, y 637 registros de cierre 2025 con variedad, modalidad de agua, ciclo, tecnología, producción y destino de mercado. Los agregados estatales por año se concilian con la suma de registros por municipio y cultivo.
- **México:** los resultados nacionales siguen siendo diez cultivos y diez estados/municipios destacados del informe PDF, no los aproximadamente 879.785 microregistros del ZIP nacional. El Laboratorio **no incorpora otros estados como si tuvieran series históricas disponibles**.

## Vistas implementadas
1. **Evolución:** agregación del indicador elegido por año; sin imputar años ausentes; alternancia gráfica/tabla y exportación CSV.
2. **Comparar:** municipio o cultivo, hasta cuatro series, escalas absolutas o índice base 100. El año base de cada serie es la primera observación positiva en el intervalo; pueden diferir entre comparados.
3. **Tabla dinámica:** filas y columnas configurables entre municipio, cultivo y año, porcentaje por fila/columna para indicadores aditivos, y exportación completa más allá de la vista previa.
4. **Estructura económica:** índice HHI de concentración de valor por cultivo y municipio, cultivos efectivos (1/HHI), y cociente de localización LQ frente a toda la producción de Sinaloa para el mismo año.
5. **Descomposición:** Shapley con seis permutaciones de superficie, rendimiento físico y precio unitario implícito, para un solo cultivo con unidad física homogénea y datos positivos en ambos años.
6. **Detalle 2025:** cruce de ocho dimensiones (municipio, cultivo, variedad, modalidad, ciclo, tecnología, producción, mercado), filtros categóricos, selección de indicador, tabla dinámica y descarga de filas originales seleccionadas.

## Metodología y fórmulas
El valor nominal se expresa en millones de pesos (MDP); el reporte original utiliza miles de pesos. Superficie sembrada/cosechada/siniestrada está en hectáreas. El volumen físico usa la unidad publicada.

**Concentración municipal:**
HHI(m,t) = Σ_c [V(m,c,t) / Σ_j V(m,j,t)]². Está acotado entre 0 y 1 para valores no negativos; la diversidad efectiva es 1/HHI. Si se filtran cultivos, describe solamente ese conjunto, no toda la economía municipal.

**Especialización territorial:**
LQ(m,c,t) = [V(m,c,t)/V(m,t)] / [V(Sinaloa,c,t)/V(Sinaloa,t)]. El denominador se calcula con toda la base estatal correspondiente al año, no solamente los cultivos filtrados. LQ mayor que uno refleja especialización relativa, no necesariamente una ventaja competitiva o mayor productividad.

**Descomposición multiplicativa:**
V = A × (Q/A) × (V/Q) = A × Y × P.
La contribución de cada factor se calcula como el promedio de su contribución marginal en las 3! = 6 permutaciones posibles. La suma de contribuciones debe conciliar exactamente con ΔV (salvo error de coma flotante). No equivale a una estimación causal de efectos de precio, rendimiento ni área.

**Control de compatibilidad:** los indicadores de volumen y rendimiento solo se permiten cuando el universo filtrado contiene una misma unidad de origen. Rendimiento se calcula como volumen agregado/superficie cosechada agregada, no sumando rendimientos individuales. No se ofrecen participaciones sobre rendimientos, porque las tasas no son agregados aditivos. Los años sin registro muestran «—» en tablas, nunca un cero imputado.

## Persistencia, enlaces y exportación
- Las consultas guardadas se almacenan localmente en el navegador (máximo 20) y no se sincronizan entre equipos.
- Los enlaces compartibles incorporan la definición de consulta en el parámetro `lab`. No contienen información personal adicional.
- Los CSV de series, tablas dinámicas, registros históricos y cierre 2025 reflejan la selección actual y se calculan en el navegador.

## Controles de calidad
- La suma por año de las 8.217 filas municipio–cultivo reproduce los 23 totales estatales; en la auditoría local la máxima diferencia fue menor que 0,0000001 MDP.
- Los 637 registros de 2025 suman **49.615,22054 MDP**, idéntico al cierre estatal.
- Para 2025 los 18 índices HHI se mantienen aproximadamente entre **0,164 y 0,473**, dentro del intervalo matemático esperado.
- La descomposición Shapley de maíz grano en Sinaloa, 2003 frente a 2025, recupera un ΔV nominal de **9.394,71433 MDP**, con residuo numérico prácticamente nulo.
- Se añadieron `tests/test_quant_lab.cjs` y la comprobación estática de rutas, IDs y JavaScript; pruebas de componente con DOM simulado verificaron las seis vistas.
- La validación visual completa en navegador público y una auditoría independiente contra archivos originales del DGSIAP siguen siendo tareas distintas que **no se consideran terminadas**.

## Próximas ampliaciones
1. Incorporar y auditar ZIP nacional completo por entidad, municipio, cultivo y variedad.
2. Migrar a API tipada con PostgreSQL/Neon, agregados materializados y filtros paginados; separar `app.js`, el motor de consultas y componentes de interfaz.
3. Vincular cartografía municipal INEGI y mapas interactivos. No representar agregados municipales como puntos de parcela.
4. Conectar series oficiales de clima, agua, riego y deflactores; documentar cobertura temporal y unidades.
5. Permitir reportes reproducibles con metadatos, fuente, consulta, fecha de generación y diagnósticos económicos.


## Actualización institucional — octubre de 2026
La plataforma adopta identidad editorial **Growa Agricultura**, con colores azul petróleo, verde azulado y acentos arena, retícula estable y tipografía de lectura. Se presenta explícitamente como herramienta **independiente de apoyo al análisis para instituciones públicas**, no como sistema oficial de una dependencia.

### Consultas orientadas a decisiones
Se añaden cuatro acciones funcionales (no botones decorativos):
1. **Concentración territorial:** abre HHI en 2025 para estudiar la dependencia municipal de cultivos.
2. **Comparación de municipios:** abre hasta cuatro series temporales normalizadas como índice base 100.
3. **Cambio del valor productivo:** selecciona maíz grano y prepara descomposición Shapley de superficie, rendimiento y precio implícito.
4. **Organización de la producción:** abre el detalle 2025 para categorías de variedad, modalidad de agua, ciclo, tecnología, producción y mercado.

Cada acción prepara el modelo ya existente y permite modificar los filtros posteriormente.

### Ficha técnica imprimible
La consulta cuenta con una ficha generada en el navegador con rango de años, municipios/cultivos seleccionados, observaciones, valor nominal, variación cuando existe comparación válida, distribución territorial y por cultivo, fuente y advertencias. El botón **«Imprimir o guardar PDF»** invoca la impresión estándar del navegador para generar un documento de apoyo institucional. No genera una resolución oficial ni atribuye causalidad.

### Control de ausencia de datos
Se retiran de los indicadores las abreviaturas «s/d», «s/r» y «n/d» y los valores «Sin comparación». Las medidas sin registro no generan tarjeta; las celdas inexistentes en tablas dinámicas permanecen vacías sin convertirse en cero. Las explicaciones de cobertura se mantienen en notas de método cuando resultan necesarias. No se imputan datos.

### Revisión de botones y accesibilidad
Se corrige la apertura directa de \`#laboratorio\` y la navegación mediante vínculos fragmentados, se vinculan las cuatro consultas guiadas a filtros y vistas existentes, y se verifica que **«Exportar datos»** entregue los registros del detalle 2025 cuando esa sección es la activa. Se incorpora enlace «Saltar al contenido principal», indicadores de foco, botones táctiles mayores, impresión con estilos específicos y aviso de carácter independiente.

### Verificación y límites
- Reconciliación contra la base integrada de Sinaloa: 8.217 filas históricas, 23 cierres, diferencia máxima anual menor de 0,0000001 MDP; 637 registros de cierre 2025 = 49.615,22054 MDP.
- Con el corte de 2025, el HHI municipal observado estuvo entre 0,16416077 (El Fuerte) y 0,47272045 (Badiraguato). Estos valores describen concentración del valor, no riesgo financiero ni viabilidad agrícola por sí solos.
- \`tests/test_institutional_ui.cjs\` valida seis vistas, cuatro acciones institucionales, generación/cierre/impresión de ficha técnica, exportación de microregistros 2025 y ausencia de marcadores de datos faltantes en pruebas simuladas.
- Falta una inspección visual integral en navegador público, pruebas automáticas de accesibilidad WCAG, y auditoría externa independiente de DGSIAP; no se presentan como tareas concluidas.
