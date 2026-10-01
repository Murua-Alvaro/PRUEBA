'use strict';

const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'admin.html');

try {
  let html = fs.readFileSync(target, 'utf8');

  const oldNeon = `async function neon(path,opt={}){if(!authUrl){const c=await api('/api/auth/config');authUrl=c.authUrl||''}if(!authUrl)throw new Error('AUTH_NOT_CONFIGURED');const r=await fetch(authUrl+path,{credentials:'include',...opt,headers:{'Content-Type':'application/json',...(opt.headers||{})}});const j=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(j.message||j.error||'AUTH_ERROR');e.payload=j;throw e}return j}`;
  const newNeon = `async function neon(path,opt={}){if(!authUrl){const c=await api('/api/auth/config');authUrl=c.authUrl||''}if(!authUrl){const e=new Error('AUTH_NOT_CONFIGURED');e.code='AUTH_NOT_CONFIGURED';throw e}const r=await fetch(authUrl+path,{credentials:'include',...opt,headers:{'Content-Type':'application/json',...(opt.headers||{})}});const j=await r.json().catch(()=>({}));if(!r.ok){const code=j.code||j.error?.code||j.error||j.message||'AUTH_ERROR';const e=new Error(typeof code==='string'?code:'AUTH_ERROR');e.code=typeof code==='string'?code:'AUTH_ERROR';e.payload=j;throw e}return j}`;

  const oldVerify = `async function verifyOtp(){const otp=$('#otp').value.replace(/\\D/g,'');if(otp.length<6)return setMsg('#codeMessage','Escribe el código completo.');$('#verifyCode').disabled=true;setMsg('#codeMessage','');try{const name=$('#name').value.trim()||authEmail.split('@')[0];await neon('/sign-in/email-otp',{method:'POST',body:JSON.stringify({email:authEmail,otp,name})});const current=await neon('/get-session',{method:'GET'});const token=current?.session?.token||current?.data?.session?.token||current?.token||'';if(!token)throw new Error('NO_SESSION_TOKEN');try{await api('/api/auth/account/exchange',{method:'POST',body:JSON.stringify({sessionToken:token})});await enterApp()}catch(e){if(e.code==='PENDING_APPROVAL'||e.code==='ACCESS_REJECTED'||e.code==='ACCESS_SUSPENDED'){showAuthStep('pendingStep');$('#pendingEmail').textContent=authEmail;return}throw e}}catch(e){setMsg('#codeMessage','Código inválido, expirado o no fue posible abrir la sesión.')}finally{$('#verifyCode').disabled=false}}`;

  const newVerify = `async function verifyOtp(){const otp=$('#otp').value.replace(/\\D/g,'').slice(0,6);if(otp.length!==6)return setMsg('#codeMessage','Escribe los 6 dígitos del código.');$('#verifyCode').disabled=true;setMsg('#codeMessage','');try{const name=$('#name').value.trim()||authEmail.split('@')[0];const signed=await neon('/sign-in/email-otp',{method:'POST',body:JSON.stringify({email:authEmail,otp,name})});let token=signed?.token||signed?.session?.token||signed?.data?.token||signed?.data?.session?.token||'';if(!token){try{const current=await neon('/get-session',{method:'GET'});token=current?.session?.token||current?.data?.session?.token||current?.token||current?.data?.token||''}catch{}}if(!token){const e=new Error('AUTH_SESSION_NOT_FOUND');e.code='AUTH_SESSION_NOT_FOUND';throw e}try{await api('/api/auth/account/exchange',{method:'POST',body:JSON.stringify({sessionToken:token})});await enterApp()}catch(e){if(e.code==='PENDING_APPROVAL'||e.code==='ACCESS_REJECTED'||e.code==='ACCESS_SUSPENDED'){showAuthStep('pendingStep');$('#pendingEmail').textContent=authEmail;return}throw e}}catch(e){const code=e.code||e.payload?.code||e.payload?.error?.code||e.payload?.error||e.payload?.message||e.message||'AUTH_ERROR';const messages={INVALID_OTP:'Ese código no coincide. Solicita uno nuevo e introduce únicamente el último código recibido.',OTP_EXPIRED:'El código expiró. Solicita uno nuevo.',TOO_MANY_ATTEMPTS:'El código quedó invalidado por demasiados intentos. Solicita uno nuevo.',AUTH_SESSION_NOT_FOUND:'El código fue aceptado, pero no se pudo abrir la sesión del navegador. Solicita un código nuevo e inténtalo otra vez.',INVALID_AUTH_SESSION:'La verificación fue correcta, pero la sesión no llegó al panel. Solicita un código nuevo.',EMAIL_NOT_VERIFIED:'El correo todavía no aparece como verificado.',AUTH_ERROR:'No fue posible completar la verificación.'};console.error('MIGA OTP error',code);setMsg('#codeMessage',messages[code]||('No se pudo completar el acceso ('+code+'). Solicita un código nuevo.'))}finally{$('#verifyCode').disabled=false}}`;

  if (!html.includes(oldNeon)) throw new Error('No se encontró el bloque neon() esperado');
  if (!html.includes(oldVerify)) throw new Error('No se encontró el bloque verifyOtp() esperado');

  html = html.replace(oldNeon, newNeon).replace(oldVerify, newVerify);
  fs.writeFileSync(target, html, 'utf8');
  console.log('MIGA admin OTP patch OK: token response + fallback session enabled');
} catch (error) {
  console.error('MIGA admin OTP patch failed:', error?.message || error);
}
