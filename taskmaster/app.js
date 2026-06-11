'use strict';

// ── Auth guard ────────────────────────────────────────────────────────────────
const currentUser = JSON.parse(localStorage.getItem('tm_user') || 'null');
if (!currentUser) window.location.href = 'login.html';

// ── State ─────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'taskmaster_tasks';
let tasks  = load();
let filter = 'all';
let editId = null;

// ── Persistence ───────────────────────────────────────────────────────────────
function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }

// ── DOM refs ──────────────────────────────────────────────────────────────────
const taskList     = document.getElementById('taskList');
const emptyState   = document.getElementById('emptyState');
const taskInput    = document.getElementById('taskInput');
const taskNote     = document.getElementById('taskNote');
const taskPriority = document.getElementById('taskPriority');
const taskCategory = document.getElementById('taskCategory');
const taskDue      = document.getElementById('taskDue');
const submitBtn    = document.getElementById('submitBtn');
const searchInput  = document.getElementById('searchInput');
const sortSelect   = document.getElementById('sortSelect');
const modalBackdrop= document.getElementById('modalBackdrop');
const editInput    = document.getElementById('editInput');
const editNote     = document.getElementById('editNote');
const editPriority = document.getElementById('editPriority');
const editCategory = document.getElementById('editCategory');
const editDue      = document.getElementById('editDue');

// ── Theme ─────────────────────────────────────────────────────────────────────
const html     = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
const savedTheme = localStorage.getItem('tm_theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
themeBtn.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

themeBtn.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('tm_theme', next);
  themeBtn.textContent = next === 'dark' ? '🌙' : '☀️';
});

// ── User greeting & logout ────────────────────────────────────────────────────
const greetingEl = document.getElementById('userGreeting');
if (greetingEl && currentUser) greetingEl.textContent = `👋 ${currentUser.name.split(' ')[0]}`;

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('tm_user');
  window.location.href = 'login.html';
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid  = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const esc  = s  => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt  = d  => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '';
const isOverdue = d => d && new Date(d) < new Date(new Date().toDateString());

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
  const q = searchInput.value.trim().toLowerCase();

  let visible = tasks.filter(t => {
    if (filter === 'active'   && t.done)  return false;
    if (filter === 'completed'&& !t.done) return false;
    if (q && !t.title.toLowerCase().includes(q) && !(t.note||'').toLowerCase().includes(q)) return false;
    return true;
  });

  const sort = sortSelect.value;
  visible.sort((a, b) => {
    if (sort === 'oldest')   return a.createdAt - b.createdAt;
    if (sort === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (sort === 'due') {
      if (!a.due && !b.due) return 0;
      if (!a.due) return 1;
      if (!b.due) return -1;
      return new Date(a.due) - new Date(b.due);
    }
    return b.createdAt - a.createdAt; // newest
  });

  taskList.innerHTML = '';
  emptyState.hidden  = visible.length > 0;

  visible.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item${task.done ? ' done' : ''}`;
    li.setAttribute('data-priority', task.priority);
    li.setAttribute('data-id', task.id);
    li.setAttribute('role', 'listitem');

    const overdue = !task.done && isOverdue(task.due);

    li.innerHTML = `
      <input type="checkbox" class="task-check" ${task.done ? 'checked' : ''}
        aria-label="Mark '${esc(task.title)}' as ${task.done ? 'incomplete' : 'complete'}" />
      <div class="task-body">
        <span class="task-title">${esc(task.title)}</span>
        ${task.note ? `<span class="task-note">${esc(task.note)}</span>` : ''}
        <div class="task-chips">
          <span class="chip chip-priority-${task.priority}">${task.priority}</span>
          <span class="chip chip-cat">${esc(task.category)}</span>
          ${task.due ? `<span class="chip chip-due${overdue?' overdue':''}">${overdue?'⚠️ ':''}${fmt(task.due)}</span>` : ''}
        </div>
      </div>
      <div class="task-actions">
        <button class="act-btn edit"   aria-label="Edit task '${esc(task.title)}'">✏️</button>
        <button class="act-btn delete" aria-label="Delete task '${esc(task.title)}'">🗑️</button>
      </div>
    `;

    // Toggle done
    li.querySelector('.task-check').addEventListener('change', () => {
      task.done = !task.done;
      persist(); render();
    });

    // Edit
    li.querySelector('.act-btn.edit').addEventListener('click', () => openEdit(task.id));

    // Delete with animation
    li.querySelector('.act-btn.delete').addEventListener('click', () => {
      li.style.transition = 'all .25s ease';
      li.style.transform  = 'translateX(30px)';
      li.style.opacity    = '0';
      setTimeout(() => {
        tasks = tasks.filter(t => t.id !== task.id);
        persist(); render();
      }, 240);
    });

    taskList.appendChild(li);
  });

  // Stats always reflect full task list
  document.getElementById('statTotal').textContent  = tasks.length;
  document.getElementById('statActive').textContent = tasks.filter(t => !t.done).length;
  document.getElementById('statDone').textContent   = tasks.filter(t =>  t.done).length;
}

// ── Create ────────────────────────────────────────────────────────────────────
document.getElementById('taskForm').addEventListener('submit', e => {
  e.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;

  tasks.unshift({
    id:        uid(),
    title,
    note:      taskNote.value.trim(),
    priority:  taskPriority.value,
    category:  taskCategory.value,
    due:       taskDue.value || null,
    done:      false,
    createdAt: Date.now(),
  });

  taskInput.value    = '';
  taskNote.value     = '';
  taskPriority.value = 'medium';
  taskCategory.value = 'general';
  taskDue.value      = '';
  taskInput.focus();
  persist(); render();
});

// ── Filter ────────────────────────────────────────────────────────────────────
document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

document.getElementById('clearDone').addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done);
  persist(); render();
});

searchInput.addEventListener('input', render);
sortSelect.addEventListener('change', render);

// ── Edit modal ────────────────────────────────────────────────────────────────
function openEdit(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editId             = id;
  editInput.value    = task.title;
  editNote.value     = task.note || '';
  editPriority.value = task.priority;
  editCategory.value = task.category;
  editDue.value      = task.due || '';
  modalBackdrop.hidden = false;
  editInput.focus();
}

function closeModal() {
  modalBackdrop.hidden = true;
  editId = null;
}

document.getElementById('editForm').addEventListener('submit', e => {
  e.preventDefault();
  const task = tasks.find(t => t.id === editId);
  if (!task) return;
  task.title    = editInput.value.trim() || task.title;
  task.note     = editNote.value.trim();
  task.priority = editPriority.value;
  task.category = editCategory.value;
  task.due      = editDue.value || null;
  persist(); render(); closeModal();
});

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalCancel').addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', e => { if (e.target === modalBackdrop) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── Init ──────────────────────────────────────────────────────────────────────
render();
