'use strict';

const fs = require('fs');
const path = require('path');

const adminTarget = path.join(__dirname, 'admin.html');
const serverTarget = path.join(__dirname, 'server.js');

try {
  let html = fs.readFileSync(adminTarget, 'utf8');

  const oldSend = `async function sendOtp(){const email=$('#email').value.trim().toLowerCase();if(!email)return setMsg('#emailMessage','Escribe un correo válido.');authEmail=email;$('#sendCode').disabled=true;setMsg('#emailMessage','');try{await neon('/email-otp/send-verification-otp',{method:'POST',body:JSON.stringify({email,type:'sign-in'})});$('#sentTo').textContent=email;showAuthStep('codeStep');setMsg('#codeMessage','Código enviado. Revisa también spam.',true);$('#otp').focus()}catch(e){setMsg('#emailMessage','No fue posible enviar el código. Intenta nuevamente.')}finally{$('#sendCode').disabled=false}}`;

  const newSend = `async function sendOtp(){const email=$('#email').value.trim().toLowerCase();if(!email)return setMsg('#emailMessage','Escribe un correo válido.');authEmail=email;$('#sendCode').disabled=true;setMsg('#emailMessage','');try{await api('/api/auth/otp/send',{method:'POST',body:JSON.stringify({email})});$('#sentTo').textContent=email;$('#otp').value='';showAuthStep('codeStep');setMsg('#codeMessage','Código nuevo enviado. Usa únicamente el último código recibido.',true);$('#otp').focus()}catch(e){const code=e.code||e.message||'AUTH_ERROR';const messages={TOO_MANY_REQUESTS:'Se solicitaron demasiados códigos. Intenta de nuevo más tarde.',AUTH_NOT_CONFIGURED:'El servicio de autenticación no está disponible.',INVALID_EMAIL:'Escribe un correo válido.'};setMsg('#emailMessage',messages[code]||'No fue posible enviar el código. Intenta nuevamente.')}finally{$('#sendCode').disabled=false}}`;

  const oldVerifyOriginal = `async function verifyOtp(){const otp=$('#otp').value.replace(/\\D/g,'');if(otp.length<6)return setMsg('#codeMessage','Escribe el código completo.');$('#verifyCode').disabled=true;setMsg('#codeMessage','');try{const name=$('#name').value.trim()||authEmail.split('@')[0];await neon('/sign-in/email-otp',{method:'POST',body:JSON.stringify({email:authEmail,otp,name})});const current=await neon('/get-session',{method:'GET'});const token=current?.session?.token||current?.data?.session?.token||current?.token||'';if(!token)throw new Error('NO_SESSION_TOKEN');try{await api('/api/auth/account/exchange',{method:'POST',body:JSON.stringify({sessionToken:token})});await enterApp()}catch(e){if(e.code==='PENDING_APPROVAL'||e.code==='ACCESS_REJECTED'||e.code==='ACCESS_SUSPENDED'){showAuthStep('pendingStep');$('#pendingEmail').textContent=authEmail;return}throw e}}catch(e){setMsg('#codeMessage','Código inválido, expirado o no fue posible abrir la sesión.')}finally{$('#verifyCode').disabled=false}}`;

  const oldVerifyPatched = `async function verifyOtp(){const otp=$('#otp').value.replace(/\\D/g,'').slice(0,6);if(otp.length!==6)return setMsg('#codeMessage','Escribe los 6 dígitos del código.');$('#verifyCode').disabled=true;setMsg('#codeMessage','');try{const name=$('#name').value.trim()||authEmail.split('@')[0];const signed=await neon('/sign-in/email-otp',{method:'POST',body:JSON.stringify({email:authEmail,otp,name})});let token=signed?.token||signed?.session?.token||signed?.data?.token||signed?.data?.session?.token||'';if(!token){try{const current=await neon('/get-session',{method:'GET'});token=current?.session?.token||current?.data?.session?.token||current?.token||current?.data?.token||''}catch{}}if(!token){const e=new Error('AUTH_SESSION_NOT_FOUND');e.code='AUTH_SESSION_NOT_FOUND';throw e}try{await api('/api/auth/account/exchange',{method:'POST',body:JSON.stringify({sessionToken:token})});await enterApp()}catch(e){if(e.code==='PENDING_APPROVAL'||e.code==='ACCESS_REJECTED'||e.code==='ACCESS_SUSPENDED'){showAuthStep('pendingStep');$('#pendingEmail').textContent=authEmail;return}throw e}}catch(e){const code=e.code||e.payload?.code||e.payload?.error?.code||e.payload?.error||e.payload?.message||e.message||'AUTH_ERROR';const messages={INVALID_OTP:'Ese código no coincide. Solicita uno nuevo e introduce únicamente el último código recibido.',OTP_EXPIRED:'El código expiró. Solicita uno nuevo.',TOO_MANY_ATTEMPTS:'El código quedó invalidado por demasiados intentos. Solicita uno nuevo.',AUTH_SESSION_NOT_FOUND:'El código fue aceptado, pero no se pudo abrir la sesión del navegador. Solicita un código nuevo e inténtalo otra vez.',INVALID_AUTH_SESSION:'La verificación fue correcta, pero la sesión no llegó al panel. Solicita un código nuevo.',EMAIL_NOT_VERIFIED:'El correo todavía no aparece como verificado.',AUTH_ERROR:'No fue posible completar la verificación.'};console.error('MIGA OTP error',code);setMsg('#codeMessage',messages[code]||('No se pudo completar el acceso ('+code+'). Solicita un código nuevo.'))}finally{$('#verifyCode').disabled=false}}`;

  const newVerify = `async function verifyOtp(){const otp=$('#otp').value.replace(/\\D/g,'').slice(0,6);if(otp.length!==6)return setMsg('#codeMessage','Escribe los 6 dígitos del código.');$('#verifyCode').disabled=true;setMsg('#codeMessage','');try{const name=$('#name').value.trim()||authEmail.split('@')[0];await api('/api/auth/otp/verify',{method:'POST',body:JSON.stringify({email:authEmail,otp,name})});await enterApp()}catch(e){if(e.code==='PENDING_APPROVAL'||e.code==='ACCESS_REJECTED'||e.code==='ACCESS_SUSPENDED'){showAuthStep('pendingStep');$('#pendingEmail').textContent=authEmail;return}const code=e.code||e.payload?.code||e.payload?.error?.code||e.payload?.error||e.payload?.message||e.message||'AUTH_ERROR';const messages={INVALID_OTP:'Ese código no coincide. Solicita uno nuevo y usa únicamente el último código recibido.',OTP_EXPIRED:'El código expiró. Solicita uno nuevo.',TOO_MANY_ATTEMPTS:'Hubo demasiados intentos. Solicita un código nuevo.',TOO_MANY_REQUESTS:'Hubo demasiados intentos. Solicita un código nuevo en unos minutos.',AUTH_USER_NOT_FOUND:'El código fue aceptado, pero Neon no encontró la cuenta asociada.',AUTH_NOT_CONFIGURED:'El servicio de autenticación no está disponible.',INVALID_EMAIL:'El correo no es válido.'};console.error('Migajeros Bakery OTP error',code);setMsg('#codeMessage',messages[code]||('No se pudo completar el acceso ('+code+'). Solicita un código nuevo.'))}finally{$('#verifyCode').disabled=false}}`;

  if (html.includes(oldSend)) html = html.replace(oldSend, newSend);
  if (html.includes(oldVerifyPatched)) html = html.replace(oldVerifyPatched, newVerify);
  else if (html.includes(oldVerifyOriginal)) html = html.replace(oldVerifyOriginal, newVerify);
  else throw new Error('No se encontró verifyOtp() esperado');

  html = html
    .replaceAll('<title>MIGA · Operación</title>', '<title>Migajeros Bakery · Operación</title>')
    .replaceAll('<div class="wordmark">MIGA</div>', '<div class="wordmark">Migajeros Bakery</div>')
    .replaceAll('<b>MIGA</b><small>Operación</small>', '<b>Migajeros Bakery</b><small>Operación</small>')
    .replaceAll("||'MIGA'", "||'Migajeros Bakery'")
    .replaceAll('MIGA OTP error', 'Migajeros Bakery OTP error');

  fs.writeFileSync(adminTarget, html, 'utf8');
  console.log('Migajeros Bakery admin patch OK: OTP same-origin enabled');
} catch (error) {
  console.error('Migajeros Bakery admin patch failed:', error?.message || error);
}

