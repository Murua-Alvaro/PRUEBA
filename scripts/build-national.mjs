/**
 * GROWA | DGSIAP NATIONAL OPEN DATA BUILD
 * Aggregates annual municipal DGSIAP CSV records for 2003–2025 to a browser-ready
 * compressed payload. No invented observations. Derived data is generated only
 * during the Render build; the raw public sources are not committed to Git.
 */
import {writeFileSync,existsSync,mkdirSync} from "node:fs";
import {gzipSync} from "node:zlib";
import {createHash} from "node:crypto";

const START=2003,END=2025;
const PATH="data/growa-national-generated.flag";
const TARGET="dist/data/growa-national-v1.json.gz";
const TARGET_META="dist/data/growa-national-v1-meta.json";
const SOURCE="https://nube.agricultura.gob.mx/index.php?ANIO={year}&view=10AE434F-A2158368-A120BC5A-EDF4AFAA";
const NAME="GROWA national open-data observatory";
const DATE="2026-11-15";
const stateNames=[
"Aguascalientes","Baja California","Baja California Sur","Campeche","Coahuila",
"Colima","Chiapas","Chihuahua","Ciudad de México","Durango","Guanajuato",
"Guerrero","Hidalgo","Jalisco","México","Michoacán","Morelos","Nayarit",
"Nuevo León","Oaxaca","Puebla","Querétaro","Quintana Roo","San Luis Potosí",
"Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas"
];
if(existsSync(PATH)){console.log("[GROWA national] Aggregated payload already built; skipping repeated npm install.");process.exit(0)}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const value=v=>{const x=Number(String(v??"").trim().replace(/,/g,""));return Number.isFinite(x)?x:0};
const rnd=(v,d=2)=>Number(v.toFixed(d));
const yearly=new Map(),cropRows=new Map(),muniRows=new Map(),muniCropRows=new Map(),cropNames=new Set(),sources=[],stats={};
const sourceRowCount={};
const safeId=s=>String(s).trim();
const parseLine=line=>{
 const fields=[];let quoted=false,cur="";
 for(let i=0;i<line.length;i++){const ch=line[i];
  if(ch==='"'){if(quoted&&line[i+1]==='"'){cur+='"';i++}else quoted=!quoted}
  else if(ch===','&&!quoted){fields.push(cur);cur=""}
  else cur+=ch
 }
 fields.push(cur);return fields;
};
function keyParts(map,key,make){let row=map.get(key);if(!row){row=make();map.set(key,row)}return row}
function parseYear(bytes,year){
 let csv=bytes.toString("utf8").replace(/^\uFEFF/,"");
 if(csv.includes("\uFFFD") && csv.slice(0,500).includes("\uFFFD"))csv=new TextDecoder("windows-1252").decode(bytes);
 const lines=csv.split(/\r?\n/);
 if(lines.length<100)throw Error("Suspiciously short CSV year "+year);
 const headers=parseLine(lines[0]).map(s=>s.replace(/^\uFEFF/,"").trim());
 const positions=Object.fromEntries(headers.map((h,i)=>[h,i]));
 /* DGSIAP 2020 labels the same column "Nomcultivo Sin Um" rather than "Nomcultivo". */
 if(!("Nomcultivo" in positions)){const alias=headers.find(h=>h.startsWith("Nomcultivo"));if(alias)positions.Nomcultivo=positions[alias]}

 for(const name of ["Anio","Idestado","Idmunicipio","Nommunicipio","Nomcultivo","Nomunidad","Nommodalidad","Sembrada","Cosechada","Siniestrada","Volumenproduccion","Valorproduccion"])
  if(!(name in positions))throw Error("Missing "+name+" in "+year+" header "+headers.join(","));
 const at=(row,n)=>row[positions[n]]??"";
 let count=0,invalid=0,recordsInYear=0;
 for(let i=1;i<lines.length;i++){
  const line=lines[i];if(!line)continue;const row=parseLine(line);
  if(row.length!==headers.length){invalid++;continue}
  const yr=Math.trunc(value(at(row,"Anio"))),sid=Math.trunc(value(at(row,"Idestado"))),mid=Math.trunc(value(at(row,"Idmunicipio")));
  if(yr!==year||sid<1||sid>32){invalid++;continue}
  const crop=safeId(at(row,"Nomcultivo")),muni=safeId(at(row,"Nommunicipio"));
  if(!crop){invalid++;continue}
  const val=value(at(row,"Valorproduccion")),harvest=value(at(row,"Cosechada")),sown=value(at(row,"Sembrada")),lost=value(at(row,"Siniestrada"));
  if(!Number.isFinite(val)||val<0||harvest<0||sown<0||lost<0){invalid++;continue}
  const volume=at(row,"Nomunidad").trim().toLowerCase()==="tonelada"?value(at(row,"Volumenproduccion")):0;
  const tonHa=at(row,"Nomunidad").trim().toLowerCase()==="tonelada"?harvest:0;
  const irrig=at(row,"Nommodalidad").trim().toLowerCase()==="riego"?harvest:0;
  const rain=at(row,"Nommodalidad").trim().toLowerCase()==="temporal"?harvest:0;
  const k1=sid+"|"+year,k2=k1+"|"+crop,k3=k1+"|"+mid,k4=k3+"|"+crop;
  const A=keyParts(yearly,k1,()=>({sid,year,val:0,harvest:0,sown:0,lost:0,volume:0,tonHa:0,irrig:0,rain:0,records:0,crops:new Set(),munis:new Set()}));
  A.val+=val;A.harvest+=harvest;A.sown+=sown;A.lost+=lost;A.volume+=volume;A.tonHa+=tonHa;A.irrig+=irrig;A.rain+=rain;A.records++;A.crops.add(crop);A.munis.add(mid);
  const C=keyParts(cropRows,k2,()=>({sid,year,crop,val:0,harvest:0,sown:0,lost:0,volume:0,tonHa:0,irrig:0,rain:0,records:0}));
  C.val+=val;C.harvest+=harvest;C.sown+=sown;C.lost+=lost;C.volume+=volume;C.tonHa+=tonHa;C.irrig+=irrig;C.rain+=rain;C.records++;
  const M=keyParts(muniRows,k3,()=>({sid,year,mid,name:muni,val:0,harvest:0,sown:0,records:0}));
  M.val+=val;M.harvest+=harvest;M.sown+=sown;M.records++;
  const MC=keyParts(muniCropRows,k4,()=>({sid,year,mid,name:muni,crop,val:0,harvest:0,sown:0,volume:0,tonHa:0,irrig:0,rain:0,records:0}));
  MC.val+=val;MC.harvest+=harvest;MC.sown+=sown;MC.volume+=volume;MC.tonHa+=tonHa;MC.irrig+=irrig;MC.rain+=rain;MC.records++;
  cropNames.add(crop);count++;recordsInYear++;
 }
 if(invalid>0)console.warn("[GROWA national] Source "+year+": "+invalid+" invalid-width or invalid-value lines skipped");
 if(count<2000)throw Error("Not enough rows for "+year+": "+count);
 sourceRowCount[year]=count;
 return {count,invalid,raw:bytes.length};
}
async function download(year){
 const url=SOURCE.replace("{year}",year);let err=null;
 for(let retry=0;retry<3;retry++){
  try{
   const response=await fetch(url,{headers:{"User-Agent":"GROWA-OpenData-Research/1.0 (public DGSIAP annual statistics)","Accept":"text/csv,application/octet-stream,*/*"},signal:AbortSignal.timeout(45000)});
   if(!response.ok)throw Error("HTTP "+response.status);
   const bytes=Buffer.from(await response.arrayBuffer());
   if(bytes.length<30000)throw Error("CSV response too small: "+bytes.length);
   const result=parseYear(bytes,year);
   sources.push({year,bytes:bytes.length,rows:result.count,sha256:createHash("sha256").update(bytes).digest("hex")});
   console.log("[GROWA national]",year,":",result.count,"records /",Math.round(bytes.length/1000),"KB");
   return;
  }catch(e){err=e;console.warn("[GROWA national]",year,"retry",retry+1,String(e.message||e).slice(0,180));await sleep(900+900*retry)}
 }
 throw Error("Unable to fetch/process DGSIAP year "+year+": "+String(err?.message||err));
}
try{
 console.log("[GROWA national] Building full 32-state DGSIAP dashboard",START,"to",END);
 /* Source-year downloads are processed sequentially to limit peak memory. */
 for(let year=END;year>=START;year--)await download(year);
 const p2025=yearly.get("25|2025");
 if(!p2025)throw Error("Missing Sinaloa 2025 validation sample.");
 /* Official annual CSVs publish production value in pesos; verify against published 2025 Sinaloa baseline. */
 const divisor=p2025.val>1e9?1e6:1000;
 const baseline=p2025.val/divisor;
 if(baseline<38000||baseline>65000)throw Error("Sinaloa 2025 validation failed: "+baseline+" MDP");
 console.log("[GROWA national] 2025 Sinaloa validation:",baseline.toFixed(1),"MDP; value divisor:",divisor);
 const catalog=Array.from(cropNames).sort((a,b)=>a.localeCompare(b,"es"));
 const cropIx=new Map(catalog.map((n,i)=>[n,i]));
 const Y=Array.from(yearly.values()).sort((a,b)=>a.sid-b.sid||a.year-b.year).map(x=>[
  x.sid,x.year,rnd(x.val/divisor),rnd(x.harvest,1),rnd(x.sown,1),rnd(x.lost,1),
  rnd(x.volume,1),rnd(x.tonHa,1),rnd(x.irrig,1),rnd(x.rain,1),x.records,x.crops.size,x.munis.size
 ]);
 const C=Array.from(cropRows.values()).sort((a,b)=>a.sid-b.sid||a.year-b.year||cropIx.get(a.crop)-cropIx.get(b.crop)).map(x=>[
  x.sid,x.year,cropIx.get(x.crop),rnd(x.val/divisor),rnd(x.harvest,1),rnd(x.sown,1),
  rnd(x.lost,1),rnd(x.volume,1),rnd(x.tonHa,1),rnd(x.irrig,1),rnd(x.rain,1),x.records
 ]);
 const M=Array.from(muniRows.values()).sort((a,b)=>a.sid-b.sid||a.year-b.year||a.mid-b.mid).map(x=>[
  x.sid,x.year,x.mid,x.name,rnd(x.val/divisor),rnd(x.harvest,1),rnd(x.sown,1),x.records
 ]);
 const MC=Array.from(muniCropRows.values()).sort((a,b)=>a.sid-b.sid||a.year-b.year||a.mid-b.mid||cropIx.get(a.crop)-cropIx.get(b.crop)).map(x=>[
  x.sid,x.year,x.mid,cropIx.get(x.crop),rnd(x.val/divisor),rnd(x.harvest,1),
  rnd(x.sown,1),rnd(x.volume,1),rnd(x.tonHa,1),rnd(x.irrig,1),rnd(x.rain,1),x.records
 ]);
 if(Y.length!==32*23)throw Error("State-years incomplete: "+Y.length+" vs 736");
 if(C.length<25000||M.length<30000)throw Error("Suspicious aggregation sizes "+C.length+"/"+M.length);
 const meta={version:1,source:"DGSIAP Datos Abiertos Agrícola 2003–2025",sourceUrl:"https://nube.agricultura.gob.mx/datosAbiertos/Agricola.php",generated:DATE,years:[START,END],states:stateNames,crops:catalog,counts:{rows:Object.values(sourceRowCount).reduce((a,b)=>a+b,0),stateYears:Y.length,stateCropYears:C.length,municipalityYears:M.length,municipalityCropYears:MC.length,states:32,crops:catalog.length},units:{value:"MDP nominales",harvest:"hectáreas",production:"toneladas, solo registros de Tonelada",irrigation:"superficie cosechada por modalidad de riego"},note2020:"Cifras 2020–2021 sujetas a cobertura y metodología originales"};
 const payload={meta,Y,C,M,MC};
 const raw=Buffer.from(JSON.stringify(payload));
 const gz=gzipSync(raw,{level:9});

 console.log("[GROWA national] Aggregate dimensions state-years:",Y.length,"crop-years:",C.length,"municipality-years:",M.length,"municipality-crop-years:",MC.length,"crops:",catalog.length);
 console.log("[GROWA national] Data size raw:",raw.length,"gzip:",gz.length);
 mkdirSync("dist/data",{recursive:true});
 writeFileSync(TARGET,gz);
 writeFileSync(TARGET_META,JSON.stringify({source:meta.source,created:DATE,counts:meta.counts,years:meta.years,units:meta.units,checksum:createHash("sha256").update(gz).digest("hex")},null,2));
 writeFileSync(PATH,JSON.stringify({created:DATE,counts:meta.counts,checksum:createHash("sha256").update(gz).digest("hex"),sources},null,2));
 console.log("[GROWA national] All-state data saved to static publish directory as compressed standalone resource.");
}catch(err){
 console.error("[GROWA national] FATAL",String(err.stack||err).slice(0,1800));
 process.exit(1);
}
