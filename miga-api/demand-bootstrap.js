'use strict';
const http=require('http');
const publicRoutes=require('./demand-public-router');
const adminRoutes=require('./demand-admin-router');
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
