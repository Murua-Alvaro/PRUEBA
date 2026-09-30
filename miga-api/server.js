const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

function loadPg() {
  try {
    return require('pg');
  } catch {
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    execFileSync(npm, ['install', '--omit=dev', '--no-audit', '--no-fund'], { cwd: __dirname, stdio: 'inherit' });
    return require('pg');
  }
}

const { Pool } = loadPg();

const PORT = process.env.PORT || 10000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const DATABASE_URL = process.env.DATABASE_URL || '';
const AUTH_DATABASE_URL = process.env.AUTH_DATABASE_URL || '';
const NEON_AUTH_URL = process.env.NEON_AUTH_URL || '';
const MIGA_OWNER_EMAIL = String(process.env.MIGA_OWNER_EMAIL || '').trim().toLowerCase();
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.createHash('sha256').update('miga-session:' + DATABASE_URL).digest('hex');
const PUBLIC_ORIGIN = process.env.PUBLIC_ORIGIN || 'https://miga-horno-vivo.onrender.com';
const SESSION_DAYS = 7;
const rateBuckets = new Map();

const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL, max: 6, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000 }) : null;
const authPool = AUTH_DATABASE_URL ? new Pool({ connectionString: AUTH_DATABASE_URL, max: 3, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000 }) : null;

function db() {
  if (!pool) throw new Error('database_not_configured');
  return pool;
}
function authDb() {
  if (!authPool) throw new Error('auth_database_not_configured');
  return authPool;
}
function query(text, params = []) { return db().query(text, params); }
function iso(value) { return value ? new Date(value).toISOString() : null; }
function safeEqual(a, b) {
  const x = Buffer.from(String(a || ''));
  const y = Buffer.from(String(b || ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
}
function rateAllowed(req, bucket, max, windowMs) {
  const now = Date.now();
  const key = `${bucket}:${clientIp(req)}`;
  const current = rateBuckets.get(key);
  if (!current || now - current.startedAt > windowMs) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= max;
}
function json(res, status, data, origin = '') {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': origin === PUBLIC_ORIGIN ? origin : PUBLIC_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin'
  });
  res.end(JSON.stringify(data));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 50000) {
        reject(new Error('payload_too_large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch { reject(new Error('invalid_json')); }
    });
  });
}
function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map(part => part.trim()).filter(Boolean).map(part => {
    const idx = part.indexOf('=');
    return idx < 0 ? [part, ''] : [part.slice(0, idx), decodeURIComponent(part.slice(idx + 1))];
  }));
}
function signSession(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + SESSION_DAYS * 86400000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}
function readSignedSession(req) {
  const token = parseCookies(req.headers.cookie || '').miga_session;
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  if (!safeEqual(sig, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!data.exp || Date.now() > Number(data.exp)) return null;
    return data;
  } catch { return null; }
}
function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', `miga_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Secure; Path=/; Max-Age=${SESSION_DAYS * 86400}`);
}
function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'miga_session=; HttpOnly; SameSite=Lax; Secure; Path=/; Max-Age=0');
}
function permissionsFor(role) {
  if (role === 'owner') return { manageUsers: true, manageOrders: true, manageInventory: true, manageProduction: true, viewAudit: true };
  if (role === 'manager') return { manageUsers: false, manageOrders: true, manageInventory: true, manageProduction: true, viewAudit: true };
  return { manageUsers: false, manageOrders: true, manageInventory: false, manageProduction: true, viewAudit: false };
}
async function securityAudit(req, action, detail = {}, session = null) {
  try {
    await query(
      `INSERT INTO miga_security_audit (user_id,email,action,detail,ip_address)
       VALUES ($1,$2,$3,$4::jsonb,$5)`,
      [session?.userId || null, session?.email || '', action, JSON.stringify(detail || {}), clientIp(req)]
    );
  } catch (error) {
    console.warn('security audit failed:', error.message);
  }
}
async function hydrateSession(session) {
  if (!session) return null;
  if (session.legacy === true) return { ...session, permissions: permissionsFor('owner') };
  if (!session.userId) return null;
  const result = await query(
    `SELECT user_id,email,name,access_status,role,session_version
     FROM miga_user_access WHERE user_id=$1::uuid LIMIT 1`,
    [session.userId]
  );
  const access = result.rows[0];
  if (!access || access.access_status !== 'approved') return null;
  if (Number(access.session_version || 1) !== Number(session.sessionVersion || 1)) return null;
  return {
    userId: access.user_id,
    email: access.email,
    name: access.name,
    role: access.role,
    sessionVersion: Number(access.session_version || 1),
    permissions: permissionsFor(access.role)
  };
}
async function requestSession(req) {
  return hydrateSession(readSignedSession(req));
}
async function requireSession(req, res, origin, permission = null) {
  const session = await requestSession(req);
  if (!session) {
    json(res, 401, { ok: false, error: 'AUTH_REQUIRED' }, origin);
    return null;
  }
  if (permission && !session.permissions?.[permission]) {
    json(res, 403, { ok: false, error: 'FORBIDDEN' }, origin);
    return null;
  }
  return session;
}

