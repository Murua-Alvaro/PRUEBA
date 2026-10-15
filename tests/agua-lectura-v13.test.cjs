'use strict';
/* Lectura de indicadores heredada: números reales y límites del paquete V14. */
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const base=path.resolve(__dirname,'..'),read=x=>fs.readFileSync(path.join(base,x),'utf8');
const D=JSON.parse(read('data/agua-v9.json')),js=read('agua-workspace-v14.js'),html=read('index.html');
new Function(js);
assert.match(html,/aw-workspace-runtime/);assert.match(html,/id="wa-embedded-dataset"/);
const r=D.riego.filter(x=>x[0]==='Sinaloa');
assert.equal(r.length,27);
const prev=r.find(x=>x[1]===2022),last=r.find(x=>x[1]===2023);
assert.equal(prev[2],8132.96);assert.equal(last[2],3403.62);
assert.ok(Math.abs((last[2]/prev[2]-1)*100+58.150292)<.001);
assert.equal(D.acuiferos.filter(x=>x[0]==='SINALOA'&&x[6]===1).length,8);
assert.equal(D.clima.filter(x=>x[0]==='Sinaloa'&&x[1]===2025)[0][2],741.28);
assert.match(js,/Sin histórico integrado para/);assert.match(js,/Sin tabla de calidad/);
console.log('PASS: V14 mantiene valores verificables del conjunto V9 y señala ausencias.');
