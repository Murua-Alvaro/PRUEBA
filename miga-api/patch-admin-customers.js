'use strict';

const fs = require('fs');
const path = require('path');
const serverTarget = path.join(__dirname, 'server.js');
const adminTarget = path.join(__dirname, 'admin.html');

try {
  let server = fs.readFileSync(serverTarget, 'utf8');
  server = server.replace(
    "customerEmail: row.customer_email || '',\n    subtotal:",
    "customerEmail: row.customer_email || '',\n    customerPhone: row.customer_phone || '',\n    paymentMethod: row.payment_method || 'pickup',\n    subtotal:"
  );
  fs.writeFileSync(serverTarget, server, 'utf8');
  console.log('Migajeros Bakery order customer fields OK');
} catch (error) {
  console.error('Migajeros Bakery order customer fields failed:', error?.message || error);
}

try {
  let html = fs.readFileSync(adminTarget, 'utf8');

  const auditButton = '<button data-view="audit" data-short="AUD">Auditoría</button>';
  if (!html.includes('data-view="customers"') && html.includes(auditButton)) {
    html = html.replace(auditButton, '<button data-view="customers" data-short="CLI">Clientes</button>' + auditButton);
  }

  const auditView = '<section class="view" id="view-audit">';
  if (!html.includes('id="view-customers"') && html.includes(auditView)) {
    const customersView = '<section class="view" id="view-customers"><section class="panel" style="margin-top:0"><div class="panelHeader"><div><h2>Clientes</h2><div class="sub">Cuentas públicas, preferencias, promociones e historial de compra.</div></div></div><div class="tableWrap"><table class="table"><thead><tr><th>Cliente</th><th>Contacto</th><th>Pan favorito</th><th>Preferencias</th><th>Promos</th><th>Pedidos</th><th>Compras</th></tr></thead><tbody id="customersBody"></tbody></table></div></section></section>';
    html = html.replace(auditView, customersView + auditView);
  }

  const oldLoad = "async function loadAll(){try{data=await api('/api/admin/overview');session=data.session||session;renderOverview();renderOrders();renderInventory();renderProduction();if(session?.permissions?.manageUsers)await loadUsers();if(session?.permissions?.viewAudit)await loadAudit();$('#healthText').textContent='Neon conectado'}catch(e){if(e.code==='AUTH_REQUIRED'){location.reload()}else{$('#healthText').textContent='Error de sincronización';console.error(e)}}}";
  const newLoad = "async function loadAll(){try{data=await api('/api/admin/overview');session=data.session||session;renderOverview();renderOrders();renderInventory();renderProduction();await loadCustomers();if(session?.permissions?.viewAudit)await loadAudit();$('#healthText').textContent='Neon conectado'}catch(e){if(e.code==='AUTH_REQUIRED'){location.reload()}else{$('#healthText').textContent='Error de sincronización';console.error(e)}}}";
  if (html.includes(oldLoad)) html = html.replace(oldLoad, newLoad);

  const auditFn = 'async function loadAudit(){';
  if (!html.includes('async function loadCustomers()') && html.includes(auditFn)) {
    const customerFn = "async function loadCustomers(){try{const c=await api('/api/admin/customers');const body=$('#customersBody');if(!body)return;body.innerHTML=(c.customers||[]).map(x=>{const pref=x.breadPreferences||{};const prefs=[pref.type,pref.frequency,pref.sweet?'Dulce':'',pref.savory?'Salado':'',pref.sourdough?'Masa madre':''].filter(Boolean).join(' · ');return '<tr><td><b>'+esc(x.name||'Sin nombre')+'</b><br><span class=\"sub\">'+esc(x.email)+'</span></td><td>'+esc(x.phone||'—')+'</td><td>'+esc(x.favoriteBread||'—')+'</td><td>'+esc(prefs||'—')+'</td><td>'+(x.marketingOptIn?'<span class=\"pill ok\">Sí</span>':'<span class=\"pill\">No</span>')+'</td><td>'+Number(x.orderCount||0)+'</td><td>'+money(x.totalSpent||0)+'</td></tr>'}).join('')||'<tr><td colspan=\"7\" class=\"empty\">Sin clientes registrados.</td></tr>'}catch(e){console.error(e)}}\n";
    html = html.replace(auditFn, customerFn + auditFn);
  }

  const oldTitles = "const titles={overview:'Resumen operativo',orders:'Pedidos',inventory:'Inventario',production:'Producción',users:'Usuarios y acceso',audit:'Auditoría'};";
  const newTitles = "const titles={overview:'Resumen operativo',orders:'Pedidos',inventory:'Inventario',production:'Producción',customers:'Clientes',audit:'Auditoría'};";
  if (html.includes(oldTitles)) html = html.replace(oldTitles, newTitles);

  fs.writeFileSync(adminTarget, html, 'utf8');
  console.log('Migajeros Bakery customers admin view OK');
} catch (error) {
  console.error('Migajeros Bakery customers admin view failed:', error?.message || error);
}
