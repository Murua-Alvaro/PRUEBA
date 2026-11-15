import { writeFileSync } from "node:fs";

const URL="https://nube.agricultura.gob.mx/index.php?ANIO=2025&view=10AE434F-A2158368-A120BC5A-EDF4AFAA";
async function main(){
 console.log("[GROWA national] Probe official DGSIAP 2025 public CSV endpoint");
 try{
  const response=await fetch(URL,{headers:{"user-agent":"GROWA-OpenData-Research/1.0 (public annual DGSIAP statistics)","accept":"text/csv, application/octet-stream, */*"},signal:AbortSignal.timeout(30000)});
  console.log("[GROWA national] HTTP",response.status,"type",response.headers.get("content-type"));
  if(!response.ok)throw new Error("HTTP "+response.status);
  const buffer=Buffer.from(await response.arrayBuffer());
  console.log("[GROWA national] Downloaded",buffer.length,"bytes, head:",JSON.stringify(buffer.subarray(0,220).toString("utf8")));
  writeFileSync("data/growa-national-probe.json",JSON.stringify({ok:true,status:response.status,type:response.headers.get("content-type"),size:buffer.length,head:buffer.subarray(0,80).toString("utf8")},null,2));
 }catch(err){
  console.warn("[GROWA national] Public CSV network probe failed:",String(err.message||err).slice(0,400));
  writeFileSync("data/growa-national-probe.json",JSON.stringify({ok:false,message:String(err.message||err)}));
 }
}
await main();