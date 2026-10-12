'use strict';
/**
 * No-dependency regression checks for the Growa chart interactions.
 * Run: node tests/test_chart_interactions.cjs
 * These are deterministic DOM-mock tests, not visual browser tests.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const js=fs.readFileSync(path.join(root,'app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
const start=js.indexOf('function svgChart('),end=js.indexOf('function navigate(',start);
assert.ok(start>=0&&end>start,'chart source boundaries');
const chartCode=js.slice(start,end);
new Function(js);
const handlers=new Map();
let exportResult=null;
const fakeRoot={
 content:'',
 set innerHTML(value){this.content=value;handlers.clear()},
 get innerHTML(){return this.content},
 querySelectorAll(selector){
  const attr=selector==='[data-chart-period]'?'data-chart-period':selector==='button[data-chart-mode]'?'data-chart-mode':null;
  if(!attr)return[];
  const re=new RegExp('<button[^>]*'+attr+'="([^"]+)"[^>]*>','g');
  return [...this.content.matchAll(re)].map(m=>({
   dataset:{chartPeriod:attr==='data-chart-period'?m[1]:'',chartMode:attr==='data-chart-mode'?m[1]:''},
   addEventListener(type,fn){if(type==='click')handlers.set(attr+':'+m[1],fn)}
  }));
 },
 querySelector(selector){
  if(selector==='.g-chart-readout')return {textContent:''};
  if(selector==='[data-chart-export]')return {addEventListener(type,fn){if(type==='click')handlers.set('csv',fn)}};
  return null;
 }
};
const chart=new Function('$','niceMax','compact','esc','downloadCSV',chartCode+';return svgChart;')(
 ()=>fakeRoot,n=>Math.max(1,Math.ceil(n)),{format:x=>String(Math.round(x))},
 s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;'),
 (name,records)=>{exportResult={name,records}}
);
const observations=[{year:2003,value:10},{year:2004,value:13},{year:2014,value:5}];
chart('test-chart',observations,{label:'Serie de control'});
assert.match(fakeRoot.content,/2003–25/);
assert.match(fakeRoot.content,/class="g-chart-table" hidden/);
assert.match(fakeRoot.content,/3 observaciones/);
assert.equal((fakeRoot.content.match(/<tr>/g)||[]).length,4);

handlers.get('data-chart-period:2021')();
assert.match(fakeRoot.content,/No hay observaciones en el periodo seleccionado/);
assert.doesNotMatch(fakeRoot.content,/(?:NaN|Infinity)/);
handlers.get('data-chart-period:full')();
handlers.get('data-chart-mode:table')();
assert.match(fakeRoot.content,/class="g-chart-table" >/);
assert.match(fakeRoot.content,/<td>2004<\/td>/);
assert.match(fakeRoot.content,/30.0 %/);
handlers.get('csv')();
assert.equal(exportResult.records.length,3);
assert.equal(exportResult.records[0].anio,2003);
assert.equal(exportResult.records[2].anio,2014);

const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
assert.equal(ids.length,new Set(ids).size,'unique HTML ids');
assert.ok(html.includes('id="state-insights"'));
assert.ok(html.includes('class="masthead-content"'));
assert.ok(html.includes('class="ux-more-menu"'));
assert.ok(css.includes('GROWA CHART AND BRIEF COMPONENTS V7'));
assert.ok(css.includes('GROWA ENTERPRISE DESIGN V6'));
assert.ok(js.includes("const topMunicipal=D.municipal2025.slice()"));
assert.ok(js.includes("const topCultivos=top.slice(0,3)"));
console.log('12 checks passed: chart, periods, empty observations, table, CSV, structure, briefing');
