/* GROWA / NASA POWER daily point integration.
   Official API: https://power.larc.nasa.gov/api/temporal/daily/point
   Every number displayed here comes from a fetched POWER response. No placeholders.
   Spatial scale: grid-based POWER reanalysis, queried at municipal reference coordinates
   or at the selected point of an uploaded polygon. Not parcel observations.
*/
(function(){
"use strict";
const $=id=>document.getElementById(id);
const LOC={
 "Ahome":[25.793,-108.998],"El Fuerte":[26.419,-108.619],"Choix":[26.710,-108.324],
 "Guasave":[25.567,-108.469],"Sinaloa":[25.822,-108.222],"Angostura":[25.365,-108.161],
 "Salvador Alvarado":[25.458,-108.091],"Mocorito":[25.482,-107.921],"Badiraguato":[25.364,-107.552],
 "Culiacán":[24.804,-107.394],"Navolato":[24.766,-107.698],"Cosalá":[24.414,-106.692],
 "Elota":[23.952,-106.710],"San Ignacio":[23.944,-106.425],"Mazatlán":[23.247,-106.411],
 "Concordia":[23.288,-106.067],"Rosario":[22.992,-105.855],"Escuinapa":[22.830,-105.773]
};
// Fallback municipal climate slice, annual 2025, extracted from the user's
// audited NASA POWER 10-state package. Values represent grid cells, not fields.
// Columns: city, representative latitude, longitude, NASA grid ID,
// annual mean T (°C), precipitation (mm), RH (%), ET0 (mm), VPD (kPa),
// shortwave radiation (MJ/m²/day), P-ET0 (mm), root-zone wetness (0–1),
// days above 35°C, wind at 2m (m/s).
const AUDIT_2025=[
["Ahome",25.94,-109.16,"N26.000_W109.375",25.29,460.45,66.98,1885.44,1.26,21.52,-1424.99,0.49,7,2.87],
["Angostura",25.15,-108.14,"N25.000_W108.125",25.81,564.48,64.41,1937.83,1.49,21.3,-1373.35,0.48,22,2.41],
["Badiraguato",25.59,-107.4,"N25.500_W107.500",24.27,679.44,48.3,1725.68,2.02,21.17,-1046.24,0.59,62,1.21],
["Choix",26.68,-108.28,"N26.500_W108.125",23.24,668.84,46.67,1745.77,1.98,21.22,-1076.93,0.48,55,1.28],
["Concordia",23.41,-105.99,"N23.500_W106.250",25.18,839.25,59.86,1732.6,1.66,21.22,-893.35,0.56,34,1.39],
["Cosalá",24.48,-106.8,"N24.500_W106.875",25.27,708.7,52.58,1891.09,2.03,20.93,-1182.39,0.58,83,1.59],
["Culiacán",24.68,-107.25,"N24.500_W107.500",25.82,739.44,65.01,1876.74,1.49,21.04,-1137.3,0.45,36,2.15],
["El Fuerte",26.26,-108.68,"N26.500_W108.750",26,630.78,48.58,2046.58,2.26,21.22,-1415.8,0.48,128,1.78],
["Elota",24.04,-106.84,"N24.000_W106.875",25.69,698.74,62.32,1851.79,1.57,20.93,-1153.05,0.5,31,1.97],
["Escuinapa",22.72,-105.69,"N22.500_W105.625",26.19,1367.12,66.38,1796.22,1.34,21.31,-429.1,0.57,0,2.02],
["Guasave",25.52,-108.55,"N25.500_W108.750",25.82,494.71,62.47,1991.68,1.57,21.3,-1496.97,0.51,33,2.53],
["Mazatlán",23.47,-106.31,"N23.500_W106.250",25.18,839.25,59.86,1732.6,1.66,21.22,-893.35,0.56,34,1.39],
["Mocorito",25.36,-107.78,"N25.500_W107.500",24.27,679.44,48.3,1725.68,2.02,21.17,-1046.24,0.59,62,1.21],
["Navolato",24.72,-107.76,"N24.500_W107.500",25.82,739.44,65.01,1876.74,1.49,21.04,-1137.3,0.45,36,2.15],
["Rosario",23.06,-105.81,"N23.000_W105.625",24.17,1168.01,61,1542.79,1.53,20.94,-374.78,0.6,15,0.97],
["Salvador Alvarado",25.42,-108.08,"N25.500_W108.125",26.49,612.01,51.7,2041.79,2.16,21.3,-1429.78,0.47,117,1.84],
["San Ignacio",23.95,-106.37,"N24.000_W106.250",22.86,801.32,53.27,1548.63,1.74,20.93,-747.31,0.66,33,0.92],
["Sinaloa",25.97,-108.11,"N26.000_W108.125",25.1,651.61,47.06,1972.98,2.17,21.22,-1321.37,0.5,87,1.68]
];
const AUDIT_FIELDS=["TMEAN","PRECIP_MM","RH_MEAN","ET0_MM","VPD_MEAN","SW_RAD_MEAN","WATER_BALANCE_MM","GWETROOT_MEAN","HOT_DAYS_35","WIND2M"];
const municipal2025=new Map(AUDIT_2025.map(row=>{
 const data={};
 for(let i=0;i<AUDIT_FIELDS.length;i++)data[AUDIT_FIELDS[i]]=row[4+i];
 return [row[0],{name:row[0],latitude:row[1],longitude:row[2],grid:row[3],values:data}];
}));
const MAP_VARIABLES={
 "PRECIP_MM":{label:"Precipitación anual",unit:"mm"},
 "TMEAN":{label:"Temperatura media",unit:"°C"},
 "ET0_MM":{label:"Evapotranspiración ref.",unit:"mm"},
 "VPD_MEAN":{label:"Déficit presión vapor",unit:"kPa"},
 "RH_MEAN":{label:"Humedad relativa",unit:"%"},
 "WATER_BALANCE_MM":{label:"Balance P − ET0",unit:"mm"}
};
let mapVariable="PRECIP_MM";
function mapValue(year,name){
 if(Number(year)===2025){const entry=municipal2025.get(name);return entry?entry.values[mapVariable]:null}
 if(Number(year)===context.year&&name===context.city&&currentData&&!currentData.compiled&&status==="success"){
  const dict={PRECIP_MM:"PRECTOTCORR",TMEAN:"T2M",RH_MEAN:"RH2M"};
  const k=dict[mapVariable];return k&&Number.isFinite(currentData.yearly[k])?currentData.yearly[k]:null;
 }
 return null;
}
function mapUnit(){return MAP_VARIABLES[mapVariable].unit}
function mapLabel(){return MAP_VARIABLES[mapVariable].label}
function compiled2025(point,year){
 if(year!==2025||!point||point.type==="parcela"||(point.type==="referencia"&&!point.grid))return null;
 const r=municipal2025.get(point.label);
 if(!r)return null;
 const v=r.values;
 return {year:2025,source:"NASA POWER · paquete procesado auditado",compiled:true,monthly:null,
  availableDays:null,days:null,coverage:{},
  yearly:{T2M:v.TMEAN,PRECTOTCORR:v.PRECIP_MM,RH2M:v.RH_MEAN,WS2M:v.WIND2M,ALLSKY_SFC_SW_DWN:v.SW_RAD_MEAN,
   T2M_MIN:null,T2M_MAX:null,ET0_MM:v.ET0_MM,VPD_MEAN:v.VPD_MEAN,GWETROOT_MEAN:v.GWETROOT_MEAN,
   WATER_BALANCE_MM:v.WATER_BALANCE_MM},
  grid:r.grid};
}
const PARAMS=["T2M","T2M_MAX","T2M_MIN","PRECTOTCORR","RH2M","WS2M","ALLSKY_SFC_SW_DWN"];
const MONTHS=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const fmt1=new Intl.NumberFormat("es-MX",{maximumFractionDigits:1});
const fmt0=new Intl.NumberFormat("es-MX",{maximumFractionDigits:0});
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=v=>v===null||!Number.isFinite(v)?"—":fmt1.format(v);
const fmtInt=v=>v===null||!Number.isFinite(v)?"—":fmt0.format(v);
const valid=(v,key)=>{
 const n=Number(v);
 if(v===null||v===undefined||!Number.isFinite(n)||n<=-900)return null;
 if(["PRECTOTCORR","WS2M","ALLSKY_SFC_SW_DWN"].includes(key)&&n<0)return null;
 if(key==="RH2M"&&(n<0||n>100))return null;
 return n;
};
const avg=values=>values.length?values.reduce((a,b)=>a+b,0)/values.length:null;
const sum=values=>values.reduce((a,b)=>a+b,0);
const cell=(key,text)=>{const el=$(key);if(el)el.textContent=String(text)};
const expectedYearDays=y=>(new Date(Date.UTC(y+1,0,1))-new Date(Date.UTC(y,0,1)))/86400000;
const expectedMonthDays=(y,m)=>new Date(Date.UTC(y,m+1,0)).getUTCDate();
let context={city:"",year:2025,selectedParcel:null,point:null,label:"",mode:"municipal"};
let status="idle",currentData=null,sequence=0,controller=null,debounce=null;
let leafletMap=null,leafletMarker=null,maplibreMap=null,maplibreLoaded=false;
const cache=new Map();

function pointForCity(city){
 const audit=municipal2025.get(city);
 if(audit)return {latitude:audit.latitude,longitude:audit.longitude,label:city,type:"referencia",grid:audit.grid};
 const p=LOC[city];
 return p?{latitude:p[0],longitude:p[1],label:city,type:"referencia"}:null;
}
function dataKey(point,year){return year+"|"+point.latitude.toFixed(3)+"|"+point.longitude.toFixed(3)}
function buildUrl(point,year){
 const query=new URLSearchParams({
  parameters:PARAMS.join(","),community:"AG",
  longitude:String(point.longitude),latitude:String(point.latitude),
  start:String(year)+"0101",end:String(year)+"1231",
  format:"JSON","time-standard":"LST"
 });
 return "https://power.larc.nasa.gov/api/temporal/daily/point?"+query.toString();
}
function parseResponse(raw,year){
 const source=raw&&raw.properties&&raw.properties.parameter;
 if(!source||typeof source!=="object")throw Error("La API no devolvió el objeto meteorológico esperado.");
 const days=Object.keys(source.T2M||source.PRECTOTCORR||{}).filter(k=>/^\d{8}$/.test(k)&&k.slice(0,4)===String(year)).sort();
 if(!days.length)throw Error("La consulta no contiene registros diarios para "+year+".");
 const records=days.map(key=>{
  const row={day:key,month:Number(key.slice(4,6))-1};
  for(const p of PARAMS)row[p]=valid(source[p]&&source[p][key],p);
  return row;
 });
 const coverage={},yearly={};
 for(const p of PARAMS){
  const vals=records.map(r=>r[p]).filter(v=>v!==null);
  coverage[p]=vals.length;
  yearly[p]=vals.length>=Math.ceil(expectedYearDays(year)*.9)?(p==="PRECTOTCORR"?sum(vals):avg(vals)):null;
 }
 const monthly=Array.from({length:12},(_,month)=>{
  const a=records.filter(r=>r.month===month),row={month};
  for(const p of PARAMS){
   const vals=a.map(r=>r[p]).filter(v=>v!==null);
   row[p]=vals.length>=Math.ceil(expectedMonthDays(year,month)*.8)?(p==="PRECTOTCORR"?sum(vals):avg(vals)):null;
   row[p+"_N"]=vals.length;
  }
  return row;
 });
 const n=Math.max(...Object.values(coverage),0);
 if(n<15)throw Error("Cobertura climática insuficiente para mostrar los indicadores.");
 return {year,monthly,yearly,coverage,availableDays:n,days:records.length,source:"NASA POWER",parameters:PARAMS};
}
function statusView(label){
 const box=$("eo-climate-hud");if(box)box.dataset.status=status;
 const statusLabel=status==="loading"?"CONSULTANDO":status==="success"?(currentData?.compiled?"AUDITADO 2025":"NASA POWER") : status==="error"?"SIN CONEXIÓN":"SIN CONSULTA";
 cell("eoc-status",statusLabel);
 cell("eoc-location",label||"Selecciona municipio");
 cell("eoc-year",context.year);
 const p=context.point;
 cell("eoc-coordinate",p?(p.latitude.toFixed(3)+"°N · "+Math.abs(p.longitude).toFixed(3)+"°O · "+(p.type==="parcela"?"punto de polígono":"punto de referencia NASA")):"Punto geográfico sin seleccionar");
 cell("eo-climate-place",label||"Punto de referencia");
 cell("eo-climate-date",context.year+" · "+(p&&p.type==="parcela"?"punto de polígono":"punto municipal de referencia"));
 cell("eo-climate-coverage",status==="success"&&currentData?(currentData.compiled?"Corte anual compilado":currentData.availableDays+"/"+expectedYearDays(context.year)+" días"):"—");
 cell("eo-climate-provider",currentData?.compiled?"NASA POWER · paquete auditado 2003–2025":"NASA POWER · API diaria · LST");
 const use=status==="success"&&currentData?currentData.yearly:null;
 cell("eoc-temp",fmt(use&&use.T2M));cell("eoc-rain",fmtInt(use&&use.PRECTOTCORR));
 cell("eoc-humidity",fmt(use&&use.RH2M));cell("eoc-radiation",fmt(use&&use.ALLSKY_SFC_SW_DWN));
 cell("eo-climate-tmin",fmt(use&&use.T2M_MIN));cell("eo-climate-tmax",fmt(use&&use.T2M_MAX));
 cell("eo-climate-wind",fmt(use&&use.WS2M));cell("eo-climate-rh",fmt(use&&use.RH2M));
 cell("eo-climate-et0",fmt(use&&use.ET0_MM));cell("eo-climate-vpd",fmt(use&&use.VPD_MEAN));
 cell("eo-climate-precip",fmtInt(use&&use.PRECTOTCORR));
 cell("eo-climate-temp",fmt(use&&use.T2M));
 let note="";
 if(status==="loading")note="Descargando observaciones diarias de NASA POWER…";
 if(status==="error")note="No fue posible consultar NASA POWER. Sin datos locales alternativos verificados.";
 if(status==="idle")note="Elige un municipio o selecciona un punto dentro de una parcela importada.";
 if(status==="success")note=currentData?.compiled?"Clima compilado de NASA POWER 2025, sin cotejo independiente contra la API; celda de rejilla, no parcela. «Detalle diario» consulta NASA.":"Punto de consulta NASA POWER. Datos de rejilla; no equivalen a una estación o parcela.";
 cell("eoc-note",note);
 cell("eo-climate-panel-note",note);
 const retry=$("eoc-retry");if(retry){retry.hidden=!(status==="error"||status==="idle"||currentData?.compiled);retry.textContent=currentData?.compiled?"Detalle diario":"Reintentar"}
 renderMini();
 updateMarker();
 if(document.querySelector('[data-eo-chart="climate"].active'))renderChart();
}
function renderMini(){
 const host=$("eo-climate-mini");if(!host)return;
 const months=currentData&&status==="success"&&Array.isArray(currentData.monthly)?currentData.monthly:null;
 if(!months){host.innerHTML='<div style="padding:12px 0;color:#93ac99;font:500 9px DM Sans,sans-serif">Serie mensual pendiente</div>';return}
 const rainfall=months.map(m=>m.PRECTOTCORR),max=Math.max(1,...rainfall.filter(v=>v!==null));
 const bars=months.map((m,i)=>{const v=m.PRECTOTCORR,h=v===null?0:v/max*40;return '<rect x="'+(i*21+4)+'" y="'+(46-h).toFixed(1)+'" width="11" height="'+h.toFixed(1)+'" rx="1" fill="#67b982"/>';}).join("");
 host.innerHTML='<svg viewBox="0 0 255 53" preserveAspectRatio="none" aria-label="Precipitación mensual de enero a diciembre">'
 +'<line x1="0" x2="255" y1="46" y2="46" stroke="#d8e8db"/>'
 +bars+'<text x="3" y="53" font-size="8" fill="#9caf9f">ENE</text><text x="251" y="53" font-size="8" fill="#9caf9f" text-anchor="end">DIC</text></svg>';
}
function htmlMarker(){
 return '<div class="eo-climate-point-marker"><span class="eoc-core"></span><span class="eoc-marker-label">'+esc(context.label||"NASA POWER")+'</span></div>';
}
function updateMarker(){
 const p=context.point;
 if(leafletMap&&window.L){
  if(leafletMarker){leafletMap.removeLayer(leafletMarker);leafletMarker=null}
  if(p){
   leafletMarker=window.L.marker([p.latitude,p.longitude],{
    icon:window.L.divIcon({className:"",html:htmlMarker(),iconSize:[22,22],iconAnchor:[8,8]}),
    zIndexOffset:800,keyboard:true,title:"Punto climático NASA POWER"
   }).addTo(leafletMap);
   leafletMarker.bindPopup('<strong>'+esc(context.label)+'</strong><br>NASA POWER · '+context.year+'<br>'+esc(status==="success"?"T media "+fmt(currentData.yearly.T2M)+" °C · precip. "+fmtInt(currentData.yearly.PRECTOTCORR)+" mm":status==="loading"?"Consultando datos":status==="error"?"Sin conexión":"Sin datos"),{maxWidth:260});
  }
 }
 if(maplibreMap&&maplibreLoaded){
  const fc={type:"FeatureCollection",features:p?[{type:"Feature",geometry:{type:"Point",coordinates:[p.longitude,p.latitude]},properties:{label:context.label||"NASA POWER"}}]:[]};
  const src=maplibreMap.getSource("eo-climate-point");if(src)src.setData(fc);
 }
}
function dataReady(value){
 status="success";currentData=value;
 statusView(context.label);
}
function request(point,year,force){
 if(!point){if(controller)controller.abort();if(debounce)clearTimeout(debounce);currentData=null;status="idle";statusView("");return}
 const key=dataKey(point,year);
 if(!force&&cache.has(key)){dataReady(cache.get(key));return}
 const fallback=!force?compiled2025(point,year):null;
 if(fallback){dataReady(fallback);return}
 status="loading";currentData=null;statusView(context.label);
 if(debounce)clearTimeout(debounce);
 if(controller)controller.abort();
 const token=++sequence;
 debounce=setTimeout(async()=>{
  controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),26000);
  try{
   const response=await fetch(buildUrl(point,year),{signal:controller.signal,mode:"cors"});
   if(!response.ok)throw Error("NASA POWER respondió HTTP "+response.status);
   const raw=await response.json(),record=parseResponse(raw,year);
   if(token!==sequence)return;
   cache.set(key,record);
   if(cache.size>60)cache.delete(cache.keys().next().value);
   dataReady(record);
  }catch(err){
   if(token!==sequence)return;
   const fallback=compiled2025(point,year);
   if(fallback){status="success";currentData=fallback;statusView(context.label);
    cell("eoc-note","API diaria no disponible; se conservan los indicadores auditados 2025. "+(err?.message||""))}
   else{status="error";currentData=null;statusView(context.label);
    cell("eoc-note","Consulta NASA POWER no disponible: "+(err&&err.message?err.message:"error de conexión"))}
  }finally{clearTimeout(timeout)}
 },force?0:320);
}
function sync(selection){
 if(!selection)return;
 const city=selection.city||"",year=Number(selection.year)||2025;
 const newCity=city!==context.city,newYear=year!==context.year;
 context.city=city;context.year=year;
 if(newCity){context.selectedParcel=null}
 const point=context.selectedParcel||pointForCity(city);
 const wasPoint=context.point,pointChanged=!!point!==!!wasPoint||!!(point&&wasPoint&&(point.latitude!==wasPoint.latitude||point.longitude!==wasPoint.longitude));
 context.point=point;context.label=point?point.label:"";
 if(newYear||newCity||pointChanged||status==="idle"){
  request(point,year,false);
 }else{statusView(context.label)}
}
function selectPoint(lng,lat,label,origin="parcela"){
 const longitude=Number(lng),latitude=Number(lat);
 if(!Number.isFinite(longitude)||!Number.isFinite(latitude)||longitude< -180||longitude>180||latitude< -90||latitude>90)return;
 context.selectedParcel={longitude,latitude,label:label||(origin==="municipal"?"Municipio seleccionado":"Parcela seleccionada"),type:origin==="municipal"?"referencia":"parcela"};
 context.point=context.selectedParcel;context.label=context.point.label;
 request(context.point,context.year,false);
}
function clearPoint(year){
 sequence++;
 if(controller)controller.abort();
 if(debounce)clearTimeout(debounce);
 context.city="";context.selectedParcel=null;context.point=null;context.label="";
 if(Number(year)>=2003&&Number(year)<=2025)context.year=Number(year);
 currentData=null;status="idle";statusView("");
}
function attachLeaflet(map){
 leafletMap=map;updateMarker();
}
function attachMap(map){
 maplibreMap=map;maplibreLoaded=true;
 if(!map.getSource("eo-climate-point")){
  map.addSource("eo-climate-point",{type:"geojson",data:{type:"FeatureCollection",features:[]}});
  map.addLayer({id:"eo-climate-glow",type:"circle",source:"eo-climate-point",paint:{"circle-radius":17,"circle-color":"#57f4b7","circle-opacity":.16,"circle-stroke-width":1,"circle-stroke-color":"#b5ffe2"}});
  map.addLayer({id:"eo-climate-ring",type:"circle",source:"eo-climate-point",paint:{"circle-radius":8,"circle-color":"#39d9a2","circle-stroke-width":3,"circle-stroke-color":"#fffbcf"}});
 }
 updateMarker();
}
function renderChart(){
 const host=$("eo-chart");if(!host)return;
 cell("eo-series-a","Lluvia mensual (mm)");cell("eo-series-b","Temperatura media (°C)");
 cell("eo-chart-subtitle","NASA POWER · "+(context.label||"sin selección")+" · "+context.year);
 const monthly=currentData&&status==="success"&&Array.isArray(currentData.monthly)?currentData.monthly:null;
 if(!monthly){host.innerHTML='<div class="eoc-chart-note" style="padding:45px 20px;">'+(status==="loading"?"Consultando NASA POWER…":status==="error"?"NASA POWER no disponible; sin datos climáticos que graficar.":"Selecciona un punto para consultar clima.")+'</div>';cell("eo-chart-coverage","NASA POWER · serie diaria → resumen mensual");return}
 const W=1200,H=165,L=56,R=49,TOP=12,BOT=135;
 const rains=monthly.map(m=>m.PRECTOTCORR).filter(v=>v!==null);
 const temps=monthly.map(m=>m.T2M).filter(v=>v!==null);
 const rmax=Math.max(1,...rains)*1.16;
 const tmin=temps.length?Math.min(...temps)-2:0,tmax=temps.length?Math.max(...temps)+2:35;
 const x=i=>L+(i+.5)*(W-L-R)/12;
 const yRain=v=>BOT-(v/rmax)*(BOT-TOP),yTemp=v=>BOT-((v-tmin)/Math.max(.01,tmax-tmin))*(BOT-TOP);
 const grid=[0,.25,.5,.75,1].map(z=>{const y=BOT-(BOT-TOP)*z;return '<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'" stroke="#294144"/><text x="'+(L-8)+'" y="'+(y+3)+'" font-size="10" fill="#819d97" text-anchor="end">'+fmtInt(rmax*z)+'</text><text x="'+(W-R+8)+'" y="'+(y+3)+'" font-size="10" fill="#819d97">'+fmt(tmin+(tmax-tmin)*z)+'</text>'}).join("");
 const bars=monthly.map((m,i)=>{const v=m.PRECTOTCORR,h=v===null?0:BOT-yRain(v);return '<rect x="'+(x(i)-13).toFixed(1)+'" y="'+(BOT-h).toFixed(1)+'" width="26" height="'+h.toFixed(1)+'" rx="2" fill="#5ac7a6" opacity=".48"><title>'+MONTHS[i]+': '+fmt(v)+' mm</title></rect>'}).join("");
 const chunks=[];let active=[];
 monthly.forEach((m,i)=>{const v=m.T2M;if(v===null){if(active.length)chunks.push(active);active=[]}else active.push([x(i),yTemp(v)])});if(active.length)chunks.push(active);
 const path=chunks.map(c=>'<path d="M'+c.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(" L")+'" fill="none" stroke="#b3cbff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>').join("");
 const dots=monthly.map((m,i)=>m.T2M===null?"":'<circle cx="'+x(i).toFixed(1)+'" cy="'+yTemp(m.T2M).toFixed(1)+'" r="3.7" fill="#a7c9ff" stroke="#102326" stroke-width="1.3"><title>'+MONTHS[i]+': '+fmt(m.T2M)+' °C</title></circle>').join("");
 const months=MONTHS.map((name,i)=>'<text x="'+x(i).toFixed(1)+'" y="158" font-size="11" fill="#89a6a0" text-anchor="middle">'+name+'</text>').join("");
 host.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" role="img" aria-label="Precipitación mensual y temperatura media mensual de NASA POWER">'+grid+bars+path+dots+months+'<text x="6" y="11" fill="#88c5aa" font-size="9">mm</text><text x="'+(W-7)+'" y="11" text-anchor="end" fill="#a7c9ff" font-size="9">°C</text></svg>';
 const count=monthly.filter(m=>m.T2M!==null||m.PRECTOTCORR!==null).length;
 cell("eo-chart-coverage",count+"/12 meses disponibles · NASA POWER · punto "+context.label);
}
function hoverChart(event){
 if(status!=="success"||!currentData)return;
 const node=$("eo-chart"),rect=node.getBoundingClientRect(),fraction=(event.clientX-rect.left)/Math.max(1,rect.width);
 const month=Math.max(0,Math.min(11,Math.floor(fraction*12)));
 const m=currentData.monthly?.[month];if(!m)return;const target=$("eo-chart-tooltip");
 target.innerHTML='<strong>'+MONTHS[month]+' '+context.year+'</strong><div style="color:#5cf2bd">Precipitación: '+fmt(m.PRECTOTCORR)+' mm</div><div style="color:#a9c4ff">T media: '+fmt(m.T2M)+' °C</div>';
 target.hidden=false;
}
function ensureDaily(){
 if(!context.point||status==="loading")return;
 if(currentData?.compiled || !Array.isArray(currentData?.monthly))request(context.point,context.year,true);
}
function exportCSV(){
 if(!currentData||status!=="success")return;
 const labels=["mes","T2M_C","T2M_MAX_C","T2M_MIN_C","PRECTOTCORR_mm","RH2M_pct","WS2M_m_s","ALLSKY_SFC_SW_DWN_MJ_m2_dia"];
 const q=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
 const values=currentData.monthly.map(m=>[context.year+"-"+String(m.month+1).padStart(2,"0"),m.T2M,m.T2M_MAX,m.T2M_MIN,m.PRECTOTCORR,m.RH2M,m.WS2M,m.ALLSKY_SFC_SW_DWN].map(v=>q(v===null?"":v)).join(","));
 const contents="\ufeff"+[labels.join(","),...values].join("\r\n");
 const blob=new Blob([contents],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="growa-nasa-power-"+(context.label||"punto").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")+"-"+context.year+".csv";
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function onReady(){
 const retry=$("eoc-retry");if(retry)retry.addEventListener("click",()=>{if(context.point)request(context.point,context.year,true)});
 const layerSelect=$("eo-climate-variable");
 if(layerSelect){layerSelect.value=mapVariable;layerSelect.addEventListener("change",()=>{
   if(!MAP_VARIABLES[layerSelect.value])return;
   mapVariable=layerSelect.value;
   const climateButton=document.querySelector('[data-eo-layer="climate"]');
   if(climateButton&&!climateButton.classList.contains("active"))climateButton.click();
   window.GrowaEOMap?.refreshClimate?.();
 })}
 window.GrowaClimate={sync,selectPoint,clearPoint,attachLeaflet,attachMap,renderChart,hoverChart,exportCSV,ensureDaily,
  getStatus:()=>status,getData:()=>currentData,buildUrl,parseResponse,mapValue,mapUnit,mapLabel};
 const city=$("eo-city")?.value||"",year=Number($("eo-year")?.value)||2025;
 const existingLeaflet=window.GrowaEOMap?.getLeaflet?.();if(existingLeaflet)attachLeaflet(existingLeaflet);
 const existingGL=window.GrowaEOMap?.getMap?.();if(existingGL&&existingGL.loaded?.())attachMap(existingGL);
 sync({city,year});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",onReady);
else onReady();
})();
