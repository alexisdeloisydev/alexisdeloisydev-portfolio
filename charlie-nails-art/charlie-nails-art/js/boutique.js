/* ==========================================================================
   CHARLIE NAILS ART — boutique.js
   Panier front-end (aucun paiement réel n'est développé ici, voir le bloc
   PAIEMENT tout en bas de ce fichier pour savoir comment le connecter).

   -> Pour ajouter / modifier un produit : modifier le tableau PRODUCTS
      ci-dessous. Chaque produit a besoin d'un id unique, d'un nom,
      d'un prix (en euros) et d'une image.
   -> Le panier est sauvegardé dans le localStorage du navigateur, donc il
      persiste si la cliente ferme l'onglet puis revient plus tard.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------------
     0. CATALOGUE PRODUITS
        Les cartes produits existent déjà dans boutique.html (data-product-id
        sur chaque bouton "Ajouter au panier"). Ce tableau sert de source de
        vérité pour les prix / noms utilisés dans le panier.
     ------------------------------------------------------------------------ */
  const PRODUCTS = {
    'press-on-classique':   { name: 'Press-On Nails — Collection Classique', price: 18 },
    'press-on-bijou':       { name: 'Press-On Nails — Collection Bijou',     price: 22 },
    'capsules-sur-mesure':  { name: 'Capsules personnalisées sur devis',     price: 0  }, // 0 = "sur devis", voir data-quote
    'collection-ete':       { name: 'Collection Été — édition limitée',      price: 24 },
    'collection-nude':      { name: 'Collection Nude Chic',                  price: 20 },
    'edition-limitee-or':   { name: 'Édition Limitée — Liseré Or',           price: 28 },
  };

  const cartToggleButtons = document.querySelectorAll('[data-cart-toggle]');
  const cartDrawer = document.querySelector('.cart-drawer');
  const cartBackdrop = document.querySelector('.cart-drawer__backdrop');
  const cartItemsEl = document.querySelector('.cart-items');
  const cartCountEls = document.querySelectorAll('[data-cart-count]');
  const cartTotalEl = document.querySelector('[data-cart-total]');
  const cartEmptyEl = document.querySelector('.cart-empty');
  const addButtons = document.querySelectorAll('[data-add-to-cart]');

  if (!cartDrawer) return; // sécurité si le script est chargé sur une page sans boutique

  /* ------------------------------------------------------------------------
     1. ÉTAT DU PANIER (persisté en localStorage)
     ------------------------------------------------------------------------ */
  const STORAGE_KEY = 'charlie-nails-cart';

  const loadCart = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  };

  let cart = loadCart(); // { productId: quantity }

  const saveCart = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  };

  /* ------------------------------------------------------------------------
     2. RENDU DU PANIER
     ------------------------------------------------------------------------ */
  const formatPrice = (value) => `${value.toFixed(2).replace('.', ',')} €`;

  const renderCart = () => {
    const ids = Object.keys(cart).filter(id => cart[id] > 0);
    let total = 0;
    let itemCount = 0;

    cartItemsEl.innerHTML = '';

    if (!ids.length) {
      cartEmptyEl.style.display = 'block';
    } else {
      cartEmptyEl.style.display = 'none';

      ids.forEach(id => {
        const product = PRODUCTS[id];
        if (!product) return;
        const qty = cart[id];
        itemCount += qty;
        const lineTotal = product.price * qty;
        total += lineTotal;

        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
          <div class="cart-item__info">
            <p class="cart-item__name">${product.name}</p>
            <p class="cart-item__price">${product.price === 0 ? 'Sur devis' : formatPrice(product.price) + ' × ' + qty}</p>
          </div>
          <div class="cart-item__actions">
            <button type="button" class="cart-qty-btn" data-decrease="${id}" aria-label="Retirer une unité">−</button>
            <span aria-live="polite">${qty}</span>
            <button type="button" class="cart-qty-btn" data-increase="${id}" aria-label="Ajouter une unité">+</button>
            <button type="button" class="cart-remove-btn" data-remove="${id}" aria-label="Supprimer l'article">✕</button>
          </div>
        `;
        cartItemsEl.appendChild(row);
      });
    }

    cartTotalEl.textContent = formatPrice(total);
    cartCountEls.forEach(el => el.textContent = itemCount);
  };

  /* ------------------------------------------------------------------------
     3. OUVERTURE / FERMETURE DU TIROIR PANIER
     ------------------------------------------------------------------------ */
  const openCart = () => { cartDrawer.classList.add('is-active'); document.body.classList.add('nav-open'); };
  const closeCart = () => { cartDrawer.classList.remove('is-active'); document.body.classList.remove('nav-open'); };

  cartToggleButtons.forEach(btn => btn.addEventListener('click', openCart));
  cartBackdrop?.addEventListener('click', closeCart);
  cartDrawer.querySelector('.cart-drawer__close')?.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartDrawer.classList.contains('is-active')) closeCart();
  });

  /* ------------------------------------------------------------------------
     4. AJOUT / MODIFICATION DES QUANTITÉS
     ------------------------------------------------------------------------ */
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast-cart';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
  };

  addButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.addToCart;
      const product = PRODUCTS[id];
      if (!product) return;

      // Les créations "sur devis" ne s'ajoutent pas au panier : on redirige vers le contact
      if (product.price === 0) {
        window.location.href = 'contact.html?sujet=devis-sur-mesure';
        return;
      }

      cart[id] = (cart[id] || 0) + 1;
      saveCart();
      renderCart();
      showToast(`${product.name} ajouté au panier ✨`);
      openCart();
    });
  });

  cartItemsEl.addEventListener('click', (e) => {
    const increaseId = e.target.dataset.increase;
    const decreaseId = e.target.dataset.decrease;
    const removeId = e.target.dataset.remove;

    if (increaseId) cart[increaseId] = (cart[increaseId] || 0) + 1;
    if (decreaseId) cart[decreaseId] = Math.max(0, (cart[decreaseId] || 0) - 1);
    if (removeId) delete cart[removeId];

    saveCart();
    renderCart();
  });

  /* ------------------------------------------------------------------------
     5. VALIDATION DE COMMANDE (front uniquement, voir bloc PAIEMENT plus bas)
     ------------------------------------------------------------------------ */
  const checkoutBtn = document.querySelector('[data-checkout]');
  checkoutBtn?.addEventListener('click', () => {
    if (!Object.values(cart).some(qty => qty > 0)) {
      showToast('Votre panier est vide pour le moment 🤍');
      return;
    }
    // Voir le bloc PAIEMENT ci-dessous : c'est ICI qu'il faudra déclencher
    // l'appel à Stripe / SumUp / PayPal une fois le back-end en place.
    showToast('Redirection vers le paiement à connecter — voir commentaires du code');
  });

  renderCart();
});

/* ============================================================================
   BLOC PAIEMENT — LIRE ATTENTIVEMENT AVANT MISE EN PRODUCTION
   ============================================================================
   Ce site NE développe volontairement AUCUN paiement réel : le panier
   ci-dessus est uniquement une démonstration front-end (stocké dans le
   navigateur de la visiteuse, sans back-end). Voici comment le brancher :

   1) CHOISIR UN PRESTATAIRE
      - Stripe Checkout : le plus simple pour une petite boutique, gère les
        cartes bancaires, Apple Pay / Google Pay. Nécessite un compte Stripe
        + une clé publique (front) et une clé secrète (back-end uniquement,
        jamais dans ce fichier JS).
      - SumUp : bonne option si la prothésiste utilise déjà un terminal SumUp
        en institut, permet d'unifier paiements en ligne et sur place.
      - PayPal Checkout : rassurant pour la clientèle, intégration simple via
        le SDK JS officiel de PayPal, mais commissions parfois plus élevées.

   2) CE QU'IL FAUT CRÉER CÔTÉ SERVEUR (obligatoire, quel que soit le choix)
      - Un petit back-end (Node/Express, PHP, ou une fonction serverless type
        Netlify/Vercel Functions) qui reçoit le contenu du panier envoyé par
        ce fichier, calcule le total, et crée une "session de paiement"
        auprès de Stripe/SumUp/PayPal via leur API + clé secrète.
      - Ce back-end renvoie une URL de paiement (ou un token) que ce fichier
        JS utilise ensuite pour rediriger la cliente (window.location.href
        = urlDeSession) ou pour ouvrir la fenêtre de paiement du prestataire.

   3) FICHIERS À MODIFIER LORS DE L'INTÉGRATION
      - js/boutique.js : dans la fonction du bouton [data-checkout] ci-dessus,
        remplacer le showToast(...) par un fetch() vers votre back-end
        (ex: fetch('/api/create-checkout-session', { method: 'POST', body:
        JSON.stringify(cart) })) puis rediriger vers l'URL renvoyée.
      - boutique.html : aucune modification nécessaire, la structure est prête.
      - Un nouveau fichier serveur (ex: /api/create-checkout-session.js) à
        créer dans votre hébergement, contenant la clé secrète du prestataire
        (à stocker en variable d'environnement, jamais en clair dans le code).

   4) SÉCURITÉ
      - Ne jamais mettre de clé secrète dans un fichier JS chargé côté client.
      - Toujours recalculer le total des prix côté serveur avant de créer la
        session de paiement (ne jamais faire confiance au total envoyé par
        le navigateur).
   ============================================================================ */
