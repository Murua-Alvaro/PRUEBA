'use strict';
(() => {
  const $ = (id) => document.getElementById(id);
  const formatter = new Intl.NumberFormat('es-MX', {minimumFractionDigits:0,maximumFractionDigits:1});
  const fmt2 = new Intl.NumberFormat('es-MX', {minimumFractionDigits:1,maximumFractionDigits:1});
  const chartFormatter = new Intl.NumberFormat('es-MX', {notation:'compact',maximumFractionDigits:1});
  let D = null;
  let state = {view:'estado', municipality:'Mazatlán', crop:'Maíz grano', territory:''};
  const titles = {
    estado:['Agricultura de Sinaloa','Estructura productiva, trayectorias agrícolas y diagnóstico económico territorial.'],
    municipios:['Perfil económico municipal','Producción, superficie, ciclos y especialización agrícola por municipio.'],
    cultivos:['Análisis de cultivos','Trayectorias, presencia territorial, variedades y características de producción.'],
    auditoria:['Fuente y calidad estadística','Integridad de los registros, continuidad y criterios de interpretación.']
  };
  const number = (v,digits=1) => v == null || !Number.isFinite(Number(v)) ? 'n/d' : (digits === 0 ? formatter.format(v) : fmt2.format(v));
  const millions = (v) => v == null || !Number.isFinite(v) ? 'n/d' : number(v);
  const pct = (v) => v == null || !Number.isFinite(v) ? 'n/d' : fmt2.format(v)+' %';
  const sign = (v) => v == null || !Number.isFinite(v) ? 'n/d' : (v>0?'+':'')+number(v);
  const change = (current,previous) => Number.isFinite(current) && Number.isFinite(previous) && previous!==0 ? (current/previous-1)*100 : null;
  const total = (rows,key) => rows.reduce((s,r)=>s+(Number(r[key])||0),0);
  const unique = (arr,key) => [...new Set(arr.map(x=>x[key]))];
  const source = (name) => D[name] || [];
  function mapTable(table){return table.rows.map(r=>Object.fromEntries(table.columns.map((k,i)=>[k,r[i]])));}
  function elem(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n;}
  function clear(node){node.replaceChildren();return node;}
  function empty(node,message){node=clear(node);node.append(elem('p','empty',message));}
  function putText(id,txt){$(id).textContent=txt;}
  function categoryKey(o){return String(o||'').localeCompare('','es');}
  function kpi(name,value,unit,description,klass='') {
    const card=elem('article','kpi'); const label=elem('div','name');label.append(elem('span','',name),elem('span','unit',unit||''));
    card.append(label,elem('strong','big '+klass,value),elem('span','explain',description||''));return card;
  }
  function setKpis(id,items){const box=clear($(id));items.forEach(x=>box.append(kpi(...x)));}
  function table(id,head,rows,{numericColumns=[]}={}){
    const box=clear($(id));if(!rows.length){empty(box,'No existen registros para esta selección.');return;}
    const tab=elem('table'),thead=elem('thead'),tr=elem('tr');
    head.forEach((h,i)=>{const th=elem('th',numericColumns.includes(i)?'numeric':'',h);tr.append(th);});thead.append(tr);tab.append(thead);
    const tbody=elem('tbody');rows.forEach(r=>{const tr=elem('tr');r.forEach((x,i)=>{const td=elem('td',numericColumns.includes(i)?'numeric':'',x);tr.append(td);});tbody.append(tr);});tab.append(tbody);box.append(tab);
  }
  function verticalBars(id,items,{format=millions,maxItems=10}={}) {
    const box=clear($(id));const arr=items.slice(0,maxItems);if(!arr.length){empty(box,'No hay datos para esta selección.');return;}
    const max=Math.max(1,...arr.map(x=>Math.max(x.value,0)));
    arr.forEach((x)=>{
      const row=elem('div','bar-row'), head=elem('div','bar-head'),name=elem('span','bar-name',x.name),value=elem('strong','',format(x.value));
      name.title=x.name;head.append(name,value);
      const track=elem('div','track'),fill=elem('div','fill');fill.style.width=(Math.max(0,x.value)/max*100).toFixed(2)+'%';
      track.append(fill);row.append(head,track);box.append(row);
    });
  }
  function svgNode(tag,attrs={}) {const o=document.createElementNS('http://www.w3.org/2000/svg',tag);for (const [k,v] of Object.entries(attrs))o.setAttribute(k,String(v));return o;}
  function trendChart(id,rawRecords,{field='value',title='Serie'}={}) {
    const box=clear($(id));const records=rawRecords.filter(x=>Number.isFinite(Number(x[field]))).sort((a,b)=>a.year-b.year);
    if(records.length<2){empty(box,'La serie no cuenta con observaciones suficientes.');return;}
    const w=760,h=300,m={left:65,right:21,top:20,bottom:42}, iw=w-m.left-m.right,ih=h-m.top-m.bottom;
    const minYear=Math.min(...records.map(x=>x.year)),maxYear=Math.max(...records.map(x=>x.year));
    const maxY=Math.max(1,...records.map(x=>Number(x[field])))*1.075;
    const X=(year)=>m.left+(year-minYear)/Math.max(1,maxYear-minYear)*iw;
    const Y=(v)=>m.top+ih-(v/maxY)*ih;
    const svg=svgNode('svg',{viewBox:`0 0 ${w} ${h}`,role:'img','aria-label':title,'preserveAspectRatio':'xMidYMid meet'});
    for(let t=0;t<=4;t++){
      const v=maxY*t/4, y=Y(v);
      svg.append(svgNode('line',{x1:m.left,y1:y,x2:w-m.right,y2:y,class:'grid'}));
      const label=svgNode('text',{x:m.left-10,y:y+4,'text-anchor':'end',class:'tick'});label.textContent=chartFormatter.format(v);svg.append(label);
    }
    const ticks=[minYear,minYear+5,minYear+10,minYear+15,maxYear].filter((y,i,a)=>y<=maxYear&&a.indexOf(y)===i);
    ticks.forEach(year=>{const x=X(year);const t=svgNode('text',{x,y:h-12,'text-anchor':'middle',class:'tick'});t.textContent=String(year);svg.append(t);});
    const pairs=records.map(r=>[X(r.year),Y(r[field])]);
    const d=pairs.map(([x,y],i)=>(i?'L':'M')+x.toFixed(2)+' '+y.toFixed(2)).join(' ');
    const baseline=Y(0);const area=svgNode('path',{d:d+` L ${pairs.at(-1)[0]} ${baseline} L ${pairs[0][0]} ${baseline} Z`,class:'area-fill'});svg.append(area);
    svg.append(svgNode('path',{d,class:'series'}));
    records.forEach((r,i)=>{const [x,y]=pairs[i];const dot=svgNode('circle',{cx:x,cy:y,r:2.5,class:'point'});const titleNode=svgNode('title');titleNode.textContent=`${r.year}: ${millions(Number(r[field]))} M$`;dot.append(titleNode);svg.append(dot);});
    box.append(svg);
  }
  function simpleSummary(rows,key) {
    const sums = new Map(); rows.forEach(r=>{const name=String(r[key]||'No clasificado');sums.set(name,(sums.get(name)||0)+(Number(r.Valorproduccion)||0)/1000);});
    return [...sums].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
  }
  function makeStructure(id,groups) {
    const box=clear($(id));let visible=false;
    groups.forEach(({name,rows})=>{
      const totalVal=rows.reduce((s,x)=>s+x.value,0);
      if(!totalVal)return;visible=true;
      const block=elem('div','structure-group');block.append(elem('strong','',name));
      const seg=elem('div','segment-line'),legend=elem('div','segment-legend');
      rows.sort((a,b)=>b.value-a.value).forEach(x=>{const p=x.value/totalVal*100;if(p<=0)return;
        const span=elem('span');span.style.width=p.toFixed(4)+'%';span.title=`${x.name}: ${pct(p)}`;seg.append(span);
        const label=elem('span');label.append(document.createTextNode(x.name+' '),elem('b','',pct(p)));legend.append(label);
      });block.append(seg,legend);box.append(block);
    });
    if(!visible)empty(box,'No hay desagregaciones registradas para esta selección.');
  }
  function setAnalysis(id,heading,body){const box=clear($(id));box.append(elem('span','analytical-caption',heading),document.createTextNode(body));}
  function stateView(){
    const annual=source('state').sort((a,b)=>a.Anio-b.Anio),current=annual.find(x=>x.Anio===2025),prior=annual.find(x=>x.Anio===2024);
    const val=current.value/1000,previous=prior.value/1000;
    setKpis('state-kpis',[
      ['Valor de producción',millions(val)+' M$','2025','Variación '+pct(change(val,previous))+' frente a 2024',change(val,previous)<0?'negative':'positive'],
      ['Superficie sembrada',number(current.area,0)+' ha','2025','Suma de cultivos y ciclos'],
      ['Superficie cosechada',number(current.harvest,0)+' ha','2025','Superficie reportada, no suelo único'],
      ['Cultivos registrados',number(current.crops,0),'2025','18 claves municipales en el cierre']
    ]);
    trendChart('state-trend',annual.map(x=>({year:x.Anio,value:x.value/1000})),{title:'Valor agrícola nominal estatal 2003 a 2025'});
    const crop=simpleSummary(source('records2025'),'Nomcultivo');
    verticalBars('state-crops',crop,{format:x=>millions(x)+' M$',maxItems:10});
    const muni=source('municipal2025').slice().sort((a,b)=>b.value-a.value);
    const rank=clear($('state-municipal'));
    muni.forEach((m,i)=>{
      const row=elem('button','rank-item');row.type='button';row.setAttribute('aria-label','Ver perfil de '+m.Nommunicipio);
      row.append(elem('span','rank-num',String(i+1).padStart(2,'0')),elem('span','rank-name',m.Nommunicipio),elem('span','rank-val',millions(m.value/1000)+' M$'),elem('span','rank-arrow','↗'));
      row.addEventListener('click',()=>{state.municipality=m.Nommunicipio;switchView('municipios');});rank.append(row);
    });
  }
  function currentMuni(){return state.municipality;}
  function municipalView(){
    const name=currentMuni();$('municipality-select').value=name;
    const annual=source('municipal').filter(x=>x.Nommunicipio===name).sort((a,b)=>a.Anio-b.Anio);
    const now=annual.find(x=>x.Anio===2025),before=annual.find(x=>x.Anio===2024);
    const meta=source('municipal2025').find(x=>x.Nommunicipio===name);
    if(!now||!before){empty($('municipal-kpis'),'No hay cierre para el municipio.');return;}
    const val=now.Valorproduccion/1000,old=before.Valorproduccion/1000;
    setKpis('municipal-kpis',[
      ['Valor agrícola',millions(val)+' M$','2025','Participación estatal '+pct(val/(source('state').find(x=>x.Anio===2025).value/1000)*100)],
      ['Cambio 2024–2025',pct(change(val,old)),'NOMINAL','Diferencia '+sign(val-old)+' M$',change(val,old)<0?'negative':'positive'],
      ['Superficie cosechada',number(now.Cosechada,0)+' ha','2025','Suma de cultivos y ciclos'],
      ['Cultivos reportados',String(meta?.crops??'n/d'),'2025',String(meta?.rows??'n/d')+' renglones del cierre']
    ]);
    putText('municipal-chart-name',name.toUpperCase());
    trendChart('municipal-trend',annual.map(x=>({year:x.Anio,value:x.Valorproduccion/1000})),{title:'Valor agrícola nominal anual de '+name});
    const records=source('records2025').filter(x=>x.Nommunicipio===name);
    const byCrop=simpleSummary(records,'Nomcultivo');
    verticalBars('municipal-crops',byCrop,{format:x=>millions(x)+' M$',maxItems:8});
    const past=source('crops').filter(x=>x.Nommunicipio===name&&x.Anio===2024);
    const pastMap=new Map();past.forEach(x=>pastMap.set(x.Nomcultivo,(pastMap.get(x.Nomcultivo)||0)+x.Valorproduccion/1000));
    const movements=byCrop.map(x=>({name:x.name,value:x.value,old:pastMap.get(x.name),delta:pastMap.has(x.name)?x.value-pastMap.get(x.name):null}));
    const valid=movements.filter(x=>x.delta!==null);
    const biggest=[...valid].sort((a,b)=>b.delta-a.delta).slice(0,5),weakest=[...valid].sort((a,b)=>a.delta-b.delta).slice(0,5);
    const combined=[...new Map([...biggest,...weakest].map(x=>[x.name,x])).values()].sort((a,b)=>b.delta-a.delta);
    table('municipal-changes',['Cultivo','2024 M$','2025 M$','Δ M$'],combined.map(x=>[x.name,millions(x.old),millions(x.value),sign(x.delta)]),{numericColumns:[1,2,3]});
    const dataGroups=[['Agua','Nommodalidad'],['Ciclo productivo','Nomcicloproductivo'],['Tecnología','TipoTecnologia']].map(([label,key])=>({name:label,rows:simpleSummary(records,key)}));
    makeStructure('municipal-structure',dataGroups);
    const best=[...valid].sort((a,b)=>b.delta-a.delta)[0],worst=[...valid].sort((a,b)=>a.delta-b.delta)[0];
    const text=`En ${name}, el valor agrícola declarado para 2025 fue de ${millions(val)} millones de pesos nominales, ${pct(change(val,old))} respecto de 2024. ${byCrop[0]?.name||'El principal cultivo'} encabeza el valor bruto municipal (${millions(byCrop[0]?.value)} M$). ${best?`Entre los cultivos comparables en ambos cierres, ${best.name} registró una de las mayores aportaciones positivas (${sign(best.delta)} M$).`:''} ${worst?`${worst.name} registró una de las mayores contracciones (${sign(worst.delta)} M$).`:''} Los movimientos monetarios pueden responder a cantidades, superficie, composición de cultivos y precios; no son una medida de utilidad ni prueban causas climáticas.`;
    setAnalysis('municipal-analysis','LECTURA ECONÓMICO-TERRITORIAL',text);
  }
  function cropView(){
    const crop=state.crop,place=state.territory;$('crop-select').value=crop;$('crop-territory').value=place;
    const series=source('crops').filter(x=>x.Nomcultivo===crop && (!place||x.Nommunicipio===place));
    const byYear=new Map();series.forEach(x=>byYear.set(x.Anio,(byYear.get(x.Anio)||0)+x.Valorproduccion/1000));
    const trend=[...byYear].map(([year,value])=>({year:Number(year),value})).sort((a,b)=>a.year-b.year);
    const current=source('records2025').filter(x=>x.Nomcultivo===crop&&(!place||x.Nommunicipio===place));
    const currentVal=total(current,'Valorproduccion')/1000;
    const currentArea=total(current,'Cosechada');
    const old=byYear.get(2024);
    const units=unique(current,'Nomunidad').filter(Boolean);
    const volume=units.length===1?total(current,'Volumenproduccion'):null;
    const price=units.length===1&&volume>0?total(current,'Valorproduccion')*1000/volume:null;
    setKpis('crop-kpis',[
      ['Valor bruto 2025',current.length?millions(currentVal)+' M$':'Sin registro','NOMINAL',place||'Total estatal'],
      ['Variación nominal',current.length?pct(change(currentVal,old)): 'n/d','2024–2025',old===undefined?'Sin observación comparable en 2024':'Respecto al cierre anterior',change(currentVal,old)<0?'negative':'positive'],
      ['Superficie cosechada',current.length?number(currentArea,0)+' ha':'n/d','2025','Superficie declarada'],
      ['Precio rural implícito',price!==null?'$'+number(price,0):'n/d',units.length===1?units[0]:'UNIDADES MIXTAS','Valor dividido entre volumen compatible']
    ]);
    putText('crop-chart-name',(place||'SINALOA').toUpperCase());
    trendChart('crop-trend',trend,{title:'Serie histórica del cultivo '+crop+' en '+(place||'Sinaloa')});
    const statewide=source('records2025').filter(x=>x.Nomcultivo===crop);
    verticalBars('crop-geography',simpleSummary(statewide,'Nommunicipio'),{format:x=>millions(x)+' M$',maxItems:10});
    const variety=simpleSummary(current,'Nomvariedad');
    table('crop-varieties',['Variedad','Valor (M$)','%'],variety.map(x=>[x.name,millions(x.value),currentVal?pct(x.value/currentVal*100):'n/d']),{numericColumns:[1,2]});
    makeStructure('crop-water',[{name:'Modalidad de agua',rows:simpleSummary(current,'Nommodalidad')}]);
    const max=trend.length?trend.reduce((a,b)=>a.value>b.value?a:b):null;
    const note=series.length?`La serie de ${crop.toLowerCase()} reúne registros desde ${trend[0]?.year} hasta ${trend.at(-1)?.year} en ${place||'el conjunto estatal'}. ${max?`El mayor valor nominal registrado corresponde a ${max.year} (${millions(max.value)} M$).`:''} ${current.length?`En 2025, el valor reportado es ${millions(currentVal)} M$, con ${number(currentArea,0)} hectáreas cosechadas. ${variety[0]?`La variedad con mayor aportación en este cierre fue ${variety[0].name}.`:''}`:'El cultivo no figura en los registros de 2025 para el territorio seleccionado; su ausencia no constituye prueba de producción nula.'} La serie es nominal y los rendimientos físicos solo son comparables con unidades homogéneas.`:'No existen registros para esta combinación de cultivo y municipio en el anexo histórico.';
    setAnalysis('crop-analysis','INTERPRETACIÓN DEL CULTIVO',note);
  }
  function auditView(){
    const a=D.audit;
    const checks=[['Observaciones auditadas',number(a.filas,0),'Serie estatal 2003–2025'],['Variables originales',String(a.variables),'Estructura del archivo fuente'],['Valores faltantes',String(a.nulos),'Control de completitud'],['Duplicados exactos',String(a.duplicados_exactos),'Control de filas'],['Duplicados de clave',String(a.duplicados_clave),'Clave dimensional reportada'],['Cosechada > sembrada',String(a.cosechada_supera_sembrada),'Control de superficie'],['Diferencias valor > 1 %',String(a.valor_desviacion_superior_1pct),'Revisión aritmética'],['Unidades distintas de tonelada',String(a.no_toneladas),'Observaciones que requieren revisión']];
    const box=clear($('audit-tests'));
    checks.forEach(([name,num,desc])=>{const card=elem('article','audit-card');card.append(elem('span','',name),elem('strong','',num),elem('small','',desc));box.append(card);});
    const years=source('state').sort((a,b)=>a.Anio-b.Anio);
    table('audit-series',['Año','Registros','Cultivos','Siniestrada (ha)'],years.map(x=>[x.Anio,number(x.rows,0),number(x.crops,0),number(x.loss)]),{numericColumns:[1,2,3]});
    putText('checksum','SHA-256 registrado para la extracción de Sinaloa en la auditoría adjunta: '+a.sha256_sinaloa+'. El valor corresponde a los archivos auditados originales, no al JSON servido por esta plataforma.');
  }
  function chooseOptions(id,values,selected){const select=$(id);clear(select);values.forEach(v=>{const o=elem('option','',v);o.value=v;select.append(o);});if(selected&&values.includes(selected))select.value=selected;}
  function initializeMenus(){
    const municipalities=source('municipal2025').map(x=>x.Nommunicipio).sort((a,b)=>a.localeCompare(b,'es'));
    const crops=unique(source('crops'),'Nomcultivo').sort((a,b)=>a.localeCompare(b,'es'));
    chooseOptions('municipality-select',municipalities,state.municipality);
    chooseOptions('crop-select',crops,state.crop);
    chooseOptions('crop-territory',['Sinaloa (total estatal)',...municipalities],state.territory||'Sinaloa (total estatal)');
    const scope=$('crop-territory');[...scope.options].forEach(o=>{if(o.textContent==='Sinaloa (total estatal)')o.value='';});scope.value=state.territory;
    $('municipality-select').addEventListener('change',(e)=>{state.municipality=e.target.value;municipalView();});
    $('crop-select').addEventListener('change',(e)=>{state.crop=e.target.value;cropView();});
    $('crop-territory').addEventListener('change',(e)=>{state.territory=e.target.value;cropView();});
    $('export-municipality').addEventListener('click',()=>{const rows=source('municipal').filter(x=>x.Nommunicipio===state.municipality).sort((a,b)=>a.Anio-b.Anio);downloadCSV('municipio_'+slug(state.municipality)+'_2003_2025.csv',rows);});
    $('export-crop').addEventListener('click',()=>{const rows=source('crops').filter(x=>x.Nomcultivo===state.crop&&(!state.territory||x.Nommunicipio===state.territory));downloadCSV('cultivo_'+slug(state.crop)+'_'+slug(state.territory||'sinaloa')+'.csv',rows);});
    $('export-audit').addEventListener('click',()=>downloadCSV('sinaloa_serie_estatal_2003_2025.csv',source('state')));
    document.querySelectorAll('.nav-item').forEach(button=>button.addEventListener('click',()=>switchView(button.dataset.view)));
    window.addEventListener('hashchange',()=>{const h=location.hash.substring(1);if(titles[h]&&h!==state.view)switchView(h,false);});
  }
  function slug(s){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
  function downloadCSV(filename,rows){if(!rows.length)return;const keys=Object.keys(rows[0]);
    const protect=(x)=>{let v=String(x==null?'':x);if(/^[=+@\-]/.test(v)&&!/^-?\d+(\.\d+)?$/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"';};
    const text='\uFEFF'+[keys.join(','),...rows.map(x=>keys.map(k=>protect(x[k])).join(','))].join('\r\n');
    const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function switchView(next,history=true){if(!D)return;state.view=next;
    for(const name of Object.keys(titles)){$('view-'+name).hidden=name!==next;}
    document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view===next));
    putText('page-title',titles[next][0]);putText('page-description',titles[next][1]);
    if(history)window.history.replaceState(null,'','#'+next);
    if(next==='estado')stateView();if(next==='municipios')municipalView();if(next==='cultivos')cropView();if(next==='auditoria')auditView();
    window.scrollTo({top:0,behavior:'instant'});
  }
  async function loadPayload(){
    const response=await fetch('./data/analysis-pack.b64',{cache:'no-cache'});
    if(!response.ok)throw new Error('No se encontró el archivo de datos: HTTP '+response.status);
    const encoded=(await response.text()).replace(/\s+/g,'');
    if(!encoded.startsWith('H4sI'))throw new Error('El archivo de datos no es un paquete GZIP en Base64.');
    if(typeof DecompressionStream==='undefined')throw new Error('Este navegador no admite la descompresión GZIP integrada; usa Chrome, Edge, Firefox o Safari recientes.');
    const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const txt=await new Response(stream).text();
    const parsed=JSON.parse(txt);
    const required=['state','municipal','municipal2025','crops','records2025'];
    if(required.some(k=>!parsed[k]?.rows?.length))throw new Error('El paquete carece de una o varias tablas requeridas.');
    const obj={metadata:parsed.metadata,audit:parsed.audit};for(const key of required)obj[key]=mapTable(parsed[key]);
    if(obj.state.length!==23||obj.municipal.length!==414||obj.crops.length!==8217||obj.records2025.length!==637)throw new Error('Los conteos de la base no coinciden con los anexos auditados.');
    // Comprobación interna: la suma de registros originales del año debe concordar con la serie estatal.
    const total2025=total(obj.records2025,'Valorproduccion'),original2025=obj.state.find(x=>x.Anio===2025).value;
    if(Math.abs(total2025-original2025)>0.03)throw new Error('La conciliación del valor agrícola de 2025 falló.');
    return obj;
  }
  async function init(){
    try{D=await loadPayload();$('load-indicator').textContent='Datos incorporados · DGSIAP';document.querySelector('.status-dot').classList.add('ready');initializeMenus();const hash=location.hash.slice(1);switchView(titles[hash]?hash:'estado');}
    catch(error){console.error('Error al leer anexos de Sinaloa:',error);$('load-indicator').textContent='Error de carga';
      const alert=$('alert');alert.hidden=false;alert.textContent='No fue posible leer la base agrícola: '+error.message+' Comprueba que la carpeta data y el archivo analysis-pack.b64 se hayan publicado junto con index.html. La página necesita abrirse desde un servidor web, no directamente como archivo local.';
      document.querySelectorAll('.view').forEach(n=>n.hidden=true);
    }
  }
  init();
})();
