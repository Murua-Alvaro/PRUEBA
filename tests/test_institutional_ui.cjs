'use strict';
/* Test institucional. Ejecutar: node tests/test_institutional_ui.cjs
 * Alcance: controles, ocultamiento de medidas faltantes y exportación correcta.
 * Son pruebas DOM simuladas; no sustituyen inspección visual de navegador.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
new Function(js);
assert.match(css,/GROWA INSTITUTIONAL DESIGN 2026 V1/);
assert.match(css,/#153b54/);
assert.match(html,/Herramientas independientes de apoyo al análisis/);
for(const name of ['lab-report','lab-report-sheet','lab-report-close','lab-report-print','lab-download'])
 assert.ok(html.includes('id="'+name+'"'),name);
for(const name of ['territory','compare','growth','detail'])
 assert.ok(html.includes('data-lab-preset="'+name+'"'),name);
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
assert.equal(ids.length,new Set(ids).size);
const route=js.match(/navigate\(\['panorama'[^\n]*\.includes\(location\.hash\.slice\(1\)\)/);
assert.ok(route&&route[0].includes("'laboratorio'"),'deep-link #laboratorio');
const lab=js.slice(js.indexOf('/* GROWA QUANT LAB V1'));
const elements=new Map();
function el(id){
 if(!elements.has(id))elements.set(id,{
  id,innerHTML:'',textContent:'',value:'',hidden:true,
  dataset:{},listeners:{},classList:{toggle(){}},
  addEventListener(type,fn){this.listeners[type]=fn},
  setAttribute(){},focus(){},setSelectionRange(){},scrollIntoView(){}
 });
 return elements.get(id);
}
const tabNames=['serie','comparar','matriz','estructura','shapley','micro2025'];
const tabs=tabNames.map(name=>({...el('tab-'+name),dataset:{labTab:name}}));
const presetNames=['territory','compare','growth','detail'];
const presets=presetNames.map(name=>({...el('preset-'+name),dataset:{labPreset:name}}));
const doc={
 readyState:'complete',getElementById:el,
 querySelectorAll(q){return q==='[data-lab-tab]'?tabs:q==='[data-lab-preset]'?presets:[]},
 addEventListener(){},body:{classList:{add(){},remove(){}}}
};
const D={
 muniNames:['Ahome','Guasave'],cropNames:['Maíz grano','Frijol'],
 crops:[
 {municipio:'Ahome',name:'Maíz grano',year:2003,unit:'Tonelada',value:8,harvest:10,planted:11,loss:0,volume:40},
 {municipio:'Ahome',name:'Maíz grano',year:2024,unit:'Tonelada',value:12,harvest:13,planted:14,loss:1,volume:65},
 {municipio:'Ahome',name:'Maíz grano',year:2025,unit:'Tonelada',value:14,harvest:14,planted:15,loss:1,volume:70},
 {municipio:'Guasave',name:'Frijol',year:2025,unit:'Kilogramo',value:6,harvest:7,planted:9,loss:2,volume:16000}
 ],
 records:[
 {Nommunicipio:'Ahome',Nomcultivo:'Maíz grano',Nomvariedad:'Blanco',Nommodalidad:'Riego',Nomcicloproductivo:'Otoño-Invierno',TipoTecnologia:'Cielo abierto',TipoProduccion:'Convencional',TipoMercado:'Nacional',Nomunidad:'Tonelada',value:14,harvest:14,planted:15,volume:70},
 {Nommunicipio:'Guasave',Nomcultivo:'Frijol',Nomvariedad:'Pinto',Nommodalidad:'Temporal',Nomcicloproductivo:'Primavera-Verano',TipoTecnologia:'Cielo abierto',TipoProduccion:'Convencional',TipoMercado:'Nacional',Nomunidad:'Kilogramo',value:6,harvest:7,planted:9,volume:16000}
 ]
};
const exports=[];
const win={
 GrowaSinaloaData:{D},GrowaNavigate(t){this.tab=t},
 GrowaExplorer:{getContext(){return {scope:'sinaloa',crop:'Maíz grano',cropMuni:'Ahome'}}},
 GrowaDownloadCSV(name,records){exports.push({name,count:records.length})},
 addEventListener(){},print(){exports.push({printed:true})}
};
const values=new Map();
const localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
const location={href:'https://example.org/#laboratorio',hash:'#laboratorio'};
new Function('window','document','localStorage','location','navigator','setTimeout','clearTimeout',lab)(
 win,doc,localStorage,location,{clipboard:{writeText:async()=>{}}},()=>1,()=>{}
);
assert.match(el('lab-content').innerHTML,/Cómo evoluciona/);
for(const tab of tabs){
 tab.listeners.click();
 assert.ok(el('lab-content').innerHTML.length>300,'rendered view '+tab.dataset.labTab);
}
const expected={territory:'estructura',compare:'comparar',growth:'shapley',detail:'micro2025'};
for(const preset of presets){
 preset.listeners.click();
 assert.equal(win.GrowaLab.snapshot().tab,expected[preset.dataset.labPreset]);
}
el('lab-report').listeners.click();
assert.equal(el('lab-report-sheet').hidden,false);
assert.match(el('lab-report-body').innerHTML,/Fuente/);
assert.match(el('lab-report-body').innerHTML,/no es un dictamen oficial/);
el('lab-report-print').listeners.click();
assert.ok(exports.at(-1).printed);
el('lab-report-close').listeners.click();
assert.equal(el('lab-report-sheet').hidden,true);
tabs.at(-1).listeners.click();
el('lab-download').listeners.click();
assert.equal(exports.at(-1).name,'growa_detalle_agricola_2025.csv');
assert.equal(exports.at(-1).count,2);
el('lab-report').listeners.click();
assert.match(el('lab-report-body').innerHTML,/2025–2025/);
assert.doesNotMatch(el('lab-summary').innerHTML+el('lab-content').innerHTML,/\bs\/d\b|\bn\/d\b|\bs\/r\b|Sin registro|Sin comparación/);
console.log('PASS Institutional UI: 6 views, 4 presets, printable technical report, dedicated 2025 CSV and missing-data suppression');
