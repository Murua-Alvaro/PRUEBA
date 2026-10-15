'use strict';
// Controles V13. Ejecución: node tests/agua-lectura-v13.test.cjs
const fs=require('fs'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'),js=read('agua.js'),d=JSON.parse(read('data/agua-v9.json'));
assert.doesNotThrow(()=>new Function(js),'motor hídrico sintácticamente válido');
assert.match(js,/view='resumen'/,'la vista inicial debe explicar datos');
assert.match(html,/data-wa-view="resumen" aria-selected="true"/,'navegación inicial consistente');
for(const clause of ['Qué muestran los datos','Un millón de metros cúbicos','No es todo el agua de','NAMO','GLOSARIO ESENCIAL','wa13-chart-card']){
 assert.ok(js.includes(clause),clause);
}
assert.match(html,/id="wa-bundled-runtime"/,'engine integrado');
assert.match(html,/id="wa-embedded-dataset"/,'datos integrados');
assert.match(html,/wa13-main-finding/,'CSS explicativo integrado');
const embed=html.match(/<script type="application\/json" id="wa-embedded-dataset">([\s\S]*?)<\/script>/);
assert.ok(embed,'paquete hídrico integrado');
const inline=JSON.parse(embed[1]);
assert.equal(inline.presas.length,d.presas.length);
assert.equal(inline.acuiferos.length,d.acuiferos.length);
assert.equal(inline.riego.length,d.riego.length);
for(const state of d.estados){
 const rr=d.riego.filter(x=>x[0]===state).sort((a,b)=>a[1]-b[1]);
 assert.equal(rr.length,27,'serie completa riego: '+state);
 assert.equal(rr.at(-1)[1],2023);
 assert.ok(rr.at(-1)[2]>0,'volumen válido: '+state);
 const aa=d.acuiferos.filter(x=>x[0].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase()===state.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase());
 assert.ok(aa.length>0,'acuíferos del estado: '+state);
}
const s=d.riego.filter(x=>x[0]==='Sinaloa');
const a=s.find(x=>x[1]===2022),b=s.find(x=>x[1]===2023);
assert.equal(a[2],8132.96);assert.equal(b[2],3403.62);
assert.ok(Math.abs((b[2]/a[2]-1)*100+58.15029)<.01,'comparación sinaloense basada en registros');
assert.equal(d.acuiferos.filter(x=>x[0]==='SINALOA'&&x[6]===1).length,8);
console.log('PASS GROWA Agua V13: presentación explicativa, datos integrados y comparaciones reproducibles.');
