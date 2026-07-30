/* ==========================================================================
   CHARLIE NAILS ART — main.js
   Comportements communs à toutes les pages :
   - header sticky qui se réduit au scroll
   - menu burger (ouverture/fermeture, blocage du scroll, fermeture Echap)
   - apparition des blocs au scroll (Intersection Observer)
   - bouton retour en haut
   - léger parallaxe sur le blob du hero
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------------
     1. HEADER — réduction + ombre au scroll
     ------------------------------------------------------------------------ */
  const header = document.querySelector('.site-header');

  if (header) {
    const SCROLL_THRESHOLD = 40;

    const updateHeaderState = () => {
      if (window.scrollY > SCROLL_THRESHOLD) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };

    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
  }

  /* ------------------------------------------------------------------------
     2. MENU BURGER (mobile / tablette)
     ------------------------------------------------------------------------ */
  const burgerBtn = document.querySelector('.burger-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavBackdrop = document.querySelector('.mobile-nav__backdrop');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav__panel a');

  const openMenu = () => {
    mobileNav.classList.add('is-active');
    burgerBtn.classList.add('is-open');
    burgerBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open'); // bloque le scroll de la page
  };

  const closeMenu = () => {
    mobileNav.classList.remove('is-active');
    burgerBtn.classList.remove('is-open');
    burgerBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };

  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.contains('is-active');
      isOpen ? closeMenu() : openMenu();
    });

    mobileNavBackdrop?.addEventListener('click', closeMenu);
    mobileNavLinks.forEach(link => link.addEventListener('click', closeMenu));

    // Fermeture au clavier (touche Echap) — accessibilité
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-active')) {
        closeMenu();
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. APPARITION DES BLOCS AU SCROLL
        -> Ajouter data-reveal="up|down|left|right|scale|fade" sur un élément
           dans le HTML pour qu'il bénéficie de l'animation.
     ------------------------------------------------------------------------ */
  const revealTargets = document.querySelectorAll('[data-reveal]');

  if (revealTargets.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback : navigateurs sans IntersectionObserver -> tout afficher directement
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  /* ------------------------------------------------------------------------
     4. BOUTON RETOUR EN HAUT
     ------------------------------------------------------------------------ */
  const backToTop = document.querySelector('.back-to-top');

  if (backToTop) {
    const toggleBackToTop = () => {
      if (window.scrollY > 500) {
        backToTop.classList.add('is-visible');
      } else {
        backToTop.classList.remove('is-visible');
      }
    };

    toggleBackToTop();
    window.addEventListener('scroll', toggleBackToTop, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------------------
     5. PARALLAXE LÉGER SUR LE BLOB DU HERO
     ------------------------------------------------------------------------ */
  const heroBlob = document.querySelector('.hero-blob');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroBlob && !prefersReducedMotion) {
    window.addEventListener('scroll', () => {
      const offset = window.scrollY * 0.08;
      heroBlob.style.setProperty('--parallax-y', `${offset}px`);
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     6. ANNÉE COURANTE DANS LE FOOTER (copyright)
     ------------------------------------------------------------------------ */
  const yearEl = document.querySelector('[data-current-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
