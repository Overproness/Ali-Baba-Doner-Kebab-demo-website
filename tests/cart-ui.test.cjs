const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const siteDirectory = path.resolve(__dirname, '../dist');
const markup = fs.readFileSync(path.join(siteDirectory, 'index.html'), 'utf8');
const scripts = ['menu-data.js', 'cart-core.js', 'app.js'].map(file => ({
  file, source: fs.readFileSync(path.join(siteDirectory, file), 'utf8')
}));
const storageKey = 'alibaba-cart-v1';

function setup(t, { saved, blockedStorage = false } = {}) {
  const dom = new JSDOM(markup, {
    url: 'http://localhost:4173/', runScripts: 'outside-only', pretendToBeVisual: true
  });
  t.after(() => dom.window.close());
  const { window } = dom;
  const document = window.document;
  const errors = [];
  const requests = [];
  window.addEventListener('error', event => errors.push(event.error || event.message));
  window.matchMedia = query => ({
    matches: false, media: query, addEventListener() {}, removeEventListener() {}
  });
  window.HTMLElement.prototype.scrollIntoView = function () {};
  window.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
    this.querySelector('button, input, select, textarea, [tabindex]')?.focus();
  };
  // Native close events are queued, rather than synchronously dispatched.
  window.HTMLDialogElement.prototype.close = function () {
    if (!this.open) return;
    this.open = false;
    window.setTimeout(() => this.dispatchEvent(new window.Event('close')), 0);
  };
  window.fetch = (...args) => {
    requests.push(args);
    return Promise.reject(new Error('Checkout must not submit a real network request.'));
  };
  if (saved !== undefined) window.localStorage.setItem(storageKey, saved);
  if (blockedStorage) Object.defineProperty(window, 'localStorage', {
    get() { throw new window.DOMException('Storage unavailable', 'SecurityError'); }
  });
  for (const { source, file } of scripts) window.eval(`${source}\n//# sourceURL=${file}`);
  assert.deepEqual(errors, [], 'page initializes without JavaScript errors');

  function find(selector) {
    const element = document.querySelector(selector);
    assert.ok(element, `expected element ${selector}`);
    return element;
  }
  function click(selector) { find(selector).click(); }
  function input(selector, value) {
    const field = find(selector);
    field.value = value;
    field.dispatchEvent(new window.Event('input', { bubbles: true }));
    return field;
  }
  function service(value) {
    const radio = find(`input[name="fulfilment"][value="${value}"]`);
    radio.checked = true;
    radio.dispatchEvent(new window.Event('change', { bubbles: true }));
  }
  function fillCustomer({ phone = '03001234567', address = 'House 1, Street 2, DHA Islamabad' } = {}) {
    input('#checkout-name', 'Ali Khan');
    input('#checkout-phone', phone);
    input('#checkout-address', address);
  }
  const tick = () => new Promise(resolve => window.setTimeout(resolve, 5));
  return { window, document, find, click, input, service, fillCustomer, tick, errors, requests };
}

test('renders all fifteen priced dishes and keeps category filters interactive', t => {
  const ui = setup(t);
  ui.click('[data-filter="all"]');
  assert.equal(ui.document.querySelectorAll('.menu-card').length, 15);
  assert.equal(ui.document.querySelectorAll('.food-price').length, 15);
  assert.match(ui.find('.food-price').textContent, /^Rs [\d,]+$/);
  for (const filter of ['doner', 'pizza', 'burgers', 'sides', 'drinks']) {
    ui.click(`[data-filter="${filter}"]`);
    const count = ui.window.AliBabaMenu.filter(item => item.category === filter).length;
    assert.equal(ui.document.querySelectorAll('.menu-card').length, count);
    assert.equal(ui.find(`[data-filter="${filter}"]`).getAttribute('aria-pressed'), 'true');
    assert.match(ui.find('#menu-status').textContent, new RegExp(`^${count} items shown`));
  }
});

test('adds directly from the menu and updates header, floating cart and saved state', t => {
  const ui = setup(t);
  ui.click('[data-add="wrap"]');
  ui.click('[data-add="wrap"]');
  assert.equal(ui.find('#cart-count').textContent, '2');
  assert.equal(ui.find('#floating-cart').hidden, false);
  assert.match(ui.find('#floating-cart-summary').textContent, /2 items · Rs 2,000/);
  const stored = JSON.parse(ui.window.localStorage.getItem(storageKey));
  assert.deepEqual(stored, { version: 1, items: [{ id: 'wrap', quantity: 2, note: '' }] });
});

