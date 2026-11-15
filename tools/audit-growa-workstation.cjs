"use strict";
// GROWA Observatory source regression — run: node tools/audit-growa-workstation.cjs
const fs=require("node:fs"),vm=require("node:vm");
let checked=0,failed=0;
function ok(value,label){checked++;console.log((value?"PASS":"FAIL")+" "+label);if(!value)failed++;}
const html=fs.readFileSync("index.html","utf8"),app=fs.readFileSync("app.js","utf8");
const markup=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"");
const ids=[...markup.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
ok(new Set(ids).size===ids.length,"No duplicate static HTML IDs");
ok(["eo-app","eo-map","eo-crop","eo-city","eo-compare","eo-year","eo-chart","eo-export","eo-yield","eo-satellite","eo-opacity","eo-climate-hud"].every(x=>ids.includes(x)),"Required data controls and map preserved");
ok(html.includes("WORKSTATION V6")&&html.includes("growa-workstation-v6"),"New workstation layout and controller");
ok(!html.includes("GROWA workstation layout v3")&&!html.includes("growa-ui-layout-v4"),"Obsolete layout removed");
for(const name of ["gw-research","gw-year-prev","gw-year-play","gw-year-next","gw-map-focus","gw-mobile-nav","GrowaWorkstationAudit"]){
 ok(html.includes(name),"UX feature: "+name);
}
const p=html.indexOf("WORKSTATION V6"),e=html.indexOf("</style>",p),css=html.slice(p,e);
let depth=0,minimum=0;for(const c of css){depth+=c==="{"?1:c==="}"?-1:0;minimum=Math.min(minimum,depth);}
ok(p>=0&&e>p&&depth===0&&minimum===0,"CSS blocks balanced");
ok(css.includes("@media(max-width:1240px)")&&css.includes("@media(max-width:800px)"),"Desktop/tablet/mobile media queries");
let validScripts=true;for(const [,attrs,body]of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
 if(/\bsrc=/.test(attrs)||!body.trim())continue;
 try{new vm.Script(body);}catch(ex){console.error(ex.message);validScripts=false;}
}
ok(validScripts,"Inline JavaScript parses");
let appValid=true;try{new vm.Script(app);}catch(ex){console.error(ex.message);appValid=false;}
ok(appValid,"Application JavaScript parses");
ok(app.includes("chartPointerFraction")&&app.includes('querySelector("svg")'),"Chart pointer handles horizontal scrolling");
let source=null;
try{const bundled=html.match(/<script id="growa-bundled-data">([\s\S]*?)<\/script>/)[1];
 source=JSON.parse(bundled.trim().replace(/^window\.GrowaBundledNational=/,"").replace(/;\s*$/,""));}
catch(ex){console.error(ex.message);}
ok(!!source,"Original data package valid JSON");
if(source){
 const counts={states:10,crops:22,points:529,cropAnnual:3933};
 for(const [field,count]of Object.entries(counts))ok(source.national[field]?.length===count,field+" "+count);
 ok(source.sinaloa.annual?.length===414,"Sinaloa annual climate observations");
 ok(source.sinaloa.monthly?.length===4968,"Sinaloa monthly climate observations");
}
// V8 is a data-led UI layer, not a replacement of the existing source system.
const designStart=html.indexOf("/* GROWA OBSERVATORY V8");
const designEnd=html.indexOf("</style>",designStart);
const design=designStart>=0&&designEnd>designStart?html.slice(designStart,designEnd):"";
ok(!!design,"V8 evidence-first design stylesheet installed");
for(const [label,selector]of [
 ["navigation",".rail .nav-link"],
 ["territorial filters",".eo-selection select"],
 ["satellite controls",".eo-map-controls button"],
 ["comparable benchmarks",".v8-signal-row"],
 ["source-based map legend",".v8-map-data-note"],
 ["historical chart",".eo-chart-controls button"],
 ["territorial ranking",".v8-rank-grid"],
 ["research layout",".gw-research-grid"]]){
 ok(design.includes(selector),"V8 designed "+label);
}
ok(design.includes("@media(max-width:1240px)")&&design.includes("@media(max-width:800px)")&&design.includes("@media(max-width:455px)"),"V8 desktop/tablet/mobile breakpoints");
function contrast(a,b){
 const channel=x=>{const n=parseInt(x,16)/255;return n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4);};
 const luminance=s=>{const [r,g,bl]=s.slice(1).match(/.{2}/g).map(channel);return .2126*r+.7152*g+.0722*bl;};
 return (Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
}
ok(contrast("#152D21","#FFFFFF")>=4.5&&contrast("#64796B","#FFFFFF")>=4.5
 &&contrast("#134E37","#FFFFFF")>=4.5,"V8 main text, secondary text and accent contrast >= 4.5:1");
const decision=html.match(/<script id="growa-decision-v8">([\s\S]*?)<\/script>/)?.[1];
ok(!!decision,"Observed-data decision controller present");
ok(!!decision&&decision.includes("peerValues")&&decision.includes("historyDiff")&&decision.includes("share"),"Rank, five-year baseline, share and relative benchmark calculated");
ok(!!decision&&decision.includes("r.unit")&&decision.includes("r.volume==null"),"Reject absent physical units and missing volume");
ok(app.includes("Superficie cosechada")&&app.includes("marker.bindTooltip(popup"),"Map tooltips explain municipal symbols");
if(decision){
 const rows=[];
 for(let yr=2020;yr<=2025;yr++){
  rows.push({year:yr,name:"Maíz grano",municipio:"Culiacán",unit:"Tonelada",harvest:10,volume:yr===2025?100:80});
  rows.push({year:yr,name:"Maíz grano",municipio:"Ahome",unit:"Tonelada",harvest:10,volume:yr===2025?60:65});
 }
 rows.push({year:2025,name:"Maíz grano",municipio:"Badiraguato",unit:null,harvest:1000,volume:100000});
 const fakeWindow={
  GrowaSinaloaData:{D:{crops:rows}},
  GrowaBundledNational:{national:{states:["Sinaloa","Jalisco"],crops:["Maíz grano"],cropAnnual:[[0,0,2025,20,160,0,2],[1,0,2025,100,400,0,3]]}}
 };
 const boot=decision.replace(/if\(document\.readyState==="loading"\)document\.addEventListener\("DOMContentLoaded",\(\)=>boot\(0\)\);else boot\(0\);/, "window.__test={stats,metric,peerValues};");
 let computed=null;
 try{
  vm.runInNewContext(boot,{window:fakeWindow,document:{readyState:"loading",addEventListener(){}},Intl});
  computed=fakeWindow.__test.stats({state:"Sinaloa",crop:"Maíz grano",city:"Culiacán",compare:"",year:2025});
 }catch(error){console.error("Numeric fixture:",error.message);}
 ok(computed?.current?.yield===10&&computed?.reference?.yield===8,"Municipal productivity and weighted state benchmark (synthetic fixture)");
 ok(computed?.records?.length===5&&computed?.historyDiff===25,"Five-year observed baseline, no current-year leakage (synthetic fixture)");
 ok(computed?.position===1&&computed?.peers?.length===2,"Invalid-unit municipality excluded from ranking (synthetic fixture)");
 ok(computed?.share===62.5,"Physical share of state crop production (synthetic fixture)");
}

console.log("RESULT:",checked-failed,"passed,",failed,"failed");
if(failed)process.exitCode=1;
