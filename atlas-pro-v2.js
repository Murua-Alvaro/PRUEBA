/* GROWA · Atlas de inteligencia agrícola, edición institucional 2026.
 * Datos económicos: DGSIAP 2003–2025 en paquete existente. Cartografía: INEGI,
 * geometrías históricas simplificadas alojadas en /data (origen elbic).
 * Motor cartográfico: Leaflet (BSD-2-Clause), base OpenStreetMap / CARTO.
 * No se atribuye la cobertura satelital 2021 a cultivos concretos ni a 2025.
 */
(function(){
"use strict";
const $$=(e,s)=>e.querySelector(s);
const all=(e,s)=>Array.from(e.querySelectorAll(s));
const N=new Intl.NumberFormat("es-MX",{maximumFractionDigits:1});
const N0=new Intl.NumberFormat("es-MX",{maximumFractionDigits:0});
const sign=n=>n>0?"+":"";
const encode=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const SLUG=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const YEARS=Array.from({length:23},(_,i)=>2025-i);
const PALETTE=["#edf3f0","#c8ded5","#8cb8a7","#477f70","#164b44"];
const DIVERGE=["#a34f56","#d6a1a2","#ecedef","#8ebbac","#277461"];
const region=[[-110.3,22.1],[-105.1,27.9]];
const state=Object.fromEntries(["territorio","cultivos"].map(kind=>[kind,{kind,year:2025,crop:kind==="cultivos"?"Maíz grano":"",metric:"value",layer:"municipal",focus:"",side:"focus",compA:"Culiacán",compB:"Guasave",showBorders:true,map:null,geo:null,selected:null,rows:[],byName:new Map(),max:0,initialized:false,tiles:null,base:null}]));
let D, GEO, initialized=false;
function recs(s,year=s.year,crop=s.crop){
 return (crop?D.crops:D.municipalities).filter(r=>r.year===year&&(!crop||r.name===crop));
}
function figure(s,year=s.year,crop=s.crop,metric=s.metric){
 const arr=recs(s,year,crop);
 const key=metric==="planted"?(crop?"planted":"area"):metric==="harvest"?"harvest":"value";
 const m=new Map();for(const r of arr){const k=crop?r.municipio:r.name;m.set(k,(m.get(k)||0)+(Number(r[key])||0));}
 if(metric==="growth"){
  const old=figure(s,year-1,crop,"value");
  const actual=figure(s,year,crop,"value");
  const growth=new Map();
  for(const [key,v] of actual)if(old.has(key)&&old.get(key)>0)growth.set(key,100*(v/old.get(key)-1));
  return growth;
 }
 return m;
}
const unit=m=>m==="value"?"MDP":m==="growth"?"%":"ha";
const fmt=(v,m)=>!Number.isFinite(v)?"Sin registro":(m==="growth"?(sign(v)+N.format(v)+" %"):N.format(v)+" "+unit(m));
function sourceFor(s){return s.crop?D.crops:D.municipalities;}
function distinctCount(s){return figure(s).size;}
function totalFor(s){return [...figure(s,""+s.year,s.crop,s.metric==="growth"?"value":s.metric).values()].reduce((a,b)=>a+b,0);}
function quantile(v,p){if(!v.length)return 0;const ix=(v.length-1)*p,lo=Math.floor(ix),hi=Math.ceil(ix);return v[lo]+(v[hi]-v[lo])*(ix-lo);}
function thresholds(map){const a=[...map.values()].filter(Number.isFinite).sort((x,y)=>x-y);return [0,.2,.4,.6,.8,1].map(p=>quantile(a,p));}
function scaleFor(s,val){
 if(val===undefined)return "#e8eae6";
 const lim=s.cut;
 if(s.metric==="growth"){if(val<0)return val<(-15)?DIVERGE[0]:DIVERGE[1];if(val>0)return val>15?DIVERGE[4]:DIVERGE[3];return DIVERGE[2];}
 let i=0;while(i<4&&val>lim[i+1])i++;return PALETTE[i];
}
function chartSVG(s,name){
 const years=YEARS.slice().reverse();
 const entries=years.map(y=>({y,v:figure(s,y).get(name)})).filter(r=>Number.isFinite(r.v));
 if(entries.length<2)return '<p class="ap-empty">No hay suficientes cierres comparables para construir una trayectoria.</p>';
 const yvals=entries.map(r=>r.v),vmin=Math.min(0,...yvals),vmax=Math.max(1,...yvals);
 const x=y=>24+(y-2003)/22*258,yy=v=>102-(v-vmin)/(vmax-vmin)*84;
 const d=entries.map((r,i)=>(i?"L":"M")+x(r.y).toFixed(2)+" "+yy(r.v).toFixed(2)).join(" ");
 const area=d+" L"+x(entries.at(-1).y)+" 105 L"+x(entries[0].y)+" 105 Z";
 return '<svg class="ap-spark" viewBox="0 0 305 133" role="img" aria-label="Evolución del indicador entre 2003 y 2025">'+
 '<path d="M20 105H288" fill="none" stroke="#e1e6e2" stroke-width="1"/>'+
 '<path d="'+area+'" fill="#d7e5df" fill-opacity=".78"/>'+
 '<path d="'+d+'" fill="none" stroke="#236457" stroke-width="2.25" stroke-linejoin="round"/>'+
 entries.map((r,i)=>i===0||i===entries.length-1?'<circle cx="'+x(r.y)+'" cy="'+yy(r.v)+'" r="3.3" fill="#236457" stroke="#fff" stroke-width="1.7"/>':'').join("")+
 '<text x="20" y="126">2003</text><text x="286" y="126" text-anchor="end">2025</text>'+
 '<text x="286" y="12" text-anchor="end">'+encode(fmt(vmax,s.metric))+'</text></svg>';
}
function moduleHTML(s){
 const title=s.kind==="territorio"?"Explorador territorial":"Geografía de la producción";
 const sub=s.kind==="territorio"?"Distribución municipal, especialización y transformaciones agrícolas.":"Localización económica de los cultivos, superficie y evolución entre municipios.";
 return '<div class="ap-section">'+
 '<div class="ap-titlebar"><div><div class="ap-overline">GROWA / INTELIGENCIA AGRÍCOLA <span>—</span> ATLAS 01</div><h3>'+title+'</h3><p>'+sub+'</p></div><div class="ap-head-tools"><span class="ap-data-state"><i></i> SERIE VALIDADA DGSIAP</span><button type="button" data-ap-details="true">Análisis completo <span aria-hidden="true">↗</span></button></div></div>'+
 '<div class="ap-tabs" role="group" aria-label="Vistas del atlas"><button type="button" data-ap-tab="municipal" class="is-active" aria-pressed="true">01 <strong>Producción municipal</strong></button><button type="button" data-ap-tab="cover" aria-pressed="false">02 <strong>Cobertura del suelo</strong></button><span class="ap-tab-muted">APTITUD AGROECOLÓGICA <i>EN PREPARACIÓN</i></span></div>'+
 '<div class="ap-filters"><label><span>AÑO AGRÍCOLA</span><select data-ap-year></select></label><label class="ap-crop-select"><span>TIPO DE CULTIVO</span><select data-ap-crop></select></label><label><span>INDICADOR ECONÓMICO</span><select data-ap-metric><option value="value">Valor de producción</option><option value="harvest">Superficie cosechada</option><option value="planted">Superficie sembrada</option><option value="growth">Variación anual del valor (%)</option></select></label><button class="ap-export" type="button" data-ap-export aria-label="Descargar los datos de la consulta"><span aria-hidden="true">↓</span> Exportar CSV</button></div>'+
 '<div class="ap-stats"><div><span>ÁMBITO</span><strong>Sinaloa</strong><small>18 municipios históricos</small></div><div><span data-ap-kpi-label>VALOR TOTAL OBSERVADO</span><strong data-ap-total>—</strong><small data-ap-total-sub>Datos registrados</small></div><div><span>COBERTURA MUNICIPAL</span><strong data-ap-count>—</strong><small>Con registros en la selección</small></div><div><span>FUENTE ESTADÍSTICA</span><strong>DGSIAP</strong><small>Serie municipal 2003–2025</small></div></div>'+
 '<div class="ap-main"><div class="ap-map-col"><div class="ap-map-top"><div><div class="ap-overline">VISUALIZADOR GEOESTADÍSTICO</div><strong data-ap-map-heading>Valor bruto de producción · 2025</strong></div><div class="ap-map-actions"><button type="button" data-ap-reset title="Regresar al encuadre estatal">Encuadre estatal ⤢</button><button type="button" data-ap-borders aria-pressed="true" title="Mostrar u ocultar límites municipales">Límites: sí</button></div></div><div class="ap-map-frame"><div class="ap-map" data-ap-map role="application" aria-label="Mapa interactivo de los 18 municipios de Sinaloa"></div><div class="ap-map-corner"><span class="ap-map-dot"></span> SINALOA, MÉXICO <span>25° N / 107° O</span></div><div class="ap-cover-chip" data-ap-cover-chip hidden>ESA WORLDCOVER 2021 · RESOLUCIÓN 10 M</div></div><div class="ap-legend" data-ap-legend></div></div>'+
 '<aside class="ap-side"><div class="ap-side-tabs"><button data-ap-side="focus" type="button" class="is-active">Ficha</button><button data-ap-side="rank" type="button">Clasificación</button><button data-ap-side="compare" type="button">Comparar</button></div><div class="ap-side-content"><div class="ap-side-focus" data-ap-focus></div><div class="ap-side-ranking" data-ap-ranking hidden></div><div class="ap-side-comparison" data-ap-compare-panel hidden></div></div><div class="ap-side-bottom"><button type="button" data-ap-open-detail>Ver expediente territorial <span>↗</span></button></div></aside></div>'+
 '<div class="ap-extras"><div class="ap-extra"><strong><span>01.</span> Geometría municipal</strong><p>18 municipios históricos, límites generalizados derivados de datos geoestadísticos. No refleja necesariamente la delimitación de municipios nuevos.</p></div><div class="ap-extra"><strong><span>02.</span> Evidencia productiva</strong><p>Valores DGSIAP en pesos corrientes. Las hectáreas sumadas por ciclos agrícolas no corresponden necesariamente a parcelas únicas.</p></div><div class="ap-extra"><strong><span>03.</span> Aptitud potencial</strong><p>FAO GAEZ evalúa aptitud biofísica; los rásteres de aptitud aún no se han incorporado. <a href="https://www.fao.org/gaez/en" target="_blank" rel="noopener">Consultar GAEZ ↗</a></p></div></div>'+
 '<div class="ap-bottom-line"><span>GROWA RESEARCH / OBSERVATORIO AGRÍCOLA</span><span>PRODUCCIÓN MUNICIPAL ≠ COBERTURA AGRÍCOLA ≠ APTITUD FUTURA</span></div>'+
 '</div>';
}
function populate(s){
 const root=s.root;
 $$(root,"[data-ap-year]").innerHTML=YEARS.map(y=>'<option value="'+y+'">'+y+'</option>').join("");
 const allCrops=D.crops.filter(r=>r.year===2025),top=new Map();
 allCrops.forEach(r=>top.set(r.name,(top.get(r.name)||0)+r.value));
 const sorted=D.cropNames.slice().sort((a,b)=>(top.get(b)||0)-(top.get(a)||0)||a.localeCompare(b,"es"));
 $$(root,"[data-ap-crop]").innerHTML='<option value="">Todos los cultivos</option>'+sorted.map(v=>'<option value="'+encode(v)+'">'+encode(v)+'</option>').join("");
 $$(root,"[data-ap-year]").value=s.year;
 $$(root,"[data-ap-crop]").value=s.crop;
}
function bind(s){
 const root=s.root;
 for(const [selector,key] of [["[data-ap-year]","year"],["[data-ap-crop]","crop"],["[data-ap-metric]","metric"]]){
  $$(root,selector).addEventListener("change",e=>{s[key]=key==="year"?+e.target.value:e.target.value;if(key==="crop")s.focus="";render(s);});
 }
 all(root,"[data-ap-tab]").forEach(b=>b.addEventListener("click",()=>{s.layer=b.dataset.apTab;render(s);}));
 all(root,"[data-ap-side]").forEach(b=>b.addEventListener("click",()=>{s.side=b.dataset.apSide;paintSide(s);}));
 $$(root,"[data-ap-reset]").addEventListener("click",()=>{if(s.map&&s.geo)s.map.fitBounds(s.geo.getBounds().pad(.055),{padding:[25,25],animate:true});});
 $$(root,"[data-ap-borders]").addEventListener("click",e=>{s.showBorders=!s.showBorders;e.currentTarget.textContent="Límites: "+(s.showBorders?"sí":"no");e.currentTarget.setAttribute("aria-pressed",String(s.showBorders));styleFeatures(s);});
 $$(root,"[data-ap-export]").addEventListener("click",()=>download(s));
 $(root,"[data-ap-ranking]").addEventListener("click",e=>{
  const b=e.target.closest("[data-ap-select]");if(b)select(s,b.dataset.apSelect,true);
 });
 $(root,"[data-ap-compare-panel]").addEventListener("change",e=>{
  if(e.target.dataset.apComparison==="a")s.compA=e.target.value;
  if(e.target.dataset.apComparison==="b")s.compB=e.target.value;
  paintSide(s);
 });
 $(root,"[data-ap-compare-panel]").addEventListener("click",e=>{
  if(e.target.closest("[data-ap-switch]")){const tmp=s.compA;s.compA=s.compB;s.compB=tmp;paintSide(s);}
 });
 $$(root,"[data-ap-details]").addEventListener("click",()=>openDetail(s));
 $$(root,"[data-ap-open-detail]").addEventListener("click",()=>openDetail(s));
}
function download(s){
 const cur=figure(s),prior=figure(s,s.year-1,s.crop,s.metric==="growth"?"value":s.metric),payload=[...cur].sort((a,b)=>b[1]-a[1]).map(([municipio,indicador])=>({
  municipio,anio:s.year,cultivo:s.crop||"Todos los cultivos",indicador:s.metric,valor:+indicador.toFixed(6),
  unidad:unit(s.metric),valor_prev_anio:prior.get(municipio)??"",
  fuente:"DGSIAP / elaboración Growa",cobertura:"Municipio, no parcela"
 }));
 if(window.GrowaDownloadCSV)window.GrowaDownloadCSV("growa_atlas_"+s.kind+"_"+s.year+".csv",payload);
 else {
  const columns=Object.keys(payload[0]||{}),escape=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
  const content=[columns.join(","),...payload.map(r=>columns.map(k=>escape(r[k])).join(","))].join("\r\n");
  const a=document.createElement("a"),url=URL.createObjectURL(new Blob(["\uFEFF"+content],{type:"text/csv;charset=utf-8"}));
  a.href=url;a.download="growa_atlas_"+s.kind+"_"+s.year+".csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
 }
}
function openDetail(s){
 s.root.closest(".gx-page")?.classList.add("atlas-deep-open");
 const section=s.root.closest(".gx-page");
 if(s.kind==="territorio"&&window.GrowaExplorer){
  window.GrowaExplorer.openState("Sinaloa",s.focus||undefined);
 }else if(window.GrowaExplorer){
  window.GrowaExplorer.openCrop("sinaloa",s.crop||"Maíz grano");
 }
 if(section){const w=$$(section,".gx-workspace");if(w){w.scrollIntoView({behavior:"smooth",block:"start"});}}
}
function makeMap(s){
 if(!window.L){$$(s.root,"[data-ap-map]").textContent="El motor cartográfico Leaflet no está disponible.";return;}
 s.map=L.map($$(s.root,"[data-ap-map]"),{zoomControl:false,preferCanvas:true,scrollWheelZoom:false,attributionControl:true,minZoom:6,maxZoom:15});
 L.control.zoom({position:"bottomleft"}).addTo(s.map);
 s.base=L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{subdomains:"abcd",maxZoom:19,attribution:"© OpenStreetMap contributors · © CARTO"}).addTo(s.map);
 s.map.fitBounds([[22.35,-110.18],[27.18,-105.35]],{padding:[8,8]});
 s.map.createPane("apCover");s.map.getPane("apCover").style.zIndex="380";s.map.getPane("apCover").style.pointerEvents="none";
 s.cover=L.tileLayer.wms("https://mapproxy.terrascope.be/mapproxy/service",{
  layers:"esa-worldcover-map-10m-2021-v2_map",format:"image/png",version:"1.1.1",transparent:true,
  opacity:.60,pane:"apCover",attribution:"© ESA WorldCover 2021 / Contains modified Copernicus Sentinel data (2021)"
 });
 s.cover.on("tileerror",()=>{if(s.layer==="cover"){$$(s.root,"[data-ap-cover-chip]").textContent="Servicio ESA temporalmente no disponible";}});
 fetch("./data/sinaloa-18-municipios.geojson").then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json();}).then(j=>{
  if(j.type!=="FeatureCollection"||j.features.length!==18)throw Error("Geometría fuera del contrato de 18 municipios");
  const names=new Set(j.features.map(f=>f.properties.name));
  for(const n of D.muniNames)if(!names.has(n))throw Error("Municipio sin geometría: "+n);
  s.geo=L.geoJSON(j,{style:f=>featureStyle(s,f.properties.name),onEachFeature:(f,layer)=>{
   const name=f.properties.name;
   layer.on("mouseover",()=>{if(s.showBorders)layer.setStyle({weight:2,color:"#1f3d35"});});
   layer.on("mouseout",()=>styleFeatures(s));
   layer.on("click",()=>select(s,name,false));
   layer.bindTooltip(()=>tooltip(s,name),{sticky:true,direction:"top",opacity:.98,className:"ap-map-tooltip"});
  }}).addTo(s.map);
  s.polygons=new Map();
  s.geo.eachLayer(l=>s.polygons.set(l.feature.properties.name,l));
  s.map.fitBounds(s.geo.getBounds().pad(.035),{padding:[20,20]});
  if(!s.focus||!s.polygons.has(s.focus))s.focus=s.kind==="territorio"?"Culiacán":"Culiacán";
  render(s);
 }).catch(error=>{
  console.error("GROWA/Atlas: límites",error);
  $$(s.root,"[data-ap-map]").setAttribute("data-map-issue","true");
  $$(s.root,"[data-ap-legend]").innerHTML="<strong>Cartografía municipal no disponible.</strong> Se conservan los indicadores DGSIAP y la consulta tabular.";
 });
}
function featureStyle(s,name){
 const val=s.byName.get(name);return {
  color:s.showBorders?(s.focus===name?"#153b34":"#fff"):"transparent",weight:s.showBorders?(s.focus===name?2.8:1.25):0,
  fillColor:s.layer==="cover"?"#e2e7e0":scaleFor(s,val),fillOpacity:s.layer==="cover"?.08:s.focus===name?.86:.76
 };
}
function tooltip(s,name){
 const val=s.byName.get(name);
 return '<span class="ap-tooltip-name">'+encode(name)+'</span><span class="ap-tooltip-value">'+encode(fmt(val,s.metric))+'</span><span class="ap-tooltip-detail">'+encode(s.crop||"Todos los cultivos")+' / '+s.year+'</span>';
}
function styleFeatures(s){
 if(!s.polygons)return;
 for(const [name,lyr] of s.polygons)lyr.setStyle(featureStyle(s,name));
}
function select(s,name,fly){
 if(!s.polygons?.has(name))return;
 if(s.side==="compare"){s.compB=name;}else{s.focus=name;s.side="focus";}
 paintSide(s);styleFeatures(s);
 if(fly)s.map.flyToBounds(s.polygons.get(name).getBounds(),{padding:[50,50],maxZoom:9.25,duration:.65});
}
function legend(s){
 if(s.layer==="cover"){
  return '<div class="ap-legend-desc"><span class="ap-legend-dot" style="background:#f096ff"></span><strong>Terreno agrícola</strong> · clase 40 en ESA WorldCover 2021. <span class="ap-legend-sub">Mapa completo de coberturas: el color violeta corresponde a cultivos; otros colores representan vegetación, agua, ciudades y otras clases.</span></div><a target="_blank" rel="noopener" href="https://esa-worldcover.org/en/data-access">Metadatos ↗</a>';
 }
 if(s.metric==="growth"){
  const labels=["≤ −15 %","−15 a 0 %","0 %","0 a 15 %","≥ 15 %"];
  return '<span class="ap-legend-title">Variación nominal interanual</span><div class="ap-legend-swatches">'+DIVERGE.map((c,i)=>'<div><i style="background:'+c+'"></i><span>'+labels[i]+'</span></div>').join("")+'</div><span class="ap-legend-units">Porcentaje</span>';
 }
 const breaks=s.cut||[];
 return '<span class="ap-legend-title">Escala municipal · '+encode(unit(s.metric))+'</span><div class="ap-legend-swatches">'+PALETTE.map((c,i)=>'<div><i style="background:'+c+'"></i><span>'+N.format(breaks[i]??0)+'–'+N.format(breaks[i+1]??0)+'</span></div>').join("")+'</div><span class="ap-legend-units">Quintiles observados</span>';
}
function setTiles(s){
 const visible=s.layer==="cover";
 if(visible&&!s.map.hasLayer(s.cover))s.cover.addTo(s.map);
 if(!visible&&s.map.hasLayer(s.cover))s.map.removeLayer(s.cover);
 const chip=$$(s.root,"[data-ap-cover-chip]");chip.hidden=!visible;
 if(visible)chip.textContent="ESA WORLDCOVER 2021 · 10 METROS · TODAS LAS CLASES";
 all(s.root,"[data-ap-tab]").forEach(b=>{
  const active=b.dataset.apTab===s.layer;b.classList.toggle("is-active",active);b.setAttribute("aria-pressed",String(active));
 });
}
function trendMetric(s,territory){
 const annual=YEARS.slice().reverse().map(y=>({year:y,v:figure(s,y,s.crop,s.metric==="growth"?"value":s.metric).get(territory)}));
 const observed=annual.filter(v=>Number.isFinite(v.v));
 const previous=annual.find(r=>r.year===s.year-1)?.v,current=annual.find(r=>r.year===s.year)?.v;
 const diff=Number.isFinite(previous)&&previous!==0&&Number.isFinite(current)?100*(current/previous-1):null;
 return {count:observed.length,change:diff};
}

