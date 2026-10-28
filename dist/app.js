'use strict';

const menuItems = window.AliBabaMenu;
const {createCart, formatPrice} = window.AliBabaCart;
const STORAGE_KEY = 'alibaba-cart-v1';
const deliveryUrl = 'https://www.foodpanda.pk/restaurant/et5i/ali-baba-doner-kebab';
const arrow = '<svg class="icon" aria-hidden="true"><use href="#arrow-up-right"/></svg>';
const icon = id => `<svg class="icon" aria-hidden="true"><use href="#${id}"/></svg>`;
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const branches = {
  dha: {country:'ISLAMABAD, PAKISTAN',name:'Central Park, DHA 2',address:'Central Park, DHA Phase 2<br>Islamabad, Pakistan',services:['DINE IN','TAKEAWAY'],map:'https://www.google.com/maps/search/?api=1&query=Ali+Baba+Doner+Kebab+Central+Park+DHA+2+Islamabad',phone:'+923100555007',phoneLabel:'0310 0555007'},
  giga: {country:'ISLAMABAD, PAKISTAN',name:'Giga Mall',address:'Unit 6, second floor, Giga Mall<br>DHA Phase 2, Islamabad, Pakistan',services:['DINE IN','DELIVERY'],map:'https://www.google.com/maps/search/?api=1&query=Ali+Baba+Doner+Kebab+Giga+Mall+Islamabad',delivery:true},
  spain: {country:'BENICARLÓ, SPAIN',name:'Puerto Deportivo',address:'Puerto Deportivo, Local B4<br>12580 Benicarló, Castellón, Spain',services:['DINE IN','TAKEAWAY'],map:'https://www.google.com/maps/search/?api=1&query=Ali+Baba+Doner+Kebab+Puerto+Deportivo+Benicarlo',phone:'+34964919171',phoneLabel:'+34 964 91 91 71'}
};

function readStoredCart(value) {
  try {
    const data = JSON.parse(value === undefined ? localStorage.getItem(STORAGE_KEY) : value);
    return data && data.version === 1 && Array.isArray(data.items) ? data.items : [];
  } catch { return []; }
}
const cart = createCart(menuItems, readStoredCart());
const menuGrid = document.querySelector('#menu-grid');
const cartDialog = document.querySelector('#cart-dialog');
const checkoutForm = document.querySelector('#checkout-form');
const mobileToggle = document.querySelector('.mobile-toggle');
const mobileNav = document.querySelector('#mobile-nav');
let selectedFilter = 'favourites';
let selectedDish = null;
let dishQuantity = 1;
let fulfilment = 'delivery';
let cartView = 'cart';
let lastDialogTrigger = null;
let toastTimer;

function renderMenu(filter) {
  const items = menuItems.filter(item => filter === 'all' || (filter === 'favourites' ? item.favourite : item.category === filter));
  selectedFilter = filter;
  menuGrid.innerHTML = items.map((item,index) => `<article class="menu-card" style="animation-delay:${Math.min(index,5) * 40}ms"><button class="food-image" data-food="${item.id}" aria-label="View ${escapeHtml(item.name)} details"><img src="assets/${item.image}" alt="${escapeHtml(item.name)}" width="600" height="600" loading="lazy"><span class="food-tag ${index === 0 ? 'red' : ''}">${item.tag}</span></button><div class="food-info"><div><h3>${item.name}</h3><p>${item.description}</p></div><button class="food-more" data-food="${item.id}" aria-label="View ${escapeHtml(item.name)} details">${arrow}</button></div><div class="food-card-bottom"><strong class="food-price">${formatPrice(item.price)}</strong><button class="food-add" data-add="${item.id}" aria-label="Add ${escapeHtml(item.name)} to cart">Add to cart <span aria-hidden="true">+</span></button></div></article>`).join('');
  const labels = {all:'the full menu',favourites:'the favourites',doner:'döner and wraps',pizza:'pizza',burgers:'burgers',sides:'sides',drinks:'drinks'};
  document.querySelector('#menu-status').textContent = `${items.length} items shown for ${labels[filter]}.`;
  document.querySelector('.menu-count').textContent = `${String(items.length).padStart(2,'0')} REASONS TO DIG IN`;
  document.querySelectorAll('[data-filter]').forEach(button => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('is-active',active);
    button.setAttribute('aria-pressed',String(active));
  });
}

