# Charlie Nails Art — Site vitrine

Site vitrine complet pour une prothésiste ongulaire, développé en **HTML5 / CSS3 / JavaScript vanilla**, sans framework ni librairie. Prêt à être ouvert avec Live Server dans Visual Studio Code, et prêt à être déployé sur un hébergement OVH.

## Structure du projet

```
/
├── index.html          Accueil
├── prestations.html     Liste des prestations
├── tarifs.html          Grille tarifaire
├── galerie.html         Galerie photo filtrable + lightbox
├── boutique.html        Boutique (press-on nails) + panier front
├── apropos.html         Présentation de la prothésiste
├── contact.html         Formulaire de contact
├── cgv.html             CGV, mentions légales, confidentialité
│
├── css/
│   ├── style.css         Variables, reset, typographie, composants
│   ├── responsive.css    Points de rupture desktop / tablette / mobile
│   └── animations.css    Keyframes, apparitions au scroll, menu mobile
│
├── js/
│   ├── main.js           Header sticky, menu burger, scroll reveal, retour en haut
│   ├── gallery.js        Filtres + lightbox de la galerie
│   ├── boutique.js       Panier front (voir bloc PAIEMENT à la fin du fichier)
│   └── animations.js     Accordéon FAQ, validation du formulaire de contact
│
├── images/               Visuels du site (actuellement des placeholders SVG)
├── icons/                Favicon SVG
├── fonts/                (vide — les polices sont chargées via Google Fonts)
├── robots.txt
└── sitemap.xml
```

## Ce qu'il reste à personnaliser avant mise en ligne

1. **Images** : chaque fichier `images/placeholder-*.svg` doit être remplacé par une vraie photo (même nom de fichier, ou mettre à jour les balises `<img src="...">` correspondantes dans les fichiers HTML). Des commentaires `<!-- ... à remplacer -->` indiquent chaque emplacement.
2. **Textes & tarifs** : les prix de la page `tarifs.html` et les fiches produits de `boutique.html` sont modifiables directement dans les fichiers `gen_*.py` d'origine ou, plus simplement, en éditant le HTML final (rechercher les commentaires `TARIFS` / `BOUTIQUE`).
3. **Coordonnées** : adresse, téléphone, mail et horaires sont à corriger dans le footer (présent sur toutes les pages) ainsi que sur `contact.html` et le schema.org de `index.html`.
4. **Réseaux sociaux** : remplacer les liens `href="https://instagram.com/"` et `https://facebook.com/"` par les vraies pages (footer + page contact).
5. **Formulaire de contact** : voir le commentaire détaillé en haut du formulaire dans `contact.html` (3 options : Formspree, EmailJS ou PHP).
6. **Paiement en ligne** : voir le commentaire détaillé en bas du fichier `js/boutique.js` (Stripe / SumUp / PayPal). Aucun paiement n'est développé, uniquement la structure prête à connecter.
7. **Mentions légales** : compléter le numéro SIRET et le nom de famille dans `cgv.html`.
8. **Nom de domaine** : remplacer `https://www.charlienailsart.fr` par le vrai nom de domaine dans `sitemap.xml`, `robots.txt` et les balises `<meta property="og:...">` / `canonical` de chaque page.

## Déploiement sur OVH (hébergement mutualisé classique)

1. Connectez-vous à votre espace client OVH puis ouvrez le gestionnaire **Multisite / FTP-SSH** de votre hébergement.
2. Récupérez les identifiants FTP (ou activez SSH si besoin).
3. Connectez-vous en FTP avec un client comme **FileZilla** :
   - Hôte : `ftp.cluster0XX.hosting.ovh.net` (indiqué dans votre espace client)
   - Identifiant / mot de passe : ceux de l'hébergement FTP
4. Placez l'intégralité du contenu de ce dossier (tous les fichiers et sous-dossiers) directement dans le répertoire `www/` de votre hébergement.
5. Vérifiez que `index.html` est bien accessible à la racine (`https://votredomaine.fr/index.html` doit afficher l'accueil).
6. Si votre nom de domaine est déjà pointé chez OVH, le site est alors en ligne immédiatement (propagation DNS déjà faite dans la majorité des cas).
7. Pensez à mettre à jour `sitemap.xml` avec le vrai domaine puis à soumettre ce sitemap dans **Google Search Console**.

## Accessibilité & performances

- Navigation clavier complète (focus visible, lien d'évitement, menu mobile fermable à l'Échap).
- Attributs `alt`, `aria-label`, structure `Hn` cohérente sur toutes les pages.
- Images en `loading="lazy"` (sauf l'image principale du hero).
- Respecte `prefers-reduced-motion` pour désactiver les animations si l'utilisateur le préfère.

## Support technique

Pour toute modification plus poussée (ajout d'une page, changement profond de structure), les fichiers `gen_*.py` utilisés pour générer ce site (non fournis dans la livraison finale) peuvent être redemandés si besoin d'une régénération propre.
