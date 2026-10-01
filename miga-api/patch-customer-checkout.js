'use strict';

const fs = require('fs');
const path = require('path');
const serverTarget = path.join(__dirname, 'server.js');

try {
  let server = fs.readFileSync(serverTarget, 'utf8');

  // Disable legacy password login completely: admin access is owner-email OTP only.
  const legacyStart = server.indexOf("    if (url.pathname === '/api/admin/login' && req.method === 'POST') {");
  const publicStart = server.indexOf("    if (url.pathname === '/api/public' && req.method === 'GET')", legacyStart);
  if (legacyStart >= 0 && publicStart > legacyStart) {
    server = server.slice(0, legacyStart) + "    if (url.pathname === '/api/admin/login' && req.method === 'POST') return json(res, 410, { ok:false, error:'LEGACY_LOGIN_DISABLED' }, origin);\n\n" + server.slice(publicStart);
  }

  const routeMarker = "    if (url.pathname === '/api/auth/config' && req.method === 'GET') {";
  if (!server.includes(routeMarker)) throw new Error('route marker missing');

  const checkoutRoute = String.raw`
    if (url.pathname === '/api/customer/checkout' && req.method === 'POST') {
      if (!rateAllowed(req, 'customer-checkout', 15, 60000)) return json(res, 429, { ok:false, error:'TOO_MANY_REQUESTS' }, origin);
      const customer = await requireCustomer(req, res, origin); if (!customer) return;
      await ensureCustomerSchema();
      const body = await readBody(req);
      const rawItems = Array.isArray(body.items) ? body.items : [];
      const paymentMethod = ['pickup','cash','card_at_store'].includes(String(body.paymentMethod || '')) ? String(body.paymentMethod) : 'pickup';
      const notes = String(body.notes || '').trim().slice(0, 500);
      const grouped = new Map();
      for (const item of rawItems) {
        const productId = String(item?.productId || '').trim();
        const qty = Math.max(1, Math.min(12, Math.trunc(Number(item?.qty) || 1)));
        if (!productId) continue;
        grouped.set(productId, Math.min(12, (grouped.get(productId) || 0) + qty));
      }
      if (!grouped.size) return json(res, 400, { ok:false, error:'EMPTY_ORDER' }, origin);
      const totalQty = [...grouped.values()].reduce((a,b)=>a+b,0);
      if (totalQty > 24) return json(res, 400, { ok:false, error:'ORDER_TOO_LARGE' }, origin);

      const client = await db().connect();
      try {
        await client.query('BEGIN');
        await client.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_notes text NOT NULL DEFAULT ''");
        const prepared = [];
        let subtotal = 0;
        for (const [productId, qty] of grouped.entries()) {
          const batchResult = await client.query(
            "SELECT b.id,b.product_id,b.total,b.reserved,b.status,p.name,p.price FROM batches b JOIN products p ON p.id=b.product_id WHERE b.product_id=$1 AND p.active=true AND b.status<>'soldout' AND (b.total-b.reserved)>=$2 ORDER BY CASE b.status WHEN 'fresh' THEN 0 WHEN 'ready' THEN 0 WHEN 'baking' THEN 1 WHEN 'next' THEN 2 ELSE 3 END,b.updated_at DESC LIMIT 1 FOR UPDATE OF b",
            [productId, qty]
          );
          if (!batchResult.rowCount) {
            await client.query('ROLLBACK');
            return json(res, 409, { ok:false, error:'NO_STOCK', productId }, origin);
          }
          const row = batchResult.rows[0];
          const unitPrice = Number(row.price || 0);
          const lineTotal = Math.round(unitPrice * qty * 100) / 100;
          subtotal += lineTotal;
          prepared.push({ productId, qty, batchId:row.id, name:row.name, unitPrice, lineTotal });
        }

        const orderId = 'O-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        const reservationIds = [];
        for (const item of prepared) {
          await client.query("UPDATE batches SET reserved=reserved+$2,status=CASE WHEN reserved+$2>=total THEN 'soldout' ELSE status END,updated_at=now() WHERE id=$1", [item.batchId, item.qty]);
          const reservationId = 'R-' + crypto.randomBytes(3).toString('hex').toUpperCase();
          reservationIds.push(reservationId);
          await client.query("INSERT INTO reservations (id,batch_id,product_id,qty,status) VALUES ($1,$2,$3,$4,'confirmed')", [reservationId,item.batchId,item.productId,item.qty]);
        }
        subtotal = Math.round(subtotal * 100) / 100;
        await client.query("INSERT INTO orders (id,reservation_id,status,source,customer_id,customer_name,customer_email,customer_phone,payment_method,order_notes,subtotal,total) VALUES ($1,$2,'reserved','customer-checkout',$3::uuid,$4,$5,$6,$7,$8,$9,$9)", [orderId,reservationIds[0]||null,customer.id,customer.name,customer.email,customer.phone,paymentMethod,notes,subtotal]);
        for (const item of prepared) {
          await client.query('INSERT INTO order_items (order_id,product_id,batch_id,qty,unit_price,line_total) VALUES ($1,$2,$3,$4,$5,$6)', [orderId,item.productId,item.batchId,item.qty,item.unitPrice,item.lineTotal]);
        }
        await insertAudit('customer_checkout','Pedido ' + orderId + ' · ' + totalQty + ' pieza(s)',{customerId:customer.id,email:customer.email,paymentMethod,total:subtotal,items:prepared.map(x=>({productId:x.productId,qty:x.qty}))},client);
        await client.query('COMMIT');
        return json(res, 201, { ok:true, orderId, total:subtotal, itemCount:totalQty, paymentMethod, items:prepared.map(x=>({productId:x.productId,name:x.name,qty:x.qty,unitPrice:x.unitPrice,lineTotal:x.lineTotal})) }, origin);
      } catch (error) {
        try { await client.query('ROLLBACK'); } catch {}
        throw error;
      } finally { client.release(); }
    }

`;
  server = server.replace(routeMarker, checkoutRoute + routeMarker);
  fs.writeFileSync(serverTarget, server, 'utf8');
  console.log('Migajeros Bakery checkout + owner-only admin OK');
} catch (error) {
  console.error('Migajeros Bakery checkout patch failed:', error?.message || error);
}
