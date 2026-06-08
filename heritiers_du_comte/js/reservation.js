/* =========================================
   LES HÉRITIERS DU COMTE — reservation.js
   ========================================= */

'use strict';

/* ── DATES DISPONIBLES ── */
const MAX_GUESTS = 14;

const DATES = [
  { date: '2025-09-20', label: 'Sam 20 Sep', day: '20', month: 'SEP' },
  { date: '2025-10-04', label: 'Sam 4 Oct',  day: '04', month: 'OCT' },
  { date: '2025-10-18', label: 'Sam 18 Oct', day: '18', month: 'OCT' },
  { date: '2025-11-01', label: 'Sam 1 Nov',  day: '01', month: 'NOV' },
  { date: '2025-11-15', label: 'Sam 15 Nov', day: '15', month: 'NOV' },
  { date: '2025-12-06', label: 'Sam 6 Déc',  day: '06', month: 'DÉC' },
  { date: '2025-12-20', label: 'Sam 20 Déc', day: '20', month: 'DÉC' },
  { date: '2026-01-10', label: 'Sam 10 Jan', day: '10', month: 'JAN' },
  { date: '2026-02-07', label: 'Sam 7 Fév',  day: '07', month: 'FÉV' },
];

const FORMULES = {
  standard: { name: 'Standard', price: 289 },
  prestige: { name: 'Prestige', price: 339 },
  immersif: { name: 'Immersif', price: 399 },
};

/* ── ÉTAT ── */
let selectedDate   = null;
let selectedFormule = 'standard';
let guestCount     = 4;

/* ── DOM ── */
const form        = document.getElementById('booking-form');
const successBox  = document.getElementById('booking-success');
const recapDate   = document.getElementById('recap-date');
const recapForm   = document.getElementById('recap-formule');
const recapGuests = document.getElementById('recap-guests');
const recapTotal  = document.getElementById('recap-total');
const formTotal   = document.getElementById('form-total-value');
const guestInput  = document.getElementById('guests');

/* ── API ── */
const API = window.location.protocol !== 'file:' ? window.location.origin : null;

function localFallback(payload) {
  /* Réservation enregistrée localement si le serveur est absent */
  const saved = { ...payload, id: 'RES-LOCAL-' + Date.now(), createdAt: new Date().toISOString(), status: 'pending' };
  try {
    const existing = JSON.parse(localStorage.getItem('hdlc_reservations') || '[]');
    existing.push(saved);
    localStorage.setItem('hdlc_reservations', JSON.stringify(existing));
  } catch { /* localStorage indisponible, on continue quand même */ }
  return saved;
}

async function fetchDispo() {
  if (!API) return {};
  try {
    const r = await fetch(`${API}/api/disponibilites`, { signal: AbortSignal.timeout(3000) });
    if (!r.ok) return {};
    const text = await r.text();
    if (!text) return {};
    const data = JSON.parse(text);
    const map = {};
    (data.dates || []).forEach(d => { map[d.date] = d.placesRestantes; });
    return map;
  } catch { return {}; }
}

