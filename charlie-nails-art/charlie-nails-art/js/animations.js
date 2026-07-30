/* ==========================================================================
   CHARLIE NAILS ART — animations.js
   Petites interactions spécifiques à certaines pages :
   - Accordéon FAQ (page d'accueil / prestations)
   - Bascule mensuel/carte tarifs (page Tarifs)
   - Validation douce du formulaire de contact avant envoi
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------------
     1. ACCORDÉON FAQ
     ------------------------------------------------------------------------ */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question?.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Ferme les autres questions ouvertes (accordéon classique)
      faqItems.forEach(other => {
        other.classList.remove('is-open');
        other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherAnswer) otherAnswer.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('is-open');
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ------------------------------------------------------------------------
     2. FORMULAIRE DE CONTACT — validation douce côté client
        (le formulaire est ensuite envoyé via Formspree / EmailJS / PHP,
        voir les commentaires détaillés directement dans contact.html)
     ------------------------------------------------------------------------ */
  const contactForm = document.querySelector('.contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      const requiredFields = contactForm.querySelectorAll('[required]');
      let hasError = false;

      requiredFields.forEach(field => {
        const errorEl = field.closest('.form-field')?.querySelector('.form-error');
        if (!field.value.trim()) {
          hasError = true;
          field.style.borderColor = '#c65b4d';
          if (errorEl) errorEl.textContent = 'Ce champ est nécessaire pour vous répondre.';
        } else {
          field.style.borderColor = '';
          if (errorEl) errorEl.textContent = '';
        }
      });

      const emailField = contactForm.querySelector('[type="email"]');
      if (emailField && emailField.value && !emailField.value.includes('@')) {
        hasError = true;
        emailField.style.borderColor = '#c65b4d';
        const errorEl = emailField.closest('.form-field')?.querySelector('.form-error');
        if (errorEl) errorEl.textContent = 'Merci de vérifier le format de l\'adresse mail.';
      }

      if (hasError) e.preventDefault();
    });
  }

  /* ------------------------------------------------------------------------
     3. BOUTON "COPIER L'ADRESSE MAIL" (footer / page contact)
     ------------------------------------------------------------------------ */
  document.querySelectorAll('[data-copy-email]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const email = btn.dataset.copyEmail;
      try {
        await navigator.clipboard.writeText(email);
        const original = btn.textContent;
        btn.textContent = 'Adresse copiée ✓';
        setTimeout(() => { btn.textContent = original; }, 1800);
      } catch {
        // Navigateur sans support clipboard : on ne bloque rien
      }
    });
  });

});
