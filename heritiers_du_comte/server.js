/**
 * LES HÉRITIERS DU COMTE — server.js
 * Mini serveur Node.js (zéro dépendance)
 *
 * Lancement : node server.js
 * Accès     : http://localhost:3000
 *
 * Routes API :
 *   GET  /api/reservations      → liste toutes les réservations
 *   POST /api/reservations      → enregistre une nouvelle réservation
 *   GET  /api/disponibilites    → places restantes par date
 */

'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT    = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');
const PUBLIC  = __dirname;
const MAX_GUESTS = 14;

/* ── db.json ── */
function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { return { reservations: [] }; }
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

/* ── ID unique ── */
function generateId() {
  return 'RES-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

/* ── Lecture du body complet avant tout traitement ── */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data',  chunk => chunks.push(chunk));
    req.on('end',   ()    => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(new Error('JSON invalide : ' + e.message));
      }
    });
    req.on('error', reject);
  });
}

/* ── Réponse JSON avec headers CORS ── */
function sendJSON(res, status, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    'Content-Type':                'application/json; charset=utf-8',
    'Content-Length':              Buffer.byteLength(body),
    'Cache-Control':               'no-store',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(body);
}

/* ── Fichiers statiques ── */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
  '.svg':  'image/svg+xml',
  '.woff2':'font/woff2',
};

function serveFile(res, filePath) {
  try {
    const data = fs.readFileSync(filePath);
    const ext  = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 — Fichier introuvable');
  }
}

/* ════════════════════════════════
   ROUTEUR PRINCIPAL
════════════════════════════════ */
const server = http.createServer(async (req, res) => {
  const method = req.method.toUpperCase();
  const route  = new URL(req.url, `http://localhost`).pathname;

  /* CORS preflight */
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  /* ── /api/reservations ── */
  if (route === '/api/reservations') {

    /* GET → liste */
    if (method === 'GET') {
      const db = readDB();
      return sendJSON(res, 200, { count: db.reservations.length, reservations: db.reservations });
    }

    /* POST → création */
    if (method === 'POST') {
      let body;
      try {
        body = await readBody(req);
      } catch (e) {
        return sendJSON(res, 400, { error: e.message });
      }

      /* Validation */
      const required = ['date', 'formule', 'guests', 'prenom', 'nom', 'email'];
      const missing  = required.filter(k => !body[k]);
      if (missing.length) {
        return sendJSON(res, 422, { error: 'Champs manquants', missing });
      }

      /* Capacité */
      const db     = readDB();
      const booked = db.reservations
        .filter(r => r.date === body.date)
        .reduce((sum, r) => sum + (parseInt(r.guests) || 0), 0);
      const guests = parseInt(body.guests) || 0;

      if (booked + guests > MAX_GUESTS) {
        return sendJSON(res, 409, {
          error: 'Capacité dépassée',
          placesRestantes: MAX_GUESTS - booked,
        });
      }

      /* Enregistrement */
      const reservation = {
        id:        generateId(),
        createdAt: new Date().toISOString(),
        status:    'pending',
        date:      body.date,
        formule:   body.formule,
        guests,
        total:     body.total || 0,
        prenom:    String(body.prenom).trim(),
        nom:       String(body.nom).trim(),
        email:     String(body.email).trim().toLowerCase(),
        telephone: String(body.telephone || '').trim(),
        message:   String(body.message   || '').trim(),
      };

      db.reservations.push(reservation);
      writeDB(db);

      console.log(`[${new Date().toLocaleTimeString('fr-FR')}] ✦ ${reservation.id} — ${reservation.prenom} ${reservation.nom} — ${reservation.date} — ${guests} héritiers`);

      return sendJSON(res, 201, { success: true, reservation });
    }

    /* Méthode non supportée */
    return sendJSON(res, 405, { error: 'Méthode non supportée' });
  }

  /* ── /api/disponibilites ── */
  if (route === '/api/disponibilites' && method === 'GET') {
    const db     = readDB();
    const byDate = {};
    db.reservations.forEach(r => {
      byDate[r.date] = (byDate[r.date] || 0) + (parseInt(r.guests) || 0);
    });
    const dates = Object.entries(byDate).map(([date, booked]) => ({
      date,
      booked,
      placesRestantes: Math.max(0, MAX_GUESTS - booked),
      complet: booked >= MAX_GUESTS,
    }));
    return sendJSON(res, 200, { maxParDate: MAX_GUESTS, dates });
  }

  /* ── Fichiers statiques ── */
  let filePath = path.join(PUBLIC, route === '/' ? 'index.html' : route);

  /* Sécurité : pas de traversée de dossier */
  if (!filePath.startsWith(PUBLIC)) {
    res.writeHead(403);
    return res.end('Accès refusé');
  }

  /* Dossier → index.html */
  try {
    if (fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
  } catch { /* le fichier n'existe pas, serveFile renverra 404 */ }

  serveFile(res, filePath);
});

/* ── Démarrage ── */
if (!fs.existsSync(DB_FILE)) {
  writeDB({ reservations: [] });
  console.log('📁  db.json créé.');
}

server.listen(PORT, () => {
  console.log('');
  console.log('🏰  Château de Montfaucon — Serveur démarré');
  console.log(`    Site     → http://localhost:${PORT}`);
  console.log(`    Réservations → http://localhost:${PORT}/api/reservations`);
  console.log(`    Disponibilités → http://localhost:${PORT}/api/disponibilites`);
  console.log('');
});
