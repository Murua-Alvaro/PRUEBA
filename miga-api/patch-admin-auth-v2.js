'use strict';

const fs = require('fs');
const path = require('path');

const serverTarget = path.join(__dirname, 'server.js');
const adminTarget = path.join(__dirname, 'admin.html');

try {
  let server = fs.readFileSync(serverTarget, 'utf8');

  server = server.replace(
    "if (!NEON_AUTH_URL || !authPool) return json(res, 503, { ok: false, error: 'AUTH_NOT_CONFIGURED' }, origin);",
    "if (!NEON_AUTH_URL) return json(res, 503, { ok: false, error: 'AUTH_NOT_CONFIGURED' }, origin);"
  );

  server = server.replace(
    "body: JSON.stringify({ email, otp })",
    "body: JSON.stringify({ email, otp, name: requestedName || email.split('@')[0] })"
  );

  const lookupPattern = /      const accountResult = await authDb\(\)\.query\([\s\S]*?      const account = accountResult\.rows\[0\];/;

  const newAccountLookup = `      const returnedUser = payload?.user || payload?.data?.user || payload?.session?.user || payload?.data?.session?.user || null;\n      const verifiedEmail = String(returnedUser?.email || email).trim().toLowerCase();\n      const rawAuthId = String(returnedUser?.id || '').trim();\n      const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawAuthId);\n      const fallbackHex = crypto.createHash('sha256').update('migajeros-bakery:' + verifiedEmail).digest('hex').slice(0, 32).split('');\n      fallbackHex[12] = '4';\n      fallbackHex[16] = ['8','9','a','b'][parseInt(fallbackHex[16], 16) % 4];\n      const fallbackId = fallbackHex.slice(0,8).join('') + '-' + fallbackHex.slice(8,12).join('') + '-' + fallbackHex.slice(12,16).join('') + '-' + fallbackHex.slice(16,20).join('') + '-' + fallbackHex.slice(20,32).join('');\n      const account = {\n        user_id: uuidLike ? rawAuthId : fallbackId,\n        email: verifiedEmail,\n        name: returnedUser?.name || requestedName || verifiedEmail.split('@')[0]\n      };\n      await securityAudit(req, 'otp_identity_resolved', { email: verifiedEmail, source: returnedUser?.id ? 'neon-auth-response' : 'verified-email-fallback' }, { userId: account.user_id, email: verifiedEmail });`;

  if (!lookupPattern.test(server)) throw new Error('No se encontró el bloque de consulta de Neon Auth');
  server = server.replace(lookupPattern, newAccountLookup);

  fs.writeFileSync(serverTarget, server, 'utf8');
  console.log('Migajeros Bakery auth v2 OK: verified OTP email resolves application identity');
} catch (error) {
  console.error('Migajeros Bakery auth v2 failed:', error?.message || error);
}

try {
  let html = fs.readFileSync(adminTarget, 'utf8');
  html = html.replace(
    "AUTH_USER_NOT_FOUND:'El código fue aceptado, pero Neon no encontró la cuenta asociada.',",
    "AUTH_USER_NOT_FOUND:'El código fue aceptado, pero hubo un problema al crear la sesión. Solicita un código nuevo.',"
  );
  fs.writeFileSync(adminTarget, html, 'utf8');
} catch (error) {
  console.error('Migajeros Bakery auth v2 admin message failed:', error?.message || error);
}
