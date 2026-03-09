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

        var itemImages = (item.images && Array.isArray(item.images) && item.images.length > 0)
          ? item.images : (item.image ? [item.image] : []);
        var imageHtml;
        if (itemImages.length > 1) {
          // Multi-image carousel
          imageHtml =
            '<div class="item-carousel" data-idx="0">' +
              '<img class="item-image item-image--clickable" src="' + itemImages[0] + '" alt="' + item.name + '" loading="lazy" data-images=\'' + JSON.stringify(itemImages) + '\'>' +
              '<button class="carousel-prev" aria-label="Previous image">‹</button>' +
              '<button class="carousel-next" aria-label="Next image">›</button>' +
              '<span class="carousel-counter">1 / ' + itemImages.length + '</span>' +
            '</div>';
        } else if (itemImages.length === 1) {
          imageHtml = '<img class="item-image item-image--clickable" src="' + itemImages[0] + '" alt="' + item.name + '" loading="lazy" data-images=\'' + JSON.stringify(itemImages) + '\'>';
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

    // Carousel prev/next handlers
    modalBody.querySelectorAll('.item-carousel').forEach(function (carousel) {
      var img = carousel.querySelector('.item-image');
      var imgs = JSON.parse(img.getAttribute('data-images') || '[]');
      var counter = carousel.querySelector('.carousel-counter');
      var idx = 0;

      carousel.querySelector('.carousel-prev').addEventListener('click', function (e) {
        e.stopPropagation();
        idx = (idx - 1 + imgs.length) % imgs.length;
        img.src = imgs[idx];
        counter.textContent = (idx + 1) + ' / ' + imgs.length;
      });
      carousel.querySelector('.carousel-next').addEventListener('click', function (e) {
        e.stopPropagation();
        idx = (idx + 1) % imgs.length;
        img.src = imgs[idx];
        counter.textContent = (idx + 1) + ' / ' + imgs.length;
      });
    });

    // Attach click handlers to product images for fullscreen view
    modalBody.querySelectorAll('.item-image--clickable').forEach(function (img) {
      img.addEventListener('click', function (e) {
        e.stopPropagation();
        var imgs = JSON.parse(img.getAttribute('data-images') || '[]');
        if (imgs.length > 0) {
          openLightbox(img.src, img.alt, imgs);
        } else {
          openLightbox(img.src, img.alt);
        }
      });
    });

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
    if (e.key === 'Escape') {
      if (lightbox && lightbox.classList.contains('active')) {
        closeLightbox();
      } else if (modal.classList.contains('active')) {
        closeModal();
      }
    }
  });

  /* ------------------------------------------------------------------
     Fullscreen image lightbox
     ------------------------------------------------------------------ */
  // Create lightbox elements
  var lightbox = document.createElement('div');
  lightbox.className = 'lightbox-overlay';
  lightbox.innerHTML =
    '<div class="lightbox-content">' +
      '<button class="lightbox-close" aria-label="Close">&times;</button>' +
      '<button class="lightbox-prev" aria-label="Previous" style="display:none;">‹</button>' +
      '<img class="lightbox-img" src="" alt="">' +
      '<button class="lightbox-next" aria-label="Next" style="display:none;">›</button>' +
      '<div class="lightbox-caption"></div>' +
    '</div>';
  document.body.appendChild(lightbox);

  var lightboxImg = lightbox.querySelector('.lightbox-img');
  var lightboxCaption = lightbox.querySelector('.lightbox-caption');
  var lightboxClose = lightbox.querySelector('.lightbox-close');
  var lightboxPrev = lightbox.querySelector('.lightbox-prev');
  var lightboxNext = lightbox.querySelector('.lightbox-next');
  var lightboxImages = [];
  var lightboxIdx = 0;

  function openLightbox(src, alt, images) {
    lightboxImages = images || [src];
    lightboxIdx = Math.max(0, lightboxImages.indexOf(src));
    lightboxImg.src = lightboxImages[lightboxIdx];
    lightboxImg.alt = alt || '';
    updateLightboxCaption(alt);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (lightboxImages.length > 1) {
      lightboxPrev.style.display = '';
      lightboxNext.style.display = '';
    } else {
      lightboxPrev.style.display = 'none';
      lightboxNext.style.display = 'none';
    }
  }

  function updateLightboxCaption(alt) {
    if (lightboxImages.length > 1) {
      lightboxCaption.textContent = (alt || '') + ' (' + (lightboxIdx + 1) + '/' + lightboxImages.length + ')';
    } else {
      lightboxCaption.textContent = alt || '';
    }
  }

  lightboxPrev.addEventListener('click', function (e) {
    e.stopPropagation();
    lightboxIdx = (lightboxIdx - 1 + lightboxImages.length) % lightboxImages.length;
    lightboxImg.src = lightboxImages[lightboxIdx];
    updateLightboxCaption(lightboxImg.alt);
  });

  lightboxNext.addEventListener('click', function (e) {
    e.stopPropagation();
    lightboxIdx = (lightboxIdx + 1) % lightboxImages.length;
    lightboxImg.src = lightboxImages[lightboxIdx];
    updateLightboxCaption(lightboxImg.alt);
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    if (!modal.classList.contains('active')) {
      document.body.style.overflow = '';
    }
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-content')) {
      closeLightbox();
    }
  });

})();
