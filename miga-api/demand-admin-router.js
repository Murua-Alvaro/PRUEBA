'use strict';
const fs=require('fs');
const path=require('path');
const S=require('./demand-store');
const A=require('./demand-analytics');
const O=require('./demand-ops');
function consolePage(res){
  try{const data=fs.readFileSync(path.join(__dirname,'demand.html'));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Frame-Options':'DENY','X-Content-Type-Options':'nosniff'});res.end(data)}
  catch{res.writeHead(404);res.end('Not found')}
}
async function handle(req,res,url,origin){
  if(url.pathname==='/admin/demand'&&req.method==='GET'){consolePage(res);return true}
  if(url.pathname==='/api/admin/demand'&&req.method==='GET'){
    const session=await S.requireAdmin(req,res,origin,'manageProduction');if(!session)return true;
    S.sendJson(res,200,{...(await A.adminData()),session:{name:session.name||'',email:session.email||'',role:session.role||'owner'}},origin);return true;
  }
  if(url.pathname==='/api/admin/demand/promotions'&&req.method==='POST'){
    const session=await S.requireAdmin(req,res,origin,'manageInventory');if(!session)return true;
    await O.activatePromo(req,res,origin,session);return true;
  }
  if(url.pathname==='/api/admin/demand/produce'&&req.method==='POST'){
    const session=await S.requireAdmin(req,res,origin,'manageProduction');if(!session)return true;
    await O.produce(req,res,origin,session);return true;
  }
  const parts=url.pathname.split('/');
  if(parts.length===6&&parts[1]==='api'&&parts[2]==='admin'&&parts[3]==='demand'&&parts[4]==='promotions'&&req.method==='PATCH'){
    const session=await S.requireAdmin(req,res,origin,'manageInventory');if(!session)return true;
    await O.promoState(req,res,origin,session,decodeURIComponent(parts[5]));return true;
  }
  return false;
}
module.exports={handle};
