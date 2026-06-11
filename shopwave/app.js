'use strict';

// ── Theme ─────────────────────────────────────────────────────────────────────
const html = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
const savedTheme = localStorage.getItem('sw_theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
themeBtn.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
themeBtn.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('sw_theme', next);
  themeBtn.textContent = next === 'dark' ? '🌙' : '☀️';
});

// ── Cart events ───────────────────────────────────────────────────────────────
document.getElementById('cartBtn').addEventListener('click', Cart.open);
document.getElementById('cartClose').addEventListener('click', Cart.close);
document.getElementById('cartBackdrop').addEventListener('click', Cart.close);
document.getElementById('checkoutBtn')?.addEventListener('click', () => {
  Cart.close(); showToast('✅ Order placed! Thank you for shopping with ShopWave.');
  localStorage.removeItem('sw_cart');
  Cart.render(); Cart.updateBadge();
});

// ── Toast ─────────────────────────────────────────────────────────────────────
const showToast = (msg) => {
  const t = document.getElementById('toast');
  t.textContent = msg; t.hidden = false;
  setTimeout(() => { t.hidden = true; }, 3000);
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const app = document.getElementById('app');
const render = html => { app.innerHTML = html; };

const stars = (r) => {
  const full = Math.floor(r), half = r % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half?1:0));
};

const productCard = (p) => `
  <article class="product-card" role="listitem" aria-label="${p.name}">
    ${p.badge ? `<span class="product-badge badge-${p.badge.toLowerCase().replace(' ','-')}">${p.badge}</span>` : ''}
    <div class="product-emoji" aria-hidden="true">${p.emoji}</div>
    <div class="product-body">
      <span class="product-cat">${p.category}</span>
      <h3 class="product-name">${p.name}</h3>
      <p class="product-desc">${p.desc}</p>
      <div class="product-rating" aria-label="Rating: ${p.rating} out of 5">
        <span class="stars">${stars(p.rating)}</span>
        <span class="rating-num">${p.rating} (${p.reviews})</span>
      </div>
    </div>
    <div class="product-footer">
      <span class="product-price">$${p.price.toFixed(2)}</span>
      <button class="btn-add" data-id="${p.id}" aria-label="Add ${p.name} to cart">Add to Cart</button>
    </div>
  </article>
`;

const attachAddToCart = () => {
  document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = PRODUCTS.find(p => p.id === Number(btn.dataset.id));
      if (product) { Cart.add(product); showToast(`🛒 "${product.name}" added to cart!`); }
    });
  });
};

// ── Pages ─────────────────────────────────────────────────────────────────────

// HOME
const homePage = () => {
  const featured = PRODUCTS.filter(p => p.badge === 'Best Seller').slice(0, 4);
  render(`
    <section class="hero-section" aria-labelledby="hero-heading">
      <div class="container">
        <div class="hero-content">
          <span class="hero-tag">✨ New arrivals every week</span>
          <h1 id="hero-heading">Discover <span class="gradient-text">Amazing</span> Products</h1>
          <p>Shop curated electronics, fashion, home goods, books and more — all in one place.</p>
          <div class="hero-cta">
            <a href="#/shop" class="btn-primary">Shop Now →</a>
            <a href="#/about" class="btn-outline">Learn More</a>
          </div>
        </div>
        <div class="hero-visual" aria-hidden="true">
          <div class="emoji-grid">
            ${PRODUCTS.slice(0,9).map(p=>`<span>${p.emoji}</span>`).join('')}
          </div>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="cats-heading">
      <div class="container">
        <h2 id="cats-heading" class="section-title"><span class="section-label">Browse by</span>Categories</h2>
        <div class="cat-grid">
          ${['Electronics','Fashion','Home','Books','Sports'].map(c => `
            <a href="#/shop?cat=${c}" class="cat-card" aria-label="Browse ${c}">
              <span class="cat-emoji">${{Electronics:'💻',Fashion:'👗',Home:'🏠',Books:'📚',Sports:'⚽'}[c]}</span>
              <span>${c}</span>
            </a>
          `).join('')}
        </div>
      </div>
    </section>

    <section class="section bg-alt" aria-labelledby="featured-heading">
      <div class="container">
        <h2 id="featured-heading" class="section-title"><span class="section-label">Hand-picked</span>Best Sellers</h2>
        <div class="product-grid" role="list">${featured.map(productCard).join('')}</div>
        <div style="text-align:center;margin-top:2rem">
          <a href="#/shop" class="btn-outline">View All Products →</a>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="features-heading">
      <div class="container">
        <h2 id="features-heading" class="section-title"><span class="section-label">Why us</span>Why ShopWave?</h2>
        <div class="features-grid">
          <div class="feature-card"><span aria-hidden="true">🚚</span><h3>Free Shipping</h3><p>On all orders over $50</p></div>
          <div class="feature-card"><span aria-hidden="true">🔒</span><h3>Secure Payment</h3><p>SSL encrypted checkout</p></div>
          <div class="feature-card"><span aria-hidden="true">↩️</span><h3>Easy Returns</h3><p>30-day hassle-free returns</p></div>
          <div class="feature-card"><span aria-hidden="true">💬</span><h3>24/7 Support</h3><p>Always here to help</p></div>
        </div>
      </div>
    </section>
  `);
  attachAddToCart();
};

// SHOP
let shopState = { search: '', category: 'All', sort: 'default', page: 1 };
const PER_PAGE = 8;

