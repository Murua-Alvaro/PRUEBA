/* GROWA Agua Studio V17 · USGS-inspired navigation · CONAGUA-oriented metadata */
(()=>{'use strict';
const root=document.getElementById('panel-agua');if(!root)return;
const $=id=>document.getElementById(id),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),norm=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),num=x=>x==null||x===''||!Number.isFinite(+x)?null:+x;
const f=(x,n=1)=>num(x)===null?'—':new Intl.NumberFormat('es-MX',{maximumFractionDigits:n}).format(+x);
const V={
overview:['Atlas hídrico','Infraestructura georreferenciada, capas y series del archivo hídrico.'],presas:['Presas nacionales','210 presas y 19 variables de infraestructura.'],regional:['Presas por entidad','Inventario georreferenciado regional, cobertura parcial.'],storage:['Almacenamiento histórico','Cortes observados de Sinaloa y tres presas de Jalisco.'],acuiferos:['Acuíferos','Recarga, VEAS y disponibilidad administrativa.'],riego:['Distritos de riego','Volumen y superficie por ciclo agrícola.'],cuencas:['Cuencas y estaciones','Cobertura nacional y límites de los metadatos regionales.'],quality:['Calidad del agua','6,095 observaciones sin fecha validada en 223 sitios de Sinaloa.'],clima:['Clima y agua','Precipitación y evapotranspiración de referencia 2003–2025.'],trend:['Tendencias distritales','32 resultados de pendientes y significancia FDR.'],catalog:['Biblioteca de datos','Materialización real, variables y periodos de origen.'],sources:['Fuentes y metodología','Procedencia verificable y restricciones del análisis.']
};
const SOURCES=[['Presas nacionales','210 registros secundarios; 19 variables','https://docs.google.com/spreadsheets/d/1Rx0y0_N2sCsPzyfYeJGvnlv2wqtUF6cxHYQ_Kwz34t4/edit','presas'],['Calidad Sinaloa','6,095 observaciones sin fecha validada','https://docs.google.com/spreadsheets/d/1CHNtrXaFUjd1m1_F-83-J1iVoNtyCFZhxmPSaXctWtQ/edit','quality'],['Jalisco diario','30,652 registros de tres presas (1996–2024)','https://docs.google.com/spreadsheets/d/1q0dzyO6Iwy2ojObAFpOPcafaPL7P0oEKjM68umG1WnY/edit','storage'],['Jalisco mensual','1,018 agregados mensuales','https://docs.google.com/spreadsheets/d/15GjNsCaJUGWZg-jbSMs-b1eO8Xxi6w_6B4UmmPUJqKw/edit','storage'],['SIH CONAGUA','Sistema oficial de Información Hidrológica','https://sih.conagua.gob.mx/','sources'],['NASA POWER','Datos meteorológicos históricos','https://power.larc.nasa.gov/','clima'],['Acuíferos CONAGUA','Documentos de disponibilidad y acuerdos','https://sigagis.conagua.gob.mx/gas1/sections/acuerdos_dof.html','acuiferos'],['USGS National Water Dashboard','Referencia para mapa, filtros y fichas','https://dashboard.waterdata.usgs.gov/app/nwd/en/','sources']];
const FILES={presas:['presas-nacionales-v1.json'],quality:['calidad-sinaloa-observaciones-v1.json'],storage:['jalisco-diario-1.json','jalisco-diario-2.json','jalisco-diario-3.json','jalisco-mensual-v1.json']};
const S={view:'overview',state:'Sinaloa',filter:'all',period:'all',search:'',page:1,perPage:20,selected:'',sort:'',dir:1,mode:'map',basemap:'topo'};
let D=null,cache=new Map(),waiting=new Map(),shown=[],mp=null,marks=[],token=0,inputTimer=null,toaster=null;
function msg(x){const el=$('w17-toast');el.textContent=x;el.hidden=false;clearTimeout(toaster);toaster=setTimeout(()=>el.hidden=true,3300)}
function killMap(){if(mp){try{mp.remove()}catch(e){console.warn(e)}mp=null}marks=[]}
async function getFile(name){
 if(cache.has(name))return cache.get(name);if(waiting.has(name))return waiting.get(name);
 const task=(async()=>{const r=await fetch('/agua/'+name,{cache:'force-cache'});if(!r.ok)throw Error(name+' · HTTP '+r.status);const j=await r.json();if(!Array.isArray(j.rows))throw Error(name+' carece de filas');cache.set(name,j);return j})();
 waiting.set(name,task);try{return await task}finally{waiting.delete(name)}
}
function getRows(name){return cache.get(name)?.rows||[]}
function row(id,fields,x,extra={}){const info={};fields.forEach((k,i)=>info[k]=x[i]??null);return {id,info,...extra,name:extra.name||x[1]||x[0],query:x.join(' ')}}
function hasState(r){return S.state==='Todos'||norm(r.state)===norm(S.state)}
const recordCache=new Map();
function generateAvailable(){
 if(S.view==='overview')return D.presas.map((x,i)=>row('o'+i,['Estado','Clave','Presa','Municipio','Latitud','Longitud','NAMO hm³'],x,{name:x[2],state:x[0],city:x[3],lat:num(x[4]),lon:num(x[5]),metric:num(x[6]),unit:'hm³ NAMO'}));
 if(S.view==='presas'){const d=cache.get('presas-nacionales-v1.json');return getRows('presas-nacionales-v1.json').map((x,i)=>row('p'+i,d?.campos||[],x,{name:x[1],state:x[3]||'',city:x[4]||'',lat:num(x[6]),lon:num(x[7]),metric:num(x[17]),unit:'hm³ NAMO'}))}
 if(S.view==='regional')return D.presas.map((x,i)=>row('r'+i,['Estado','Clave','Presa','Municipio','Latitud','Longitud','NAMO hm³'],x,{name:x[2],state:x[0],city:x[3],lat:num(x[4]),lon:num(x[5]),metric:num(x[6]),unit:'hm³ NAMO'}));
 if(S.view==='acuiferos')return D.acuiferos.map((x,i)=>row('a'+i,['Estado','Clave','Acuífero','Recarga hm³/año','VEAS hm³/año','Saldo hm³/año','Saldo negativo'],x,{name:x[2],state:x[0],metric:num(x[5]),unit:'hm³/año'}));
 if(S.view==='riego')return D.riego.map((x,i)=>row('g'+i,['Estado','Ciclo inicial','Volumen hm³','Superficie ha','m³/ha','Distritos'],x,{name:x[0]+' · '+x[1],state:x[0],year:x[1],metric:num(x[2]),unit:'hm³'}));
 if(S.view==='clima')return D.clima.map((x,i)=>row('c'+i,['Estado','Año','Precipitación mm','ET₀ mm','P−ET₀ mm','Razón'],x,{name:x[0]+' · '+x[1],state:x[0],year:x[1],metric:num(x[2]),unit:'mm'}));
 if(S.view==='trend')return D.tendencias.map((x,i)=>row('t'+i,['Estado','Clave','Distrito','Observaciones','Pendiente','p ajustado','FDR'],x,{name:x[2],state:x[0],metric:num(x[4]),unit:'pendiente sin unidad validada'}));
 if(S.view==='quality')return getRows('calidad-sinaloa-observaciones-v1.json').map((x,i)=>row('q'+i,['Folio','Clave sitio','Sitio','Conductividad','pH','Temperatura','Oxígeno %','SST','N total','P total','Caudal texto'],x,{name:x[2],state:'Sinaloa',metric:num(x[4]),unit:'pH'}));
 if(S.view==='storage'){
  if(S.state==='Jalisco'){
   if(S.period==='monthly')return getRows('jalisco-mensual-v1.json').map((x,i)=>row('jm'+i,['Clave SIH','Mes','Días','Media hm³','Mínimo hm³','Máximo hm³','Fracción NAMO'],x,{name:x[0]+' · '+x[1],state:'Jalisco',code:x[0],date:x[1],metric:num(x[3]),unit:'hm³'}));
   return ['jalisco-diario-1.json','jalisco-diario-2.json','jalisco-diario-3.json'].flatMap(getRows).map((x,i)=>row('jd'+i,['Fecha','Clave SIH','Almacenamiento hm³','Elevación m','Fracción NAMO'],x,{name:x[1]+' · '+x[0],state:'Jalisco',code:x[1],date:x[0],metric:num(x[2]),unit:'hm³'}));
  }
  if(S.state==='Sinaloa'){
   const a=D.sistemas.map((x,i)=>row('ss'+i,['Sistema','Fecha','Número de presas','Volumen hm³','NAMO %'],x,{name:x[0]+' · '+x[1],state:'Sinaloa',code:x[0],date:x[1],metric:num(x[3]),unit:'hm³'}));
   const b=D.sinaloa.map((x,i)=>row('si'+i,['Clave','Fecha','Volumen hm³','NAMO %','Fuente'],x,{name:x[0]+' · '+x[1],state:'Sinaloa',code:'individual',date:x[1],metric:num(x[2]),unit:'hm³'}));return [...a,...b];
  }
 }
 return[];
}
function available(){
 const key=S.view+'|'+(S.view==='storage'?S.state+'|'+S.period:'');
 if(recordCache.has(key))return recordCache.get(key);
 const rows=generateAvailable();recordCache.set(key,rows);return rows;
}
function opts(){
 const values=[['all','Todos los registros']],period=[['all','Todos los periodos / variables']];
 const view=S.view;
 if(['overview','presas','regional'].includes(view)){
  const x=available().filter(hasState);const muni=[...new Set(x.map(r=>r.city).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));values.push(...muni.map(x=>[x,x]));period.push(...[['100','NAMO ≥ 100 hm³'],['500','NAMO ≥ 500 hm³'],['1000','NAMO ≥ 1,000 hm³']])
 }
 if(view==='quality'){values.push(...[...new Set(getRows('calidad-sinaloa-observaciones-v1.json').map(x=>x[1]))].sort().map(x=>[x,x]));period.push(...[['ph','pH'],['conduct','Conductividad'],['temp','Temperatura'],['oxygen','Oxígeno disuelto'],['sst','SST'],['nitrogen','N total'],['phosphorus','P total']])}
 if(view==='storage'){if(S.state==='Jalisco'){values.push(...['REDJL','EGCJL','ESLJL'].map(x=>[x,x]));period.push(['monthly','Serie mensual (1,018 filas)'])}if(S.state==='Sinaloa'){values.push(...[['V-II_4_PRESAS','Sistema de cuatro presas'],['SINALOA_11_PRESAS','Sistema de once presas'],['individual','Registros individuales']])}}
 if(['riego','clima'].includes(view)){const list=view==='riego'?D.riego:D.clima;const yrs=[...new Set(list.filter(x=>S.state==='Todos'||norm(x[0])===norm(S.state)).map(x=>x[1]))].sort((a,b)=>b-a);values.push(...yrs.map(x=>[String(x),String(x)]))}
 if(view==='acuiferos')period.push(['neg','Saldo negativo'],['pos','Saldo no negativo']);
 if(view==='trend')period.push(['sig','FDR significativa'],['ns','FDR no significativa']);
 return {values,period};
}
function selectHtml(opts,current){return opts.map(([v,t])=>'<option value="'+esc(v)+'" '+(String(v)===String(current)?'selected':'')+'>'+esc(t)+'</option>').join('')}
function toolbar(){
 const broad=['catalog','sources','cuencas'],allStates=['overview','presas','regional','acuiferos','riego','clima','trend','catalog','sources','cuencas'].includes(S.view);
 const st=$('w17-state');st.innerHTML=selectHtml([...(allStates?[['Todos','Todos los estados']]:[]),...Object.keys({Sinaloa:1,Sonora:1,Chihuahua:1,Jalisco:1,Michoacán:1}).map(x=>[x,x])],S.state);
 if(![...st.options].some(x=>x.value===S.state))S.state='Sinaloa';
 if(S.view==='quality')S.state='Sinaloa';
 st.value=S.state;st.disabled=S.view==='quality';
 const o=opts();if(!o.values.some(x=>x[0]===S.filter))S.filter='all';if(!o.period.some(x=>x[0]===S.period))S.period='all';
 $('w17-filter').innerHTML=selectHtml(o.values,S.filter);$('w17-filter').disabled=o.values.length<2;
 $('w17-period').innerHTML=selectHtml(o.period,S.period);$('w17-period').disabled=o.period.length<2;
 $('w17-search').disabled=broad.includes(S.view);$('w17-search').value=S.search;
 const datalist=$('w17-suggested');if(datalist)datalist.innerHTML=['presas','regional'].includes(S.view)?o.values.slice(1).map(x=>'<option value="'+esc(x[1])+'"></option>').join(''):'';
 $('w17-title').textContent=V[S.view][0];$('w17-subtitle').textContent=V[S.view][1];$('w17-crumb-view').textContent=V[S.view][0].toUpperCase();
 $('w17-scope').textContent=S.view==='quality'?'SIN FECHA DE MEDICIÓN VERIFICADA':'SERIES HISTÓRICAS · NO EN VIVO';
 root.querySelectorAll('[data-w17-view]').forEach(b=>b.setAttribute('aria-current',b.dataset.w17View===S.view?'page':'false'));
}
function filtered(){
 let r=available().filter(x=>hasState(x)&&(!S.search||norm(x.query+' '+x.name).includes(norm(S.search))));
 const v=S.view,sel=S.filter,period=S.period;
 if(['overview','presas','regional'].includes(v))r=r.filter(x=>(sel==='all'||norm(x.city)===norm(sel))&&(period==='all'||x.metric>=Number(period)));
 if(v==='quality'){r=r.filter(x=>sel==='all'||x.info['Clave sitio']===sel);const column={ph:'pH',conduct:'Conductividad',temp:'Temperatura',oxygen:'Oxígeno %',sst:'SST',nitrogen:'N total',phosphorus:'P total'}[period];if(column)r=r.map(x=>({...x,metric:num(x.info[column]),unit:column}))}
 if(v==='storage')r=r.filter(x=>sel==='all'||x.code===sel);
 if(['riego','clima'].includes(v))r=r.filter(x=>sel==='all'||String(x.year)===sel);
 if(v==='acuiferos')r=r.filter(x=>period==='all'||period==='neg'&&x.metric<0||period==='pos'&&x.metric>=0);
 if(v==='trend')r=r.filter(x=>period==='all'||period==='sig'&&x.info.FDR!=='NO_SIGNIFICATIVA'||period==='ns'&&x.info.FDR==='NO_SIGNIFICATIVA');
 if(S.sort)r.sort((a,b)=>{const x=a.info[S.sort],y=b.info[S.sort];return num(x)!==null&&num(y)!==null?(num(x)-num(y))*S.dir:String(x??'').localeCompare(String(y??''),'es',{numeric:true})*S.dir});
 return r;
}
function stats(items){return '<div class="w17-kpis">'+items.map(([label,val,note])=>'<div class="w17-kpi"><span>'+esc(label)+'</span><strong>'+esc(val)+'</strong><small>'+esc(note)+'</small></div>').join('')+'</div>'}
function head(name,note,tools=''){return '<div class="w17-card-head"><h2>'+esc(name)+'</h2>'+(tools||'<span>'+esc(note||'')+'</span>')+'</div>'}
function warning(s){return '<div class="w17-warning"><strong>Alcance del dato:</strong> '+esc(s)+'</div>'}
function summary(){
 const records=filtered();shown=records;
 if(!records.some(x=>x.id===S.selected))S.selected=records[0]?.id||'';
 const summed=records.reduce((sum,r)=>sum+(r.metric||0),0);
 const stateLabel=S.state==='Todos'?'Cinco estados':S.state;
 const mapTools=
  '<div class="w20-map-tools" role="toolbar" aria-label="Controles del mapa">'+
    '<button type="button" data-w17-action="mode-map" aria-pressed="'+(S.mode==='map')+'">Mapa</button>'+
    '<button type="button" data-w17-action="mode-table" aria-pressed="'+(S.mode==='table')+'">Tabla</button>'+
    '<span class="w20-tools-divider" aria-hidden="true"></span>'+
    '<select id="w17-basemap" aria-label="Fondo cartográfico"><option value="topo">Relieve</option><option value="street">Calles</option><option value="sat">Satélite</option></select>'+
    '<button type="button" data-w17-action="fit" title="Ajustar la extensión visible" aria-label="Ajustar mapa">Encuadrar</button>'+
    '<button type="button" data-w17-action="geojson" title="Exportar registros georreferenciados">GeoJSON ↓</button>'+
  '</div>';
 $('w17-content').innerHTML=
  '<section class="w20-primary-area" aria-label="Mapa e inventario territorial">'+
   '<div class="w20-map-titlebar">'+
     '<div><span class="w20-eyebrow">INFRAESTRUCTURA SUPERFICIAL / INVENTARIO GEORREFERENCIADO</span>'+
      '<h2>Localización de presas</h2></div>'+
     mapTools+
   '</div>'+
   '<div class="w20-map-canvas" '+(S.mode==='table'?'hidden':'')+'>'+
      '<div id="w17-map" class="w17-map w20-atlas-map"></div>'+
      '<div class="w20-map-overlay w20-map-count"><small>PUNTOS CATALOGADOS</small><strong>'+f(records.length,0)+'</strong><span>'+esc(stateLabel)+'</span></div>'+
      '<div class="w20-map-overlay w20-map-legend"><span class="w20-legend-mark"></span>Capacidad nominal NAMO · puntos de ubicación</div>'+
   '</div>'+
   '<div class="w20-observation-bar">'+
     '<div><small>Presas en la selección</small><strong>'+f(records.length,0)+'</strong></div>'+
     '<div><small>Capacidad NAMO agregada</small><strong>'+f(summed,1)+' <i>hm³</i></strong></div>'+
     '<div><small>Entidades identificadas</small><strong>'+f(new Set(records.map(r=>r.state)).size,0)+'</strong></div>'+
     '<p><b>Lectura correcta</b> · Capacidad de diseño, no almacenamiento actual. El inventario tiene cobertura parcial.</p>'+
   '</div>'+
  '</section>'+
  '<section class="w20-table-dock" aria-label="Inventario de presas y acciones">'+
    '<div class="w20-dock-head"><div><span class="w20-eyebrow">RESULTADOS / '+esc(stateLabel.toUpperCase())+'</span><h3>Registros de infraestructura <span>'+f(records.length,0)+'</span></h3></div>'+
      '<div class="w20-dock-actions"><button type="button" data-w17-action="export">Descargar CSV ↓</button><button type="button" data-w17-view="presas">Abrir catálogo nacional ↗</button></div>'+
    '</div>'+
    table(records)+
  '</section>'+
  '<footer class="w20-map-disclaimer">Fuente: catálogo georreferenciado secundario V9 · Coordenadas aproximadas. Los puntos no representan superficie de embalse ni disponibilidad de agua. Consulte la ficha técnica para variables individuales.</footer>';
 detail(records);
 if(S.mode==='map'){const sel=$('w17-basemap');if(sel)sel.value=S.basemap;renderMap(records)}
 $('w17-filters-note').textContent=f(records.length,0)+' presas visibles / '+stateLabel+' · Selecciona un punto o registro para abrir su ficha.';
}
function catalog(){
 const sets=[['Presas nacionales',210,'19 campos','Sin fecha normativa verificada','presas'],['Presas regionales',75,'7 campos','Corte único','regional'],['Acuíferos',216,'7 campos','Transversal','acuiferos'],['Riego',135,'6 campos','1997–2023','riego'],['Clima',115,'6 campos','2003–2025','clima'],['Tendencias',32,'7 campos','27 ciclos por distrito como máximo','trend'],['Calidad observada',6095,'11 campos','Sin fechas de muestreo','quality'],['Jalisco diario',30652,'5 campos','1996–2024','storage'],['Jalisco mensual',1018,'7 campos','1996–2024','storage'],['Sinaloa sistemas',99,'5 campos','2018–2026','storage'],['Sinaloa individual',26,'5 campos','2018–2026','storage']];
 $('w17-content').innerHTML=warning('El número de filas materializadas y los registros declarados en metadatos son conceptos distintos. No se asignan datos nacionales a municipios sin cruce válido.')+
 stats([['Colecciones consultables',sets.length,'Tablas y derivados'],['Calidad sin fecha','6,095','No permite tendencias'],['Jalisco diario','30,652','Tres presas'],['Catálogo nacional','210','Presas de fuente secundaria']])+
 '<div class="w17-module-card">'+head('Bases materializadas','Cada fila abre el explorador')+'<div class="w17-table-wrap"><table class="w17-table"><thead><tr><th>Conjunto</th><th>Filas</th><th>Variables</th><th>Periodo</th><th>Abrir</th></tr></thead><tbody>'+sets.map(([n,r,c,d,v])=>'<tr><td>'+esc(n)+'</td><td>'+f(r,0)+'</td><td>'+esc(c)+'</td><td>'+esc(d)+'</td><td><button type="button" data-w17-view="'+v+'" class="w17-btn">Explorar ↗</button></td></tr>').join('')+'</tbody></table></div></div>'+
 '<div class="w17-module-card">'+head('Metadatos declarados','No equivale a materialización municipal')+'<div class="w17-table-wrap"><table class="w17-table"><thead><tr><th>Estado</th><th>Componente</th><th>Declarados</th><th>Inicio</th><th>Fin</th></tr></thead><tbody>'+D.cobertura.filter(x=>S.state==='Todos'||norm(x[0])===norm(S.state)).map(x=>'<tr><td>'+esc(x[0])+'</td><td>'+esc(x[1])+'</td><td>'+esc(x[2])+'</td><td>'+esc(x[3])+'</td><td>'+esc(x[4])+'</td></tr>').join('')+'</tbody></table></div></div>'+
 warning('REPDA se localizó en fuentes de proyecto, pero no se ha volcado como microdato público: exige validar unidad, procedencia y tratamiento de titulares.');
 $('w17-filters-note').textContent='Biblioteca de datos verificados dentro del paquete web. La cobertura declarada no sustituye archivos originales.';detail([]);
}
function sources(){
 $('w17-content').innerHTML=warning('Las fuentes secundarias no equivalen a mediciones oficiales actuales. Consulte SIH para validar cortes recientes y las unidades originales.')+
 '<div class="w17-source-list">'+SOURCES.map(([t,d,u,v])=>'<div class="w17-source"><small>FUENTE / TRAZABILIDAD</small><h3>'+esc(t)+'</h3><p>'+esc(d)+'</p><a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">Abrir fuente ↗</a> · <button type="button" class="w17-btn" data-w17-view="'+v+'">Consultar</button></div>').join('')+'</div>';
 $('w17-filters-note').textContent='Fuente de inspiración visual: USGS National Water Dashboard. Datos mexicanos: compilaciones y fuentes SIH/CONAGUA.';detail([]);
}
function basin(){
 const meta=D.cobertura.find(x=>norm(x[0])===norm(S.state)&&x[1]==='estaciones_hidrometricas_catalogo'),count=S.state==='Todos'?D.cobertura.filter(x=>x[1]==='estaciones_hidrometricas_catalogo').reduce((a,x)=>a+(num(x[2])||0),0):num(meta?.[2])||0;
 $('w17-content').innerHTML=warning('Las 757 cuencas corresponden a un corte nacional de 2020. La base integrada no contiene sus polígonos estatales ni series verificadas de caudal por estación.')+
 stats([['Cuencas nacionales','757','No asignadas a estados'],['Con disponibilidad','653','Clasificación nacional'],['Sin disponibilidad','104','Clasificación nacional'],['Estaciones catalogadas',f(count,0),'Metadatos para '+S.state]])+
 '<div class="w17-module-card">'+head('Observación fluvial y cartografía','Cobertura parcial de fuente')+'<div class="w17-plot"><div class="w17-empty"><strong>No se puede construir un mapa de cuencas confiable con esta base.</strong> No se inventarán polígonos o series regionales. Consulte los datos que sí están completos y las estaciones oficiales.<p><a href="https://sih.conagua.gob.mx/hidros.html" target="_blank" rel="noopener noreferrer">SIH / estaciones hidrométricas ↗</a></p><button type="button" data-w17-view="acuiferos">Ver acuíferos</button> <button type="button" data-w17-view="regional">Ver presas</button></div></div></div>';
 $('w17-filters-note').textContent='La cobertura nacional y los metadatos por estado no tienen la misma escala espacial.';detail([]);
}
function getCols(){
 const sets={overview:[['Presa','Presa'],['Municipio','Municipio'],['Estado','Estado'],['Capacidad NAMO','NAMO hm³']],presas:[['Presa','nombreoficial'],['Clave','clavesih'],['Estado','estado'],['Municipio','nommunicipio'],['Región','regioncna'],['NAMO hm³','namoalmac']],regional:[['Presa','Presa'],['Clave','Clave'],['Municipio','Municipio'],['Estado','Estado'],['NAMO hm³','NAMO hm³']],acuiferos:[['Acuífero','Acuífero'],['Clave','Clave'],['Estado','Estado'],['Recarga','Recarga hm³/año'],['VEAS','VEAS hm³/año'],['Saldo','Saldo hm³/año']],riego:[['Estado','Estado'],['Ciclo','Ciclo inicial'],['Volumen hm³','Volumen hm³'],['Superficie ha','Superficie ha'],['m³/ha','m³/ha']],clima:[['Estado','Estado'],['Año','Año'],['Precip. mm','Precipitación mm'],['ET₀ mm','ET₀ mm'],['P−ET₀','P−ET₀ mm']],trend:[['Distrito','Distrito'],['Clave','Clave'],['Estado','Estado'],['Pendiente','Pendiente'],['p ajustado','p ajustado'],['FDR','FDR']],quality:[['Sitio','Sitio'],['Clave','Clave sitio'],['Folio','Folio'],['pH','pH'],['Conductividad','Conductividad'],['Temp','Temperatura'],['Oxígeno %','Oxígeno %'],['SST','SST'],['N total','N total'],['P total','P total']]};
 if(S.view==='storage'){if(S.state==='Jalisco')return S.period==='monthly'?[['Presa','Clave SIH'],['Mes','Mes'],['Días','Días'],['Media','Media hm³'],['Mínimo','Mínimo hm³'],['Máximo','Máximo hm³']]:[['Fecha','Fecha'],['Presa','Clave SIH'],['Volumen','Almacenamiento hm³'],['Elevación','Elevación m'],['Fracción NAMO','Fracción NAMO']];return [['Sistema o presa','Sistema'],['Fecha','Fecha'],['Volumen','Volumen hm³'],['NAMO %','NAMO %']]}
 return sets[S.view]||[];
}
function cell(r,k){return r.info[k]??(k==='Sistema'?r.info.Clave:'—')}
function table(rows){
 const cols=getCols(),pages=Math.max(1,Math.ceil(rows.length/S.perPage));S.page=Math.max(1,Math.min(S.page,pages));
 const page=rows.slice((S.page-1)*S.perPage,S.page*S.perPage);
 const header=cols.map(([t,k])=>'<th><button type="button" data-w17-sort="'+esc(k)+'">'+esc(t)+(S.sort===k?(S.dir>0?' ↑':' ↓'):'')+'</button></th>').join('');
 const body=page.map(r=>'<tr data-w17-id="'+esc(r.id)+'" tabindex="0" aria-selected="'+(S.selected===r.id)+'">'+cols.map(([,k])=>'<td>'+esc(cell(r,k))+'</td>').join('')+'</tr>').join('')||'<tr><td colspan="'+cols.length+'">Sin registros para los filtros.</td></tr>';
 return '<div class="w17-table-wrap"><table class="w17-table"><thead><tr>'+header+'</tr></thead><tbody>'+body+'</tbody></table></div><div class="w17-pagination"><span>'+f(rows.length,0)+' registros · Página '+S.page+' de '+pages+'</span><div><button type="button" data-w17-action="prev" '+(S.page===1?'disabled':'')+'>← Anterior</button> <button type="button" data-w17-action="nextpage" '+(S.page===pages?'disabled':'')+'>Siguiente →</button></div></div>';
}
function detail(rows){
 const r=rows.find(x=>x.id===S.selected)||rows[0];if(r&&!S.selected)S.selected=r.id;
 if(!r){$('w17-detail-body').innerHTML='<p class="w17-detail-empty">Seleccione una fila o punto cartográfico para abrir las variables originales.</p>';return}
 $('w17-detail-body').innerHTML='<span class="w17-detail-pill">'+esc(V[S.view][0])+'</span><h3 class="w17-detail-title">'+esc(r.name)+'</h3><p class="w17-detail-sub">'+esc(r.state||'Estado no indicado')+(r.city?' · '+esc(r.city):'')+'</p>'+
 '<div class="w17-detail-highlight"><span>'+esc(r.unit||'Indicador')+'</span><strong>'+f(r.metric,2)+'</strong></div>'+
 Object.entries(r.info).map(([k,v])=>'<div class="w17-detail-fact"><span>'+esc(k)+'</span><strong>'+esc(v??'Sin dato')+'</strong></div>').join('')+
 '<p class="w17-detail-note">'+esc(S.view==='quality'?'Las observaciones carecen de fecha de muestreo verificada. No prueban cumplimiento sanitario ni potabilidad.':S.view==='acuiferos'?'El saldo es administrativo, no volumen de agua existente.':S.view==='overview'||S.view==='presas'||S.view==='regional'?'NAMO es capacidad nominal; no es nivel actual.':'Medición o resultado histórico, no telemetría actual ni demostración causal.')+'</p>';
}
function chart(series){
 const rows=series.filter(x=>num(x[1])!==null).sort((a,b)=>String(a[0]).localeCompare(String(b[0])));if(rows.length<2)return '<div class="w17-empty"><strong>Sin datos suficientes para graficar.</strong></div>';
 const values=rows.map(x=>+x[1]),lo=Math.min(...values),hi=Math.max(...values),gap=hi-lo||1,W=900,H=255,x=i=>55+790*i/(rows.length-1),y=v=>205-168*(v-lo)/gap;
 const points=rows.map((r,i)=>(i?'L':'M')+x(i).toFixed(1)+','+y(r[1]).toFixed(1)).join(' ');
 return '<svg class="w17-chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Evolución de la serie"><g stroke="#e3edf0"><line x1="55" x2="845" y1="37" y2="37"/><line x1="55" x2="845" y1="121" y2="121"/><line x1="55" x2="845" y1="205" y2="205"/></g><path d="'+points+'" fill="none" stroke="#137c9b" stroke-width="2.8"/><g font-size="12" fill="#748e99"><text x="55" y="241">'+esc(rows[0][0])+'</text><text x="845" y="241" text-anchor="end">'+esc(rows.at(-1)[0])+'</text><text x="45" y="41" text-anchor="end">'+f(hi)+'</text><text x="45" y="208" text-anchor="end">'+f(lo)+'</text></g></svg>';
}
function hist(rows){
 const vals=rows.map(x=>x.metric).filter(x=>x!==null),lo=Math.min(...vals),hi=Math.max(...vals);if(vals.length<2)return '<p>Sin observaciones suficientes.</p>';
 const buckets=Array(12).fill(0),dx=(hi-lo)/12||1;vals.forEach(x=>buckets[Math.min(11,Math.floor((x-lo)/dx))]++);const big=Math.max(...buckets);
 return '<div class="w17-hist" role="img" aria-label="Distribución empírica">'+buckets.map(x=>'<span style="height:'+Math.max(1,x/big*100)+'%" title="'+x+' registros"></span>').join('')+'</div><div class="w17-axis"><span>'+f(lo,2)+'</span><span>Distribución de observaciones · '+f(vals.length,0)+'</span><span>'+f(hi,2)+'</span></div>';
}
function killMap(){if(mp){try{mp.remove()}catch(e){}mp=null}marks=[]}
function renderMap(rows){
 killMap();const el=$('w17-map');if(!el||el.hidden)return;
 const points=rows.filter(x=>x.lat!==null&&x.lon!==null&&Math.abs(x.lat)<=90&&Math.abs(x.lon)<=180);
 if(!window.L||!points.length){el.innerHTML='<div class="w17-empty"><strong>No se puede cargar el mapa.</strong> Los datos y coordenadas permanecen en la tabla.</div>';return}
 const bases={topo:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',street:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',sat:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'};
 try{
  mp=L.map(el,{scrollWheelZoom:false,preferCanvas:true});L.tileLayer(bases[S.basemap]||bases.topo,{attribution:'© Esri / OpenStreetMap',maxZoom:17}).addTo(mp);
  marks=points.map(r=>{const rad=Math.min(16,Math.max(5,4+Math.sqrt(Math.max(0,r.metric||0))/4)),m=L.circleMarker([r.lat,r.lon],{radius:rad,weight:1.6,color:'#fff',fillColor:'#147c99',fillOpacity:.9}).addTo(mp);
   m.bindTooltip(esc(r.name)+' · '+f(r.metric)+' hm³');m.on('click',()=>{S.selected=r.id;detail(rows);root.querySelectorAll('[data-w17-id]').forEach(el=>el.setAttribute('aria-selected',String(el.dataset.w17Id===r.id)));if(window.innerWidth<=1190){root.classList.remove('w17-detail-collapsed');$('w17-detail').classList.add('w17-detail-visible')}});return m});
  mp.fitBounds(points.map(x=>[x.lat,x.lon]),{padding:[25,25],maxZoom:8});setTimeout(()=>mp?.invalidateSize(),150);
 }catch(e){console.warn('GROWA map',e);el.innerHTML='<div class="w17-empty">No se pudo iniciar el mapa. Use el inventario tabular.</div>'}
}
function drawRows(rows){
 shown=rows;
 if(!rows.some(x=>x.id===S.selected))S.selected=rows[0]?.id||'';
 const vals=rows.map(x=>x.metric).filter(x=>x!==null),mean=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
 const geo=['presas','regional'].includes(S.view),withLine=['riego','clima','storage'].includes(S.view);
 let addition='';
 if(geo){
  addition='<div class="w17-module-card">'+head('Mapa de infraestructura','', '<div class="w17-geo-controls"><button type="button" data-w17-action="mode-map" aria-pressed="'+(S.mode==='map')+'">Mapa</button><button type="button" data-w17-action="mode-table" aria-pressed="'+(S.mode==='table')+'">Tabla</button><select id="w17-basemap"><option value="topo">Topográfico</option><option value="street">Calles (OSM)</option><option value="sat">Satélite</option></select><button type="button" data-w17-action="fit">Encuadrar</button><button type="button" data-w17-action="geojson">GeoJSON ↓</button></div>')+
  '<div class="w17-map" id="w17-map" '+(S.mode==='table'?'hidden':'')+'></div><div style="padding:10px 14px;color:#738b97;font-size:10px">● Tamaño aproximado por NAMO. Los puntos no representan polígonos de embalse.</div></div>';
 }else if(withLine){
  let series;
  if(S.view==='storage'){
   const code=S.filter==='all'?rows[0]?.code:S.filter;
   const group=new Map();for(const r of rows.filter(x=>x.code===code)){const period=String(r.date||'').slice(0,7);if(!period||r.metric===null)continue;const a=group.get(period)||{sum:0,n:0};a.sum+=r.metric;a.n++;group.set(period,a)}series=[...group].map(([k,x])=>[k,x.sum/x.n]);
  }else series=rows.filter(r=>S.state==='Todos'?r.state===rows[0]?.state:true).map(r=>[r.year,r.metric]);
  addition='<div class="w17-module-card">'+head('Evolución histórica'+(S.state==='Todos'&&S.view!=='storage'?' · '+(series.length?rows[0]?.state:'') :''),'Serie del conjunto seleccionado')+'<div class="w17-plot">'+chart(series)+'</div></div>';
 }else if(S.view==='quality')addition='<div class="w17-module-card">'+head('Distribución de observaciones','Sin fechas verificadas')+'<div class="w17-plot">'+hist(rows)+'</div></div>';
 const msgFor={presas:'Capacidad nominal NAMO, no volumen actual. Algunas fichas nacionales no tienen estado identificado.',regional:'Inventario territorial parcial; sin registro no significa ausencia de presas.',storage:'Jalisco contiene tres presas (1996–2024); Sinaloa contiene cortes parciales, sin telemetría actual.',quality:'Las mediciones de calidad no tienen fecha verificada: no indican cumplimiento sanitario ni tendencia.',acuiferos:'El saldo de un acuífero es un balance administrativo, no volumen físico de agua.',riego:'Los totales de riego por estado no identifican la utilización de cada cultivo.',clima:'P−ET₀ no equivale a disponibilidad hídrica de una cuenca.',trend:'Pendientes y p ajustados son resultados precalculados; la unidad de pendiente está pendiente de auditoría.'};
 $('w17-content').innerHTML=
 '<div class="w19-dataset-meta"><span class="w19-kicker">CONJUNTO ACTIVO &nbsp; / &nbsp; '+esc(V[S.view][0].toUpperCase())+'</span>'+
 '<span>'+f(rows.length,0)+' filas documentales · '+esc(S.state)+' · Valores sin imputación</span></div>'+
 addition+
 stats([['Registros seleccionados',f(rows.length,0),'Después de aplicar filtros'],['Ámbito',S.state,'Cobertura de la fuente'],['Media descriptiva',f(mean,2),'Unidad del indicador seleccionado'],['Con valor informado',f(vals.length,0),'Sin imputar faltantes']])+
 '<div class="w17-module-card">'+head('Datos de origen · '+f(rows.length,0)+' registros','','<div class="w17-geo-controls"><button type="button" data-w17-action="export">Exportar tabla ↓</button></div>')+table(rows)+'</div>'+
 warning(msgFor[S.view]||'Datos históricos; no telemetría actual.');
 detail(rows);
 if(geo&&S.mode==='map'){const sel=$('w17-basemap');if(sel)sel.value=S.basemap;renderMap(rows)}
 $('w17-filters-note').textContent=f(rows.length,0)+' registros · '+S.state+(S.search?' · Búsqueda: '+S.search:'')+' · Seleccione una fila para abrir sus variables.';
}
function doRender(){
 killMap();
 if(['catalog','sources','cuencas'].includes(S.view)){shown=[];S.selected=''}
 if(S.view==='overview')summary();else if(S.view==='catalog')catalog();else if(S.view==='sources')sources();else if(S.view==='cuencas')basin();else drawRows(filtered());
}
async function draw(reset=true){
 const seq=++token;killMap();
 if(reset)toolbar();
 if(FILES[S.view]&&(S.view!=='storage'||S.state==='Jalisco')){
  const files=FILES[S.view];if(files.some(x=>!cache.has(x))){
   $('w17-content').innerHTML='<div class="w17-loading"><span class="w17-spinner"></span> Cargando observaciones originales…</div>';
   try{await Promise.all(files.map(getFile))}catch(err){if(seq!==token)return;$('w17-content').innerHTML='<div class="w17-empty"><strong>Error al consultar datos</strong>'+esc(err.message)+'<p><button data-w17-action="retry">Reintentar</button></p></div>';return}
   if(seq!==token)return;recordCache.clear();if(reset)toolbar();
  }
 }
 doRender();
}
function route(){
 if(root.hidden&&location.hash!=='#agua')return;
 const url=new URL(location.href);url.hash='agua';url.searchParams.set('wa',S.view);url.searchParams.set('ws',S.state);
 for(const [key,val]of [['wf',S.filter],['wp',S.period],['wq',S.search]]){if(val&&val!=='all')url.searchParams.set(key,val);else url.searchParams.delete(key)}
 history.replaceState(null,'',url.pathname+url.search+url.hash);
}
function navigate(v){
 if(!V[v])return;if(v==='overview')S.mode='map';S.view=v;S.search='';S.filter='all';S.period='all';S.selected='';S.sort='';S.page=1;
 if(v==='presas')S.state='Todos';if(v==='quality')S.state='Sinaloa';if(v==='storage'&&S.state==='Todos')S.state='Jalisco';
 route();draw();if(window.innerWidth<=740)window.scrollTo({top:0,behavior:'smooth'});
}
function exportRows(geo=false){
 if(!shown.length){msg('Abra una tabla con registros para descargar.');return}
 let content,type,ext;
 if(geo){
  const points=shown.filter(x=>x.lat!==null&&x.lon!==null).map(x=>({type:'Feature',geometry:{type:'Point',coordinates:[x.lon,x.lat]},properties:x.info}));
  if(!points.length){msg('La selección no contiene coordenadas.');return}
  content=JSON.stringify({type:'FeatureCollection',features:points});type='application/geo+json';ext='geojson';
 }else{
  const keys=[...new Set(shown.flatMap(x=>Object.keys(x.info)))];
  const safe=x=>{let s=String(x??'');if(/^[+=@-]/.test(s)&&!/^[+-]?\d+(\.\d+)?$/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};
  content='\uFEFF'+[keys,...shown.map(x=>keys.map(k=>x.info[k]??''))].map(x=>x.map(safe).join(',')).join('\r\n');type='text/csv;charset=utf-8';ext='csv';
 }
 const obj=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=obj;a.download='growa-agua-'+S.view+'.'+ext;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(obj),2500);msg('Archivo generado: '+a.download);
}
function action(v){
 switch(v){
 case 'guide':$('w17-guide').showModal();break;case 'guide-close':$('w17-guide').close();break;case 'source':navigate('sources');break;
 case 'reset':S.filter='all';S.period='all';S.search='';S.page=1;S.selected='';S.sort='';draw();route();msg('Filtros restablecidos');break;
 case 'export':exportRows();break;case 'geojson':exportRows(true);break;
 case 'prev':S.page=Math.max(1,S.page-1);doRender();break;case 'nextpage':S.page++;doRender();break;
 case 'next':{const pos=shown.findIndex(x=>x.id===S.selected);if(!shown.length)break;S.selected=shown[(pos+1)%shown.length].id;detail(shown);if(window.innerWidth<=1190)$('w17-detail').classList.add('w17-detail-visible');break}
 case 'detail-toggle':{
  const el=$('w17-detail'),collapsed=root.classList.toggle('w17-detail-collapsed');
  el.classList.toggle('w17-detail-visible',!collapsed);
  setTimeout(()=>mp?.invalidateSize(),130);
  break;
 }
 case 'sidebar-toggle':{
  const collapsed=root.classList.toggle('w20-nav-collapsed');
  const trigger=root.querySelector('[data-w17-action="sidebar-toggle"]');
  if(trigger)trigger.setAttribute('aria-expanded',String(!collapsed));
  setTimeout(()=>mp?.invalidateSize(),130);
  break;
 }
 case 'mode-map':S.mode='map';doRender();break;case 'mode-table':S.mode='table';doRender();break;
 case 'fit':if(mp&&marks.length)mp.fitBounds(marks.map(m=>m.getLatLng()),{padding:[25,25]});break;
 case 'retry':for(const x of FILES[S.view]||[])cache.delete(x);recordCache.clear();draw();break;
 }
}
root.addEventListener('click',e=>{
 const nav=e.target.closest('[data-w17-view]');if(nav){e.preventDefault();navigate(nav.dataset.w17View);return}
 const cmd=e.target.closest('[data-w17-action]');if(cmd){e.preventDefault();action(cmd.dataset.w17Action);return}
 const sort=e.target.closest('[data-w17-sort]');if(sort){S.dir=S.sort===sort.dataset.w17Sort?-S.dir:1;S.sort=sort.dataset.w17Sort;S.page=1;doRender();return}
 const rec=e.target.closest('[data-w17-id]');if(rec){S.selected=rec.dataset.w17Id;detail(shown);root.querySelectorAll('[data-w17-id]').forEach(tr=>tr.setAttribute('aria-selected',String(tr===rec)));if(window.innerWidth<=1190)$('w17-detail').classList.add('w17-detail-visible')}
});
root.addEventListener('keydown',e=>{const row=e.target.closest('[data-w17-id]');if(row&&['Enter',' '].includes(e.key)){e.preventDefault();row.click()}if(e.key==='Escape')$('w17-detail').classList.remove('w17-detail-visible')});
root.addEventListener('change',e=>{
 if(e.target.id==='w17-state'){S.state=e.target.value;S.filter='all';S.period='all';S.search='';S.page=1;S.selected='';draw();route()}
 if(e.target.id==='w17-filter'){S.filter=e.target.value;S.page=1;S.selected='';doRender();route()}
 if(e.target.id==='w17-period'){S.period=e.target.value;S.page=1;S.selected='';draw();route()}
 if(e.target.id==='w17-basemap'){S.basemap=e.target.value;renderMap(shown)}
});
root.addEventListener('input',e=>{if(e.target.id==='w17-search'){S.search=e.target.value;S.page=1;S.selected='';clearTimeout(inputTimer);inputTimer=setTimeout(()=>{doRender();route()},130)}});
function init(){
 try{
  D=JSON.parse($('wa-embedded-dataset').textContent);if(D.presas.length!==75||D.acuiferos.length!==216)throw Error('Dataset hídrico incompleto');
  const u=new URL(location.href),q=u.searchParams,alias={biblioteca:'catalog',nacional:'presas',observaciones:'quality',diario:'storage',almacenamiento:'storage',calidad:'quality',tendencias:'trend',fuentes:'sources'};
  const v=q.get('wa');S.view=V[v]?v:alias[v]||'overview';const st=q.get('ws');if(['Todos','Sinaloa','Sonora','Chihuahua','Jalisco','Michoacán'].includes(st))S.state=st;
  S.filter=q.get('wf')||'all';S.period=q.get('wp')||'all';S.search=(q.get('wq')||'').slice(0,100);
  if(S.view==='quality')S.state='Sinaloa';if(S.view==='storage'&&S.state==='Todos')S.state='Jalisco';
  const inp=$('w17-search');const list=document.createElement('datalist');list.id='w17-suggested';inp.setAttribute('list','w17-suggested');inp.parentNode.append(list);
  draw();
  window.GrowaWaterStudio={navigate,snapshot:()=>({view:S.view,state:S.state,visible:shown.length,filter:S.filter,period:S.period}),download:()=>exportRows()};
 }catch(e){console.error('GROWA Agua Studio',e);$('w17-content').innerHTML='<div class="w17-empty"><strong>No pudo iniciarse el centro hídrico.</strong>'+esc(e.message)+'</div>'}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();