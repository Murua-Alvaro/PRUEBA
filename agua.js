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
 let cmpA='Sinaloa',cmpB='Sonora',cmpMetric='riego',cmpYear=2023;
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
  const path=rows.map((p,i)=>(i?'L':'M')+x(p[0]).toFixed(2)+','+y(p[1]).toFixed(2)).join(' ');
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
 function renderDams(){
  const all=getDams(),term=normalize(query);
  const p=all.filter(x=>!term||normalize(x[2]+' '+x[3]+' '+x[1]).includes(term));
  const bar='<div class="wa-toolbar-inline"><input type="search" id="wa-search" value="'+safe(query)+'" placeholder="Buscar presa o municipio" aria-label="Buscar presas" autocomplete="off"/><span class="wa-small-note">'+p.length+' de '+all.length+' presas</span></div>';
  const list=table(['Presa','Municipio','Clave','NAMO hm³'],p.map(x=>[x[2],x[3],x[1],f(x[6],1)]),'No se encontraron presas para esta búsqueda.');
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
  return info('La capacidad <strong>NAMO</strong> de una presa es un dato de infraestructura. El almacenamiento real requiere mediciones con fecha. No confundir ambos indicadores.')+
   bar+'<div class="wa-map-and-list">'+section('CARTOGRAFÍA','Ubicación de presas del catálogo','<div id="wa-map" class="wa-map" role="region" aria-label="Mapa interactivo de presas"></div><p class="wa-small-note">Puntos del inventario de la V9. No son polígonos de embalse ni disponibilidad actual.</p>')+
   section('INVENTARIO · '+st,'Presas registradas','<div class="wa-scroll">'+list+'</div>')+'</div><div class="wa-panels" style="margin-top:1.1rem">'+historical+'</div>';
 }
 function renderAquifers(){
  const a=getAquifers(),def=a.filter(x=>x[7]===1), term=normalize(query);
  const subset=a.filter(x=>normalize(x[2]+' '+x[1]).includes(term)).sort((x,y)=>(x[5]??0)-(y[5]??0));
  return '<div class="wa-kpi-grid wa-grid">'+kpi('Acuíferos identificados',a.length,'Catálogo de corte único')+
   kpi('Balance negativo',def.length,'No equivale a tendencia')+
   kpi('Recarga total reportada',f(a.reduce((s,x)=>s+(x[3]||0),0),0)+' hm³/año','Sumatoria contable descriptiva')+
   kpi('Extracción VEAS reportada',f(a.reduce((s,x)=>s+(x[4]||0),0),0)+' hm³/año','No corresponde a extracción real medida')+'</div>'+
   info('La disponibilidad de cada acuífero se expresa como balance contable de un único corte nacional no certificado. No se infiere cuánto puede extraerse por municipio.')+
   section('BALANCES SUBTERRÁNEOS','Acuíferos de '+st,
     '<div class="wa-toolbar-inline"><input type="search" id="wa-search" value="'+safe(query)+'" placeholder="Buscar acuífero o clave" aria-label="Buscar acuíferos"><span class="wa-small-note">'+subset.length+' de '+a.length+'</span></div>'+
     table(['Acuífero','Clave','Recarga hm³/año','VEAS hm³/año','Disponibilidad hm³/año','Condición'],
       subset.map(x=>[x[2],x[1],f(x[3]),f(x[4]),f(x[5]),x[6]===1?'Saldo negativo':'Saldo no negativo']))+
     '<p class="wa-small-note">VEAS es volumen comprometido/concesionado en el balance; no representa necesariamente bombeo observado. No usar para concluir cumplimiento normativo actual.</p>');
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
  const q=D.calidad.filter(x=>belonging(x[0]));
  const sites=q.length;
  return '<div class="wa-kpi-grid wa-grid">'+kpi('Sitios con datos recuperados',sites,'Registros en base V9')+
  kpi('Filas de medición',q.reduce((s,x)=>s+(x[3]||0),0),'Sin temporalidad acreditada')+
  kpi('Filas con fecha verificada',q.reduce((s,x)=>s+(x[4]||0),0),'No construir tendencias')+
  kpi('Cobertura histórica','No validada','No extrapolar resultados a todo el estado')+'</div>'+
  (st!=='Sinaloa'?empty('No hay mediciones de calidad del agua recuperadas y verificadas para '+st+' en la V9. Esto no significa que no existan sitios oficiales de monitoreo.') :
  info('Los valores de pH de este conjunto son estadísticas descriptivas por sitio de registros sin fecha. No permiten evaluar tendencias, cumplimiento normativo o calidad actual del agua.')+
  section('RED DE SITIOS · SINALOA','Registros disponibles por sitio',
    table(['Sitio','Clave','Registros','pH medio (sin fechas)'],q.map(x=>[x[2],x[1],x[3],f(x[5],2)]))+
    '<p class="wa-small-note">Se conservaron los 223 sitios del libro V9. El número de registros no equivale a número de campañas de muestreo fechadas.</p>'));
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
  const qualityButton=root.querySelector('[data-wa-view="calidad"]');if(qualityButton)qualityButton.hidden=st!=='Sinaloa';
  root.querySelectorAll('[data-wa-view]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.waView===view)));
  if(map){map.remove();map=null}
  const target=byId('wa-content');
  if(view==='resumen')target.innerHTML=renderOverview();
  if(view==='presas')target.innerHTML=renderDams();
  if(view==='acuiferos')target.innerHTML=renderAquifers();
  if(view==='series')target.innerHTML=renderHistory();
  if(view==='calidad')target.innerHTML=renderQuality();
  if(view==='fuentes')target.innerHTML=renderSources();
  byId('wa-export').hidden=view==='fuentes';
  if(view==='presas'&&window.L&&getDams().length){
   requestAnimationFrame(()=>{
    const container=byId('wa-map');if(!container||root.hidden)return;
    map=L.map(container,{scrollWheelZoom:false,zoomControl:true});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:17}).addTo(map);
    const pts=getDams().filter(x=>!query||normalize(x[2]+' '+x[3]+' '+x[1]).includes(normalize(query)));
    let bounds=[];
    for(const p of pts){if(!Number.isFinite(p[4])||!Number.isFinite(p[5]))continue;
     const marker=L.circleMarker([p[4],p[5]],{radius:6,color:'#0e6073',fillColor:'#2a94a0',weight:2,fillOpacity:.8}).addTo(map);
     marker.bindPopup('<strong>'+safe(p[2])+'</strong><br>'+safe(p[3])+'<br>Capacidad NAMO: '+f(p[6])+' hm³<br><small>Inventario; no nivel actual</small>');
     bounds.push([p[4],p[5]])}
    if(bounds.length)map.fitBounds(bounds,{padding:[26,26],maxZoom:10});else map.setView([24.8,-107.5],6);
   });
  }
 }
 function exportCsv(){
  let rows=[],headers=[],name='agua-'+view+'-'+st.toLowerCase().replace(/\W+/g,'-')+'.csv';
  if(view==='resumen'||view==='series'){headers=['estado','anio','volumen_riego_hm3','area_regada_ha','m3_por_ha'];rows=riego().map(x=>[st,x[1],x[2],x[3],x[4]])}
  if(view==='presas'){headers=['estado','clave_sih','presa','municipio','latitud','longitud','capacidad_namo_hm3'];rows=getDams()}
  if(view==='acuiferos'){headers=['estado','clave','acuifero','recarga_hm3_anio','veas_hm3_anio','disponibilidad_hm3_anio','saldo_negativo'];rows=getAquifers().map(x=>[x[0],x[1],x[2],x[3],x[4],x[5],x[6]])}
  if(view==='calidad'){headers=['estado','clave_sitio','nombre_sitio','filas','filas_con_fecha','ph_medio'];rows=D.calidad.filter(x=>belonging(x[0]))}
  if(!rows.length)return;
  const csv='\ufeff'+[headers,...rows].map(row=>row.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
  const a=document.createElement('a'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 root.addEventListener('click',e=>{
  const t=e.target.closest('[data-wa-view]');if(t){view=t.dataset.waView;query='';render();return}
  const m=e.target.closest('[data-wa-metric]');if(m){metric=m.dataset.waMetric;render();return}
  if(e.target.closest('#wa-export'))exportCsv();
 });
 root.addEventListener('change',e=>{if(e.target.id==='wa-state'){st=e.target.value;query='';dam='';if(view==='calidad'&&st!=='Sinaloa')view='resumen';render()}if(e.target.id==='wa-dam'){dam=e.target.value;render()}});
 root.addEventListener('input',e=>{if(e.target.id==='wa-search'){const pos=e.target.selectionStart;query=e.target.value;render();const box=byId('wa-search');if(box){box.focus();box.setSelectionRange(Math.min(pos,query.length),Math.min(pos,query.length))}}});
 const observer=new MutationObserver(()=>{if(!root.hidden){syncHeader();if(map)setTimeout(()=>map.invalidateSize(),60)}});
 observer.observe(root,{attributes:true,attributeFilter:['hidden']});
 async function init(){
  try{let response=await fetch('data/agua-v9.json',{cache:'no-cache'});if(!response.ok)throw Error('HTTP '+response.status);
   D=await response.json();if(D.presas.length!==75||D.acuiferos.length!==216)throw Error('La edición V9 no coincide con la estructura esperada');
   byId('wa-state').innerHTML=D.estados.map(x=>'<option value="'+safe(x)+'">'+safe(x)+'</option>').join('');
   render();
   if(location.hash==='#agua'&&typeof window.GrowaNavigate==='function')window.GrowaNavigate('agua');
  }catch(err){byId('wa-content').innerHTML=empty('No fue posible cargar los datos hídricos. Actualice la página o revise la conexión al repositorio.');console.error('GROWA Agua V9:',err)}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
 window.addEventListener('hashchange',()=>{if(location.hash==='#agua'&&window.GrowaNavigate)window.GrowaNavigate('agua')});
})();