const shopPage = (path) => {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  if (params.get('cat')) shopState.category = params.get('cat');

  const filtered = () => {
    let list = [...PRODUCTS];
    if (shopState.category !== 'All') list = list.filter(p => p.category === shopState.category);
    if (shopState.search) list = list.filter(p => p.name.toLowerCase().includes(shopState.search.toLowerCase()));
    if (shopState.sort === 'price-asc')  list.sort((a,b) => a.price - b.price);
    if (shopState.sort === 'price-desc') list.sort((a,b) => b.price - a.price);
    if (shopState.sort === 'rating')     list.sort((a,b) => b.rating - a.rating);
    return list;
  };

  render(`
    <div class="shop-layout container">
      <aside class="shop-sidebar" aria-label="Filters">
        <h2>Filters</h2>
        <div class="filter-section">
          <h3>Category</h3>
          <ul role="list" class="cat-filter-list">
            ${CATEGORIES.map(c => `
              <li>
                <button class="cat-filter-btn${shopState.category===c?' active':''}" data-cat="${c}">
                  ${c} <span class="cat-count">${c==='All'?PRODUCTS.length:PRODUCTS.filter(p=>p.category===c).length}</span>
                </button>
              </li>
            `).join('')}
          </ul>
        </div>
      </aside>

      <div class="shop-main">
        <div class="shop-toolbar">
          <div class="search-wrap">
            <span aria-hidden="true">🔍</span>
            <input type="search" id="shopSearch" placeholder="Search products..." value="${shopState.search}" aria-label="Search products" />
          </div>
          <select id="shopSort" aria-label="Sort products">
            <option value="default">Default</option>
            <option value="price-asc"  ${shopState.sort==='price-asc'?'selected':''}>Price: Low to High</option>
            <option value="price-desc" ${shopState.sort==='price-desc'?'selected':''}>Price: High to Low</option>
            <option value="rating"     ${shopState.sort==='rating'?'selected':''}>Top Rated</option>
          </select>
        </div>

        <p class="results-count" aria-live="polite" id="resultsCount"></p>

        <div class="product-grid" id="productGrid" role="list"></div>
        <div class="empty-products" id="emptyProducts" hidden>
          <span aria-hidden="true">🔍</span><p>No products found. Try a different search.</p>
        </div>
        <div class="pagination" id="pagination" role="navigation" aria-label="Product pages"></div>
      </div>
    </div>
  `);

  const renderProducts = () => {
    const list  = filtered();
    const start = (shopState.page - 1) * PER_PAGE;
    const page  = list.slice(start, start + PER_PAGE);
    const grid  = document.getElementById('productGrid');
    const empty = document.getElementById('emptyProducts');
    const count = document.getElementById('resultsCount');
    const pag   = document.getElementById('pagination');

    count.textContent = `${list.length} product${list.length !== 1 ? 's' : ''} found`;
    grid.innerHTML = '';
    empty.hidden = page.length > 0;
    grid.innerHTML = page.map(productCard).join('');
    attachAddToCart();

    // Pagination
    const pages = Math.ceil(list.length / PER_PAGE);
    pag.innerHTML = '';
    if (pages > 1) {
      for (let i = 1; i <= pages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `page-btn${i === shopState.page ? ' active' : ''}`;
        btn.setAttribute('aria-label', `Page ${i}`);
        if (i === shopState.page) btn.setAttribute('aria-current', 'page');
        btn.addEventListener('click', () => { shopState.page = i; renderProducts(); window.scrollTo(0,0); });
        pag.appendChild(btn);
      }
    }
  };

  renderProducts();

  // Filter buttons
  document.querySelectorAll('.cat-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      shopState.category = btn.dataset.cat;
      shopState.page = 1;
      renderProducts();
      document.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === shopState.category));
    });
  });

  // Search
  let searchTimer;
  document.getElementById('shopSearch').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { shopState.search = e.target.value; shopState.page = 1; renderProducts(); }, 300);
  });

  // Sort
  document.getElementById('shopSort').addEventListener('change', e => {
    shopState.sort = e.target.value; shopState.page = 1; renderProducts();
  });
};

// ABOUT
const aboutPage = () => render(`
  <div class="container" style="max-width:700px;padding:4rem 1.5rem">
    <span class="section-label">Our story</span>
    <h1 style="font-size:clamp(1.8rem,4vw,2.8rem);font-weight:900;margin:0.5rem 0 1.5rem;">About ShopWave</h1>
    <p style="color:var(--muted);line-height:1.9;margin-bottom:1.25rem;">ShopWave is a capstone e-commerce project built to demonstrate professional-grade full-stack web development — client-side routing, modular architecture, cart state management, local persistence, and responsive design.</p>
    <p style="color:var(--muted);line-height:1.9;margin-bottom:2rem;">Built with vanilla HTML5, CSS3, and JavaScript — no frameworks, no dependencies. Deployable to Vercel, Netlify, or any static host.</p>
    <div class="features-grid">
      <div class="feature-card"><span>⚡</span><h3>Fast</h3><p>Zero dependencies, instant load</p></div>
      <div class="feature-card"><span>📱</span><h3>Responsive</h3><p>Works on any screen size</p></div>
      <div class="feature-card"><span>♿</span><h3>Accessible</h3><p>ARIA labels, keyboard nav</p></div>
      <div class="feature-card"><span>🌙</span><h3>Dark Mode</h3><p>Eye-friendly dark/light theme</p></div>
    </div>
    <div style="margin-top:2rem">
      <a href="#/shop" class="btn-primary">Start Shopping →</a>
    </div>
  </div>
`);

// ── Router setup ──────────────────────────────────────────────────────────────
Router.on('/',      homePage);
Router.on('/shop',  shopPage);
Router.on('/about', aboutPage);
Router.notFound(homePage);
Router.init();
Cart.updateBadge();