try {
  let server = fs.readFileSync(serverTarget, 'utf8');
  const marker = `    if (url.pathname === '/api/auth/account/exchange' && req.method === 'POST') {`;
  if (!server.includes(marker)) throw new Error('No se encontró marcador de auth exchange');

  const injected = `    if (url.pathname === '/api/auth/otp/send' && req.method === 'POST') {
      if (!rateAllowed(req, 'auth-otp-send', 8, 10 * 60000)) return json(res, 429, { ok: false, error: 'TOO_MANY_REQUESTS' }, origin);
      if (!NEON_AUTH_URL) return json(res, 503, { ok: false, error: 'AUTH_NOT_CONFIGURED' }, origin);
      const body = await readBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email) || email.length > 256) return json(res, 400, { ok: false, error: 'INVALID_EMAIL' }, origin);
      const requestOrigin = String(req.headers['x-forwarded-proto'] || 'https') + '://' + req.headers.host;
      const authResponse = await fetch(NEON_AUTH_URL + '/email-otp/send-verification-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': requestOrigin, 'Referer': requestOrigin + '/admin' },
        body: JSON.stringify({ email, type: 'sign-in' })
      });
      const payload = await authResponse.json().catch(() => ({}));
      if (!authResponse.ok) {
        const code = payload?.code || payload?.error?.code || payload?.error || payload?.message || 'AUTH_SEND_FAILED';
        await securityAudit(req, 'otp_send_failed', { email, code });
        return json(res, authResponse.status >= 400 && authResponse.status < 500 ? authResponse.status : 502, { ok: false, error: String(code) }, origin);
      }
      await securityAudit(req, 'otp_sent', { email });
      return json(res, 200, { ok: true }, origin);
    }

    if (url.pathname === '/api/auth/otp/verify' && req.method === 'POST') {
      if (!rateAllowed(req, 'auth-otp-verify', 12, 10 * 60000)) return json(res, 429, { ok: false, error: 'TOO_MANY_REQUESTS' }, origin);
      if (!NEON_AUTH_URL || !authPool) return json(res, 503, { ok: false, error: 'AUTH_NOT_CONFIGURED' }, origin);
      const body = await readBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const otp = String(body.otp || '').replace(/\\D/g, '').slice(0, 6);
      const requestedName = String(body.name || '').trim().slice(0, 255);
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email) || email.length > 256) return json(res, 400, { ok: false, error: 'INVALID_EMAIL' }, origin);
      if (otp.length !== 6) return json(res, 400, { ok: false, error: 'INVALID_OTP' }, origin);

      const requestOrigin = String(req.headers['x-forwarded-proto'] || 'https') + '://' + req.headers.host;
      const authResponse = await fetch(NEON_AUTH_URL + '/sign-in/email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': requestOrigin, 'Referer': requestOrigin + '/admin' },
        body: JSON.stringify({ email, otp })
      });
      const payload = await authResponse.json().catch(() => ({}));
      if (!authResponse.ok) {
        const code = payload?.code || payload?.error?.code || payload?.error || payload?.message || 'INVALID_OTP';
        await securityAudit(req, 'otp_verify_failed', { email, code });
        return json(res, authResponse.status >= 400 && authResponse.status < 500 ? authResponse.status : 502, { ok: false, error: String(code) }, origin);
      }

      const accountResult = await authDb().query(
        'SELECT id user_id,email,name,"emailVerified" email_verified FROM neon_auth."user" WHERE lower(email)=lower($1) LIMIT 1',
        [email]
      );
      if (!accountResult.rowCount) {
        await securityAudit(req, 'auth_user_not_found', { email });
        return json(res, 404, { ok: false, error: 'AUTH_USER_NOT_FOUND' }, origin);
      }
      const account = accountResult.rows[0];
      const normalizedEmail = String(account.email || email).trim().toLowerCase();
      const isOwner = Boolean(MIGA_OWNER_EMAIL && normalizedEmail === MIGA_OWNER_EMAIL);
      const displayName = requestedName || account.name || normalizedEmail.split('@')[0];

      await query(
        \`INSERT INTO miga_user_access (user_id,email,name,access_status,role,approved_at,approved_by,last_login_at)
         VALUES ($1::uuid,$2,$3,$4,$5,CASE WHEN $4='approved' THEN now() ELSE NULL END,CASE WHEN $4='approved' THEN 'system-owner' ELSE NULL END,now())
         ON CONFLICT (user_id) DO UPDATE SET
           email=EXCLUDED.email,name=CASE WHEN EXCLUDED.name<>'' THEN EXCLUDED.name ELSE miga_user_access.name END,last_login_at=now(),updated_at=now()\`,
        [account.user_id, normalizedEmail, displayName, isOwner ? 'approved' : 'pending', isOwner ? 'owner' : 'staff']
      );
      if (isOwner) {
        await query(
          \`UPDATE miga_user_access
           SET access_status='approved',role='owner',approved_at=COALESCE(approved_at,now()),approved_by='system-owner',updated_at=now()
           WHERE user_id=$1::uuid\`,
          [account.user_id]
        );
      }

      const accessResult = await query(
        'SELECT user_id,email,name,access_status,role,session_version FROM miga_user_access WHERE user_id=$1::uuid LIMIT 1',
        [account.user_id]
      );
      const access = accessResult.rows[0];
      if (access.access_status !== 'approved') {
        await securityAudit(req, 'access_' + access.access_status, {}, { userId: account.user_id, email: normalizedEmail });
        const code = access.access_status === 'pending' ? 'PENDING_APPROVAL' : access.access_status === 'suspended' ? 'ACCESS_SUSPENDED' : 'ACCESS_REJECTED';
        return json(res, 403, { ok: false, error: code, account: { status: access.access_status, email: normalizedEmail, name: access.name } }, origin);
      }

      const appSession = {
        userId: access.user_id, email: access.email, name: access.name,
        role: access.role, sessionVersion: Number(access.session_version || 1)
      };
      setSessionCookie(res, signSession(appSession));
      await securityAudit(req, 'login_success', { role: access.role, method: 'email_otp_same_origin' }, appSession);
      return json(res, 200, { ok: true, ...appSession, permissions: permissionsFor(access.role) }, origin);
    }

`;

  server = server.replace(marker, injected + marker);
  server = server.replaceAll("service: 'miga-api'", "service: 'migajeros-bakery-api'");
  server = server.replaceAll('MIGA API error:', 'Migajeros Bakery API error:');
  server = server.replaceAll('MIGA API listening on', 'Migajeros Bakery API listening on');
  fs.writeFileSync(serverTarget, server, 'utf8');
  console.log('Migajeros Bakery backend auth patch OK: server-side OTP enabled');
} catch (error) {
  console.error('Migajeros Bakery backend auth patch failed:', error?.message || error);
}
