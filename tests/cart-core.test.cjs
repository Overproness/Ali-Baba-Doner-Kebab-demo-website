const test = require('node:test');
const assert = require('node:assert/strict');
const { createCart, formatPrice } = require('../dist/cart-core.js');

const catalog = [
  { id: 'wrap', name: 'Chicken Döner Wrap', price: 1000 },
  { id: 'platter', name: 'Döner Platter', price: 1500 },
  { id: 'mint', name: 'Mint Margarita', price: 350 }
];

test('calculates item count, line prices and delivery from actual quantities', () => {
  const cart = createCart(catalog);
  assert.equal(cart.add('wrap', 2), true);
  assert.equal(cart.add('mint', 3), true);
  assert.deepEqual(cart.getTotals(), {
    count: 5, subtotal: 3050, delivery: 200, total: 3250
  });
  const wrap = cart.getItems().find(line => line.id === 'wrap');
  assert.equal(wrap.unitPrice, 1000);
  assert.equal(wrap.lineTotal, 2000);
  assert.equal(wrap.item.name, 'Chicken Döner Wrap');
});

test('pickup is free and an empty cart never receives a delivery fee', () => {
  const cart = createCart(catalog);
  assert.deepEqual(cart.getTotals(), { count: 0, subtotal: 0, delivery: 0, total: 0 });
  cart.add('platter');
  assert.deepEqual(cart.getTotals('pickup'), {
    count: 1, subtotal: 1500, delivery: 0, total: 1500
  });
  assert.equal(cart.getTotals('delivery').delivery, 200);
  cart.clear();
  assert.deepEqual(cart.getTotals('pickup'), { count: 0, subtotal: 0, delivery: 0, total: 0 });
});

test('merges the same item and trimmed note, while retaining distinct requests', () => {
  const cart = createCart(catalog);
  cart.add('wrap', 1, '  No onions  ');
  cart.add('wrap', 2, 'No onions');
  cart.add('wrap', 1, 'Extra spicy');
  assert.equal(cart.getItems().length, 2);
  assert.equal(cart.getItems().find(line => line.note === 'No onions').quantity, 3);
  assert.equal(cart.getItems().find(line => line.note === 'Extra spicy').quantity, 1);
  assert.notEqual(cart.getItems()[0].key, cart.getItems()[1].key);
});

test('updates quantities, removes at zero, and recalculates totals', () => {
  const cart = createCart(catalog);
  cart.add('wrap', 2);
  cart.add('mint');
  const wrapKey = cart.getItems().find(line => line.id === 'wrap').key;
  assert.equal(cart.setQuantity(wrapKey, 4), true);
  assert.equal(cart.getTotals().subtotal, 4350);
  assert.equal(cart.setQuantity(wrapKey, 0), true);
  assert.equal(cart.getItems().some(line => line.id === 'wrap'), false);
  assert.equal(cart.getTotals().total, 550);
  cart.remove(cart.getItems()[0].key);
  assert.deepEqual(cart.getTotals(), { count: 0, subtotal: 0, delivery: 0, total: 0 });
});

test('rejects unknown products and invalid quantities without changing the cart', () => {
  const cart = createCart(catalog);
  assert.equal(cart.add('not-on-menu'), false);
  for (const quantity of [0, -1, 1.5, 21, NaN, Infinity, '2', null]) {
    assert.equal(cart.add('wrap', quantity), false, `quantity ${String(quantity)}`);
  }
  cart.add('wrap', 2);
  const key = cart.getItems()[0].key;
  for (const quantity of [-1, 0.5, 21, NaN, Infinity, '2', null]) {
    assert.equal(cart.setQuantity(key, quantity), false, `quantity ${String(quantity)}`);
    assert.equal(cart.getItems()[0].quantity, 2);
  }
  assert.equal(cart.setQuantity('missing-line', 1), false);
});

test('caps merged quantities at twenty and rejects additions to a full line', () => {
  const cart = createCart(catalog, [
    { id: 'wrap', quantity: 15, note: 'No onions' },
    { id: 'wrap', quantity: 15, note: ' No onions ' }
  ]);
  assert.equal(cart.getItems().length, 1);
  assert.equal(cart.getItems()[0].quantity, 20);
  assert.equal(cart.add('wrap', 1, 'No onions'), false);
  assert.equal(cart.getItems()[0].quantity, 20);
});

test('restores a saved cart with catalog prices instead of trusting stored prices', () => {
  const original = createCart(catalog);
  original.add('wrap', 2, 'Sauce on the side');
  original.add('mint', 1);
  const saved = JSON.parse(JSON.stringify(original.serialize()));
  saved[0].price = 1;
  saved[0].unitPrice = 1;
  saved[0].lineTotal = 1;
  const restored = createCart(catalog, saved);
  assert.deepEqual(restored.getTotals(), original.getTotals());
  assert.deepEqual(restored.serialize(), original.serialize());
  assert.deepEqual(Object.keys(restored.serialize()[0]).sort(), ['id', 'note', 'quantity']);
});

test('discards corrupt stored entries and handles non-array storage', () => {
  const stored = [
    null, undefined, 5, 'wrap', {},
    { id: 'not-on-menu', quantity: 1 },
    { id: 'wrap', quantity: -1 },
    { id: 'wrap', quantity: 21 },
    { id: 'wrap', quantity: 1.2 },
    { id: 'wrap', quantity: Infinity },
    { id: 'wrap', quantity: '2' },
    { id: 'mint', quantity: 2, note: '  Less ice  ' }
  ];
  const cart = createCart(catalog, stored);
  assert.deepEqual(cart.serialize(), [{ id: 'mint', quantity: 2, note: 'Less ice' }]);
  for (const invalid of [null, undefined, {}, 'corrupt JSON text', 123]) {
    assert.deepEqual(createCart(catalog, invalid).serialize(), []);
  }
});

test('limits notes to 160 characters and treats markup as ordinary data', () => {
  const cart = createCart(catalog);
  const markup = '<img src=x onerror="globalThis.compromised=true">';
  cart.add('wrap', 1, markup);
  assert.equal(cart.getItems()[0].note, markup);
  assert.equal(globalThis.compromised, undefined);
  cart.add('mint', 1, `  ${'x'.repeat(200)}  `);
  assert.equal(cart.getItems()[1].note, 'x'.repeat(160));
});

test('keeps at most fifty distinct lines and can replace a cart after reload', () => {
  const cart = createCart(catalog);
  for (let index = 0; index < 50; index++) {
    assert.equal(cart.add('wrap', 1, `Request ${index}`), true);
  }
  assert.equal(cart.add('wrap', 1, 'Request 50'), false);
  assert.equal(cart.getItems().length, 50);
  cart.replace([{ id: 'platter', quantity: 2, note: '' }]);
  assert.deepEqual(cart.serialize(), [{ id: 'platter', quantity: 2, note: '' }]);
  cart.replace(null);
  assert.deepEqual(cart.serialize(), []);
});

test('formats sample Pakistan rupee prices consistently', () => {
  assert.equal(formatPrice(1000), 'Rs 1,000');
  assert.equal(formatPrice(0), 'Rs 0');
  assert.equal(formatPrice(12345), 'Rs 12,345');
});
