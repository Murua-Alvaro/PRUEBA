'use strict';

const fs = require('fs');
const path = require('path');
const serverTarget = path.join(__dirname, 'server.js');
const adminTarget = path.join(__dirname, 'admin.html');

try {
  let server = fs.readFileSync(serverTarget, 'utf8');
  const helperMarker = 'function permissionsFor(role) {';
  if (!server.includes(helperMarker)) throw new Error('helper marker missing');

  const helpers = String.raw`
const CUSTOMER_SESSION_DAYS = 30;
function stableCustomerUuid(email) {
  const chars = crypto.createHash('sha256').update('migajeros-customer:' + String(email || '').toLowerCase()).digest('hex').slice(0, 32).split('');
  chars[12] = '4';
  chars[16] = ['8','9','a','b'][parseInt(chars[16], 16) % 4];
  return chars.slice(0,8).join('') + '-' + chars.slice(8,12).join('') + '-' + chars.slice(12,16).join('') + '-' + chars.slice(16,20).join('') + '-' + chars.slice(20,32).join('');
}
function readCustomerSession(req) {
  const token = parseCookies(req.headers.cookie || '').migajeros_customer_session;
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const body = parts[0], sig = parts[1];
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  if (!safeEqual(sig, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!data.exp || Date.now() > Number(data.exp) || data.kind !== 'customer') return null;
    return data;
  } catch { return null; }
}
function setCustomerSessionCookie(res, payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, kind: 'customer', exp: Date.now() + CUSTOMER_SESSION_DAYS * 86400000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  res.setHeader('Set-Cookie', 'migajeros_customer_session=' + encodeURIComponent(body + '.' + sig) + '; HttpOnly; SameSite=None; Secure; Path=/; Max-Age=' + (CUSTOMER_SESSION_DAYS * 86400));
}
function clearCustomerSessionCookie(res) {
  res.setHeader('Set-Cookie', 'migajeros_customer_session=; HttpOnly; SameSite=None; Secure; Path=/; Max-Age=0');
}
async function ensureCustomerSchema() {
  await query("CREATE TABLE IF NOT EXISTS miga_customers (id uuid PRIMARY KEY,email text UNIQUE NOT NULL,name text NOT NULL DEFAULT '',phone text NOT NULL DEFAULT '',marketing_opt_in boolean NOT NULL DEFAULT false,favorite_bread text NOT NULL DEFAULT '',bread_preferences jsonb NOT NULL DEFAULT '{}'::jsonb,answers jsonb NOT NULL DEFAULT '{}'::jsonb,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),last_login_at timestamptz)");
  await query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id uuid");
  await query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone text NOT NULL DEFAULT ''");
  await query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'pickup'");
  await query("CREATE INDEX IF NOT EXISTS idx_miga_customers_email ON miga_customers (lower(email))");
  await query("CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders (lower(customer_email))");
}
async function requireCustomer(req, res, origin) {
  const session = readCustomerSession(req);
  if (!session?.email) { json(res, 401, { ok:false, error:'CUSTOMER_AUTH_REQUIRED' }, origin); return null; }
  await ensureCustomerSchema();
  const result = await query("SELECT id,email,name,phone,marketing_opt_in,favorite_bread,bread_preferences,answers,created_at,last_login_at FROM miga_customers WHERE id=$1::uuid LIMIT 1", [session.customerId]);
  if (!result.rowCount) { clearCustomerSessionCookie(res); json(res, 401, { ok:false, error:'CUSTOMER_AUTH_REQUIRED' }, origin); return null; }
  return result.rows[0];
}
`;
  server = server.replace(helperMarker, helpers + '\n' + helperMarker);

  const routeMarker = "    if (url.pathname === '/api/auth/config' && req.method === 'GET') {";
  if (!server.includes(routeMarker)) throw new Error('route marker missing');
  const routes = String.raw`
    if (url.pathname === '/api/customer/auth/send' && req.method === 'POST') {
      if (!rateAllowed(req, 'customer-otp-send', 10, 10 * 60000)) return json(res, 429, { ok:false, error:'TOO_MANY_REQUESTS' }, origin);
      if (!NEON_AUTH_URL) return json(res, 503, { ok:false, error:'AUTH_NOT_CONFIGURED' }, origin);
      const body = await readBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 256) return json(res, 400, { ok:false, error:'INVALID_EMAIL' }, origin);
      const requestOrigin = String(req.headers['x-forwarded-proto'] || 'https') + '://' + req.headers.host;
      const authResponse = await fetch(NEON_AUTH_URL + '/email-otp/send-verification-otp', { method:'POST', headers:{ 'Content-Type':'application/json','Origin':requestOrigin,'Referer':requestOrigin + '/admin' }, body:JSON.stringify({ email, type:'sign-in' }) });
      const payload = await authResponse.json().catch(() => ({}));
      if (!authResponse.ok) return json(res, authResponse.status >= 400 && authResponse.status < 500 ? authResponse.status : 502, { ok:false, error:String(payload?.code || payload?.error?.code || payload?.error || payload?.message || 'AUTH_SEND_FAILED') }, origin);
      return json(res, 200, { ok:true }, origin);
    }

    if (url.pathname === '/api/customer/auth/verify' && req.method === 'POST') {
      if (!rateAllowed(req, 'customer-otp-verify', 14, 10 * 60000)) return json(res, 429, { ok:false, error:'TOO_MANY_REQUESTS' }, origin);
      if (!NEON_AUTH_URL) return json(res, 503, { ok:false, error:'AUTH_NOT_CONFIGURED' }, origin);
      await ensureCustomerSchema();
      const body = await readBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const otp = String(body.otp || '').replace(/\D/g, '').slice(0, 6);
      const name = String(body.name || '').trim().slice(0, 120);
      const phone = String(body.phone || '').trim().slice(0, 40);
      const favoriteBread = String(body.favoriteBread || '').trim().slice(0, 120);
      const marketingOptIn = Boolean(body.marketingOptIn);
      const breadPreferences = body.breadPreferences && typeof body.breadPreferences === 'object' ? body.breadPreferences : {};
      const answers = body.answers && typeof body.answers === 'object' ? body.answers : {};
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { ok:false, error:'INVALID_EMAIL' }, origin);
      if (otp.length !== 6) return json(res, 400, { ok:false, error:'INVALID_OTP' }, origin);
      const requestOrigin = String(req.headers['x-forwarded-proto'] || 'https') + '://' + req.headers.host;
      const authResponse = await fetch(NEON_AUTH_URL + '/sign-in/email-otp', { method:'POST', headers:{ 'Content-Type':'application/json','Origin':requestOrigin,'Referer':requestOrigin + '/admin' }, body:JSON.stringify({ email, otp, name:name || email.split('@')[0] }) });
      const payload = await authResponse.json().catch(() => ({}));
      if (!authResponse.ok) return json(res, authResponse.status >= 400 && authResponse.status < 500 ? authResponse.status : 502, { ok:false, error:String(payload?.code || payload?.error?.code || payload?.error || payload?.message || 'INVALID_OTP') }, origin);
      const returnedUser = payload?.user || payload?.data?.user || payload?.session?.user || payload?.data?.session?.user || null;
      const rawId = String(returnedUser?.id || '');
      const customerId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawId) ? rawId : stableCustomerUuid(email);
      const finalName = name || String(returnedUser?.name || '').trim() || email.split('@')[0];
      await query("INSERT INTO miga_customers (id,email,name,phone,marketing_opt_in,favorite_bread,bread_preferences,answers,last_login_at) VALUES ($1::uuid,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,now()) ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name,phone=CASE WHEN EXCLUDED.phone<>'' THEN EXCLUDED.phone ELSE miga_customers.phone END,marketing_opt_in=EXCLUDED.marketing_opt_in,favorite_bread=CASE WHEN EXCLUDED.favorite_bread<>'' THEN EXCLUDED.favorite_bread ELSE miga_customers.favorite_bread END,bread_preferences=CASE WHEN EXCLUDED.bread_preferences<>'{}'::jsonb THEN EXCLUDED.bread_preferences ELSE miga_customers.bread_preferences END,answers=CASE WHEN EXCLUDED.answers<>'{}'::jsonb THEN EXCLUDED.answers ELSE miga_customers.answers END,last_login_at=now(),updated_at=now()", [customerId,email,finalName,phone,marketingOptIn,favoriteBread,JSON.stringify(breadPreferences),JSON.stringify(answers)]);
      const result = await query("SELECT id,email,name,phone,marketing_opt_in,favorite_bread,bread_preferences,answers FROM miga_customers WHERE lower(email)=lower($1) LIMIT 1", [email]);
      const customer = result.rows[0];
      setCustomerSessionCookie(res, { customerId:customer.id,email:customer.email,name:customer.name });
      return json(res, 200, { ok:true, customer:{ id:customer.id,email:customer.email,name:customer.name,phone:customer.phone,marketingOptIn:customer.marketing_opt_in,favoriteBread:customer.favorite_bread,breadPreferences:customer.bread_preferences,answers:customer.answers } }, origin);
    }

    if (url.pathname === '/api/customer/session' && req.method === 'GET') {
      const customer = await requireCustomer(req, res, origin); if (!customer) return;
      return json(res, 200, { ok:true, customer:{ id:customer.id,email:customer.email,name:customer.name,phone:customer.phone,marketingOptIn:customer.marketing_opt_in,favoriteBread:customer.favorite_bread,breadPreferences:customer.bread_preferences,answers:customer.answers } }, origin);
    }

    if (url.pathname === '/api/customer/logout' && req.method === 'POST') { clearCustomerSessionCookie(res); return json(res, 200, { ok:true }, origin); }

    if (url.pathname === '/api/customer/orders' && req.method === 'GET') {
      const customer = await requireCustomer(req, res, origin); if (!customer) return;
      const result = await query("SELECT o.*,COALESCE(jsonb_agg(jsonb_build_object('productId',oi.product_id,'batchId',oi.batch_id,'qty',oi.qty,'unitPrice',oi.unit_price,'lineTotal',oi.line_total,'productName',p.name) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL),'[]'::jsonb) items FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id LEFT JOIN products p ON p.id=oi.product_id WHERE lower(o.customer_email)=lower($1) GROUP BY o.id ORDER BY o.created_at DESC LIMIT 100", [customer.email]);
      return json(res, 200, { ok:true, orders:result.rows.map(mapOrder) }, origin);
    }

    if (url.pathname === '/api/customer/reservations' && req.method === 'POST') {
      if (!rateAllowed(req, 'customer-reservations', 30, 60000)) return json(res, 429, { ok:false, error:'TOO_MANY_REQUESTS' }, origin);
      const customer = await requireCustomer(req, res, origin); if (!customer) return;
      const body = await readBody(req);
      const batchId = String(body.batchId || '');
      const qty = Math.max(1, Math.min(12, Math.trunc(Number(body.qty) || 1)));
      const paymentMethod = ['pickup','cash','card_at_store'].includes(String(body.paymentMethod || '')) ? String(body.paymentMethod) : 'pickup';
      const client = await db().connect();
      try {
        await client.query('BEGIN');
        const updated = await client.query("UPDATE batches SET reserved=reserved+$2,status=CASE WHEN reserved+$2>=total THEN 'soldout' ELSE status END,updated_at=now() WHERE id=$1 AND status<>'soldout' AND total-reserved >= $2 RETURNING id,product_id,total,reserved,status", [batchId,qty]);
        if (!updated.rowCount) { await client.query('ROLLBACK'); return json(res,409,{ok:false,error:'NO_STOCK'},origin); }
        const batch = updated.rows[0];
        const productResult = await client.query('SELECT id,name,price FROM products WHERE id=$1',[batch.product_id]);
        const product = productResult.rows[0];
        const reservationId = 'R-' + crypto.randomBytes(3).toString('hex').toUpperCase();
        const orderId = 'O-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        const unitPrice = Number(product?.price || 0);
        const total = Math.round(unitPrice * qty * 100) / 100;
        await client.query("INSERT INTO reservations (id,batch_id,product_id,qty,status) VALUES ($1,$2,$3,$4,'confirmed')",[reservationId,batch.id,batch.product_id,qty]);
        await client.query("INSERT INTO orders (id,reservation_id,status,source,customer_id,customer_name,customer_email,customer_phone,payment_method,subtotal,total) VALUES ($1,$2,'reserved','customer-web',$3::uuid,$4,$5,$6,$7,$8,$8)",[orderId,reservationId,customer.id,customer.name,customer.email,customer.phone,paymentMethod,total]);
        await client.query('INSERT INTO order_items (order_id,product_id,batch_id,qty,unit_price,line_total) VALUES ($1,$2,$3,$4,$5,$6)',[orderId,batch.product_id,batch.id,qty,unitPrice,total]);
        await insertAudit('customer_order','Pedido ' + orderId + ' de ' + customer.email,{reservationId,customerId:customer.id,batchId,qty,paymentMethod},client);
        await client.query('COMMIT');
        return json(res,201,{ok:true,id:reservationId,orderId,qty,total,paymentMethod,remaining:Math.max(0,Number(batch.total)-Number(batch.reserved))},origin);
      } catch (error) { try { await client.query('ROLLBACK'); } catch {} throw error; } finally { client.release(); }
    }

    if (url.pathname === '/api/admin/customers' && req.method === 'GET') {
      const session = await requireSession(req,res,origin,'manageUsers'); if (!session) return;
      if (String(session.email || '').toLowerCase() !== MIGA_OWNER_EMAIL) return json(res,403,{ok:false,error:'OWNER_ONLY'},origin);
      await ensureCustomerSchema();
      const result = await query("SELECT c.*,count(o.id)::int order_count,COALESCE(sum(CASE WHEN o.status<>'cancelled' THEN o.total ELSE 0 END),0) total_spent FROM miga_customers c LEFT JOIN orders o ON lower(o.customer_email)=lower(c.email) GROUP BY c.id ORDER BY c.created_at DESC LIMIT 500");
      return json(res,200,{ok:true,customers:result.rows.map(r=>({id:r.id,email:r.email,name:r.name,phone:r.phone,marketingOptIn:r.marketing_opt_in,favoriteBread:r.favorite_bread,breadPreferences:r.bread_preferences,answers:r.answers,createdAt:iso(r.created_at),lastLoginAt:iso(r.last_login_at),orderCount:Number(r.order_count||0),totalSpent:Number(r.total_spent||0)}))},origin);
    }

`;
  server = server.replace(routeMarker, routes + routeMarker);

  const sendStart = server.indexOf("if (url.pathname === '/api/auth/otp/send'");
  const verifyStart = server.indexOf("if (url.pathname === '/api/auth/otp/verify'");
  if (sendStart >= 0 && verifyStart > sendStart) {
    let block = server.slice(sendStart, verifyStart);
    block = block.replace("const email = String(body.email || '').trim().toLowerCase();", "const email = String(body.email || '').trim().toLowerCase();\n      if (!MIGA_OWNER_EMAIL || email !== MIGA_OWNER_EMAIL) return json(res,403,{ok:false,error:'ADMIN_ONLY'},origin);");
    server = server.slice(0,sendStart) + block + server.slice(verifyStart);
  }
  const verifyStart2 = server.indexOf("if (url.pathname === '/api/auth/otp/verify'");
  const exchangeStart = server.indexOf("if (url.pathname === '/api/auth/account/exchange'", verifyStart2);
  if (verifyStart2 >= 0 && exchangeStart > verifyStart2) {
    let block = server.slice(verifyStart2, exchangeStart);
    block = block.replace("const email = String(body.email || '').trim().toLowerCase();", "const email = String(body.email || '').trim().toLowerCase();\n      if (!MIGA_OWNER_EMAIL || email !== MIGA_OWNER_EMAIL) return json(res,403,{ok:false,error:'ADMIN_ONLY'},origin);");
    server = server.slice(0,verifyStart2) + block + server.slice(exchangeStart);
  }

  fs.writeFileSync(serverTarget, server, 'utf8');
  console.log('Migajeros Bakery customer platform v2 OK');
} catch (error) {
  console.error('Migajeros Bakery customer platform v2 failed:', error?.message || error);
}

