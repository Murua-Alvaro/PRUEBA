'use strict';
/* Run: node tests/test_quant_lab.cjs - uses real Sinaloa data, not national PDF summaries. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const zlib=require('node:zlib');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
const raw=JSON.parse(zlib.gunzipSync(Buffer.from(fs.readFileSync(path.join(root,'data/analysis-pack.b64'),'utf8').trim(),'base64')).toString('utf8'));
const table=name=>raw[name].rows.map(r=>Object.fromEntries(raw[name].columns.map((key,i)=>[key,r[i]])));
const crops=table('crops'),states=table('state'),records=table('records2025'),municipal=table('municipal2025');
assert.deepEqual([crops.length,states.length,records.length,municipal.length],[8217,23,637,18]);
new Function(app);
const htmlIds=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
assert.equal(htmlIds.length,new Set(htmlIds).size);
for(const name of ['laboratorio','explorar-estados','explorar-cultivos']){
 assert.ok(html.includes('id="panel-'+name+'"'));
 assert.ok(html.includes('data-tab="'+name+'"'));
}
assert.ok(css.includes('GROWA QUANT LAB DESIGN V1'));
assert.ok(app.includes('GROWA QUANT LAB V1'));
assert.ok(html.includes('Los perfiles nacionales sin microdatos'));
const totals=new Map();
for(const r of crops)totals.set(r.Anio,(totals.get(r.Anio)||0)+r.Valorproduccion/1000);
for(const r of states)assert.ok(Math.abs(totals.get(r.Anio)-r.value/1000)<1e-7,'Annual value: '+r.Anio);
const byMunicipal=new Map();
for(const r of crops.filter(r=>r.Anio===2025)){
 if(!byMunicipal.has(r.Nommunicipio))byMunicipal.set(r.Nommunicipio,new Map());
 const map=byMunicipal.get(r.Nommunicipio),value=r.Valorproduccion/1000;
 map.set(r.Nomcultivo,(map.get(r.Nomcultivo)||0)+value);
}
assert.equal(byMunicipal.size,18);
const hhis=[];
for(const [municipality,map] of byMunicipal){
 const vals=[...map.values()],total=vals.reduce((a,b)=>a+b,0);
 const hhi=vals.reduce((a,b)=>a+(b/total)**2,0);
 assert.ok(hhi>0&&hhi<=1,'HHI invalid for '+municipality);
 hhis.push(hhi);
}
assert.ok(Math.min(...hhis)>.16&&Math.max(...hhis)<.48);
const maize=crops.filter(r=>r.Nomcultivo==='Maíz grano'&&[2003,2025].includes(r.Anio));
assert.deepEqual([...new Set(maize.map(r=>r.Nomunidad))],['Tonelada']);
const factor=year=>{
 const rows=maize.filter(x=>x.Anio===year);
 const area=rows.reduce((t,x)=>t+x.Cosechada,0);
 const qty=rows.reduce((t,x)=>t+x.Volumenproduccion,0);
 const val=rows.reduce((t,x)=>t+x.Valorproduccion/1000,0);
 assert.ok(area>0&&qty>0&&val>0);
 return {area,yield:qty/area,price:val/qty,value:val};
};
const old=factor(2003),recent=factor(2025);
const start=app.indexOf('function shapleyContributions('),end=app.indexOf('function renderShapley(',start);
assert.ok(start>=0&&end>start);
const shapley=new Function(app.slice(start,end)+';return shapleyContributions;')();
const effects=shapley(old,recent),residual=Object.values(effects).reduce((a,b)=>a+b,0)-(recent.value-old.value);
assert.ok(Math.abs(residual)<1e-7,'Shapley residual '+residual);
console.log(JSON.stringify({passed:true,annualYears:23,rows:8217,records2025:637,municipalities:18,hhiRange:[Math.min(...hhis),Math.max(...hhis)],maizeEffects:effects,shapleyResidual:residual},null,2));
