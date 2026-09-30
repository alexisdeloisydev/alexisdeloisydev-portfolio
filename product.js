// Product data (unitPrice = bouteille, canPrice = canette)
const products = {
    francaise: {
        name: 'La Française',
        desc: 'Citron & Tilleul. L\'élégance d\'un jardin à la française sous une robe jaune citronade.',
        image: './images/officiel2.png',
        unitPrice: 3.99,
        canPrice: 3.19
    },
    japonaise: {
        name: 'La Japonaise',
        desc: 'Pamplemousse & Fleur de cerisier. Un minimalisme floral inspiré par le Japon (Sakura).',
        image: 'images/tpportrait_tpC_alexis_deloisy-8.jpg',
        unitPrice: 3.49,
        canPrice: 3.19
    },
    americaine: {
        name: 'L\'Américaine',
        desc: 'Citron vert & Fleur de sureau. Un twist pop et pétillant aux saveurs surprenantes.',
        image: './images/officiel1.png',
        unitPrice: 3.59,
        canPrice: 3.19
    }
};

// ... (gardez getProductId et formatPrice tels quels) ...

function getProductId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || 'francaise';
}

function formatPrice(value) {
    return value.toFixed(2).replace('.', ',') + ' €';
}

function loadProduct() {
    const hasIdParam = window.location.search.includes('id=');
    const path = window.location.pathname || '';
    const isGenericProductPage = path.endsWith('product.html');

    if (!hasIdParam && !isGenericProductPage) {
        const filename = path.split('/').pop();
        const basename = (filename || '').replace('.html', '').toLowerCase();
        if (products[basename]) {
            const priceEl = document.getElementById('price');
            if (priceEl) priceEl.textContent = formatPrice(products[basename].unitPrice);
            attachBuyOptionListeners(products[basename]);
        }
        return;
    }

    const id = getProductId();
    const product = products[id];

    if (product) {
        const nameEl = document.getElementById('productName');
        const descEl = document.getElementById('productDesc');
        const imgEl = document.getElementById('productImage');
        if (nameEl) nameEl.textContent = product.name;
        if (descEl) descEl.textContent = product.desc;
        if (imgEl) imgEl.src = product.image;
        try { document.title = `Zestia | ${product.name}`; } catch (e) {}

        const priceEl = document.getElementById('price');
        if (priceEl) priceEl.textContent = formatPrice(product.unitPrice);

        attachBuyOptionListeners(product);
    }
}

function attachBuyOptionListeners(product) {
    const qtyInput = document.getElementById('quantity');
    const decrease = document.getElementById('decreaseQty');
    const increase = document.getElementById('increaseQty');
    const priceEl = document.getElementById('price');
    const buyRadios = document.querySelectorAll('input[name="buyType"]');
    const addBtn = document.getElementById('addToCart');

    // Configuration des packs
    const BOTTLE_PACK_COUNT = 6;
    const BOTTLE_PACK_DISCOUNT = 0.15; // -15%
    const CAN_PACK_COUNT = 24;
    const CAN_PACK_DISCOUNT = 0.20;   // -20%

    function computeAndShow() {
        const buyType = document.querySelector('input[name="buyType"]:checked').value;
        let finalDisplayPrice = 0;
        let suffix = "";

        if (buyType === 'unit') {
            finalDisplayPrice = product.unitPrice;
        } 
        else if (buyType === 'pack') {
            const totalBeforeDiscount = product.unitPrice * BOTTLE_PACK_COUNT;
            finalDisplayPrice = +(totalBeforeDiscount * (1 - BOTTLE_PACK_DISCOUNT)).toFixed(2);
            suffix = ` (pack de ${BOTTLE_PACK_COUNT} bouteilles)`;
        } 
        else if (buyType === 'can') {
            finalDisplayPrice = product.canPrice;
            suffix = " (canette)";
        } 
        else if (buyType === 'packCan') {
            const totalBeforeDiscount = product.canPrice * CAN_PACK_COUNT;
            finalDisplayPrice = +(totalBeforeDiscount * (1 - CAN_PACK_DISCOUNT)).toFixed(2);
            suffix = ` (pack de ${CAN_PACK_COUNT} canettes)`;
        }

        priceEl.textContent = formatPrice(finalDisplayPrice) + suffix;
    }

    // Listeners
    if (decrease) decrease.addEventListener('click', () => { qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1); computeAndShow(); });
    if (increase) increase.addEventListener('click', () => { qtyInput.value = Math.min(10, (parseInt(qtyInput.value, 10) || 1) + 1); computeAndShow(); });
    if (qtyInput) qtyInput.addEventListener('input', computeAndShow);
    buyRadios.forEach(r => r.addEventListener('change', computeAndShow));

    // Panier
    if (addBtn) addBtn.addEventListener('click', () => {
        const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
        const buyType = document.querySelector('input[name="buyType"]:checked').value;
        
        if (buyType === 'pack') {
            alert(`Ajouté ${qty} x pack de ${BOTTLE_PACK_COUNT} bouteilles (${qty * BOTTLE_PACK_COUNT} au total).`);
        } else if (buyType === 'packCan') {
            alert(`Ajouté ${qty} x pack de ${CAN_PACK_COUNT} canettes (${qty * CAN_PACK_COUNT} au total).`);
        } else if (buyType === 'can') {
            alert(`Ajouté ${qty} canette(s) de ${product.name}.`);
        } else {
            alert(`Ajouté ${qty} bouteille(s) de ${product.name}.`);
        }
    });

    computeAndShow();
}

document.addEventListener('DOMContentLoaded', loadProduct);