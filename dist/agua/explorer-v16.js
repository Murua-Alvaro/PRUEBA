/* GROWA Water V16 | full observational data explorer, lazy-loaded first-party datasets */
(()=>{'use strict';
function setup(){
const API=window.GrowaWaterInternal;if(!API){console.warn('Water Extra: core not initialized');return;}
const {S,$,esc,fmt,notice}=API;
const VIEWS=['nacional','observaciones','diario'];
const cache=new Map(),loading=new Map();
let selected=null,pg=1,pageSize=18,map=null,marks=[],cacheFilter='',sortDirection=1;
const E={nacional:{region:'TODOS',search:'',min:0,sort:'nombre',month:null},observaciones:{site:'TODOS',param:'ph',search:'',min:'',max:''},diario:{code:'TODOS',year:'TODOS',mode:'diario',search:''}};
const DIM={
 calidad:['pH campo','Conductividad campo','Temperatura agua','Oxígeno disuelto (%)','Sólidos suspendidos','N total','P total'],
 codes:['ph','conductividad','temperatura','oxigeno','sst','n','p']
};
function n(v){return v===null||v===undefined||v===''?null:Number.isFinite(+v)?+v:null}
function f(v,d=2){return v===null||v===undefined||!Number.isFinite(+v)?'—':fmt(v,d)}
function normalize(s){return String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function escCsv(x){let s=String(x??'');if(/^[=@+\-\t\r]/.test(s)&&!/^[+-]?\d+(?:\.\d+)?$/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'}
function renderLoading(title){$('aw-main').innerHTML='<div class="aw-loading"><div class="aw-loader"></div><strong>Cargando '+esc(title)+'</strong><span>Recuperando datos completos del repositorio publicado…</span></div>'}
function showError(err,label){if(!VIEWS.includes(S.view))return;$('aw-main').innerHTML='<div class="aw-unsupported"><strong>No pudo cargarse '+esc(label)+'</strong><p>'+esc(err.message||String(err))+' . Compruebe si el archivo está disponible en la implementación publicada.</p><button class="aw-mini-button" type="button" data-x-action="retry">Reintentar</button></div>'}
async function file(path){
 if(cache.has(path))return cache.get(path);
 if(loading.has(path))return loading.get(path);
 const promise=(async()=>{
  const response=await fetch('/agua/'+path,{cache:'force-cache'});
  if(!response.ok)throw Error(path+': servidor HTTP '+response.status);
  const data=await response.json();if(!Array.isArray(data.rows))throw Error('Formato inválido: '+path);
  cache.set(path,data);return data
 })();
 loading.set(path,promise);
 try{return await promise}finally{loading.delete(path)}
}
const manifest={
 nacional:['presas-nacionales-v1.json'],
 observaciones:['calidad-sinaloa-observaciones-v1.json'],
 diario:['jalisco-diario-1.json','jalisco-diario-2.json','jalisco-diario-3.json','jalisco-mensual-v1.json']
};
async function ensure(view){
 const files=manifest[view];const data=await Promise.all(files.map(file));
 return view==='diario'?{daily:data.slice(0,3).flatMap(x=>x.rows),monthly:data[3].rows,metadata:data}:data[0].rows;
}
const memo=new Map();
async function getData(view){if(memo.has(view))return memo.get(view);const data=await ensure(view);memo.set(view,data);return data}
function datasetMeta(){const v=S.view;const src={nacional:'GROWA · 210 presas nacionales · catálogo alternativo, origen secundario',observaciones:'GROWA · 6,095 mediciones de calidad de Sinaloa, fuente secundaria sin fechas',diario:'GROWA · 30,652 registros diarios + 1,018 mensuales de tres presas de Jalisco'};return '<div class="x-source">Fuente: '+esc(src[v])+'. Datos documentales, no tiempo real. <button type="button" data-aw-view="fuentes">Ver metodología ↗</button></div>'}
function stat(label,value,description){return '<div class="aw-stat"><span>'+esc(label)+'</span><strong>'+esc(value)+'</strong><small>'+esc(description)+'</small></div>'}
function legend(title,desc){return '<div class="aw-main-title"><div><span class="aw-overline">DATOS OBSERVACIONALES / EXPLORADOR AVANZADO</span><h3>'+esc(title)+'</h3><p>'+esc(desc)+'</p></div><button class="aw-mini-button" data-x-action="csv" type="button">↓ Descargar CSV filtrado</button></div>'}
function controls(view){
 const box=$('aw-context-filters');if(!box)return;
 const choice=(id,label,items,value)=>'<div class="aw-filter-group"><label for="'+id+'">'+esc(label)+'</label><select id="'+id+'">'+items.map(x=>'<option value="'+esc(x[0])+'" '+(String(x[0])===String(value)?'selected':'')+'>'+esc(x[1])+'</option>').join('')+'</select></div>';
 if(view==='nacional'){
  const opts=cache.has('presas-nacionales-v1.json')?[...new Set(cache.get('presas-nacionales-v1.json').rows.map(x=>x[3]).filter(x=>x))].sort():[];
  box.innerHTML=choice('x-region','Estado (catálogo nacional)',[['TODOS','Todos los estados'],['SIN ESTADO','Sin entidad identificada'],...opts.map(x=>[x,x])],E.nacional.region)+
   '<div class="aw-filter-group"><label for="x-search">Buscar presa, municipio, clave o región</label><input id="x-search" type="search" placeholder="Escriba para filtrar" value="'+esc(E.nacional.search)+'"></div>'+
   choice('x-min','Capacidad NAMO mínima',[[0,'Cualquier capacidad'],[100,'100 hm³ o más'],[500,'500 hm³ o más'],[1000,'1,000 hm³ o más']],E.nacional.min)+
   choice('x-sort','Orden', [['nombre','Nombre A–Z'],['capacidad','Mayor capacidad'],['estado','Estado'],['municipio','Municipio']],E.nacional.sort);
 }
 if(view==='observaciones'){
  const sites=cache.has('calidad-sinaloa-observaciones-v1.json')?[...new Set(cache.get('calidad-sinaloa-observaciones-v1.json').rows.map(x=>x[1]))].sort():[];
  box.innerHTML=choice('x-site','Clave de sitio',[['TODOS','Todos los 223 sitios'],...sites.map(x=>[x,x])],E.observaciones.site)+
    choice('x-param','Indicador', [['ph','pH campo'],['conductividad','Conductividad'],['temperatura','Temperatura (°C)'],['oxigeno','Oxígeno disuelto (%)'],['sst','Sólidos suspendidos'],['n','Nitrógeno total'],['p','Fósforo total']],E.observaciones.param)+
   '<div class="aw-filter-group"><label for="x-search">Nombre de sitio o clave</label><input id="x-search" type="search" placeholder="Buscar sitio" value="'+esc(E.observaciones.search)+'"></div>';
 }
 if(view==='diario'){
  const codes=cache.has('jalisco-mensual-v1.json')?[...new Set(cache.get('jalisco-mensual-v1.json').rows.map(x=>x[0]))].sort():[];
  box.innerHTML=choice('x-code','Presa (clave SIH)',[['TODOS','Todas las presas'],...codes.map(x=>[x,x])],E.diario.code)+
   choice('x-mode','Frecuencia',[['diario','Registros diarios'],['mensual','Resumen mensual observado']],E.diario.mode)+
   choice('x-year','Año', [['TODOS','Todos los años'],...Array.from({length:29},(_,i)=>[String(1996+i),String(1996+i)])],E.diario.year);
 }
 $('aw-visible-count').textContent='—';
 const title=$('aw-sidebar')?.querySelector('.aw-sidebar-header strong');if(title)title.textContent='Filtros del conjunto';
}
function visible(){
 const view=S.view,c=memo.get(view);if(!c)return[];
 if(view==='nacional'){const q=normalize(E.nacional.search);
  const values=c.filter(x=>(E.nacional.region==='TODOS'||(E.nacional.region==='SIN ESTADO'?!x[3]:x[3]===E.nacional.region))&&(n(x[17])??0)>=+E.nacional.min&&(!q||normalize([x[0],x[1],x[2],x[3],x[4],x[5],x[9]].join(' ')).includes(q)));
  return values.sort((a,b)=>E.nacional.sort==='capacidad'?(n(b[17])??0)-(n(a[17])??0):String(a[E.nacional.sort==='estado'?3:E.nacional.sort==='municipio'?4:1]??'').localeCompare(String(b[E.nacional.sort==='estado'?3:E.nacional.sort==='municipio'?4:1]??''),'es',{numeric:true}));
 }
 if(view==='observaciones'){
  const q=normalize(E.observaciones.search);
  return c.filter(x=>(E.observaciones.site==='TODOS'||x[1]===E.observaciones.site)&&(!q||normalize(x[1]+' '+x[2]).includes(q)));
 }
 if(view==='diario'){const c0=E.diario.mode==='mensual'?c.monthly:c.daily;return c0.filter(x=>(E.diario.code==='TODOS'||x[E.diario.mode==='mensual'?0:1]===E.diario.code)&&(E.diario.year==='TODOS'||x[E.diario.mode==='mensual'?1:0].startsWith(E.diario.year)))}
 return[];
}
function table(head,rows,map,page=true){
 const total=rows.length,maxPage=Math.max(1,Math.ceil(total/pageSize));pg=Math.max(1,Math.min(pg,maxPage));
 const selected=page?rows.slice((pg-1)*pageSize,pg*pageSize):rows;
 return '<div class="aw-data-table-wrap x-table-wrap"><table class="aw-data-table"><thead><tr>'+head.map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+
 selected.map((x,i)=>'<tr data-x-index="'+((pg-1)*pageSize+i)+'" tabindex="0" aria-selected="'+(selected?.id===x?.id)+'">'+map(x).map((val,i)=>'<td class="'+(i===0?'aw-text-cell':'')+'">'+esc(val??'—')+'</td>').join('')+'</tr>').join('')+
 (!rows.length?'<tr><td colspan="'+head.length+'">Sin registros que cumplan los filtros.</td></tr>':'')+'</tbody></table></div>'+
 (page?'<div class="aw-pagination"><span>'+fmt(total,0)+' filas · '+pg+' / '+maxPage+'</span><div class="aw-pagination-controls"><button type="button" data-x-page="-1" '+(pg===1?'disabled':'')+'>← Anterior</button><button type="button" data-x-page="1" '+(pg>=maxPage?'disabled':'')+'>Siguiente →</button></div></div>':'');
}
function histogram(values,label){
 const xs=values.map(n).filter(x=>x!==null),num=xs.length;
 if(num<2)return '<div class="aw-context-note">Sin datos numéricos suficientes para elaborar una distribución.</div>';
 const min=Math.min(...xs),max=Math.max(...xs),len=12,bins=Array(len).fill(0),step=(max-min)/len||1;
 xs.forEach(x=>bins[Math.min(len-1,Math.floor((x-min)/step))]++);
 const scale=Math.max(...bins,1);
 return '<div class="x-histogram" role="img" aria-label="Distribución de '+esc(label)+' para '+num+' observaciones">'+bins.map((x,i)=>'<div><span title="'+fmt(min+i*step,2)+' a '+fmt(min+(i+1)*step,2)+' · '+x+' observaciones" style="height:'+Math.max(1,x/scale*100)+'%"></span></div>').join('')+'</div>'+
 '<div class="x-hist-endpoints"><span>'+f(min,2)+'</span><span>'+esc(label)+' · '+num+' observaciones</span><span>'+f(max,2)+'</span></div>';
}
function national(){
 const rows=visible(),sites=new Set(rows.map(x=>x[3]||'SIN ESTADO'));
 const incl=rows.filter(x=>Number.isFinite(n(x[6]))&&Number.isFinite(n(x[7])));
 const number=rows.reduce((a,x)=>a+(n(x[17])??0),0);
 const h=legend('Inventario nacional de presas','19 variables originales del catálogo alternativo; 210 filas, estados y nombres sin completar en algunos registros.')+
 '<div class="aw-statgrid">'+stat('Presas filtradas',f(rows.length,0),'210 registros de fuente secundaria')+stat('Con coordenadas',f(incl.length,0),'Puntos georreferenciados')+stat('NAMO sumado de selección',f(number,1)+' hm³','Suma nominal; no es volumen almacenado')+'</div>'+
 '<div class="x-switch"><button type="button" class="aw-mini-button" data-x-action="switch-map">Mostrar/ocultar mapa</button><span>Uso, corriente, región, vertedor, elevaciones, NAMO y NAME disponibles en los expedientes.</span></div>'+
 '<div class="x-national-map" id="x-national-map" role="region" aria-label="Mapa de presas del inventario nacional"></div>'+
 '<section class="aw-bottom-drawer"><div class="aw-drawer-title"><strong>Catálogo nacional completo</strong><span>Seleccione una fila para ver las 19 variables</span></div>'+
 table(['Presa','Clave','Estado','Municipio','Región CONAGUA','NAMO (hm³)','Inicio de operación'],rows,x=>[x[1],x[0],x[3]||'Sin estado',x[4],x[5],f(x[17],1),x[11]])+'</section>'+datasetMeta();
 $('aw-main').innerHTML=h;$('aw-visible-count').textContent=f(rows.length,0);if(rows.length&&!selected)selected=rows[0];
 showNationalMap(incl);inspector();
}
function showNationalMap(rows){
 const node=$('x-national-map');if(!node)return;
 const capped=rows.slice(0,210);
 if(map){try{map.remove()}catch(e){}map=null}
 if(!window.L||!capped.length){node.innerHTML='<div class="aw-unsupported"><strong>Cartografía no disponible</strong><p>Las coordenadas y el catálogo permanecen en la tabla.</p></div>';return}
 try{
  map=L.map(node,{scrollWheelZoom:false,preferCanvas:true});
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:16}).addTo(map);
  const bounds=[];
  capped.forEach(row=>{
   const m=L.circleMarker([row[6],row[7]],{radius:5,color:'#fff',fillColor:'#147e9a',weight:1.3,fillOpacity:.84}).addTo(map);
   m.bindTooltip(esc(row[1]||row[0])+' · '+f(row[17],1)+' hm³');
   m.on('click',()=>selectRow(row));
   bounds.push([row[6],row[7]]);
  });
  if(bounds.length)map.fitBounds(bounds,{padding:[20,20],maxZoom:6});
  requestAnimationFrame(()=>map?.invalidateSize());
 }catch(e){node.innerHTML='<p>No se pudo iniciar el mapa. Consulte la tabla geográfica.</p>'}
}
function quality(){
 const rows=visible(),fields={ph:4,conductividad:3,temperatura:5,oxigeno:6,sst:7,n:8,p:9};
 const col=fields[E.observaciones.param],labels={ph:'pH',conductividad:'Conductividad',temperatura:'Temperatura (°C)',oxigeno:'Oxígeno disuelto (%)',sst:'Sólidos suspendidos',n:'N total',p:'P total'};
 const values=rows.map(x=>x[col]).map(n).filter(x=>x!==null),mean=values.length?values.reduce((a,x)=>a+x,0)/values.length:null;
 $('aw-main').innerHTML=legend('Observaciones físico-químicas individuales','6,095 observaciones en 223 sitios. La fuente no incluye fechas de muestreo verificadas; no construir tendencias ni inferir calidad actual.')+
 '<div class="aw-context-note"><strong>Condición del dato:</strong> sin fecha validada y con origen secundario. El caudal aparece como texto, con valores censurados (&lt;5) y no se interpreta numéricamente.</div>'+
 '<div class="aw-statgrid">'+stat('Observaciones seleccionadas',f(rows.length,0),'De 6,095 filas conservadas')+
 stat('Sitios distintos',f(new Set(rows.map(x=>x[1])).size,0),'De 223 sitios en Sinaloa')+
 stat('Media descriptiva · '+labels[E.observaciones.param],f(mean,2),'No es estimación temporal ni de cumplimiento sanitario')+'</div>'+
 '<section class="aw-dataviz"><div class="aw-chart-title"><div><span class="aw-overline">DISTRIBUCIÓN EMPÍRICA</span><h3>'+esc(labels[E.observaciones.param])+'</h3><p>Frecuencia por intervalos iguales de los valores numéricos seleccionados.</p></div></div>'+
 histogram(values,labels[E.observaciones.param])+'</section>'+
 '<section class="aw-bottom-drawer"><div class="aw-drawer-title"><strong>Mediciones individuales (sin fecha)</strong><span>11 columnas originales; se muestran diez valores, más la clave de observación</span></div>'+
 table(['ID','Sitio','Nombre','Conductividad','pH','Temp. °C','OD %','SST','N total','P total','Caudal texto'],rows,x=>x.slice(0,11).map((v,i)=>i>=3&&i<=9?f(v,3):v))+'</section>'+datasetMeta();
 $('aw-visible-count').textContent=f(rows.length,0);if(rows.length&&!selected)selected=rows[0];inspector();
}
function daily(){
 const rows=visible(),codes=[...new Set(rows.map(x=>x[E.diario.mode==='mensual'?0:1]))];
 const isMonth=E.diario.mode==='mensual';
 const volIndex=isMonth?3:2,dateIndex=isMonth?1:0;
 const valid=rows.map(x=>n(x[volIndex])).filter(x=>x!==null);
 const mean=valid.length?valid.reduce((a,x)=>a+x,0)/valid.length:null;
 const series=(()=>{
  const sums=new Map();rows.forEach(x=>{
   const period=String(x[dateIndex]).slice(0,7),name=x[isMonth?0:1],key=period+'|'+name,val=n(x[volIndex]);
   if(val===null)return;const old=sums.get(key)||{n:0,sum:0,period,name};old.n++;old.sum+=val;sums.set(key,old)
  });return [...sums.values()].map(x=>[x.period,x.name,x.sum/x.n]).sort((a,b)=>a[0].localeCompare(b[0]))
 })();
 const selectedCode=E.diario.code==='TODOS'?(codes[0]||''):E.diario.code;
 const single=series.filter(x=>x[1]===selectedCode);
 const chart=single.length?lineChart(single.map(x=>[x[0],x[2]])):'<div class="aw-context-note">No hay observaciones para esta presa.</div>';
 $('aw-main').innerHTML=legend(isMonth?'Almacenamiento mensual de Jalisco':'Almacenamiento diario de Jalisco','Serie observada de tres presas, con fecha, almacenamiento, elevación y proporción NAMO. Intervalo 1996–2024.')+
 '<div class="aw-context-note"><strong>Cobertura:</strong> 30,652 observaciones diarias y 1,018 resúmenes mensuales documentados. El gráfico reduce visualmente por mes, pero las filas diarias originales siguen accesibles y exportables. No representa el conjunto de presas del estado.</div>'+
 '<div class="aw-statgrid">'+stat('Filas de la selección',f(rows.length,0),'Observaciones efectivamente recuperadas')+
 stat('Presas distintas',f(codes.length,0),'Claves SIH de la fuente')+
 stat('Almacenamiento medio',f(mean,2)+' hm³','Media descriptiva de filas seleccionadas')+'</div>'+
 '<section class="aw-dataviz"><div class="aw-chart-title"><div><span class="aw-overline">EVOLUCIÓN DOCUMENTADA · '+esc(selectedCode)+'</span><h3>Almacenamiento medio por mes</h3><p>Agregación visual de los cortes diarios o lectura de promedios mensuales.</p></div></div>'+chart+'</section>'+
 '<section class="aw-bottom-drawer"><div class="aw-drawer-title"><strong>'+(isMonth?'Mediciones mensuales':'Mediciones diarias')+'</strong><span>La tabla conserva las observaciones originales filtradas</span></div>'+
 (isMonth?table(['Clave','Mes','Días','Almacenamiento medio (hm³)','Mínimo (hm³)','Máximo (hm³)','Fracción NAMO'],rows,x=>[x[0],x[1],x[2],f(x[3],3),f(x[4],3),f(x[5],3),f(x[6],4)]):
 table(['Fecha','Clave SIH','Almacenamiento (hm³)','Elevación actual (m)','Fracción NAMO'],rows,x=>[x[0],x[1],f(x[2],3),f(x[3],3),f(x[4],4)]))+'</section>'+datasetMeta();
 $('aw-visible-count').textContent=f(rows.length,0);if(rows.length&&!selected)selected=rows[0];inspector();
}
function lineChart(rows){
 if(rows.length<2)return '<p>No hay serie suficiente.</p>';
 const values=rows.map(x=>x[1]),lo=Math.min(...values),hi=Math.max(...values),W=800,H=230,span=(hi-lo)||1,space=rows.length-1;
 const path=rows.map((r,i)=>(i?'L':'M')+(35+i/space*730).toFixed(1)+','+(190-(r[1]-lo)/span*160).toFixed(1)).join(' ');
 return '<svg viewBox="0 0 '+W+' '+H+'" class="aw-chart" role="img" aria-label="Almacenamiento medio mensual por fecha"><g stroke="#e3ebee"><line x1="35" x2="765" y1="30" y2="30"/><line x1="35" x2="765" y1="110" y2="110"/><line x1="35" x2="765" y1="190" y2="190"/></g><path d="'+path+'" stroke="#166e8e" stroke-width="2.6" fill="none"/><g fill="#6d8995" font-size="11"><text x="35" y="218">'+esc(rows[0][0])+'</text><text x="765" y="218" text-anchor="end">'+esc(rows.at(-1)[0])+'</text><text x="5" y="34">'+f(hi,1)+'</text><text x="5" y="194">'+f(lo,1)+'</text></g></svg>';
}
function selectRow(row){selected=row;inspector()}
function inspector(){
 if(!VIEWS.includes(S.view))return;
 const rows=visible();if(selected&&!rows.includes(selected))selected=rows[0]||null;
 if(!selected&&rows.length)selected=rows[0];
 const menu=$('aw-inspector-select'),holder=$('aw-inspector-content'),heading=$('aw-inspector-heading'),panel=menu?.closest('.aw-inspector-nav');
 if(panel)panel.hidden=false;
 if(heading)heading.textContent='Ficha del dato observado';
 if(menu){
  const current=selected,at=Math.max(0,rows.indexOf(current)),windowRows=rows.length>100?[...rows.slice(Math.max(0,at-40),at),current,...rows.slice(at+1,Math.min(rows.length,at+40))].filter(Boolean):rows;
  menu.innerHTML=windowRows.map(x=>'<option value="'+rows.indexOf(x)+'" '+(current===x?'selected':'')+'>'+esc(S.view==='nacional'?(x[1]||x[0]):S.view==='observaciones'?(x[1]+' · observación '+x[0]):(x[E.diario.mode==='mensual'?1:0]+' · '+x[E.diario.mode==='mensual'?0:1]))+'</option>').join('');
  menu.disabled=!rows.length;
 }
 if(!selected){holder.innerHTML='<div class="aw-empty-inspector">Seleccione un registro de la tabla.</div>';return}
 let fields=[];
 if(S.view==='nacional'){const d=memo.get('nacional');fields=d?d.rows?d.campos:[]:[];fields=['Clave SIH','Nombre oficial','Nombre común','Estado','Municipio','Región CONAGUA','Latitud','Longitud','Uso','Corriente','Vertedor','Inicio de operación','Elevación corona','Bordo libre','Elevación NAME','Almacenamiento NAME','Elevación NAMO','Almacenamiento NAMO','Altura cortina'];}
 if(S.view==='observaciones')fields=['Número de fila','Clave de sitio','Nombre del sitio','Conductividad','pH','Temperatura del agua','Oxígeno disuelto (%)','Sólidos suspendidos','Nitrógeno total','Fósforo total','Caudal (texto)'];
 if(S.view==='diario')fields=E.diario.mode==='mensual'?['Clave SIH','Mes','Días observados','Media (hm³)','Mínimo (hm³)','Máximo (hm³)','Fracción NAMO']:['Fecha','Clave SIH','Almacenamiento (hm³)','Elevación (m)','Fracción NAMO'];
 const obj=selected;
 holder.innerHTML='<span class="aw-flag">'+esc(S.view==='nacional'?'CATÁLOGO NACIONAL':S.view==='observaciones'?'OBSERVACIÓN SIN FECHA':'OPERACIÓN HISTÓRICA')+'</span>'+
 '<h4 class="aw-record-name">'+esc(S.view==='nacional'?obj[1]:S.view==='observaciones'?obj[2]:obj[E.diario.mode==='mensual'?1:0])+'</h4>'+
 '<div class="x-record-list">'+fields.map((name,i)=>'<div><span>'+esc(name)+'</span><b>'+esc(obj[i]??'Sin dato')+'</b></div>').join('')+'</div>'+
 '<p class="aw-inspector-note">Registro original del paquete publicado. Los faltantes no han sido reemplazados por estimaciones. Consulte el enlace de la fuente para comprobar procedencia.</p>';
}
function csv(){
 const rows=visible();if(!rows.length){notice('No hay filas para exportar.');return}
 const headers=S.view==='nacional'?['clavesih','nombreoficial','nombrecomun','estado','nommunicipio','regioncna','latitud','longitud','uso','corriente','tipovertedor','inicioop','elevcorona','bordolibre','nameelev','namealmac','namoelev','namoalmac','alturacortina']:S.view==='observaciones'?['obs_fila','clave_sitio','nombre_sitio','conductividad','ph','temp_agua','od_pct','sst','n_total','p_total','caudal_texto']:E.diario.mode==='mensual'?['clave','anio_mes','dias','medio_hm3','min_hm3','max_hm3','fraccion_namo']:['fecha','clave','almacenamiento_hm3','elevacion_m','fraccion_namo'];
 const data='\uFEFF'+[headers,...rows].map(x=>x.map(escCsv).join(',')).join('\r\n');
 const blob=new Blob([data],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),anchor=document.createElement('a');
 anchor.href=url;anchor.download='growa-agua-'+S.view+'-'+new Date().toISOString().slice(0,10)+'.csv';document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
 notice('CSV filtrado generado con '+rows.length+' registros.');
}
function render(view){
 if(!VIEWS.includes(view))return;
 const current=view;renderLoading({nacional:'210 presas',observaciones:'6,095 observaciones de calidad',diario:'30,652 registros diarios'}[view]);
 getData(view).then(()=>{
  if(S.view!==current)return;
  controls(view);pg=1;selected=null;draw()
 }).catch(e=>showError(e,current))
}
function draw(){
 if(!memo.has(S.view))return;
 if(S.view==='nacional')national();
 if(S.view==='observaciones')quality();
 if(S.view==='diario')daily();
}
function retry(){memo.delete(S.view);for(const f of manifest[S.view]||[])cache.delete(f);render(S.view)}
document.getElementById('panel-agua').addEventListener('click',e=>{
 if(!VIEWS.includes(S.view))return;
 const a=e.target.closest('[data-x-action]');if(a){
  const action=a.dataset.xAction;
  if(action==='csv')csv();if(action==='retry')retry();
  if(action==='switch-map'){const m=$('x-national-map');if(m){m.hidden=!m.hidden;if(map&&!m.hidden)setTimeout(()=>map.invalidateSize(),100)}}
  return;
 }
 const pgButton=e.target.closest('[data-x-page]');if(pgButton){pg+=Number(pgButton.dataset.xPage);draw();return}
 const row=e.target.closest('tr[data-x-index]');
 if(row){const records=visible();selectRow(records[Number(row.dataset.xIndex)]);return}
},true);
document.getElementById('panel-agua').addEventListener('change',e=>{
 if(!VIEWS.includes(S.view))return;
 const key=e.target.id,view=S.view,values=E[view]||{};
 if(key==='aw-inspector-select'){const row=visible()[Number(e.target.value)];if(row)selectRow(row);return}
 if(!key.startsWith('x-'))return;
 const val=e.target.value;
 if(view==='nacional'){if(key==='x-region')values.region=val;if(key==='x-min')values.min=+val;if(key==='x-sort')values.sort=val}
 if(view==='observaciones'){if(key==='x-site')values.site=val;if(key==='x-param')values.param=val}
 if(view==='diario'){if(key==='x-code')values.code=val;if(key==='x-year')values.year=val;if(key==='x-mode')values.mode=val}
 pg=1;selected=null;draw();
},true);
document.getElementById('panel-agua').addEventListener('input',e=>{
 if(!VIEWS.includes(S.view)||e.target.id!=='x-search')return;
 E[S.view].search=e.target.value;pg=1;selected=null;draw();
},true);
window.GrowaWaterExtra={views:VIEWS,render,filters:()=>{},inspector};
if(VIEWS.includes(S.view))API.render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();