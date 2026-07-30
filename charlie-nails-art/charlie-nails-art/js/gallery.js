/* ==========================================================================
   CHARLIE NAILS ART — gallery.js
   Gère la page Galerie : filtres par catégorie + lightbox plein écran.
   -> Pour ajouter une photo : dans galerie.html, dupliquer un bloc
      <figure class="gallery-item" data-category="...">...</figure>
      et remplacer l'image + le data-category (voir commentaires dans galerie.html).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const filterButtons = document.querySelectorAll('.gallery-filter button');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.querySelector('.lightbox');

  if (!galleryItems.length) return;

  /* ------------------------------------------------------------------------
     1. FILTRAGE PAR CATÉGORIE
     ------------------------------------------------------------------------ */
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.filter;

      filterButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      filterButtons.forEach(b => { if (b !== btn) b.setAttribute('aria-pressed', 'false'); });

      galleryItems.forEach(item => {
        const match = category === 'all' || item.dataset.category === category;
        item.style.display = match ? '' : 'none';
      });
    });
  });

  /* ------------------------------------------------------------------------
     2. LIGHTBOX
     ------------------------------------------------------------------------ */
  if (lightbox) {
    const lightboxImg = lightbox.querySelector('img');
    const lightboxClose = lightbox.querySelector('.lightbox__close');

    const openLightbox = (src, alt) => {
      lightboxImg.src = src;
      lightboxImg.alt = alt;
      lightbox.classList.add('is-active');
      document.body.classList.add('nav-open'); // réutilise le blocage de scroll
      lightboxClose.focus();
    };

    const closeLightbox = () => {
      lightbox.classList.remove('is-active');
      document.body.classList.remove('nav-open');
    };

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        openLightbox(img.src, img.alt);
      });
      // Accessibilité clavier : ouvrir avec Entrée / Espace
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const img = item.querySelector('img');
          openLightbox(img.src, img.alt);
        }
      });
    });

    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox__backdrop')?.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('is-active')) closeLightbox();
    });
  }
});