function mapProduct(row) {
  return {
    id: row.id, name: row.name, price: Number(row.price), stock: Number(row.stock),
    active: Boolean(row.active), image: row.image, note: row.note, updatedAt: iso(row.updated_at)
  };
}
function mapBatch(row, product) {
  return {
    id: row.id, productId: row.product_id, status: row.status,
    etaMinutes: Number(row.eta_minutes), total: Number(row.total), reserved: Number(row.reserved),
    freshMinutes: row.fresh_minutes == null ? null : Number(row.fresh_minutes),
    updatedAt: iso(row.updated_at), product: product || null
  };
}
function mapReservation(row) {
  return {
    id: row.id, batchId: row.batch_id, productId: row.product_id,
    qty: Number(row.qty), createdAt: iso(row.created_at), status: row.status
  };
}
function mapAudit(row) {
  return { at: iso(row.at), type: row.type, message: row.message, detail: row.detail || {} };
}
function mapOrder(row) {
  return {
    id: row.id,
    reservationId: row.reservation_id,
    status: row.status,
    source: row.source,
    customerName: row.customer_name || '',
    customerEmail: row.customer_email || '',
    subtotal: Number(row.subtotal || 0),
    total: Number(row.total || 0),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    items: Array.isArray(row.items) ? row.items : []
  };
}
async function insertAudit(type, message, detail = {}, client = null) {
  const runner = client || db();
  await runner.query('INSERT INTO audit (type,message,detail) VALUES ($1,$2,$3::jsonb)', [type, message, JSON.stringify(detail || {})]);
}
async function publicPayload() {
  const [productsResult, batchesResult, metaResult, statsResult] = await Promise.all([
    query('SELECT * FROM products WHERE active=true ORDER BY name'),
    query('SELECT * FROM batches ORDER BY updated_at DESC,id'),
    query('SELECT * FROM bakery_meta WHERE id=1'),
    query(`SELECT
      (SELECT count(*)::int FROM reservations WHERE created_at::date=CURRENT_DATE) reserved_today,
      (SELECT count(*)::int FROM notifications) notifications`)
  ]);
  const products = productsResult.rows.map(mapProduct);
  const byId = new Map(products.map(p => [p.id, p]));
  const meta = metaResult.rows[0] || {};
  return {
    meta: { location: meta.location || 'Mazatlán', open: meta.open !== false, closesAt: meta.closes_at || '20:30', updatedAt: iso(meta.updated_at || new Date()) },
    products,
    batches: batchesResult.rows.map(r => mapBatch(r, byId.get(r.product_id))),
    stats: {
      reservedToday: Number(statsResult.rows[0]?.reserved_today || 0),
      notifications: Number(statsResult.rows[0]?.notifications || 0)
    }
  };
}
async function listOrders(limit = 80) {
  const result = await query(
    `SELECT o.*,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'productId',oi.product_id,'batchId',oi.batch_id,'qty',oi.qty,
            'unitPrice',oi.unit_price,'lineTotal',oi.line_total,'productName',p.name
          ) ORDER BY oi.id
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::jsonb
      ) AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id=o.id
     LEFT JOIN products p ON p.id=oi.product_id
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows.map(mapOrder);
}
async function adminOverview() {
  const [publicData, productsResult, reservationsResult, orders, auditResult, movementsResult, metricsResult] = await Promise.all([
    publicPayload(),
    query('SELECT * FROM products ORDER BY name'),
    query('SELECT * FROM reservations ORDER BY created_at DESC LIMIT 60'),
    listOrders(80),
    query('SELECT * FROM audit ORDER BY at DESC LIMIT 100'),
    query(`SELECT m.*,p.name product_name FROM inventory_movements m
           JOIN products p ON p.id=m.product_id ORDER BY m.created_at DESC LIMIT 60`),
    query(`SELECT
      (SELECT count(*)::int FROM orders WHERE created_at::date=CURRENT_DATE) orders_today,
      (SELECT COALESCE(sum(total),0) FROM orders WHERE created_at::date=CURRENT_DATE AND status<>'cancelled') gross_today,
      (SELECT count(*)::int FROM products WHERE stock<=5 AND active=true) low_stock,
      (SELECT count(*)::int FROM batches WHERE status<>'soldout') active_batches`)
  ]);
  return {
    ...publicData,
    products: productsResult.rows.map(mapProduct),
    reservations: reservationsResult.rows.map(mapReservation),
    orders,
    audit: auditResult.rows.map(mapAudit),
    inventoryMovements: movementsResult.rows.map(r => ({
      id: r.id, productId: r.product_id, productName: r.product_name,
      movementType: r.movement_type, quantity: Number(r.quantity),
      previousStock: r.previous_stock == null ? null : Number(r.previous_stock),
      newStock: r.new_stock == null ? null : Number(r.new_stock),
      referenceType: r.reference_type, referenceId: r.reference_id,
      actorEmail: r.actor_email, createdAt: iso(r.created_at)
    })),
    operations: {
      ordersToday: Number(metricsResult.rows[0]?.orders_today || 0),
      grossToday: Number(metricsResult.rows[0]?.gross_today || 0),
      lowStock: Number(metricsResult.rows[0]?.low_stock || 0),
      activeBatches: Number(metricsResult.rows[0]?.active_batches || 0)
    }
  };
}
function serveFile(res, file) {
  try {
    const data = fs.readFileSync(path.join(__dirname, file));
    const authOrigin = NEON_AUTH_URL ? new URL(NEON_AUTH_URL).origin : 'https://*.neonauth.c-4.us-east-2.aws.neon.tech';
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'same-origin',
      'Content-Security-Policy': `default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' ${authOrigin}; img-src 'self' data: https:; frame-ancestors 'none'`
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

setInterval(() => {
  const cutoff = Date.now() - 30 * 60000;
  for (const [key, value] of rateBuckets.entries()) if (value.startedAt < cutoff) rateBuckets.delete(key);
}, 10 * 60000).unref();

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || '';
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': origin === PUBLIC_ORIGIN ? origin : PUBLIC_ORIGIN,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
      });
      return res.end();
    }

    if (url.pathname === '/healthz') {
      const dbResult = await query('SELECT current_database() db,now() now');
      let authReady = false;
      if (authPool) {
        try { await authDb().query('SELECT 1'); authReady = true; } catch {}
      }
      return json(res, 200, {
        ok: true, service: 'miga-api', database: 'neon', databaseName: dbResult.rows[0].db,
        authReady, time: iso(dbResult.rows[0].now), state: 'ready'
      }, origin);
    }

    if (url.pathname === '/' && req.method === 'GET') {
      res.writeHead(302, { Location: PUBLIC_ORIGIN });
      return res.end();
    }
    if (url.pathname === '/admin' && req.method === 'GET') return serveFile(res, 'admin.html');

    if (url.pathname === '/api/auth/config' && req.method === 'GET') {
      return json(res, 200, { ok: true, authUrl: NEON_AUTH_URL }, origin);
    }

    if (url.pathname === '/api/auth/account/exchange' && req.method === 'POST') {
      if (!rateAllowed(req, 'auth-exchange', 20, 60000)) return json(res, 429, { ok: false, error: 'TOO_MANY_REQUESTS' }, origin);
      const body = await readBody(req);
      const sessionToken = String(body.sessionToken || '').trim();
      if (!sessionToken || sessionToken.length > 2048) return json(res, 400, { ok: false, error: 'SESSION_TOKEN_REQUIRED' }, origin);

      const authResult = await authDb().query(
        `SELECT s."userId" user_id,s."expiresAt" expires_at,u.email,u.name,u."emailVerified" email_verified
         FROM neon_auth.session s
         JOIN neon_auth."user" u ON u.id=s."userId"
         WHERE s.token=$1 AND s."expiresAt">now()
         LIMIT 1`,
        [sessionToken]
      );
      if (!authResult.rowCount) return json(res, 401, { ok: false, error: 'INVALID_AUTH_SESSION' }, origin);
      const account = authResult.rows[0];
      const email = String(account.email || '').trim().toLowerCase();
      const isOwner = Boolean(MIGA_OWNER_EMAIL && email === MIGA_OWNER_EMAIL);

      await query(
        `INSERT INTO miga_user_access (user_id,email,name,access_status,role,approved_at,approved_by,last_login_at)
         VALUES ($1::uuid,$2,$3,$4,$5,CASE WHEN $4='approved' THEN now() ELSE NULL END,CASE WHEN $4='approved' THEN 'system-owner' ELSE NULL END,now())
         ON CONFLICT (user_id) DO UPDATE SET
           email=EXCLUDED.email,name=EXCLUDED.name,last_login_at=now(),updated_at=now()`,
        [account.user_id, email, account.name || '', isOwner ? 'approved' : 'pending', isOwner ? 'owner' : 'staff']
      );
      if (isOwner) {
        await query(
          `UPDATE miga_user_access
           SET access_status='approved',role='owner',approved_at=COALESCE(approved_at,now()),approved_by='system-owner',updated_at=now()
           WHERE user_id=$1::uuid`,
          [account.user_id]
        );
      }

      const accessResult = await query(
        `SELECT user_id,email,name,access_status,role,session_version FROM miga_user_access WHERE user_id=$1::uuid LIMIT 1`,
        [account.user_id]
      );
      const access = accessResult.rows[0];

      if (!account.email_verified) {
        await securityAudit(req, 'email_not_verified', { email }, { userId: account.user_id, email });
        return json(res, 403, { ok: false, error: 'EMAIL_NOT_VERIFIED', account: { status: access.access_status } }, origin);
      }
      if (access.access_status !== 'approved') {
        await securityAudit(req, `access_${access.access_status}`, {}, { userId: account.user_id, email });
        const code = access.access_status === 'pending' ? 'PENDING_APPROVAL'
          : access.access_status === 'suspended' ? 'ACCESS_SUSPENDED' : 'ACCESS_REJECTED';
        return json(res, 403, { ok: false, error: code, account: { status: access.access_status, email, name: access.name } }, origin);
      }

      const appSession = {
        userId: access.user_id, email: access.email, name: access.name,
        role: access.role, sessionVersion: Number(access.session_version || 1)
      };
      setSessionCookie(res, signSession(appSession));
      await securityAudit(req, 'login_success', { role: access.role }, appSession);
      return json(res, 200, { ok: true, ...appSession, permissions: permissionsFor(access.role) }, origin);
    }

    if (url.pathname === '/api/auth/session' && req.method === 'GET') {
      const session = await requestSession(req);
      if (!session) return json(res, 401, { ok: false, error: 'AUTH_REQUIRED' }, origin);
      return json(res, 200, { ok: true, ...session }, origin);
    }

    if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
      const session = await requestSession(req);
      if (session) await securityAudit(req, 'logout', {}, session);
      clearSessionCookie(res);
      return json(res, 200, { ok: true }, origin);
    }

    if (url.pathname === '/api/admin/login' && req.method === 'POST') {
      if (!rateAllowed(req, 'legacy-login', 8, 10 * 60000)) return json(res, 429, { ok: false, error: 'TOO_MANY_REQUESTS' }, origin);
      const body = await readBody(req);
      if (!ADMIN_PASSWORD || !safeEqual(body.password, ADMIN_PASSWORD)) {
        await securityAudit(req, 'legacy_login_failed');
        return json(res, 401, { ok: false, error: 'INVALID_CREDENTIALS' }, origin);
      }
      const legacy = { legacy: true, role: 'owner', name: 'Acceso de respaldo', email: '' };
      setSessionCookie(res, signSession(legacy));
      await securityAudit(req, 'legacy_login_success', {}, legacy);
      return json(res, 200, { ok: true, ...legacy, permissions: permissionsFor('owner') }, origin);
    }

    if (url.pathname === '/api/public' && req.method === 'GET') return json(res, 200, await publicPayload(), origin);

    if (url.pathname === '/api/reservations' && req.method === 'POST') {
      if (!rateAllowed(req, 'reservations', 18, 60000)) return json(res, 429, { ok: false, error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' }, origin);
      const body = await readBody(req);
      const batchId = String(body.batchId || '');
      const qty = Math.max(1, Math.min(6, Math.trunc(Number(body.qty) || 1)));
      const client = await db().connect();
      try {
        await client.query('BEGIN');
        const updated = await client.query(
          `UPDATE batches SET reserved=reserved+$2,
             status=CASE WHEN reserved+$2>=total THEN 'soldout' ELSE status END,
             updated_at=now()
           WHERE id=$1 AND status<>'soldout' AND total-reserved >= $2
           RETURNING id,product_id,total,reserved,status`,
          [batchId, qty]
        );
        if (!updated.rowCount) {
          const check = await client.query('SELECT total,reserved FROM batches WHERE id=$1', [batchId]);
          await client.query('ROLLBACK');
          if (!check.rowCount) return json(res, 404, { ok: false, error: 'Lote no encontrado' }, origin);
          const available = Math.max(0, Number(check.rows[0].total) - Number(check.rows[0].reserved));
          return json(res, 409, { ok: false, error: 'No hay suficientes piezas disponibles', available }, origin);
        }
        const batch = updated.rows[0];
        const productResult = await client.query('SELECT id,name,price FROM products WHERE id=$1', [batch.product_id]);
        const product = productResult.rows[0];
        const reservationId = `R-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        const orderId = `O-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const unitPrice = Number(product?.price || 0);
        const total = Math.round(unitPrice * qty * 100) / 100;

        await client.query(
          `INSERT INTO reservations (id,batch_id,product_id,qty,status) VALUES ($1,$2,$3,$4,'confirmed')`,
          [reservationId, batch.id, batch.product_id, qty]
        );
        await client.query(
          `INSERT INTO orders (id,reservation_id,status,source,subtotal,total)
           VALUES ($1,$2,'reserved','web',$3,$3)`,
          [orderId, reservationId, total]
        );
        await client.query(
          `INSERT INTO order_items (order_id,product_id,batch_id,qty,unit_price,line_total)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [orderId, batch.product_id, batch.id, qty, unitPrice, total]
        );
        await insertAudit('reservation', `Reserva ${reservationId}: ${qty} pieza(s)`, { batchId: batch.id, orderId }, client);
        await client.query('COMMIT');
        return json(res, 201, {
          ok: true, id: reservationId, orderId, qty,
          remaining: Math.max(0, Number(batch.total) - Number(batch.reserved))
        }, origin);
      } catch (error) {
        try { await client.query('ROLLBACK'); } catch {}
        throw error;
      } finally { client.release(); }
    }

    if (url.pathname === '/api/notify' && req.method === 'POST') {
      if (!rateAllowed(req, 'notify', 25, 60000)) return json(res, 429, { ok: false, error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' }, origin);
      const body = await readBody(req);
      const batchResult = await query('SELECT id,product_id FROM batches WHERE id=$1', [String(body.batchId || '')]);
      if (!batchResult.rowCount) return json(res, 404, { ok: false, error: 'Lote no encontrado' }, origin);
      const batch = batchResult.rows[0];
      const id = `N-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      await query('INSERT INTO notifications (id,batch_id,product_id) VALUES ($1,$2,$3)', [id, batch.id, batch.product_id]);
      await insertAudit('notify', `Aviso solicitado para ${batch.product_id}`, { batchId: batch.id });
      return json(res, 201, { ok: true, id }, origin);
    }

    if (url.pathname === '/api/admin/overview' && req.method === 'GET') {
      const session = await requireSession(req, res, origin);
      if (!session) return;
      return json(res, 200, { ...(await adminOverview()), session }, origin);
    }

    if (url.pathname === '/api/admin/orders' && req.method === 'GET') {
      const session = await requireSession(req, res, origin, 'manageOrders');
      if (!session) return;
      return json(res, 200, { orders: await listOrders(150) }, origin);
    }

    const orderMatch = url.pathname.match(/^\/api\/admin\/orders\/([^/]+)$/);
    if (orderMatch && req.method === 'PATCH') {
      const session = await requireSession(req, res, origin, 'manageOrders');
      if (!session) return;
      const body = await readBody(req);
      const allowed = new Set(['reserved','preparing','ready','completed','cancelled']);
      if (!allowed.has(String(body.status || ''))) return json(res, 400, { ok: false, error: 'INVALID_STATUS' }, origin);
      const result = await query(
        `UPDATE orders SET status=$2,updated_at=now() WHERE id=$1 RETURNING *`,
        [orderMatch[1], body.status]
      );
      if (!result.rowCount) return json(res, 404, { ok: false, error: 'ORDER_NOT_FOUND' }, origin);
      await insertAudit('order_update', `Pedido ${orderMatch[1]} → ${body.status}`, { actor: session.email });
      return json(res, 200, { ok: true, order: mapOrder({ ...result.rows[0], items: [] }) }, origin);
    }

    if (url.pathname === '/api/admin/audit' && req.method === 'GET') {
      const session = await requireSession(req, res, origin, 'viewAudit');
      if (!session) return;
      const [opsAudit, security] = await Promise.all([
        query('SELECT * FROM audit ORDER BY at DESC LIMIT 250'),
        query('SELECT * FROM miga_security_audit ORDER BY created_at DESC LIMIT 250')
      ]);
      return json(res, 200, {
        audit: opsAudit.rows.map(mapAudit),
        security: security.rows.map(r => ({
          id: r.id, userId: r.user_id, email: r.email, action: r.action,
          detail: r.detail || {}, ipAddress: r.ip_address, createdAt: iso(r.created_at)
        }))
      }, origin);
    }

    if (url.pathname === '/api/admin/access' && req.method === 'GET') {
      const session = await requireSession(req, res, origin, 'manageUsers');
      if (!session) return;
      const result = await query(
        `SELECT user_id,email,name,access_status,role,requested_at,approved_at,last_login_at,notes,updated_at
         FROM miga_user_access ORDER BY requested_at DESC`
      );
      return json(res, 200, { users: result.rows.map(r => ({
        userId: r.user_id, email: r.email, name: r.name, status: r.access_status, role: r.role,
        requestedAt: iso(r.requested_at), approvedAt: iso(r.approved_at),
        lastLoginAt: iso(r.last_login_at), notes: r.notes, updatedAt: iso(r.updated_at)
      })) }, origin);
    }

    const accessMatch = url.pathname.match(/^\/api\/admin\/access\/([^/]+)$/);
    if (accessMatch && req.method === 'PATCH') {
      const session = await requireSession(req, res, origin, 'manageUsers');
      if (!session) return;
      const body = await readBody(req);
      const status = String(body.status || '');
      const role = String(body.role || '');
      if (!['pending','approved','rejected','suspended'].includes(status)) return json(res, 400, { ok: false, error: 'INVALID_ACCESS_STATUS' }, origin);
      if (!['owner','manager','staff'].includes(role)) return json(res, 400, { ok: false, error: 'INVALID_ROLE' }, origin);
      if (String(session.userId || '') === accessMatch[1] && (status !== 'approved' || role !== 'owner')) {
        return json(res, 400, { ok: false, error: 'OWNER_SELF_LOCKOUT_BLOCKED' }, origin);
      }
      const result = await query(
        `UPDATE miga_user_access SET access_status=$2,role=$3,
           approved_at=CASE WHEN $2='approved' THEN COALESCE(approved_at,now()) ELSE approved_at END,
           approved_by=$4,session_version=session_version+1,updated_at=now()
         WHERE user_id=$1::uuid
         RETURNING user_id,email,name,access_status,role`,
        [accessMatch[1], status, role, session.email || 'owner']
      );
      if (!result.rowCount) return json(res, 404, { ok: false, error: 'USER_NOT_FOUND' }, origin);
      await securityAudit(req, 'access_updated', { targetUserId: accessMatch[1], status, role }, session);
      return json(res, 200, { ok: true, user: result.rows[0] }, origin);
    }

    const batchMatch = url.pathname.match(/^\/api\/admin\/batches\/([^/]+)$/);
    if (batchMatch && req.method === 'PATCH') {
      const session = await requireSession(req, res, origin, 'manageProduction');
      if (!session) return;
      const body = await readBody(req);
      const currentResult = await query('SELECT * FROM batches WHERE id=$1', [batchMatch[1]]);
      if (!currentResult.rowCount) return json(res, 404, { ok: false, error: 'Lote no encontrado' }, origin);
      const current = currentResult.rows[0];
      const allowedStatuses = ['baking','fresh','next','soldout'];
      let status = body.status && allowedStatuses.includes(body.status) ? body.status : current.status;
      const etaMinutes = Number.isFinite(Number(body.etaMinutes)) ? Math.max(0, Math.trunc(Number(body.etaMinutes))) : Number(current.eta_minutes);
      const total = Number.isFinite(Number(body.total)) ? Math.max(Number(current.reserved), Math.trunc(Number(body.total))) : Number(current.total);
      const freshMinutes = Number.isFinite(Number(body.freshMinutes)) ? Math.max(0, Math.trunc(Number(body.freshMinutes))) : current.fresh_minutes;
      if (Number(current.reserved) >= total) status = 'soldout';
      const updated = await query(
        `UPDATE batches SET status=$2,eta_minutes=$3,total=$4,fresh_minutes=$5,updated_at=now()
         WHERE id=$1 RETURNING *`,
        [batchMatch[1], status, etaMinutes, total, freshMinutes]
      );
      await insertAudit('batch_update', `Lote ${batchMatch[1]} actualizado`, { ...body, actor: session.email });
      const productResult = await query('SELECT * FROM products WHERE id=$1', [updated.rows[0].product_id]);
      return json(res, 200, { ok: true, batch: mapBatch(updated.rows[0], productResult.rowCount ? mapProduct(productResult.rows[0]) : null) }, origin);
    }

    const productMatch = url.pathname.match(/^\/api\/admin\/products\/([^/]+)$/);
    if (productMatch && req.method === 'PATCH') {
      const session = await requireSession(req, res, origin, 'manageInventory');
      if (!session) return;
      const body = await readBody(req);
      const currentResult = await query('SELECT * FROM products WHERE id=$1', [productMatch[1]]);
      if (!currentResult.rowCount) return json(res, 404, { ok: false, error: 'Producto no encontrado' }, origin);
      const current = currentResult.rows[0];
      const stock = Number.isFinite(Number(body.stock)) ? Math.max(0, Math.trunc(Number(body.stock))) : Number(current.stock);
      const price = Number.isFinite(Number(body.price)) ? Math.max(0, Math.round(Number(body.price) * 100) / 100) : Number(current.price);
      const active = typeof body.active === 'boolean' ? body.active : Boolean(current.active);
      const updated = await query(
        `UPDATE products SET stock=$2,price=$3,active=$4,updated_at=now() WHERE id=$1 RETURNING *`,
        [productMatch[1], stock, price, active]
      );
      if (stock !== Number(current.stock)) {
        await query(
          `INSERT INTO inventory_movements
           (product_id,movement_type,quantity,previous_stock,new_stock,reference_type,reference_id,actor_email)
           VALUES ($1,'manual',$2,$3,$4,'product','',$5)`,
          [productMatch[1], stock - Number(current.stock), Number(current.stock), stock, session.email || '']
        );
      }
      await insertAudit('product_update', `Producto ${productMatch[1]} actualizado`, { ...body, actor: session.email });
      return json(res, 200, { ok: true, product: mapProduct(updated.rows[0]) }, origin);
    }

    return json(res, 404, { ok: false, error: 'Ruta no encontrada' }, origin);
  } catch (error) {
    console.error('MIGA API error:', error?.stack || error);
    const code = error?.message === 'invalid_json' ? 'JSON inválido' : 'Error interno del servidor';
    return json(res, 500, { ok: false, error: code }, origin);
  }
});

server.listen(PORT, () => {
  console.log(`MIGA API listening on ${PORT}; persistence=${DATABASE_URL ? 'neon' : 'unconfigured'}; auth=${AUTH_DATABASE_URL && NEON_AUTH_URL ? 'neon-auth' : 'unconfigured'}`);
});

async function closePools() {
  try { if (pool) await pool.end(); } catch {}
  try { if (authPool) await authPool.end(); } catch {}
}
process.on('SIGTERM', async () => { await closePools(); process.exit(0); });