function renderLocation(id) {
  const branch = branches[id];
  document.querySelector('#location-detail').innerHTML = `${icon('pin')}<div><p class="location-country">${branch.country}</p><h3>${branch.name}</h3><p class="location-address">${branch.address}</p><div class="location-services">${branch.services.map(service=>`<span>${service}</span>`).join('')}</div></div><div class="location-actions"><a class="button button-red" href="${branch.map}" target="_blank" rel="noopener noreferrer">Get directions ${arrow}</a>${branch.phone ? `<a class="text-link light" href="tel:${branch.phone}">${branch.phoneLabel}${icon('phone')}</a>` : `<a class="text-link light" href="${deliveryUrl}" target="_blank" rel="noopener noreferrer">Order delivery ${arrow}</a>`}</div>`;
  document.querySelectorAll('[data-location]').forEach(button => {
    const active = button.dataset.location === id;
    button.classList.toggle('is-active',active);
    button.setAttribute('aria-pressed',String(active));
  });
}

function closeMobileNav() {
  mobileNav.hidden = true;
  mobileToggle.setAttribute('aria-expanded','false');
  mobileToggle.setAttribute('aria-label','Open navigation');
}

function openDialog(dialog, trigger) {
  const candidate = trigger || document.activeElement;
  if (candidate && !candidate.closest('dialog')) lastDialogTrigger = candidate;
  const opened = document.querySelector('dialog[open]');
  if (opened && opened !== dialog) opened.close();
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('dialog-open');
  document.querySelector('#floating-cart').hidden = true;
}

function goToMenu() {
  closeMobileNav();
  lastDialogTrigger = document.querySelector('[data-filter].is-active');
  document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
  document.querySelector('#menu').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  const target = document.querySelector('[data-filter].is-active');
  if (target) target.focus({preventScroll:true});
}

function showFood(id, trigger) {
  const item = menuItems.find(food => food.id === id);
  if (!item) return;
  selectedDish = item;
  dishQuantity = 1;
  document.querySelector('#food-detail').innerHTML = `<button class="dialog-close" aria-label="Close dish details">${icon('close')}</button><div class="food-dialog-image"><img src="assets/${item.image}" alt="${escapeHtml(item.name)}" width="600" height="600"></div><div class="food-dialog-copy"><p class="eyebrow dark"><span class="red-dot"></span> ${item.tag}</p><h2 id="food-title">${item.name}</h2><strong class="dish-price">${formatPrice(item.price)}</strong><p class="dish-subtitle">Sample price · PKR</p><p>${item.detail}</p><label class="dish-order-note" for="dish-note">Make it yours <span>(optional)</span><textarea id="dish-note" rows="2" maxlength="160" placeholder="Any preferences for this item?"></textarea></label><div class="dish-purchase"><div class="qty-stepper" role="group" aria-label="Dish quantity"><button data-dish-qty="-1" aria-label="Decrease quantity" disabled>−</button><output id="dish-quantity" aria-live="polite">1</output><button data-dish-qty="1" aria-label="Increase quantity">+</button></div><button class="button button-red dish-add" data-dish-add>Add to cart · <span id="dish-add-total">${formatPrice(item.price)}</span></button></div><p class="food-note">Menu and prices are for this presentation. Ask the restaurant about ingredients and allergens before placing a real order.</p></div>`;
  openDialog(document.querySelector('#food-dialog'),trigger);
}

function changeDishQuantity(delta) {
  if (!selectedDish) return;
  dishQuantity = Math.max(1,Math.min(20,dishQuantity + delta));
  document.querySelector('#dish-quantity').textContent = dishQuantity;
  document.querySelector('#dish-add-total').textContent = formatPrice(selectedDish.price * dishQuantity);
  document.querySelector('[data-dish-qty="-1"]').disabled = dishQuantity === 1;
  document.querySelector('[data-dish-qty="1"]').disabled = dishQuantity === 20;
}

