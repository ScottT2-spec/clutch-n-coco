/**
 * Clutch 'N' Coco — Main script
 * Vanilla JS, no dependencies.
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

  // Close on link tap
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

})();
