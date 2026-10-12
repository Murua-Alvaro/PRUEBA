'use strict';
/* Run: node tests/test_two_explorers.cjs
   Deterministic integration checks; full browser visual QA is separate. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
new Function(js);
const nav=[...html.matchAll(/class="nav-link[^"]*" data-tab="([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(nav,['panorama','explorar-estados','explorar-cultivos','metodologia']);
for(const t of nav)assert.ok(html.includes('id="panel-'+t+'"'));
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size);
assert.match(css,/GROWA EXPLORATION WORKSPACE V1/);
assert.match(css,/max-width:740px/);
assert.match(js,/window.GrowaSinaloaData=\{D,R\}/);
assert.match(js,/stateFacts:stateFacts/);
assert.match(js,/GROWA TWO EXPLORERS V1/);
const mod=js.slice(js.indexOf('/* GROWA TWO EXPLORERS V1 */'));
const map=new Map();
function el(id){
 if(!map.has(id))map.set(id,{
  id,innerHTML:'',value:'',dataset:{},classList:{toggle(){}},
  addEventListener(name,fn){this['on'+name]=fn},setAttribute(){}
 });
 return map.get(id);
}
const document={readyState:'complete',getElementById:el,addEventListener(){}};
const D={
 muniNames:['Ahome','Mazatlán'],cropNames:['Frijol','Maíz grano'],
 state:[{year:2024,value:12},{year:2025,value:15}],
 municipalities:[{name:'Ahome',year:2024,value:8},{name:'Ahome',year:2025,value:9},{name:'Mazatlán',year:2024,value:4},{name:'Mazatlán',year:2025,value:6}],
 crops:[{name:'Maíz grano',municipio:'Ahome',year:2024,value:8,harvest:50},{name:'Maíz grano',municipio:'Ahome',year:2025,value:9,harvest:52},{name:'Frijol',municipio:'Mazatlán',year:2024,value:4,harvest:10},{name:'Frijol',municipio:'Mazatlán',year:2025,value:6,harvest:11}],
 records:[{Nomcultivo:'Maíz grano',Nommunicipio:'Ahome',Nomvariedad:'Blanco',Nommodalidad:'Riego',Nomcicloproductivo:'Otoño-Invierno',TipoTecnologia:'Cielo abierto',TipoProduccion:'Convencional',TipoMercado:'Nacional',value:9}]
};
const N={
 states:[['Sinaloa',8,7,-1,15,84,'Resumen Sinaloa'],['Jalisco',7,12,5,40,77,'Resumen Jalisco']],
 stateFacts:[{top:[['Maíz grano',9]]},{top:[['Agave',12]]}],
 crops:[['Aguacate',3,6,3,50,4,19,4,'Michoacán',44,'Perfil aguacate']],
 cropFacts:[{states:[['Michoacán',44]],varieties:[['Hass',49]],irrigation:47.2,export:0.1}]
};
const R={Ahome:{closing1:'Balance económico',closing2:'Descomposición',conclusion:'Conclusión municipal'}};
const charts=[];
const window={
 GrowaSinaloaData:{D,R},GrowaNationalData:N,
 GrowaChart(id,series){charts.push({id,series})},
 GrowaNavigate(tab){this.lastTab=tab},
 GrowaDownloadCSV(name,rows){this.lastExport={name,rows}},
 addEventListener(){}
};
new Function('window','document',mod)(window,document);
assert.match(el('gx-state-list').innerHTML,/Jalisco/);
assert.match(el('gx-crop-list').innerHTML,/Maíz grano/);
assert.ok(charts.some(c=>c.id==='gx-state-line'));
window.GrowaExplorer.openState('Jalisco');
assert.match(el('gx-state-view').innerHTML,/No hay microdatos anuales/);
assert.doesNotMatch(el('gx-state-deep').innerHTML,/gx-state-line/);
window.GrowaExplorer.openCrop('mexico','Aguacate');
assert.match(el('gx-crop-deep').innerHTML,/Hass/);
window.GrowaExplorer.openCrop('sinaloa','Maíz grano');
el('gx-crop-deep').onclick({target:{closest:()=>({dataset:{gxMode:'crop',gxModeValue:'desglose'}})}});
assert.match(el('gx-crop-analysis').innerHTML,/TipoTecnologia/);
assert.match(el('gx-crop-analysis').innerHTML,/Todas las variedades/);
window.GrowaExplorer.openState('Sinaloa','Ahome');
assert.match(el('gx-state-analysis').innerHTML,/Conclusión municipal/);
assert.equal(window.lastTab,'explorar-estados');
console.log('Two explorers: navigation, scoping, figures, drilldowns and documental conclusions passed.');
