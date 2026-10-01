(()=>{
  let customer=null;
  let pendingProfile=null;
  const apiBase=typeof API!=='undefined'?API:'https://miga-api-l5f1.onrender.com';
  const q=s=>document.querySelector(s);
  const esc2=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const money2=n=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(Number(n||0));
  const request=async(path,opts={})=>{const r=await fetch(apiBase+path,{credentials:'include',headers:{'Content-Type':'application/json',...(opts.headers||{})},...opts});const j=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(j.error||'Error');e.code=j.error;e.payload=j;throw e}return j};

  function mount(){
    const tools=q('.navTools');
    if(tools&&!q('#customerAccountBtn')){
      const b=document.createElement('button');b.id='customerAccountBtn';b.className='customerAccountBtn';b.textContent='MI CUENTA';tools.insertBefore(b,tools.firstChild);b.onclick=openCustomer;
    }
    if(q('#customerModal'))return;
    const modal=document.createElement('div');modal.id='customerModal';modal.className='customerModal';modal.innerHTML=`<div class="customerCard">
      <div class="customerTop"><div><div class="eyebrow">Migajeros Bakery</div><h2 id="customerTitle">Tu cuenta</h2><p id="customerSubtitle">Crea tu cuenta para hacer pedidos, guardar tus gustos y recibir promociones.</p></div><button class="customerClose" id="customerClose">×</button></div>
      <section id="customerForm">
        <div class="customerGrid">
          <div class="customerField"><label>Nombre</label><input id="cName" autocomplete="name" placeholder="Tu nombre"></div>
          <div class="customerField"><label>Correo</label><input id="cEmail" type="email" autocomplete="email" placeholder="correo@gmail.com"></div>
          <div class="customerField"><label>Teléfono</label><input id="cPhone" autocomplete="tel" placeholder="669 ..."></div>
          <div class="customerField"><label>Tu pan favorito</label><input id="cFavorite" placeholder="Ej. semillitas, polvorones..."></div>
          <div class="customerField"><label>¿Qué compras más?</label><select id="cType"><option value="">Elegir</option><option value="Pan dulce">Pan dulce</option><option value="Pan salado">Pan salado</option><option value="Masa madre">Masa madre</option><option value="Surtido">Surtido</option></select></div>
          <div class="customerField"><label>¿Con qué frecuencia vienes?</label><select id="cFrequency"><option value="">Elegir</option><option value="Varias veces por semana">Varias veces por semana</option><option value="Una vez por semana">Una vez por semana</option><option value="Cada quince días">Cada quince días</option><option value="Ocasionalmente">Ocasionalmente</option></select></div>
          <div class="customerField full"><label>¿Qué te gustaría que horneáramos o mejoráramos?</label><textarea id="cQuestion" placeholder="Cuéntanos qué pan te gustaría ver, horarios, tamaños, sabores..."></textarea></div>
          <div class="customerChecks"><span>Preferencias</span>
            <label><input type="checkbox" id="cSweet"> Me gusta el pan dulce</label>
            <label><input type="checkbox" id="cSavory"> Me gusta el pan salado</label>
            <label><input type="checkbox" id="cSourdough"> Me interesa masa madre / artesanal</label>
            <label><input type="checkbox" id="cPromo"> Quiero recibir promociones, novedades y avisos especiales</label>
          </div>
        </div>
        <div class="customerActions"><button class="customerPrimary" id="customerSend">CREAR CUENTA / ENTRAR</button></div>
        <div class="customerMsg" id="customerMsg"></div>
      </section>
      <section id="customerOtp" class="customerHidden">
        <div class="customerGrid"><div class="customerField full"><label>Código de 6 dígitos</label><input id="cOtp" class="customerCode" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000"></div></div>
        <div class="customerActions"><button class="customerSecondary" id="customerBack">VOLVER</button><button class="customerPrimary" id="customerVerify">VERIFICAR Y CREAR CUENTA</button></div><div class="customerMsg" id="customerOtpMsg"></div>
      </section>
      <section id="customerProfile" class="customerHidden">
        <div class="customerProfileHead"><strong id="customerProfileName"></strong><span id="customerProfileEmail"></span></div>
        <div id="customerPromoStatus" class="customerPromo"></div>
        <div class="customerActions"><button class="customerSecondary" id="customerEdit">EDITAR PERFIL</button><button class="customerSecondary" id="customerLogout">CERRAR SESIÓN</button></div>
        <div style="margin-top:24px"><div class="eyebrow">Historial</div><h3 style="font:400 25px Georgia,serif;margin:7px 0 12px">Mis pedidos</h3><div class="customerOrders" id="customerOrders"></div></div>
      </section>
    </div>`;
    document.body.appendChild(modal);
    q('#customerClose').onclick=closeCustomer;q('#customerSend').onclick=sendOtp;q('#customerVerify').onclick=verifyOtp;q('#customerBack').onclick=()=>showStep('form');q('#customerLogout').onclick=logoutCustomer;q('#customerEdit').onclick=editProfile;
    modal.addEventListener('click',e=>{if(e.target===modal)closeCustomer()});
  }

  function showStep(step){
    q('#customerForm').classList.toggle('customerHidden',step!=='form');
    q('#customerOtp').classList.toggle('customerHidden',step!=='otp');
    q('#customerProfile').classList.toggle('customerHidden',step!=='profile');
  }
  function openCustomer(){q('#customerModal').classList.add('open');if(customer){showStep('profile');renderCustomer()}else showStep('form')}
  function closeCustomer(){q('#customerModal').classList.remove('open')}
  function profilePayload(){return {name:q('#cName').value.trim(),email:q('#cEmail').value.trim().toLowerCase(),phone:q('#cPhone').value.trim(),favoriteBread:q('#cFavorite').value.trim(),marketingOptIn:q('#cPromo').checked,breadPreferences:{type:q('#cType').value,sweet:q('#cSweet').checked,savory:q('#cSavory').checked,sourdough:q('#cSourdough').checked,frequency:q('#cFrequency').value},answers:{bakeryWish:q('#cQuestion').value.trim()}}}
  function fillForm(c){if(!c)return;q('#cName').value=c.name||'';q('#cEmail').value=c.email||'';q('#cPhone').value=c.phone||'';q('#cFavorite').value=c.favoriteBread||'';const p=c.breadPreferences||{};q('#cType').value=p.type||'';q('#cFrequency').value=p.frequency||'';q('#cSweet').checked=!!p.sweet;q('#cSavory').checked=!!p.savory;q('#cSourdough').checked=!!p.sourdough;q('#cPromo').checked=!!c.marketingOptIn;q('#cQuestion').value=c.answers?.bakeryWish||''}
  function msg(id,text,ok=false){const e=q(id);e.textContent=text||'';e.classList.toggle('ok',!!ok)}
  async function sendOtp(){const p=profilePayload();if(!p.email)return msg('#customerMsg','Escribe tu correo.');pendingProfile=p;const btn=q('#customerSend');btn.disabled=true;btn.textContent='ENVIANDO…';try{await request('/api/customer/auth/send',{method:'POST',body:JSON.stringify({email:p.email})});showStep('otp');msg('#customerOtpMsg','Código enviado. Usa únicamente el último que recibas.',true);q('#cOtp').focus()}catch(e){msg('#customerMsg',e.code==='TOO_MANY_REQUESTS'?'Se solicitaron demasiados códigos. Intenta más tarde.':'No fue posible enviar el código.')}finally{btn.disabled=false;btn.textContent='CREAR CUENTA / ENTRAR'}}
  async function verifyOtp(){if(!pendingProfile)pendingProfile=profilePayload();const otp=q('#cOtp').value.replace(/\D/g,'').slice(0,6);if(otp.length!==6)return msg('#customerOtpMsg','Escribe los 6 dígitos.');const btn=q('#customerVerify');btn.disabled=true;btn.textContent='VERIFICANDO…';try{const j=await request('/api/customer/auth/verify',{method:'POST',body:JSON.stringify({...pendingProfile,otp})});customer=j.customer;updateAccountButton();showStep('profile');await renderCustomer();if(typeof toast==='function')toast('Cuenta lista. Ya puedes hacer pedidos.')}catch(e){msg('#customerOtpMsg',e.code==='INVALID_OTP'?'Ese código no es válido o expiró. Solicita uno nuevo.':'No se pudo completar el registro.')}finally{btn.disabled=false;btn.textContent='VERIFICAR Y CREAR CUENTA'}}
  async function restore(){try{const j=await request('/api/customer/session',{method:'GET'});customer=j.customer;fillForm(customer);updateAccountButton()}catch{customer=null;updateAccountButton()}}
  function updateAccountButton(){const b=q('#customerAccountBtn');if(b)b.textContent=customer?(customer.name||customer.email).split(' ')[0].toUpperCase():'MI CUENTA'}
  async function renderCustomer(){if(!customer)return;q('#customerProfileName').textContent=customer.name||'Cliente';q('#customerProfileEmail').textContent=customer.email||'';q('#customerPromoStatus').textContent=customer.marketingOptIn?'Promociones activadas. Tus preferencias nos ayudan a enviarte novedades más relevantes.':'Promociones desactivadas. Puedes activarlas editando tu perfil.';let orders=[];try{orders=(await request('/api/customer/orders',{method:'GET'})).orders||[]}catch{}q('#customerOrders').innerHTML=orders.length?orders.map(o=>`<div class="customerOrder"><div class="customerOrderTop"><b>${esc2(o.id)}</b><strong>${money2(o.total)}</strong></div><small>${esc2((o.items||[]).map(i=>`${i.qty}× ${i.productName||i.productId}`).join(', ')||'Pedido')}</small><small>${new Date(o.createdAt).toLocaleString('es-MX')} · ${esc2(o.status)}</small></div>`).join(''):'<div class="customerOrder"><small>Aún no tienes pedidos. Cuando apartes o compres pan aparecerán aquí.</small></div>'}
  function editProfile(){fillForm(customer);showStep('form');q('#customerSend').textContent='GUARDAR Y VERIFICAR'}
  async function logoutCustomer(){try{await request('/api/customer/logout',{method:'POST'})}catch{}customer=null;pendingProfile=null;updateAccountButton();showStep('form');closeCustomer()}

  const originalReserveOne=typeof reserveOne==='function'?reserveOne:null;
  window.requireCustomerForOrder=()=>{if(customer)return true;openCustomer();msg('#customerMsg','Crea o inicia sesión para hacer pedidos.');return false};
  if(originalReserveOne){
    reserveOne=async function(batchId,q=1){
      if(!customer){openCustomer();msg('#customerMsg','Crea o inicia sesión para hacer pedidos.');throw new Error('Inicia sesión para hacer pedidos');}
      const r=await request('/api/customer/reservations',{method:'POST',body:JSON.stringify({batchId,qty:q,paymentMethod:'pickup'})});
      folios.unshift({id:r.id,batchId,qty:q,createdAt:new Date().toISOString(),orderId:r.orderId});localStorage.setItem('miga_folios',JSON.stringify(folios));
      await renderCustomer();return r;
    };
  }

  mount();
  restore();
})();