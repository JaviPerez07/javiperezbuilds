// javiperezbuilds.com — interactions + senior-level animations
(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  // ============================================
  // 6. Lenis smooth scroll (with reduced-motion guard)
  // ============================================
  let lenis = null;
  if (!reducedMotion && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      smoothWheel: true,
      smoothTouch: false,
      syncTouch: false,
      infinite: false,
    });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // ============================================
  // 5. Nav escalonado (3 stages) + scroll progress bar
  // ============================================
  const progress = document.querySelector('.scroll-progress');
  const nav = document.querySelector('.nav-blur');
  let lastScroll = -1;

  const updateOnScroll = () => {
    const y = window.scrollY || window.pageYOffset || 0;
    if (y === lastScroll) return;
    lastScroll = y;

    const h = document.documentElement;
    const height = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
    const pct = height > 0 ? (y / height) * 100 : 0;
    if (progress) progress.style.width = pct + '%';

    if (nav) {
      nav.classList.toggle('is-stage-1', y > 50 && y <= 200);
      nav.classList.toggle('is-stage-2', y > 200);
    }
  };

  if (lenis) {
    lenis.on('scroll', updateOnScroll);
  } else {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => { updateOnScroll(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
  }
  updateOnScroll();

  // ============================================
  // Mobile menu
  // ============================================
  const burger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const open = !mobileMenu.classList.contains('open');
      burger.classList.toggle('open', open);
      mobileMenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (lenis) open ? lenis.stop() : lenis.start();
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
        if (lenis) lenis.start();
      });
    });
  }

  // ============================================
  // Anchor links — route through Lenis when active
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -72, duration: 1.4 });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

  // ============================================
  // Contact form → mailto
  // ============================================
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (form.elements.namedItem('name')?.value || '').trim();
      const email = (form.elements.namedItem('email')?.value || '').trim();
      const message = (form.elements.namedItem('message')?.value || '').trim();
      if (!name || !email || !message) { form.reportValidity(); return; }
      const subject = encodeURIComponent(`Project inquiry — ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      window.location.href = `mailto:javiperezguides@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  // ============================================
  // 1. Hero H1 word-by-word reveal (mask sweep)
  // ============================================
  const h1 = document.querySelector('.h1-reveal');
  if (h1) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      h1.classList.add('is-revealed');
    }));
  }

  // ============================================
  // Generic reveal-on-scroll (sections, cards)
  // ============================================
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // ============================================
  // 2. Portrait depth shift (3D tilt on mousemove)
  // ============================================
  const tiltHost = document.getElementById('portrait-tilt');
  const tiltTarget = tiltHost?.querySelector('.portrait-wrap');
  if (tiltHost && tiltTarget && !reducedMotion && !isTouch) {
    let rafId = null;
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    let scrollActive = false;

    if (lenis) {
      lenis.on('scroll', (e) => {
        // Velocity-based: any active wheel/touch scrolling pauses tilt
        scrollActive = Math.abs(e.velocity) > 0.1;
        if (scrollActive) {
          targetX = 0; targetY = 0;
          if (!rafId) rafId = requestAnimationFrame(update);
        }
      });
    }

    const update = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      tiltTarget.style.setProperty('--tilt-x', currentX.toFixed(3));
      tiltTarget.style.setProperty('--tilt-y', currentY.toFixed(3));
      if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        rafId = requestAnimationFrame(update);
      } else {
        rafId = null;
      }
    };

    tiltHost.addEventListener('mousemove', (e) => {
      if (scrollActive) return;
      const r = tiltHost.getBoundingClientRect();
      targetX = ((e.clientX - r.left) / r.width - 0.5) * 2;   // -1 .. 1
      targetY = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!rafId) rafId = requestAnimationFrame(update);
    }, { passive: true });

    tiltHost.addEventListener('mouseleave', () => {
      targetX = 0; targetY = 0;
      if (!rafId) rafId = requestAnimationFrame(update);
    }, { passive: true });
  }

  // ============================================
  // 3. Border-trace — CSS-driven, nothing to do here.
  //    (Spans + :hover transitions in custom.css)
  // ============================================

  // ============================================
  // 4. Numeric counter-up for work metrics
  // ============================================
  const easeOutExpo = (t) => (t === 1) ? 1 : 1 - Math.pow(2, -10 * t);

  const animateNumber = (el, from, to, suffix, duration = 1200) => {
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const v = from + (to - from) * easeOutExpo(t);
      el.textContent = Math.round(v).toLocaleString('en-US') + suffix;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = to.toLocaleString('en-US') + suffix;
    };
    requestAnimationFrame(step);
  };

  const setupMetric = (el) => {
    // Already prepared? skip.
    if (el.dataset.counterReady) return;
    el.dataset.counterReady = '1';
    const raw = el.textContent.trim();

    // Handle "9 / 200+" specifically
    if (/^\d+\s*\/\s*\d+\+?$/.test(raw)) {
      const [a, b] = raw.split('/').map(s => s.trim());
      const aNum = parseInt(a, 10);
      const bMatch = b.match(/^(\d+)(\+?)$/);
      const bNum = parseInt(bMatch[1], 10);
      const bSuffix = bMatch[2];
      el.innerHTML = `<span class="cn-a">0</span> / <span class="cn-b">0${bSuffix}</span>`;
      el.dataset.targetA = aNum;
      el.dataset.targetB = bNum;
      el.dataset.suffixB = bSuffix;
      return;
    }

    // "95%" / "53 lines" / etc — find first number group
    const m = raw.match(/^(\d+)([\s\S]*)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      const tail = m[2] || '';
      el.innerHTML = `<span class="cn-single">0</span>${tail}`;
      el.dataset.targetSingle = n;
    }
  };

  const runMetric = (el) => {
    if (el.dataset.counterDone) return;
    el.dataset.counterDone = '1';

    if (el.dataset.targetA && el.dataset.targetB) {
      const a = el.querySelector('.cn-a');
      const b = el.querySelector('.cn-b');
      animateNumber(a, 0, parseInt(el.dataset.targetA, 10), '', 1200);
      animateNumber(b, 0, parseInt(el.dataset.targetB, 10), el.dataset.suffixB || '', 1400);
      return;
    }

    if (el.dataset.targetSingle) {
      const single = el.querySelector('.cn-single');
      // Suffix already lives outside .cn-single; animate just the number
      animateNumber(single, 0, parseInt(el.dataset.targetSingle, 10), '', 1200);
    }
  };

  const metricEls = document.querySelectorAll('.work-metric');
  if (metricEls.length) {
    metricEls.forEach(setupMetric);
    if ('IntersectionObserver' in window && !reducedMotion) {
      const mo = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            runMetric(entry.target);
            mo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      metricEls.forEach(el => mo.observe(el));
    } else {
      // reduced-motion or no IO: snap to final
      metricEls.forEach(el => {
        if (el.dataset.targetA && el.dataset.targetB) {
          el.querySelector('.cn-a').textContent = el.dataset.targetA;
          el.querySelector('.cn-b').textContent = el.dataset.targetB + (el.dataset.suffixB || '');
        } else if (el.dataset.targetSingle) {
          el.querySelector('.cn-single').textContent = el.dataset.targetSingle;
        }
      });
    }
  }
})();