test('dish modal calculates selected quantity and adds notes as a distinct cart line', async t => {
  const ui = setup(t);
  ui.click('[data-food="wrap"]');
  assert.equal(ui.find('#food-dialog').open, true);
  assert.equal(ui.find('.dish-price').textContent, 'Rs 1,000');
  ui.click('[data-dish-qty="1"]');
  ui.click('[data-dish-qty="1"]');
  assert.equal(ui.find('#dish-quantity').textContent, '3');
  assert.equal(ui.find('#dish-add-total').textContent, 'Rs 3,000');
  ui.input('#dish-note', '  Sauce on the side  ');
  ui.click('[data-dish-add]');
  await ui.tick();
  assert.equal(ui.find('#food-dialog').open, false);
  assert.equal(ui.find('#cart-count').textContent, '3');
  ui.click('.cart-toggle');
  assert.match(ui.find('.cart-line-note').textContent, /Sauce on the side/);
  assert.match(ui.find('#cart-totals').textContent, /Rs 3,200/);
  assert.equal(ui.find('#floating-cart').hidden, true);
});

test('cart increment, decrement and removal keep totals and empty state consistent', t => {
  const ui = setup(t);
  ui.click('[data-add="wrap"]');
  ui.click('.cart-toggle');
  ui.click('[data-cart-qty][data-delta="1"]');
  assert.equal(ui.find('#cart-count').textContent, '2');
  assert.match(ui.find('#cart-totals').textContent, /Rs 2,200/);
  ui.click('[data-cart-qty][data-delta="-1"]');
  assert.equal(ui.find('#cart-count').textContent, '1');
  ui.click('[data-remove]');
  assert.equal(ui.find('#cart-count').textContent, '0');
  assert.ok(ui.document.querySelector('.cart-empty'));
  assert.equal(ui.find('#cart-footer').hidden, true);
  assert.equal(ui.find('#checkout-button').disabled, true);
});

test('restores saved cart on reload and tolerates corrupt or blocked storage', t => {
  const first = setup(t);
  first.click('[data-add="wrap"]');
  const saved = first.window.localStorage.getItem(storageKey);
  const restored = setup(t, { saved });
  assert.equal(restored.find('#cart-count').textContent, '1');
  restored.click('.cart-toggle');
  assert.equal(restored.document.querySelectorAll('.cart-line').length, 1);
  const corrupt = setup(t, { saved: '{this is not json' });
  assert.equal(corrupt.find('#cart-count').textContent, '0');
  const malformedUnicode = setup(t, {
    saved: JSON.stringify({ version: 1, items: [{ id: 'wrap', quantity: 1, note: '\ud800' }] })
  });
  assert.equal(malformedUnicode.find('#cart-count').textContent, '1');
  assert.deepEqual(malformedUnicode.errors, []);
  const blocked = setup(t, { blockedStorage: true });
  blocked.click('[data-add="wrap"]');
  assert.equal(blocked.find('#cart-count').textContent, '1');
  assert.deepEqual(blocked.errors, []);
});

test('pickup removes the demo fee and disables a previously invalid hidden address', t => {
  const ui = setup(t);
  ui.click('[data-add="wrap"]');
  ui.click('.cart-toggle');
  ui.click('[data-checkout]');
  ui.fillCustomer({ address: 'short' });
  const address = ui.find('#checkout-address');
  address.setCustomValidity('Please add a complete address.');
  ui.service('pickup');
  assert.equal(ui.find('#address-field').hidden, true);
  assert.equal(address.disabled, true);
  assert.equal(address.required, false);
  assert.equal(address.validationMessage, '');
  assert.equal(ui.find('#checkout-form').checkValidity(), true);
  assert.match(ui.find('#checkout-summary').textContent, /Rs 1,000/);
  assert.doesNotMatch(ui.find('#checkout-summary').textContent, /Rs 1,200/);
  assert.equal(ui.find('#payment-label').textContent, 'Cash at pickup');
  ui.service('delivery');
  assert.equal(address.disabled, false);
  assert.equal(address.required, true);
  assert.equal(ui.find('#address-field').hidden, false);
  assert.match(ui.find('#checkout-summary').textContent, /Rs 1,200/);
});

test('invalid phone prevents a demo order and corrected delivery checkout succeeds locally', t => {
  const ui = setup(t);
  ui.click('[data-add="wrap"]');
  ui.click('.cart-toggle');
  ui.click('[data-checkout]');
  ui.fillCustomer({ phone: 'not-a-phone' });
  ui.click('.checkout-submit');
  assert.equal(ui.find('#order-success').hidden, true);
  assert.equal(ui.find('#checkout-panel').hidden, false);
  assert.equal(ui.find('#checkout-phone').validity.customError, true);
  assert.equal(ui.find('#cart-count').textContent, '1');
  ui.input('#checkout-phone', '+92 300 1234567');
  ui.click('.checkout-submit');
  assert.equal(ui.find('#order-success').hidden, false);
  assert.match(ui.find('#order-success').textContent, /hasn’t sent an order or taken a payment/);
  assert.match(ui.find('.success-summary').textContent, /Rs 1,200/);
  assert.equal(ui.find('#cart-count').textContent, '0');
  assert.equal(ui.find('#checkout-name').value, '');
  assert.equal(ui.find('#checkout-phone').value, '');
  assert.equal(ui.find('#checkout-address').value, '');
  assert.equal(JSON.parse(ui.window.localStorage.getItem(storageKey)).items.length, 0);
  assert.deepEqual(ui.requests, []);
  assert.deepEqual(ui.errors, []);
});

