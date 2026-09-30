const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

function loadPg() {
  try {
    return require('pg');
  } catch (error) {
    console.log('MIGA: installing PostgreSQL runtime dependency...');
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    execFileSync(npm, ['install', '--omit=dev', '--no-audit', '--no-fund'], {
      cwd: __dirname,
      stdio: 'inherit'
    });
    return require('pg');
  }
}

const { Pool } = loadPg();

const PORT = process.env.PORT || 10000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_SECRET = process.env.ADMIN_SECRET || crypto.randomBytes(32).toString('hex');
const PUBLIC_ORIGIN = process.env.PUBLIC_ORIGIN || 'https://miga-horno-vivo.onrender.com';
const DATABASE_URL = process.env.DATABASE_URL || '';
const rateBuckets = new Map();

const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    })
  : null;

function requireDb() {
  if (!pool) throw new Error('database_not_configured');
  return pool;
}

function query(text, params = []) {
  return requireDb().query(text, params);
}

function iso(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    stock: Number(row.stock),
    active: Boolean(row.active),
    image: row.image,
    note: row.note,
    updatedAt: iso(row.updated_at)
  };
}

function mapBatch(row, product) {
  return {
    id: row.id,
    productId: row.product_id,
    status: row.status,
    etaMinutes: Number(row.eta_minutes),
    total: Number(row.total),
    reserved: Number(row.reserved),
    freshMinutes: row.fresh_minutes == null ? null : Number(row.fresh_minutes),
    updatedAt: iso(row.updated_at),
    product: product || null
  };
}

function mapReservation(row) {
  return {
    id: row.id,
    batchId: row.batch_id,
    productId: row.product_id,
    qty: Number(row.qty),
    createdAt: iso(row.created_at),
    status: row.status
  };
}

function mapAudit(row) {
  return {
    at: iso(row.at),
    type: row.type,
    message: row.message,
    detail: row.detail || {}
  };
}

async function insertAudit(type, message, detail = {}, client = null) {
  const runner = client || requireDb();
  await runner.query(
    'INSERT INTO audit (type, message, detail) VALUES ($1, $2, $3::jsonb)',
    [type, message, JSON.stringify(detail || {})]
  );
}

async function publicPayload() {
  const [productsResult, batchesResult, metaResult, statsResult] = await Promise.all([
    query('SELECT * FROM products WHERE active = true ORDER BY name'),
    query('SELECT * FROM batches ORDER BY updated_at DESC, id'),
    query('SELECT * FROM bakery_meta WHERE id = 1'),
    query(`SELECT
      (SELECT count(*)::int FROM reservations WHERE created_at::date = CURRENT_DATE) AS reserved_today,
      (SELECT count(*)::int FROM notifications) AS notifications`)
  ]);

  const products = productsResult.rows.map(mapProduct);
  const productsById = new Map(products.map((p) => [p.id, p]));
  const batches = batchesResult.rows.map((row) => mapBatch(row, productsById.get(row.product_id)));
  const metaRow = metaResult.rows[0] || {};
  const statsRow = statsResult.rows[0] || {};

  return {
    meta: {
      location: metaRow.location || 'Mazatlán',
      open: metaRow.open !== false,
      closesAt: metaRow.closes_at || '20:30',
      updatedAt: iso(metaRow.updated_at || new Date())
    },
    products,
    batches,
    stats: {
      reservedToday: Number(statsRow.reserved_today || 0),
      notifications: Number(statsRow.notifications || 0)
    }
  };
}

function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown')
    .split(',')[0]
    .trim();
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

function json(res, status, data, origin) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': origin === PUBLIC_ORIGIN ? origin : PUBLIC_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
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
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 25000) {
        reject(new Error('payload_too_large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('invalid_json'));
      }
    });
  });
}

