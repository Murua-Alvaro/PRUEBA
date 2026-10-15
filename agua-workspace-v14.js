/* GROWA / Agua — data explorer V14
   Standalone, namespaced DOM state machine. No fake live readings or placeholder data.
   Source: JSON embedded by the static Render bundle.
*/
(()=>{'use strict';
const root=document.getElementById('panel-agua');if(!root)return;
const $=id=>document.getElementById(id);
const fmt=(n,d=1)=>n==null||!Number.isFinite(+n)?'—':new Intl.NumberFormat('es-MX',{maximumFractionDigits:d}).format(+n);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
const n=v=>v===null||v===''||v===undefined?null:Number(v);
const slug=s=>norm(s).toLowerCase().replace(/[^a-z0-9]+/g,'-');
const names={presas:['CARTOGRAFÍA E INFRAESTRUCTURA','Presas y embalses','Localización y capacidad nominal de las instalaciones catalogadas.'],acuiferos:['AGUA SUBTERRÁNEA','Acuíferos','Recarga, extracción registrada y disponibilidad administrativa por acuífero.'],cuencas:['HIDROLOGÍA SUPERFICIAL','Cuencas y caudales','Cobertura nacional de disponibilidad y límites del inventario regional.'],riego:['OPERACIÓN AGRÍCOLA','Distritos de riego','Agua distribuida y superficie regada por ciclo agrícola, 1997/98–2023/24.'],clima:['SERIES METEOROLÓGICAS','Clima y agua','Precipitación y evapotranspiración de referencia, 2003–2025.'],almacenamiento:['OBSERVACIÓN DE EMBALSES','Almacenamiento','Cortes históricos de embalses, únicamente donde la serie está integrada.'],comparar:['ANÁLISIS TERRITORIAL','Comparar estados','Dos entidades, una variable y un periodo compatible.'],calidad:['SITIOS DE MONITOREO','Calidad del agua','Inventario de sitios, sin inferencias de calidad sanitaria actual.'],fuentes:['TRANSPARENCIA METODOLÓGICA','Fuentes y cobertura','Origen, escalas, fechas, registros faltantes y límites de interpretación.']};
const sources=[
 ['Distritos de riego','1997/98–2023/24','CONAGUA · series distritales compiladas','https://www.gob.mx/conagua'],
 ['Clima y ET₀','2003–2025','NASA POWER / integración GROWA','https://power.larc.nasa.gov/'],
 ['Inventario georreferenciado de presas','75 puntos / 5 entidades','Catálogo derivado de CONAGUA, fuente secundaria','https://github.com/lapanquecita/conagua-presas'],
 ['Almacenamiento Sinaloa','95 cortes de sistema de 4 presas y 26 cortes individuales','Compilación parcial; no representa todas las presas','https://sih.conagua.gob.mx/presas.html'],
 ['Almacenamiento Jalisco','1,000 observaciones mensuales publicadas de 1,018','SIH / compilación; verificar meses faltantes','https://sih.conagua.gob.mx/presas.html'],
 ['Acuíferos','216 registros, corte transversal','Compilación secundaria; vigencia normativa por confirmar','https://sigagis.conagua.gob.mx/gas1/sections/acuerdos_dof.html'],
 ['Cuencas y caudales','757 cuencas nacionales, un corte de 2020','Sin asignación geográfica estatal validada ni series de caudal','https://sih.conagua.gob.mx/hidros.html'],
 ['Calidad del agua','223 sitios de Sinaloa','Fechas de medición sin validar; no establecer tendencias','https://www.gob.mx/conagua']
];
const S={view:'presas',state:'Sinaloa',search:'',min:0,sort:'capacidad',saldo:'todos',metric:'lluvia',from:null,to:null,compare:'Sonora',compareMetric:'riego',storageCode:'',basemap:'calles',selected:'',page:1,limit:12,inspector:true,showTable:true,filterOpen:false,showPoints:true};
let D=null,map=null,mapTiles=null,tileErrors=0,mapMarks=new Map(),toastTimer=null,initialized=false;
const belongs=x=>norm(x[0])===norm(S.state);
const dams=()=>D.presas.filter(belongs);
const aquifers=()=>D.acuiferos.filter(belongs);
const irrigation=()=>D.riego.filter(belongs).sort((a,b)=>a[1]-b[1]);
const climate=()=>D.clima.filter(belongs).sort((a,b)=>a[1]-b[1]);
const quality=()=>D.calidad.filter(belongs);
const listYears=(view)=>view==='riego'?irrigation().map(x=>x[1]):view==='clima'?climate().map(x=>x[1]):[];
const dataMeta=view=>({presas:['Presa','Municipio','NAMO (hm³)','Clave'],acuiferos:['Acuífero','Clave','Recarga (hm³/año)','VEAS (hm³/año)','Saldo (hm³/año)'],calidad:['Sitio de muestreo','Clave','Registros','pH medio','Fechas verificadas']})[view];
const rowData=()=>{
 let rows=[];
 if(S.view==='presas')rows=dams().filter(x=>(n(x[6])??0)>=S.min).map(x=>({id:String(x[1]),text:x[2]+' '+x[3]+' '+x[1],cols:[x[2],x[3],fmt(x[6]),x[1]],sort:[x[2],x[3],n(x[6])??0,x[1]],raw:x}));
 if(S.view==='acuiferos')rows=aquifers().filter(x=>S.saldo==='todos'||(S.saldo==='negativo'?x[6]===1:x[6]!==1)).map(x=>({id:String(x[1]),text:x[1]+' '+x[2],cols:[x[2],x[1],fmt(x[3]),fmt(x[4]),fmt(x[5])],sort:[x[2],x[1],n(x[3])??0,n(x[4])??0,n(x[5])??0],raw:x}));
 if(S.view==='calidad')rows=quality().map(x=>({id:String(x[1]),text:x[1]+' '+x[2],cols:[x[2],x[1],fmt(x[3],0),fmt(x[5],2),fmt(x[4],0)],sort:[x[2],x[1],x[3],n(x[5])??0,x[4]],raw:x}));
 if(S.search.trim())rows=rows.filter(x=>norm(x.text).includes(norm(S.search.trim())));
 const sortCol=S.sort==='nombre'?0:S.sort==='municipio'&&S.view==='presas'?1:S.view==='presas'?2:S.view==='acuiferos'&&S.sort==='saldo'?4:S.view==='acuiferos'&&S.sort==='recarga'?2:S.view==='calidad'&&S.sort==='cantidad'?2:0;
 rows.sort((a,b)=>{const x=a.sort[sortCol],y=b.sort[sortCol];return typeof x==='number'&&typeof y==='number'?(S.view==='acuiferos'&&S.sort==='saldo'?x-y:y-x):String(x).localeCompare(String(y),'es',{numeric:true})});
 return rows;
};
const periodFilter=(arr)=>arr.filter(x=>(S.from==null||x[1]>=S.from)&&(S.to==null||x[1]<=S.to));
const notice=(msg)=>{const box=$('aw-toast');if(!box)return;box.textContent=msg;box.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>box.hidden=true,2900)};
const warning=(s,cls='')=>'<div class="aw-context-note '+cls+'">'+s+'</div>';
const renderStat=(title,val,desc)=>'<div class="aw-stat"><span>'+esc(title)+'</span><strong>'+esc(val)+'</strong><small>'+esc(desc)+'</small></div>';
const sourceLine=txt=>'<div class="aw-data-source">'+esc(txt)+' · <a href="https://sih.conagua.gob.mx/" target="_blank" rel="noopener noreferrer">SIH / CONAGUA ↗</a> · <button class="aw-mini-button" type="button" data-aw-view="fuentes">Ficha metodológica ↗</button></div>';
const empty=(head,txt)=>'<div class="aw-unsupported"><strong>'+esc(head)+'</strong><p>'+esc(txt)+'</p></div>';
function setStatus(){
 const b=names[S.view]||names.presas;root.dataset.awView=S.view;
 $('aw-section-tag').textContent=b[0];$('aw-section-title').textContent=b[1];$('aw-section-desc').textContent=b[2];
 root.querySelectorAll('.aw-tabs [data-aw-view]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.awView===S.view)));
 const title='GROWA | '+b[1]+' · '+S.state;document.title=title;
 root.classList.toggle('aw-inspector-hidden',!S.inspector);
 root.classList.toggle('aw-filters-open',S.filterOpen);
 const mb=root.querySelector('[data-aw-action="filters"]');if(mb)mb.setAttribute('aria-expanded',String(S.filterOpen));
}
function selector(label,id,opts,value,description=''){
 return '<div class="aw-filter-group"><label for="'+id+'">'+label+'</label><select id="'+id+'">'+opts.map(o=>'<option value="'+esc(o[0])+'" '+(String(o[0])===String(value)?'selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select>'+(description?'<small>'+esc(description)+'</small>':'')+'</div>';
}
function renderFilters(){
 $('aw-state').value=S.state;$('aw-search').value=S.search;
 const searchGroup=$('aw-search-group');if(searchGroup)searchGroup.hidden=!['presas','acuiferos','calidad'].includes(S.view);
 let html='';
 if(S.view==='presas')html=selector('Capacidad NAMO mínima','aw-min',[[0,'Todas'],[100,'100 hm³ o más'],[500,'500 hm³ o más'],[1000,'1,000 hm³ o más']],S.min,'Capacidad nominal; no es el volumen almacenado.')+
 selector('Ordenar por','aw-sort',[['capacidad','Mayor capacidad'],['nombre','Nombre A–Z'],['municipio','Municipio A–Z']],S.sort);
 if(S.view==='acuiferos')html=selector('Condición del balance','aw-saldo',[['todos','Todos'],['negativo','Disponibilidad negativa'],['no-negativo','No negativos']],S.saldo)+selector('Ordenar por','aw-sort',[['saldo','Saldo más negativo'],['nombre','Nombre A–Z'],['recarga','Mayor recarga']],S.sort,'No equivale a riesgo actual.');
 if(S.view==='calidad')html=selector('Ordenar por','aw-sort',[['nombre','Nombre A–Z'],['cantidad','Mayor cantidad de registros']],S.sort,'Las fechas de muestreo no están verificadas.');
 if(S.view==='riego'||S.view==='clima'){const yrs=listYears(S.view),low=Math.min(...yrs),hi=Math.max(...yrs),choices=Array.from({length:hi-low+1},(_,i)=>[low+i,String(low+i)+(S.view==='riego'?'/'+String(low+i+1).slice(-2):'')]);
  html=selector('Desde','aw-from',choices,S.from??low)+selector('Hasta','aw-to',choices,S.to??hi);
  if(S.view==='clima')html+=selector('Indicador climático','aw-metric',[['lluvia','Precipitación (mm)'],['et0','Evapotranspiración ET₀ (mm)'],['balance','P − ET₀ (mm)']],S.metric);
 }
 if(S.view==='comparar')html=selector('Comparar contra','aw-compare',D.estados.filter(x=>x!==S.state).map(x=>[x,x]),S.compare)+selector('Indicador','aw-comparemetric',[['riego','Volumen de riego (hm³)'],['lluvia','Precipitación (mm)'],['et0','ET₀ (mm)']],S.compareMetric);
 if(S.view==='almacenamiento'&&S.state==='Jalisco'){
  const codes=[...new Set(D.jalisco.map(x=>x[0]))];if(!codes.includes(S.storageCode))S.storageCode=codes[0];
  html=selector('Clave de presa','aw-storage',codes.map(x=>[x,x]),S.storageCode,'Serie mensual disponible para este identificador.');
 }
 $('aw-context-filters').innerHTML=html;
 const controlRows=['presas','acuiferos','calidad'].includes(S.view)?rowData():S.view==='riego'?periodFilter(irrigation()):S.view==='clima'?periodFilter(climate()):S.view==='comparar'?D.estados.length:S.view==='almacenamiento'?S.state==='Sinaloa'?D.sistemas.filter(x=>x[0]==='V-II_4_PRESAS'):S.state==='Jalisco'?D.jalisco.filter(x=>x[0]===S.storageCode):[]:D.cobertura.filter(belongs);
 $('aw-visible-count').textContent=fmt(Array.isArray(controlRows)?controlRows.length:controlRows,0);
 $('aw-filter-count').textContent=(S.search?1:0)+(S.min>0?1:0)+(S.saldo!=='todos'?1:0)+' filtros manuales';
}
function tableMarkup(head,rows,{view=S.view,pageable=true,selectable=false}={}){
 const total=rows.length,size=S.limit,pages=Math.max(1,Math.ceil(total/size));S.page=Math.min(Math.max(1,S.page),pages);
 const shown=pageable?rows.slice((S.page-1)*size,S.page*size):rows;
 const th=head.map((h,i)=>'<th scope="col">'+esc(h)+'</th>').join('');
 const trs=shown.map(r=>{const arr=r.cols||r;const id=r.id??'',isPick=selectable&&id!=='';return '<tr '+(isPick?'data-aw-pick="'+esc(id)+'" tabindex="0" aria-selected="'+(S.selected===id)+'"':'')+'>'+arr.map((x,i)=>'<td class="'+(i===0?'aw-text-cell':'')+'">'+esc(x==null?'—':x)+'</td>').join('')+'</tr>'}).join('');
 return '<div class="aw-data-table-wrap"><table class="aw-data-table"><thead><tr>'+th+'</tr></thead><tbody>'+ (trs||'<tr><td colspan="'+head.length+'">No hay registros para los filtros seleccionados.</td></tr>')+'</tbody></table></div>'+
 (pageable?'<div class="aw-pagination"><span>'+fmt(total,0)+' registros · Página '+S.page+' de '+pages+'</span><div class="aw-pagination-controls"><button type="button" data-aw-page="-1" '+(S.page<=1?'disabled':'')+'>← Anterior</button><button type="button" data-aw-page="1" '+(S.page>=pages?'disabled':'')+'>Siguiente →</button></div></div>':'');
}
function drawer(title,subtitle,thead,rows,opt={}){return '<section class="aw-bottom-drawer"><div class="aw-drawer-title"><strong>'+esc(title)+'</strong><span>'+esc(subtitle)+'</span></div>'+tableMarkup(thead,rows,opt)+'</section>'}
function chart(series,title,units,secondary,axis="annual"){
 const streams=[{data:series,color:'#147995',label:title},...(secondary?[{data:secondary.data,color:'#c28c4e',label:secondary.label}]:[])];
 const pts=streams.flatMap(x=>x.data).filter(x=>x[1]!=null&&Number.isFinite(n(x[1])));
 if(pts.length<2)return empty('Sin serie suficiente','La selección necesita al menos dos observaciones con valor numérico.');
 const years=pts.map(x=>x[0]),values=pts.map(x=>x[1]);
 const x0=Math.min(...years),x1=Math.max(...years),min=Math.min(...values),max=Math.max(...values);
 const floor=Math.min(0,min),ceil=Math.max(max,floor+1),margin=(ceil-floor)*.08||1;
 const lo=floor<0?floor-margin:0,hi=ceil+margin;
 const X=x=>52+816*(x-x0)/(x1-x0||1),Y=y=>225-186*(y-lo)/(hi-lo);
 const formatX=v=>axis==='date'?new Date(v*86400000).toISOString().slice(0,10):axis==='month'?String(Math.floor(v/12))+'-'+String(v%12+1).padStart(2,'0'):String(Math.round(v));
 const gap=axis==='date'?22:axis==='month'?1.5:1.5;
 const ticks=[0,.25,.5,.75,1].map(t=>{const y=225-t*186;return '<line x1="52" y1="'+y+'" x2="875" y2="'+y+'" stroke="#e5edef"/><text x="44" y="'+(y+4)+'" text-anchor="end" fill="#78909d" font-size="12">'+esc(fmt(lo+(hi-lo)*t,0))+'</text>'}).join('');
 const lines=streams.map(stream=>{
  const points=stream.data.filter(x=>x[1]!=null&&Number.isFinite(n(x[1])));
  const path=points.map((r,i)=>((!i||r[0]-points[i-1][0]>gap)?'M':'L')+X(r[0]).toFixed(1)+','+Y(r[1]).toFixed(1)).join(' ');
  const circles=points.map((r,i)=>i%Math.max(1,Math.floor(points.length/30))?'':'<circle cx="'+X(r[0])+'" cy="'+Y(r[1])+'" r="4" fill="'+stream.color+'" stroke="#fff" stroke-width="1.3"><title>'+esc(r[0]+': '+fmt(r[1],1)+' '+units+' · '+stream.label)+'</title></circle>').join('');
  return '<path d="'+path+'" fill="none" stroke="'+stream.color+'" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>'+circles;
 }).join('');
 const legend=secondary?'<text x="55" y="15" font-size="11" fill="#147995">● '+esc(title)+'</text><text x="320" y="15" font-size="11" fill="#c28c4e">● '+esc(secondary.label)+'</text>':'';
 return '<svg class="aw-chart" viewBox="0 0 920 265" role="img" aria-label="'+esc(title)+' en '+units+'" xmlns="http://www.w3.org/2000/svg">'+ticks+legend+lines+'<text x="53" y="256" fill="#7c929b" font-size="12" >'+esc(formatX(x0))+'</text><text x="870" y="256" text-anchor="end" fill="#7c929b" font-size="12">'+esc(formatX(x1))+'</text></svg>';
}
function timePane(title,description,serie,unit,raw,heads,mapper,opt={}){
 const last=serie.at(-1),prev=serie.at(-2),diff=last&&prev&&prev[1]?(last[1]/prev[1]-1)*100:null;
 const summary='<div class="aw-statgrid">'+renderStat('Última observación',last?fmt(last[1])+' '+unit:'—',last?'Periodo '+last[0]:'Sin dato')+
 renderStat('Cambio frente a observación previa',diff==null?'—':(diff>=0?'+':'')+fmt(diff,1)+' %','Variación descriptiva; no explica sus causas')+
 renderStat('Observaciones disponibles',fmt(serie.length,0),'El intervalo refleja los filtros seleccionados')+'</div>';
 return summary+warning('<strong>Interpretación:</strong> '+esc(description))+
 '<section class="aw-dataviz"><div class="aw-chart-title"><div><span class="aw-overline">EVOLUCIÓN DOCUMENTADA</span><h3>'+esc(title)+'</h3><p>'+esc(unit)+' · Datos observados; no se interpolan periodos faltantes.</p></div><button type="button" class="aw-mini-button" data-aw-action="export">↓ CSV</button></div>'+chart(serie,title,unit)+'</section>'+
 drawer('Datos de la serie','Explore los valores y unidades por periodo',heads,raw.map(mapper),{pageable:true});
}
function renderPresas(){
 const rows=rowData(),cap=rows.reduce((s,x)=>s+(n(x.raw[6])||0),0);
 $('aw-main').innerHTML='<div class="aw-main-title"><div><span class="aw-overline">VISOR GEOESPACIAL · '+esc(S.state.toUpperCase())+'</span><h3>Localización de infraestructura</h3><p>Inventario filtrado · Las burbujas reflejan capacidad nominal NAMO</p></div><button type="button" class="aw-mini-button" data-aw-action="geojson">↓ GeoJSON</button></div>'+
 warning('<strong>Qué representa el mapa:</strong> ubicación de instalaciones y capacidad de diseño en hm³. No representa polígonos de embalse, disponibilidad diaria ni porcentaje de llenado.')+
 '<section class="aw-map-shell" id="aw-map-shell"><div class="aw-map-toolbar"><span><strong>'+fmt(rows.length,0)+'</strong> presas visibles · NAMO agregado '+fmt(cap,1)+' hm³</span><div class="aw-toolbar-controls"><label for="aw-basemap">Mapa base</label><select id="aw-basemap"><option value="calles" '+(S.basemap==='calles'?'selected':'')+'>Calles (OSM)</option><option value="topo" '+(S.basemap==='topo'?'selected':'')+'>Topográfico (Esri)</option><option value="sat" '+(S.basemap==='sat'?'selected':'')+'>Imágenes (Esri)</option></select><details class="aw-layer-dropdown"><summary>Capas ▾</summary><label><input type="checkbox" id="aw-layer-points" '+(S.showPoints?"checked":"")+'> Puntos de presas</label><small>Sin capas de cuencas inventadas</small></details><button class="aw-mini-button" data-aw-action="fit">Enfocar</button><button class="aw-mini-button" data-aw-action="fullscreen">Pantalla completa ⛶</button></div></div>'+
 '<div class="aw-map-stage"><div id="aw-map" aria-label="Mapa interactivo con puntos de presas"></div><div class="aw-map-overlay"><strong>'+fmt(rows.length,0)+'</strong><small><i></i>UBICACIONES DEL CATÁLOGO</small></div></div><div class="aw-map-legend"><span><i class="aw-legend-dot"></i> Capacidad NAMO (símbolo proporcional)</span><b>Coordenadas aproximadas de catálogo · corte histórico</b></div></section>'+
 drawer('Inventario de presas','Seleccione una fila para abrir su ficha',dataMeta('presas'),rows,{selectable:true})+
 sourceLine('75 presas en la edición V9, distribuidas en cinco entidades; cobertura parcial.');
 if(!S.selected||!rows.some(x=>x.id===S.selected))S.selected=rows[0]?.id||'';
 if(!root.hidden)mountMap(rows);
}
function renderAcuiferos(){
 const rows=rowData(),all=aquifers(),neg=all.filter(x=>x[6]===1),total=all.length;
 const worst=neg.slice().sort((a,b)=>(n(a[5])??0)-(n(b[5])??0)).slice(0,6);
 const maxAbs=Math.max(1,...worst.map(x=>Math.abs(n(x[5])??0)));
 $('aw-main').innerHTML='<div class="aw-main-title"><div><span class="aw-overline">BALANCE CONTABLE SUBTERRÁNEO</span><h3>Disponibilidad por acuífero</h3><p>Corte transversal del inventario, sin serie temporal certificada</p></div></div>'+
 warning('<strong>Cómo interpretarlo:</strong> DMA = recarga − descarga natural comprometida − VEAS. El saldo negativo indica una disponibilidad administrativa menor que cero; no significa que el acuífero esté físicamente vacío.')+
 '<div class="aw-statgrid">'+renderStat('Acuíferos identificados',fmt(total,0),'Cobertura del inventario regional')+
 renderStat('Saldos negativos',fmt(neg.length,0)+' / '+fmt(total,0),'No clasifica riesgo actual')+
 renderStat('Recarga del catálogo',fmt(all.reduce((s,x)=>s+(n(x[3])||0),0),1)+' hm³/año','Total descriptivo de registros')+'</div>'+
 '<div class="aw-dataviz"><div class="aw-chart-title"><div><span class="aw-overline">LOS SALDOS NEGATIVOS MÁS GRANDES</span><h3>Acuíferos prioritarios para revisión documental</h3><p>Orden de magnitud contable, no ranking oficial de sobreexplotación actual.</p></div></div>'+
 (worst.length?'<div class="aw-breakdown">'+worst.map(x=>'<div><span>'+esc(x[2])+'</span><b>'+fmt(x[5],1)+' hm³/año</b></div>').join('')+'</div>':empty('Sin saldos negativos registrados','Ninguno de los acuíferos incluidos cumple el filtro de saldo negativo.'))+'</div>'+
 drawer('Catálogo de acuíferos','Seleccione una fila para ver recarga, VEAS y disponibilidad',dataMeta('acuiferos'),rows,{selectable:true})+
 sourceLine('Balances recopilados de un único corte; verificar acuerdos vigentes de CONAGUA.');
 if(!S.selected||!rows.some(x=>x.id===S.selected))S.selected=rows[0]?.id||'';
}
function renderRiego(){
 const rows=periodFilter(irrigation()),serie=rows.map(x=>[x[1],n(x[2])]);
 $('aw-main').innerHTML='<div class="aw-main-title"><div><span class="aw-overline">SERIE 1997/98–2023/24</span><h3>Agua distribuida a distritos de riego</h3></div></div>'+
 timePane('Volumen distribuido','Mide agua distribuida en distritos de riego por ciclo agrícola. No es el consumo de cada cultivo ni el almacenamiento actual del estado.',serie,'hm³',rows,['Ciclo','Agua distribuida (hm³)','Superficie regada (ha)','m³/ha','Distritos'],x=>[x[1]+'/'+String(x[1]+1).slice(-2),fmt(x[2]),fmt(x[3],0),fmt(x[4],0),fmt(x[5],0)])+sourceLine('CONAGUA / integración histórica por distritos; 27 ciclos por entidad.');
}
function renderClima(){
 const rows=periodFilter(climate()),idx=S.metric==='et0'?3:S.metric==='balance'?4:2,metricName=S.metric==='et0'?'Evapotranspiración de referencia ET₀':S.metric==='balance'?'Diferencia P − ET₀':'Precipitación municipal media',serie=rows.map(x=>[x[1],n(x[idx])]);
 $('aw-main').innerHTML='<div class="aw-main-title"><div><span class="aw-overline">SERIE 2003–2025</span><h3>Condiciones atmosféricas anuales</h3></div></div>'+
 timePane(metricName,'Valores medios de los municipios observados. P − ET₀ es una diferencia climática, no un balance hidrológico de cuenca. No es una medición directa del agua disponible.',serie,'mm',rows,['Año','Precipitación (mm)','ET₀ (mm)','P−ET₀ (mm)'],x=>[x[1],fmt(x[2]),fmt(x[3]),fmt(x[4])])+sourceLine('NASA POWER / compilación GROWA; agregación municipal simple, no ponderada por área.');
}
function renderStorage(){
 let data=[],title='',note='',headers=[],items=[];
 if(S.state==='Sinaloa'){
  data=D.sistemas.filter(x=>x[0]==='V-II_4_PRESAS').sort((a,b)=>a[1].localeCompare(b[1]));
  title='Almacenamiento del sistema de cuatro presas';note='Cortes de junio a octubre de 2026 del sistema de cuatro presas. No cubren las 11 presas inventariadas ni una serie diaria completa.';
  items=data.map(x=>[Date.parse(x[1])/86400000,n(x[3])]);headers=['Fecha','Presas','Almacenamiento (hm³)','% NAMO'];data=data.map(x=>[x[1],x[2],fmt(x[3]),fmt(x[4],2)]);
 } else if(S.state==='Jalisco'){
  const all=D.jalisco.filter(x=>x[0]===S.storageCode).sort((a,b)=>a[1].localeCompare(b[1]));
  title='Serie mensual · '+S.storageCode;note='Sólo muestra los meses disponibles de la presa seleccionada. La edición web incorpora 1,000 de 1,018 observaciones del conjunto original.';
  items=all.map(x=>[Number(x[1].slice(0,4))*12+Number(x[1].slice(5,7))-1,n(x[2])]);
  headers=['Mes','Volumen (hm³)','Porcentaje NAMO','Días observados'];data=all.map(x=>[x[1],fmt(x[2]),fmt(x[3],2),fmt(x[4],0)]);
 }
 $('aw-main').innerHTML='<div class="aw-main-title"><div><span class="aw-overline">EMBALSES / OBSERVACIONES REALES</span><h3>Histórico de almacenamiento</h3></div></div>'+
 (!data.length?empty('Sin histórico integrado para '+S.state,'Se dispone del inventario geográfico, pero no de una serie de almacenamiento validada para esta entidad. Para mediciones actuales consulte el SIH/CONAGUA.') :
 warning('<strong>Ámbito de la serie:</strong> '+esc(note))+
 '<div class="aw-statgrid">'+renderStat('Observaciones visibles',fmt(data.length,0),'Cortes efectivamente integrados')+
 renderStat('Última observación',fmt(items.at(-1)?.[1],1)+' hm³',S.state==='Sinaloa'?D.sistemas.filter(x=>x[0]==='V-II_4_PRESAS').at(-1)?.[1]||'—':S.storageCode)+
 renderStat('Cobertura',S.state==='Sinaloa'?'Cuatro presas':'Una presa','No representa todo el estado')+'</div>'+
 '<section class="aw-dataviz"><div class="aw-chart-title"><div><span class="aw-overline">MEDICIONES POR FECHA</span><h3>'+esc(title)+'</h3></div></div>'+chart(items,title,'hm³',null,S.state==='Sinaloa'?'date':'month')+'</section>'+
 drawer('Registros de almacenamiento','Sin relleno de periodos faltantes',headers,data,{pageable:true})+
 (S.state==='Sinaloa'?drawer('Puntos individuales / Sinaloa','Fechas aisladas; no formar serie continua',['Fecha','Clave','Volumen (hm³)','% NAMO'],D.sinaloa.map(x=>[x[1],x[0],fmt(x[2]),fmt(x[3])]),{pageable:false}):''))+
 sourceLine('Datos parciales identificados en SIH y compilaciones V9; no son datos en tiempo real.');
}
function compareSeries(state,metric){const a=metric==='riego'?D.riego:D.clima,idx=metric==='et0'?3:2;return a.filter(x=>norm(x[0])===norm(state)).sort((x,y)=>x[1]-y[1]).map(x=>[x[1],n(x[idx])])}
function renderCompare(){
 if(S.compare===S.state)S.compare=D.estados.find(x=>x!==S.state)||S.state;
 const a=compareSeries(S.state,S.compareMetric),b=compareSeries(S.compare,S.compareMetric);
 const combined=[...new Set([...a,...b].map(x=>x[0]))].sort((x,y)=>x-y);
 const am=new Map(a),bm=new Map(b);
 const rows=combined.map(y=>{const x=am.get(y),z=bm.get(y);return [S.compareMetric==='riego'?y+'/'+String(y+1).slice(-2):y,fmt(x),fmt(z),x!=null&&z!=null?fmt(x-z):'—']});
 const lbl=S.compareMetric==='riego'?'Volumen distribuido en riego (hm³)':S.compareMetric==='et0'?'ET₀ media municipal (mm)':'Precipitación media municipal (mm)',unit=S.compareMetric==='riego'?'hm³':'mm';
 $('aw-main').innerHTML='<div class="aw-main-title"><div><span class="aw-overline">COMPARACIÓN HOMOGÉNEA / '+esc(unit)+'</span><h3>'+esc(S.state)+' y '+esc(S.compare)+'</h3></div><button type="button" class="aw-mini-button" data-aw-action="swap">Intercambiar estados ⇄</button></div>'+
 warning('<strong>Criterio de lectura:</strong> estas series permiten comparar el mismo indicador en dos estados. Los valores absolutos de riego dependen de la escala de sus distritos. No controlan superficie agrícola, estructura productiva ni diferencias climáticas.')+
 '<section class="aw-dataviz"><div class="aw-chart-title"><div><span class="aw-overline">DOS ENTIDADES / UN INDICADOR</span><h3>'+esc(lbl)+'</h3><p>Los puntos corresponden a años o ciclos coincidentes del conjunto integrado.</p></div></div>'+
 chart(a,S.state,unit,{data:b,label:S.compare})+'</section>'+
 drawer('Comparación anual · '+unit,'Diferencia aritmética; no prueba causalidad',['Periodo',S.state+' ('+unit+')',S.compare+' ('+unit+')','Diferencia ('+unit+')'],rows,{pageable:true})+
 sourceLine(S.compareMetric==='riego'?'CONAGUA · volumen distribuido por ciclo agrícola':'NASA POWER · promedio simple municipal.');
}
function renderQuality(){
 if(S.state!=='Sinaloa'){$('aw-main').innerHTML=empty('Sin tabla de calidad del agua para '+S.state,'Esta edición web sólo incorpora sitios de calidad de Sinaloa. No se muestran valores estimados, estaciones de otro estado ni supuestas mediciones actuales.')+sourceLine('RENAMECA / CONAGUA: cotejo de fechas de muestreo pendiente.');return}
 const rows=rowData(),all=quality(),count=all.reduce((s,x)=>s+(n(x[3])||0),0);
 $('aw-main').innerHTML='<div class="aw-main-title"><div><span class="aw-overline">CATÁLOGO DE SITIOS / SINALOA</span><h3>Indicadores recuperados de calidad</h3></div></div>'+
 warning('<strong>Límite crítico:</strong> las '+fmt(all.length,0)+' estaciones carecen de fechas verificadas en esta edición. Los valores medios de pH <strong>no son evidencia de calidad actual, potabilidad ni cumplimiento normativo</strong>.')+
 '<div class="aw-statgrid">'+renderStat('Sitios recuperados',fmt(all.length,0),'Sólo Sinaloa')+renderStat('Filas de medición',fmt(count,0),'Fechas no acreditadas')+renderStat('Fechas verificadas','0','No inferir tendencias')+'</div>'+
 drawer('Sitios del inventario','Seleccione un sitio para consultar su ficha',dataMeta('calidad'),rows,{selectable:true})+
 sourceLine('Compilación derivada de CONAGUA/RENAMECA, pendiente de cotejo oficial.');
 if(!S.selected||!rows.some(x=>x.id===S.selected))S.selected=rows[0]?.id||'';
}
function renderCuencas(){
 const hyd=D.cobertura.find(x=>belongs(x)&&x[1]==='estaciones_hidrometricas_catalogo');
 $('aw-main').innerHTML='<div class="aw-main-title"><div><span class="aw-overline">DISPONIBILIDAD SUPERFICIAL</span><h3>Cuencas y observación fluvial</h3></div></div>'+
 warning('<strong>Datos nacionales, no estatales:</strong> las 757 cuencas pertenecen a un único corte de 2020; esta edición no contiene polígonos para asignarlas con rigor a '+esc(S.state)+'.')+
 '<div class="aw-statgrid">'+renderStat('Cuencas nacionales',fmt(757,0),'Inventario de corte único / 2020')+renderStat('Con disponibilidad',fmt(653,0),'Clasificación transversal nacional')+renderStat('Sin disponibilidad',fmt(104,0),'Clasificación transversal nacional')+'</div>'+
 empty('La cartografía de cuencas no está validada','Se evita dibujar polígonos inventados o asignar a Sinaloa caudales que no corresponden. El catálogo de estaciones no contiene todavía series observadas de caudal para este estado.')+
 '<div class="aw-dataviz"><div class="aw-chart-title"><div><span class="aw-overline">INVENTARIO DE ESTACIONES</span><h3>Cobertura disponible</h3></div></div><div class="aw-breakdown"><div><span>Estaciones catalogadas en '+esc(S.state)+'</span><b>'+fmt(hyd?.[2]??0,0)+'</b></div><div><span>Series históricas de caudal integradas</span><b>0</b></div></div>'+
 '<div class="aw-link-row"><a target="_blank" rel="noopener noreferrer" href="https://sih.conagua.gob.mx/hidros.html">Consultar estaciones hidrométricas / SIH ↗</a></div></div>';
}
function renderSources(){
 const cover=D.cobertura.filter(belongs);
 $('aw-main').innerHTML='<div class="aw-main-title"><div><span class="aw-overline">TRAZABILIDAD DE LOS CONJUNTOS</span><h3>Catálogo de fuentes</h3></div></div>'+
 warning('<strong>Importante:</strong> GROWA no es el organismo emisor. Estas bases son compilaciones; algunas carecen de fecha normativa validada o polígonos. No se muestran como datos de tiempo real.')+
 '<div class="aw-source-grid">'+sources.map(([title,period,source,url])=>'<article class="aw-source-card"><span>'+esc(period)+'</span><h3>'+esc(title)+'</h3><p>'+esc(source)+'</p><a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">Abrir fuente ↗</a></article>').join('')+'</div>'+
 drawer('Inventario técnico de '+S.state,'Registros y periodos presentes en el paquete V9',['Componente','Registros','Inicio','Fin','Tipo'],cover.map(x=>[x[1],fmt(x[2],0),x[3],x[4],x[5]]),{pageable:true});
}
function inspector(){
 $('aw-inspector-heading').textContent=S.view==='presas'?'Expediente de presa':S.view==='acuiferos'?'Ficha de acuífero':S.view==='calidad'?'Ficha del sitio':S.view==='riego'?'Lectura del indicador':S.view==='clima'?'Lectura del indicador':'Notas de interpretación';
 const rows=['presas','acuiferos','calidad'].includes(S.view)?rowData():[],item=rows.find(x=>x.id===S.selected);
 const facts=(arr)=>'<table class="aw-facts"><tbody>'+arr.map(x=>'<tr><th>'+esc(x[0])+'</th><td>'+esc(x[1])+'</td></tr>').join('')+'</tbody></table>';
 let html='';
 if(S.view==='presas'&&item){const x=item.raw;
  html='<span class="aw-flag">PRESA · '+esc(x[1])+'</span><h4 class="aw-record-name">'+esc(x[2])+'</h4><p class="aw-record-place">'+esc(x[3])+' · '+esc(S.state)+'</p><div class="aw-key-figure"><span>CAPACIDAD NOMINAL NAMO</span><strong>'+fmt(x[6],1)+' hm³</strong><small>Dato de diseño; no representa el volumen actual</small></div>'+
  facts([['Clave',x[1]],['Latitud',fmt(x[4],5)],['Longitud',fmt(x[5],5)],['Municipio',x[3]],['Estado',S.state]])+
  '<p class="aw-inspector-note">La ubicación procede de un catálogo secundario y no representa la extensión del embalse. Compare con SIH para obtener niveles observados.</p>'+
  '<div class="aw-link-row"><button type="button" data-aw-action="focus-selected">Centrar en mapa ↗</button><button type="button" data-aw-action="copy-coords">Copiar coordenadas</button></div>';
 }else if(S.view==='acuiferos'&&item){const x=item.raw;
  html='<span class="aw-flag">ACUÍFERO · '+esc(x[1])+'</span><h4 class="aw-record-name">'+esc(x[2])+'</h4><p class="aw-record-place">'+esc(S.state)+' · balance transversal</p><div class="aw-key-figure"><span>DISPONIBILIDAD ADMINISTRATIVA</span><strong>'+fmt(x[5],2)+' hm³/año</strong><small>'+(x[6]===1?'Saldo negativo':'Saldo no negativo')+'</small></div>'+
  facts([['Clave',x[1]],['Recarga anual',fmt(x[3],2)+' hm³/año'],['VEAS',fmt(x[4],2)+' hm³/año'],['Saldo',fmt(x[5],2)+' hm³/año']])+
  '<p class="aw-inspector-note">La disponibilidad es administrativa. No permite inferir volumen extraído físicamente o nivel piezométrico. Falta validar vigencia normativa con CONAGUA.</p>';
 }else if(S.view==='calidad'&&item){const x=item.raw;
  html='<span class="aw-flag">SITIO DE MONITOREO</span><h4 class="aw-record-name">'+esc(x[2])+'</h4><p class="aw-record-place">'+esc(x[1])+' · Sinaloa</p><div class="aw-key-figure"><span>pH MEDIO DEL CONJUNTO</span><strong>'+fmt(x[5],2)+'</strong><small>Sin fechas de muestreo verificadas</small></div>'+
  facts([['Registros',fmt(x[3],0)],['Fechas válidas',fmt(x[4],0)],['Clave',x[1]]])+
  '<p class="aw-inspector-note">No atribuir a este pH medio condición sanitaria, tendencia ni cumplimiento de norma. Es un registro histórico no fechado.</p>';
 }else if(S.view==='riego')html='<span class="aw-flag">CICLO AGRÍCOLA</span><h4 class="aw-record-name">Volumen distribuido</h4><p class="aw-record-place">1997/98–2023/24</p><div class="aw-key-figure"><span>UNIDAD UTILIZADA</span><strong>hm³</strong><small>Un hm³ equivale a 1,000,000 m³.</small></div><p class="aw-inspector-note">Es agua distribuida en distritos de riego y no la totalidad del recurso estatal. La variación entre ciclos es descriptiva, no causal.</p>';
 else if(S.view==='clima')html='<span class="aw-flag">NASA POWER / HISTÓRICO</span><h4 class="aw-record-name">Clima municipal</h4><p class="aw-record-place">2003–2025 · año calendario</p><div class="aw-key-figure"><span>PRECIPITACIÓN / ET₀</span><strong>mm/año</strong><small>Promedio entre municipios de la muestra</small></div><p class="aw-inspector-note">ET₀ es la demanda atmosférica de referencia. P−ET₀ NO es disponibilidad hídrica o escurrimiento real.</p>';
 else html='<span class="aw-flag">LECTURA DEL PAQUETE</span><h4 class="aw-record-name">'+esc(names[S.view][1])+'</h4><p class="aw-record-place">'+esc(S.state)+' · octubre de 2026</p><p class="aw-inspector-note">Abra las fichas metodológicas para conocer la escala, el periodo y las restricciones de uso. Esta edición no ofrece telemetría en tiempo real.</p>';
 $('aw-inspector-content').innerHTML=html;
}
function clearMap(){if(map){try{map.remove()}catch(e){}map=null}mapMarks.clear();mapTiles=null;tileErrors=0}
const tiles={calles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png','© OpenStreetMap contributors'],topo:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}','© Esri, HERE, Garmin, USGS'],sat:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}','© Esri, Maxar, Earthstar Geographics']};
function vectorFallback(rows){
 clearMap();
 const node=$('aw-map');if(!node)return;
 const pts=rows.filter(x=>Number.isFinite(n(x.raw[4]))&&Number.isFinite(n(x.raw[5]))),minLat=Math.min(...pts.map(x=>x.raw[4]),22)-1,maxLat=Math.max(...pts.map(x=>x.raw[4]),26)+1,minLon=Math.min(...pts.map(x=>x.raw[5]),-112)-1,maxLon=Math.max(...pts.map(x=>x.raw[5]),-104)+1;
 const x=lon=>50+800*(lon-minLon)/(maxLon-minLon),y=lat=>380-310*(lat-minLat)/(maxLat-minLat);
 const grid=Array.from({length:6},(_,i)=>{const a=50+i*160,b=70+i*62;return '<line x1="'+a+'" y1="50" x2="'+a+'" y2="402" stroke="#d3e1e6"/><line x1="50" y1="'+b+'" x2="850" y2="'+b+'" stroke="#d3e1e6"/>'}).join('');
 node.innerHTML='<svg class="aw-vector" viewBox="0 0 900 450" role="img" aria-label="Diagrama alternativo de coordenadas, sin mapa base">'+grid+'<text x="49" y="29">CARTOGRAFÍA EXTERNA NO DISPONIBLE · VISTA POR COORDENADAS (NO MAPA OFICIAL)</text>'+(S.showPoints?pts:[]).map(r=>'<circle data-aw-pick="'+esc(r.id)+'" cx="'+x(r.raw[5])+'" cy="'+y(r.raw[4])+'" r="'+Math.max(5,Math.min(16,4+Math.sqrt(r.raw[6])/4))+'" fill="'+(r.id===S.selected?'#123d56':'#197d9a')+'"><title>'+esc(r.raw[2]+' · '+fmt(r.raw[6])+' hm³')+'</title></circle>').join('')+'<text x="50" y="434">OESTE</text><text x="850" y="434" text-anchor="end">ESTE</text></svg>';
}
function mountMap(rows){
 clearMap();const node=$('aw-map');if(!node||S.view!=='presas'||root.hidden)return;
 const points=rows.filter(r=>Number.isFinite(n(r.raw[4]))&&Number.isFinite(n(r.raw[5])));
 if(!points.length){node.innerHTML='<div class="aw-empty-inspector">No hay puntos georreferenciados que cumplan los filtros.</div>';return}
 if(!window.L){vectorFallback(rows);return}
 requestAnimationFrame(()=>{
  if(root.hidden||S.view!=='presas'||!$('aw-map'))return;
  try{
   map=L.map(node,{scrollWheelZoom:false,preferCanvas:true,zoomControl:true,attributionControl:true});
   const selectedTiles=tiles[S.basemap]||tiles.calles;
   mapTiles=L.tileLayer(selectedTiles[0],{attribution:selectedTiles[1],maxZoom:17}).addTo(map);
   mapTiles.on('tileerror',()=>{
     tileErrors++;if(tileErrors===4&&map){
      if(S.basemap!=='calles'){S.basemap='calles';const x=$('aw-basemap');if(x)x.value='calles';map.removeLayer(mapTiles);tileErrors=0;mapTiles=L.tileLayer(tiles.calles[0],{attribution:tiles.calles[1],maxZoom:17}).addTo(map);mapTiles.bringToBack();mapTiles.on('tileerror',()=>{if(++tileErrors>4)vectorFallback(rows)})}
      else vectorFallback(rows)
     }
   });
   L.control.scale({metric:true,imperial:false,position:'bottomleft'}).addTo(map);
   const bounds=[];
   for(const row of points){
    const p=row.raw,size=Math.min(15,5+Math.sqrt(Math.max(0,n(p[6])||0))/4);
    const mark=L.circleMarker([p[4],p[5]],{radius:size,color:'#fff',weight:1.5,fillColor:'#1884a3',fillOpacity:.92}).addTo(map);
    mark.bindTooltip(esc(p[2])+' · '+fmt(p[6])+' hm³ NAMO',{direction:'top'});
    mark.on('click',()=>pick(row.id,true));
    bounds.push([p[4],p[5]]);mapMarks.set(row.id,mark);
   }
   map.fitBounds(bounds,{padding:[25,25],maxZoom:8});if(!S.showPoints)for(const marker of mapMarks.values())map.removeLayer(marker);highlightMap();setTimeout(()=>map&&map.invalidateSize(false),150);
  }catch(err){console.warn('Mapa Leaflet no disponible:',err);vectorFallback(rows)}
 });
}
function highlightMap(){
 if(!map)return;for(const [id,mark]of mapMarks){const r=dams().find(x=>String(x[1])===id),size=Math.min(15,5+Math.sqrt(n(r?.[6])||0)/4);mark.setStyle(id===S.selected?{radius:size+3,color:'#fff',weight:3,fillColor:'#153c53',fillOpacity:1}:{radius:size,color:'#fff',weight:1.5,fillColor:'#1884a3',fillOpacity:.92})}
}
function pick(id,move=false){
 S.selected=String(id);inspector();root.querySelectorAll('[data-aw-pick]').forEach(el=>el.setAttribute('aria-selected',String(el.dataset.awPick===id)));
 highlightMap();if(window.innerWidth<=1000){S.inspector=true;root.classList.remove('aw-inspector-hidden');root.classList.add('aw-mobile-inspector')}const marker=mapMarks.get(S.selected);if(marker&&map&&move){map.panTo(marker.getLatLng());marker.openTooltip()}
}
function focusSelected(){if(map&&mapMarks.has(S.selected)){const marker=mapMarks.get(S.selected);map.setView(marker.getLatLng(),Math.max(map.getZoom(),8));marker.openTooltip()}else notice('Seleccione una presa en el catálogo.')}
function render(){
 if(!D)return;
 clearMap();setStatus();renderFilters();S.page=Math.max(1,S.page);
 if(S.view==='presas')renderPresas();
 if(S.view==='acuiferos')renderAcuiferos();
 if(S.view==='cuencas')renderCuencas();
 if(S.view==='riego')renderRiego();
 if(S.view==='clima')renderClima();
 if(S.view==='almacenamiento')renderStorage();
 if(S.view==='comparar')renderCompare();
 if(S.view==='calidad')renderQuality();
 if(S.view==='fuentes')renderSources();
 inspector();updateURL();
}
function serialize(u){
 const params={wa:S.view,ws:S.state,wq:S.search,wb:S.basemap,wmin:String(S.min),wsort:S.sort,wsaldo:S.saldo,wfrom:S.from==null?'':String(S.from),wto:S.to==null?'':String(S.to),wm:S.metric,wcomp:S.compare,wcm:S.compareMetric,wsc:S.storageCode};
 for(const [k,v]of Object.entries(params)){if(v===''||v===null)u.searchParams.delete(k);else u.searchParams.set(k,v)}
}
function updateURL(){if(root.hidden&&location.hash!=='#agua')return;const u=new URL(location.href);serialize(u);u.hash='agua';history.replaceState(null,'',u.pathname+u.search+u.hash)}
function download(name,blob,mime){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([blob],{type:mime}));a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);notice('Archivo preparado: '+name)}
function csvCell(x){let s=String(x??'');if(/^[=+\-@\t\r]/.test(s)&&!/^[+-]?\d+(?:\.\d+)?$/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'}
function exportCSV(){
 let hdr=[],rows=[];
 if(S.view==='presas'){hdr=['estado','clave','presa','municipio','latitud','longitud','capacidad_namo_hm3'];rows=rowData().map(x=>x.raw)}
 if(S.view==='acuiferos'){hdr=['estado','clave','acuifero','recarga_hm3_anio','veas_hm3_anio','saldo_hm3_anio','saldo_negativo'];rows=rowData().map(x=>x.raw)}
 if(S.view==='calidad'){hdr=['estado','clave_sitio','sitio','registros','registros_fecha_verificada','ph_medio'];rows=rowData().map(x=>x.raw)}
 if(S.view==='riego'){hdr=['estado','anio_inicio_ciclo','volumen_distribuido_hm3','superficie_regada_ha','m3_ha','distritos'];rows=periodFilter(irrigation())}
 if(S.view==='clima'){hdr=['estado','anio','precipitacion_mm','et0_mm','diferencia_p_et0_mm','razon'];rows=periodFilter(climate())}
 if(S.view==='almacenamiento'){if(S.state==='Sinaloa'){hdr=['sistema','fecha','num_presas','volumen_hm3','porcentaje_namo'];rows=D.sistemas.filter(x=>x[0]==='V-II_4_PRESAS')}else if(S.state==='Jalisco'){hdr=['clave','mes','volumen_hm3','pct_namo','dias_observados','dias_mes'];rows=D.jalisco.filter(x=>x[0]===S.storageCode)}}
 if(S.view==='comparar'){hdr=['periodo',S.state,S.compare,'unidad'];const a=new Map(compareSeries(S.state,S.compareMetric)),b=new Map(compareSeries(S.compare,S.compareMetric));const ys=[...new Set([...a.keys(),...b.keys()])].sort();rows=ys.map(y=>[y,a.get(y)??'',b.get(y)??'',S.compareMetric==='riego'?'hm3':'mm'])}
 if(S.view==='cuencas'||S.view==='fuentes'){hdr=['entidad','componente','registros','inicio','fin','temporalidad'];rows=D.cobertura.filter(belongs)}
 if(!rows.length){notice('Esta vista no contiene registros exportables para la selección.');return}
 const csv='\ufeff'+[hdr,...rows].map(r=>r.map(csvCell).join(',')).join('\r\n');
 download('growa-agua-'+slug(S.state)+'-'+S.view+'.csv',csv,'text/csv;charset=utf-8');
}
function exportGeo(){
 if(S.view!=='presas')return;
 const collection={type:'FeatureCollection',features:rowData().map(r=>{const x=r.raw;return {type:'Feature',geometry:{type:'Point',coordinates:[x[5],x[4]]},properties:{estado:x[0],clave:x[1],presa:x[2],municipio:x[3],capacidad_namo_hm3:x[6],nota:'Capacidad nominal; no lectura en tiempo real'}}})};
 download('growa-presas-'+slug(S.state)+'.geojson',JSON.stringify(collection,null,2),'application/geo+json');
}
function resetFilters(){S.search='';S.min=0;S.sort=S.view==='presas'?'capacidad':S.view==='acuiferos'?'saldo':'nombre';S.saldo='todos';S.from=null;S.to=null;S.page=1;S.selected='';render();notice('Filtros restablecidos.')}
function changeView(view){
 if(!names[view])return;S.view=view;S.search='';S.min=0;S.saldo='todos';S.from=null;S.to=null;S.page=1;S.selected='';S.sort=view==='presas'?'capacidad':view==='acuiferos'?'saldo':'nombre';S.filterOpen=false;render();
}
function changeState(state){if(!D.estados.includes(state))return;S.state=state;S.page=1;S.selected='';S.search='';S.from=null;S.to=null;S.storageCode='';if(S.compare===S.state)S.compare=D.estados.find(x=>x!==S.state)||S.state;render()}
function share(){const u=new URL(location.href);serialize(u);u.hash='agua';const link=u.toString();if(navigator.clipboard?.writeText)navigator.clipboard.writeText(link).then(()=>notice('Enlace con la consulta copiado.')).catch(()=>fallbackCopy(link));else fallbackCopy(link)}
function fallbackCopy(text){const field=document.createElement('textarea');field.value=text;field.style.position='fixed';field.style.left='-100vw';document.body.append(field);field.select();try{document.execCommand('copy');notice('Enlace copiado.')}catch(e){notice('Copie el enlace desde la barra del navegador.')}field.remove()}
function action(name){
 if(name==='help'){$('aw-guide').showModal();return}
 if(name==='close-guide'){$('aw-guide').close();return}
 if(name==='export'){exportCSV();return}
 if(name==='geojson'){exportGeo();return}
 if(name==='reset'){resetFilters();return}
 if(name==='link'){share();return}
 if(name==='swap'){const old=S.state;S.state=S.compare;S.compare=old;render();return}
 if(name==='fit'){if(map&&mapMarks.size)map.fitBounds(L.featureGroup([...mapMarks.values()]).getBounds(),{padding:[25,25],maxZoom:8});else if(S.view==='presas')mountMap(rowData());return}
 if(name==='fullscreen'){const el=$('aw-map-shell');if(!el)return;if(document.fullscreenElement)document.exitFullscreen();else el.requestFullscreen?.();return}
 if(name==='filters'){S.filterOpen=!S.filterOpen;root.classList.toggle('aw-filters-open',S.filterOpen);root.querySelector('[data-aw-action="filters"]')?.setAttribute('aria-expanded',String(S.filterOpen));return}
 if(name==='show-inspector'){S.inspector=true;root.classList.remove('aw-inspector-hidden');root.classList.add('aw-mobile-inspector');return}
 if(name==='hide-inspector'){S.inspector=false;root.classList.add('aw-inspector-hidden');root.classList.remove('aw-mobile-inspector');return}
 if(name==='focus-selected'){focusSelected();return}
 if(name==='copy-coords'){const r=dams().find(x=>String(x[1])===S.selected);if(r){const s=r[4]+', '+r[5];if(navigator.clipboard?.writeText)navigator.clipboard.writeText(s).then(()=>notice('Coordenadas copiadas.'));else fallbackCopy(s)}}
}
root.addEventListener('click',e=>{
 const nav=e.target.closest('[data-aw-view]');if(nav){changeView(nav.dataset.awView);return}
 const act=e.target.closest('[data-aw-action]');if(act){action(act.dataset.awAction);return}
 const pg=e.target.closest('[data-aw-page]');if(pg){S.page+=Number(pg.dataset.awPage);render();return}
 const pk=e.target.closest('[data-aw-pick]');if(pk){pick(pk.dataset.awPick,true);return}
});
root.addEventListener('keydown',e=>{if(e.target.matches('tr[data-aw-pick]')&&['Enter',' '].includes(e.key)){e.preventDefault();pick(e.target.dataset.awPick,true)}if(e.key==='Escape'&&S.filterOpen){S.filterOpen=false;root.classList.remove('aw-filters-open')}});
root.addEventListener('change',e=>{
 const id=e.target.id,v=e.target.value;
 if(id==='aw-state'){changeState(v);return}
 if(id==='aw-min'){S.min=Number(v)||0;S.page=1;render();return}
 if(id==='aw-sort'){S.sort=v;S.page=1;render();return}
 if(id==='aw-saldo'){S.saldo=v;S.page=1;render();return}
 if(id==='aw-from'||id==='aw-to'){S[id==='aw-from'?'from':'to']=Number(v);if(S.from!=null&&S.to!=null&&S.from>S.to){if(id==='aw-from')S.to=S.from;else S.from=S.to}S.page=1;render();return}
 if(id==='aw-metric'){S.metric=v;render();return}
 if(id==='aw-compare'){S.compare=v;render();return}
 if(id==='aw-comparemetric'){S.compareMetric=v;render();return}
 if(id==='aw-storage'){S.storageCode=v;S.page=1;render();return}
 if(id==='aw-layer-points'){S.showPoints=e.target.checked;if(map){for(const marker of mapMarks.values()){if(S.showPoints)marker.addTo(map);else map.removeLayer(marker)}}else if(S.view==='presas')mountMap(rowData());return}
 if(id==='aw-basemap'){S.basemap=v;const rows=rowData();mountMap(rows);updateURL();return}
});
root.addEventListener('input',e=>{if(e.target.id==='aw-search'){S.search=e.target.value;S.page=1;clearMap();setStatus();const box=$('aw-visible-count');if(box)box.textContent=fmt(rowData().length,0);if(S.view==='presas')renderPresas();else if(S.view==='acuiferos')renderAcuiferos();else if(S.view==='calidad')renderQuality();inspector()}});
document.addEventListener('keydown',e=>{if(root.hidden)return;if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){e.preventDefault();$('aw-search')?.focus()}});
const observer=new MutationObserver(()=>{if(!root.hidden&&D&&S.view==='presas'&&!map){const node=$('aw-map');if(node&&!node.querySelector('svg.aw-vector'))mountMap(rowData())}});
observer.observe(root,{attributes:true,attributeFilter:['hidden']});
function restore(){
 const q=new URL(location.href).searchParams,v=q.get('wa'),st=q.get('ws'),base=q.get('wb');
 if(names[v])S.view=v;if(D.estados.includes(st))S.state=st;if(base&&tiles[base])S.basemap=base;
 S.search=String(q.get('wq')||'').slice(0,90);
 const min=Number(q.get('wmin'));if([0,100,500,1000].includes(min))S.min=min;
 const sort=q.get('wsort');if(['capacidad','nombre','municipio','saldo','recarga','cantidad'].includes(sort))S.sort=sort;
 const saldo=q.get('wsaldo');if(['todos','negativo','no-negativo'].includes(saldo))S.saldo=saldo;
 for(const [param,key]of [['wfrom','from'],['wto','to']]){const v=q.get(param);if(v&&/^20\d{2}$|^19\d{2}$/.test(v))S[key]=Number(v)}
 if(['lluvia','et0','balance'].includes(q.get('wm')))S.metric=q.get('wm');
 if(D.estados.includes(q.get('wcomp')))S.compare=q.get('wcomp');
 if(['riego','lluvia','et0'].includes(q.get('wcm')))S.compareMetric=q.get('wcm');
 S.storageCode=String(q.get('wsc')||'').slice(0,40);
}
function init(){
 try{const el=$('wa-embedded-dataset');if(!el?.textContent)throw Error('Dataset V9 no empacado');
 D=JSON.parse(el.textContent);
 if(!Array.isArray(D.estados)||D.estados.length!==5||D.presas.length!==75||D.acuiferos.length!==216)throw Error('Control de integridad del catálogo no superado');
 restore();initialized=true;render();
 window.GrowaWaterV14={snapshot:()=>({state:S.state,view:S.view,rows:rowData().length,selected:S.selected}),navigate:changeView,selectState:changeState,exportCSV};
 }catch(err){console.error('GROWA WATER V14',err);const main=$('aw-main');if(main)main.innerHTML=empty('No se pudieron cargar los registros',String(err.message||err)+'. Revise la integración o la conexión al repositorio.')}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();