try {
  let html = fs.readFileSync(adminTarget,'utf8');
  html = html.replace('Escribe tu correo. Te enviaremos un código de seis dígitos.','Acceso administrativo exclusivo. Ingresa el correo propietario para recibir tu código.');
  html = html.replace('<button class="linkbtn" id="legacyOpen">Acceso de respaldo</button>','');
  html = html.replace('<button data-view="users" data-short="USR" id="usersNav">Usuarios</button>','');
  html = html.replace('<th>Contenido</th>','<th>Cliente / contenido</th>');
  html = html.replace(/function renderOrders\(\)\{[\s\S]*?\}\nfunction renderInventory/, `function renderOrders(){const orders=data.orders||[];$('#ordersBody').innerHTML=orders.length?orders.map(o=>\`<tr><td><b>\${esc(o.id)}</b><br><span class="sub">\${esc(o.source)}</span></td><td><b>\${esc(o.customerName||'Cliente web')}</b><br><span class="sub">\${esc(o.customerEmail||'')}\${o.customerPhone?' · '+esc(o.customerPhone):''}</span><br>\${esc((o.items||[]).map(i=>\`\${i.qty}× \${i.productName||i.productId}\`).join(', ')||'—')}</td><td>\${money(o.total)}</td><td>\${date(o.createdAt)}</td><td><select data-order-status="\${esc(o.id)}"><option value="reserved" \${o.status==='reserved'?'selected':''}>Reservado</option><option value="preparing" \${o.status==='preparing'?'selected':''}>Preparando</option><option value="ready" \${o.status==='ready'?'selected':''}>Listo</option><option value="completed" \${o.status==='completed'?'selected':''}>Completado</option><option value="cancelled" \${o.status==='cancelled'?'selected':''}>Cancelado</option></select></td><td><button class="btn" data-save-order="\${esc(o.id)}">Guardar</button></td></tr>\`).join(''):'<tr><td colspan="6" class="empty">Sin pedidos.</td></tr>'}\nfunction renderInventory`);
  fs.writeFileSync(adminTarget,html,'utf8');
  console.log('Migajeros Bakery admin owner-only UI v2 OK');
} catch (error) {
  console.error('Migajeros Bakery admin owner-only UI v2 failed:', error?.message || error);
}
