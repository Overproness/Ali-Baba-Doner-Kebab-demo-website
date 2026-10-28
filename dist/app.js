'use strict';

const menuItems = [
  { id:'wrap', name:'The Chicken Döner Wrap', category:'doner', favourite:true, image:'doner-wrap.webp', tag:'THE SIGNATURE', description:'Tender chicken, crisp salad and signature sauces, all wrapped up in warm flatbread.', detail:'A proper handful of flavour. Chicken, fresh vegetables and sauces come together in a warm, toasted wrap. Ask your restaurant about available fillings and customisations.' },
  { id:'platter', name:'The Döner Platter', category:'doner', favourite:true, image:'doner-platter.webp', tag:'GO ALL IN', description:'Your döner favourites, unpacked. A generous plate with fresh salad, sides and sauce.', detail:'All the good stuff, with room for more. Döner meat, colourful salad, sides and sauces served as a satisfying platter. Rice, fries and meat options vary by branch.' },
  { id:'pizza', name:'The Döner Pizza', category:'pizza', favourite:true, image:'doner-pizza.webp', tag:'A SLICE OF ALI BABA', description:'Golden, cheesy and loaded with döner flavour. Made for sharing. Or keeping.', detail:'Two cravings, one pizza. A golden base, melted cheese and döner-inspired toppings. Check the live branch menu for sizes, toppings and available flavours.' },
  { id:'fries', name:'Loaded Fries', category:'sides', image:'loaded-fries.webp', tag:'ON THE SIDE', description:'Golden fries, taken up a notch with toppings and a generous drizzle of sauce.', detail:'A little extra for the table. Golden fries with loaded toppings and sauces. Ask your branch about the current options.' },
  { id:'falafel', name:'Crispy Falafel', category:'sides', image:'falafel.webp', tag:'CRUNCH TIME', description:'Crisp on the outside, full of flavour inside. A very good addition to your order.', detail:'A crispy favourite that deserves a spot on your table. Contact the branch for serving options, ingredients and dietary requirements.' },
  { id:'mint', name:'Mint Margarita', category:'sides', image:'mint-margarita.webp', tag:'SIP SOMETHING FRESH', description:'Cool, minty and refreshing. The perfect partner for a serious döner craving.', detail:'A cool mint refreshment to go with your favourites. Drinks, ingredients and serving styles vary by branch; check the restaurant menu for today’s selection.' }
];

const branches = {
  dha: {country:'ISLAMABAD, PAKISTAN',name:'Central Park, DHA 2',address:'Central Park, DHA Phase 2<br>Islamabad, Pakistan',services:['DINE IN','TAKEAWAY'],map:'https://www.google.com/maps/search/?api=1&query=Ali+Baba+Doner+Kebab+Central+Park+DHA+2+Islamabad',phone:'+923100555007',phoneLabel:'0310 0555007'},
  giga: {country:'ISLAMABAD, PAKISTAN',name:'Giga Mall',address:'Unit 6, second floor, Giga Mall<br>DHA Phase 2, Islamabad, Pakistan',services:['DINE IN','DELIVERY'],map:'https://www.google.com/maps/search/?api=1&query=Ali+Baba+Doner+Kebab+Giga+Mall+Islamabad',delivery:true},
  spain: {country:'BENICARLÓ, SPAIN',name:'Puerto Deportivo',address:'Puerto Deportivo, Local B4<br>12580 Benicarló, Castellón, Spain',services:['DINE IN','TAKEAWAY'],map:'https://www.google.com/maps/search/?api=1&query=Ali+Baba+Doner+Kebab+Puerto+Deportivo+Benicarlo',phone:'+34964919171',phoneLabel:'+34 964 91 91 71'}
};

const deliveryUrl = 'https://www.foodpanda.pk/restaurant/et5i/ali-baba-doner-kebab';
const arrow = '<svg class="icon" aria-hidden="true"><use href="#arrow-up-right"/></svg>';
const menuGrid = document.querySelector('#menu-grid');
let selectedFilter = 'favourites';
let lastDialogTrigger = null;

