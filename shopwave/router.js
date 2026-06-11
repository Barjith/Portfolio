// ── Client-side hash router ───────────────────────────────────────────────────
const Router = (() => {
  const routes = {};

  const resolve = () => {
    const hash = window.location.hash || '#/';
    const path = hash.replace('#', '').split('?')[0];
    const handler = routes[path] || routes['*'];
    if (handler) handler(path);

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(a => {
      const route = a.dataset.route;
      const active =
        (route === 'home' && (path === '/' || path === '')) ||
        (path.startsWith('/' + route) && route !== 'home');
      a.classList.toggle('active', active);
    });

    // Scroll to top & focus main
    window.scrollTo(0, 0);
    document.getElementById('app')?.focus();
  };

  return {
    on: (path, fn) => { routes[path] = fn; },
    notFound: (fn) => { routes['*'] = fn; },
    init: () => {
      window.addEventListener('hashchange', resolve);
      resolve();
    },
    go: (path) => { window.location.hash = '#' + path; },
  };
})();
