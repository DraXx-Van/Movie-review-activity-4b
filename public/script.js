/* ═══════════════════════════════════════════════════════════════
   CineVault — Frontend (TMDB Posters + Description)
   ═══════════════════════════════════════════════════════════════ */

const API = '/movies';

const movieGrid   = document.getElementById('movieGrid');
const emptyState  = document.getElementById('emptyState');
const btnAdd      = document.getElementById('btnAdd');
const pageTitle   = document.getElementById('pageTitle');
const pageSub     = document.getElementById('pageSub');

const navItems    = document.querySelectorAll('.nav-item');
const menuToggle  = document.getElementById('menuToggle');
const sidebar     = document.getElementById('sidebar');

const statTotal   = document.getElementById('statTotal');
const statRec     = document.getElementById('statRec');
const countAll    = document.getElementById('countAll');
const count5      = document.getElementById('count5');
const count4      = document.getElementById('count4');
const count3      = document.getElementById('count3');
const count2      = document.getElementById('count2');
const count1      = document.getElementById('count1');

const modalOverlay = document.getElementById('modalOverlay');
const modalTitle   = document.getElementById('modalTitle');
const modalClose   = document.getElementById('modalClose');
const movieForm    = document.getElementById('movieForm');
const editIdInput  = document.getElementById('editId');
const inputTitle   = document.getElementById('inputTitle');
const inputGenre   = document.getElementById('inputGenre');
const inputDesc    = document.getElementById('inputDesc');
const inputRating  = document.getElementById('inputRating');
const inputRec     = document.getElementById('inputRec');
const starSelector = document.getElementById('starSelector');
const toggleYes    = document.getElementById('toggleYes');
const toggleNo     = document.getElementById('toggleNo');
const btnSubmit    = document.getElementById('btnSubmit');

const deleteOverlay    = document.getElementById('deleteOverlay');
const deleteMovieName  = document.getElementById('deleteMovieName');
const btnCancelDelete  = document.getElementById('btnCancelDelete');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');

const toast    = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');

let activeFilter = 'all';
let pendingDeleteId = null;
let allMovies = [];

// Init
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  fetchAllAndRender();
});

// ── Data ───────────────────────────────────────────────────
async function fetchAllAndRender() {
  try {
    const res = await fetch(API);
    allMovies = await res.json();
    updateCounts();
    renderFiltered();
  } catch {
    showToast('Failed to load movies');
  }
}

function updateCounts() {
  const c = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let rec = 0;
  allMovies.forEach(m => {
    c[m.rating] = (c[m.rating] || 0) + 1;
    if (m.recommendation === 'Yes') rec++;
  });
  countAll.textContent = allMovies.length;
  count5.textContent = c[5]; count4.textContent = c[4];
  count3.textContent = c[3]; count2.textContent = c[2];
  count1.textContent = c[1];
  statTotal.textContent = allMovies.length;
  statRec.textContent = rec;
}

function renderFiltered() {
  let list = allMovies;
  if (activeFilter !== 'all') {
    list = allMovies.filter(m => m.rating === parseInt(activeFilter));
  }
  renderMovies(list);
}

