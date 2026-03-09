/**
 * Clutch 'N' Coco — Main script
 * Reads products from Firebase Firestore (admin-managed).
 * Falls back to products.json if Firebase is not configured.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Header scroll shadow
     ------------------------------------------------------------------ */
  var header = document.getElementById('siteHeader');
  var scrollClass = 'scrolled';

  function onScroll() {
    header.classList.toggle(scrollClass, window.scrollY > 40);
    toTopBtn.classList.toggle('show', window.scrollY > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ------------------------------------------------------------------
     Logo lightbox
     ------------------------------------------------------------------ */
  var headerLogo = document.getElementById('headerLogo');
  var logoLightbox = document.getElementById('logoLightbox');

  headerLogo.addEventListener('click', function (e) {
    e.preventDefault();
    logoLightbox.classList.add('active');
    logoLightbox.setAttribute('aria-hidden', 'false');
  });
  logoLightbox.addEventListener('click', function () {
    logoLightbox.classList.remove('active');
    logoLightbox.setAttribute('aria-hidden', 'true');
  });

  /* ------------------------------------------------------------------
     Mobile nav toggle
     ------------------------------------------------------------------ */
  var toggle = document.getElementById('menuToggle');
  var nav    = document.getElementById('mainNav');

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  nav.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ------------------------------------------------------------------
     Back-to-top button
     ------------------------------------------------------------------ */
  var toTopBtn = document.getElementById('toTop');
  toTopBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ------------------------------------------------------------------
     Scroll-reveal (IntersectionObserver)
     ------------------------------------------------------------------ */
  var reveals = document.querySelectorAll(
    '.value-card, .product-card, .step, .contact-card, .info-box, .about-copy, .cta-inner'
  );

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 4) * 80 + 'ms';
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------
     Product catalog & modal
     ------------------------------------------------------------------ */
  var products = [];
  var modal = document.getElementById('productModal');
  var modalTitle = document.getElementById('modalTitle');
  var modalBody = document.getElementById('modalBody');
  var modalClose = document.getElementById('modalClose');

  var categoryMeta = {
    'dresses-tops':      { name: 'Dresses & Tops',      emoji: '👗' },
    'jewelry-bracelets': { name: 'Jewelry & Bracelets',  emoji: '💍' },
    'perfumes':          { name: 'Perfumes',              emoji: '🧴' },
    'hair-bonnets':      { name: 'Hair & Bonnets',        emoji: '🎀' },
    'shoes':             { name: 'Shoes',                  emoji: '👠' },
    'gift-sets':         { name: 'Gift Sets',              emoji: '🎁' },
    'watches-wallets':   { name: 'Watches & Wallets',      emoji: '⌚' },
    'chains-earrings':   { name: 'Chains & Earrings',      emoji: '🔗' },
    'other':             { name: 'Other Items',              emoji: '🛍️' }
  };

  // Update category card item counts
  function updateCategoryCounts() {
    document.querySelectorAll('.product-card--clickable').forEach(function (card) {
      var cat = card.getAttribute('data-category');
      var count = products.filter(function (p) { return p.category === cat; }).length;
      var hint = card.querySelector('.card-tap-hint');
      if (hint) {
        hint.textContent = count > 0 ? 'Tap to view ' + count + ' item' + (count > 1 ? 's' : '') + ' →' : 'Tap to view items →';
      }
    });
  }

  // Try loading from Firestore first
  function loadFromFirestore() {
    if (typeof firebase === 'undefined' || typeof firebaseConfig === 'undefined' ||
        firebaseConfig.apiKey === 'YOUR_API_KEY') {
      // Firebase not configured — fall back to JSON
      loadFromJSON();
      return;
    }

    try {
      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      var db = firebase.firestore();

      db.collection('products').orderBy('createdAt', 'desc').onSnapshot(
        function (snap) {
          products = [];
          snap.forEach(function (doc) {
            products.push(Object.assign({ id: doc.id }, doc.data()));
          });
          updateCategoryCounts();
        },
        function () {
          // Firestore error — fall back to JSON
          loadFromJSON();
        }
      );
    } catch (e) {
      loadFromJSON();
    }
  }

  function loadFromJSON() {
    fetch('products.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        products = data;
        updateCategoryCounts();
      })
      .catch(function () { products = []; });
  }

  loadFromFirestore();

  // Open modal for a category
  function openModal(category) {
    var meta = categoryMeta[category] || { name: category, emoji: '🛍️' };
    modalTitle.textContent = meta.emoji + ' ' + meta.name;

    var items = products.filter(function (p) { return p.category === category; });

    if (items.length === 0) {
      modalBody.innerHTML =
        '<div class="modal-empty">' +
          '<div class="modal-empty-emoji">🛍️</div>' +
          '<p>No items yet in this category.<br>Message us on WhatsApp to check availability.</p>' +
        '</div>';
    } else {
      var html = '<div class="item-grid">';
      items.forEach(function (item) {
        var statusClass = item.status === 'available' ? 'item-status--available' : 'item-status--preorder';
        var statusLabel = item.status === 'available' ? 'Available' : 'Preorder';

        var imageHtml;
        if (item.image) {
          imageHtml = '<img class="item-image" src="' + item.image + '" alt="' + item.name + '" loading="lazy">';
        } else {
          imageHtml = '<div class="item-image-placeholder">' + meta.emoji + '</div>';
        }

        html +=
          '<div class="item-card">' +
            imageHtml +
            '<div class="item-info">' +
              '<div class="item-name">' + item.name + '</div>' +
              '<div class="item-desc">' + (item.description || '') + '</div>' +
              '<div class="item-meta">' +
                '<span class="item-price">' + item.price + '</span>' +
                '<span class="item-status ' + statusClass + '">' + statusLabel + '</span>' +
              '</div>' +
            '</div>' +
          '</div>';
      });
      html += '</div>';
      modalBody.innerHTML = html;
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Category card clicks
  document.querySelectorAll('.product-card--clickable').forEach(function (card) {
    card.addEventListener('click', function () {
      var cat = card.getAttribute('data-category');
      if (cat) openModal(cat);
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var cat = card.getAttribute('data-category');
        if (cat) openModal(cat);
      }
    });
  });

  // Close modal
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });

})();