function comparisonSVG(s,a,b){
 const metric=s.metric==="growth"?"value":s.metric,years=YEARS.slice().reverse();
 const line=name=>years.map(y=>({year:y,value:figure(s,y,s.crop,metric).get(name)})).filter(r=>Number.isFinite(r.value));
 const sa=line(a),sb=line(b),both=[...sa,...sb].map(r=>r.value);
 if(both.length<2)return '<p class="ap-empty">No hay cierres suficientes para esta comparación.</p>';
 const low=Math.min(0,...both),high=Math.max(1,...both);
 const x=y=>18+(y-2003)/22*272,yy=v=>99-((v-low)/(high-low))*81;
 const path=rows=>rows.map((r,i)=>(i?'L':'M')+x(r.year).toFixed(1)+' '+yy(r.value).toFixed(1)).join(' ');
 return '<svg class="ap-compare-svg" viewBox="0 0 307 126" role="img" aria-label="Dos trayectorias de la serie municipal 2003–2025">'+
 '<path d="M16 102 H290" stroke="#e3e9e4" stroke-width="1" fill="none"/>'+
 '<path d="'+path(sa)+'" fill="none" stroke="#2b7862" stroke-width="2.2" stroke-linecap="round"/>'+
 '<path d="'+path(sb)+'" fill="none" stroke="#bd885d" stroke-width="2.2" stroke-linecap="round"/>'+
 '<text x="18" y="120">2003</text><text x="290" y="120" text-anchor="end">2025</text></svg>';
}
function paintComparison(s){
 const panel=$(s.root,"[data-ap-compare-panel]");
 const names=D.muniNames;
 if(!names.includes(s.compA))s.compA=names[0];
 if(!names.includes(s.compB))s.compB=names[1];
 const selector=(k,current)=>'<label>'+ (k==="a"?"MUNICIPIO A":"MUNICIPIO B")+
 '<select data-ap-comparison="'+k+'">'+names.map(name=>'<option value="'+encode(name)+'"'+(name===current?' selected':'')+'>'+encode(name)+'</option>').join('')+'</select></label>';
 const av=s.byName.get(s.compA),bv=s.byName.get(s.compB);
 const delta=Number.isFinite(av)&&Number.isFinite(bv)?av-bv:null;
 panel.innerHTML='<div class="ap-compare-head"><div class="ap-overline">COMPARACIÓN DIRECTA</div><h4>Dos territorios,<br>una misma escala.</h4><p>Contraste reproducible de municipios con el mismo indicador, cultivo y año.</p></div>'+
 '<div class="ap-compare-select">'+selector("a",s.compA)+'<button type="button" data-ap-switch aria-label="Intercambiar municipios">⇄</button>'+selector("b",s.compB)+'</div>'+
 '<div class="ap-compare-values"><div><i></i><span>'+encode(s.compA)+'</span><strong>'+encode(fmt(av,s.metric))+'</strong></div><div><i></i><span>'+encode(s.compB)+'</span><strong>'+encode(fmt(bv,s.metric))+'</strong></div></div>'+
 '<div class="ap-compare-gap"><span>DIFERENCIA (A MENOS B)</span><strong>'+encode(fmt(delta,s.metric))+'</strong></div>'+
 '<div class="ap-chart-head"><strong>Trayectorias comparadas</strong><span>2003—2025</span></div>'+
 comparisonSVG(s,s.compA,s.compB)+
 '<p class="ap-compare-foot">Comparación descriptiva. Los pesos son nominales y las superficies corresponden a registros por cultivo y ciclo; una divergencia no implica causalidad.</p>';
}
function paintSide(s){
 const focus=$(s.root,"[data-ap-focus]"),rank=$(s.root,"[data-ap-ranking]"),compare=$(s.root,"[data-ap-compare-panel]");
 const n=s.focus||s.rows[0]?.[0]||"";
 const val=s.byName.get(n),sum=s.metric==="growth"?null:[...s.byName.values()].reduce((t,v)=>t+v,0);
 const share=val!==undefined&&sum>0?100*val/sum:null;
 const trend=trendMetric(s,n);
 focus.innerHTML=
 '<div class="ap-panel-head"><div class="ap-overline">PERFIL TERRITORIAL / '+s.year+'</div><h4>'+encode(n||"Sin selección")+'</h4><p>'+encode(s.crop||"Producción agrícola total")+'</p></div>'+
 '<div class="ap-panel-value"><span>'+encode(s.metric==="growth"?"CAMBIO RESPECTO AL AÑO ANTERIOR":s.metric==="value"?"VALOR AGRÍCOLA NOMINAL":"SUPERFICIE REGISTRADA")+'</span><strong>'+fmt(val,s.metric)+'</strong></div>'+
 '<div class="ap-panel-facts"><div><span>PARTICIPACIÓN EN LA SELECCIÓN</span><strong>'+ (share===null?"—":N.format(share)+" %")+'</strong></div><div><span>VARIACIÓN INTERANUAL</span><strong class="'+(trend.change!==null&&trend.change<0?"ap-negative":"")+'">'+(trend.change===null?"—":sign(trend.change)+N.format(trend.change)+" %")+'</strong></div></div>'+
 '<div class="ap-chart-head"><strong>Serie histórica municipal</strong><span>2003—2025</span></div>'+
 chartSVG(s,n)+
 '<div class="ap-chart-foot">'+trend.count+' cierres disponibles. La gráfica representa el indicador elegido'+(s.metric==="growth"?" y para su trayectoria el valor base":"")+'.</div>';
 const max=Math.max(1,...s.rows.map(r=>s.metric==="growth"?Math.abs(r[1]):r[1]));
 rank.innerHTML='<div class="ap-rank-intro"><strong>Municipios por '+(s.metric==="growth"?"cambio anual":s.metric==="value"?"valor económico":"superficie")+'</strong><small>'+s.year+' · '+encode(s.crop||"Todos los cultivos")+'</small></div>'+
 s.rows.map(([name,v],i)=>'<button class="ap-rank-item'+(name===s.focus?" is-selected":"")+'" type="button" data-ap-select="'+encode(name)+'"><div><small>'+String(i+1).padStart(2,"0")+'</small><strong>'+encode(name)+'</strong><span>'+encode(fmt(v,s.metric))+'</span></div><i><b style="width:'+Math.min(100,Math.abs(v)/max*100).toFixed(1)+'%"></b></i></button>').join("");
 all(s.root,"[data-ap-side]").forEach(b=>b.classList.toggle("is-active",b.dataset.apSide===(s.side||"focus")));
 focus.hidden=(s.side||"focus")!=="focus";rank.hidden=(s.side||"focus")!=="rank";compare.hidden=(s.side||"focus")!=="compare";if(!compare.hidden)paintComparison(s);
 $$(s.root,"[data-ap-open-detail]").textContent=s.kind==="territorio"?"Abrir expediente municipal ↗":"Abrir análisis del cultivo ↗";
}
function render(s){
 if(!s.initialized)return;
 s.byName=figure(s);s.cut=thresholds(s.byName);
 s.rows=[...s.byName].filter(x=>Number.isFinite(x[1])).sort((a,b)=>b[1]-a[1]);
 const currentTotal=s.metric==="growth"?null:s.rows.reduce((t,r)=>t+r[1],0);
 $$(s.root,"[data-ap-total]").textContent=currentTotal===null?"Cambio anual":fmt(currentTotal,s.metric);
 $$(s.root,"[data-ap-kpi-label]").textContent=s.metric==="growth"?"LECTURA ACTIVA":"TOTAL DE LA SELECCIÓN";
 $$(s.root,"[data-ap-total-sub]").textContent=s.metric==="growth"?"Variación calculada por municipio":s.crop?encode(s.crop)+" · "+s.year:"Registro económico del cierre "+s.year;
 $$(s.root,"[data-ap-count]").textContent=s.rows.length+" / 18";
 $$(s.root,"[data-ap-map-heading]").textContent=(s.metric==="value"?"Valor bruto de producción":s.metric==="growth"?"Variación anual del valor":s.metric==="planted"?"Superficie sembrada":"Superficie cosechada")+" · "+s.year;
 if(s.rows.length&&!s.byName.has(s.focus))s.focus=s.rows[0][0];
 if(!s.rows.length)s.focus="";
 $$(s.root,"[data-ap-legend]").innerHTML=legend(s);
 setTiles(s);styleFeatures(s);paintSide(s);
 requestAnimationFrame(()=>s.map?.invalidateSize(false));
}
function create(s){
 s.root=document.querySelector('[data-pro-atlas="'+s.kind+'"]');
 if(!s.root)return;
 s.root.innerHTML=moduleHTML(s);
 populate(s);bind(s);s.initialized=true;
 makeMap(s);render(s);
}
function init(){
 if(initialized||!window.GrowaSinaloaData?.D)return;
 initialized=true;
 D=window.GrowaSinaloaData.D;
 create(state.territorio);create(state.cultivos);
 document.addEventListener("click",e=>{
  const target=e.target.closest(".navigation button, [data-tab], [data-gx-entity], [data-gx-crop]");
  if(target)requestAnimationFrame(()=>{Object.values(state).forEach(s=>s.map?.invalidateSize(false));});
 });
 window.addEventListener("resize",()=>Object.values(state).forEach(s=>s.map?.invalidateSize(false)));
 // Conserva los filtros del explorador detallado y del atlas como espacios independientes:
 // la fuente de datos siempre es la misma, sin mutar el paquete de investigación.
 window.GrowaAtlas=Object.freeze({getState:kind=>{const s=state[kind];return s?{year:s.year,crop:s.crop,metric:s.metric,layer:s.layer,focus:s.focus}:null;}});
}
window.addEventListener("growa:data-ready",init);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();