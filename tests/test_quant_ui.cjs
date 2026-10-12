'use strict';
/* Run: node tests/test_quant_ui.cjs
   Simulated DOM interaction: tests the view wiring, not visual browser rendering. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const module=app.slice(app.indexOf('/* GROWA QUANT LAB V1'));
assert.match(module,/GROWA QUANT LAB V1/);
new Function(app);
const elements=new Map();
function el(id){
 if(!elements.has(id))elements.set(id,{
  id,innerHTML:'',textContent:'',value:'',hidden:false,
  dataset:{},listeners:{},classList:{toggle(){}},
  addEventListener(name,fn){this.listeners[name]=fn},
  setAttribute(){},focus(){},setSelectionRange(){}
 });
 return elements.get(id);
}
const tabs=['serie','comparar','matriz','estructura','shapley','micro2025'].map(tab=>({
 dataset:{labTab:tab},listeners:{},classList:{toggle(){}},
 addEventListener(name,fn){this.listeners[name]=fn},setAttribute(){}
}));
const doc={readyState:'complete',getElementById:el,
 querySelectorAll(q){return q==='[data-lab-tab]'?tabs:[]},addEventListener(){}};
const rows=[
 {municipio:'Ahome',name:'Maíz grano',year:2003,unit:'Tonelada',value:8,harvest:10,planted:11,loss:0,volume:40},
 {municipio:'Ahome',name:'Maíz grano',year:2024,unit:'Tonelada',value:12,harvest:13,planted:14,loss:1,volume:65},
 {municipio:'Ahome',name:'Maíz grano',year:2025,unit:'Tonelada',value:14,harvest:14,planted:15,loss:1,volume:70},
 {municipio:'Guasave',name:'Frijol',year:2025,unit:'Kilogramo',value:6,harvest:7,planted:9,loss:2,volume:16000}
];
const details=[
 {Nommunicipio:'Ahome',Nomcultivo:'Maíz grano',Nomvariedad:'Blanco',Nommodalidad:'Riego',Nomcicloproductivo:'Otoño-Invierno',TipoTecnologia:'Cielo abierto',TipoProduccion:'Convencional',TipoMercado:'Nacional',Nomunidad:'Tonelada',value:14,harvest:14,planted:15,volume:70},
 {Nommunicipio:'Guasave',Nomcultivo:'Frijol',Nomvariedad:'Pinto',Nommodalidad:'Temporal',Nomcicloproductivo:'Primavera-Verano',TipoTecnologia:'Cielo abierto',TipoProduccion:'Convencional',TipoMercado:'Nacional',Nomunidad:'Kilogramo',value:6,harvest:7,planted:9,volume:16000}
];
const database={muniNames:['Ahome','Guasave'],cropNames:['Frijol','Maíz grano'],crops:rows,records:details};
const win={
 GrowaSinaloaData:{D:database},GrowaNavigate(tab){this.route=tab},
 GrowaExplorer:{getContext(){return {scope:'sinaloa',crop:'Maíz grano',cropMuni:'Ahome'}}},
 GrowaDownloadCSV(filename,records){this.export={filename,records}},
 addEventListener(){}
};
const storage=new Map(),localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const location={href:'https://example.com/#laboratorio'};
new Function('window','document','localStorage','location','navigator','setTimeout','clearTimeout',module)(
 win,doc,localStorage,location,{},()=>1,()=>{}
);
assert.match(el('lab-content').innerHTML,/Cómo evoluciona/);
assert.match(el('lab-query-count').textContent,/4 filas históricas/);
for(const [tab,fragment] of [
 ['comparar','Series en paralelo'],
 ['matriz','Cruza dimensiones'],
 ['estructura','Concentración y especialización'],
 ['shapley','Shapley'],
 ['micro2025','Variedades, ciclos y tecnología']
]){
 tabs.find(x=>x.dataset.labTab===tab).listeners.click();
 assert.ok(el('lab-content').innerHTML.includes(fragment),'Tab '+tab);
}
assert.match(el('lab-content').innerHTML,/Nomvariedad/);
el('lab-content').listeners.change({target:{id:'lab-micro-metric',value:'volume'}});
assert.match(el('lab-content').innerHTML,/unidades físicas diferentes/);
el('lab-content').listeners.change({target:{id:'lab-micro-metric',value:'value'}});
assert.match(el('lab-content').innerHTML,/REGISTROS SELECCIONADOS/);
win.GrowaLab.open('crops');
assert.equal(win.route,'laboratorio');
assert.deepEqual(win.GrowaLab.snapshot().crops,['Maíz grano']);
el('lab-download').listeners.click();
assert.equal(win.export.records.length,3);
const effects=win.GrowaLab.shapley({area:10,yield:4,price:2},{area:14,yield:5,price:3});
assert.ok(Math.abs(Object.values(effects).reduce((a,b)=>a+b,0)-130)<1e-8);
console.log('PASS: 6 analytic tabs; 2025 physical units; deep-link from crop; filtered CSV; exact Shapley.');
