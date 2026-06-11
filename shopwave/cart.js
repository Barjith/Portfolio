// ── Cart state & UI ───────────────────────────────────────────────────────────
const Cart = (() => {
  let items = JSON.parse(localStorage.getItem('sw_cart') || '[]');

  const save  = () => localStorage.setItem('sw_cart', JSON.stringify(items));
  const total = () => items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = () => items.reduce((s, i) => s + i.qty, 0);

  const updateBadge = () => {
    const b = document.getElementById('cartBadge');
    if (b) { b.textContent = count(); b.style.display = count() ? 'flex' : 'none'; }
  };

  const render = () => {
    const list    = document.getElementById('cartItems');
    const footer  = document.getElementById('cartFooter');
    const empty   = document.getElementById('cartEmpty');
    const totalEl = document.getElementById('cartTotal');
    if (!list) return;

    list.innerHTML = '';
    if (items.length === 0) {
      footer.hidden = true; empty.hidden = false; return;
    }
    footer.hidden = false; empty.hidden = true;

    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <span class="ci-emoji" aria-hidden="true">${item.emoji}</span>
        <div class="ci-body">
          <p class="ci-name">${item.name}</p>
          <p class="ci-price">$${(item.price * item.qty).toFixed(2)}</p>
        </div>
        <div class="ci-qty">
          <button class="qty-btn" data-id="${item.id}" data-action="dec" aria-label="Decrease quantity">−</button>
          <span aria-label="Quantity">${item.qty}</span>
          <button class="qty-btn" data-id="${item.id}" data-action="inc" aria-label="Increase quantity">+</button>
        </div>
        <button class="ci-remove" data-id="${item.id}" aria-label="Remove ${item.name}">✕</button>
      `;
      list.appendChild(li);
    });

    totalEl.textContent = `$${total().toFixed(2)}`;
    updateBadge();

    // Delegated events
    list.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id  = Number(btn.dataset.id);
        const act = btn.dataset.action;
        const idx = items.findIndex(i => i.id === id);
        if (idx === -1) return;
        if (act === 'inc') items[idx].qty++;
        else if (act === 'dec') {
          items[idx].qty--;
          if (items[idx].qty <= 0) items.splice(idx, 1);
        }
        save(); render();
      });
    });
    list.querySelectorAll('.ci-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        items = items.filter(i => i.id !== Number(btn.dataset.id));
        save(); render();
      });
    });
  };

  const add = (product) => {
    const idx = items.findIndex(i => i.id === product.id);
    if (idx > -1) items[idx].qty++;
    else items.push({ ...product, qty: 1 });
    save(); render(); updateBadge();
  };

  // Cart drawer toggle
  const open  = () => {
    const d = document.getElementById('cartDrawer');
    const b = document.getElementById('cartBackdrop');
    d.hidden = false; b.hidden = false;
    d.removeAttribute('aria-hidden'); b.removeAttribute('aria-hidden');
    render();
  };
  const close = () => {
    const d = document.getElementById('cartDrawer');
    const b = document.getElementById('cartBackdrop');
    d.hidden = true; b.hidden = true;
  };

  return { add, open, close, render, updateBadge };
})();
