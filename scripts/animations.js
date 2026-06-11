/* ============================================================
   Dopamina global (vanilla, ~3KB):
   - [data-reveal]  → fade/slide-in on scroll (adds .is-in)
   - .count-up[data-count] → number counts up when visible
   - #sticky-pack   → hides while final pricing/CTA is on screen
   prefers-reduced-motion → everything rendered static, no observers.
   Only transform/opacity → 60fps on mobile.
   ============================================================ */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const reveals = document.querySelectorAll('[data-reveal]');
  const counters = document.querySelectorAll('.count-up[data-count]');

  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-in'));
    counters.forEach((el) => { el.textContent = el.getAttribute('data-count'); });
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));

    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        const el = e.target;
        const target = parseFloat(el.getAttribute('data-count')) || 0;
        const decimals = (el.getAttribute('data-count').split('.')[1] || '').length;
        const t0 = performance.now();
        const DUR = 1100;
        (function frame(now) {
          const p = Math.min(1, (now - t0) / DUR);
          const v = target * (1 - Math.pow(1 - p, 3));
          el.textContent = v.toFixed(decimals);
          if (p < 1) requestAnimationFrame(frame);
        })(t0);
      });
    }, { threshold: 0.4 });
    counters.forEach((el) => cio.observe(el));
  }

  // Sticky pack band: visible through the skills/flow stretch, hides once the
  // final pricing section (or final CTA) is on screen so CTAs never stack.
  const sticky = document.getElementById('sticky-pack');
  const precio = document.getElementById('precio');
  if (sticky && precio && 'IntersectionObserver' in window) {
    sticky.classList.add('is-on');
    const pio = new IntersectionObserver((entries) => {
      entries.forEach((e) => sticky.classList.toggle('is-off', e.isIntersecting));
    }, { threshold: 0.05 });
    pio.observe(precio);
  }
})();
