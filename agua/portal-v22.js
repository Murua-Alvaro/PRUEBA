/* GROWA Agua V22 · visor real conectado a la base embebida V9, sin dependencias de compilación */
(function(){
'use strict';
var root=document.getElementById('panel-agua'),dataNode=document.getElementById('wa-embedded-dataset');
if(!root)return;
var E=function(id){return document.getElementById(id)};
var esc=function(x){return String(x===null||x===undefined?'—':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var norm=function(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()};
var fmt=function(v,d){return typeof v==='number'&&Number.isFinite(v)?new Intl.NumberFormat('es-MX',{maximumFractionDigits:d===undefined?1:d}).format(v):String(v===undefined||v===null?'—':v)};
var extended={},loadErrors=[],seriesKey='',frequency='monthly',sortKey='',sortDir=1;
var d,view='overview',region='Sinaloa',search='',mun='',period='all',geo='all',minCap='',maxCap='',inspectorTab='general',sel=0,page=0,records=[],filtered=[],columns=[],map=null,baseLayer=null,baseStyle='claro',mapMarkers=new Map(),mapBounds=null,mapGroup=null,measureMode=false,measurePoints=[],measureLine=null,mapMode='map',mapExpanded=false;
var LABELS={overview:['Atlas hídrico','Inventario territorial e indicadores documentados'],presas:['Presas y embalses','Inventario de obras con localización geográfica'],regional:['Inventario regional','Composición de infraestructura por entidad'],storage:['Almacenamiento','Cortes observados y series parciales documentadas'],acuiferos:['Acuíferos','Disponibilidad administrativa y claves oficiales'],riego:['Distritos de riego','Volúmenes y superficies en series agrícolas'],cuencas:['Cuencas y estaciones','Cobertura reportada y sus límites de interpretación'],quality:['Calidad del agua','Inventario de sitios de muestreo sin fechas verificadas'],clima:['Clima y balance','Precipitación, evapotranspiración y balance anual'],trend:['Tendencias de riego','Resultados descriptivos de las series disponibles'],catalog:['Catálogo de datos','Inventario de los archivos y su cobertura'],sources:['Metodología y fuentes','Alcances, cautelas y trazabilidad']};
var COL={presa:[['nombre','Presa'],['municipio','Municipio'],['estado','Entidad'],['namo','NAMO · hm³'],['clave','Clave']],acuifero:[['nombre','Acuífero'],['clave','Clave'],['recarga','Recarga · hm³/año'],['extraccion','Extracción reportada · hm³/año'],['bandera','Indicador de déficit']],riego:[['year','Ciclo'],['estado','Entidad'],['agua','Volumen · hm³'],['superficie','Superficie registrada'],['complemento','Variable de origen']],clima:[['year','Año'],['estado','Entidad'],['lluvia','Precipitación · mm'],['et0','ET₀ · mm'],['balance','Balance · mm']],storage:[['fecha','Fecha'],['clave','Serie / presa'],['volumen','Volumen · hm³'],['dato','Dato complementario']],quality:[['nombre','Sitio'],['clave','Clave'],['estado','Entidad'],['muestras','Filas de origen'],['fechadas','Filas con fecha'],['ph','pH medio']],trend:[['nombre','Distrito'],['clave','Clave'],['observaciones','Observaciones'],['slope','Estimación'],['significance','Clasificación']],catalog:[['estado','Entidad'],['nombre','Conjunto'],['cantidad','Registros declarados'],['inicio','Inicio'],['fin','Fin'],['tipo','Tipo']],cuencas:[['estado','Entidad'],['nombre','Conjunto'],['cantidad','Registros declarados'],['inicio','Inicio'],['fin','Fin']]};
function same(a,b){return norm(a)===norm(b)}
function stateOK(x){return region==='all'||same(x,region)}
function clean(){return '<div class="v22-error">No hay registros para los criterios actuales. Pruebe con otro estado, periodo o elimine un filtro. No se imputan valores faltantes.</div>'}
function damRows(){if(extended.dams)return extended.dams;return d.presas.map(function(x){return {tipo:'presa',estado:x[0],clave:x[1],nombre:x[2],municipio:x[3],lat:Number(x[4]),lon:Number(x[5]),namo:Number(x[6]),fuente:'Inventario integrado / CONAGUA',raw:x}})}
function aqRows(){return d.acuiferos.map(function(x){return {tipo:'acuifero',estado:x[0],clave:x[1],nombre:x[2],recarga:x[3],extraccion:x[4],disponibilidad:x[5],bandera:x[6]===1?'Sí':'No',fuente:'Disponibilidad administrativa de acuíferos / CONAGUA',raw:x}})}
function riegoRows(){return d.riego.map(function(x){return {tipo:'riego',estado:x[0],year:x[1],agua:x[2],superficie:x[3],complemento:x[4],otra:x[5],fuente:'Estadísticas agrícolas de distritos de riego',raw:x}})}
function climaRows(){return d.clima.map(function(x){return {tipo:'clima',estado:x[0],year:x[1],lluvia:x[2],et0:x[3],balance:x[4],indice:x[5],fuente:'Series históricas de clima y balance incluidas en edición V9',raw:x}})}
function storageRows(){
if(extended.monthly){var base=frequency==='daily'?extended.daily||[]:extended.monthly;return base.concat(d.sinaloa.map(function(x){return {tipo:'storage',estado:'Sinaloa',fecha:x[1],clave:x[0],volumen:x[2],dato:x[3],fuente:x[4]}}),d.sistemas.map(function(x){return {tipo:'storage',estado:'Sinaloa',fecha:x[1],clave:x[0],volumen:x[3],dato:x[4],fuente:'Cortes de sistemas · V9'}}));}

var a=d.sinaloa.map(function(x){return {tipo:'storage',estado:'Sinaloa',fecha:x[1],clave:x[0],volumen:x[2],dato:x[3],fuente:x[4],raw:x}});
a=a.concat(d.jalisco.map(function(x){return {tipo:'storage',estado:'Jalisco',fecha:x[1],clave:x[0],volumen:x[2],dato:x[3],fuente:'Serie mensual Jalisco, edición web parcial',raw:x}}));
a=a.concat(d.sistemas.map(function(x){return {tipo:'storage',estado:'Sinaloa',fecha:x[1],clave:x[0],volumen:x[3],dato:x[4],fuente:'Registro de sistemas de presas, corte documental',raw:x}}));
return a;
}
function qualityRows(){if(extended.quality)return extended.quality;return d.calidad.map(function(x){return {tipo:'quality',estado:x[0],clave:x[1],nombre:x[2],muestras:x[3],fechadas:x[4],ph:x[5],fuente:'Sitios de calidad: sin fecha de muestreo verificada',raw:x}})}
function trendRows(){return d.tendencias.map(function(x){return {tipo:'trend',estado:x[0],clave:x[1],nombre:x[2],observaciones:x[3],slope:x[4],estadistico:x[5],significance:x[6],fuente:'Cálculo de tendencias sobre series históricas',raw:x}})}
function coverageRows(){return d.cobertura.map(function(x){return {tipo:'catalog',estado:x[0],nombre:x[1],cantidad:x[2],inicio:x[3],fin:x[4],tipo:x[5],fuente:'Matriz de cobertura V9',raw:x}})}
function setRows(){
var key=view==='presas'||view==='regional'||view==='overview'?'presa':view==='acuiferos'?'acuifero':view==='riego'?'riego':view==='clima'?'clima':view==='storage'?'storage':view==='quality'?'quality':view==='trend'?'trend':view==='cuencas'?'cuencas':'catalog';
records=(key==='presa'?damRows():key==='acuifero'?aqRows():key==='riego'?riegoRows():key==='clima'?climaRows():key==='storage'?storageRows():key==='quality'?qualityRows():key==='trend'?trendRows():coverageRows());
if(view==='cuencas')records=records.filter(function(x){return /cuencas|estaciones|hidrometric/i.test(x.nombre)});
columns=COL[key]||COL.catalog;
if(key==='quality'&&extended.quality)columns=[['nombre','Sitio'],['clave','Clave'],['ph','pH de campo'],['temperatura','Temperatura de origen'],['conductividad','Conductividad de origen'],['od','OD · %'],['sst','SST de origen'],['nitrogeno','N total de origen'],['fosforo','P total de origen'],['caudal','Caudal · texto original']];
if(view==='regional'){columns=COL.presa}
}
function filters(){
setRows();
var prev=mun, opts=Array.from(new Set(records.filter(function(x){return stateOK(x.estado)}).map(function(x){return x.municipio||''}).filter(Boolean))).sort(function(a,b){return a.localeCompare(b,'es')});
var input=E('w17-filter');
if(input){
if(input.tagName==='SELECT'){input.outerHTML='<input id="w17-filter" type="search" list="w22-municipios" placeholder="Escriba o seleccione…" autocomplete="off" aria-label="Buscar municipio"><datalist id="w22-municipios"></datalist>';input=E('w17-filter')}
E('w22-municipios').innerHTML=opts.map(function(x){return '<option value="'+esc(x)+'"></option>'}).join('');
input.value=prev;input.placeholder=opts.length?'Municipio / seleccione…':'Sin filtro municipal';input.disabled=!opts.length;
}
var periods=Array.from(new Set(records.filter(function(x){return stateOK(x.estado)}).map(function(x){return String(x.year||String(x.fecha||'').slice(0,4))}).filter(function(x){return /^(19|20)\d{2}$/.test(String(x))}))).sort().reverse();
var p=E('w17-period');if(p){p.innerHTML='<option value="all">Todos los periodos</option>'+periods.map(function(x){return '<option value="'+esc(x)+'"'+(String(x)===String(period)?' selected':'')+'>'+esc(x)+'</option>'}).join('');p.disabled=!periods.length}
if(period!=='all'&&!periods.includes(period)){period='all';if(p)p.value='all'}
var isDams=['overview','presas','regional'].indexOf(view)!==-1;
E('w21-cap-min').disabled=!isDams;E('w21-cap-max').disabled=!isDams;
E('w21-geo').disabled=!isDams;
var regionSelect=E('w21-region');regionSelect.innerHTML='<option value="all">Sin regionalización verificable</option>';regionSelect.disabled=true;
E('w21-advanced-hint').textContent=isDams?'Se aplican ubicación y capacidad NAMO a las presas. Los polígonos regionales no están en la edición actual.':'Esta base no proporciona coordenadas o región CONAGUA comparable; los filtros no pertinentes se deshabilitan.';
}
function apply(){
var q=norm(search),m=norm(mun),isDams=['overview','presas','regional'].indexOf(view)!==-1;
filtered=records.filter(function(x){
if(!stateOK(x.estado))return false;
if(q&&!norm(Object.values(x).filter(function(y){return ['string','number'].indexOf(typeof y)!==-1}).join(' ')).includes(q))return false;
if(m&&!norm(x.municipio||'').includes(m))return false;
if(period!=='all'&&String(x.year||String(x.fecha||'').slice(0,4))!==period)return false;
if(isDams){
var has=Number.isFinite(x.lat)&&Number.isFinite(x.lon)&&Math.abs(x.lat)<=90&&Math.abs(x.lon)<=180;
if(geo==='geo'&&!has||geo==='nogeo'&&has)return false;
if(minCap!==''&&!(x.namo>=Number(minCap)))return false;
if(maxCap!==''&&!(x.namo<=Number(maxCap)))return false;
}
return true;
});
if(sortKey)filtered.sort(function(a,b){var x=a[sortKey],y=b[sortKey];if(x==null)return 1;if(y==null)return -1;return sortDir*(typeof x==='number'&&typeof y==='number'?x-y:String(x).localeCompare(String(y),'es',{numeric:true}))});
page=Math.max(0,Math.min(page,Math.ceil(filtered.length/18)-1));
sel=Math.max(0,Math.min(sel,filtered.length-1));
}
function metric(label,value,note){return '<div class="v22-metric"><span class="v22-metric-label">'+esc(label)+'</span><strong>'+esc(value)+'</strong><small>'+esc(note||'')+'</small></div>'}
function metrics(){
var allP=damRows().filter(function(x){return stateOK(x.estado)}),allA=aqRows().filter(function(x){return stateOK(x.estado)}),allR=riegoRows().filter(function(x){return stateOK(x.estado)}),allC=climaRows().filter(function(x){return stateOK(x.estado)});
var m=allP.reduce(function(s,x){return s+(Number.isFinite(x.namo)?x.namo:0)},0);
return '<div class="v22-metrics">'+metric('Presas localizadas',fmt(allP.length,0),'Inventarios integrados · cobertura disponible')+metric('Capacidad de diseño NAMO',fmt(m,1)+' hm³','Capacidad de diseño, no volumen actual')+metric('Acuíferos registrados',fmt(allA.length,0),'Cobertura de la edición integrada')+metric('Ciclos / años',fmt(allR.length,0)+' / '+fmt(allC.length,0),'Riego / clima con observaciones')+'</div>';
}
function table(){
if(!filtered.length)return '<div id="v22-table-results">'+clean()+'</div>';
var start=page*18,end=Math.min(filtered.length,start+18);
var rows=filtered.slice(start,end);
return '<div id="v22-table-results"><div class="v22-table-wrap"><table class="v22-table"><thead><tr>'+columns.map(function(c){return '<th scope="col" aria-sort="'+(sortKey===c[0]?(sortDir===1?'ascending':'descending'):'none')+'"><button type="button" data-w23-sort="'+esc(c[0])+'">'+esc(c[1])+' <span aria-hidden="true">'+(sortKey===c[0]?(sortDir===1?'↑':'↓'):'↕')+'</span></button></th>'}).join('')+'</tr></thead><tbody>'+
rows.map(function(row,i){var index=start+i;return '<tr data-v22-index="'+index+'" class="'+(index===sel?'v22-selected':'')+'" tabindex="0" title="Abrir expediente">'+columns.map(function(c){var v=row[c[0]];return '<td>'+esc(typeof v==='number'?fmt(v,c[0]==='namo'||c[0]==='agua'?1:2):v)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>'+
'<div class="v22-pager"><span>'+fmt(start+1,0)+'–'+fmt(end,0)+' de '+fmt(filtered.length,0)+' registros · máximo 18 por página</span><div><button type="button" data-v22-page="-1" '+(page===0?'disabled':'')+'>← Anterior</button> <button type="button" data-v22-page="1" '+(end===filtered.length?'disabled':'')+'>Siguiente →</button></div></div></div>';
}
function mapBlock(){
var pts=filtered.filter(function(x){return Number.isFinite(x.lat)&&Number.isFinite(x.lon)});
var toolbar='<div class="v22-map-toolbar" role="toolbar" aria-label="Herramientas cartográficas">'+
'<div class="v22-map-mode"><button type="button" data-v22-mode="map" aria-pressed="'+(mapMode==='map')+'">Mapa</button><button type="button" data-v22-mode="table" aria-pressed="'+(mapMode==='table')+'">Tabla</button></div>'+
'<div class="v22-map-actions"><label class="v22-map-select">Cartografía <select id="v22-basemap" aria-label="Cambiar mapa base"><option value="claro"'+(baseStyle==='claro'?' selected':'')+'>Calles</option><option value="topografico"'+(baseStyle==='topografico'?' selected':'')+'>Topográfico</option><option value="satelite"'+(baseStyle==='satelite'?' selected':'')+'>Satélite</option></select></label>'+
'<button type="button" data-v22-action="layers" aria-expanded="false" aria-controls="v22-layers-panel">Capas ▾</button>'+
'<button type="button" data-v22-action="measure" aria-pressed="'+measureMode+'">Medir</button>'+
'<button type="button" data-v22-action="center">Centrar</button>'+
'<button type="button" data-v22-action="expand" aria-pressed="'+mapExpanded+'">Expandir</button>'+
'<button type="button" data-v22-action="share">Compartir</button>'+
'<button type="button" data-v22-action="geojson">GeoJSON ↓</button></div></div>'+
'<div id="v22-layers-panel" class="v22-layers-panel" hidden><label><input type="checkbox" id="v22-layer-dams" checked> Ubicaciones de presas</label><small>Solo puntos con coordenadas en el inventario. No se muestran superficies ni polígonos de embalse.</small></div>';
if(mapMode==='table')return toolbar+table();
return toolbar+'<div class="v22-map-grid"><div class="v22-map-wrap"><div class="v22-map-top"><span>CARTOGRAFÍA · INVENTARIO DOCUMENTADO</span></div>'+
'<div class="v22-map-count"><small>PRESAS GEOREFERENCIADAS</small><strong>'+fmt(pts.length,0)+'</strong><em>'+esc(region==='all'?'Cinco entidades':region)+' · selección activa</em></div><div id="v22-map" class="v22-map" role="application" aria-label="Mapa de presas"></div>'+
'<button id="v22-exit-map" type="button" class="v22-map-exit" data-v22-action="expand" hidden>Cerrar vista ampliada ×</button>'+
'<div id="v22-map-status" class="v22-map-status" role="status" hidden></div>'+
'<div id="v22-measure-readout" class="v22-measure-readout" role="status"'+(measureMode?'':' hidden')+'>Haga clic en dos puntos del mapa para medir distancia.</div></div>'+
'<aside class="v22-map-info"><h3>Selección territorial</h3><p>Ubicaciones georreferenciadas de presas. Seleccione un punto para consultar su expediente técnico.</p><div class="v22-map-register">'+
pts.slice(0,12).map(function(x){var index=filtered.indexOf(x);return '<button type="button" data-v22-marker="'+index+'" class="'+(index===sel?'v22-selected':'')+'">'+esc(x.nombre)+'<small>'+esc(x.municipio)+' · '+fmt(x.namo,1)+' hm³ NAMO</small></button>'}).join('')+'</div>'+
'<p><strong>'+fmt(pts.length,0)+'</strong> ubicaciones visibles de <strong>'+fmt(damRows().filter(function(x){return stateOK(x.estado)}).length,0)+'</strong> del estado elegido. NAMO no representa el almacenamiento actual.</p></aside></div>';
}
function bars(rows,key,label){
var sorted=rows.filter(function(x){return typeof x[key]==='number'&&Number.isFinite(x[key])}).slice().sort(function(a,b){return Number(a.year||0)-Number(b.year||0)}).slice(-16);
if(sorted.length<2)return '';
var max=Math.max.apply(null,sorted.map(function(x){return Math.max(0,Math.abs(x[key]))}))||1;
return '<div class="v22-chart"><div class="v22-section-head"><div><h2>'+esc(label)+'</h2><p>Últimos registros con observación válida · sin interpolación</p></div></div><div class="v22-bars">'+sorted.map(function(x){var v=x[key];return '<div class="v22-bar-row"><label>'+esc(x.year)+'</label><span class="v22-bar-track"><span style="width:'+Math.max(1,100*Math.abs(v)/max).toFixed(1)+'%"></span></span><strong>'+esc(fmt(v,1))+'</strong></div>'}).join('')+'</div></div>';
}
function sourceLinks(){return '<div class="v22-help"><strong>Fuentes oficiales de referencia:</strong> <a href="https://app.conagua.gob.mx/sistemasdeagua/" target="_blank" rel="noopener noreferrer">CONAGUA · SINA</a> · <a href="https://presas.conagua.gob.mx/" target="_blank" rel="noopener noreferrer">Sistema de Seguridad de Presas</a> · <a href="https://sih.conagua.gob.mx/" target="_blank" rel="noopener noreferrer">Sistema de Información Hidrológica</a>. Esta plataforma GROWA no es un sitio oficial de CONAGUA.</div>'}
function narrative(){
if(view==='sources')return '<div class="v22-section-head"><div><h2>Alcance y metodología</h2><p>Edición de datos: '+esc(d.version)+' · '+esc(d.corte)+'</p></div></div>'+Object.keys(d.notas||{}).map(function(k){return '<div class="v22-help"><strong>'+esc(k.toUpperCase())+'</strong><p>'+esc(d.notas[k])+'</p></div>'}).join('')+sourceLinks();
if(view==='catalog')return downloads()+ '<div class="v22-help">Los valores del catálogo describen archivos documentales integrados o inventariados; no implican cobertura geográfica ni series homogéneas completas. Consulte cada expediente antes de comparar periodos.</div>';
if(view==='quality')return '<div class="v22-help">Los sitios de calidad carecen de fechas de muestreo verificadas: no se infiere evolución temporal ni potabilidad. El número de registros por sitio no equivale a un monitoreo reciente.</div>';
if(view==='cuencas')return '<div class="v22-help">La edición no incorpora polígonos ni geometrías oficiales verificadas para las 757 cuencas nacionales. Se muestran únicamente metadatos de cobertura; no se inventa cartografía.</div>';
if(view==='acuiferos')return '<div class="v22-help">Los valores corresponden a datos administrativos de disponibilidad y no representan mediciones instantáneas de nivel piezométrico. Deben contrastarse con el expediente oficial de cada acuífero.</div>';
if(view==='storage')return '<div class="v22-help">Jalisco: series mensuales y diarias por presa. Sinaloa: cortes parciales y sistemas agregados, conservados por separado. Los ceros son valores de origen; no se imputan fechas ni se interpreta un corte histórico como disponibilidad actual.</div>';
if(view==='trend')return '<div class="v22-help">La clasificación de tendencias es un atributo de la base original: no valida causalidad ni predice por sí sola los ciclos siguientes.</div>';
if(view==='regional')return '<div class="v22-help">Inventario de fuente secundaria. Los registros sin entidad permanecen en «Sin entidad reportada» y no se asignan mediante suposiciones geográficas.</div>';
return '<div class="v22-help">Consulta de archivo con trazabilidad. Los datos históricos no son monitoreo en tiempo real. NAMO identifica capacidad de diseño, no almacenamiento disponible hoy.</div>';
}
function renderContent(){
root.dataset.waterView=view;var desc=LABELS[view];E('w17-title').textContent=desc[0];E('w17-subtitle').textContent=desc[1];E('w17-crumb-view').textContent=desc[0].toUpperCase();E('w17-scope').textContent='ARCHIVO / '+d.corte;
root.querySelectorAll('[data-w17-view]').forEach(function(btn){btn.setAttribute('aria-current',btn.dataset.w17View===view?'page':'false')});
apply();
E('w17-filters-note').textContent=fmt(filtered.length,0)+' filas consultables · '+(region==='all'?'todas las entidades disponibles':region)+' · '+(period==='all'?'todos los periodos':period);
var isMap=['overview','presas','regional'].indexOf(view)!==-1;
var h='<div class="v22-kicker">OBSERVATORIO DEL AGUA / GROWA</div>';
if(view==='overview')h+=intro()+'<div class="v22-section-head"><div><h2>Infraestructura y disponibilidad</h2><p>Consulta por entidad, municipio, clave, capacidad y periodo</p></div><small>FUENTES / ARCHIVO HÍDRICO INTEGRADO</small></div>'+metrics();
if(isMap)h+='<div class="v22-section-head"><div><h2>Localización de presas</h2><p>Distribución espacial de la selección activa · puntos georreferenciados</p></div><small>'+fmt(filtered.length,0)+' registros</small></div>'+mapBlock();
if(view==='riego')h+=timeChart('agua','Volumen distribuido','hm³');
if(view==='clima')h+=timeChart('lluvia','Precipitación anual','mm');
if(view==='storage')h+=timeChart('volumen','Almacenamiento observado','hm³');
if(view==='quality')h+='<div class="w23-coverage"><strong>'+fmt(filtered.length,0)+' observaciones consultables</strong><span>'+fmt(new Set(filtered.map(function(x){return x.clave})).size,0)+' sitios · origen secundario · sin fecha de muestreo</span></div>';
if(loadErrors.length)h+='<div class="v22-help" role="status">Algunos archivos no respondieron: '+esc(loadErrors.join(', '))+'. Se conservan las bases resumidas disponibles.</div>';
if(view==='sources')h+=narrative();
else {h+='<div class="v22-data-band"><div><h3>'+esc(view==='overview'?'Registros de infraestructura':desc[0])+'</h3><span>Haga clic en cualquier fila para abrir su expediente técnico</span></div><button class="w17-btn" type="button" data-w17-action="export">↓ Descargar CSV</button></div>'+(isMap&&mapMode==='table'?'':table())+narrative();}
var previousIntro=root.querySelector('.w23-intro');if(previousIntro)previousIntro.remove();
E('w17-content').innerHTML=h;
if(view==='overview'){var introNode=root.querySelector('.w23-intro');if(introNode)E('w17-toolbar').before(introNode);}
updateInspector();
if(isMap&&mapMode==='map'){if(!root.hidden)drawMap();}
else if(map){map.remove();map=null;baseLayer=null;mapMarkers.clear();}
}
function selectRow(index,fromMap){
if(index<0||index>=filtered.length)return;
root.classList.remove('w22-detail-collapsed');if(map)setTimeout(function(){if(map)map.invalidateSize()},100);
var oldPage=page;sel=index;page=Math.floor(index/18);
updateInspector();
if(oldPage!==page){root.querySelectorAll('#v22-table-results').forEach(function(el){el.outerHTML=table()})}
else{root.querySelectorAll('tr[data-v22-index]').forEach(function(el){el.classList.toggle('v22-selected',Number(el.dataset.v22Index)===sel)})}
root.querySelectorAll('[data-v22-marker]').forEach(function(el){el.classList.toggle('v22-selected',Number(el.dataset.v22Marker)===sel)});
highlightMarker(index,!fromMap);
}
function detailsValues(){
var x=filtered[sel];if(!x){E('w17-detail-body').innerHTML='<p class="w17-detail-empty">Sin registro seleccionado. Modifique los filtros o seleccione una fila de la tabla.</p>';return;}
var pairs=[],title=x.nombre||x.clave||x.estado||'Registro';
if(inspectorTab==='general')pairs=columns.map(function(c){return [c[1],x[c[0]]]});
if(inspectorTab==='variables')pairs=Object.keys(x).filter(function(k){return k!=='raw'&&k!=='tipo'&&k!=='fuente'&&typeof x[k]==='number'}).map(function(k){return [k,x[k]]});
if(inspectorTab==='location')pairs=[['Entidad',x.estado],['Municipio',x.municipio],['Latitud',x.lat],['Longitud',x.lon],['Coordenadas verificables',Number.isFinite(x.lat)&&Number.isFinite(x.lon)?'Sí · coordenada puntual':'Sin geometría incluida']];
if(inspectorTab==='history')pairs=[['Variable temporal',x.year||x.fecha||'Sin año individual'],['Tipo de registro',x.tipo],['Alcance','Un registro no constituye una serie; consulte los demás cortes de esta base']];
if(inspectorTab==='source')pairs=[['Fuente',x.fuente],['URL de origen',x.url],['Alcance temporal',x.fecha||x.year||'Sin fecha individual verificada'],['Versión de base',d.version],['Corte de integración',d.corte],['Registro de origen','Conservado sin imputaciones']];
E('w17-detail-body').innerHTML='<h3 class="v22-detail-title">'+esc(title)+'</h3><div class="v22-detail-meta">'+esc(x.tipo.toUpperCase())+' · REGISTRO '+esc(sel+1)+' DE '+esc(filtered.length)+'</div><dl class="v22-dl">'+pairs.map(function(p){return '<div><dt>'+esc(p[0])+'</dt><dd>'+esc(typeof p[1]==='number'?fmt(p[1],4):p[1])+'</dd></div>'}).join('')+'</dl>';
}
function updateInspector(){root.querySelectorAll('[data-w21-tab]').forEach(function(b){b.setAttribute('aria-selected',b.dataset.w21Tab===inspectorTab?'true':'false');b.tabIndex=b.dataset.w21Tab===inspectorTab?0:-1});detailsValues()}
function highlightMarker(index,pan){
mapMarkers.forEach(function(marker,i){
marker.setStyle({fillColor:i===index?'#a84d2e':'#65724c',color:i===index?'#101f2a':'#fff',weight:i===index?2.6:1.4,fillOpacity:i===index?1:.83});
if(i===index){marker.bringToFront();if(pan&&map)map.panTo(marker.getLatLng(),{animate:true,duration:.3});}
});
}
function basemap(kind){
if(!map||!window.L)return;
var definitions={
claro:['https://tile.openstreetmap.org/{z}/{x}/{y}.png','© OpenStreetMap contributors',19],
topografico:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}','Tiles © Esri, HERE, Garmin, USGS',18],
satelite:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}','Imagery © Esri, Maxar, Earthstar Geographics',18]
};
kind=definitions[kind]?kind:'claro';
if(baseLayer){map.removeLayer(baseLayer);baseLayer=null}
baseStyle=kind;var mount=E('v22-map');if(mount)mount.dataset.basemap=kind;var spec=definitions[kind],errors=0;
baseLayer=L.tileLayer(spec[0],{attribution:spec[1],maxZoom:spec[2],crossOrigin:true,updateWhenIdle:true}).addTo(map);
baseLayer.bringToBack();
var status=E('v22-map-status');if(status)status.hidden=true;
var current=baseLayer;
current.on('tileerror',function(){
if(current!==baseLayer)return;
errors++;
if(errors<3)return;
if(kind!=='claro'){toast('El mapa alternativo no respondió. Cambiando a OpenStreetMap.');basemap('claro');var sel=E('v22-basemap');if(sel)sel.value='claro'}
else if(status){status.textContent='No se pudo cargar la cartografía externa. Los puntos están disponibles en la tabla y en GeoJSON.';status.hidden=false}
});
}
function drawMap(){
var mount=E('v22-map');if(!mount)return;
if(map){map.remove();map=null;baseLayer=null;mapMarkers.clear()}
var pts=filtered.filter(function(x){return Number.isFinite(x.lat)&&Number.isFinite(x.lon)&&Math.abs(x.lat)<=90&&Math.abs(x.lon)<=180});
if(!window.L){mount.innerHTML='<div class="v22-map-placeholder">No se pudo cargar la biblioteca cartográfica. Las fichas y los registros siguen disponibles en tabla y CSV.</div>';return}
if(!pts.length){mount.innerHTML='<div class="v22-map-placeholder">No existen coordenadas válidas para esta selección. Retire filtros o elija otra entidad.</div>';return}
try{
map=L.map(mount,{zoomControl:false,attributionControl:true,scrollWheelZoom:false,preferCanvas:true});
L.control.zoom({position:'bottomright'}).addTo(map);
basemap(baseStyle);
mapGroup=L.featureGroup();mapMarkers.clear();
pts.forEach(function(x){
var idx=filtered.indexOf(x),circle=L.circleMarker([x.lat,x.lon],{radius:Math.max(5,Math.min(14,5+Math.sqrt(Math.max(0,x.namo||0))/9)),color:'#fff',weight:1.4,fillColor:'#65724c',fillOpacity:.83,bubblingMouseEvents:false});
circle.bindPopup('<strong>'+esc(x.nombre)+'</strong><br>'+esc(x.municipio)+' · '+esc(x.estado)+'<br>NAMO: '+esc(fmt(x.namo,1))+' hm³');
circle.on('click',function(){selectRow(idx,true)});
mapMarkers.set(idx,circle);mapGroup.addLayer(circle);
});
mapGroup.addTo(map);mapBounds=mapGroup.getBounds();
map.fitBounds(mapBounds.pad(.17),{maxZoom:9,paddingTopLeft:[20,140],paddingBottomRight:[20,20]});
highlightMarker(sel,false);
map.on('click',function(ev){
if(!measureMode)return;
if(measurePoints.length>=2)measurePoints=[];
measurePoints.push(ev.latlng);
if(measureLine){map.removeLayer(measureLine);measureLine=null}
if(measurePoints.length===2){
measureLine=L.polyline(measurePoints,{color:'#8d5033',weight:3,dashArray:'7,5',interactive:false}).addTo(map);
var km=measurePoints[0].distanceTo(measurePoints[1])/1000;
E('v22-measure-readout').textContent='Distancia aproximada entre puntos: '+fmt(km,2)+' km · clic para medir otra vez';
}else{E('v22-measure-readout').textContent='Origen fijado. Seleccione un segundo punto.'}
});
setTimeout(function(){if(map)map.invalidateSize()},120);
}catch(err){mount.innerHTML='<div class="v22-map-placeholder">No fue posible iniciar el mapa. Los registros continúan en la tabla.</div>';console.error('GROWA mapa:',err)}
}
function downloadData(name,mime,body){
var u=URL.createObjectURL(new Blob([body],{type:mime})),a=document.createElement('a');
a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();
setTimeout(function(){URL.revokeObjectURL(u)},1500);
}
function downloadGeoJSON(){
var pts=filtered.filter(function(x){return Number.isFinite(x.lat)&&Number.isFinite(x.lon)&&Math.abs(x.lat)<=90&&Math.abs(x.lon)<=180});
if(!pts.length){toast('No hay coordenadas válidas en la selección');return}
var geojson={type:'FeatureCollection',name:'GROWA Agua · Inventario de presas',properties:{corte:d.corte,version:d.version,advertencia:'Las ubicaciones representan puntos, no polígonos ni volumen actual.'},features:pts.map(function(x){return {type:'Feature',geometry:{type:'Point',coordinates:[x.lon,x.lat]},properties:{clave:x.clave,nombre:x.nombre,municipio:x.municipio,estado:x.estado,namo_hm3:Number.isFinite(x.namo)?x.namo:null,fuente:x.fuente}}})};
downloadData('GROWA_presas_'+region+'.geojson','application/geo+json;charset=utf-8',JSON.stringify(geojson,null,2));
toast('GeoJSON exportado: '+pts.length+' ubicaciones');
}
function shareMap(){
var u=new URL(location.href);u.hash='agua';u.searchParams.set('aguaEstado',region);u.searchParams.set('aguaVista',view);
u.searchParams.set('aguaFrecuencia',frequency);if(seriesKey)u.searchParams.set('aguaSerie',seriesKey);u.searchParams.set('aguaGeo',geo);if(minCap!=='')u.searchParams.set('aguaMin',minCap);else u.searchParams.delete('aguaMin');if(maxCap!=='')u.searchParams.set('aguaMax',maxCap);else u.searchParams.delete('aguaMax');
if(search)u.searchParams.set('aguaQuery',search);else u.searchParams.delete('aguaQuery');
if(mun)u.searchParams.set('aguaMunicipio',mun);else u.searchParams.delete('aguaMunicipio');
if(period!=='all')u.searchParams.set('aguaPeriodo',period);else u.searchParams.delete('aguaPeriodo');
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(u.href).then(function(){toast('Enlace de consulta copiado')}).catch(function(){window.prompt('Copie el enlace:',u.href)})}
else window.prompt('Copie el enlace:',u.href);
}

function toast(s){var el=E('w17-toast');el.textContent=s;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(function(){el.hidden=true},3000)}
function csv(){
if(!filtered.length){toast('No hay datos que exportar');return}
var cols=Array.from(new Set(columns.map(function(x){return x[0]}).concat(['estado','lat','lon','fuente','url'])));
var text='\ufeff'+cols.join(',')+'\r\n'+filtered.map(function(x){return cols.map(function(k){return '"'+String(x[k]===undefined||x[k]===null?'':x[k]).replace(/"/g,'""')+'"'}).join(',')}).join('\r\n');
var u=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download='GROWA_agua_'+view+'_'+String(region).replace(/[^a-z0-9]/gi,'_')+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},1200);
toast('Descarga CSV generada con '+filtered.length+' registros');
}
function repaint(resetSelection){if(resetSelection){sel=0;page=0}filters();renderContent()}
root.addEventListener('click',function(ev){
var sort=ev.target.closest('[data-w23-sort]');if(sort){sortDir=sortKey===sort.dataset.w23Sort?-sortDir:1;sortKey=sort.dataset.w23Sort;page=0;renderContent();return}
var shortcut=ev.target.closest('[data-w23-jump]');if(shortcut){root.querySelector('[data-w17-view="'+shortcut.dataset.w23Jump+'"]').click();return}
var share=ev.target.closest('[data-w23-share]');if(share){shareMap();return}
var mode=ev.target.closest('[data-v22-mode]');
if(mode){if(mapMode!==mode.dataset.v22Mode){mapMode=mode.dataset.v22Mode;renderContent()}return}
var cart=ev.target.closest('[data-v22-action]');
if(cart){
var action=cart.dataset.v22Action;
if(action==='layers'){var panel=E('v22-layers-panel');panel.hidden=!panel.hidden;cart.setAttribute('aria-expanded',panel.hidden?'false':'true');return}
if(action==='measure'){measureMode=!measureMode;measurePoints=[];if(map&&measureLine){map.removeLayer(measureLine);measureLine=null}cart.setAttribute('aria-pressed',String(measureMode));var r=E('v22-measure-readout');if(r){r.hidden=!measureMode;r.textContent='Haga clic en dos puntos del mapa para medir distancia.'}toast(measureMode?'Medición activada: seleccione dos puntos':'Medición desactivada');return}
if(action==='center'){if(map&&mapBounds)map.fitBounds(mapBounds.pad(.17),{maxZoom:9,paddingTopLeft:[20,140],paddingBottomRight:[20,20]});return}
if(action==='expand'){mapExpanded=!mapExpanded;var wrap=E('v22-map')?.parentElement;if(wrap)wrap.classList.toggle('v22-map-expanded',mapExpanded);var exit=E('v22-exit-map');if(exit)exit.hidden=!mapExpanded;root.querySelectorAll('[data-v22-action="expand"]').forEach(function(b){b.setAttribute('aria-pressed',String(mapExpanded))});if(map)setTimeout(function(){map.invalidateSize()},120);return}
if(action==='share'){shareMap();return}
if(action==='geojson'){downloadGeoJSON();return}
}
var group=ev.target.closest('[data-w21-group]');if(group){var open=group.getAttribute('aria-expanded')==='true';group.setAttribute('aria-expanded',open?'false':'true');var el=E('w21-group-'+group.dataset.w21Group);if(el)el.hidden=open;return;}
var nav=ev.target.closest('[data-w17-view]');if(nav){mapExpanded=false;measureMode=false;measurePoints=[];view=nav.dataset.w17View;sortKey='';seriesKey='';search='';mun='';period='all';geo='all';minCap='';maxCap='';E('w17-search').value='';E('w21-geo').value='all';E('w21-cap-min').value='';E('w21-cap-max').value='';repaint(true);return;}
var row=ev.target.closest('[data-v22-index]');if(row){selectRow(Number(row.dataset.v22Index));return;}
var marker=ev.target.closest('[data-v22-marker]');if(marker){selectRow(Number(marker.dataset.v22Marker));return;}
var pager=ev.target.closest('[data-v22-page]');if(pager){page=Math.max(0,Math.min(Math.ceil(filtered.length/18)-1,page+Number(pager.dataset.v22Page)));root.querySelectorAll('#v22-table-results').forEach(function(el){el.outerHTML=table()});return;}
var tab=ev.target.closest('[data-w21-tab]');if(tab){inspectorTab=tab.dataset.w21Tab;updateInspector();return;}
var action=ev.target.closest('[data-w17-action]');if(!action)return;
switch(action.dataset.w17Action){
case 'advanced-toggle':var a=E('w21-advanced');a.hidden=!a.hidden;action.setAttribute('aria-expanded',a.hidden?'false':'true');break;
case 'advanced-reset':geo='all';minCap='';maxCap='';E('w21-geo').value='all';E('w21-cap-min').value='';E('w21-cap-max').value='';repaint(true);break;
case 'reset':search='';mun='';period='all';geo='all';minCap='';maxCap='';E('w17-search').value='';E('w21-geo').value='all';E('w21-cap-min').value='';E('w21-cap-max').value='';repaint(true);toast('Filtros restablecidos');break;
case 'sidebar-toggle':root.classList.toggle('w22-collapsed');action.setAttribute('aria-expanded',root.classList.contains('w22-collapsed')?'false':'true');if(map)setTimeout(function(){map.invalidateSize()},100);break;
case 'detail-toggle':root.classList.toggle('w22-detail-collapsed');if(map)setTimeout(function(){map.invalidateSize()},100);break;
case 'source':view='sources';repaint(true);break;
case 'guide':E('w17-guide').showModal();break;
case 'guide-close':E('w17-guide').close();break;
case 'export':csv();break;
case 'next':if(filtered.length)selectRow((sel+1)%filtered.length);break;
}
});
root.addEventListener('keydown',function(ev){var tab=ev.target.closest('[data-w21-tab]');if(tab&&['ArrowLeft','ArrowRight','Home','End'].includes(ev.key)){ev.preventDefault();var tabs=Array.from(root.querySelectorAll('[data-w21-tab]')),i=tabs.indexOf(tab);i=ev.key==='Home'?0:ev.key==='End'?tabs.length-1:(i+(ev.key==='ArrowRight'?1:tabs.length-1))%tabs.length;inspectorTab=tabs[i].dataset.w21Tab;updateInspector();tabs[i].focus();return}var tr=ev.target.closest('[data-v22-index]');if(tr&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();selectRow(Number(tr.dataset.v22Index))}});
root.addEventListener('change',function(ev){
if(ev.target.id==='w23-series'){seriesKey=ev.target.value;renderContent();return}
if(ev.target.id==='w23-frequency'){frequency=ev.target.value;seriesKey='';repaint(true);return}
if(ev.target.id==='v22-basemap'){basemap(ev.target.value);return}
if(ev.target.id==='v22-layer-dams'&&map&&mapGroup){if(ev.target.checked)mapGroup.addTo(map);else map.removeLayer(mapGroup);return}
if(ev.target.id==='w17-state'){region=ev.target.value;mun='';repaint(true)}
if(ev.target.id==='w17-period'){period=ev.target.value;repaint(true)}
if(ev.target.id==='w17-filter'){mun=ev.target.value;repaint(true)}
if(ev.target.id==='w21-geo'){geo=ev.target.value;repaint(true)}
if(ev.target.id==='w21-cap-min'){minCap=ev.target.value;repaint(true)}
if(ev.target.id==='w21-cap-max'){maxCap=ev.target.value;repaint(true)}
});
var searchDelay;
root.addEventListener('input',function(ev){if(ev.target.id==='w17-search'){search=ev.target.value;clearTimeout(searchDelay);searchDelay=setTimeout(function(){repaint(true)},150)}if(ev.target.id==='w17-filter'){mun=ev.target.value;clearTimeout(searchDelay);searchDelay=setTimeout(function(){repaint(true);E('w17-filter').focus()},280)}});

function intro(){return '<section class="w23-intro"><div><span class="w23-eyebrow">TERRITORIO · RECURSOS · EVIDENCIA</span><h2>El agua, en perspectiva.</h2><p>Explore infraestructura, disponibilidad administrativa y registros históricos. Una lectura territorial con acceso a los datos de origen.</p><div class="w23-quick"><button type="button" data-w23-jump="storage">Explorar series <span aria-hidden="true">↗</span></button><button type="button" data-w23-jump="catalog">Catálogo y descargas <span aria-hidden="true">↓</span></button></div></div><div class="w23-intro-index"><span>ARCHIVO HÍDRICO</span><strong>1996—2026</strong><small>Cobertura variable por fuente y territorio<br>Edición de integración · octubre 2026</small></div></section>'}
function downloads(){var files=[['Inventario de presas','presas-nacionales-v1.json',extended.dams?.length,'Catálogo nacional · fuente secundaria'],['Calidad de Sinaloa','calidad-sinaloa-observaciones-v1.json',extended.quality?.length,'Observaciones sin fecha de muestreo'],['Almacenamiento mensual','jalisco-mensual-v1.json',extended.monthly?.length,'Jalisco · tres presas · 1996–2024'],['Serie diaria · parte 1','jalisco-diario-1.json',null,'Jalisco · datos originales'],['Serie diaria · parte 2','jalisco-diario-2.json',null,'Jalisco · datos originales'],['Serie diaria · parte 3','jalisco-diario-3.json',null,'Jalisco · datos originales']];return '<section class="w23-downloads"><h2>Biblioteca de datos</h2><p>Archivos completos en JSON. La descarga CSV de la barra superior respeta los filtros de consulta.</p><div>'+files.map(function(f){return '<a href="agua/'+f[1]+'" download><span class="w23-file-icon">{ }</span><span><strong>'+f[0]+'</strong><small>'+f[3]+(f[2]?' · '+fmt(f[2],0)+' filas':'')+'</small></span><span aria-hidden="true">↓</span></a>'}).join('')+'<a href="data/agua-v9.json" download><span class="w23-file-icon">{ }</span><span><strong>Base territorial integrada</strong><small>Riego, acuíferos, clima, cortes de Sinaloa y metadatos · V9</small></span><span aria-hidden="true">↓</span></a></div></section>'}
async function loadExtended(){
var names=['presas-nacionales-v1.json','calidad-sinaloa-observaciones-v1.json','jalisco-mensual-v1.json','jalisco-diario-1.json','jalisco-diario-2.json','jalisco-diario-3.json'];
var results=await Promise.allSettled(names.map(async function(n){var r=await fetch('agua/'+n);if(!r.ok)throw Error(n);var j=await r.json();if(!Array.isArray(j.rows))throw Error(n);return j}));
results.forEach(function(r,i){if(r.status==='rejected')loadErrors.push(names[i])});
var get=function(i){return results[i].status==='fulfilled'?results[i].value:null};
var national=get(0);if(national){var legacy=new Map(d.presas.map(function(x){return [x[1],x]}));extended.dams=national.rows.map(function(x){var old=legacy.get(x[0]);return {tipo:'presa',clave:x[0],nombre:x[1]||x[2],estado:x[3]||old?.[0]||'Sin entidad reportada',municipio:x[4],lat:typeof x[6]==='number'?x[6]:null,lon:typeof x[7]==='number'?x[7]:null,namo:x[17],region:x[5],uso:x[8],corriente:x[9],fuente:national.fuente,url:national.url}});var seen=new Set(extended.dams.map(function(x){return x.clave}));damLegacy().forEach(function(x){if(!seen.has(x.clave))extended.dams.push(x)});d.estados=Array.from(new Set(d.estados.concat(extended.dams.map(function(x){return x.estado})))).sort(function(a,b){return a.localeCompare(b,'es')})}
var quality=get(1);if(quality)extended.quality=quality.rows.map(function(x){return {tipo:'quality',estado:'Sinaloa',observacion:x[0],clave:x[1],nombre:x[2],conductividad:x[3],ph:x[4],temperatura:x[5],od:x[6],sst:x[7],nitrogeno:x[8],fosforo:x[9],caudal:x[10],fuente:quality.fuente,url:quality.origen}});
var monthly=get(2);if(monthly)extended.monthly=monthly.rows.map(function(x){return {tipo:'storage',estado:'Jalisco',clave:x[0],fecha:x[1],dias:x[2],volumen:x[3],minimo:x[4],maximo:x[5],fraccion_namo:x[6],dato:'Media mensual · '+x[2]+' días',fuente:monthly.fuente,url:monthly.url}});
if([3,4,5].every(function(i){return get(i)}))extended.daily=[3,4,5].flatMap(function(i){var j=get(i);return j.rows.map(function(x){return {tipo:'storage',estado:'Jalisco',clave:x[1],fecha:x[0],volumen:x[2],elevacion:x[3],fraccion_namo:x[4],dato:'Observación diaria',fuente:'Réplica histórica SIH / GROWA',url:j.source}})});
}
function damLegacy(){return d.presas.map(function(x){return {tipo:'presa',estado:x[0],clave:x[1],nombre:x[2],municipio:x[3],lat:x[4],lon:x[5],namo:x[6],fuente:'Inventario territorial V9'}})}
function timeChart(key,title,unit){
var temporal=filtered.filter(function(x){return typeof x[key]==='number'&&Number.isFinite(x[key])&&(x.fecha||x.year)});
var id=function(x){return x.estado+' / '+(x.clave||x.estado)};
var keys=Array.from(new Set(temporal.map(id))).sort();if(!keys.includes(seriesKey))seriesKey=keys[0]||'';
var rows=temporal.filter(function(x){return id(x)===seriesKey}).sort(function(a,b){return String(a.fecha||a.year).localeCompare(String(b.fecha||b.year))});
var control='<div class="w23-chart-controls"><label>Serie<select id="w23-series">'+keys.map(function(k){return '<option'+(k===seriesKey?' selected':'')+'>'+esc(k)+'</option>'}).join('')+'</select></label>'+(view==='storage'?'<label>Frecuencia de Jalisco<select id="w23-frequency"><option value="monthly"'+(frequency==='monthly'?' selected':'')+'>Mensual</option><option value="daily"'+(frequency==='daily'?' selected':'')+'>Diaria</option></select></label>':'')+'</div>';
if(!rows.length)return '<section class="w23-chart">'+control+clean()+'</section>';
var date=function(x){return Date.parse(String(x.fecha||x.year)+(x.fecha?(x.fecha.length===7?'-01':''):'-01-01'))};
var lo=Math.min(...rows.map(function(x){return x[key]})),hi=Math.max(...rows.map(function(x){return x[key]})),pad=(hi-lo)*.12||1;lo-=pad;hi+=pad;
var t0=date(rows[0]),t1=date(rows[rows.length-1]);var xp=function(x){return 70+(date(x)-t0)/(t1-t0||1)*830},yp=function(x){return 220-(x-lo)/(hi-lo)*175};
var segments=[],segment=[],prev=null,maxGap=view==='storage'?(frequency==='daily'?86400000*1.5:86400000*45):86400000*550;
rows.forEach(function(x){if(prev&&date(x)-date(prev)>maxGap){if(segment.length)segments.push(segment);segment=[]}segment.push(x);prev=x});if(segment.length)segments.push(segment);
var svg='<svg viewBox="0 0 950 280" role="img" aria-label="'+esc(title+' de '+seriesKey+'; '+rows.length+' observaciones; '+unit)+'"><title>'+esc(title+' · '+seriesKey)+'</title>';
for(var i=0;i<5;i++){var val=lo+(hi-lo)*i/4,y=yp(val);svg+='<line x1="70" x2="910" y1="'+y+'" y2="'+y+'" stroke="#e3eaf0"/><text x="57" y="'+(y+4)+'" text-anchor="end">'+esc(fmt(val,1))+'</text>'}
segments.forEach(function(seg){svg+='<polyline points="'+seg.map(function(x){return xp(x).toFixed(2)+','+yp(x[key]).toFixed(2)}).join(' ')+'" fill="none" stroke="#087e8b" stroke-width="2.4"/>';if(seg.length===1)svg+='<circle cx="'+xp(seg[0])+'" cy="'+yp(seg[0][key])+'" r="3" fill="#087e8b"/>'});
[0,Math.floor((rows.length-1)/2),rows.length-1].filter(function(x,i,a){return a.indexOf(x)===i}).forEach(function(i){svg+='<text x="'+xp(rows[i])+'" y="249" text-anchor="middle">'+esc(rows[i].fecha||rows[i].year)+'</text>'});svg+='</svg>';
return '<section class="w23-chart"><div class="w23-chart-heading"><div><span class="w23-eyebrow">SERIE HISTÓRICA / '+esc(unit)+'</span><h2>'+esc(title)+'</h2></div>'+control+'</div>'+svg+'<div class="w23-chart-foot"><span><i></i> '+esc(seriesKey)+'</span><span>'+fmt(rows.length,0)+' observaciones · intervalos sin datos interrumpen la línea</span></div><p class="w23-chart-note">La gráfica muestra una sola serie; la tabla y el CSV incluyen toda la selección activa. Valores de origen, sin imputación.</p></section>';
}

async function init(){
try{
d=dataNode&&dataNode.textContent?JSON.parse(dataNode.textContent):null;
if(!d||!Array.isArray(d.presas)||!Array.isArray(d.acuiferos))throw Error('Base de agua no disponible');
await loadExtended();
var st=E('w17-state');st.innerHTML='<option value="all">Todas las entidades</option>'+d.estados.map(function(x){return '<option value="'+esc(x)+'">'+esc(x)+'</option>'}).join('');
var p=new URLSearchParams(location.search),valid=d.estados.some(function(x){return x===p.get('aguaEstado')});region=p.get('aguaEstado')==='all'?'all':valid?p.get('aguaEstado'):'Sinaloa';st.value=region;
if(LABELS[p.get('aguaVista')])view=p.get('aguaVista');
search=String(p.get('aguaQuery')||'').slice(0,100);mun=String(p.get('aguaMunicipio')||'').slice(0,100);
period=/^(19|20)\d{2}$/.test(p.get('aguaPeriodo')||'')?p.get('aguaPeriodo'):'all';
frequency=p.get('aguaFrecuencia')==='daily'?'daily':'monthly';seriesKey=String(p.get('aguaSerie')||'');geo=['geo','nogeo'].includes(p.get('aguaGeo'))?p.get('aguaGeo'):'all';minCap=p.get('aguaMin')||'';maxCap=p.get('aguaMax')||'';E('w21-geo').value=geo;E('w21-cap-min').value=minCap;E('w21-cap-max').value=maxCap;
E('w17-search').value=search;
var counts={presas:damRows().length,quality:qualityRows().length,storage:new Set(d.sinaloa.concat(d.jalisco,d.sistemas).map(function(x){return x[0]})).size,catalog:Object.keys(d).filter(function(k){return Array.isArray(d[k])&&k!=='estados'}).length};
Object.keys(counts).forEach(function(k){var n=root.querySelector('[data-w17-view="'+k+'"] small');if(n)n.textContent=new Intl.NumberFormat('es-MX').format(counts[k]);});
var units=root.querySelector('[data-w17-view="quality"]');if(units)units.title='Sitios resumidos en la base integrada; no número de muestras';
filters();renderContent();
}catch(e){E('w17-content').innerHTML='<div class="v22-error">No fue posible leer la base integrada. '+esc(e.message)+'</div>';console.error('GROWA Agua V22',e)}
}
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&mapExpanded){mapExpanded=false;var el=E('v22-map')?.parentElement;if(el)el.classList.remove('v22-map-expanded');var exit=E('v22-exit-map');if(exit)exit.hidden=true;if(map)setTimeout(function(){map.invalidateSize()},100)}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
var mo=new MutationObserver(function(){if(!root.hidden&&E('v22-map')){if(!map)drawMap();else setTimeout(function(){if(map)map.invalidateSize()},80)}});mo.observe(root,{attributes:true,attributeFilter:['hidden']});
})();