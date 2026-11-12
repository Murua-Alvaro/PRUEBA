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
 const p=LOC[city];
 return p?{latitude:p[0],longitude:p[1],label:city,type:"cabecera"}:null;
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
 const statusLabel=status==="loading"?"CONSULTANDO":status==="success"?"VERIFICADO":status==="error"?"SIN CONEXIÓN":"SIN CONSULTA";
 cell("eoc-status",statusLabel);
 cell("eoc-location",label||"Selecciona municipio");
 cell("eoc-year",context.year);
 const p=context.point;
 cell("eoc-coordinate",p?(p.latitude.toFixed(3)+"°N · "+Math.abs(p.longitude).toFixed(3)+"°O · "+(p.type==="parcela"?"punto de polígono":"referencia municipal")):"Punto geográfico sin seleccionar");
 cell("eo-climate-place",label||"Punto de referencia");
 cell("eo-climate-date",context.year+" · "+(p&&p.type==="parcela"?"punto de polígono":"cabecera municipal aproximada"));
 cell("eo-climate-coverage",status==="success"&&currentData?currentData.availableDays+"/"+expectedYearDays(context.year)+" días":"—");
 cell("eo-climate-provider","NASA POWER · datos diarios · LST");
 const use=status==="success"&&currentData?currentData.yearly:null;
 cell("eoc-temp",fmt(use&&use.T2M));cell("eoc-rain",fmtInt(use&&use.PRECTOTCORR));
 cell("eoc-humidity",fmt(use&&use.RH2M));cell("eoc-radiation",fmt(use&&use.ALLSKY_SFC_SW_DWN));
 cell("eo-climate-tmin",fmt(use&&use.T2M_MIN));cell("eo-climate-tmax",fmt(use&&use.T2M_MAX));
 cell("eo-climate-wind",fmt(use&&use.WS2M));cell("eo-climate-rh",fmt(use&&use.RH2M));
 cell("eo-climate-precip",fmtInt(use&&use.PRECTOTCORR));
 cell("eo-climate-temp",fmt(use&&use.T2M));
 let note="";
 if(status==="loading")note="Descargando observaciones diarias de NASA POWER…";
 if(status==="error")note="No fue posible consultar NASA POWER. Sin datos locales alternativos verificados.";
 if(status==="idle")note="Elige un municipio o selecciona un punto dentro de una parcela importada.";
 if(status==="success")note="Punto de consulta NASA POWER. Datos de rejilla; no equivalen a una estación o parcela.";
 cell("eoc-note",note);
 cell("eo-climate-panel-note",note);
 const retry=$("eoc-retry");if(retry)retry.hidden=!(status==="error"||status==="idle");
 renderMini();
 updateMarker();
 if(document.querySelector('[data-eo-chart="climate"].active'))renderChart();
}
function renderMini(){
 const host=$("eo-climate-mini");if(!host)return;
 const months=currentData&&status==="success"?currentData.monthly:null;
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
   status="error";currentData=null;
   statusView(context.label);
   cell("eoc-note","Consulta NASA POWER no disponible: "+(err&&err.message?err.message:"error de conexión"));
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
function selectPoint(lng,lat,label){
 const longitude=Number(lng),latitude=Number(lat);
 if(!Number.isFinite(longitude)||!Number.isFinite(latitude)||longitude< -180||longitude>180||latitude< -90||latitude>90)return;
 context.selectedParcel={longitude,latitude,label:label||"Parcela seleccionada",type:"parcela"};
 context.point=context.selectedParcel;context.label=context.point.label;
 request(context.point,context.year,false);
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
 const monthly=currentData&&status==="success"?currentData.monthly:null;
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
 const m=currentData.monthly[month],target=$("eo-chart-tooltip");
 target.innerHTML='<strong>'+MONTHS[month]+' '+context.year+'</strong><div style="color:#5cf2bd">Precipitación: '+fmt(m.PRECTOTCORR)+' mm</div><div style="color:#a9c4ff">T media: '+fmt(m.T2M)+' °C</div>';
 target.hidden=false;
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
 const retry=$("eoc-retry");if(retry)retry.addEventListener("click",()=>{
  if(context.point)request(context.point,context.year,true);
 });
 window.GrowaClimate={sync,selectPoint,attachLeaflet,attachMap,renderChart,hoverChart,exportCSV,
  getStatus:()=>status,getData:()=>currentData,buildUrl,parseResponse};
 const city=$("eo-city")?.value||"",year=Number($("eo-year")?.value)||2025;
 const existingLeaflet=window.GrowaEOMap?.getLeaflet?.();if(existingLeaflet)attachLeaflet(existingLeaflet);
 const existingGL=window.GrowaEOMap?.getMap?.();if(existingGL&&existingGL.loaded?.())attachMap(existingGL);
 sync({city,year});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",onReady);
else onReady();
})();
