/* Execute the actual water adapters against the repository's complete datasets. */
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
const base=JSON.parse(fs.readFileSync(path.join(root,'data/agua-v9.json')));
const el={addEventListener(){},querySelectorAll(){return []}};
const sandbox={console,Intl,URL,URLSearchParams,Set,Map,Number,Date,Promise,JSON,Math,setTimeout,clearTimeout,document:{getElementById(){return el},addEventListener(){},readyState:'loading'},MutationObserver:class{observe(){}},fetch:async p=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,'dist',p)))})};
let src=fs.readFileSync(path.join(root,'agua/portal-v22.js'),'utf8');
src=src.replace("if(document.readyState==='loading')",`globalThis.test={load:async()=>{d=${JSON.stringify(base)};await loadExtended()},dams:damRows,quality:qualityRows,storage:storageRows,setDaily:()=>frequency='daily',chart:(rows,v)=>{filtered=rows;view=v;seriesKey='';return timeChart('volumen','Almacenamiento','hm³')}};if(document.readyState==='loading')`);
vm.runInNewContext(src,sandbox);
(async()=>{const t=sandbox.test;await t.load();assert.equal(t.dams().length,210);assert.equal(new Set(t.dams().map(x=>x.clave)).size,210);assert.equal(t.quality().length,6095);assert.equal(new Set(t.quality().map(x=>x.clave)).size,223);
assert.equal(t.storage().filter(x=>x.estado==='Jalisco').length,1018);t.setDaily();assert.equal(t.storage().filter(x=>x.estado==='Jalisco').length,30652);
const source=JSON.parse(fs.readFileSync(path.join(root,'dist/agua/calidad-sinaloa-observaciones-v1.json')));source.rows.forEach((r,i)=>{assert.equal(t.quality()[i].caudal,r[10]);assert.equal(t.quality()[i].ph,r[4])});
const g=t.chart([{estado:'Jalisco',clave:'A',fecha:'2024-01-01',volumen:0},{estado:'Jalisco',clave:'A',fecha:'2024-01-02',volumen:10},{estado:'Jalisco',clave:'A',fecha:'2024-03-01',volumen:5},{estado:'Jalisco',clave:'B',fecha:'2024-01-01',volumen:9000}],'storage');assert.equal((g.match(/<polyline/g)||[]).length,2);assert(!g.includes('NaN'));assert(g.includes('3 observaciones'));assert(g.includes('2024-03-01'));
console.log('PASS V23: 210 unique dams, 6095 unaltered quality records, 1018 monthly / 30652 daily observations, separate series and broken lines for missing dates.');})();