async function postReservation(payload) {
  if (!API) return localFallback(payload);
  try {
    const r = await fetch(`${API}/api/reservations`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const text = await r.text();
    if (!text) throw new Error('Réponse vide du serveur');
    const data = JSON.parse(text);
    if (!r.ok) throw new Error(data.error || `Erreur serveur (${r.status})`);
    return data.reservation;
  } catch (e) {
    /* Serveur lancé mais inaccessible → fallback local silencieux */
    if (e.message.includes('fetch') || e.message.includes('Failed') || e.message.includes('vide')) {
      console.warn('Serveur inaccessible, enregistrement local :', e.message);
      return localFallback(payload);
    }
    throw e; /* Erreur métier (capacité dépassée, etc.) → on la remonte */
  }
}

/* ── AFFICHAGE DES DATES ── */
async function renderDates() {
  const wrap = document.getElementById('date-slots');
  if (!wrap) return;

  /* Récupération des dispo (silencieuse si pas de serveur) */
  const dispo = await fetchDispo();

  wrap.innerHTML = DATES.map(d => {
    const remaining  = (d.date in dispo) ? dispo[d.date] : MAX_GUESTS;
    const unavailable = remaining <= 0;
    return `
      <button
        type="button"
        class="date-slot${unavailable ? ' unavailable' : ''}"
        data-date="${d.date}"
        ${unavailable ? 'disabled' : ''}
        aria-label="${d.label}${unavailable ? ' — complet' : `, ${remaining} places restantes`}"
      >
        <span class="date-slot-date">${d.day} ${d.month}</span>
        <span class="date-slot-places">${unavailable ? 'Complet' : remaining + ' places'}</span>
      </button>
    `;
  }).join('');

  wrap.querySelectorAll('.date-slot:not(.unavailable)').forEach(slot => {
    slot.addEventListener('click', () => {
      wrap.querySelectorAll('.date-slot').forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      selectedDate = slot.dataset.date;
      const d = DATES.find(x => x.date === selectedDate);
      if (recapDate) recapDate.textContent = d ? d.label : '—';
      updateTotal();
    });
  });
}

/* ── TOTAL ── */
function updateTotal() {
  const formule = FORMULES[selectedFormule] || FORMULES.standard;
  const total   = formule.price * guestCount;
  const txt     = total.toLocaleString('fr-FR') + ' €';
  if (formTotal)   formTotal.textContent  = txt;
  if (recapTotal)  recapTotal.textContent = txt;
  if (recapForm)   recapForm.textContent  = `Formule ${formule.name}`;
  if (recapGuests) recapGuests.textContent = `${guestCount} héritier${guestCount > 1 ? 's' : ''}`;
}

/* ── FORMULES ── */
function initFormuleCards() {
  document.querySelectorAll('.formule-card input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      selectedFormule = radio.value;
      document.querySelectorAll('.formule-card-check').forEach(c => c.textContent = '');
      radio.closest('.formule-card').querySelector('.formule-card-check').textContent = '✦';
      updateTotal();
    });
  });
  const first = document.querySelector('.formule-card input[type="radio"]:checked');
  if (first) first.closest('.formule-card').querySelector('.formule-card-check').textContent = '✦';
}

/* ── COMPTEUR JOUEURS ── */
function initGuestCounter() {
  const minus   = document.getElementById('guests-minus');
  const plus    = document.getElementById('guests-plus');
  const display = document.getElementById('guests-display');

  function refresh() {
    if (display)    display.textContent = guestCount;
    if (guestInput) guestInput.value    = guestCount;
    if (minus) minus.disabled = guestCount <= 4;
    if (plus)  plus.disabled  = guestCount >= 14;
    updateTotal();
  }

  if (minus) minus.addEventListener('click', () => { if (guestCount > 4)  { guestCount--; refresh(); } });
  if (plus)  plus.addEventListener('click',  () => { if (guestCount < 14) { guestCount++; refresh(); } });
  refresh();
}

/* ── SOUMISSION ── */
function initForm() {
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    if (!selectedDate) {
      showToast('Date manquante', 'Veuillez sélectionner une date de soirée.');
      return;
    }

    const fd = new FormData(form);
    if (!fd.get('prenom') || !fd.get('nom') || !fd.get('email')) {
      showToast('Champs manquants', 'Prénom, nom et email sont obligatoires.');
      return;
    }

    const payload = {
      date:      selectedDate,
      formule:   selectedFormule,
      guests:    guestCount,
      total:     (FORMULES[selectedFormule]?.price || 289) * guestCount,
      prenom:    fd.get('prenom')    || '',
      nom:       fd.get('nom')       || '',
      email:     fd.get('email')     || '',
      telephone: fd.get('telephone') || '',
      message:   fd.get('message')   || '',
    };

    const submitBtn = form.querySelector('.btn-submit');
    const loadingEl = form.querySelector('.form-loading');
    if (submitBtn) submitBtn.style.display = 'none';
    if (loadingEl) loadingEl.classList.add('active');

    try {
      const saved = await postReservation(payload);

      form.style.display = 'none';
      if (successBox) {
        successBox.classList.add('visible');
        const idEl    = successBox.querySelector('#success-id');
        const emailEl = successBox.querySelector('#success-email');
        if (idEl)    idEl.textContent    = saved.id;
        if (emailEl) emailEl.textContent = saved.email;
      }

      renderDates(); /* sans await — rafraîchit en fond */

    } catch (err) {
      showToast('Erreur', err.message || 'Une erreur est survenue. Veuillez réessayer.');
      if (submitBtn) submitBtn.style.display = '';
      if (loadingEl) loadingEl.classList.remove('active');
    }
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  /* Tout synchrone sauf renderDates qui charge les dispo en fond */
  initFormuleCards();
  initGuestCounter();
  initForm();
  updateTotal();
  renderDates(); /* async, n'bloque pas le reste */
});
