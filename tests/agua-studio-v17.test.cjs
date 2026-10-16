#!/usr/bin/env node
'use strict';
/* Water Studio V17 — offline asset integrity and interactive controller tests.
 * node tests/agua-studio-v17.test.cjs
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..'),read=x=>fs.readFileSync(path.join(base,x),'utf8');
const html=read('index.html'),ui=read('agua-studio-v17.html'),script=read('dist/agua/studio-v17.js');
const css=read('dist/agua/studio-v17.css'),D=JSON.parse(read('data/agua-v9.json'));
const src=x=>JSON.parse(read('dist/agua/'+x));
const dams=src('presas-nacionales-v1.json'),quality=src('calidad-sinaloa-observaciones-v1.json');
const daily=['jalisco-diario-1.json','jalisco-diario-2.json','jalisco-diario-3.json'].map(src);
const monthly=src('jalisco-mensual-v1.json');
assert.match(html,/href="\/agua\/studio-v17\.css/);
assert.match(html,/src="\/agua\/studio-v17\.js/);
assert.ok(html.includes(ui),'published module source differs');
assert.doesNotMatch(html,/aw-workspace-runtime|explorer-v16\.js/);
new Function(script);
assert.match(css,/w17-root/);
assert.equal(dams.rows.length,210);
assert.equal(quality.rows.length,6095);
assert.equal(monthly.rows.length,1018);
assert.equal(daily.reduce((n,x)=>n+x.rows.length,0),30652);
assert.equal(D.acuiferos.length,216);
assert.equal(D.presas.length,75);
assert.equal(D.riego.length,135);
assert.equal(D.clima.length,115);
assert.equal(D.tendencias.length,32);
const views=['overview','presas','regional','storage','acuiferos','riego','cuencas','quality','clima','trend','catalog','sources'];
for(const view of views)assert.match(ui,new RegExp('data-w17-view="'+view+'"'));
const staticHtml=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
const ids=[...staticHtml.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
assert.equal(new Set(ids).size,ids.length,'duplicate static DOM IDs');
async function run(){
 const events={},elements=new Map(),assets=new Map([
 ['presas-nacionales-v1.json',dams],['calidad-sinaloa-observaciones-v1.json',quality],
 ...daily.map((x,i)=>['jalisco-diario-'+(i+1)+'.json',x]),['jalisco-mensual-v1.json',monthly]
 ]);
 function el(id){
  if(!elements.has(id))elements.set(id,{id,hidden:id==='panel-agua',value:'',innerHTML:'',textContent:'',dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},
   parentNode:{append(){}},options:[{value:'Todos'},{value:'Sinaloa'},{value:'Jalisco'},{value:'Sonora'},{value:'Chihuahua'},{value:'Michoacán'}],
   setAttribute(){},getAttribute(){return null},addEventListener(k,fn){events[k]=fn},querySelectorAll(){return []},querySelector(){return null},
   append(){},remove(){},focus(){},click(){},select(){},showModal(){},close(){}});
  return elements.get(id)
 }
 el('wa-embedded-dataset').textContent=JSON.stringify(D);
 const doc={readyState:'complete',getElementById:el,body:{append(){}},createElement:t=>el('generated_'+t),addEventListener(){},title:''};
 const win={L:null,innerWidth:1200,scrollTo(){},addEventListener(){}},location={href:'https://test.invalid/?wa=overview&ws=Sinaloa#agua',hash:'#agua'};
 class FakeURL{
  constructor(){const params={wa:'overview',ws:'Sinaloa'};this.pathname='/';this.search='';this.hash='#agua';this.searchParams={get:k=>params[k]||null,set(k,v){params[k]=v},delete(k){delete params[k]}}}
  static createObjectURL(){return 'blob:mock'}
  static revokeObjectURL(){}
 }
 const fetch=async url=>{const j=assets.get(url.split('/').at(-1));return {ok:!!j,status:j?200:404,json:async()=>j}};
 new Function('document','window','location','history','URL','fetch','setTimeout','clearTimeout','navigator','Blob','console',script)(
  doc,win,location,{replaceState(){}},FakeURL,fetch,()=>1,()=>{},{},class{},console
 );
 const api=win.GrowaWaterStudio;assert.ok(api);
 const flush=async()=>{for(let i=0;i<25;i++)await Promise.resolve()};
 for(const view of views){
  api.navigate(view);await flush();
  assert.ok(el('w17-content').innerHTML.length>500,'empty view '+view);
  assert.doesNotMatch(el('w17-content').innerHTML,/Error al consultar datos/,'failed data '+view);
 }
 api.navigate('presas');await flush();assert.equal(api.snapshot().visible,210);
 api.navigate('quality');await flush();assert.equal(api.snapshot().visible,6095);
 api.navigate('storage');await flush();assert.equal(api.snapshot().visible,125,'Sinaloa has 99 system rows and 26 individual cuts');
 events.change({target:{id:'w17-state',value:'Jalisco'}});await flush();assert.equal(api.snapshot().visible,30652);
 events.change({target:{id:'w17-period',value:'monthly'}});await flush();assert.equal(api.snapshot().visible,1018);
 events.change({target:{id:'w17-filter',value:'REDJL'}});await flush();assert.ok(api.snapshot().visible>0&&api.snapshot().visible<1018);
 events.click({target:{closest(sel){return sel==='[data-w17-view]'?{dataset:{w17View:'acuiferos'}}:null}},preventDefault(){}});
 await flush();assert.equal(api.snapshot().view,'acuiferos');
 assert.ok(el('w17-detail-body').innerHTML.length>100);
 console.log('PASS GROWA Agua Studio V17: 12 views, 210 dams, 6095 quality, 30652 daily, 1018 monthly, filters, navigation and detail');
}
run().catch(e=>{console.error(e);process.exitCode=1});
