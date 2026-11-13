"use strict";
/* No-dependency logic and UI contract checks for published agronomic dynamics.
   node tests/territorial-dynamics.test.cjs */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const src=fs.readFileSync(path.join(root,"territorial-dynamics.js"),"utf8");
const bundle=fs.readFileSync(path.join(root,"app.js"),"utf8");
const css=fs.readFileSync(path.join(root,"styles.css"),"utf8");
new Function(src);new Function(bundle);
assert.ok(bundle.includes("GROWA Earth Intelligence | Productive surface dynamics"));
assert.ok(css.includes(".ea-ficha-stats"));
assert.ok(css.includes('body[data-view="panorama"] #eo-climate-hud'));
const mock={
  national:{
    states:["Sinaloa","Jalisco"],crops:["Maíz grano"],
    cropAnnual:[[1,0,2020,80],[1,0,2021,100],[1,0,2022,85],[1,0,2023,120],[1,0,2024,110],[1,0,2025,135]]
  },
  sinaloa:{}
};
const rows=[100,130,110,145,140,160].map((harvest,i)=>({year:2020+i,name:"Maíz grano",municipio:"Elota",harvest}))
.concat([20,28,40,35,49,52].map((harvest,i)=>({year:2020+i,name:"Maíz grano",municipio:"Mazatlán",harvest})));
const doc={
  readyState:"loading",
  addEventListener:()=>{},
  getElementById:()=>null
};
const ctx={
  window:{GrowaBundledNational:mock,GrowaSinaloaData:{D:{crops:rows}}},
  document:doc,
  setTimeout:()=>{},
  Intl,Number,Map,Set,Math,Array,JSON,Blob:undefined
};
const injected=src.replace(
  "if(document.readyState===",
  "window.__test={buildIndexes,calculate,area,annual,chart,renderHTML};if(document.readyState==="
);
assert.notEqual(injected,src,"Test harness is attached to source");
vm.runInNewContext(injected,ctx);
const api=ctx.window.__test;api.buildIndexes();
const a=api.calculate({state:"Sinaloa",city:"Elota",crop:"Maíz grano",year:2025},2020);
assert.equal(a.first,100);
assert.equal(a.last,160);
assert.equal(a.gained,85);
assert.equal(a.lost,25);
assert.equal(a.net,60);
assert.equal(a.percent,60);
assert.equal(a.complete,true);
const b=api.calculate({state:"Sinaloa",city:"",crop:"Maíz grano",year:2025},2020);
assert.equal(b.first,120);
assert.equal(b.last,212);
assert.equal(b.net,92);
assert.equal(b.expansion.label,"Elota");
assert.equal(b.contraction,null,"Both municipalities expand over the selected window");
const c=api.calculate({state:"Jalisco",city:"",crop:"Maíz grano",year:2025},2020);
assert.equal(c.first,80);
assert.equal(c.last,135);
assert.equal(c.gained,80);
assert.equal(c.lost,25);
assert.equal(c.net,55);
const miss=api.calculate({state:"Sinaloa",city:"Elota",crop:"Maíz grano",year:2025},2019);
assert.equal(miss.complete,false);
assert.equal(miss.net,null);
const html=api.renderHTML(a);
assert.match(html,/Superficie ganada/);
assert.match(html,/2020–2025/);
assert.match(html,/no indican conversión de suelo/);
assert.match(html,/data-ea-ficha-action="csv"/);
assert.match(html,/data-ea-ficha-year="2025"/);
console.log("GROWA territorial-dynamics: 17 assertions passed");