test('pickup checkout succeeds with a hidden invalid address and no delivery fee', t => {
  const ui = setup(t);
  ui.click('[data-add="wrap"]');
  ui.click('.cart-toggle');
  ui.click('[data-checkout]');
  ui.fillCustomer({ address: 'short' });
  ui.find('#checkout-address').setCustomValidity('Address invalid');
  ui.service('pickup');
  ui.click('.checkout-submit');
  assert.equal(ui.find('#order-success').hidden, false);
  assert.match(ui.find('.success-summary').textContent, /Pickup/);
  assert.match(ui.find('.success-summary').textContent, /Rs 1,000/);
  assert.doesNotMatch(ui.find('.success-summary').textContent, /Rs 1,200/);
  assert.deepEqual(ui.requests, []);
});

test('closing checkout clears customer data while preserving cart and restoring focus', async t => {
  const ui = setup(t);
  ui.click('[data-add="wrap"]');
  ui.click('.cart-toggle');
  ui.click('[data-checkout]');
  ui.fillCustomer();
  ui.input('#checkout-notes', 'Private customer instruction');
  ui.service('pickup');
  ui.click('#cart-dialog .dialog-close');
  await ui.tick();
  assert.equal(ui.find('#checkout-name').value, '');
  assert.equal(ui.find('#checkout-phone').value, '');
  assert.equal(ui.find('#checkout-address').value, '');
  assert.equal(ui.find('#checkout-notes').value, '');
  assert.equal(ui.find('#checkout-address').disabled, false);
  assert.equal(ui.find('#cart-count').textContent, '1');
  assert.equal(ui.document.activeElement, ui.find('.cart-toggle'));
  assert.equal(ui.document.body.classList.contains('dialog-open'), false);
  const saved = ui.window.localStorage.getItem(storageKey);
  assert.doesNotMatch(saved, /Ali Khan|03001234567|Private customer/);
});

test('cart to restaurant contact switches dialogs without clearing the bag', async t => {
  const ui = setup(t);
  ui.click('[data-add="wrap"]');
  ui.click('.cart-toggle');
  ui.click('#cart-footer [data-contact-order]');
  await ui.tick();
  assert.equal(ui.find('#cart-dialog').open, false);
  assert.equal(ui.find('#order-dialog').open, true);
  assert.equal(ui.find('#cart-count').textContent, '1');
  assert.equal(ui.document.body.classList.contains('dialog-open'), true);
  assert.equal(ui.find('#floating-cart').hidden, true);
  ui.click('#order-dialog .dialog-close');
  await ui.tick();
  assert.equal(ui.find('#floating-cart').hidden, false);
  assert.equal(ui.document.body.classList.contains('dialog-open'), false);
});

test('cart notes render as text and storage events synchronize another tab', t => {
  const ui = setup(t);
  const note = '<img src=x onerror="window.compromised=true">';
  ui.click('[data-food="wrap"]');
  ui.input('#dish-note', note);
  ui.click('[data-dish-add]');
  ui.click('.cart-toggle');
  assert.equal(ui.find('.cart-line-note').textContent, `Note: ${note}`);
  assert.equal(ui.find('.cart-line-note').children.length, 0);
  assert.equal(ui.window.compromised, undefined);
  ui.window.dispatchEvent(new ui.window.StorageEvent('storage', {
    key: storageKey,
    newValue: JSON.stringify({ version: 1, items: [{ id: 'mint', quantity: 2, note: '' }] })
  }));
  assert.equal(ui.find('#cart-count').textContent, '2');
  assert.match(ui.find('.cart-line h3').textContent, /Mint Margarita/);
  assert.match(ui.find('#cart-totals').textContent, /Rs 900/);
});

test('continue shopping focuses the menu after the queued native dialog close', async t => {
  const ui = setup(t);
  ui.click('[data-add="wrap"]');
  ui.click('.cart-toggle');
  ui.click('#cart-footer [data-continue-shopping]');
  await ui.tick();
  assert.equal(ui.find('#cart-dialog').open, false);
  assert.equal(ui.document.activeElement, ui.find('[data-filter].is-active'));
  assert.equal(ui.document.body.classList.contains('dialog-open'), false);
});
