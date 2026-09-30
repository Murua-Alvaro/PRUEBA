const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 10000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'MigaDemo2026!';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'miga-dev-secret-change-me';
const PUBLIC_ORIGIN = process.env.PUBLIC_ORIGIN || 'https://miga-horno-vivo.onrender.com';
const STATE_FILE = path.join(__dirname, 'state.json');

const seed = {
  products: [
    {id:'concha-vainilla',name:'Concha de vainilla',price:28,stock:18,active:true,image:'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=85',note:'Mantequilla, vainilla y costra crujiente.'},
    {id:'rol-canela',name:'Rol de canela',price:46,stock:11,active:true,image:'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=1200&q=85',note:'Canela, mantequilla y glaseado ligero.'},
    {id:'croissant',name:'Croissant',price:52,stock:9,active:true,image:'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=85',note:'Laminado de mantequilla, fermentación lenta.'},
    {id:'masa-madre',name:'Masa madre',price:95,stock:6,active:true,image:'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=1200&q=85',note:'Fermentación de 18 horas.'},
    {id:'baguette',name:'Baguette',price:54,stock:14,active:true,image:'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=1200&q=85',note:'Corteza fina y miga abierta.'},
    {id:'empanada',name:'Empanada de guayaba',price:34,stock:8,active:true,image:'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=1200&q=85',note:'Guayaba y queso crema.'}
  ],
  batches: [
    {id:'b101',productId:'concha-vainilla',status:'baking',etaMinutes:12,total:36,reserved:8,freshMinutes:null,updatedAt:new Date().toISOString()},
    {id:'b102',productId:'rol-canela',status:'fresh',etaMinutes:0,total:24,reserved:3,freshMinutes:7,updatedAt:new Date().toISOString()},
    {id:'b103',productId:'croissant',status:'fresh',etaMinutes:0,total:18,reserved:5,freshMinutes:19,updatedAt:new Date().toISOString()},
    {id:'b104',productId:'masa-madre',status:'next',etaMinutes:145,total:20,reserved:13,freshMinutes:null,updatedAt:new Date().toISOString()}
  ],
  reservations: [],
  notifications: [],
  audit: [{at:new Date().toISOString(),type:'system',message:'Estado inicial cargado'}],
  meta: {location:'Mazatlán',open:true,closesAt:'20:30',updatedAt:new Date().toISOString()}
};

