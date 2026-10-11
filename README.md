# Growa Agricultura Lab

Laboratorio web de inteligencia agrícola, producción y clima. El repositorio originalmente llamado PRUEBA queda preparado para una identidad nueva: **Growa Agricultura Lab**.

**Estado:** prototipo operativo para CSV agrícolas y clima puntual NASA POWER. No reemplaza el repositorio analítico oficial y no incluye cifras agrícolas precargadas.

## Abrir la aplicación

- Página principal: **index.html**
- Presentación: **styles.css**
- Análisis e interacción: **app.js**

Para ejecutarla localmente, clona el repositorio, ejecuta **python -m http.server 8000** en la raíz y visita **http://localhost:8000**.

Para publicar en GitHub Pages: **Settings → Pages → Deploy from a branch → main → /(root)**. La publicación de Pages requiere activación independiente; este repositorio no presupone que ya exista un sitio desplegado.

## Módulo 1. Producción agrícola DGSIAP

Importación de CSV UTF-8 (coma, punto y coma o tabulación), con columnas requeridas:

- Anio
- Nomestado
- Nommunicipio
- Nomcultivo
- Valorproduccion
- Cosechada
- Volumenproduccion
- Nomunidad

Filtros por año, estado, municipio y cultivo; valor nominal y superficie cosechada; control básico de unidades para volumen; serie de valor por año; principales cultivos; vista previa y exportación de filas filtradas.

Los datos se procesan localmente en el navegador, sin enviarse a un servidor desde este módulo. Máximo recomendado e impuesto por archivo: 75 MB. Para ZIP DGSIAP nacionales, utiliza la canalización de Colab y Parquet del proyecto analítico.

**Límites metodológicos:** valor en pesos nominales (sin deflactar); el volumen se agrega solo ante una única unidad reportada, lo que no sustituye revisar sus unidades físicas; no se certifican automáticamente duplicados, consistencia, comparabilidad entre cultivos o cobertura. Los filtros y gráficas son exploratorios.

## Módulo 2. Clima histórico NASA POWER

La aplicación solicita información a la API pública de NASA POWER para un año y coordenadas seleccionados:

- T2M: temperatura media del aire (°C).
- PRECTOTCORR: precipitación diaria (mm/día), sumada para un total anual (mm).
- RH2M: humedad relativa (%).
- ALLSKY_SFC_SW_DWN: radiación solar (kWh/m²/día).

Los valores faltantes se omiten; los años incompletos producen acumulados parciales. Las ubicaciones de muestra son **puntos de referencia**, no estimaciones de toda el área municipal. Se requiere acceso a internet y que NASA POWER permita la consulta directa desde el navegador.

Fuente: https://power.larc.nasa.gov/

## Proyecto agrícola principal

**Growa Agricultura — Sistema de Inteligencia Productiva**

https://github.com/Murua-Alvaro/intelligent-data-studio/tree/agricultura-produccion/agricultura-produccion

Es el trabajo principal de DGSIAP 2003–2025: maestro Parquet, catálogos, notebooks, auditoría, indicadores y desarrollo de modelos. Este laboratorio no pretende afirmar que ya estén entrenados o conectados todos los modelos.

## Antecedentes conservados

- Archivo **codigo ejemplo**: prototipo AGRO-COMMAND, con parte de su análisis simulado. No debe confundirse con las estadísticas oficiales.
- Rama **tmp-nasa-power-export-20260901**: código histórico de extracción municipal NASA POWER.
- Archivo **neon_nasa_power_bridge_temp.md**: referencia temporal heredada, no utilizada por la interfaz.
- Otras carpetas y ramas de pruebas previas se han conservado.

## Cambio de nombre técnico

Nombre propuesto: **growa-agricultura-lab**.

La interfaz, el título y la documentación ya usan **Growa Agricultura Lab**. El nombre del repositorio en GitHub se debe cambiar desde **Settings → General → Repository name → Rename**, pues las acciones disponibles en esta conexión permiten editar archivos pero no renombrar el repositorio. Hasta completar ese paso, la URL sigue siendo **Murua-Alvaro/PRUEBA**.

## Desarrollo siguiente

Integrar una API para los datos DGSIAP validados, fuentes climáticas municipales y modelos productivos, manteniendo una distinción explícita entre datos observados, indicadores derivados y predicciones.

---

Growa · Laboratorio experimental de inteligencia agrícola.
