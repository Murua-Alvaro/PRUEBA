'use strict';
const S=require('./demand-store');
const P=require('./demand-public');
async function handle(req,res,url,origin){
  if(url.pathname==='/api/demand/public'&&req.method==='GET'){
    S.sendJson(res,200,await P.publicData(),origin);return true;
  }
  if(url.pathname==='/api/demand/intents'&&req.method==='POST'){
    await P.createIntent(req,res,origin);return true;
  }
  return false;
}
module.exports={handle};