function loadState(){
  try { return JSON.parse(fs.readFileSync(STATE_FILE,'utf8')); }
  catch { fs.writeFileSync(STATE_FILE, JSON.stringify(seed,null,2)); return JSON.parse(JSON.stringify(seed)); }
}
let state = loadState();
function save(){ state.meta.updatedAt = new Date().toISOString(); fs.writeFileSync(STATE_FILE, JSON.stringify(state,null,2)); }
function audit(type,message,detail={}){
  state.audit.unshift({at:new Date().toISOString(),type,message,detail});
  state.audit = state.audit.slice(0,250); save();
}
function json(res,status,data,origin){
  res.writeHead(status,{
    'Content-Type':'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': origin === PUBLIC_ORIGIN ? origin : PUBLIC_ORIGIN,
    'Access-Control-Allow-Headers':'Content-Type, Authorization',
    'Access-Control-Allow-Methods':'GET,POST,PATCH,OPTIONS',
    'Cache-Control':'no-store',
    'X-Content-Type-Options':'nosniff',
    'Referrer-Policy':'same-origin'
  });
  res.end(JSON.stringify(data));
}
function readBody(req){
  return new Promise((resolve,reject)=>{
    let raw=''; req.on('data',c=>{ raw+=c; if(raw.length>25000){ reject(new Error('payload_too_large')); req.destroy(); }});
    req.on('end',()=>{ try{ resolve(raw?JSON.parse(raw):{}); }catch{ reject(new Error('invalid_json')); }});
  });
}
function productFor(batch){ return state.products.find(p=>p.id===batch.productId); }
function publicPayload(){
  return {
    meta:state.meta,
    products:state.products.filter(p=>p.active),
    batches:state.batches.map(b=>({...b,product:productFor(b)})),
    stats:{reservedToday:state.reservations.length,notifications:state.notifications.length}
  };
}
function sessionToken(){
  const exp = Date.now()+1000*60*60*8;
  const payload = String(exp);
  const sig = crypto.createHmac('sha256',ADMIN_SECRET).update(payload).digest('hex');
  return Buffer.from(payload+':'+sig).toString('base64url');
}
function isAdmin(req){
  const h=req.headers.authorization||''; if(!h.startsWith('Bearer ')) return false;
  try{
    const decoded=Buffer.from(h.slice(7),'base64url').toString('utf8');
    const [exp,sig]=decoded.split(':');
    if(Number(exp)<Date.now()) return false;
    const expected=crypto.createHmac('sha256',ADMIN_SECRET).update(exp).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected));
  }catch{return false;}
}
function serveFile(res,file,type='text/html; charset=utf-8'){
  try{ const data=fs.readFileSync(path.join(__dirname,file)); res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','X-Frame-Options':'DENY','X-Content-Type-Options':'nosniff'}); res.end(data); }
  catch{ res.writeHead(404); res.end('Not found'); }
}

const server=http.createServer(async (req,res)=>{
  const origin=req.headers.origin||'';
  const url=new URL(req.url,`http://${req.headers.host}`);
  if(req.method==='OPTIONS'){ res.writeHead(204,{'Access-Control-Allow-Origin':origin===PUBLIC_ORIGIN?origin:PUBLIC_ORIGIN,'Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Allow-Methods':'GET,POST,PATCH,OPTIONS'}); return res.end(); }
  if(url.pathname==='/healthz') return json(res,200,{ok:true,service:'miga-api',time:new Date().toISOString()},origin);
  if(url.pathname==='/' && req.method==='GET'){ res.writeHead(302,{Location:PUBLIC_ORIGIN}); return res.end(); }
  if(url.pathname==='/admin' && req.method==='GET') return serveFile(res,'admin.html');
  if(url.pathname==='/api/public' && req.method==='GET') return json(res,200,publicPayload(),origin);

  if(url.pathname==='/api/reservations' && req.method==='POST'){
    try{
      const body=await readBody(req); const batch=state.batches.find(b=>b.id===body.batchId); const qty=Math.max(1,Math.min(6,Number(body.qty)||1));
      if(!batch) return json(res,404,{ok:false,error:'Lote no encontrado'},origin);
      const available=Math.max(0,batch.total-batch.reserved);
      if(batch.status==='soldout'||available<qty) return json(res,409,{ok:false,error:'No hay suficientes piezas disponibles',available},origin);
      batch.reserved+=qty; batch.updatedAt=new Date().toISOString();
      const id='R-'+crypto.randomBytes(3).toString('hex').toUpperCase();
      state.reservations.unshift({id,batchId:batch.id,productId:batch.productId,qty,createdAt:new Date().toISOString(),status:'confirmed'});
      audit('reservation',`Reserva ${id}: ${qty} pieza(s)`,{batchId:batch.id});
      return json(res,201,{ok:true,id,qty,remaining:batch.total-batch.reserved},origin);
    }catch(e){ return json(res,400,{ok:false,error:e.message==='invalid_json'?'JSON inválido':'Solicitud inválida'},origin); }
  }

  if(url.pathname==='/api/notify' && req.method==='POST'){
    try{
      const body=await readBody(req); const batch=state.batches.find(b=>b.id===body.batchId);
      if(!batch) return json(res,404,{ok:false,error:'Lote no encontrado'},origin);
      const id='N-'+crypto.randomBytes(3).toString('hex').toUpperCase();
      state.notifications.unshift({id,batchId:batch.id,productId:batch.productId,createdAt:new Date().toISOString()});
      audit('notify',`Aviso solicitado para ${batch.productId}`,{batchId:batch.id});
      return json(res,201,{ok:true,id},origin);
    }catch{ return json(res,400,{ok:false,error:'Solicitud inválida'},origin); }
  }

  if(url.pathname==='/api/admin/login' && req.method==='POST'){
    try{ const body=await readBody(req); if(body.password!==ADMIN_PASSWORD){ audit('auth_failed','Intento de acceso rechazado'); return json(res,401,{ok:false,error:'Credenciales inválidas'},origin); }
      audit('auth','Inicio de sesión administrativo'); return json(res,200,{ok:true,token:sessionToken()},origin);
    }catch{ return json(res,400,{ok:false,error:'Solicitud inválida'},origin); }
  }

  if(url.pathname.startsWith('/api/admin/')){
    if(!isAdmin(req)) return json(res,401,{ok:false,error:'No autorizado'},origin);
    if(url.pathname==='/api/admin/overview' && req.method==='GET') return json(res,200,{...publicPayload(),reservations:state.reservations.slice(0,40),audit:state.audit.slice(0,60)},origin);
    if(url.pathname==='/api/admin/audit' && req.method==='GET') return json(res,200,{audit:state.audit.slice(0,200)},origin);

    const batchMatch=url.pathname.match(/^\/api\/admin\/batches\/([^/]+)$/);
    if(batchMatch && req.method==='PATCH'){
      try{
        const body=await readBody(req); const batch=state.batches.find(b=>b.id===batchMatch[1]); if(!batch) return json(res,404,{ok:false,error:'Lote no encontrado'},origin);
        if(body.status && ['baking','fresh','next','soldout'].includes(body.status)) batch.status=body.status;
        if(Number.isFinite(Number(body.etaMinutes))) batch.etaMinutes=Math.max(0,Number(body.etaMinutes));
        if(Number.isFinite(Number(body.total))) batch.total=Math.max(batch.reserved,Number(body.total));
        if(Number.isFinite(Number(body.freshMinutes))) batch.freshMinutes=Math.max(0,Number(body.freshMinutes));
        batch.updatedAt=new Date().toISOString(); audit('batch_update',`Lote ${batch.id} actualizado`,body); return json(res,200,{ok:true,batch:{...batch,product:productFor(batch)}},origin);
      }catch{ return json(res,400,{ok:false,error:'Solicitud inválida'},origin); }
    }

    const productMatch=url.pathname.match(/^\/api\/admin\/products\/([^/]+)$/);
    if(productMatch && req.method==='PATCH'){
      try{
        const body=await readBody(req); const product=state.products.find(p=>p.id===productMatch[1]); if(!product) return json(res,404,{ok:false,error:'Producto no encontrado'},origin);
        if(Number.isFinite(Number(body.stock))) product.stock=Math.max(0,Number(body.stock));
        if(Number.isFinite(Number(body.price))) product.price=Math.max(0,Number(body.price));
        if(typeof body.active==='boolean') product.active=body.active;
        audit('product_update',`Producto ${product.id} actualizado`,body); return json(res,200,{ok:true,product},origin);
      }catch{ return json(res,400,{ok:false,error:'Solicitud inválida'},origin); }
    }
  }
  return json(res,404,{ok:false,error:'Ruta no encontrada'},origin);
});

server.listen(PORT,()=>console.log(`MIGA API listening on ${PORT}`));
