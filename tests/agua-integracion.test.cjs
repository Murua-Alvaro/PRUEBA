#!/usr/bin/env node
'use strict';
/* GROWA Agua v14 — static production contract and data integrity.
   Execute: node tests/agua-integracion.test.cjs */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(dir,f),'utf8');
const html=read('index.html'),hsrc=read('agua-workspace-v14.html'),css=read('agua-workspace-v14.css'),js=read('agua-workspace-v14.js'),D=JSON.parse(read('data/agua-v9.json'));
let completed=0;
function check(name,fn){fn();console.log('✓ '+name);completed++}
check('Sitio mantiene agricultura y módulo Agua integrado',()=>{
 assert.match(html,/data-tab="agua"/);assert.match(html,/id="panel-panorama"/);
 assert.match(html,/id="panel-agua"/);assert.ok(html.includes(hsrc));
});
check('Interfaz tiene nueve secciones navegables y tres paneles',()=>{
 for(const v of ['presas','acuiferos','cuencas','riego','clima','almacenamiento','comparar','calidad','fuentes'])assert.match(hsrc,new RegExp('data-aw-view="'+v+'" aria-pressed'));
 for(const id of ['aw-state','aw-search','aw-context-filters','aw-main','aw-inspector','aw-inspector-content','aw-guide','aw-toast'])assert.ok(hsrc.includes('id="'+id+'"'),id);
});
check('Estilos y motor en archivo modular coinciden con publicación',()=>{
 const inCss=html.match(/<style id="aw-workspace-style">([\s\S]*?)<\/style>/);
 const inJS=html.match(/<script id="aw-workspace-runtime">([\s\S]*?)<\/script>/);
 assert.ok(inCss&&inJS);assert.equal(inCss[1].trim(),css.trim());assert.equal(inJS[1].trim(),js.trim());
 new vm.Script(js);new vm.Script(inJS[1]);
});
check('Datos integrados conservan integridad y procedencia',()=>{
 const hit=html.match(/<script type="application\/json" id="wa-embedded-dataset">([\s\S]*?)<\/script>/);
 assert.ok(hit);const v=JSON.parse(hit[1]);
 for(const key of ['riego','clima','presas','acuiferos','calidad','sistemas','jalisco','sinaloa'])assert.equal(v[key].length,D[key].length,key);
 assert.equal(D.estados.length,5);assert.equal(D.presas.length,75);assert.equal(D.acuiferos.length,216);assert.equal(D.calidad.length,223);
 for(const st of D.estados){assert.equal(D.riego.filter(x=>x[0]===st).length,27,st+' riego');assert.equal(D.clima.filter(x=>x[0]===st).length,23,st+' clima')}
});
check('Mapa utiliza capas sin API key y respalda fallos con coordenadas',()=>{
 assert.match(js,/tile\.openstreetmap\.org/);assert.match(js,/server\.arcgisonline\.com/);
 assert.match(js,/function vectorFallback/);assert.match(js,/tileerror/);assert.doesNotMatch(js,/basemaps\.cartocdn\.com/);
});
check('Filtros, inspector y exportaciones están implementados',()=>{
 for(const token of ['function rowData','function renderFilters','function mountMap','function inspector','function renderCompare','function renderStorage','function exportCSV','function exportGeo','function share','function restore','function serialize','function chart'])assert.ok(js.includes(token),token);
 assert.match(js,/data-aw-pick/);assert.match(js,/data-aw-page/);assert.match(js,/aw-mobile-inspector/);
});
check('Unidades y restricciones metodológicas visibles',()=>{
 for(const phrase of ['No equivale a un dictamen','No representa','No es el consumo','no mide','No controlan superficie','No se interpolan','no significa'])assert.ok((hsrc+js).toLowerCase().includes(phrase.toLowerCase()),phrase);
});
check('No hay IDs duplicados en marcado HTML estático',()=>{
 const bare=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
 const ids=[...bare.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length);
});
console.log('\n'+completed+' controles de integración de Agua V14 superados.');
