/* GROWA Agua V22 · visor real conectado a la base embebida V9, sin dependencias de compilación */
(function(){
'use strict';
var root=document.getElementById('panel-agua'),dataNode=document.getElementById('wa-embedded-dataset');
if(!root)return;
var E=function(id){return document.getElementById(id)};
var esc=function(x){return String(x===null||x===undefined?'—':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var norm=function(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()};
var fmt=function(v,d){return typeof v==='number'&&Number.isFinite(v)?new Intl.NumberFormat('es-MX',{maximumFractionDigits:d===undefined?1:d}).format(v):String(v===undefined||v===null?'—':v)};
var d,view='overview',region='Sinaloa',search='',mun='',period='all',geo='all',minCap='',maxCap='',inspectorTab='general',sel=0,page=0,records=[],filtered=[],columns=[],map=null;
var LABELS={overview:['Atlas hídrico','Inventario territorial e indicadores documentados'],presas:['Presas y embalses','Inventario de obras con localización geográfica'],regional:['Inventario regional','Composición de infraestructura por entidad'],storage:['Almacenamiento','Cortes observados y series parciales documentadas'],acuiferos:['Acuíferos','Disponibilidad administrativa y claves oficiales'],riego:['Distritos de riego','Volúmenes y superficies en series agrícolas'],cuencas:['Cuencas y estaciones','Cobertura reportada y sus límites de interpretación'],quality:['Calidad del agua','Inventario de sitios de muestreo sin fechas verificadas'],clima:['Clima y balance','Precipitación, evapotranspiración y balance anual'],trend:['Tendencias de riego','Resultados descriptivos de las series disponibles'],catalog:['Catálogo de datos','Inventario de los archivos y su cobertura'],sources:['Metodología y fuentes','Alcances, cautelas y trazabilidad']};
var COL={presa:[['nombre','Presa'],['municipio','Municipio'],['estado','Entidad'],['namo','NAMO · hm³'],['clave','Clave']],acuifero:[['nombre','Acuífero'],['clave','Clave'],['recarga','Recarga · hm³/año'],['extraccion','Extracción reportada · hm³/año'],['bandera','Indicador de déficit']],riego:[['year','Ciclo'],['estado','Entidad'],['agua','Volumen · hm³'],['superficie','Superficie registrada'],['complemento','Variable de origen']],clima:[['year','Año'],['estado','Entidad'],['lluvia','Precipitación · mm'],['et0','ET₀ · mm'],['balance','Balance · mm']],storage:[['fecha','Fecha'],['clave','Serie / presa'],['volumen','Volumen · hm³'],['dato','Dato complementario']],quality:[['nombre','Sitio'],['clave','Clave'],['estado','Entidad'],['muestras','Filas de origen'],['fechadas','Filas con fecha'],['ph','pH medio']],trend:[['nombre','Distrito'],['clave','Clave'],['observaciones','Observaciones'],['slope','Estimación'],['significance','Clasificación']],catalog:[['estado','Entidad'],['nombre','Conjunto'],['cantidad','Registros declarados'],['inicio','Inicio'],['fin','Fin'],['tipo','Tipo']],cuencas:[['estado','Entidad'],['nombre','Conjunto'],['cantidad','Registros declarados'],['inicio','Inicio'],['fin','Fin']]};
function same(a,b){return norm(a)===norm(b)}
function stateOK(x){return region==='all'||same(x,region)}
function clean(){return '<div class="v22-error">No hay registros para los criterios actuales. Pruebe con otro estado, periodo o elimine un filtro. No se imputan valores faltantes.</div>'}
function damRows(){return d.presas.map(function(x){return {tipo:'presa',estado:x[0],clave:x[1],nombre:x[2],municipio:x[3],lat:Number(x[4]),lon:Number(x[5]),namo:Number(x[6]),fuente:'Inventario integrado / CONAGUA',raw:x}})}
function aqRows(){return d.acuiferos.map(function(x){return {tipo:'acuifero',estado:x[0],clave:x[1],nombre:x[2],recarga:x[3],extraccion:x[4],disponibilidad:x[5],bandera:x[6]===1?'Sí':'No',fuente:'Disponibilidad administrativa de acuíferos / CONAGUA',raw:x}})}
function riegoRows(){return d.riego.map(function(x){return {tipo:'riego',estado:x[0],year:x[1],agua:x[2],superficie:x[3],complemento:x[4],otra:x[5],fuente:'Estadísticas agrícolas de distritos de riego',raw:x}})}
function climaRows(){return d.clima.map(function(x){return {tipo:'clima',estado:x[0],year:x[1],lluvia:x[2],et0:x[3],balance:x[4],indice:x[5],fuente:'Series históricas de clima y balance incluidas en edición V9',raw:x}})}
function storageRows(){
var a=d.sinaloa.map(function(x){return {tipo:'storage',estado:'Sinaloa',fecha:x[1],clave:x[0],volumen:x[2],dato:x[3],fuente:x[4],raw:x}});
a=a.concat(d.jalisco.map(function(x){return {tipo:'storage',estado:'Jalisco',fecha:x[1],clave:x[0],volumen:x[2],dato:x[3],fuente:'Serie mensual Jalisco, edición web parcial',raw:x}}));
a=a.concat(d.sistemas.map(function(x){return {tipo:'storage',estado:'Sinaloa',fecha:x[1],clave:x[0],volumen:x[3],dato:x[4],fuente:'Registro de sistemas de presas, corte documental',raw:x}}));
return a;
}
function qualityRows(){return d.calidad.map(function(x){return {tipo:'quality',estado:x[0],clave:x[1],nombre:x[2],muestras:x[3],fechadas:x[4],ph:x[5],fuente:'Sitios de calidad: sin fecha de muestreo verificada',raw:x}})}
function trendRows(){return d.tendencias.map(function(x){return {tipo:'trend',estado:x[0],clave:x[1],nombre:x[2],observaciones:x[3],slope:x[4],estadistico:x[5],significance:x[6],fuente:'Cálculo de tendencias sobre series históricas',raw:x}})}
function coverageRows(){return d.cobertura.map(function(x){return {tipo:'catalog',estado:x[0],nombre:x[1],cantidad:x[2],inicio:x[3],fin:x[4],tipo:x[5],fuente:'Matriz de cobertura V9',raw:x}})}
function setRows(){
var key=view==='presas'||view==='regional'||view==='overview'?'presa':view==='acuiferos'?'acuifero':view==='riego'?'riego':view==='clima'?'clima':view==='storage'?'storage':view==='quality'?'quality':view==='trend'?'trend':view==='cuencas'?'cuencas':'catalog';
records=(key==='presa'?damRows():key==='acuifero'?aqRows():key==='riego'?riegoRows():key==='clima'?climaRows():key==='storage'?storageRows():key==='quality'?qualityRows():key==='trend'?trendRows():coverageRows());
if(view==='cuencas')records=records.filter(function(x){return /cuencas|estaciones|hidrometric/i.test(x.nombre)});
columns=COL[key]||COL.catalog;
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
var periods=Array.from(new Set(records.map(function(x){return x.year||String(x.fecha||'').slice(0,4)}).filter(function(x){return /^(19|20)\d{2}$/.test(String(x))}))).sort().reverse();
var p=E('w17-period');if(p){p.innerHTML='<option value="all">Todos los periodos</option>'+periods.map(function(x){return '<option value="'+esc(x)+'"'+(String(x)===String(period)?' selected':'')+'>'+esc(x)+'</option>'}).join('');p.disabled=!periods.length}
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
page=Math.max(0,Math.min(page,Math.ceil(filtered.length/18)-1));
sel=Math.max(0,Math.min(sel,filtered.length-1));
}
function metric(label,value,note){return '<div class="v22-metric"><span class="v22-metric-label">'+esc(label)+'</span><strong>'+esc(value)+'</strong><small>'+esc(note||'')+'</small></div>'}
function metrics(){
var allP=damRows().filter(function(x){return stateOK(x.estado)}),allA=aqRows().filter(function(x){return stateOK(x.estado)}),allR=riegoRows().filter(function(x){return stateOK(x.estado)}),allC=climaRows().filter(function(x){return stateOK(x.estado)});
var m=allP.reduce(function(s,x){return s+(Number.isFinite(x.namo)?x.namo:0)},0);
return '<div class="v22-metrics">'+metric('Presas localizadas',fmt(allP.length,0),'Del inventario V9 · no universo nacional')+metric('Capacidad NAMO agregada',fmt(m,1)+' hm³','Capacidad de diseño, no volumen actual')+metric('Acuíferos registrados',fmt(allA.length,0),'Cobertura de la edición integrada')+metric('Ciclos / años',fmt(allR.length,0)+' / '+fmt(allC.length,0),'Riego / clima con observaciones')+'</div>';
}
function table(){
if(!filtered.length)return clean();
var start=page*18,end=Math.min(filtered.length,start+18);
var rows=filtered.slice(start,end);
return '<div class="v22-table-wrap"><table class="v22-table"><thead><tr>'+columns.map(function(c){return '<th scope="col">'+esc(c[1])+'</th>'}).join('')+'</tr></thead><tbody>'+rows.map(function(row,i){var index=start+i;return '<tr data-v22-index="'+index+'" class="'+(index===sel?'v22-selected':'')+'" tabindex="0" title="Abrir expediente">'+columns.map(function(c){var v=row[c[0]];return '<td>'+esc(typeof v==='number'?fmt(v,c[0]==='namo'||c[0]==='agua'?1:2):v)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>'+
'<div class="v22-pager"><span>'+fmt(start+1,0)+'–'+fmt(end,0)+' de '+fmt(filtered.length,0)+' registros · máximo 18 por página</span><div><button type="button" data-v22-page="-1" '+(page===0?'disabled':'')+'>← Anterior</button> <button type="button" data-v22-page="1" '+(end===filtered.length?'disabled':'')+'>Siguiente →</button></div></div>';
}
function mapBlock(){
var pts=filtered.filter(function(x){return Number.isFinite(x.lat)&&Number.isFinite(x.lon)});
return '<div class="v22-map-grid"><div class="v22-map-wrap"><div class="v22-map-top"><span>GROWA · CARTOGRAFÍA</span><span>Inventario documentado</span></div><div id="v22-map" class="v22-map" role="application" aria-label="Mapa de presas"></div></div>'+
'<aside class="v22-map-info"><h3>Selección territorial</h3><p>Los puntos representan coordenadas de presas, no polígonos de embalse. Seleccione un registro para consultar el expediente.</p><div class="v22-map-register">'+pts.slice(0,12).map(function(x){return '<button type="button" data-v22-marker="'+filtered.indexOf(x)+'">'+esc(x.nombre)+'<small>'+esc(x.municipio)+' · '+fmt(x.namo,1)+' hm³ NAMO</small></button>'}).join('')+'</div><p>'+fmt(pts.length,0)+' ubicaciones dentro de la selección. Cartografía © OpenStreetMap.</p></aside></div>';
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
if(view==='catalog')return '<div class="v22-help">Los valores del catálogo describen archivos documentales integrados o inventariados; no implican cobertura geográfica ni series homogéneas completas. Consulte cada expediente antes de comparar periodos.</div>';
if(view==='quality')return '<div class="v22-help">Los sitios de calidad carecen de fechas de muestreo verificadas: no se infiere evolución temporal ni potabilidad. El número de registros por sitio no equivale a un monitoreo reciente.</div>';
if(view==='cuencas')return '<div class="v22-help">La edición no incorpora polígonos ni geometrías oficiales verificadas para las 757 cuencas nacionales. Se muestran únicamente metadatos de cobertura; no se inventa cartografía.</div>';
if(view==='acuiferos')return '<div class="v22-help">Los valores corresponden a datos administrativos de disponibilidad y no representan mediciones instantáneas de nivel piezométrico. Deben contrastarse con el expediente oficial de cada acuífero.</div>';
if(view==='storage')return '<div class="v22-help">No se construye una serie continua uniendo cortes de presas o fechas diferentes. En Jalisco se muestran 1,000 de 1,018 filas del archivo mensual, según las notas del conjunto.</div>';
if(view==='trend')return '<div class="v22-help">La clasificación de tendencias es un atributo de la base original: no valida causalidad ni predice por sí sola los ciclos siguientes.</div>';
if(view==='regional')return '<div class="v22-help">Comparación regional circunscrita a las presas efectivamente georreferenciadas en esta edición, no a las 210 presas principales que monitorea CONAGUA.</div>';
return '<div class="v22-help">Consulta de archivo con trazabilidad. Los datos históricos no son monitoreo en tiempo real. NAMO identifica capacidad de diseño, no almacenamiento disponible hoy.</div>';
}
function renderContent(){
var desc=LABELS[view];E('w17-title').textContent=desc[0];E('w17-subtitle').textContent=desc[1];E('w17-crumb-view').textContent=desc[0].toUpperCase();E('w17-scope').textContent=d.version+' · CORTE '+d.corte;
root.querySelectorAll('[data-w17-view]').forEach(function(btn){btn.setAttribute('aria-current',btn.dataset.w17View===view?'page':'false')});
apply();
E('w17-filters-note').textContent=fmt(filtered.length,0)+' filas consultables · '+(region==='all'?'cinco entidades':region)+' · '+(period==='all'?'todos los periodos':period);
var isMap=['overview','presas','regional'].indexOf(view)!==-1;
var h='<div class="v22-kicker">SISTEMA DE INFORMACIÓN HÍDRICA / CONSULTA DOCUMENTAL</div>';
if(view==='overview')h+='<div class="v22-section-head"><div><h2>Infraestructura y disponibilidad</h2><p>Consulta por entidad, municipio, clave, capacidad y periodo</p></div><small>FUENTE / CONJUNTO INTEGRADO V9</small></div>'+metrics();
if(isMap)h+='<div class="v22-section-head"><div><h2>Localización de presas</h2><p>Distribución espacial de la selección activa · puntos georreferenciados</p></div><small>'+fmt(filtered.length,0)+' registros</small></div>'+mapBlock();
if(view==='riego')h+=bars(filtered,'agua','Volumen distribuido por ciclo · hm³');
if(view==='clima')h+=bars(filtered,'lluvia','Precipitación anual · mm');
if(view==='storage')h+='<div class="v22-kicker">FECHAS Y CORTES DE MEDICIÓN</div>';
if(view==='sources')h+=narrative();
else {h+='<div class="v22-data-band"><div><h3>'+esc(view==='overview'?'Registros de infraestructura':desc[0])+'</h3><span>Haga clic en cualquier fila para abrir su expediente técnico</span></div><button class="w17-btn" type="button" data-w17-action="export">↓ Descargar CSV</button></div>'+table()+narrative();}
E('w17-content').innerHTML=h;
updateInspector();
if(isMap)drawMap();
else if(map){map.remove();map=null}
}
function selectRow(index){if(index<0||index>=filtered.length)return;sel=index;page=Math.floor(index/18);renderContent()}
function detailsValues(){
var x=filtered[sel];if(!x){E('w17-detail-body').innerHTML='<p class="w17-detail-empty">Sin registro seleccionado. Modifique los filtros o seleccione una fila de la tabla.</p>';return;}
var pairs=[],title=x.nombre||x.clave||x.estado||'Registro';
if(inspectorTab==='general')pairs=columns.map(function(c){return [c[1],x[c[0]]]});
if(inspectorTab==='variables')pairs=Object.keys(x).filter(function(k){return k!=='raw'&&k!=='tipo'&&k!=='fuente'&&typeof x[k]==='number'}).map(function(k){return [k,x[k]]});
if(inspectorTab==='location')pairs=[['Entidad',x.estado],['Municipio',x.municipio],['Latitud',x.lat],['Longitud',x.lon],['Coordenadas verificables',Number.isFinite(x.lat)&&Number.isFinite(x.lon)?'Sí · coordenada puntual':'Sin geometría incluida']];
if(inspectorTab==='history')pairs=[['Variable temporal',x.year||x.fecha||'Sin año individual'],['Tipo de registro',x.tipo],['Alcance','Un registro no constituye una serie; consulte los demás cortes de esta base']];
if(inspectorTab==='source')pairs=[['Fuente',x.fuente],['Versión de base',d.version],['Corte de integración',d.corte],['Registro de origen','Conservado sin imputaciones']];
E('w17-detail-body').innerHTML='<h3 class="v22-detail-title">'+esc(title)+'</h3><div class="v22-detail-meta">'+esc(x.tipo.toUpperCase())+' · REGISTRO '+esc(sel+1)+' DE '+esc(filtered.length)+'</div><dl class="v22-dl">'+pairs.map(function(p){return '<div><dt>'+esc(p[0])+'</dt><dd>'+esc(typeof p[1]==='number'?fmt(p[1],4):p[1])+'</dd></div>'}).join('')+'</dl>';
}
function updateInspector(){root.querySelectorAll('[data-w21-tab]').forEach(function(b){b.setAttribute('aria-selected',b.dataset.w21Tab===inspectorTab?'true':'false')});detailsValues()}
function drawMap(){
var mount=E('v22-map');if(!mount)return;
if(map){map.remove();map=null}
var pts=filtered.filter(function(x){return Number.isFinite(x.lat)&&Number.isFinite(x.lon)});
if(!window.L){mount.innerHTML='<div class="v22-map-placeholder">No se pudo cargar la base cartográfica externa. Los registros siguen disponibles en la tabla y en las descargas.</div>';return;}
if(!pts.length){mount.innerHTML='<div class="v22-map-placeholder">No hay coordenadas válidas para la selección actual. Seleccione otra entidad o retire filtros.</div>';return;}
try{
map=L.map(mount,{zoomControl:false,attributionControl:true,scrollWheelZoom:false});
L.control.zoom({position:'bottomright'}).addTo(map);
var tiles=L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:18,attribution:'© OpenStreetMap · CARTO'}).addTo(map);
tiles.on('tileerror',function(){mount.classList.add('v22-tiles-fallback')});
var group=L.featureGroup();
pts.forEach(function(x){
var idx=filtered.indexOf(x),circle=L.circleMarker([x.lat,x.lon],{radius:Math.max(5,Math.min(14,5+Math.sqrt(Math.max(0,x.namo||0))/9)),color:'#fff',weight:1.4,fillColor:'#345c70',fillOpacity:.86});
circle.bindPopup('<strong>'+esc(x.nombre)+'</strong><br>'+esc(x.municipio)+' · '+esc(x.estado)+'<br>NAMO: '+esc(fmt(x.namo,1))+' hm³');
circle.on('click',function(){selectRow(idx)});
group.addLayer(circle);
});
group.addTo(map);map.fitBounds(group.getBounds().pad(.17),{maxZoom:9,padding:[20,20]});
setTimeout(function(){if(map)map.invalidateSize()},120);
}catch(err){mount.innerHTML='<div class="v22-map-placeholder">El mapa no pudo iniciarse. Consulte las ubicaciones verificadas en la tabla.</div>';console.error(err)}
}
function toast(s){var el=E('w17-toast');el.textContent=s;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(function(){el.hidden=true},3000)}
function csv(){
if(!filtered.length){toast('No hay datos que exportar');return}
var cols=Array.from(new Set(columns.map(function(x){return x[0]}).concat(['estado','lat','lon','fuente'])));
var text='\ufeff'+cols.join(',')+'\r\n'+filtered.map(function(x){return cols.map(function(k){return '"'+String(x[k]===undefined||x[k]===null?'':x[k]).replace(/"/g,'""')+'"'}).join(',')}).join('\r\n');
var u=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download='GROWA_agua_'+view+'_'+String(region).replace(/[^a-z0-9]/gi,'_')+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},1200);
toast('Descarga CSV generada con '+filtered.length+' registros');
}
function repaint(resetSelection){if(resetSelection){sel=0;page=0}filters();renderContent()}
root.addEventListener('click',function(ev){
var group=ev.target.closest('[data-w21-group]');if(group){var open=group.getAttribute('aria-expanded')==='true';group.setAttribute('aria-expanded',open?'false':'true');var el=E('w21-group-'+group.dataset.w21Group);if(el)el.hidden=open;return;}
var nav=ev.target.closest('[data-w17-view]');if(nav){view=nav.dataset.w17View;search='';mun='';period='all';geo='all';minCap='';maxCap='';E('w17-search').value='';E('w21-geo').value='all';E('w21-cap-min').value='';E('w21-cap-max').value='';repaint(true);return;}
var row=ev.target.closest('[data-v22-index]');if(row){selectRow(Number(row.dataset.v22Index));return;}
var marker=ev.target.closest('[data-v22-marker]');if(marker){selectRow(Number(marker.dataset.v22Marker));return;}
var pager=ev.target.closest('[data-v22-page]');if(pager){page=Math.max(0,Math.min(Math.ceil(filtered.length/18)-1,page+Number(pager.dataset.v22Page)));renderContent();return;}
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
root.addEventListener('keydown',function(ev){var tr=ev.target.closest('[data-v22-index]');if(tr&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();selectRow(Number(tr.dataset.v22Index))}});
root.addEventListener('change',function(ev){
if(ev.target.id==='w17-state'){region=ev.target.value;mun='';repaint(true)}
if(ev.target.id==='w17-period'){period=ev.target.value;repaint(true)}
if(ev.target.id==='w17-filter'){mun=ev.target.value;repaint(true)}
if(ev.target.id==='w21-geo'){geo=ev.target.value;repaint(true)}
if(ev.target.id==='w21-cap-min'){minCap=ev.target.value;repaint(true)}
if(ev.target.id==='w21-cap-max'){maxCap=ev.target.value;repaint(true)}
});
var searchDelay;
root.addEventListener('input',function(ev){if(ev.target.id==='w17-search'){search=ev.target.value;clearTimeout(searchDelay);searchDelay=setTimeout(function(){repaint(true)},150)}if(ev.target.id==='w17-filter'){mun=ev.target.value;clearTimeout(searchDelay);searchDelay=setTimeout(function(){repaint(true);E('w17-filter').focus()},280)}});
function init(){
try{
d=dataNode&&dataNode.textContent?JSON.parse(dataNode.textContent):null;
if(!d||!Array.isArray(d.presas)||!Array.isArray(d.acuiferos))throw Error('Base de agua no disponible');
var st=E('w17-state');st.innerHTML='<option value="all">Todas las entidades</option>'+d.estados.map(function(x){return '<option value="'+esc(x)+'">'+esc(x)+'</option>'}).join('');
var p=new URLSearchParams(location.search),valid=d.estados.some(function(x){return x===p.get('aguaEstado')});region=valid?p.get('aguaEstado'):'Sinaloa';st.value=region;
if(LABELS[p.get('aguaVista')])view=p.get('aguaVista');
filters();renderContent();
}catch(e){E('w17-content').innerHTML='<div class="v22-error">No fue posible leer la base integrada. '+esc(e.message)+'</div>';console.error('GROWA Agua V22',e)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
var mo=new MutationObserver(function(){if(!root.hidden&&map)setTimeout(function(){if(map)map.invalidateSize()},80)});mo.observe(root,{attributes:true,attributeFilter:['hidden']});
})();