function toast(message) {
  clearTimeout(toastTimer);
  const element = document.querySelector('#cart-toast');
  element.textContent = message;
  element.hidden = false;
  toastTimer = setTimeout(() => {element.hidden = true;},3000);
}

function saveCart() {
  try {localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,items:cart.serialize()}));} catch { /* In-memory ordering still works when browser storage is unavailable. */ }
}

function totalsMarkup(totals) {
  return `<div><dt>Subtotal (${totals.count} ${totals.count === 1 ? 'item' : 'items'})</dt><dd>${formatPrice(totals.subtotal)}</dd></div><div><dt>${fulfilment === 'delivery' ? 'Delivery · demo estimate' : 'Pickup'}</dt><dd>${totals.delivery ? formatPrice(totals.delivery) : 'Free'}</dd></div><div class="grand-total"><dt>Total</dt><dd>${formatPrice(totals.total)}</dd></div>`;
}

function renderCartUI() {
  const lines = cart.getItems();
  const totals = cart.getTotals(fulfilment);
  document.querySelector('#cart-count').textContent = totals.count;
  document.querySelector('#cart-status').textContent = `${totals.count} ${totals.count === 1 ? 'item' : 'items'} in your cart. Subtotal ${formatPrice(totals.subtotal)}.`;
  document.querySelector('.cart-toggle').setAttribute('aria-label',`Open cart, ${totals.count} ${totals.count === 1 ? 'item' : 'items'}`);
  document.querySelector('#floating-cart-summary').textContent = `${totals.count} ${totals.count === 1 ? 'item' : 'items'} · ${formatPrice(totals.subtotal)}`;
  document.querySelector('#floating-cart').hidden = !totals.count || Boolean(document.querySelector('dialog[open]'));
  document.body.classList.toggle('has-cart',totals.count > 0);
  document.querySelector('#cart-items').innerHTML = lines.length ? lines.map(line => `<article class="cart-line"><img src="assets/${line.item.image}" alt="" width="74" height="86"><div class="cart-line-info"><h3>${line.item.name}</h3><span class="cart-line-price">${formatPrice(line.lineTotal)} <small>(${formatPrice(line.unitPrice)} each)</small></span>${line.note ? `<p class="cart-line-note">Note: ${escapeHtml(line.note)}</p>` : ''}<div class="cart-line-controls"><div class="qty-stepper" role="group" aria-label="Quantity for ${escapeHtml(line.item.name)}"><button data-cart-qty="${escapeHtml(line.key)}" data-delta="-1" aria-label="Decrease quantity of ${escapeHtml(line.item.name)}">−</button><output aria-label="Quantity">${line.quantity}</output><button data-cart-qty="${escapeHtml(line.key)}" data-delta="1" aria-label="Increase quantity of ${escapeHtml(line.item.name)}" ${line.quantity >= 20 ? 'disabled' : ''}>+</button></div><button class="cart-remove" data-remove="${escapeHtml(line.key)}" aria-label="Remove ${escapeHtml(line.item.name)}">Remove</button></div></div></article>`).join('') : `<div class="cart-empty">${icon('bag')}<h3>A LITTLE EMPTY<br>IN HERE.</h3><p>Let’s fix that. Your next favourite is waiting on the menu.</p><button class="button button-red" data-continue-shopping>Find something delicious ${icon('arrow-right')}</button></div>`;
  document.querySelector('#cart-totals').innerHTML = totalsMarkup(totals);
  document.querySelector('#checkout-summary').innerHTML = totalsMarkup(totals);
  document.querySelector('#checkout-button').disabled = !totals.count;
  document.querySelector('#cart-footer').hidden = !totals.count || cartView !== 'cart';
  if (!totals.count && cartView === 'checkout') setCartView('cart');
}

function setCartView(view) {
  cartView = view;
  document.querySelector('#cart-panel').hidden = view !== 'cart';
  document.querySelector('#checkout-panel').hidden = view !== 'checkout';
  document.querySelector('#order-success').hidden = view !== 'success';
  document.querySelector('#cart-footer').hidden = view !== 'cart' || !cart.getTotals().count;
  document.querySelector('#cart-title').innerHTML = view === 'checkout' ? 'CHECK<span class="serif-word">out.</span>' : view === 'success' ? 'GOOD <span class="serif-word">choices.</span>' : 'YOUR <span class="serif-word">bag.</span>';
  document.querySelector('.cart-content').scrollTop = 0;
}

