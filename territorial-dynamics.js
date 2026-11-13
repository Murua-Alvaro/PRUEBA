/* GROWA Earth Intelligence | Productive surface dynamics
   DGSIAP harvested hectares, annual differences; NOT satellite land cover or land conversion. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const clean=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const safe=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nf=new Intl.NumberFormat("es-MX",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("es-MX",{maximumFractionDigits:1});
const number=n=>Number.isFinite(n)?nf.format(Math.abs(n)):"—";
const signed=n=>Number.isFinite(n)?(n>0?"+":n<0?"−":"")+number(n):"—";
const signedPct=n=>Number.isFinite(n)?(n>0?"+":"")+pct.format(n)+" %":"—";
let start=2020,view="territory",lastSnapshot=null,totals=null,byMunicipality=null,nationalIndex=null;
const national=()=>window.GrowaBundledNational?.national;
function buildIndexes(){
 if(totals&&byMunicipality&&nationalIndex)return;
 const D=window.GrowaSinaloaData?.D,N=national();
 if(!D?.crops?.length||!N)return;
 totals=new Map();byMunicipality=new Map();nationalIndex=new Map();
 for(const r of D.crops){
  const area=Number(r.harvest);if(!Number.isFinite(area)||area<0)continue;
  const crop=clean(r.name),city=clean(r.municipio),key=r.year+"|"+crop,municipalKey=key+"|"+city;
  totals.set(key,(totals.get(key)||0)+area);
  byMunicipality.set(municipalKey,(byMunicipality.get(municipalKey)||0)+area);
 }
 for(const r of N.cropAnnual){
  const state=N.states[r[0]],crop=N.crops[r[1]],area=Number(r[3]);
  if(state&&crop&&Number.isFinite(area)&&area>=0)nationalIndex.set(r[2]+"|"+state+"|"+crop,area);
 }
}
function context(){
 const state=$("ea-state")?.value||"Sinaloa";
 return {state,city:state==="Sinaloa"?($("eo-city")?.value||""):"",crop:$("eo-crop")?.value||"",year:Number($("eo-year")?.value||2025)};
}
function area(ctx,year,city=ctx.city){
 if(!totals)return null;
 const key=year+"|"+clean(ctx.crop);
 const val=ctx.state==="Sinaloa"?(city?byMunicipality.get(key+"|"+clean(city)):totals.get(key)):nationalIndex.get(year+"|"+ctx.state+"|"+ctx.crop);
 return Number.isFinite(val)?val:null;
}
function annual(ctx,from,to){
 const a=[];for(let y=from;y<=to;y++)a.push({year:y,area:area(ctx,y)});return a;
}
function calculate(ctx,from){
 const rows=annual(ctx,from,ctx.year),first=rows[0]?.area,last=rows[rows.length-1]?.area;
 const complete=rows.length>=2&&rows.every(r=>r.area!==null);
 let gained=0,lost=0,inc=null,dec=null;
 if(complete){
  for(let i=1;i<rows.length;i++){
   const delta=rows[i].area-rows[i-1].area;
   if(delta>0){gained+=delta;if(!inc||delta>inc.delta)inc={delta,year:rows[i].year}}
   if(delta<0){lost+=-delta;if(!dec||delta<dec.delta)dec={delta,year:rows[i].year}}
  }
 }
 const net=first!==null&&last!==null&&rows.length>1?last-first:null;
 const percent=net!==null&&first>0?net/first*100:null;
 let expansion=inc?{label:(inc.year-1)+" → "+inc.year,detail:signed(inc.delta)+" ha",year:inc.year}:null;
 let contraction=dec?{label:(dec.year-1)+" → "+dec.year,detail:signed(dec.delta)+" ha",year:dec.year}:null;
 if(ctx.state==="Sinaloa"&&!ctx.city){
  const D=window.GrowaSinaloaData?.D;
  const cities=[...new Set((D?.crops||[]).filter(x=>clean(x.name)===clean(ctx.crop)).map(x=>x.municipio).filter(Boolean))];
  const changes=cities.map(city=>({city,first:area(ctx,from,city),last:area(ctx,ctx.year,city)})).filter(x=>x.first!==null&&x.last!==null).map(x=>({city:x.city,delta:x.last-x.first}));
  const pos=changes.filter(x=>x.delta>0).sort((a,b)=>b.delta-a.delta)[0];
  const neg=changes.filter(x=>x.delta<0).sort((a,b)=>a.delta-b.delta)[0];
  if(pos)expansion={label:pos.city,detail:signed(pos.delta)+" ha",city:pos.city};
  if(neg)contraction={label:neg.city,detail:signed(neg.delta)+" ha",city:neg.city};
 }
 return {ctx,from,rows,first,last,complete,gained,lost,net,percent,expansion,contraction};
}
function chart(rows){
 const recent=rows.slice(-7).filter(r=>r.area!==null);
 if(!recent.length)return '<div class="ea-ficha-empty">Sin observaciones para graficar.</div>';
 const max=Math.max(...recent.map(r=>r.area)),min=Math.min(...recent.map(r=>r.area));
 return '<div class="ea-ficha-mini" role="img" aria-label="Últimos cierres de superficie cosechada en hectáreas">'+recent.map((r,i)=>{
  const height= max===min?65:Math.max(16,24+68*(r.area-min)/(max-min));
  const latest=i===recent.length-1;
  return '<button class="ea-ficha-bar'+(latest?' is-latest':'')+'" type="button" data-ea-ficha-year="'+r.year+'" title="'+r.year+': '+number(r.area)+' ha" aria-label="'+r.year+": "+number(r.area)+' hectáreas"><span style="height:'+height.toFixed(1)+'%"></span><small>'+r.year+'</small></button>';
 }).join("")+'</div>';
}
function detailButton(which,item){
 const label=which==="up"?"Mayor expansión":"Mayor contracción";
 const hint=item?.city?"Seleccionar municipio":"Consultar año en la serie";
 return '<button class="ea-ficha-detail" type="button" '+(item?'data-ea-ficha-detail="'+which+'" title="'+hint+'"':'disabled')+'><span class="ea-ficha-detail-dot '+which+'">'+(which==="up"?"↗":"↘")+'</span><span><small>'+label+'</small><strong>'+safe(item?.label||"Sin cambio verificable")+'</strong><em>'+safe(item?.detail||"—")+'</em></span><span class="ea-ficha-chevron" aria-hidden="true">›</span></button>';
}
function renderHTML(s){
 const has=s.rows.length>1;
 const contextTitle=s.ctx.city?s.ctx.city:s.ctx.state;
 const unitNote=s.ctx.state==="Sinaloa"?(s.ctx.city?"municipio":"agregado estatal"):"serie estatal (sin desagregación municipal histórica)";
 const noData=!s.complete;
 return '<div class="ea-ficha-title-row"><div><span class="ea-ficha-kicker">INTELIGENCIA PRODUCTIVA / DGSIAP</span><h3>Dinámica territorial</h3></div><label class="ea-ficha-year-label">DESDE <select class="ea-ficha-base" aria-label="Año de comparación">'+[2003,2010,2015,2020,2023,2024].filter(y=>y<s.ctx.year).concat(s.ctx.year<=2003?[2003]:[]).map(y=>'<option value="'+y+'"'+(y===s.from?' selected':'')+'>'+y+'</option>').join("")+'</select></label></div>'
 +'<p class="ea-ficha-context">'+safe(s.ctx.crop)+' · '+safe(contextTitle)+' · '+s.from+'–'+s.ctx.year+'</p>'
 +'<div class="ea-ficha-stats"><div class="ea-ficha-stat gain"><span>Superficie ganada</span><strong>'+(s.complete?"+"+number(s.gained):"—")+' <small>ha</small></strong><em>Sumas de aumentos anuales</em></div>'
 +'<div class="ea-ficha-stat loss"><span>Superficie perdida</span><strong>'+(s.complete?"−"+number(s.lost):"—")+' <small>ha</small></strong><em>Sumas de reducciones anuales</em></div>'
 +'<div class="ea-ficha-stat balance"><span>Balance neto</span><strong>'+signed(s.net)+' <small>ha</small></strong><em>'+signedPct(s.percent)+' respecto a '+s.from+'</em></div></div>'
 +'<div class="ea-ficha-middle"><div class="ea-ficha-series"><div class="ea-ficha-series-head"><span>Superficie cosechada</span><b>'+safe(unitNote)+'</b></div>'+chart(s.rows)+'</div><div class="ea-ficha-leaders">'+detailButton("up",s.expansion)+detailButton("down",s.contraction)+'</div></div>'
 +'<div class="ea-ficha-footer"><span class="ea-ficha-disclaimer">'+(noData&&has?'Serie incompleta: no se estiman ganancias o pérdidas acumuladas. ':'')+'Cambios anuales en hectáreas cosechadas; no indican conversión de suelo ni polígonos agrícolas.</span><div class="ea-ficha-actions"><button type="button" data-ea-ficha-action="series">Ver serie ↗</button><button type="button" data-ea-ficha-action="csv">Exportar CSV ↓</button></div></div>';
}
function viewUI(){
 const hud=$("eo-climate-hud"),panel=$("ea-ficha-panel");
 if(hud)hud.dataset.eaPane=view;
 if(panel)panel.hidden=view!=="territory";
 const nav=$("ea-ficha-tabs");
 if(nav)nav.querySelectorAll("button").forEach(btn=>{let active=btn.dataset.eaFichaTab===view;btn.classList.toggle("active",active);btn.setAttribute("aria-selected",String(active))});
}
function ensureUI(){
 const hud=$("eo-climate-hud"),app=$("eo-app");
 if(!hud||!app||!$("ea-state")||!national())return false;
 if(!$("ea-ficha-tabs")){
  const nav=document.createElement("div");nav.id="ea-ficha-tabs";nav.className="ea-ficha-tabs";nav.setAttribute("role","tablist");nav.setAttribute("aria-label","Ficha del territorio");
  nav.innerHTML='<button type="button" data-ea-ficha-tab="territory" role="tab" aria-selected="true">↗ Dinámica</button><button type="button" data-ea-ficha-tab="climate" role="tab" aria-selected="false">☀ Clima NASA</button>';
  const title=hud.querySelector(".eoc-title");
  if(title)title.insertAdjacentElement("afterend",nav);else hud.prepend(nav);
  const section=document.createElement("section");section.className="ea-ficha-panel";section.id="ea-ficha-panel";section.setAttribute("aria-label","Dinámica de superficie cosechada");hud.appendChild(section);
  nav.addEventListener("click",e=>{const button=e.target.closest("[data-ea-ficha-tab]");if(!button)return;view=button.dataset.eaFichaTab;viewUI()});
 }
 if(!$("ea-ficha-national")){
  const external=document.createElement("aside");external.id="ea-ficha-national";external.className="ea-ficha-national";external.hidden=true;external.setAttribute("aria-label","Ficha de superficie cosechada por estado");
  external.innerHTML='<div class="ea-ficha-national-head"><span class="ea-ficha-kicker">GROWA / ANÁLISIS TERRITORIAL</span><strong id="ea-ficha-national-title">Serie estatal</strong><span>DGSIAP · 2003–2025</span></div><div id="ea-ficha-national-content" class="ea-ficha-panel"></div>';
  app.appendChild(external);
 }
 if(!$("ea-ficha-launch")){
  const tools=document.createElement("div");tools.className="ea-ficha-launch";
  tools.innerHTML='<button type="button" id="ea-ficha-launch">↗ Analizar superficie</button><button type="button" id="ea-ficha-export" aria-label="Exportar serie productiva" title="Descargar datos CSV">↓</button>';
  const parent=document.querySelector(".eo-selection");if(parent)parent.appendChild(tools);
  $("ea-ficha-launch").addEventListener("click",()=>{view="territory";viewUI();render();const card=$("ea-state")?.value==="Sinaloa"?$("eo-climate-hud"):$("ea-ficha-national");card?.scrollIntoView?.({block:"nearest",behavior:"smooth"})});
  $("ea-ficha-export").addEventListener("click",exportCSV);
 }
 const listen=(container)=>{
  if(!container)return;
  container.addEventListener("change",e=>{if(!e.target.closest(".ea-ficha-base"))return;start=Number(e.target.value);render()});
  container.addEventListener("click",e=>{
   const action=e.target.closest("[data-ea-ficha-action]"),bar=e.target.closest("[data-ea-ficha-year]"),detail=e.target.closest("[data-ea-ficha-detail]");
   if(action){if(action.dataset.eaFichaAction==="csv")exportCSV();else showSeries();return}
   if(bar){setYear(Number(bar.dataset.eaFichaYear));return}
   if(detail&&lastSnapshot){
    const x=detail.dataset.eaFichaDetail==="up"?lastSnapshot.expansion:lastSnapshot.contraction;
    if(x?.city){const select=$("eo-city");if(select&&[...select.options].some(o=>o.value===x.city)){select.value=x.city;select.dispatchEvent(new Event("change",{bubbles:true}))}}
    else if(x?.year)setYear(x.year);
   }
  });
 };
 listen($("ea-ficha-panel"));listen($("ea-ficha-national-content"));
 return true;
}
function setYear(year){
 const slider=$("eo-year");if(!slider||!Number.isInteger(year))return;
 slider.value=String(year);slider.dispatchEvent(new Event("input",{bubbles:true}));render();
}
function showSeries(){
 const btn=document.querySelector('[data-eo-chart="harvest"]');if(btn)btn.click();
 const host=document.querySelector(".eo-bottom");host?.scrollIntoView?.({behavior:"smooth",block:"nearest"});
}
function exportCSV(){
 const s=lastSnapshot;if(!s)return;
 const q=v=>'"'+String(v==null?"":v).replace(/"/g,'""')+'"';
 const csv=[["estado","municipio","cultivo","anio","superficie_cosechada_ha","fuente"].map(q).join(",")].concat(annual(s.ctx,2003,2025).map(row=>[s.ctx.state,s.ctx.city||"Agregado",s.ctx.crop,row.year,row.area,"DGSIAP"].map(q).join(","))).join("\r\n");
 const url=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="growa_superficie_"+clean(s.ctx.state).replace(/\s/g,"-")+"_"+clean(s.ctx.crop).replace(/\s/g,"-")+".csv";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function render(){
 if(!ensureUI())return;
 buildIndexes();if(!totals)return;
 const ctx=context(),base=Math.max(2003,Math.min(start,ctx.year-1)),snap=calculate(ctx,base);
 lastSnapshot=snap;
 const panel=ctx.state==="Sinaloa"?$("ea-ficha-panel"):$("ea-ficha-national-content");
 panel.innerHTML=renderHTML(snap);
 $("ea-ficha-national").hidden=ctx.state==="Sinaloa";
 if(ctx.state!=="Sinaloa"){
  const climate=$("eo-climate-hud");if(climate)climate.hidden=true;
  $("ea-ficha-national-title").textContent=ctx.state+" · "+ctx.crop+" · "+ctx.year;
 }else{
  const climate=$("eo-climate-hud");if(climate)climate.hidden=false;
 }
 viewUI();
}
function startup(tryCount=0){
 if(!ensureUI()){if(tryCount<90)setTimeout(()=>startup(tryCount+1),350);return}
 buildIndexes();render();
 for(const id of ["ea-state","eo-crop","eo-city","eo-compare"])$(id)?.addEventListener("change",()=>setTimeout(render,0));
 $("eo-year")?.addEventListener("input",()=>setTimeout(render,0));
 window.addEventListener("growa:eo-change",()=>setTimeout(render,0));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>startup());else startup();
})();
