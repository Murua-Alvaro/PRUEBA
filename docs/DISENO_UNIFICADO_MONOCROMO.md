# GROWA Agricultura · diseño unificado en blanco y negro

Alcance: Panorama, Territorio, Cultivos, Agua, Laboratorio y Metodología, además de los perfiles y análisis documentales existentes. La navegación principal se conserva y Agua vuelve a abrirse como sección integrada, sin redirigir al usuario fuera de Agricultura.

Sistema visual: superficies blancas, tipografía Arial, jerarquía sobria, bordes finos, controles uniformes, estados activos negros, espaciado constante y gráficos/cartografía en escala de grises. Se eliminan los encabezados de color, las sombras, los estilos de tarjetas redondeadas y la portada promocional. Se conserva el contenido de las fuentes, las unidades, la cobertura y las advertencias metodológicas.

Integración hídrica: la aplicación utiliza la API ya publicada. En el portal anfitrión se muestra sin cabecera duplicada, con altura adaptada mediante mensajes de origen y ventana verificados. Continúa disponible su ruta directa. En móvil conserva un control para abrir las fuentes de datos.

Correcciones funcionales detectadas durante revisión: tres llamadas a un selector inexistente en el atlas impedían terminar la inicialización del explorador de Cultivos. Se sustituyen por el selector local ya definido. El mapa base de CARTO devolvía una imagen de solicitud de clave; se sustituye por OpenStreetMap, manteniendo atribución y los polígonos municipales existentes. No se modifica ninguna base agrícola o hídrica.

Verificación: sintaxis de JavaScript e integración hídrica; nueve pruebas HTTP con registros reales; navegación visual por los seis módulos; carga de los agregados de Sinaloa y de maíz grano; consulta de Agua dentro del portal y preservación de la navegación principal. Las pruebas históricas de contratos estáticos de interfaz contienen supuestos de versiones anteriores y no se presentan como validación de este rediseño. Los diseños adaptativos requieren revisión móvil adicional.
