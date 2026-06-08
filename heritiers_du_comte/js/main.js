/* =========================================
   LES HÉRITIERS DU COMTE — main.js
   Shared logic: nav, particles, scroll reveals
   ========================================= */

'use strict';

/* ── NAV ── */
(function initNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  // Scroll state
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastY = y;
  }, { passive: true });

  // Mobile toggle
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      const isOpen = links.classList.contains('open');
      toggle.setAttribute('aria-expanded', isOpen);
    });
    // Close on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
    // Close on outside click
    document.addEventListener('click', e => {
      if (!nav.contains(e.target)) links.classList.remove('open');
    });
  }

  // Active page highlight
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.setAttribute('aria-current', 'page');
    }
  });
})();

/* ── SCROLL REVEAL ── */
(function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.add('visible');
      // Stagger children if present
      target.querySelectorAll('[data-delay]').forEach(child => {
        child.style.transitionDelay = child.dataset.delay;
      });
      io.unobserve(target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
})();

/* ── HERO PARTICLE CANVAS ── */
(function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function Particle() {
    this.reset = function () {
      this.x = Math.random() * W;
      this.y = H + 10;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedY = -(Math.random() * 0.4 + 0.1);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = 0;
      this.maxOpacity = Math.random() * 0.4 + 0.1;
      this.life = 0;
      this.maxLife = Math.random() * 400 + 200;
    };
    this.reset();
    this.life = Math.random() * this.maxLife; // stagger start
  }

  // Create particles
  for (let i = 0; i < 60; i++) particles.push(new Particle());

  let raf;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.life++;
      p.x += p.speedX;
      p.y += p.speedY;

      // Fade in/out
      if (p.life < 60) {
        p.opacity = (p.life / 60) * p.maxOpacity;
      } else if (p.life > p.maxLife - 60) {
        p.opacity = ((p.maxLife - p.life) / 60) * p.maxOpacity;
      } else {
        p.opacity = p.maxOpacity;
      }

      if (p.life >= p.maxLife || p.y < -10) p.reset();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `oklch(0.82 0.06 80 / ${p.opacity})`;
      ctx.fill();
    });
    raf = requestAnimationFrame(loop);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();
  loop();

  // Pause when not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else loop();
  });
})();

/* ── SPRING CLASS ── */
class Spring {
  constructor(stiffness = 0.08, damping = 0.75) {
    this.value = 0; this.target = 0; this.velocity = 0;
    this.k = stiffness; this.d = damping;
  }
  tick() {
    const force = (this.target - this.value) * this.k;
    this.velocity = (this.velocity + force) * this.d;
    this.value += this.velocity;
    return this.value;
  }
  isResting(epsilon = 0.01) {
    return Math.abs(this.target - this.value) < epsilon && Math.abs(this.velocity) < epsilon;
  }
}

/* Magnetic buttons removed — hover handled by CSS only */

/* ── TEXT SCRAMBLE ── */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789✦◆■□▲△';
function decodeText(el, duration = 1200) {
  if (!el) return;
  const final = el.textContent.trim();
  let frame = 0;
  const total = Math.round(duration / 16);
  const tick = () => {
    el.textContent = [...final].map((ch, i) =>
      i < Math.round((frame / total) * final.length)
        ? ch
        : ch === ' '
          ? ' '
          : CHARS[Math.floor(Math.random() * CHARS.length)]
    ).join('');
    if (++frame <= total) requestAnimationFrame(tick);
  };
  tick();
}

/* Activate scramble on elements in view */
(function initScramble() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      setTimeout(() => decodeText(target, 1400), parseInt(target.dataset.scrambleDelay || '0'));
      io.unobserve(target);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-scramble]').forEach(el => io.observe(el));
})();

/* ── MODAL ── */
(function initModals() {
  document.querySelectorAll('[data-modal]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const id = trigger.dataset.modal;
      const overlay = document.getElementById(id);
      if (overlay) overlay.classList.add('open');
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay').classList.remove('open');
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(o => o.classList.remove('open'));
    }
  });
})();

/* ── SMOOTH TESTIMONIALS DRAG ── */
(function initDrag() {
  const track = document.querySelector('.testimonials-track');
  if (!track) return;
  let isDown = false, startX, scrollLeft;
  track.addEventListener('mousedown', e => {
    isDown = true;
    track.style.cursor = 'grabbing';
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });
  track.addEventListener('mouseleave', () => { isDown = false; track.style.cursor = ''; });
  track.addEventListener('mouseup', () => { isDown = false; track.style.cursor = ''; });
  track.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    track.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });
})();

/* ── TOAST HELPER ── */
window.showToast = function(title, msg, duration = 4000) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<div class="toast-title"></div><div class="toast-msg"></div>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('.toast-title').textContent = title;
  toast.querySelector('.toast-msg').textContent = msg;
  toast.classList.add('show');
  toast.style.animation = 'none';
  setTimeout(() => toast.style.animation = '', 10);
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
};
