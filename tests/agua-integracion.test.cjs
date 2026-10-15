#!/usr/bin/env node
// GROWA Agua · suite de control para la interfaz estática.
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const d=JSON.parse(read('data/agua-v9.json'));
const html=read('index.html'),build=read('render.yaml');
const checks=[];
function test(name,fn){fn();checks.push(name);console.log('✓ '+name)}
test('HTML incorpora la navegación cartográfica y las ocho vistas',()=>{
 assert.match(html,/id="panel-agua"/);
 for(const v of ['resumen','presas','acuiferos','cuencas','series','comparar','calidad','fuentes'])assert.ok(html.includes('data-wa-view="'+v+'"'),v);
 assert.ok(html.includes('data-tab="agua"'));
 assert.ok(html.includes('wa-console')&&html.includes('wa-side'));
 assert.ok(html.includes('wa-basemap')&&html.includes('wa-zoom-all'));
 assert.ok(html.includes('wa-view-description'));
 assert.ok(html.includes('No son mediciones en tiempo real.'));
});
test('JavaScript de agua sintácticamente válido',()=>new vm.Script(read('agua.js')));
test('Assets de agua incorporados al build de Render',()=>{
 for(const f of ['agua.js','agua.css','agua-pro.css','data/agua-v9.json'])assert.ok(build.includes(f),f);
 for(const f of ['wa-bundled-styles','wa-bundled-runtime','wa-embedded-dataset','wa-institutional-v11'])assert.ok(html.includes('id="'+f+'"'),f);
});
test('Cinco estados completos en series de riego y clima',()=>{
 assert.equal(d.estados.length,5);
 for(const state of d.estados){
  const r=d.riego.filter(x=>x[0]===state),c=d.clima.filter(x=>x[0]===state);
  assert.equal(r.length,27,state+' riego');
  assert.equal(c.length,23,state+' clima');
  assert.equal(new Set(r.map(x=>x[1])).size,27);
  assert.equal(new Set(c.map(x=>x[1])).size,23);
  assert.equal(Math.min(...r.map(x=>x[1])),1997);
  assert.equal(Math.max(...r.map(x=>x[1])),2023);
  assert.equal(Math.min(...c.map(x=>x[1])),2003);
  assert.equal(Math.max(...c.map(x=>x[1])),2025);
 }
});
test('Inventarios y observaciones V9 trazables',()=>{
 assert.equal(d.presas.length,75);
 assert.equal(d.acuiferos.length,216);
 assert.equal(d.calidad.length,223);
 assert.equal(d.tendencias.length,32);
 assert.equal(d.jalisco.length,1000); // Sólo muestra 1000/1018 meses originales.
 assert.equal(new Set(d.presas.map(x=>x[1])).size,75);
 assert.ok(d.presas.every(x=>x[4]>=14&&x[4]<=34&&x[5]>=-118&&x[5]<=-86));
});
test('Ningún dato de calidad sin fecha se presenta como serie',()=>{
 assert.ok(d.calidad.every(x=>x[4]===0));
 assert.ok(read('agua.js').includes('No se presentan como mediciones actuales'));
});
console.log('\n'+checks.length+' controles superados.');
console.log('Nota: 18 filas mensuales de Jalisco están pendientes en la edición web; la base V9 de investigación conserva 1018.');
