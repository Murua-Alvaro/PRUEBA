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
// V7 is a presentation layer only; verify it styles the actual existing components.
const designStart=html.indexOf("/* GROWA VISUAL SYSTEM V7");
const designEnd=html.indexOf("</style>",designStart);
const design=designStart>=0&&designEnd>designStart?html.slice(designStart,designEnd):"";
ok(!!design,"V7 institutional design stylesheet installed");
for(const [label,selector]of [
 ["navigation",".rail .nav-link"],["explorer",".eo-selection select"],["production results",".ea-product>.ea-metrics"],
 ["satellite controls",".eo-map-controls button"],["historical chart",".eo-chart-controls button"],
 ["analytical cards",".gw-research-card"]]){
 ok(design.includes(selector),"V7 designed "+label);
}
ok(design.includes("@media(max-width:800px)")&&design.includes("@media(max-width:470px)"),"V7 mobile breakpoints");
function contrast(a,b){
 const channel=x=>{const n=parseInt(x,16)/255;return n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4);};
 const luminance=s=>{const [r,g,bl]=s.slice(1).match(/.{2}/g).map(channel);return .2126*r+.7152*g+.0722*bl;};
 return (Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
}
ok(contrast("#193b2a","#ffffff")>=4.5&&contrast("#647c6c","#ffffff")>=4.5
 &&contrast("#146345","#ffffff")>=4.5,"Primary text, secondary text and link contrast >= 4.5:1");

console.log("RESULT:",checked-failed,"passed,",failed,"failed");
if(failed)process.exitCode=1;