function sessionToken() {
  const exp = Date.now() + 1000 * 60 * 60 * 8;
  const payload = String(exp);
  const sig = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

function isAdmin(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return false;
  try {
    const decoded = Buffer.from(header.slice(7), 'base64url').toString('utf8');
    const [exp, sig] = decoded.split(':');
    if (Number(exp) < Date.now() || !sig) return false;
    const expected = crypto.createHmac('sha256', ADMIN_SECRET).update(exp).digest('hex');
    if (sig.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

function serveFile(res, file) {
  try {
    const data = fs.readFileSync(path.join(__dirname, file));
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'same-origin',
      'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data: https:; frame-ancestors 'none'"
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

setInterval(() => {
  const cutoff = Date.now() - 1000 * 60 * 30;
  for (const [key, value] of rateBuckets.entries()) {
    if (value.startedAt < cutoff) rateBuckets.delete(key);
  }
}, 1000 * 60 * 10).unref();

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || '';
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': origin === PUBLIC_ORIGIN ? origin : PUBLIC_ORIGIN,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS'
      });
      return res.end();
    }

    if (url.pathname === '/healthz') {
      if (!pool) return json(res, 503, { ok: false, service: 'miga-api', database: 'not_configured' }, origin);
      const result = await query('SELECT current_database() AS db, now() AS now');
      return json(res, 200, {
        ok: true,
        service: 'miga-api',
        database: 'neon',
        databaseName: result.rows[0].db,
        time: iso(result.rows[0].now),
        state: 'ready'
      }, origin);
    }

    if (url.pathname === '/' && req.method === 'GET') {
      res.writeHead(302, { Location: PUBLIC_ORIGIN });
      return res.end();
    }

    if (url.pathname === '/admin' && req.method === 'GET') return serveFile(res, 'admin.html');

    if (url.pathname === '/api/public' && req.method === 'GET') {
      return json(res, 200, await publicPayload(), origin);
    }

    if (url.pathname === '/api/reservations' && req.method === 'POST') {
      if (!rateAllowed(req, 'reservations', 18, 60000)) {
        return json(res, 429, { ok: false, error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' }, origin);
      }

      const body = await readBody(req);
      const batchId = String(body.batchId || '');
      const qty = Math.max(1, Math.min(6, Math.trunc(Number(body.qty) || 1)));
      const client = await requireDb().connect();

      try {
        await client.query('BEGIN');
        const updated = await client.query(
          `UPDATE batches
             SET reserved = reserved + $2,
                 status = CASE WHEN reserved + $2 >= total THEN 'soldout' ELSE status END,
                 updated_at = now()
           WHERE id = $1
             AND status <> 'soldout'
             AND total - reserved >= $2
           RETURNING id, product_id, total, reserved, status`,
          [batchId, qty]
        );

        if (!updated.rowCount) {
          const check = await client.query('SELECT total, reserved FROM batches WHERE id = $1', [batchId]);
          await client.query('ROLLBACK');
          if (!check.rowCount) return json(res, 404, { ok: false, error: 'Lote no encontrado' }, origin);
          const available = Math.max(0, Number(check.rows[0].total) - Number(check.rows[0].reserved));
          return json(res, 409, { ok: false, error: 'No hay suficientes piezas disponibles', available }, origin);
        }

        const batch = updated.rows[0];
        const id = `R-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        await client.query(
          `INSERT INTO reservations (id, batch_id, product_id, qty, status)
           VALUES ($1, $2, $3, $4, 'confirmed')`,
          [id, batch.id, batch.product_id, qty]
        );
        await insertAudit('reservation', `Reserva ${id}: ${qty} pieza(s)`, { batchId: batch.id }, client);
        await client.query('COMMIT');

        return json(res, 201, {
          ok: true,
          id,
          qty,
          remaining: Math.max(0, Number(batch.total) - Number(batch.reserved))
        }, origin);
      } catch (error) {
        try { await client.query('ROLLBACK'); } catch {}
        throw error;
      } finally {
        client.release();
      }
    }

    if (url.pathname === '/api/notify' && req.method === 'POST') {
      if (!rateAllowed(req, 'notify', 25, 60000)) {
        return json(res, 429, { ok: false, error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' }, origin);
      }

      const body = await readBody(req);
      const batchId = String(body.batchId || '');
      const batchResult = await query('SELECT id, product_id FROM batches WHERE id = $1', [batchId]);
      if (!batchResult.rowCount) return json(res, 404, { ok: false, error: 'Lote no encontrado' }, origin);

      const batch = batchResult.rows[0];
      const id = `N-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      await query(
        'INSERT INTO notifications (id, batch_id, product_id) VALUES ($1, $2, $3)',
        [id, batch.id, batch.product_id]
      );
      await insertAudit('notify', `Aviso solicitado para ${batch.product_id}`, { batchId: batch.id });
      return json(res, 201, { ok: true, id }, origin);
    }

    if (url.pathname === '/api/admin/login' && req.method === 'POST') {
      if (!rateAllowed(req, 'admin-login', 8, 10 * 60000)) {
        return json(res, 429, { ok: false, error: 'Demasiados intentos. Acceso temporalmente limitado.' }, origin);
      }

      const body = await readBody(req);
      if (!ADMIN_PASSWORD || body.password !== ADMIN_PASSWORD) {
        await insertAudit('auth_failed', 'Intento de acceso rechazado', { ip: clientIp(req) });
        return json(res, 401, { ok: false, error: 'Credenciales inválidas' }, origin);
      }
      await insertAudit('auth', 'Inicio de sesión administrativo');
      return json(res, 200, { ok: true, token: sessionToken() }, origin);
    }

    if (url.pathname.startsWith('/api/admin/')) {
      if (!isAdmin(req)) return json(res, 401, { ok: false, error: 'No autorizado' }, origin);

      if (url.pathname === '/api/admin/overview' && req.method === 'GET') {
        const [payload, reservationsResult, auditResult] = await Promise.all([
          publicPayload(),
          query('SELECT * FROM reservations ORDER BY created_at DESC LIMIT 40'),
          query('SELECT * FROM audit ORDER BY at DESC LIMIT 60')
        ]);
        return json(res, 200, {
          ...payload,
          reservations: reservationsResult.rows.map(mapReservation),
          audit: auditResult.rows.map(mapAudit)
        }, origin);
      }

      if (url.pathname === '/api/admin/audit' && req.method === 'GET') {
        const auditResult = await query('SELECT * FROM audit ORDER BY at DESC LIMIT 200');
        return json(res, 200, { audit: auditResult.rows.map(mapAudit) }, origin);
      }

      const batchMatch = url.pathname.match(/^\/api\/admin\/batches\/([^/]+)$/);
      if (batchMatch && req.method === 'PATCH') {
        const body = await readBody(req);
        const currentResult = await query('SELECT * FROM batches WHERE id = $1', [batchMatch[1]]);
        if (!currentResult.rowCount) return json(res, 404, { ok: false, error: 'Lote no encontrado' }, origin);

        const current = currentResult.rows[0];
        const allowedStatuses = ['baking', 'fresh', 'next', 'soldout'];
        let status = body.status && allowedStatuses.includes(body.status) ? body.status : current.status;
        const etaMinutes = Number.isFinite(Number(body.etaMinutes))
          ? Math.max(0, Math.trunc(Number(body.etaMinutes)))
          : Number(current.eta_minutes);
        const total = Number.isFinite(Number(body.total))
          ? Math.max(Number(current.reserved), Math.trunc(Number(body.total)))
          : Number(current.total);
        const freshMinutes = Number.isFinite(Number(body.freshMinutes))
          ? Math.max(0, Math.trunc(Number(body.freshMinutes)))
          : current.fresh_minutes;
        if (Number(current.reserved) >= total) status = 'soldout';

        const updatedResult = await query(
          `UPDATE batches
              SET status = $2, eta_minutes = $3, total = $4, fresh_minutes = $5, updated_at = now()
            WHERE id = $1
            RETURNING *`,
          [batchMatch[1], status, etaMinutes, total, freshMinutes]
        );
        await insertAudit('batch_update', `Lote ${batchMatch[1]} actualizado`, body);
        const productResult = await query('SELECT * FROM products WHERE id = $1', [updatedResult.rows[0].product_id]);
        const product = productResult.rowCount ? mapProduct(productResult.rows[0]) : null;
        return json(res, 200, { ok: true, batch: mapBatch(updatedResult.rows[0], product) }, origin);
      }

      const productMatch = url.pathname.match(/^\/api\/admin\/products\/([^/]+)$/);
      if (productMatch && req.method === 'PATCH') {
        const body = await readBody(req);
        const currentResult = await query('SELECT * FROM products WHERE id = $1', [productMatch[1]]);
        if (!currentResult.rowCount) return json(res, 404, { ok: false, error: 'Producto no encontrado' }, origin);

        const current = currentResult.rows[0];
        const stock = Number.isFinite(Number(body.stock))
          ? Math.max(0, Math.trunc(Number(body.stock)))
          : Number(current.stock);
        const price = Number.isFinite(Number(body.price))
          ? Math.max(0, Math.round(Number(body.price) * 100) / 100)
          : Number(current.price);
        const active = typeof body.active === 'boolean' ? body.active : Boolean(current.active);

        const updatedResult = await query(
          `UPDATE products
              SET stock = $2, price = $3, active = $4, updated_at = now()
            WHERE id = $1
            RETURNING *`,
          [productMatch[1], stock, price, active]
        );
        await insertAudit('product_update', `Producto ${productMatch[1]} actualizado`, body);
        return json(res, 200, { ok: true, product: mapProduct(updatedResult.rows[0]) }, origin);
      }
    }

    return json(res, 404, { ok: false, error: 'Ruta no encontrada' }, origin);
  } catch (error) {
    console.error('MIGA API error:', error && error.stack ? error.stack : error);
    const message = error && error.message === 'invalid_json' ? 'JSON inválido' : 'Error interno del servidor';
    return json(res, 500, { ok: false, error: message }, origin);
  }
});

server.listen(PORT, () => {
  console.log(`MIGA API listening on ${PORT}; persistence=${DATABASE_URL ? 'neon' : 'unconfigured'}`);
});

process.on('SIGTERM', async () => {
  try { if (pool) await pool.end(); } catch {}
  process.exit(0);
});
