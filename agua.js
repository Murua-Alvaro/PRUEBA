/* GROWA | Agua V9. Panel autónomo sin alterar el aplicativo agrícola. */
(() => {
 'use strict';
 const root=document.getElementById('panel-agua');
 if(!root)return;
 const byId=id=>document.getElementById(id);
 const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const n=v=>v==null||v===''?null:Number(v);
 const f=(v,d=1)=>v==null||!Number.isFinite(Number(v))?'—':new Intl.NumberFormat('es-MX',{maximumFractionDigits:d}).format(Number(v));
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
 const stateName=s=>{const v=normalize(s);if(v.includes('SINALOA'))return'Sinaloa';if(v.includes('SONORA'))return'Sonora';if(v.includes('CHIHUAHUA'))return'Chihuahua';if(v.includes('JALISCO'))return'Jalisco';if(v.includes('MICHOAC'))return'Michoacán';return s};
 const COLORS=['#197b88','#bc7f44','#577caa','#6a9a70','#8264a7'];
 const period='Corte de integración: octubre de 2026';
 let D,st='Sinaloa',view='resumen',metric='riego',dam='',query='',map=null;
 let cmpA='Sinaloa',cmpB='Sonora',cmpMetric='riego',cmpYear=2023,aqFilter='todos';
 let selectedDam='',minCapacity=0;
 const damMarkers=new Map();
 const belonging=(v)=>stateName(v)===st;
 const filtered=(arr,i=0)=>arr.filter(x=>belonging(x[i]));
 const table=(heads,rows,empty)=>rows.length?'<div class="wa-table-wrap"><table class="wa-table"><thead><tr>'+heads.map(h=>'<th>'+safe(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map((cell,i)=>'<td'+(typeof cell==='number'?' data-num':'')+'>'+safe(cell==null?'—':cell)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>':'<div class="wa-empty">'+safe(empty||'Sin registros verificados para esta selección.')+'</div>';
 const section=(eyebrow,title,content,extra='')=>'<section class="wa-card '+extra+'"><div class="wa-card-head"><div><div class="wa-eyebrow">'+safe(eyebrow)+'</div><h2>'+safe(title)+'</h2></div></div>'+content+'</section>';
 const kpi=(label,val,detail)=>'<div class="wa-kpi"><span>'+safe(label)+'</span><strong>'+safe(val)+'</strong><small>'+safe(detail)+'</small></div>';
 const info=msg=>'<div class="wa-note">'+msg+'</div>';
 const empty=msg=>'<div class="wa-empty">'+safe(msg)+'</div>';
 const series=(rows,title,units='',axis='year')=>{
  rows=rows.filter(x=>Number.isFinite(Number(x[1])));
  if(rows.length<2)return empty('No hay suficientes observaciones para construir una serie temporal.');
  rows.sort((a,b)=>a[0]-b[0]);const minY=Math.min(...rows.map(x=>x[1])),maxY=Math.max(...rows.map(x=>x[1]));
  const a=minY>=0?0:minY-(maxY-minY)*.08,b=maxY+(maxY-a)*.12||1;
  const minX=rows[0][0],maxX=rows.at(-1)[0],x=t=>56+(t-minX)/(maxX-minX||1)*800,y=t=>238-(t-a)/(b-a)*201;const tick=t=>axis==='date'?new Date(t*86400000).toISOString().slice(0,10):axis==='month'?Math.floor(t/12)+'-'+String(t%12+1).padStart(2,'0'):String(t);
  const path=rows.map((p,i)=>((i===0||(axis==='month'&&p[0]-rows[i-1][0]>1)||(axis==='date'&&p[0]-rows[i-1][0]>4))?'M':'L')+x(p[0]).toFixed(2)+','+y(p[1]).toFixed(2)).join(' ');
  const ticks=[0,.25,.5,.75,1].map(k=>{let yy=238-k*201,vl=a+k*(b-a);return '<line x1="55" x2="865" y1="'+yy+'" y2="'+yy+'" stroke="#e6ecef" /><text x="46" y="'+(yy+4)+'" text-anchor="end" fill="#79909b" font-size="11">'+safe(f(vl,0))+'</text>'}).join('');
  const circles=rows.map((p,i)=>{if(rows.length>70&&i%3!==0)return'';return '<circle cx="'+x(p[0])+'" cy="'+y(p[1])+'" r="3.5" fill="#1c7582" stroke="#fff" stroke-width="1"><title>'+safe(tick(p[0])+' · '+f(p[1],1)+' '+units)+'</title></circle>'}).join('');
  return '<svg class="wa-chart" role="img" aria-label="'+safe(title)+'" viewBox="0 0 900 280" xmlns="http://www.w3.org/2000/svg">'+ticks+
   '<path d="'+path+'" fill="none" stroke="#197b88" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'+circles+
   '<text x="55" y="264" font-size="12" fill="#738994">'+safe(tick(minX))+'</text><text x="865" y="264" font-size="12" text-anchor="end" fill="#738994">'+safe(tick(maxX))+'</text></svg>';
 };
 const cardStat=(title,records,pairs)=>section('EVOLUCIÓN OBSERVADA',title,series(records,title,pairs)+'<p class="wa-small-note">Comparación descriptiva: años disponibles, sin interpolación de observaciones faltantes.</p>');
 const getAquifers=()=>filtered(D.acuiferos.map(x=>[stateName(x[0]),...x.slice(1)]));
 const getDams=()=>filtered(D.presas);
 const riego=()=>filtered(D.riego).slice().sort((a,b)=>a[1]-b[1]);
 const clima=()=>filtered(D.clima).slice().sort((a,b)=>a[1]-b[1]);
 const coverage=(code)=>D.cobertura.find(x=>belonging(x[0])&&x[1]===code)?.[2]??null;
 const yearCheck=a=>a.length?String(a.at(-1)[1])+'/24':'Sin corte';
 function renderOverview(){
  const a=getAquifers(),p=getDams(),r=riego(),c=clima(),last=r.at(-1),neg=a.filter(x=>x[6]===1);
  return '<div class="wa-kpi-grid wa-grid">'+kpi('Acuíferos del catálogo',f(a.length,0),'Balance transversal, corte no certificado')+
  kpi('Saldo contable negativo',f(neg.length,0),'Acuíferos con disponibilidad neta menor que cero')+
  kpi('Presas inventariadas',f(p.length,0),'Capacidad nominal; no volumen almacenado')+
  kpi('Agua distribuida · último ciclo',last?f(last[2],0)+' hm³':'Sin registro',last?last[1]+'/'+String(last[1]+1).slice(-2)+' · Distritos de riego':'Datos históricos')+'</div>'+
  '<div class="wa-panels">'+section('SERIE ANUAL · 1997/98–2023/24','Volumen distribuido en distritos de riego',series(r.map(x=>[x[1],x[2]]),'Agua distribuida en '+st,'hm³')+
  '<p>No equivale al consumo real de los cultivos, ni mide la disponibilidad por municipio.</p>')+
  section('CLIMA MUNICIPAL AGREGADO · 2003–2025','Precipitación media municipal',series(c.map(x=>[x[1],x[2]]),'Precipitación en '+st,'mm')+
  '<p>Promedio entre municipios del estado, no lluvia ponderada por superficie geográfica.</p>')+
  section('ANÁLISIS TERRITORIAL','Infraestructura y reservas identificadas',
  '<div class="wa-stat-row"><div><strong>'+f(p.reduce((s,x)=>s+(n(x[6])||0),0),0)+' hm³</strong><span>Capacidad NAMO agregada de presas catalogadas</span></div><div><strong>'+f(a.reduce((s,x)=>s+(n(x[5])||0),0),1)+' hm³/año</strong><span>Balance contable sumado de acuíferos identificados</span></div><div><strong>'+f(coverage('estaciones_hidrometricas_catalogo'),0)+'</strong><span>Estaciones hidrométricas del catálogo, sin caudales observados</span></div></div>'+
  '<p class="wa-small-note">La suma de balances sirve para describir el inventario, no equivale a agua físicamente disponible a escala estatal.</p>')+
  section('DISPONIBILIDAD DE FUENTES','Qué puede compararse en el tiempo',table(['Conjunto','Alcance'],[['Distritos de riego','Serie anual 1997/98–2023/24'],['Clima','Serie municipal 2003–2025'],['Acuíferos','Balance de corte único'],['Cuencas','757 registros nacionales, corte 2020'],['Calidad','Fechas de medición sin validar'],['Caudales','Sin registros históricos descargados']]))+
  '</div>'+section('COMPARATIVO · CINCO ESTADOS','Indicadores del último ciclo y catálogos',table(['Estado','Agua distribuida 2023/24 · hm³','Presas catalogadas','Acuíferos','Acuíferos con saldo negativo'],D.estados.map(name=>{const rr=D.riego.filter(x=>stateName(x[0])===name&&x[1]===2023),aa=D.acuiferos.filter(x=>stateName(x[0])===name);return[name,rr.length?f(rr[0][2],1):'—',D.presas.filter(x=>stateName(x[0])===name).length,aa.length,aa.filter(x=>x[6]===1).length]})),'wa-wide')+info('<strong>Interpretación:</strong> este panel reúne capas con periodos distintos. Un cambio anual en lluvia o riego no implica automáticamente un cambio de disponibilidad subterránea.');
 }

 function damDetails(row){
  if(!row)return'<div class="wa-map-point"><div><h3>Seleccione una presa</h3><p>Haga clic en el mapa o en el inventario para consultar su ficha.</p></div></div>';
  return'<div class="wa-map-point"><div><div class="wa-eyebrow">FICHA DE INFRAESTRUCTURA · '+safe(row[1])+'</div><h3>'+safe(row[2])+'</h3><p>'+safe(row[3])+' · '+safe(st)+'<br>Coordenadas '+f(row[4],4)+', '+f(row[5],4)+'</p></div><div style="text-align:right"><strong>'+f(row[6])+'</strong><span style="display:block;color:#81949d;font-size:10px">hm³ NAMO</span></div></div>'+
  '<div class="wa-small-note">La cifra es capacidad nominal. No indica llenado actual ni agua disponible.</div>';
 }
 function selectDam(code,focus=true){
  const row=getDams().find(x=>x[1]===code);if(!row)return;
  selectedDam=code;const detail=byId('wa-dam-detail');if(detail)detail.innerHTML=damDetails(row);
  root.querySelectorAll('[data-wa-dam]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.waDam===code)));
  const pair=damMarkers.get(code);
  if(map&&pair&&focus){map.panTo([row[4],row[5]]);pair.openPopup();}
  for(const [key,marker] of damMarkers){marker.setStyle(key===code?{radius:10,weight:3,fillColor:'#0a5662',color:'#fff'}:{radius:Math.min(14,5+Math.sqrt(Math.max(0,getDams().find(x=>x[1]===key)?.[6]||0))/4),weight:1.3,fillColor:'#278897',color:'#fff'})}
 }
 function renderDams(){
  const all=getDams(),term=normalize(query),p=all.filter(x=>(x[6]??0)>=minCapacity&&(!term||normalize(x[2]+' '+x[3]+' '+x[1]).includes(term)));
  if(!p.some(x=>x[1]===selectedDam))selectedDam=p[0]?.[1]||'';
  const options=[[0,'Todas las capacidades'],[100,'NAMO ≥100 hm³'],[500,'NAMO ≥500 hm³'],[1000,'NAMO ≥1,000 hm³']].map(([value,label])=>'<option value="'+value+'" '+(minCapacity===value?'selected':'')+'>'+label+'</option>').join('');
  const bar='<div class="wa-focus-band wa-toolbar-rail"><div class="wa-toolset"><label for="wa-search">BUSCAR</label><input type="search" id="wa-search" value="'+safe(query)+'" placeholder="Presa, clave o municipio" aria-label="Buscar presas"/><label for="wa-capacity">CAPACIDAD</label><select id="wa-capacity">'+options+'</select></div><span class="wa-timestamp">'+p.length+' de '+all.length+' presas visibles</span></div>';
  const list=p.length?p.map(row=>'<button type="button" class="wa-map-row-btn" data-wa-dam="'+safe(row[1])+'" aria-pressed="'+(row[1]===selectedDam)+'">'+safe(row[2])+'<small>'+safe(row[3])+' · '+f(row[6],1)+' hm³ NAMO</small></button>').join(''):empty('No hay presas que cumplan los filtros.');
  let historical='';
  if(st==='Sinaloa'){
    const ss=D.sistemas.filter(x=>x[0]==='V-II_4_PRESAS').sort((a,b)=>a[1].localeCompare(b[1]));
    historical=section('CORTES JUN–OCT 2026 · CUATRO PRESAS','Almacenamiento observado · sistema V-II',series(ss.map(x=>[Date.parse(x[1])/86400000,x[3]]),'Almacenamiento de cuatro presas de Sinaloa','hm³','date')+
      '<div class="wa-stat-row"><div><strong>'+ss.length+' cortes</strong><span>Serie parcial, cuatro presas</span></div><div><strong>'+f(ss.at(-1)?.[3],1)+' hm³</strong><span>Última observación de este sistema</span></div></div>'+
      '<p class="wa-small-note">Sanalona, Adolfo López Mateos, José López Portillo y Eustaquio Buelna. Los datos no representan todas las presas de Sinaloa.</p>','wa-wide');
    historical+=section('PUNTOS AISLADOS · 2018 y 2026','Cortes individuales de presas',
      table(['Fecha','Clave','Almacenamiento hm³','% NAMO'],D.sinaloa.map(x=>[x[1],x[0],f(x[2]),f(x[3])]).slice(0,30))+
      '<p class="wa-small-note">No conectar puntos aislados como una serie diaria ni sumar presas de distintas fechas.</p>','wa-wide');
  } else if(st==='Jalisco'){
    const codes=[...new Set(D.jalisco.map(x=>x[0]))];if(!codes.includes(dam))dam=codes[0];
    const m=D.jalisco.filter(x=>x[0]===dam).sort((a,b)=>a[1].localeCompare(b[1]));
    const options=codes.map(x=>'<option value="'+safe(x)+'" '+(x===dam?'selected':'')+'>'+safe(x)+'</option>').join('');
    historical=section('SERIE MENSUAL · 1996–2024','Almacenamiento histórico · presa seleccionada',
      '<div class="wa-toolbar-inline"><label for="wa-dam">Clave de presa</label><select id="wa-dam">'+options+'</select></div>'+
      series(m.map(x=>[Number(x[1].slice(0,4))*12+Number(x[1].slice(5,7))-1,x[2]]),'Almacenamiento mensual de '+dam,'hm³','month')+
      '<p class="wa-small-note">'+m.length+' meses incluidos en la vista web. No interpolar los meses sin registros; consultar completitud diaria antes de comparar.</p>','wa-wide');
  }else historical=section('ESTADO DE LOS HISTÓRICOS','Almacenamiento por fecha',empty('La V9 conserva el inventario de presas de '+st+', pero todavía no tiene una serie validada de almacenamiento para este estado.'),'wa-wide');

  return '<div class="wa-splithead"><div><div class="wa-eyebrow">GEOGRAFÍA E INFRAESTRUCTURA</div><h2>Explorador de presas.</h2><p>Puntos de ubicación, capacidad de diseño y almacenamiento histórico sólo donde hay mediciones.</p></div><span class="wa-provenance-chip">INVENTARIO · NO TIEMPO REAL</span></div>'+
    bar+'<div class="wa-map-and-list">'+
    section('MAPA DE INFRAESTRUCTURA','Puntos georreferenciados', '<div id="wa-map" class="wa-map" role="region" aria-label="Mapa de presas, seleccionar marcadores"></div>'+
       '<div class="wa-focus-legend wa-small-note"><span><i class="wa-dot"></i> Capacidad NAMO (tamaño proporcional)</span><span><i class="wa-dot grey"></i> No implica volumen actual</span></div>')+
    section('EXPLORACIÓN VINCULADA · '+st,'Catálogo y ficha individual','<div class="wa-scroll">'+list+'</div><div id="wa-dam-detail">'+damDetails(p.find(x=>x[1]===selectedDam))+'</div>')+'</div>'+
    info('Las ubicaciones son puntos de un catálogo secundario con 75 presas en cinco estados. No se representa el área de embalse ni la disponibilidad actual.')+
    '<div class="wa-panels">'+historical+'</div>';
 }

 function renderCuencas(){
  const stations=D.cobertura.find(x=>stateName(x[0])===st&&x[1]==='estaciones_hidrometricas_catalogo')?.[2]||0;
  return'<div class="wa-splithead"><div><div class="wa-eyebrow">AGUA SUPERFICIAL / UNIDADES HIDROLÓGICAS</div><h2>Cuencas y observación fluvial.</h2><p>Inventarios nacionales y mediciones hidrométricas son capas distintas. Aquí se muestra el alcance verificable.</p></div><span class="wa-provenance-chip">CATÁLOGO · CORTE HISTÓRICO</span></div>'+
  '<div class="wa-kpi-grid wa-grid">'+kpi('Cuencas registradas en México','757','Cobertura nacional · corte 2020')+
   kpi('Cuencas con disponibilidad','653','Clasificación transversal nacional')+
   kpi('Cuencas sin disponibilidad','104','Clasificación transversal nacional')+
   kpi('Estaciones catalogadas en '+st,stations,'Sin series de caudales integradas')+'</div>'+
  '<div class="wa-panels">'+
    section('ESTRUCTURA DE DATOS','Disponibilidad superficial',
      '<div class="wa-availability"><div class="wa-availability-row"><span>Con disponibilidad</span><strong>653</strong></div><div class="wa-availability-track"><div style="width:86.26%;background:#177b87;height:100%"></div></div><div class="wa-availability-row"><span>Sin disponibilidad</span><strong>104</strong></div><div class="wa-availability-track"><div style="width:13.74%;background:#bc8d53;height:100%"></div></div></div>'+
      '<p>Los valores representan la clasificación de un único corte nacional, no la evolución de las cuencas ni la asignación a un estado.</p>')+
    section('ESTACIONES HIDROMÉTRICAS','Datos observables y datos pendientes',
      '<div class="wa-stat-row"><div><strong>'+stations+'</strong><span>Estaciones catalogadas en '+safe(st)+'</span></div><div><strong>0</strong><span>Series históricas de caudales descargadas para este estado en V9</span></div></div>'+
      '<p>El catálogo identifica ubicaciones y claves, pero no acredita operación actual ni aporta todavía caudales medidos.</p>')+
    section('COBERTURA Y TRAZABILIDAD','Por qué no mostramos un mapa de cuencas',
      '<p>El proyecto conserva 757 registros nacionales, pero esta edición web no incluye polígonos oficiales verificados ni cruces espaciales cuenca-estado. Dibujar polígonos o imputar un balance estatal sería incorrecto.</p>'+
      '<p>Las fichas y series individuales se habilitarán al incorporar cartografía validada y archivos diarios de estaciones desde CONAGUA.</p>'+
      '<a class="wa-reference-link" href="https://sih.conagua.gob.mx/" target="_blank" rel="noopener noreferrer">Consultar SIH / CONAGUA ↗</a>','wa-wide')+'</div>';
 }

 function renderAquifers(){
  const all=getAquifers(),def=all.filter(x=>x[6]===1),term=normalize(query);
  const subset=all.filter(x=>(aqFilter==='todos'||(aqFilter==='negativos'?x[6]===1:x[6]!==1))&&normalize(x[2]+' '+x[1]).includes(term)).sort((x,y)=>(x[5]??0)-(y[5]??0));
  const strongest=def.slice().sort((a,b)=>a[5]-b[5]).slice(0,6);
  const max=Math.max(1,...strongest.map(x=>Math.abs(x[5]||0)));
  const bars=strongest.length?'<div class="wa-deficit-list">'+strongest.map(x=>'<div><div class="wa-deficit-head"><span>'+safe(x[2])+'</span><strong>'+f(x[5])+' hm³/año</strong></div><div class="wa-deficit-track"><div style="width:'+Math.max(3,100*Math.abs(x[5]||0)/max).toFixed(1)+'%"></div></div></div>').join('')+'</div>':empty('No aparecen balances negativos en esta selección.');
  const choices=[['todos','Todos'],['negativos','Saldo negativo'],['no-negativos','Saldo no negativo']].map(([key,label])=>'<button type="button" class="wa-pill" data-wa-aq-filter="'+key+'" aria-pressed="'+(aqFilter===key)+'">'+label+'</button>').join('');
  return'<div class="wa-splithead"><div><div class="wa-eyebrow">RECURSOS SUBTERRÁNEOS</div><h2>Balances de acuíferos.</h2><p>Datos de disponibilidad, recarga y volumen comprometido según el inventario de la V9.</p></div><span class="wa-provenance-chip">TRANSVERSAL · SIN SERIE ANUAL</span></div>'+
   '<div class="wa-kpi-grid wa-grid">'+kpi('Acuíferos identificados',all.length,'Balance nacional de corte único')+
   kpi('Saldo contable negativo',def.length,'No representa una tendencia histórica')+
   kpi('Recarga reportada',f(all.reduce((v,x)=>v+(x[3]||0),0),0)+' hm³/año','Total de acuíferos del inventario')+
   kpi('VEAS comprometido',f(all.reduce((v,x)=>v+(x[4]||0),0),0)+' hm³/año','No equivale a bombeo observado')+'</div>'+
   info('La disponibilidad es un balance contable cuya vigencia normativa nacional no está certificada. Un saldo negativo no expresa por sí solo el nivel físico almacenado ni el volumen extraído realmente.')+
   '<div class="wa-panels">'+section('LECTURA DEL INVENTARIO','Principales balances negativos',bars+'<p class="wa-small-note">Selección ordenada por magnitud negativa; no establece una clasificación de riesgo actual.</p>')+
   section('METODOLOGÍA','Qué representa la disponibilidad', '<p>Recarga media anual menos descarga natural comprometida y volumen de extracción incluido en el balance administrativo.</p><div class="wa-formula">DMA = R − DNC − VEAS</div><p>Las unidades de los cuatro términos son hm³/año. No sumamos balances de acuíferos para estimar agua disponible por municipio.</p>')+'</div>'+
   section('EXPLORACIÓN · '+st,'Listado completo de acuíferos',
     '<div class="wa-toolbar-inline"><input type="search" id="wa-search" aria-label="Buscar acuíferos" value="'+safe(query)+'" placeholder="Nombre o clave de acuífero"/><span class="wa-small-note">'+subset.length+' de '+all.length+' registros</span></div><div class="wa-pills" aria-label="Filtrar estado del balance">'+choices+'</div>'+
     table(['Acuífero','Clave','Recarga (hm³/año)','VEAS (hm³/año)','Saldo (hm³/año)','Condición'],
       subset.map(x=>[x[2],x[1],f(x[3]),f(x[4]),f(x[5]),x[6]===1?'Negativo':'No negativo']))+
     '<p class="wa-small-note">Usar la publicación normativa de CONAGUA antes de aplicaciones de gestión o concesionamiento.</p>','wa-wide');
 }
 function renderHistory(){
  const r=riego(),c=clima(),tr=D.tendencias.filter(x=>belonging(x[0])),fields=[['riego','Agua distribuida (hm³)'],['lluvia','Precipitación media (mm)'],['et0','Evapotranspiración ET₀ (mm)']];
  const control='<div class="wa-pills" role="group" aria-label="Indicador histórico">'+fields.map(([key,name])=>'<button class="wa-pill" type="button" data-wa-metric="'+key+'" aria-pressed="'+(metric===key)+'">'+safe(name)+'</button>').join('')+'</div>';
  const obs=metric==='riego'?r.map(x=>[x[1],x[2]]):c.map(x=>[x[1],metric==='lluvia'?x[2]:x[3]]);
  const unit=metric==='riego'?'hm³':'mm';
  return control+'<div class="wa-panels" style="margin-top:1.1rem">'+section('SERIE ANUAL · '+st,'Trayectoria del indicador',series(obs,'Evolución histórica '+st,unit)+
    '<p>El periodo y la metodología dependen del indicador; no se aplicaron imputaciones.</p>','wa-wide')+
   section('DISTRITOS DE RIEGO','Detalle anual y superficie regada',
      table(['Ciclo','Distritos','Volumen hm³','Hectáreas regadas','m³/ha'],r.map(x=>[x[1]+'/'+String(x[1]+1).slice(-2),x[5],f(x[2]),f(x[3],0),f(x[4],0)])))+
   section('CONDICIONES METEOROLÓGICAS','Precipitación y demanda atmosférica',
      table(['Año','Precipitación mm','ET₀ mm','Balance P−ET₀ mm'],c.map(x=>[x[1],f(x[2]),f(x[3]),f(x[4])])))+
   section('ESTIMACIÓN ESTADÍSTICA · DISTRITO','Tendencias Theil–Sen / Kendall',table(['Distrito','Ciclos','Pendiente hm³/año','q FDR','Resultado'],tr.map(x=>[x[2],x[3],f(x[4],2),f(x[5],4),x[6]]))+'<p class="wa-small-note">Estimaciones descriptivas robustas con corrección de pruebas múltiples Benjamini–Hochberg. No atribuyen causas a los cambios.</p>','wa-wide')+
   '</div>'+info('Las observaciones de riego corresponden a ciclos agrícolas; las de clima a años calendario. Se presentan conjuntamente para investigación exploratoria, no como balance hidrológico causal.');
 }
 function renderQuality(){
  const all=D.calidad.filter(x=>belonging(x[0])),q=all.filter(x=>normalize(x[1]+' '+x[2]).includes(normalize(query)));
  const sites=all.length;
  return '<div class="wa-splithead"><div><div class="wa-eyebrow">MUESTREO Y TRAZABILIDAD</div><h2>Calidad del agua.</h2><p>Registros recuperados a nivel de sitio. No se presentan como mediciones actuales ni series temporales verificadas.</p></div><span class="wa-provenance-chip">FECHAS NO ACREDITADAS</span></div>'+
   '<div class="wa-kpi-grid wa-grid">'+kpi('Sitios identificados',sites,'Catálogo de sitios en V9')+
   kpi('Registros recuperados',all.reduce((v,x)=>v+(x[3]||0),0),'Sin fecha de muestreo comprobada')+
   kpi('Registros con fecha verificada',all.reduce((v,x)=>v+(x[4]||0),0),'No estimar tendencias')+
   kpi('Estados con esta tabla',1,'Únicamente Sinaloa, no cinco estados')+'</div>'+
   (st!=='Sinaloa'?empty('La edición V9 todavía no contiene mediciones de calidad del agua recuperadas para '+st+'. Consulte el inventario oficial de CONAGUA para ampliar cobertura.') :
   info('El pH presentado es un promedio simple de registros sin fecha verificable. No debe interpretarse como cumplimiento de normas, estatus sanitario o calidad actual del agua.')+
   section('RED DE MONITOREO · SINALOA','Explorar los sitios recuperados',
      '<div class="wa-toolbar-inline"><input id="wa-search" type="search" aria-label="Buscar sitios de calidad del agua" placeholder="Buscar por nombre o clave" value="'+safe(query)+'"/><span class="wa-small-note">'+q.length+' de '+sites+' sitios</span></div>'+
      table(['Nombre del sitio','Clave','Registros','Fechas verificadas','pH medio'],q.map(x=>[x[2],x[1],x[3],x[4],f(x[5],2)]))+
      '<p class="wa-small-note">La cantidad de filas por sitio no equivale a una periodicidad válida de muestreo.</p>','wa-wide'));
 }
 function comparisonData(name,ind){
  const source=ind==='riego'?D.riego:D.clima;
  const column=ind==='riego'?2:ind==='lluvia'?2:ind==='et0'?3:4;
  return source.filter(row=>stateName(row[0])===name).map(row=>[row[1],row[column]]).sort((a,b)=>a[0]-b[0]);
 }
 function compareGraph(a,b,label,unit){
  const all=[...a,...b].filter(p=>Number.isFinite(p[1]));
  if(all.length===0)return empty('Sin observaciones para comparar.');
  const years=all.map(p=>p[0]),values=all.map(p=>p[1]);
  const x0=Math.min(...years),x1=Math.max(...years),lo=Math.min(0,...values),hi=Math.max(...values),span=hi-lo||1;
  const X=x=>55+790*(x-x0)/(x1-x0||1),Y=y=>235-187*(y-lo+span*.04)/(span*1.16);
  const line=(arr,c)=>'<path d="'+arr.map((p,i)=>(i?'L':'M')+X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1)).join(' ')+'" stroke="'+c+'" stroke-width="3" stroke-linejoin="round" fill="none"/>'+arr.map(p=>'<circle cx="'+X(p[0])+'" cy="'+Y(p[1])+'" r="3" fill="'+c+'"><title>'+safe(p[0]+' · '+f(p[1])+' '+unit)+'</title></circle>').join('');
  const ticks=[0,.25,.5,.75,1].map(t=>{const v=lo+(hi-lo)*t,y=Y(v);return '<line x1="52" x2="848" y1="'+y+'" y2="'+y+'" stroke="#e2e9eb"/><text x="45" y="'+(y+4)+'" text-anchor="end" font-size="11" fill="#7c919a">'+safe(f(v,0))+'</text>'}).join('');
  return '<svg class="wa-chart" role="img" aria-label="'+safe(label)+'" viewBox="0 0 895 270" xmlns="http://www.w3.org/2000/svg">'+ticks+line(a,'#137c88')+line(b,'#b98557')+'<text x="54" y="265" font-size="11" fill="#718a93">'+x0+'</text><text x="848" y="265" font-size="11" text-anchor="end" fill="#718a93">'+x1+'</text></svg>';
 }
 function renderComparison(){
  const titles={riego:['Agua distribuida (hm³)','hm³','Ciclo agrícola, no extracción real por cultivo'],lluvia:['Precipitación media municipal (mm)','mm','Promedio simple de municipios observados'],et0:['ET₀ media municipal (mm)','mm','Demanda atmosférica estimada'],balance:['Balance climático P−ET₀ (mm)','mm','No es balance hídrico de cuenca']};
  const labels=titles[cmpMetric],a=comparisonData(cmpA,cmpMetric),b=comparisonData(cmpB,cmpMetric);
  const low=cmpMetric==='riego'?1997:2003,high=cmpMetric==='riego'?2023:2025;
  cmpYear=Math.max(low,Math.min(high,cmpYear));
  const aValue=a.find(x=>x[0]===cmpYear)?.[1],bValue=b.find(x=>x[0]===cmpYear)?.[1];
  const selected=(list,current)=>list.map(x=>'<option value="'+safe(x[0])+'" '+(current===x[0]?'selected':'')+'>'+safe(x[1])+'</option>').join('');
  const states=D.estados.map(x=>[x,x]),metrics=Object.entries(titles).map(([k,v])=>[k,v[0]]),years=Array.from({length:high-low+1},(_,i)=>[String(high-i),String(high-i)]);
  const control=(id,label,options,value)=>'<label for="'+id+'">'+label+'</label><select id="'+id+'">'+selected(options,String(value))+'</select>';
  const count=a.filter(x=>b.some(y=>x[0]===y[0])).length;
  const diff=aValue==null||bValue==null?null:aValue-bValue;
  const latest=D.estados.map(x=>{const v=comparisonData(x,cmpMetric).find(z=>z[0]===cmpYear);return[x,v?f(v[1]):'—']});
  return '<div class="wa-splithead"><div><div class="wa-eyebrow">ANÁLISIS MULTIESTATAL</div><h2>Comparación de trayectorias.</h2><p>Dos territorios, un indicador y una escala temporal común.</p></div><span class="wa-provenance-chip">SERIES OBSERVADAS</span></div>'+
   '<div class="wa-focus-band wa-toolbar-rail"><div class="wa-toolset">'+control('wa-cmp-a','ESTADO A',states,cmpA)+control('wa-cmp-b','ESTADO B',states,cmpB)+control('wa-cmp-metric','INDICADOR',metrics,cmpMetric)+control('wa-cmp-year','AÑO / CICLO',years,cmpYear)+'</div><button type="button" id="wa-cmp-swap" class="wa-mini-btn">⇄ Intercambiar</button></div>'+
   '<div class="wa-compare-kpis"><div class="wa-compare-kpi"><span><i class="wa-comparison-swatch a"></i>'+safe(cmpA)+'</span><strong>'+f(aValue)+' '+labels[1]+'</strong><small>'+cmpYear+' · Entidad A</small></div><div class="wa-compare-kpi"><span><i class="wa-comparison-swatch b"></i>'+safe(cmpB)+'</span><strong>'+f(bValue)+' '+labels[1]+'</strong><small>'+cmpYear+' · Entidad B</small></div></div>'+
   '<div class="wa-compare-shell"><div class="wa-comparison-card"><div class="wa-card-head"><h3>'+safe(labels[0])+'</h3></div>'+compareGraph(a,b,labels[0],labels[1])+'<div class="wa-legend"><span style="--wa-legend:#137c88">'+safe(cmpA)+'</span><span style="--wa-legend:#b98557">'+safe(cmpB)+'</span></div></div>'+
   '<aside class="wa-comparison-card"><div class="wa-eyebrow">LECTURA ESTADÍSTICA</div><h3>Diferencia del corte '+cmpYear+'</h3><div class="wa-stat-row"><div><strong>'+(diff==null?'—':(diff>0?'+':'')+f(diff)+' '+labels[1])+'</strong><span>A menos B</span></div><div><strong>'+count+'</strong><span>Periodos comunes</span></div></div><p>'+safe(labels[2])+'. No se infiere causalidad ni jerarquía de gestión pública.</p></aside></div>'+
   section('CORTE MULTIESTATAL · '+cmpYear,'Las cinco entidades',table(['Estado',labels[0]],latest),'wa-wide')+
   info('Comparación descriptiva: los estados difieren en tamaño, composición de distritos y superficie agrícola. No deben interpretarse valores absolutos como medidas de eficiencia.');
 }

 function renderSources(){
  const items=[
   ['Distritos de riego · histórico','1997/98–2023/24','CONAGUA (compilación de series distritales)','https://www.gob.mx/conagua'],
   ['Clima municipal · histórico','2003–2025','NASA POWER y elaboración GROWA','https://power.larc.nasa.gov/'],
   ['Inventario de presas','75 registros en cinco estados, corte único','Catálogo alterno derivado de CONAGUA','https://github.com/lapanquecita/conagua-presas'],
   ['Almacenamiento Jalisco','Tres presas, series diarias 1996–2024, exportadas a cortes mensuales','Archivo histórico derivado del SIH','https://sih.conagua.gob.mx/presas.html'],
   ['Almacenamiento Sinaloa','95 observaciones del sistema de cuatro presas en 2026; 26 cortes individuales','Fuentes identificadas en V8/V9; no equiparar universos','https://sih.conagua.gob.mx/presas.html'],
   ['Acuíferos','216 balances de corte único en cinco estados','Compilación secundaria; vigencia normativa nacional sin acreditar','https://sigagis.conagua.gob.mx/gas1/sections/acuerdos_dof.html'],
   ['Cuencas','757 cuencas a escala nacional, sólo corte 2020','CONAGUA; sin polígonos de asignación por estado verificados','https://datos.conagua.gob.mx/views/index_datos_abiertos.html'],
   ['Calidad del agua','6,095 filas de Sinaloa, 223 sitios, sin fecha válida','Datos recuperados; falta cotejo RENAMECA','https://www.gob.mx/conagua'],
   ['Caudales de ríos','349 estaciones de catálogo, sin series de caudal importadas','SIH · estaciones hidrométricas','https://sih.conagua.gob.mx/hidros.html']
  ];
  return '<div class="wa-provenance">'+items.map(([name,period,source,url])=>'<section class="wa-source"><strong>'+safe(name)+'</strong><p>'+safe(period)+'<br>'+safe(source)+'</p><a href="'+safe(url)+'" target="_blank" rel="noopener noreferrer">Consultar fuente ↗</a></section>').join('')+'</div>'+
   info('<strong>Criterio metodológico:</strong> las capas transversales no se usan como series temporales. No asignar toda la capacidad de una presa o el balance de un acuífero a municipios intersectados. Los indicadores de sequedad no son el Monitor de Sequía oficial.');
 }
 function syncHeader(){if(root.hidden)return;document.title='Growa | Agua y recursos hídricos · '+st;const crumb=document.querySelector('.breadcrumb');if(crumb)crumb.textContent='GROWA / OBSERVATORIO AGRÍCOLA / AGUA / '+st.toUpperCase();const ux=byId('ux-view-title');if(ux)ux.textContent='Agua · '+st;}
 function render(){
  if(!D)return;
  syncHeader();
  byId('wa-state').value=st;
  const label=byId('wa-scope-label');if(label)label.innerHTML=safe(st)+' <small>· '+getDams().length+' presas · '+getAquifers().length+' acuíferos</small>';
  const qualityButton=root.querySelector('[data-wa-view="calidad"]');if(qualityButton)qualityButton.hidden=st!=='Sinaloa';
  root.querySelectorAll('[data-wa-view]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.waView===view)));
  if(map){map.remove();map=null}
  damMarkers.clear();
  const target=byId('wa-content');
  if(view==='resumen')target.innerHTML=renderOverview();
  if(view==='presas')target.innerHTML=renderDams();
  if(view==='acuiferos')target.innerHTML=renderAquifers();
  if(view==='cuencas')target.innerHTML=renderCuencas();
  if(view==='series')target.innerHTML=renderHistory();
  if(view==='calidad')target.innerHTML=renderQuality();
  if(view==='comparar')target.innerHTML=renderComparison();
  if(view==='fuentes')target.innerHTML=renderSources();
  byId('wa-export').hidden=view==='fuentes';
  if(view==='presas'&&window.L&&getDams().length){
   requestAnimationFrame(()=>{
    const container=byId('wa-map');if(!container||root.hidden)return;
    map=L.map(container,{scrollWheelZoom:false,zoomControl:true,preferCanvas:true});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:16}).addTo(map);
    L.control.scale({imperial:false,metric:true,position:'bottomleft'}).addTo(map);
    const pts=getDams().filter(x=>(x[6]??0)>=minCapacity&&(!query||normalize(x[2]+' '+x[3]+' '+x[1]).includes(normalize(query))));
    const bounds=[];
    for(const p of pts){if(!Number.isFinite(p[4])||!Number.isFinite(p[5]))continue;
     const radius=Math.min(14,5+Math.sqrt(Math.max(0,p[6]||0))/4);
     const marker=L.circleMarker([p[4],p[5]],{radius,color:'#fff',fillColor:'#278897',weight:1.3,fillOpacity:.87}).addTo(map);
     marker.bindPopup('<strong>'+safe(p[2])+'</strong><br>'+safe(p[3])+'<br>NAMO: '+f(p[6])+' hm³<br><small>Capacidad nominal · No nivel actual</small>');
     marker.on('click',()=>selectDam(p[1],false));
     damMarkers.set(p[1],marker);bounds.push([p[4],p[5]]);
    }
    if(bounds.length)map.fitBounds(bounds,{padding:[26,26],maxZoom:9});else map.setView([24.8,-107.5],6);
    if(selectedDam)selectDam(selectedDam,false);
    setTimeout(()=>map&&map.invalidateSize(false),110);
   });
  }
 }
 function exportCsv(){
  let rows=[],headers=[],name='agua-'+view+'-'+st.toLowerCase().replace(/\W+/g,'-')+'.csv';
  if(view==='resumen'||view==='series'){headers=['estado','anio','volumen_riego_hm3','area_regada_ha','m3_por_ha'];rows=riego().map(x=>[st,x[1],x[2],x[3],x[4]])}
  if(view==='presas'){headers=['estado','clave_sih','presa','municipio','latitud','longitud','capacidad_namo_hm3'];rows=getDams().filter(x=>(x[6]??0)>=minCapacity&&(!query||normalize(x[2]+' '+x[3]+' '+x[1]).includes(normalize(query))))}
  if(view==='acuiferos'){headers=['estado','clave','acuifero','recarga_hm3_anio','veas_hm3_anio','disponibilidad_hm3_anio','saldo_negativo'];rows=getAquifers().map(x=>[x[0],x[1],x[2],x[3],x[4],x[5],x[6]])}
  if(view==='cuencas'){headers=['estado','componente','registros','inicio','fin','temporalidad'];rows=D.cobertura.filter(x=>stateName(x[0])===st&&(/cuencas|hidrometricas/i).test(x[1])).map(x=>x.slice(0,6))}
  if(view==='calidad'){headers=['estado','clave_sitio','nombre_sitio','filas','filas_con_fecha','ph_medio'];rows=D.calidad.filter(x=>belonging(x[0]))}
  if(view==='comparar'){headers=['anio',cmpA+'_'+cmpMetric,cmpB+'_'+cmpMetric];const a=comparisonData(cmpA,cmpMetric),b=comparisonData(cmpB,cmpMetric);const years=[...new Set([...a,...b].map(x=>x[0]))].sort();rows=years.map(year=>[year,a.find(x=>x[0]===year)?.[1]??'',b.find(x=>x[0]===year)?.[1]??''])}
  if(!rows.length)return;
  const csv='\ufeff'+[headers,...rows].map(row=>row.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
  const a=document.createElement('a'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 root.addEventListener('click',e=>{
  const t=e.target.closest('[data-wa-view]');if(t){view=t.dataset.waView;query='';render();return}
  const m=e.target.closest('[data-wa-metric]');if(m){metric=m.dataset.waMetric;render();return}
  const aq=e.target.closest('[data-wa-aq-filter]');if(aq){aqFilter=aq.dataset.waAqFilter;render();return}
  const row=e.target.closest('[data-wa-dam]');if(row){selectDam(row.dataset.waDam);return}
  if(e.target.closest('#wa-cmp-swap')){const x=cmpA;cmpA=cmpB;cmpB=x;render();return}
  if(e.target.closest('#wa-method-shortcut')){view='fuentes';render();return}
  if(e.target.closest('#wa-copy-link')){
    const u=new URL(location.href);u.searchParams.set('aguaEstado',st);u.searchParams.set('aguaVista',view);u.searchParams.set('aguaA',cmpA);u.searchParams.set('aguaB',cmpB);u.searchParams.set('aguaIndicador',cmpMetric);u.searchParams.set('aguaAnio',String(cmpYear));u.searchParams.set('aguaFiltro',query.slice(0,80));u.searchParams.set('aguaMin',String(minCapacity));u.hash='agua';
    const button=e.target.closest('#wa-copy-link'),initial=button.textContent;
    if(navigator.clipboard?.writeText)navigator.clipboard.writeText(u.href).then(()=>{button.textContent='Copiado ✓';setTimeout(()=>button.textContent=initial,1700)}).catch(()=>button.textContent='Error al copiar');
    else{button.textContent='Copie el enlace del navegador';setTimeout(()=>button.textContent=initial,2400)}
    return;
  }
  if(e.target.closest('#wa-export'))exportCsv();
 });
 root.addEventListener('change',e=>{
  if(e.target.id==='wa-cmp-a'){cmpA=e.target.value;render();return}
  if(e.target.id==='wa-cmp-b'){cmpB=e.target.value;render();return}
  if(e.target.id==='wa-cmp-metric'){cmpMetric=e.target.value;render();return}
  if(e.target.id==='wa-cmp-year'){cmpYear=Number(e.target.value);render();return}
  if(e.target.id==='wa-state'){st=e.target.value;query='';dam='';selectedDam='';minCapacity=0;if(view==='calidad'&&st!=='Sinaloa')view='resumen';render()}if(e.target.id==='wa-dam'){dam=e.target.value;render()}if(e.target.id==='wa-capacity'){minCapacity=Number(e.target.value)||0;selectedDam='';render()}});
 root.addEventListener('input',e=>{if(e.target.id==='wa-search'){const pos=e.target.selectionStart;query=e.target.value;render();const box=byId('wa-search');if(box){box.focus();box.setSelectionRange(Math.min(pos,query.length),Math.min(pos,query.length))}}});
 const observer=new MutationObserver(()=>{if(!root.hidden){syncHeader();if(map)setTimeout(()=>map.invalidateSize(),60)}});
 observer.observe(root,{attributes:true,attributeFilter:['hidden']});
 async function init(){
  try{let response=await fetch('data/agua-v9.json',{cache:'no-cache'});if(!response.ok)throw Error('HTTP '+response.status);
   D=await response.json();if(D.presas.length!==75||D.acuiferos.length!==216)throw Error('La edición V9 no coincide con la estructura esperada');
   const params=new URL(location.href).searchParams;
   if(D.estados.includes(params.get('aguaEstado')))st=params.get('aguaEstado');
   if(['resumen','presas','acuiferos','cuencas','series','comparar','calidad','fuentes'].includes(params.get('aguaVista')))view=params.get('aguaVista');
   if(D.estados.includes(params.get('aguaA')))cmpA=params.get('aguaA');
   if(D.estados.includes(params.get('aguaB')))cmpB=params.get('aguaB');
   if(['riego','lluvia','et0','balance'].includes(params.get('aguaIndicador')))cmpMetric=params.get('aguaIndicador');
   if(/^20\d{2}$/.test(params.get('aguaAnio')||''))cmpYear=Number(params.get('aguaAnio'));
   if(params.get('aguaFiltro'))query=params.get('aguaFiltro').slice(0,80);
   if(['0','100','500','1000'].includes(params.get('aguaMin')))minCapacity=Number(params.get('aguaMin'));
   byId('wa-state').innerHTML=D.estados.map(x=>'<option value="'+safe(x)+'">'+safe(x)+'</option>').join('');
   render();
   if(location.hash==='#agua'&&typeof window.GrowaNavigate==='function')window.GrowaNavigate('agua');
  }catch(err){byId('wa-content').innerHTML=empty('No fue posible cargar los datos hídricos. Actualice la página o revise la conexión al repositorio.');console.error('GROWA Agua V9:',err)}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
 window.addEventListener('hashchange',()=>{if(location.hash==='#agua'&&window.GrowaNavigate)window.GrowaNavigate('agua')});
})();