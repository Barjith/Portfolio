// ── Year ──────────────────────────────────────────────────────────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Theme toggle ──────────────────────────────────────────────────────────────
const html         = document.documentElement;
const themeToggle  = document.getElementById('themeToggle');
const savedTheme   = localStorage.getItem('theme') || 'dark';

html.setAttribute('data-theme', savedTheme);
if (themeToggle) themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

themeToggle?.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
});

// ── Mobile menu ───────────────────────────────────────────────────────────────
const menuToggle = document.getElementById('menuToggle');
const navList    = document.getElementById('navList');

menuToggle?.addEventListener('click', () => {
  const isOpen = navList.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', isOpen);
  menuToggle.textContent = isOpen ? '✕' : '☰';
});

// ── Contact form validation ───────────────────────────────────────────────────
const form = document.getElementById('contactForm');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  ['name', 'email', 'subject', 'message'].forEach((field) => {
    const input = document.getElementById(field);
    if (!input) return;
    const error = document.getElementById(`${field}-error`);
    if (!input.value.trim()) {
      error.textContent = `This field is required.`;
      input.setAttribute('aria-invalid', 'true');
      valid = false;
    } else {
      error.textContent = '';
      input.removeAttribute('aria-invalid');
    }
  });

  if (valid) {
    form.hidden = true;
    document.getElementById('form-success').hidden = false;
  }
});
