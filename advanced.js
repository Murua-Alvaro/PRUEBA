/* GROWA / Earth Intelligence: territorial crop and climate analytics.
Data: audited DGSIAP 2003-2025 and NASA POWER 2003-2025.
Markers refer to municipalities with production records, not cultivated parcel polygons. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const n=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=new Intl.NumberFormat("es-MX",{maximumFractionDigits:2});
const abbr=new Intl.NumberFormat("es-MX",{notation:"compact",maximumFractionDigits:1});
const F=v=>v===null||v===undefined||!Number.isFinite(v)?"—":fmt.format(v);
const K=v=>v===null||v===undefined||!Number.isFinite(v)?"—":Math.abs(v)>9999?abbr.format(v):F(v);
const years=Array.from({length:23},(_,i)=>2003+i);
const months=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const climateVars={TMEAN:["Temperatura media","°C"],PRECIP_MM:["Precipitación","mm"],ET0_MM:["Evapotranspiración","mm"],VPD_MEAN:["Déficit de vapor","kPa"],RH_MEAN:["Humedad relativa","%"],WATER_BALANCE_MM:["Balance P − ET0","mm"]};
let N=null,C=null,D=null,leaf=null,markers=null,selectedPoint=null,region="Sinaloa",compareState="",panel="production",resolution="annual",showMarkers=true,lastGraph=null,lastOptions="";
const annual=new Map(),climate=new Map(),pointIndex=new Map(),climateS=new Map(),monthlyS=new Map(),producerIndex=new Map();
const ready=()=>Boolean(N&&C);
let mapHealth={state:"loading",provider:"SATÉLITE",detail:"Preparando cartografía"};
let geoCenter=null,geoZoom=6,geoOffset={x:0,y:0},geoProvider=0,geoToken=0,geoLastSignature="";
const geoProviders=[
 {name:"ESRI / SATÉLITE",url:(z,x,y)=>"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/"+z+"/"+y+"/"+x,credit:"Imagery © Esri, Maxar, Earthstar Geographics"},
 {name:"CARTO / OPENSTREETMAP",url:(z,x,y)=>"https://a.basemaps.cartocdn.com/light_all/"+z+"/"+x+"/"+y+".png",credit:"© OpenStreetMap contributors © CARTO"},
 {name:"OPENSTREETMAP",url:(z,x,y)=>"https://tile.openstreetmap.org/"+z+"/"+x+"/"+y+".png",credit:"© OpenStreetMap contributors"}
];
function merc(lon,lat,z){
 const s=256*Math.pow(2,z),a=Math.max(-85.0511,Math.min(85.0511,lat))*Math.PI/180;
 return [(lon+180)/360*s,(1-Math.log(Math.tan(a)+1/Math.cos(a))/Math.PI)/2*s];
}
function setView(force=false){
 if(!ready())return;
 const points=N.points.filter(p=>p[1]===stateIndex(region));if(!points.length)return;
 const west=Math.min(...points.map(p=>p[4])),east=Math.max(...points.map(p=>p[4])),south=Math.min(...points.map(p=>p[3])),north=Math.max(...points.map(p=>p[3]));
 const root=$("ea-geostage"),w=Math.max(320,(root?.clientWidth||1200)-510),h=Math.max(280,(root?.clientHeight||570)-140);
 const a=merc(west,north,0),b=merc(east,south,0);
 if(force||!geoCenter){
  geoCenter={lat:(south+north)/2,lon:(west+east)/2};
  geoZoom=Math.max(4,Math.min(12,Math.floor(Math.min(Math.log2(w/Math.max(1,b[0]-a[0])),Math.log2(h/Math.max(1,b[1]-a[1]))))));
  geoOffset={x:0,y:0};geoProvider=0;
 }
}
function setMapHealth(update){
 mapHealth={...mapHealth,...update};
 const stage=$("ea-geostage"),label=$("ea-map-status"),name=$("ea-map-provider");
 if(stage)stage.hidden=mapHealth.state==="ready";
 if(label)label.textContent=mapHealth.state==="ready"?"SATÉLITE ACTIVO":mapHealth.state==="native"?"MAPA ACTIVO":mapHealth.state==="loading"?"CARGANDO SATÉLITE":"MAPA ALTERNATIVO";
 if(name)name.textContent=mapHealth.provider||"Cartografía";
 if(stage&&!stage.hidden)drawGeographicFallback();
}
function drawGeographicFallback(){
 const stage=$("ea-geostage");if(!stage||!ready())return;
 if(!geoCenter)setView(true);
 const w=Math.max(400,stage.clientWidth||window.innerWidth||1200),h=Math.max(350,stage.clientHeight||520);
 const z=geoZoom,scale=Math.pow(2,z),cp=merc(geoCenter.lon,geoCenter.lat,z);
 const left=cp[0]-w/2-geoOffset.x,top=cp[1]-h/2-geoOffset.y;
 const provider=geoProviders[geoProvider];
 const signature=[region,state().crop,region==="Sinaloa"?state().year:"2025",selectedPoint?.[2]||"",showMarkers,geoZoom,geoCenter?.lat,geoCenter?.lon,geoOffset.x,geoOffset.y,geoProvider].join("|");
 if(signature===geoLastSignature&&stage.innerHTML.includes('data-ea-raster'))return;
 geoLastSignature=signature;
 const token=++geoToken;
 let tiles="";
 for(let ty=Math.max(0,Math.floor(top/256)-1);ty<=Math.min(scale-1,Math.ceil((top+h)/256)+1);ty++){
  for(let tx=Math.floor(left/256)-1;tx<=Math.ceil((left+w)/256)+1;tx++){
   tiles+='<img data-ea-raster="1" alt="" draggable="false" loading="eager" decoding="async" style="position:absolute;left:'+(tx*256-left).toFixed(1)+'px;top:'+(ty*256-top).toFixed(1)+'px;width:256px;height:256px" src="'+provider.url(z,((tx%scale)+scale)%scale,ty)+'">';
  }
 }
 const points=showMarkers?activeCropZones():[],max=Math.max(1,...points.map(p=>p.harvest));
 const dots=points.map(p=>{
  const xy=merc(p.lon,p.lat,z),x=xy[0]-left,y=xy[1]-top;
  if(x<0||x>w||y<0||y>h)return "";
  const pick=n(selectedPoint?.[2]||state().city)===n(p.city);
  const diameter=pick?20:Math.round(11+Math.sqrt(Math.max(0,p.harvest)/max)*10);
  return '<button class="ea-geo-pin'+(pick?' selected':'')+'" data-ea-fallback-city="'+esc(p.city)+'" type="button" style="left:'+x.toFixed(1)+'px;top:'+y.toFixed(1)+'px;width:'+diameter+'px;height:'+diameter+'px" title="'+esc(p.city+" · "+state().crop+" · "+F(p.harvest)+" ha, punto municipal de referencia")+'" aria-label="Seleccionar '+esc(p.city)+'"></button>';
 }).join("");
 stage.innerHTML='<div class="ea-geo-tiles">'+tiles+'</div><div class="ea-geo-tint"></div><div class="ea-geo-pins">'+dots+'</div>'
 +'<div class="ea-geo-legend"><span class="ea-geo-led"></span>'+esc(region)+' · '+points.length+' referencias municipales de '+esc(state().crop)+'</div>'
 +'<div class="ea-geo-credit">'+esc(provider.credit)+'</div>';
 let ok=0,failed=0,settled=false;const imgs=Array.from(stage.querySelectorAll("img[data-ea-raster]"));
 const threshold=Math.max(1,Math.ceil(imgs.length*.16));
 const fallbackDelay=setTimeout(()=>{
  if(token!==geoToken||settled)return;
  if(ok<threshold&&geoProvider<geoProviders.length-1){geoProvider++;drawGeographicFallback()}
  else if(ok>0){const status=$("ea-map-status");if(status)status.textContent="CARTOGRAFÍA PARCIAL"}
 },8500);
 function update(){
  if(token!==geoToken)return;
  if(ok>=threshold){
   settled=true;clearTimeout(fallbackDelay);
   if(mapHealth.state!=="ready"){
    mapHealth={state:"native",provider:provider.name,detail:"Imágenes reales cargadas"};
    const lab=$("ea-map-status"),prov=$("ea-map-provider");
    if(lab)lab.textContent="BASE GEOGRÁFICA";
    if(prov)prov.textContent=provider.name;
   }
  }else if(failed>=Math.ceil(imgs.length*.6)&&ok===0){
   settled=true;clearTimeout(fallbackDelay);
   if(geoProvider<geoProviders.length-1){geoProvider++;drawGeographicFallback()}
   else{const lab=$("ea-map-status");if(lab)lab.textContent="IMÁGENES NO DISPONIBLES"}
  }
 }
 imgs.forEach(img=>{
  img.addEventListener("load",()=>{ok++;update()},{once:true});
  img.addEventListener("error",()=>{failed++;update()},{once:true});
 });
}
function zoomFallback(step){geoZoom=Math.max(4,Math.min(13,geoZoom+(step>0?1:-1)));geoOffset={x:0,y:0};drawGeographicFallback()}
function toggleRaster(){geoProvider=geoProvider===0?1:0;drawGeographicFallback()}
function retryRaster(){geoProvider=0;geoLastSignature="";drawGeographicFallback()}
function resetFallback(){geoLastSignature="";setView(true);drawGeographicFallback()}
function panFallback(dx,dy){geoOffset.x+=dx;geoOffset.y+=dy;drawGeographicFallback()}
function centerFallback(lat,lon){geoCenter={lat,lon};geoOffset={x:0,y:0};geoZoom=Math.max(7,geoZoom);drawGeographicFallback()}
function renderMapTelemetry(){
 const s=state(),points=activeCropZones();
 const total=points.reduce((a,p)=>a+(Number(p.harvest)||0),0);
 const lead=points.length?points.reduce((a,p)=>p.harvest>a.harvest?p:a):null;
 text("ea-map-place",region.toUpperCase());
 text("ea-map-crop",s.crop);
 text("ea-map-points",points.length+" REF.");
 text("ea-map-area",K(total)+" ha");
 text("ea-map-lead",lead?lead.city:"Sin referencias 2025");
 const coords=document.querySelector(".eo-map-coordinates");
 const list=N.points.filter(p=>p[1]===stateIndex(region));
 if(coords&&list.length){
  const midLat=list.reduce((a,p)=>a+p[3],0)/list.length;
  const midLon=list.reduce((a,p)=>a+p[4],0)/list.length;
  coords.textContent=F(midLat)+"°N / "+F(Math.abs(midLon))+"°O";
 }
 if($("ea-geostage")&&!$("ea-geostage").hidden)drawGeographicFallback();
}
const eo=()=>window.GrowaEOAPI;
const state=()=>eo()?.getState?.()||{crop:"Maíz grano",city:"",year:2025,chart:"yield",compare:""};
const isNational=()=>region!=="Sinaloa";
const text=(id,s)=>{const el=$(id);if(el)el.textContent=String(s)};
const stateIndex=name=>N?.states.indexOf(name)??-1;
const cropIndex=name=>N?.crops.indexOf(name)??-1;
const cv=field=>climateVars[field]||[field,""];
function climateAnnual(name,year,key){
 if(!ready())return null;
 if(isNational()){
  const row=climate.get(stateIndex(name)+"|"+year),index=N.climateFields.indexOf(key);
  const val=row&&index>=0?row[3+index]:null;
  return typeof val==="number"&&Number.isFinite(val)?val:null;
 }
 const idx=C.annual_fields.indexOf(key);if(idx<0)return null;
 const muni=C.municipios.findIndex(x=>n(x.name)===n(name));
 if(muni>=0){const row=climateS.get(muni+"|"+(year-2003));return row?row[2+idx]:null}
 const unique=new Set(),v=[];
 C.municipios.forEach((x,i)=>{if(unique.has(x.grid))return;unique.add(x.grid);const row=climateS.get(i+"|"+(year-2003));const value=row?.[2+idx];if(typeof value==="number")v.push(value)});
 return v.length?v.reduce((a,b)=>a+b)/v.length:null;
}
function climateMonthly(name,year,month,key){
 const idx=C.monthly_fields.indexOf(key);if(idx<0)return null;
 const muni=C.municipios.findIndex(x=>n(x.name)===n(name));
 if(muni>=0){const row=monthlyS.get(muni+"|"+(year-2003)+"|"+month);return row?.[3+idx]??null}
 const used=new Set(),v=[];
 C.municipios.forEach((x,i)=>{if(used.has(x.grid))return;used.add(x.grid);const row=monthlyS.get(i+"|"+(year-2003)+"|"+month);const value=row?.[3+idx];if(typeof value==="number")v.push(value)});
 return v.length?v.reduce((a,b)=>a+b)/v.length:null;
}
function agriculture(year,name,crop){
 if(!ready())return null;
 if(isNational()){
  const row=annual.get(stateIndex(name)+"|"+cropIndex(crop)+"|"+year);
  if(!row)return null;
  return {area:row[3],volume:row[4],value:row[5],harvest:row[3],yield:row[3]>0?row[4]/row[3]:null};
 }
 const r=D.crops.filter(x=>x.year===year&&n(x.name)===n(crop)&&(!name||n(x.municipio)===n(name)));
 if(!r.length)return null;
 const sum=key=>r.reduce((a,x)=>a+(Number(x[key])||0),0);
 const u=[...new Set(r.map(x=>n(x.unit)))],area=sum("harvest");
 const physical=u.length===1&&u[0]&&r.every(x=>Number.isFinite(x.volume)&&Number.isFinite(x.harvest)&&x.volume>=0&&x.harvest>=0);
 return {area:sum("planted"),harvest:area,volume:physical?sum("volume"):null,value:sum("value"),yield:physical&&area>0?sum("volume")/area:null};
}
function activeCropZones(){
 if(!ready())return [];
 const s=state();
 if(isNational()){
  const ci=cropIndex(s.crop),ri=stateIndex(region);
  return N.links2025.filter(x=>x[1]===ci&&pointIndex.get(x[0])?.[1]===ri).map(x=>{
   const p=pointIndex.get(x[0]);return {id:x[0],city:p[2],lat:p[3],lon:p[4],grid:p[5],harvest:x[2],volume:x[3],year:2025};
  }).sort((a,b)=>b.harvest-a.harvest);
 }
 const refs=new Map(C.municipios.map(x=>[n(x.name),x]));
 const a=new Map();
 D.crops.filter(x=>x.year===s.year&&n(x.name)===n(s.crop)&&Number(x.harvest)>0).forEach(x=>{
  const key=n(x.municipio),old=a.get(key)||{harvest:0,volume:0};
  old.harvest+=Number(x.harvest)||0;old.volume+=Number(x.volume)||0;a.set(key,old);
 });
 return [...a].map(([name,val])=>{const p=refs.get(name);return p?{city:p.name,lat:p.lat,lon:p.lon,grid:p.grid,year:s.year,...val}:null}).filter(Boolean);
}
function setMap(map){leaf=map;drawMarkers();fitRegion()}
function drawMarkers(){
 if(!ready())return;
 const prePoints=activeCropZones();
 text("ea-point-count",prePoints.length?prePoints.length+" referencias productivas":isNational()?"Sin referencias geográficas verificadas de 2025 para este cultivo":"Sin referencias de producción para el año elegido");
 text("ea-point-year",isNational()?"Corte georreferenciado: 2025":"Corte georreferenciado: "+state().year);
 renderMapTelemetry();
 if(!leaf||!window.L)return;
 const original=eo()?.getMunicipalLayer?.();
 if(original){if(isNational()&&leaf.hasLayer(original))leaf.removeLayer(original);if(!isNational()&&!leaf.hasLayer(original))original.addTo(leaf)}
 if(!markers)markers=window.L.layerGroup().addTo(leaf);
 markers.clearLayers();
 const points=prePoints;
 if(!showMarkers)return;
 const max=Math.max(1,...points.map(x=>x.harvest));
 points.forEach(p=>{
  const selected=n(selectedPoint?.city||state().city)===n(p.city);
  const radius=4+Math.sqrt(p.harvest/max)*7;
  const marker=window.L.circleMarker([p.lat,p.lon],{radius:radius+(selected?2:0),weight:selected?3:1.5,color:"#e8ffef",fillColor:selected?"#d9f47a":"#51e2ac",fillOpacity:.84});
  marker.bindTooltip("<b>"+esc(p.city)+"</b><br>"+esc(state().crop)+"<br>"+F(p.harvest)+" ha cosechadas · "+p.year+"<br><small>Punto municipal de referencia; no parcela</small>",{direction:"top",sticky:true});
  marker.on("click",()=>{if(isNational())selectNationalCity(p.city);else eo()?.selectCity?.(p.city)});
  marker.addTo(markers);
 });
}
function fitRegion(){
 if(!leaf||!window.L)return;
 leaf.invalidateSize({animate:false});
 if(!isNational()){leaf.fitBounds([[22.3,-109.8],[27.55,-105.08]],{padding:[28,28],animate:false});window.GrowaEOMap?.verifyTiles?.();return}
 const points=N.points.filter(x=>x[1]===stateIndex(region));
 if(points.length){
  leaf.fitBounds(window.L.latLngBounds(points.map(x=>[x[3],x[4]])),{padding:[70,70],maxZoom:8,animate:false});
  window.GrowaEOMap?.verifyTiles?.();
 }
}
function fillRight(){
 const s=state(),name=isNational()?region:s.city,cur=agriculture(s.year,name,s.crop),old=agriculture(s.year-1,name,s.crop);
 const changed=cur?.yield!=null&&old?.yield>0?(cur.yield/old.yield-1)*100:null;
 text("eo-selected-crop",s.crop);
 text("eo-selected-location",(isNational()?region:(s.city||"Sinaloa"))+" · "+s.year);
 text("eo-yield",F(cur?.yield));text("eo-yield-unit","t/ha");text("eo-yield-year",s.year);
 text("eo-yield-note",isNational()?"Agregado estatal, ponderado por superficie":"Registro DGSIAP municipal · histórico");
 text("ea-volume",K(cur?.volume));text("ea-harvest",K(cur?.harvest));text("ea-planted",isNational()?"—":K(cur?.area));
 text("ea-change",changed==null?"—":(changed>0?"+":"")+F(changed)+" %");
 const hist=years.filter(y=>y<=s.year).map(y=>agriculture(y,name,s.crop)?.yield).filter(v=>v!=null&&Number.isFinite(v)).sort((a,b)=>a-b);
 const q=p=>{if(hist.length<5)return null;const i=(hist.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return hist[lo]+(hist[hi]-hist[lo])*(i-lo)};
 text("ea-p25",F(q(.25)));text("ea-p75",F(q(.75)));text("ea-years",hist.length+" temporadas históricas");
 text("ea-source",isNational()?"DGSIAP · agregado estatal, unidad toneladas":"DGSIAP · municipio/producto/año");
 const areaText=isNational()?"Corte 2025 en puntos; series estatales 2003–2025":"Series municipales 2003–2025";
 text("ea-production-scope",areaText);
 const brief=$("ea-reference-brief"),link=isNational()&&selectedPoint?N.links2025.find(x=>x[0]===selectedPoint[0]&&x[1]===cropIndex(s.crop)):null;
 if(brief){
  brief.hidden=!link;
  if(link){
   text("ea-brief-name",selectedPoint[2]+" · 2025");
   text("ea-brief-area",K(link[2])+" ha");
   text("ea-brief-volume",K(link[3])+" t");
   text("ea-brief-yield",link[2]>0?F(link[3]/link[2])+" t/ha":"—");
  }
 }

 const loc=isNational()?region+" · promedio estatal":(s.city||"Sinaloa");
 text("ea-climate-title",loc+" · "+s.year);
 for(const [key,id] of [["TMEAN","ea-temperature"],["PRECIP_MM","ea-rain"],["ET0_MM","ea-et0"],["VPD_MEAN","ea-vpd"],["RH_MEAN","ea-humidity"],["WATER_BALANCE_MM","ea-balance"]]){
  const val=climateAnnual(isNational()?region:s.city,s.year,key);text(id,F(val));
 }
 text("ea-climate-source",isNational()?"Promedio estatal no ponderado de celdas NASA POWER únicas; NO es el clima del municipio o punto seleccionado":s.city?"Celda NASA del municipio":"Promedio simple de celdas únicas de Sinaloa");
 const ref=isNational()?selectedPoint:C.municipios.find(x=>n(x.name)===n(s.city));
 text("ea-ref-state",region);text("ea-ref-place",isNational()?(ref?.[2]||"Selecciona una referencia"):(ref?.name||"Sinaloa · agregado"));
 text("ea-ref-point",ref?(isNational()?F(ref[3])+"°N, "+F(ref[4])+"°O":F(ref.lat)+"°N, "+F(ref.lon)+"°O"):"—");
 text("ea-ref-grid",ref?(isNational()?ref[5]:ref.grid):"—");
 text("ea-ref-year",isNational()?"Las referencias de cultivo son del cierre 2025":"Referencias según el año seleccionado");
 if(isNational()){
  text("eo-selected-location",region+" · "+s.year);
  text("eo-selected-crop",s.crop);
  text("eo-yield",F(cur?.yield));text("eo-yield-unit","t/ha");
  text("eo-yield-note","Rendimiento ponderado por superficie estatal; no atribuible a un punto municipal.");
  text("eo-map-title",s.crop+" · referencias 2025 · "+region);
  text("eo-geo-status",activeCropZones().length+" referencias");
  text("eo-year-value",s.year);
  const list=activeCropZones().slice(0,12);
  $("eo-municipality-ranking").innerHTML=list.map(p=>'<button type="button" class="eo-rank" data-ea-city="'+esc(p.city)+'"><span>'+esc(p.city)+'</span><em>'+K(p.harvest)+' ha</em></button>').join("")||'<p class="eo-loading">Sin referencias 2025 de este cultivo.</p>';
 }
 text("eo-region-label",region.toUpperCase()+" / MÉXICO");
}
function seriesData(){
 const s=state(),climateMode=s.chart==="climate",field=$("eo-climate-variable")?.value||"PRECIP_MM";
 const monthMode=climateMode&&resolution==="monthly"&&!isNational()&&C.monthly_fields.includes(field);
 const primary=isNational()?region:(s.city||"Sinaloa");
 const secondary=isNational()?(compareState||"Sinaloa"):(s.compare||"Sinaloa");
 const metricUnit=climateMode?cv(field)[1]:s.chart==="yield"?"t/ha":s.chart==="harvest"?"ha":"valor DGSIAP";
 const values=(name,y)=>climateMode?climateAnnual(name,y,field):(s.chart==="yield"?agriculture(y,name,s.crop)?.yield:s.chart==="harvest"?agriculture(y,name,s.crop)?.harvest:agriculture(y,name,s.crop)?.value)??null;
 if(monthMode){
  const row=(name,m)=>climateMonthly(name,s.year,m,field);
  return {labels:months,years:months,first:months.map((_,i)=>row(primary,i)),second:months.map((_,i)=>row(secondary,i)),names:[primary,secondary],unit:metricUnit,monthly:true};
 }
 return {labels:years.map(String),years,first:years.map(y=>values(primary,y)),second:years.map(y=>values(secondary,y)),names:[primary,secondary],unit:metricUnit,monthly:false};
}
function renderChart(){
 if(!ready())return false;
 const d=seriesData();lastGraph=d;
 const chart=$("eo-chart"),s=state();
 text("eo-series-a",d.names[0]);text("eo-series-b",d.names[1]);
 const measure=s.chart==="climate"?cv($("eo-climate-variable")?.value||"PRECIP_MM")[0]:s.chart==="yield"?"Rendimiento":s.chart==="harvest"?"Superficie cosechada":"Valor producción";
 text("eo-chart-subtitle",s.crop+" · "+measure+" · "+(d.monthly?s.year:"2003–2025")+" · "+d.unit);
 const good=d.first.concat(d.second).filter(v=>typeof v==="number"&&Number.isFinite(v));
 if(!good.length){chart.innerHTML='<div class="ea-empty">No hay observaciones comparables. Selecciona otro cultivo o zona.</div>';return true}
 const W=1200,H=162,L=56,R=28,T=13,B=133,max=Math.max(...good),min=Math.min(0,...good);let hi=Math.max(1,max),lo=min;
 if(max===min){hi+=1;lo-=1}const x=i=>L+i*(W-L-R)/(d.labels.length-1),y=v=>B-(v-lo)/(hi-lo)*(B-T);
 const ticks=[0,.25,.5,.75,1].map(k=>{const yy=B-k*(B-T);return '<line x1="'+L+'" x2="'+(W-R)+'" y1="'+yy+'" y2="'+yy+'" stroke="#2a4143"/><text x="'+(L-10)+'" y="'+(yy+3)+'" fill="#7ca49a" font-size="10" text-anchor="end">'+F(lo+k*(hi-lo))+'</text>'}).join("");
 const lines=(a,color,dash)=>{let segments=[],cur=[];a.forEach((v,i)=>{if(typeof v!=="number"){if(cur.length)segments.push(cur);cur=[]}else cur.push([x(i),y(v)])});if(cur.length)segments.push(cur);return segments.map(p=>'<path d="M'+p.map(pt=>pt.map(v=>v.toFixed(2)).join(",")).join("L")+'" fill="none" stroke="'+color+'" stroke-width="2.5" stroke-linecap="round"'+(dash?' stroke-dasharray="7 6"':'')+'/>').join("")};
 const every=d.monthly?1:5,labels=d.labels.map((v,i)=>i%every===0||i===d.labels.length-1?'<text x="'+x(i)+'" y="157" text-anchor="middle" fill="#82a59c" font-size="10">'+esc(v)+'</text>':"").join("");
 const highlight=d.monthly?"":'<line x1="'+x(s.year-2003)+'" x2="'+x(s.year-2003)+'" y1="'+T+'" y2="'+B+'" stroke="#b7f6dc" stroke-dasharray="3 5" opacity=".7"/>';
 chart.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" aria-label="Gráfico temporal vinculado">'+ticks+highlight+lines(d.second,"#9fb9ff",true)+lines(d.first,"#5cf2b5",false)+labels+'</svg>';
 text("eo-chart-coverage",d.first.filter(x=>typeof x==="number").length+" observaciones principales · "+(s.chart==="climate"?"NASA POWER":"DGSIAP"));
 return true;
}
function hoverChart(e){
 if(!lastGraph)return;
 const el=$("eo-chart"),r=el.getBoundingClientRect(),f=(e.clientX-r.left-r.width*56/1200)/Math.max(1,r.width*(1200-56-28)/1200),i=Math.max(0,Math.min(lastGraph.labels.length-1,Math.round(f*(lastGraph.labels.length-1))));
 const d=lastGraph,tip=$("eo-chart-tooltip");
 tip.innerHTML="<strong>"+esc(d.labels[i])+"</strong><div style='color:#5cf2b5'>"+esc(d.names[0])+": "+F(d.first[i])+" "+esc(d.unit)+"</div><div style='color:#9fb9ff'>"+esc(d.names[1])+": "+F(d.second[i])+" "+esc(d.unit)+"</div>";tip.hidden=false;
}
function clickChart(e){
 if(!lastGraph||lastGraph.monthly)return;
 const r=$("eo-chart").getBoundingClientRect(),f=(e.clientX-r.left-r.width*56/1200)/Math.max(1,r.width*(1200-56-28)/1200),i=Math.max(0,Math.min(22,Math.round(f*22))),year=years[i],input=$("eo-year");
 input.value=String(year);input.dispatchEvent(new Event("input",{bubbles:true}));
}
function exportCSV(){
 if(!lastGraph)return;
 const d=lastGraph,q=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
 const rows=[["periodo","zona_1","valor_1","zona_2","valor_2","unidad"].join(",")];
 d.labels.forEach((t,i)=>rows.push([t,d.names[0],d.first[i]??"",d.names[1],d.second[i]??"",d.unit].map(q).join(",")));
 const u=URL.createObjectURL(new Blob(["\ufeff"+rows.join("\r\n")],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=u;a.download="growa_"+n(region).replace(/\s+/g,"-")+"_"+state().chart+".csv";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);
}
function onEOState(){
 if(!ready())return;
 const s=state(),key=region+"|"+s.crop;
 if(key!==lastOptions){refreshCityOptions();lastOptions=key}
 fillRight();renderChart();drawMarkers();
 if(isNational()&&!selectedPoint)window.GrowaClimate?.sync?.({city:"",year:state().year});
}
function refreshCityOptions(){
 const s=state();
 if(isNational()){
  const points=activeCropZones();
  $("eo-city").innerHTML='<option value="">Agregado estatal</option>'+points.map(p=>'<option value="'+esc(p.city)+'">'+esc(p.city)+'</option>').join("");
  $("eo-city").value=selectedPoint?.[2]||"";
  $("eo-compare").innerHTML='<option value="">Referencia: Sinaloa</option>'+N.states.filter(x=>x!==region).map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join("");
  $("eo-compare").value=compareState;
 }else{
  $("eo-city").innerHTML='<option value="">Sinaloa · todos</option>'+C.municipios.map(p=>'<option value="'+esc(p.name)+'">'+esc(p.name)+'</option>').join("");
  $("eo-city").value=s.city||"";
  $("eo-compare").innerHTML='<option value="">Agregado Sinaloa</option>'+C.municipios.map(p=>'<option value="'+esc(p.name)+'">'+esc(p.name)+'</option>').join("");
  $("eo-compare").value=s.compare||"";
 }
}
function chooseRegion(name){
 if(!N?.states.includes(name))return;
 region=name;selectedPoint=null;compareState="";lastOptions="";setView(true);
 setMapHealth({state:"loading",detail:"Cargando "+region});
 const climateHUD=$("eo-climate-hud");if(climateHUD)climateHUD.hidden=isNational();
 const names=isNational()?N.crops:D.cropNames,sel=$("eo-crop");
 const supported=isNational()?new Set(N.links2025.filter(x=>pointIndex.get(x[0])?.[1]===stateIndex(region)).map(x=>N.crops[x[1]])):null;
 const previous=state().crop;
 const keep=names.includes(previous)&&(!supported||supported.has(previous))?previous:(names.find(x=>x==="Maíz grano"&&(!supported||supported.has(x)))||names.find(x=>supported?.has(x))||names[0]);
 sel.innerHTML=names.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join("");sel.value=keep;
 eo()?.setCrop?.(keep);
 if(isNational())window.GrowaClimate?.clearPoint?.(state().year);else window.GrowaClimate?.sync?.(state());
 onEOState();fitRegion();
}
function selectNationalCity(name){
 selectedPoint=N.points.find(p=>p[1]===stateIndex(region)&&n(p[2])===n(name))||null;
 $("eo-city").value=selectedPoint?.[2]||"";
 if(selectedPoint){leaf?.panTo([selectedPoint[3],selectedPoint[4]]);if(!leaf)centerFallback(selectedPoint[3],selectedPoint[4]);window.GrowaClimate?.selectPoint?.(selectedPoint[4],selectedPoint[3],selectedPoint[2],"municipal")}
 onEOState();
}
function createUI(){
 const container=document.querySelector(".eo-selection"),right=document.querySelector(".eo-right");if(!container||!right)throw Error("Estructura base no disponible");
 const mapElement=$("eo-map");if(!mapElement)throw Error("Visor geográfico no encontrado");
 if(!$("ea-geostage")){
  const fallback=document.createElement("div");fallback.id="ea-geostage";fallback.className="ea-geostage";
  mapElement.insertAdjacentElement("afterend",fallback);
  let anchor=null,dragged=false;
  fallback.addEventListener("pointerdown",e=>{if(e.target.closest("button[data-ea-fallback-city]"))return;anchor=[e.clientX,e.clientY];dragged=false});
  fallback.addEventListener("pointerup",e=>{if(!anchor)return;const dx=e.clientX-anchor[0],dy=e.clientY-anchor[1];anchor=null;if(Math.hypot(dx,dy)>8){dragged=true;panFallback(dx,dy)}});
  fallback.addEventListener("wheel",e=>{if(e.target.closest("button"))return;e.preventDefault();zoomFallback(e.deltaY<0?1:-1)},{passive:false});
  fallback.addEventListener("click",e=>{if(dragged){dragged=false;return}const pin=e.target.closest("button[data-ea-fallback-city]");if(!pin)return;
    const city=pin.getAttribute("data-ea-fallback-city");if(isNational())selectNationalCity(city);else eo()?.selectCity?.(city);
  });
  const telemetry=document.createElement("div");telemetry.id="ea-map-telemetry";telemetry.className="ea-map-telemetry";
  telemetry.innerHTML='<div class="ea-map-telemetry-top"><span class="ea-map-light"></span><b id="ea-map-place">SINALOA</b><span id="ea-map-points">—</span></div><div class="ea-map-telemetry-body"><strong id="ea-map-crop">Maíz grano</strong><span id="ea-map-area">— ha</span></div><div class="ea-map-telemetry-foot">MAYOR SUPERFICIE REGISTRADA <strong id="ea-map-lead">—</strong></div>';
  mapElement.insertAdjacentElement("afterend",telemetry);
  const mapStatus=document.createElement("div");mapStatus.id="ea-map-health";mapStatus.className="ea-map-health";
  mapStatus.innerHTML='<div><span id="ea-map-status">CARGANDO CARTOGRAFÍA</span><small id="ea-map-provider">Satélite · conexión</small></div><button id="ea-map-retry" type="button" title="Reintentar carga cartográfica" aria-label="Reintentar mapa">↻</button>';
  mapElement.insertAdjacentElement("afterend",mapStatus);
  $("ea-map-retry").addEventListener("click",()=>{if(window.GrowaEOMap?.retryTiles)window.GrowaEOMap.retryTiles();else retryRaster()});
 }
 setMapHealth(mapHealth);
 right.id="eo-right";right.dataset.eaTab="production";
 const label=document.createElement("label");label.innerHTML='ESTADO <select id="ea-state" aria-label="Elegir estado"></select>';label.className="ea-state";
 container.insertBefore(label,container.firstChild);
 $("ea-state").innerHTML=N.states.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join("");$("ea-state").value=region;
 $("ea-state").addEventListener("change",e=>chooseRegion(e.target.value));
 const tool=document.createElement("div");tool.className="ea-map-points";
 tool.innerHTML='<div><strong>REFERENCIAS DE CULTIVO</strong><label><input id="ea-point-toggle" type="checkbox" checked> Visibles</label></div><span id="ea-point-count">—</span><small id="ea-point-year">Puntos municipales, no parcelas</small>';
 document.querySelector(".eo-layer-list").insertAdjacentElement("afterend",tool);
 $("ea-point-toggle").addEventListener("change",e=>{showMarkers=e.target.checked;drawMarkers()});
 const tabs=document.createElement("div");tabs.className="ea-tabs";tabs.setAttribute("role","tablist");
 tabs.innerHTML='<button type="button" data-ea-tab="production" aria-selected="true" class="active">Producción</button><button type="button" data-ea-tab="climate" aria-selected="false">Agroclima</button><button type="button" data-ea-tab="reference" aria-selected="false">Referencia</button>';
 right.insertBefore(tabs,right.children[1]);
 tabs.addEventListener("click",e=>{const b=e.target.closest("[data-ea-tab]");if(!b)return;panel=b.dataset.eaTab;right.dataset.eaTab=panel;tabs.querySelectorAll("button").forEach(x=>{const yes=x===b;x.classList.toggle("active",yes);x.setAttribute("aria-selected",String(yes))})});
 const product=document.createElement("section");product.className="ea-product";
 product.innerHTML='<div class="ea-section-label">BALANCE PRODUCTIVO <b>DGSIAP</b></div><div class="ea-metrics"><div><span>PRODUCCIÓN</span><strong id="ea-volume">—</strong><small>Toneladas</small></div><div><span>COSECHADA</span><strong id="ea-harvest">—</strong><small>Hectáreas</small></div><div><span>SEMBRADA</span><strong id="ea-planted">—</strong><small>Hectáreas</small></div><div><span>VARIACIÓN ANUAL</span><strong id="ea-change">—</strong><small>En rendimiento</small></div></div><div class="ea-hist"><span>INTERVALO P25—P75</span><strong><b id="ea-p25">—</b> — <b id="ea-p75">—</b></strong></div><div id="ea-years" class="ea-year-count">—</div><p id="ea-source" class="ea-source">Fuente DGSIAP</p><p id="ea-production-scope" class="ea-source"></p>';
 document.querySelector(".eo-snapshot").insertAdjacentElement("afterend",product);
 const detail=document.createElement("div");detail.id="ea-reference-brief";detail.className="ea-reference-brief";detail.hidden=true;
 detail.innerHTML='<div class="ea-brief-header"><span>REFERENCIA MUNICIPAL 2025</span><strong id="ea-brief-name">—</strong></div><div class="ea-brief-grid"><div><span>SUPERFICIE</span><strong id="ea-brief-area">—</strong></div><div><span>PRODUCCIÓN</span><strong id="ea-brief-volume">—</strong></div><div><span>RENDIMIENTO</span><strong id="ea-brief-yield">—</strong></div></div><small>Referencia DGSIAP por municipio, no superficie de parcela.</small>';
 product.appendChild(detail);
 const climateSection=document.createElement("section");climateSection.className="ea-climate-section";
 climateSection.innerHTML='<div class="ea-section-label">HISTORIAL AGROCLIMÁTICO <b>NASA POWER</b></div><h3 id="ea-climate-title">Referencia municipal</h3><div class="ea-metrics"><div><span>T MEDIA</span><strong><b id="ea-temperature">—</b> °C</strong></div><div><span>LLUVIA</span><strong><b id="ea-rain">—</b> mm</strong></div><div><span>ET0</span><strong><b id="ea-et0">—</b> mm</strong></div><div><span>VPD</span><strong><b id="ea-vpd">—</b> kPa</strong></div><div><span>HUMEDAD</span><strong><b id="ea-humidity">—</b> %</strong></div><div><span>BALANCE</span><strong><b id="ea-balance">—</b> mm</strong></div></div><p id="ea-climate-source" class="ea-source"></p><p class="ea-disclaimer">Rejilla climática NASA POWER. No es medición de una parcela ni predicción de cosecha.</p>';
 product.insertAdjacentElement("afterend",climateSection);
 const reference=document.createElement("section");reference.className="ea-reference-section";
 reference.innerHTML='<div class="ea-section-label">GEOREFERENCIA <b>GEO</b></div><dl><dt>Estado</dt><dd id="ea-ref-state">—</dd><dt>Municipio</dt><dd id="ea-ref-place">—</dd><dt>Coordenadas</dt><dd id="ea-ref-point">—</dd><dt>Celda NASA</dt><dd id="ea-ref-grid">—</dd></dl><p id="ea-ref-year" class="ea-source"></p><p class="ea-disclaimer">Coordenadas municipales de referencia asociadas a cultivos observados; no parcelas agrícolas.</p>';
 climateSection.insertAdjacentElement("afterend",reference);
 const period=document.createElement("label");period.className="ea-period";period.innerHTML='PERIODO <select id="ea-period"><option value="annual">Anual</option><option value="monthly">Mensual (Sinaloa)</option></select>';
 document.querySelector(".eo-chart-header").appendChild(period);
 $("ea-period").addEventListener("change",e=>{resolution=e.target.value;renderChart()});
 $("eo-climate-variable")?.addEventListener("change",()=>{fillRight();renderChart()});
 $("eo-compare").addEventListener("change",e=>{if(isNational()){compareState=e.target.value;renderChart()}});
 $("eo-municipality-ranking").addEventListener("click",e=>{const b=e.target.closest("[data-ea-city]");if(b)selectNationalCity(b.dataset.eaCity)});
 const meta=document.querySelector(".eo-map-heading>div>span");if(meta){meta.id="eo-region-label";meta.textContent="SINALOA / MÉXICO"}
}
async function boot(){
 try{
  const [a,b]=await Promise.all([fetch("data/growa-nacional-10-estados-piloto.json").then(r=>{if(!r.ok)throw Error("Datos 10 estados: "+r.status);return r.json()}),fetch("data/clima-sinaloa-historico-2003-2025.json").then(r=>{if(!r.ok)throw Error("Datos climáticos: "+r.status);return r.json()})]);
  if(a.states?.length!==10||a.points?.length!==529||a.cropAnnual?.length!==3933||b.annual?.length!==414||b.monthly?.length!==4968)throw Error("Falló el control de integridad de datos");
  N=a;C=b;D=window.GrowaSinaloaData?.D;
  if(!D){
   await new Promise(resolve=>{
    const finish=()=>resolve();
    window.addEventListener("growa:data-ready",finish,{once:true});
    setTimeout(finish,20000);
   });
   D=window.GrowaSinaloaData?.D;
  }
  if(!D)throw Error("La base DGSIAP no terminó de cargarse");
  a.points.forEach(x=>pointIndex.set(x[0],x));
  a.cropAnnual.forEach(x=>annual.set(x[0]+"|"+x[1]+"|"+x[2],x));
  a.climateAnnual.forEach(x=>climate.set(x[0]+"|"+x[1],x));
  b.annual.forEach(x=>climateS.set(x[0]+"|"+x[1],x));
  b.monthly.forEach(x=>monthlyS.set(x[0]+"|"+x[1]+"|"+x[2],x));
  createUI();
  const climateHUD=$("eo-climate-hud");if(climateHUD)climateHUD.hidden=isNational();
  leaf=window.GrowaEOMap?.getLeaflet?.()||null;
  window.addEventListener("growa:eo-change",onEOState);
  onEOState();drawMarkers();renderMapTelemetry();
  text("eo-data-status","10 estados · 529 puntos · 22 cultivos");
 }catch(err){console.warn("GROWA national extension:",err);const x=document.querySelector(".eo-left-foot span:nth-child(2)");if(x)x.textContent="Sinaloa disponible · extensión: "+err.message}
}
window.GrowaAdvanced={active:ready,isNational,selectNationalCity,renderChart,hoverChart,clickChart,exportCSV,attachMap:setMap,onEOState,renderNationalRanking:fillRight,updateMap:drawMarkers,setMapHealth,getMapHealth:()=>mapHealth,renderMapTelemetry,fitRegion,zoomFallback,resetFallback,panFallback,toggleRaster,retryRaster};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();