function openCart(trigger) {
  closeMobileNav();
  setCartView('cart');
  renderCartUI();
  openDialog(cartDialog,trigger);
}

function addItem(id, quantity = 1, note = '') {
  const item = menuItems.find(product => product.id === id);
  if (!item) return false;
  if (!cart.add(id,quantity,note)) {
    toast('Up to 20 of each item per preference. Please adjust your bag.');
    const detail = document.querySelector('#food-dialog .food-note');
    if (detail && document.querySelector('#food-dialog').open) detail.textContent = 'Your bag can hold up to 20 of this item with the same preferences. Reduce the quantity or update your bag.';
    return false;
  }
  saveCart();
  renderCartUI();
  toast(`${quantity > 1 ? quantity + ' × ' : ''}${item.name} added to your bag.`);
  return true;
}

function updateFulfilment() {
  fulfilment = checkoutForm.elements.fulfilment.value;
  const delivery = fulfilment === 'delivery';
  document.querySelector('#address-field').hidden = !delivery;
  const address = document.querySelector('#checkout-address');
  address.required = delivery;
  address.disabled = !delivery;
  address.setCustomValidity('');
  document.querySelector('#payment-label').textContent = delivery ? 'Cash on delivery' : 'Cash at pickup';
  renderCartUI();
}

function showCheckout() {
  if (!cart.getTotals().count) return;
  setCartView('checkout');
  updateFulfilment();
  document.querySelector('#checkout-title').focus({preventScroll:true});
}

function finishDemoOrder(event) {
  event.preventDefault();
  if (!cart.getTotals().count) {setCartView('cart');renderCartUI();return;}
  const name = checkoutForm.elements.customerName;
  name.setCustomValidity(name.value.trim().length >= 2 ? '' : 'Please enter your name.');
  const phone = checkoutForm.elements.phone;
  const normalizedPhone = phone.value.replace(/[\s()-]/g,'');
  phone.setCustomValidity(/^(?:\+92|0092|0)3\d{9}$/.test(normalizedPhone) ? '' : 'Enter a Pakistan mobile number, e.g. 03001234567 or +923001234567.');
  const address = checkoutForm.elements.address;
  address.setCustomValidity(fulfilment !== 'delivery' || address.value.trim().length >= 10 ? '' : 'Please add a complete delivery address (at least 10 characters).');
  if (!checkoutForm.reportValidity()) return;
  const branch = branches[checkoutForm.elements.branch.value];
  const totals = cart.getTotals(fulfilment);
  const lines = cart.getItems();
  const reference = `AB-DEMO-${Date.now().toString(36).slice(-6).toUpperCase()}`;
  const summary = lines.map(line=>`<div><dt>${line.quantity} × ${line.item.name}</dt><dd>${formatPrice(line.lineTotal)}</dd></div>`).join('');
  document.querySelector('#order-success').innerHTML = `<span class="success-mark">${icon('check')}</span><p class="eyebrow dark">A TASTE OF WHAT’S NEXT</p><h3 id="success-title" tabindex="-1">DEMO ORDER<br><span class="serif-word">created.</span></h3><p>Your bag looks delicious. This preview hasn’t sent an order or taken a payment.</p><p class="order-reference">${reference}</p><dl class="success-summary"><div><dt>Restaurant</dt><dd>${branch.name}</dd></div><div><dt>Service</dt><dd>${fulfilment === 'delivery' ? 'Delivery' : 'Pickup'}</dd></div>${summary}<div><dt>${fulfilment === 'delivery' ? 'Demo delivery fee' : 'Pickup fee'}</dt><dd>${totals.delivery ? formatPrice(totals.delivery) : 'Free'}</dd></div><div class="grand-total"><dt>Demo total</dt><dd>${formatPrice(totals.total)}</dd></div></dl><button class="button button-red" data-contact-order>Order with the restaurant ${arrow}</button><button class="cart-continue" data-continue-shopping>Back to the menu</button>`;
  cart.clear();
  saveCart();
  checkoutForm.reset();
  setCartView('success');
  renderCartUI();
  document.querySelector('#success-title').focus({preventScroll:true});
}

