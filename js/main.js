/* ConnectEd Circles — Main JS */

(function () {
  'use strict';

  // ── Mobile nav toggle ──
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      links.classList.toggle('open');
    });

    // Close menu when a link is clicked
    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── Scroll animations (IntersectionObserver) ──
  var animEls = document.querySelectorAll('.anim');
  if ('IntersectionObserver' in window && animEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );
    // Immediately show elements already in viewport, observe the rest
    animEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      } else {
        observer.observe(el);
      }
    });
  } else {
    // Fallback: show everything immediately
    animEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ── Accordion (Frameworks page) ──
  document.querySelectorAll('.accordion-header').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.accordion-item');
      var isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.accordion-item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
        openItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Nav background on scroll ──
  var nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        nav.style.boxShadow = 'var(--shadow-sm)';
      } else {
        nav.style.boxShadow = 'none';
      }
    });
  }
})();
