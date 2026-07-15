(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav = document.querySelector('.oa-nav');

  function syncNav() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  syncNav();
  window.addEventListener('scroll', syncNav, { passive: true });

  var revealItems = document.querySelectorAll('[data-oa-reveal]');
  if (reduced || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealItems.forEach(function (el) { revealObserver.observe(el); });
  }

  var signalCard = document.querySelector('[data-oa-signal]');
  if (signalCard) {
    var signalStages = signalCard.querySelectorAll('.oa-flow-stage');
    var activateSignal = function () {
      signalStages.forEach(function (stage, index) {
        if (reduced) {
          stage.classList.add('is-active');
          return;
        }
        window.setTimeout(function () { stage.classList.add('is-active'); }, index * 820);
      });
    };
    if (reduced || !('IntersectionObserver' in window)) {
      activateSignal();
    } else {
      var signalObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          activateSignal();
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.32 });
      signalObserver.observe(signalCard);
    }
  }

  var langButtons = document.querySelectorAll('[data-oa-lang]');
  function setLanguage(lang) {
    if (lang !== 'es' && lang !== 'en') lang = 'es';
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-es][data-en]').forEach(function (el) {
      el.textContent = el.getAttribute(lang === 'es' ? 'data-es' : 'data-en');
    });
    document.querySelectorAll('[data-es-html][data-en-html]').forEach(function (el) {
      el.innerHTML = el.getAttribute(lang === 'es' ? 'data-es-html' : 'data-en-html');
    });
    langButtons.forEach(function (button) {
      var active = button.getAttribute('data-oa-lang') === lang;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    try { localStorage.setItem('preferred-lang', lang); } catch (e) {}
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }

  langButtons.forEach(function (button) {
    button.addEventListener('click', function () { setLanguage(button.getAttribute('data-oa-lang')); });
  });

  var initialLanguage = 'es';
  try { initialLanguage = localStorage.getItem('preferred-lang') || 'es'; } catch (e) {}
  setLanguage(initialLanguage);
})();