// Delegated controls keep dynamically rendered dishes and cart lines interactive.
document.addEventListener('click', event => {
  const button = event.target.closest('button, a');
  if (!button) return;
  if (button.matches('[data-filter]')) renderMenu(button.dataset.filter);
  if (button.matches('[data-location]')) renderLocation(button.dataset.location);
  if (button.matches('[data-food]')) showFood(button.dataset.food,button);
  if (button.matches('[data-order], [data-continue-shopping]')) goToMenu();
  if (button.matches('[data-contact-order]')) {closeMobileNav();openDialog(document.querySelector('#order-dialog'),button);}
  if (button.matches('[data-cart-open]')) openCart(button);
  if (button.matches('[data-add]')) addItem(button.dataset.add);
  if (button.matches('[data-dish-qty]')) changeDishQuantity(Number(button.dataset.dishQty));
  if (button.matches('[data-dish-add]') && selectedDish && addItem(selectedDish.id,dishQuantity,document.querySelector('#dish-note').value)) document.querySelector('#food-dialog').close();
  if (button.matches('[data-cart-qty]')) {
    const line = cart.getItems().find(item => item.key === button.dataset.cartQty);
    if (!line) return;
    const delta = Number(button.dataset.delta);
    if (cart.setQuantity(line.key,line.quantity + delta)) {
      saveCart();renderCartUI();
      const replacement = Array.from(document.querySelectorAll('[data-cart-qty]')).find(element => element.dataset.cartQty === line.key && Number(element.dataset.delta) === delta && !element.disabled);
      (replacement || document.querySelector('#checkout-button:not(:disabled)') || document.querySelector('[data-continue-shopping]')).focus({preventScroll:true});
    }
  }
  if (button.matches('[data-remove]')) {
    cart.remove(button.dataset.remove);saveCart();renderCartUI();
    const target = document.querySelector('#cart-items [data-remove], #cart-items [data-continue-shopping]');
    if (target) target.focus({preventScroll:true});
  }
  if (button.matches('[data-checkout]')) showCheckout();
  if (button.matches('[data-cart-back]')) {setCartView('cart');renderCartUI();document.querySelector('#checkout-button').focus({preventScroll:true});}
  if (button.matches('.dialog-close')) button.closest('dialog').close();
});

checkoutForm.addEventListener('submit',finishDemoOrder);
checkoutForm.addEventListener('change',event => {if (event.target.name === 'fulfilment') updateFulfilment();});
checkoutForm.addEventListener('input',event => {if (typeof event.target.setCustomValidity === 'function') event.target.setCustomValidity('');});

document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click',event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close',() => {
    if (dialog === cartDialog) {
      checkoutForm.reset();
      checkoutForm.querySelectorAll('input, textarea').forEach(input => input.setCustomValidity(''));
      fulfilment = 'delivery';
      document.querySelector('#checkout-address').required = true;
      document.querySelector('#checkout-address').disabled = false;
      document.querySelector('#address-field').hidden = false;
    }
    if (document.querySelector('dialog[open]')) return;
    document.body.classList.remove('dialog-open');
    renderCartUI();
    if (lastDialogTrigger && lastDialogTrigger.isConnected && !lastDialogTrigger.closest('dialog')) lastDialogTrigger.focus({preventScroll:true});
  });
});
mobileToggle.addEventListener('click',()=>{const open = mobileNav.hidden;mobileNav.hidden = !open;mobileToggle.setAttribute('aria-expanded',String(open));mobileToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
mobileNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMobileNav));
document.addEventListener('keydown',event=>{if (event.key === 'Escape' && !mobileNav.hidden) {closeMobileNav();mobileToggle.focus();}});
window.matchMedia('(min-width: 761px)').addEventListener('change',event=>{if(event.matches) closeMobileNav();});
window.addEventListener('storage',event=>{if(event.key === STORAGE_KEY || event.key === null) {cart.replace(readStoredCart(event.newValue));renderCartUI();}});
document.querySelector('#year').textContent = new Date().getFullYear();
renderMenu(selectedFilter);
renderLocation('dha');
renderCartUI();
