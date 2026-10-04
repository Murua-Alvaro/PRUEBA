'use strict';
const http=require('http');
const publicRoutes=require('./demand-public-router');
const adminRoutes=require('./demand-admin-router');
const publicDemand=require('./demand-public');
const analytics=require('./demand-analytics');
const originalCreateServer=http.createServer.bind(http);
http.createServer=function(listener){
  return originalCreateServer(async(req,res)=>{
    const url=new URL(req.url,`http://${req.headers.host}`);
    const origin=req.headers.origin||'';
    if(await publicRoutes.handle(req,res,url,origin))return;
    if(await adminRoutes.handle(req,res,url,origin))return;
    return listener(req,res);
  });
};
setTimeout(async()=>{
  try{
    const snapshot=await publicDemand.publicData();
    const analysis=await analytics.adminData();
    console.log(`Demand engine ready; products=${snapshot.products.length}; slots=${snapshot.slots.length}; promotions=${snapshot.promotions.length}; recommendations=${analysis.recommendations.length}; surplusSignals=${analysis.surplus.length}`);
  }catch(error){
    console.error('Demand engine warmup failed:',error?.stack||error);
  }
},12000).unref();