function renderMenu(filter) {
  const items = menuItems.filter(item => filter === 'favourites' ? item.favourite : item.category === filter);
  selectedFilter = filter;
  menuGrid.innerHTML = items.map((item,index) => `<article class="menu-card" style="animation-delay:${index * 45}ms"><div class="food-image"><img src="assets/${item.image}" alt="${item.name}" width="600" height="600" loading="lazy"><span class="food-tag ${index === 0 ? 'red' : ''}">${item.tag}</span></div><div class="food-info"><div><h3>${item.name}</h3><p>${item.description}</p></div><button class="food-more" data-food="${item.id}" aria-label="View ${item.name} details">${arrow}</button></div></article>`).join('');
  document.querySelector('#menu-status').textContent = `${items.length} menu items shown for ${filter === 'favourites' ? 'the favourites' : filter === 'doner' ? 'döner and wraps' : filter === 'pizza' ? 'pizza' : 'sides and sips'}.`;
  document.querySelector('.menu-count').textContent = `${String(items.length).padStart(2,'0')} GOOD REASONS TO DIG IN`;
  document.querySelectorAll('[data-filter]').forEach(button => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('is-active',active);
    button.setAttribute('aria-pressed',String(active));
  });
}

function renderLocation(id) {
  const branch = branches[id];
  document.querySelector('#location-detail').innerHTML = `<svg class="icon" aria-hidden="true"><use href="#pin"/></svg><div><p class="location-country">${branch.country}</p><h3>${branch.name}</h3><p class="location-address">${branch.address}</p><div class="location-services">${branch.services.map(service=>`<span>${service}</span>`).join('')}</div></div><div class="location-actions"><a class="button button-red" href="${branch.map}" target="_blank" rel="noopener noreferrer">Get directions ${arrow}</a>${branch.phone ? `<a class="text-link light" href="tel:${branch.phone}">${branch.phoneLabel}<svg class="icon" aria-hidden="true"><use href="#phone"/></svg></a>` : `<a class="text-link light" href="${deliveryUrl}" target="_blank" rel="noopener noreferrer">Order delivery ${arrow}</a>`}</div>`;
  document.querySelectorAll('[data-location]').forEach(button => {
    const active = button.dataset.location === id;
    button.classList.toggle('is-active',active);
    button.setAttribute('aria-pressed',String(active));
  });
}

function openDialog(dialog, trigger) {
  const candidate = trigger || document.activeElement;
  if (!candidate.closest('dialog')) lastDialogTrigger = candidate;
  const openedDialog = document.querySelector('dialog[open]');
  if (openedDialog) openedDialog.close();
  dialog.showModal();
  document.body.classList.add('dialog-open');
}

function showFood(id, trigger) {
  const item = menuItems.find(food => food.id === id);
  if (!item) return;
  document.querySelector('#food-detail').innerHTML = `<button class="dialog-close" aria-label="Close dish details"><svg class="icon"><use href="#close"/></svg></button><div class="food-dialog-image"><img src="assets/${item.image}" alt="${item.name}" width="600" height="600"></div><div class="food-dialog-copy"><p class="eyebrow dark"><span class="red-dot"></span> ${item.tag}</p><h2 id="food-title">${item.name}</h2><p>${item.detail}</p><p class="food-note">Photos and options are from the Giga Mall menu. Availability and presentation may vary. Ask your branch about allergens before ordering.</p><button class="button button-red" data-order>Choose a restaurant ${arrow}</button></div>`;
  openDialog(document.querySelector('#food-dialog'),trigger);
}

document.addEventListener('click', event => {
  const filter = event.target.closest('[data-filter]');
  if(filter) renderMenu(filter.dataset.filter);
  const location = event.target.closest('[data-location]');
  if(location) renderLocation(location.dataset.location);
  const food = event.target.closest('[data-food]');
  if(food) showFood(food.dataset.food,food);
  const order = event.target.closest('[data-order]');
  if(order) {closeMobileNav();openDialog(document.querySelector('#order-dialog'),order);}
  const close = event.target.closest('.dialog-close');
  if(close) close.closest('dialog').close();
});

document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => {
    if(event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if(event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if(document.querySelector('dialog[open]')) return;
    document.body.classList.remove('dialog-open');
    if(lastDialogTrigger && lastDialogTrigger.isConnected && !lastDialogTrigger.closest('dialog')) lastDialogTrigger.focus({preventScroll:true});
  });
});

const mobileToggle = document.querySelector('.mobile-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMobileNav(){mobileNav.hidden = true;mobileToggle.setAttribute('aria-expanded','false');mobileToggle.setAttribute('aria-label','Open navigation');}
mobileToggle.addEventListener('click',()=>{const open = mobileNav.hidden;mobileNav.hidden = !open;mobileToggle.setAttribute('aria-expanded',String(open));mobileToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
mobileNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMobileNav));
document.addEventListener('keydown',event=>{if(event.key==='Escape' && !mobileNav.hidden){closeMobileNav();mobileToggle.focus();}});
window.matchMedia('(min-width: 761px)').addEventListener('change',event=>{if(event.matches)closeMobileNav();});
document.querySelector('#year').textContent = new Date().getFullYear();
renderMenu(selectedFilter);
renderLocation('dha');