// ── Render Cards ───────────────────────────────────────────
function renderMovies(movies) {
  if (!movies.length) {
    movieGrid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  movieGrid.innerHTML = movies.map((m, i) => {
    const posterHtml = m.poster
      ? `<img src="${m.poster}" alt="${esc(m.title)}" loading="lazy" />`
      : `<div class="poster-placeholder">
           <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
             <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
             <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
             <line x1="2" y1="12" x2="22" y2="12"/>
           </svg>
         </div>`;

    const descHtml = m.description
      ? `<p class="card-desc">${esc(m.description)}</p>`
      : '';

    return `
    <div class="movie-card card" style="animation-delay: ${i * 0.03}s">
      <div class="card-poster">
        ${posterHtml}
        <div class="card-rec-overlay">
          <div class="rec-badge ${m.recommendation === 'Yes' ? 'yes' : 'no'}">
            <span class="rec-dot"></span>
            ${m.recommendation === 'Yes' ? 'Yes' : 'No'}
          </div>
        </div>
      </div>
      <div class="card-info">
        <div class="movie-title">${esc(m.title)}</div>
        <div class="card-meta">
          <span class="genre-pill">${esc(m.genre)}</span>
          <span class="card-stars">${renderStars(m.rating)}</span>
        </div>
        ${descHtml}
      </div>
      <div class="card-actions">
        <button class="card-btn edit" onclick="openEditModal(${m.id}, '${escAttr(m.title)}', '${escAttr(m.genre)}', ${m.rating}, '${m.recommendation}', \`${escAttr(m.description || '')}\`)">
          <i data-lucide="pencil"></i> Edit
        </button>
        <button class="card-btn delete" onclick="openDeleteModal(${m.id}, '${escAttr(m.title)}')">
          <i data-lucide="trash-2"></i> Delete
        </button>
      </div>
    </div>`;
  }).join('');

  lucide.createIcons();
}

function renderStars(n) {
  let h = '';
  for (let i = 1; i <= 5; i++) {
    const f = i <= n;
    h += `<svg class="star-icon ${f ? 'filled' : 'empty'}" width="11" height="11" viewBox="0 0 24 24" fill="${f ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  }
  return h;
}

// ── Sidebar ────────────────────────────────────────────────
navItems.forEach(item => {
  item.addEventListener('click', () => {
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    activeFilter = item.dataset.rating;
    pageTitle.textContent = activeFilter === 'all' ? 'All Movies' : `${activeFilter} Star Movies`;
    pageSub.textContent = activeFilter === 'all' ? 'Showing all recommendations' : `Filtered by ${activeFilter}-star rating`;
    renderFiltered();
    if (window.innerWidth <= 768) sidebar.classList.remove('open');
  });
});

menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

document.addEventListener('click', (e) => {
  if (window.innerWidth <= 768 && sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});

// ── Modal ──────────────────────────────────────────────────
function openModal() {
  modalOverlay.classList.add('open');
  setTimeout(() => inputTitle.focus(), 150);
}

function closeModal() {
  modalOverlay.classList.remove('open');
  resetForm();
}

function resetForm() {
  movieForm.reset();
  editIdInput.value = '';
  inputRating.value = '0';
  inputRec.value = 'Yes';
  inputDesc.value = '';
  setStars(0);
  setToggle('Yes');
  modalTitle.textContent = 'Add Movie';
  btnSubmit.querySelector('span').textContent = 'Save Movie';
}

btnAdd.addEventListener('click', () => { resetForm(); openModal(); });
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

// Stars
const stars = starSelector.querySelectorAll('.star');
stars.forEach(s => {
  s.addEventListener('click', () => { inputRating.value = s.dataset.value; setStars(parseInt(s.dataset.value)); });
  s.addEventListener('mouseenter', () => setStars(parseInt(s.dataset.value)));
});
starSelector.addEventListener('mouseleave', () => setStars(parseInt(inputRating.value)));
function setStars(v) { stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.value) <= v)); }

// Toggle
toggleYes.addEventListener('click', () => setToggle('Yes'));
toggleNo.addEventListener('click', () => setToggle('No'));
function setToggle(v) {
  inputRec.value = v;
  toggleYes.classList.toggle('active', v === 'Yes');
  toggleNo.classList.toggle('active', v === 'No');
}

// ── Submit ─────────────────────────────────────────────────
movieForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = inputTitle.value.trim();
  const genre = inputGenre.value.trim();
  const rating = parseInt(inputRating.value);
  const recommendation = inputRec.value;
  const description = inputDesc.value.trim();

  if (!title || !genre) return showToast('Title and Genre required');
  if (rating < 1 || rating > 5) return showToast('Select a rating');

  const body = { title, genre, rating, recommendation, description };
  const editId = editIdInput.value;

  try {
    if (editId) {
      await fetch(`${API}/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      showToast('Movie updated');
    } else {
      await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      showToast('Movie added');
    }
    closeModal();
    fetchAllAndRender();
  } catch {
    showToast('Something went wrong');
  }
});

// ── Edit ───────────────────────────────────────────────────
function openEditModal(id, title, genre, rating, rec, desc) {
  editIdInput.value = id;
  inputTitle.value = title;
  inputGenre.value = genre;
  inputRating.value = rating;
  inputRec.value = rec;
  inputDesc.value = desc || '';
  setStars(rating);
  setToggle(rec);
  modalTitle.textContent = 'Edit Movie';
  btnSubmit.querySelector('span').textContent = 'Update Movie';
  openModal();
}

// ── Delete ─────────────────────────────────────────────────
function openDeleteModal(id, title) {
  pendingDeleteId = id;
  deleteMovieName.textContent = title;
  deleteOverlay.classList.add('open');
}

function closeDeleteModal() {
  deleteOverlay.classList.remove('open');
  pendingDeleteId = null;
}

btnCancelDelete.addEventListener('click', closeDeleteModal);
deleteOverlay.addEventListener('click', (e) => { if (e.target === deleteOverlay) closeDeleteModal(); });

btnConfirmDelete.addEventListener('click', async () => {
  if (!pendingDeleteId) return;
  try {
    await fetch(`${API}/${pendingDeleteId}`, { method: 'DELETE' });
    showToast('Movie deleted');
    closeDeleteModal();
    fetchAllAndRender();
  } catch { showToast('Failed to delete'); }
});

// ── Toast ──────────────────────────────────────────────────
function showToast(msg) {
  toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ── Helpers ────────────────────────────────────────────────
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function escAttr(s) { return (s || '').replace(/`/g, '\\`').replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); closeDeleteModal(); } });
