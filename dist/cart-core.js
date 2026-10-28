(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AliBabaCart = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const MAX_QUANTITY = 20;
  const MAX_LINES = 50;
  const cleanNote = note => typeof note === 'string' ? Array.from(note.trim().slice(0, 160), character => {
    const code = character.codePointAt(0);
    return code >= 0xD800 && code <= 0xDFFF ? '\uFFFD' : character;
  }).join('') : '';
  const validQuantity = quantity => Number.isInteger(quantity) && quantity >= 1 && quantity <= MAX_QUANTITY;
  const formatPrice = amount => `Rs ${Math.round(amount).toLocaleString('en-PK')}`;

  function createCart(catalog, storedEntries = []) {
    const products = new Map(catalog.filter(item => item && typeof item.id === 'string' && Number.isInteger(item.price) && item.price >= 0).map(item => [item.id, item]));
    let lines = [];
    const keyFor = (id, note) => `${id}:${encodeURIComponent(note)}`;

    function add(id, quantity = 1, note = '') {
      if (!products.has(id) || !validQuantity(quantity)) return false;
      note = cleanNote(note);
      const key = keyFor(id, note);
      const line = lines.find(entry => entry.key === key);
      if (line) {
        if (line.quantity + quantity > MAX_QUANTITY) return false;
        line.quantity += quantity;
      } else {
        if (lines.length >= MAX_LINES) return false;
        lines.push({key, id, quantity, note});
      }
      return true;
    }

    function remove(key) {
      const index = lines.findIndex(line => line.key === key);
      if (index === -1) return false;
      lines.splice(index, 1);
      return true;
    }

    function setQuantity(key, quantity) {
      if (quantity === 0) return remove(key);
      const line = lines.find(entry => entry.key === key);
      if (!line || !validQuantity(quantity)) return false;
      line.quantity = quantity;
      return true;
    }

    function replace(entries) {
      lines = [];
      if (!Array.isArray(entries)) return;
      entries.slice(0, 200).forEach(entry => {
        if (!entry || typeof entry !== 'object' || !products.has(entry.id) || !validQuantity(entry.quantity)) return;
        const note = cleanNote(entry.note);
        const key = keyFor(entry.id, note);
        const existing = lines.find(line => line.key === key);
        if (existing) existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + entry.quantity);
        else if (lines.length < MAX_LINES) lines.push({key, id:entry.id, quantity:entry.quantity, note});
      });
    }

    function getItems() {
      return lines.map(line => {
        const item = products.get(line.id);
        return {...line, item:{...item}, unitPrice:item.price, lineTotal:item.price * line.quantity};
      });
    }

    function getTotals(mode = 'delivery') {
      const count = lines.reduce((sum, line) => sum + line.quantity, 0);
      const subtotal = getItems().reduce((sum, line) => sum + line.lineTotal, 0);
      const delivery = count > 0 && mode === 'delivery' ? 200 : 0;
      return {count, subtotal, delivery, total:subtotal + delivery};
    }

    replace(storedEntries);
    return {
      add, setQuantity, remove, replace, getItems, getTotals,
      clear() { lines = []; },
      serialize() { return lines.map(({id, quantity, note}) => ({id, quantity, note})); }
    };
  }

  return {createCart, formatPrice};
});
