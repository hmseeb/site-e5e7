/* K3Verify — Kimi K3 Native OpenRouter Tools Verification */
(function () {
  'use strict';

  /* ---------- Sticky header state ---------- */
  var header = document.getElementById('site-header');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById('nav-toggle');
  var menu = document.getElementById('nav-menu');
  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- Reveal on scroll ---------- */
  var revealTargets = document.querySelectorAll(
    '.card, .pipeline-step, .status-item, .section-header, .contact-form, .contact-info'
  );
  revealTargets.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Animated hero stats ---------- */
  var stats = document.querySelectorAll('.stat-value');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateStat(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = String(el.getAttribute('data-count')).indexOf('.') !== -1 ? 2 : 0;
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }
    var duration = 1600;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window) {
    var statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateStat(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    stats.forEach(function (el) { statObserver.observe(el); });
  } else {
    stats.forEach(animateStat);
  }

  /* ---------- Contact form validation ---------- */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  var submitBtn = document.getElementById('submit-btn');

  var validators = {
    name: function (v) {
      if (!v.trim()) return 'Please enter your name.';
      if (v.trim().length < 2) return 'Name must be at least 2 characters.';
      return '';
    },
    email: function (v) {
      if (!v.trim()) return 'Please enter your work email.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Please enter a valid email address.';
      return '';
    },
    service: function (v) {
      if (!v) return 'Please select a service.';
      return '';
    },
    message: function (v) {
      if (!v.trim()) return 'Please tell us about your tool surface.';
      if (v.trim().length < 20) return 'Please provide at least 20 characters of detail.';
      return '';
    }
  };

  function validateField(id) {
    var input = document.getElementById(id);
    var errorEl = document.getElementById(id + '-error');
    var validator = validators[id];
    if (!input || !validator) return true;
    var message = validator(input.value);
    var field = input.closest('.form-field');
    field.classList.toggle('invalid', Boolean(message));
    if (errorEl) errorEl.textContent = message;
    return !message;
  }

  Object.keys(validators).forEach(function (id) {
    var input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('blur', function () { validateField(id); });
    input.addEventListener('input', function () {
      if (input.closest('.form-field').classList.contains('invalid')) validateField(id);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ids = Object.keys(validators);
    var results = ids.map(validateField);
    var allValid = results.every(Boolean);

    status.classList.remove('success', 'error');

    if (!allValid) {
      status.textContent = 'Please fix the highlighted fields and try again.';
      status.classList.add('error');
      var firstInvalid = form.querySelector('.form-field.invalid input, .form-field.invalid select, .form-field.invalid textarea');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    // Local submission handling: no external API is called.
    window.setTimeout(function () {
      var name = document.getElementById('name').value.trim().split(' ')[0];
      status.textContent = 'Thanks, ' + name + ' — your request has been recorded. A verification engineer will reply within one business day.';
      status.classList.add('success');
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Request';
    }, 700);
  });

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = String(new Date().getFullYear());
})();
