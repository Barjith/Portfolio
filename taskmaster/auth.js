'use strict';

// ── Theme ─────────────────────────────────────────────────────────────────────
const saved = localStorage.getItem('tm_theme') || 'dark';
document.documentElement.setAttribute('data-theme', saved);

// ── Redirect if already logged in ─────────────────────────────────────────────
if (localStorage.getItem('tm_user')) {
  window.location.href = 'index.html';
}

// ── Tab switching ─────────────────────────────────────────────────────────────
const loginTab    = document.getElementById('loginTab');
const signupTab   = document.getElementById('signupTab');
const loginPanel  = document.getElementById('loginPanel');
const signupPanel = document.getElementById('signupPanel');

loginTab.addEventListener('click', () => {
  loginTab.classList.add('active');   loginTab.setAttribute('aria-selected','true');
  signupTab.classList.remove('active'); signupTab.setAttribute('aria-selected','false');
  loginPanel.hidden  = false;
  signupPanel.hidden = true;
});

signupTab.addEventListener('click', () => {
  signupTab.classList.add('active');  signupTab.setAttribute('aria-selected','true');
  loginTab.classList.remove('active'); loginTab.setAttribute('aria-selected','false');
  signupPanel.hidden = false;
  loginPanel.hidden  = true;
});

// ── Password toggle ───────────────────────────────────────────────────────────
document.querySelectorAll('.pass-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling;
    input.type  = input.type === 'password' ? 'text' : 'password';
    btn.textContent = input.type === 'password' ? '👁️' : '🙈';
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const setErr = (id, msg) => {
  const el = document.getElementById(id);
  el.textContent = msg;
  if (msg) el.previousElementSibling?.setAttribute('aria-invalid','true');
  else     el.previousElementSibling?.removeAttribute('aria-invalid');
};
const showAlert = (id, msg, type) => {
  const el = document.getElementById(id);
  el.textContent = msg; el.className = `auth-alert ${type}`; el.hidden = false;
};

const getUsers = () => JSON.parse(localStorage.getItem('tm_users') || '[]');
const saveUsers = u => localStorage.setItem('tm_users', JSON.stringify(u));

// ── Login ─────────────────────────────────────────────────────────────────────
document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  let valid = true;

  setErr('loginEmailErr',    '');
  setErr('loginPasswordErr', '');

  if (!email)    { setErr('loginEmailErr',    'Email is required.');    valid = false; }
  if (!password) { setErr('loginPasswordErr', 'Password is required.'); valid = false; }
  if (!valid) return;

  const users = getUsers();
  const user  = users.find(u => u.email === email && u.password === password);

  if (!user) {
    showAlert('loginAlert', '❌ Invalid email or password.', 'error');
    return;
  }

  localStorage.setItem('tm_user', JSON.stringify({ name: user.name, email: user.email }));
  window.location.href = 'index.html';
});

// ── Sign up ───────────────────────────────────────────────────────────────────
document.getElementById('signupForm').addEventListener('submit', e => {
  e.preventDefault();
  const name     = document.getElementById('signupName').value.trim();
  const email    = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirm  = document.getElementById('signupConfirm').value;
  let valid = true;

  ['signupNameErr','signupEmailErr','signupPasswordErr','signupConfirmErr'].forEach(id => setErr(id,''));

  if (!name)               { setErr('signupNameErr',     'Name is required.');              valid = false; }
  if (!email)              { setErr('signupEmailErr',    'Email is required.');             valid = false; }
  if (password.length < 6) { setErr('signupPasswordErr','Minimum 6 characters.');          valid = false; }
  if (password !== confirm){ setErr('signupConfirmErr', 'Passwords do not match.');         valid = false; }
  if (!valid) return;

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    showAlert('signupAlert', '❌ An account with this email already exists.', 'error');
    return;
  }

  users.push({ name, email, password });
  saveUsers(users);

  showAlert('signupAlert', '✅ Account created! You can now log in.', 'success');
  setTimeout(() => {
    loginTab.click();
    document.getElementById('loginEmail').value = email;
  }, 1200);
});
