(()=>{
  const D=window.MigajerosDemand; if(!D)return;
  D.state={data:null,slot:null,qty:{},busy:false};
  D.esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  D.money=n=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(Number(n||0));
  D.hm=v=>new Date(v).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'});
  D.day=v=>new Date(v).toLocaleDateString('es-MX',{weekday:'short',day:'numeric'}).replace('.','');
  D.selectedTotal=()=>Object.values(D.state.qty).reduce((a,n)=>a+Number(n||0),0);
  D.slotDemand=id=>!D.state.slot?0:(D.state.data?.demand||[]).filter(x=>x.pickupStart===D.state.slot.start&&x.productId===id).reduce((a,x)=>a+Number(x.qty||0),0);
  D.slotTotal=()=>!D.state.slot?0:(D.state.data?.demand||[]).filter(x=>x.pickupStart===D.state.slot.start).reduce((a,x)=>a+Number(x.qty||0),0);
  D.mount=()=>{
    if(document.querySelector('#demand-planner'))return;
    const section=document.createElement('section');section.id='demand-planner';section.className='section demandSection';
    section.innerHTML=`<div class="demandLayout"><div class="demandIntro"><div class="eyebrow">Horno por horario</div><h2>Di qué quieres y cuándo vienes.</h2><p>Tu visita se convierte en una señal real para producción. La panadería ve cuántas piezas se esperan por franja y puede ajustar la siguiente tanda antes de que llegues.</p><div class="demandHow"><div><b>01</b><span>Elige una ventana de 30 minutos.</span></div><div><b>02</b><span>Indica qué pan te interesa y cuántas piezas.</span></div><div><b>03</b><span>Planea tu visita o solicita un apartado de la próxima tanda.</span></div></div></div><div class="demandPanel"><div class="demandPanelHead"><div><div class="eyebrow">Demanda anticipada</div><h3>Planea tu visita</h3><p>Tu selección entra directamente al panel del negocio.</p></div><div class="demandLiveDot"><i></i><span id="demandSync">Conectando</span></div></div><div class="slotLabel">¿A qué hora vas a pasar?</div><div class="slotRail" id="demandSlots"></div><div class="demandProducts" id="demandProducts"></div><div class="demandSummary"><div><small>Tu selección</small><strong id="demandTotal">0 piezas</strong></div><div><small>Demanda visible en esa franja</small><strong id="slotTotal">0 piezas</strong></div></div><div class="demandActions"><button class="demandAction" data-demand-action="plan">VOY A PASAR A ESA HORA</button><button class="demandAction primary" data-demand-action="reserve">APARTAR DE LA PRÓXIMA TANDA</button></div><p class="demandFine">La primera opción registra intención de compra. El apartado futuro cuenta como demanda comprometida y puede asignarse a una tanda cuando el negocio autoriza producción.</p><div class="demandConfirm" id="demandConfirm"><b id="demandFolio"></b><span id="demandConfirmText"></span></div></div></div>`;
    const anchor=document.querySelector('#proximos');anchor?.parentNode?.insertBefore(section,anchor.nextSibling);
    const nav=document.querySelector('.navLinks');if(nav&&!nav.querySelector('[href="#demand-planner"]')){const a=document.createElement('a');a.href='#demand-planner';a.textContent='MI HORARIO';a.className='demandNavLink';nav.insertBefore(a,nav.lastElementChild)}
  };
  D.renderPromotions=()=>{
    const grid=document.querySelector('#trayGrid');if(!grid||!D.state.data)return;
    const promos=D.state.data.promotions||[];
    if(!promos.length){grid.innerHTML='<div class="promoEmpty">No hay promociones de rescate activas. Esta sección sólo se activa cuando el negocio detecta excedente y autoriza una acción.</div>';return}
    grid.innerHTML=promos.map(p=>{const mins=Math.max(0,Math.ceil((new Date(p.endsAt)-Date.now())/60000));const deal=p.kind==='3x2'?`${p.buyQty}×${p.payQty}`:`−${p.discountPercent}%`;return `<article class="promoLiveCard"><div><div class="promoKicker">Oferta activada por inventario</div><h3>${D.esc(p.productName)}</h3><p>${D.esc(p.message||'Promoción limitada.')}</p></div><div><strong>${D.esc(deal)}</strong><button data-promo-product="${D.esc(p.productId)}" data-promo-qty="${p.kind==='3x2'?p.buyQty:1}">QUIERO APROVECHARLA</button><div class="promoCountdown">termina en ~${mins} min</div></div></article>`}).join('');
    const h=document.querySelector('#charola h2');if(h)h.textContent='Rescate de hoy';const p=document.querySelector('#charola .sectionHead p');if(p)p.textContent='Promociones activadas cuando el inventario supera la demanda esperada. Se actualizan automáticamente.';
  };
  D.render=()=>{
    const S=D.state;if(!S.data)return;if(!S.slot)S.slot=S.data.slots?.[0]||null;
    document.querySelector('#demandSync').textContent='En vivo';
    document.querySelector('#demandSlots').innerHTML=(S.data.slots||[]).map(s=>`<button class="slotBtn ${S.slot?.start===s.start?'active':''}" data-demand-slot="${D.esc(s.start)}"><strong>${D.hm(s.start)}</strong><small>${D.day(s.start)} · hasta ${D.hm(s.end)}</small></button>`).join('');
    document.querySelector('#demandProducts').innerHTML=(S.data.products||[]).slice(0,8).map(p=>{const q=Number(S.qty[p.id]||0),visible=D.slotDemand(p.id);return `<div class="demandProduct ${q?'hasQty':''}"><div><h4>${D.esc(p.name)}</h4><p>${D.money(p.price)} · ${visible?visible+' piezas ya solicitadas':'sin demanda declarada todavía'}</p></div><div class="demandQty"><button data-demand-minus="${D.esc(p.id)}">−</button><strong>${q}</strong><button data-demand-plus="${D.esc(p.id)}">+</button></div></div>`}).join('');
    document.querySelector('#demandTotal').textContent=`${D.selectedTotal()} piezas`;document.querySelector('#slotTotal').textContent=`${D.slotTotal()} piezas`;
    document.querySelectorAll('[data-demand-action]').forEach(b=>b.disabled=!D.selectedTotal()||!S.slot||S.busy);D.renderPromotions();
  };
})();
