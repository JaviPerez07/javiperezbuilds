// javiperezbuilds.com — interactions + senior-level animations
(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  // ============================================
  // Email link renderer
  // Defeats Cloudflare Email Address Obfuscation (CEO) and any other
  // crawler that rewrites mailto: hrefs. Each link declares user + domain
  // as data attrs; we assemble the address at runtime.
  // Markup contract:
  //   <a href="#" data-email-user="USER" data-email-domain="DOMAIN"
  //              [data-email-subject="..."]>
  //     <span class="email-display"></span>   <!-- optional, filled with the address -->
  //   </a>
  // If no .email-display child exists, only the href is updated.
  // ============================================
  const renderEmailLinks = () => {
    document.querySelectorAll('[data-email-user][data-email-domain]').forEach(el => {
      const user = el.dataset.emailUser;
      const domain = el.dataset.emailDomain;
      if (!user || !domain) return;
      const email = `${user}@${domain}`;
      const subject = el.dataset.emailSubject;
      el.href = subject
        ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
        : `mailto:${email}`;
      const display = el.querySelector('.email-display');
      if (display && !display.textContent.trim()) display.textContent = email;
    });
  };
  renderEmailLinks();

  // ============================================
  // Funnel · intake countdown (shared by urgency strip + final CTA)
  // Target = last day of current month at 23:59:59 UTC.
  // Recomputed on every load → no manual updates needed; rolls forward automatically.
  // ============================================
  const intakeTarget = () => {
    const now = new Date();
    // Date.UTC(year, month+1, day=0) → last day of CURRENT month
    let target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));
    if (target.getTime() <= now.getTime()) {
      // We're past today's deadline — roll to last day of next month
      target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 0, 23, 59, 59));
    }
    return target;
  };

  const intakeMonthLabel = (date) =>
    date.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

  const updateIntakeCountdown = () => {
    const target = intakeTarget();
    const monthEl = document.getElementById('urgency-month');
    if (monthEl) monthEl.textContent = intakeMonthLabel(target);

    const diff = target.getTime() - Date.now();
    const d = Math.max(0, Math.floor(diff / 86400000));
    const h = Math.max(0, Math.floor((diff % 86400000) / 3600000));
    const m = Math.max(0, Math.floor((diff % 3600000) / 60000));
    const s = Math.max(0, Math.floor((diff % 60000) / 1000));
    const pad = (n) => String(n).padStart(2, '0');
    // Include seconds so the countdown visibly ticks — preserves urgency feel.
    const fmt = `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`;

    const shortEl = document.getElementById('urgency-countdown');
    if (shortEl) shortEl.textContent = fmt;

    document.querySelectorAll('[data-intake-countdown]').forEach(el => {
      el.textContent = fmt;
    });
    document.querySelectorAll('[data-intake-month]').forEach(el => {
      el.textContent = intakeMonthLabel(target);
    });
  };
  updateIntakeCountdown();
  // 1s tick so seconds visibly count down — cheap (single setInterval).
  setInterval(updateIntakeCountdown, 1000);

  // ============================================
  // Funnel · live "$ burned" hero counter
  // Visual illustration of compounding busywork cost. Baseline + small random tick.
  // ============================================
  const burnedEl = document.getElementById('burned-num');
  if (burnedEl && !reducedMotion) {
    const baseline = 2847;
    const cap = baseline + 1000; // Hard ceiling so long sessions don't show absurd $50k
    let v = baseline;
    const render = () => { burnedEl.textContent = '$' + v.toLocaleString('en-US'); };
    render();
    setInterval(() => {
      if (v >= cap) return; // Stop ticking once cap reached
      v = Math.min(cap, v + Math.floor(Math.random() * 3) + 1);
      render();
    }, 1100);
  }

  // ============================================
  // Funnel · sticky mobile CTA visibility
  // Shows after the hero (75% of first viewport) and hides when the
  // final CTA is already in view (so we don't double-stack CTAs).
  // ============================================
  const stickyCta = document.getElementById('sticky-cta');
  if (stickyCta) {
    const updateSticky = () => {
      const y = window.scrollY || window.pageYOffset || 0;
      const h = window.innerHeight;
      const max = (document.documentElement.scrollHeight || document.body.scrollHeight) - h;
      const shouldShow = y > h * 0.75 && y < max - h * 0.5;
      stickyCta.classList.toggle('is-visible', shouldShow);
      // Use `inert` (modern, focus-blocks subtree) instead of aria-hidden,
      // which Lighthouse flags when the subtree contains focusable elements.
      if (shouldShow) stickyCta.removeAttribute('inert');
      else stickyCta.setAttribute('inert', '');
    };
    // Hook into Lenis if it's already initialized; otherwise plain scroll
    // (lenis variable is declared at the top of this IIFE)
    setTimeout(() => {
      if (typeof lenis !== 'undefined' && lenis) {
        lenis.on('scroll', updateSticky);
      } else {
        window.addEventListener('scroll', updateSticky, { passive: true });
      }
      updateSticky();
    }, 0);
  }

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
  // Contact form → mailto (target email assembled from same data attrs,
  // so no literal address lives anywhere in source — belt + suspenders).
  // ============================================
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (form.elements.namedItem('name')?.value || '').trim();
      const email = (form.elements.namedItem('email')?.value || '').trim();
      const message = (form.elements.namedItem('message')?.value || '').trim();
      if (!name || !email || !message) { form.reportValidity(); return; }
      const targetUser = form.dataset.emailUser || 'javiperezguides';
      const targetDomain = form.dataset.emailDomain || 'gmail.com';
      const target = `${targetUser}@${targetDomain}`;
      const subject = encodeURIComponent(`Project inquiry — ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      window.location.href = `mailto:${target}?subject=${subject}&body=${body}`;
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

  // ============================================
  // Funnel · Pain Dashboard counters
  // Each .pain-card has data-pain-value (target int) + optional prefix/suffix.
  // Animates from 0 once when the card enters viewport.
  // ============================================
  const formatPainValue = (raw, prefix, suffix) => {
    return (prefix || '') + Math.round(raw).toLocaleString('en-US') + (suffix || '');
  };

  const animatePainCard = (card) => {
    if (card.dataset.painDone) return;
    card.dataset.painDone = '1';
    const display = card.querySelector('[data-pain-display]');
    if (!display) return;
    const target = parseInt(card.dataset.painValue, 10);
    if (!Number.isFinite(target)) return;
    const prefix = card.dataset.painPrefix || '';
    const suffix = card.dataset.painSuffix || '';

    if (reducedMotion) {
      display.textContent = formatPainValue(target, prefix, suffix);
      return;
    }

    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      display.textContent = formatPainValue(target * easeOutExpo(t), prefix, suffix);
      if (t < 1) requestAnimationFrame(tick);
      else display.textContent = formatPainValue(target, prefix, suffix);
    };
    requestAnimationFrame(tick);
  };

  const painCards = document.querySelectorAll('.pain-card[data-pain-value]');
  if (painCards.length) {
    // Pre-zero the displays so the animation has somewhere to start from
    if (!reducedMotion) {
      painCards.forEach(c => {
        const d = c.querySelector('[data-pain-display]');
        if (d) d.textContent = (c.dataset.painPrefix || '') + '0' + (c.dataset.painSuffix || '');
      });
    }
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            animatePainCard(e.target);
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.45 });
      painCards.forEach(c => io.observe(c));
    } else {
      painCards.forEach(animatePainCard);
    }
  }

  // ============================================
  // Funnel · Case Study bars — animate scaleX on viewport enter
  // ============================================
  const caseBars = document.querySelectorAll('.case-bar-fill[data-fill]');
  if (caseBars.length) {
    if (reducedMotion) {
      caseBars.forEach(f => {
        f.style.setProperty('--fill', f.dataset.fill);
        f.classList.add('is-shown');
      });
    } else if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          const fill = e.target;
          const delay = parseInt(fill.dataset.delay, 10) || 0;
          setTimeout(() => {
            fill.style.setProperty('--fill', fill.dataset.fill);
            fill.classList.add('is-shown');
          }, delay);
          io.unobserve(fill);
        });
      }, { threshold: 0.35 });
      caseBars.forEach(f => io.observe(f));
    } else {
      caseBars.forEach(f => {
        f.style.setProperty('--fill', f.dataset.fill);
        f.classList.add('is-shown');
      });
    }
  }

  // ============================================
  // Funnel · Comparison Table — position "Winner" badge over
  // the winner column (responsive — recomputes on resize).
  // ============================================
  const compareGrid = document.querySelector('.compare-grid');
  // Badge is now a sibling of .compare-grid inside .compare-grid-wrap (so it can
  // float above the grid without being clipped by the grid's overflow:hidden).
  const compareWrap = document.querySelector('.compare-grid-wrap');
  const winnerBadge = compareWrap?.querySelector('.winner-badge');
  const winnerColHead = compareGrid?.querySelector('.compare-col--winner .compare-cell--head');
  if (compareWrap && compareGrid && winnerBadge && winnerColHead) {
    const positionBadge = () => {
      if (window.matchMedia('(max-width: 880px)').matches) {
        winnerBadge.style.left = '50%';
        winnerBadge.style.transform = 'translateX(-50%)';
        return;
      }
      const wrapRect = compareWrap.getBoundingClientRect();
      const headRect = winnerColHead.getBoundingClientRect();
      const centerX = (headRect.left - wrapRect.left) + headRect.width / 2;
      winnerBadge.style.left = centerX + 'px';
      winnerBadge.style.transform = 'translateX(-50%)';
    };
    positionBadge();
    window.addEventListener('resize', positionBadge);
    requestAnimationFrame(() => requestAnimationFrame(positionBadge));
  }

  // ============================================
  // Generic Audit Checker (powers AdSense + Conversion demos)
  // Hardcoded examples; no network calls. Scoring + animation client-side.
  // ============================================
  const tierFor = (n) => n < 50 ? 'bad' : n < 75 ? 'warn' : 'good';
  const tierColors = { bad: '#DC2626', warn: '#F59E0B', good: 'var(--accent)' };

  const animateCount = (el, from, to, duration) => {
    if (reducedMotion) { el.textContent = String(to); return; }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const v = from + (to - from) * easeOutExpo(t);
      el.textContent = String(Math.round(v));
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = String(to);
    };
    requestAnimationFrame(step);
  };

  const initAuditChecker = (root, examples, opts = {}) => {
    if (!root) return;
    const scanMsg = opts.scanMsg || 'Scanning…';
    const summarySuffix = opts.summarySuffix || 'overall';

    const select   = root.querySelector('select');
    const runBtn   = root.querySelector('.checker-run');
    const result   = root.querySelector('.checker-result');
    const idle     = root.querySelector('.checker-idle');
    const scanning = root.querySelector('.checker-scanning');
    const output   = root.querySelector('.checker-output');
    const scoreNum = root.querySelector('.score-number');
    const scoreLbl = root.querySelector('.score-meta-label');
    const catList  = root.querySelector('.score-categories');
    const summary  = root.querySelector('.score-summary');
    if (!select || !runBtn || !result || !output || !scoreNum || !catList || !summary) return;

    const render = (data) => {
      scoreNum.textContent = '0';
      scoreNum.style.color = '';
      catList.innerHTML = '';
      summary.textContent = '';

      const totalTier = tierFor(data.total);
      scoreNum.style.color = tierColors[totalTier];
      if (scoreLbl) scoreLbl.textContent = `${data.label} · ${summarySuffix}`;

      data.categories.forEach((cat) => {
        const li = document.createElement('li');
        li.className = 'score-cat';
        const tier = tierFor(cat.score);
        li.innerHTML = `
          <span class="score-cat-name">${cat.name}</span>
          <span class="score-cat-score">0</span>
          <div class="score-cat-bar"><span class="score-cat-bar-fill" data-tier="${tier}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${cat.score}" aria-label="${cat.name}"></span></div>
        `;
        catList.appendChild(li);
      });

      summary.textContent = data.summary;

      requestAnimationFrame(() => {
        animateCount(scoreNum, 0, data.total, 1400);
        data.categories.forEach((cat, i) => {
          const row = catList.children[i];
          const fill = row.querySelector('.score-cat-bar-fill');
          const num  = row.querySelector('.score-cat-score');
          const delay = 200 + i * 120;
          setTimeout(() => {
            fill.style.width = cat.score + '%';
            animateCount(num, 0, cat.score, 1000);
          }, delay);
        });
      });
    };

    let scanTimer = null;
    runBtn.addEventListener('click', () => {
      const key = select.value;
      const data = examples[key];
      if (!data) return;
      if (scanTimer) clearTimeout(scanTimer);

      runBtn.disabled = true;
      if (idle) idle.hidden = true;
      output.hidden = true;
      if (scanning) {
        scanning.hidden = false;
        const lbl = scanning.querySelector('.scanning-label');
        if (lbl) lbl.textContent = scanMsg;
      }
      result.dataset.state = 'scanning';

      const scanMs = reducedMotion ? 250 : 1800;
      scanTimer = setTimeout(() => {
        if (scanning) scanning.hidden = true;
        output.hidden = false;
        result.dataset.state = 'done';
        render(data);
        runBtn.disabled = false;
        scanTimer = null;
      }, scanMs);
    });
  };

  // AdSense compliance — 5 E-E-A-T factors
  const auditExamples = {
    strong: {
      label: 'Strong example', total: 87,
      categories: [
        { name: 'Author & E-E-A-T signals', score: 92 },
        { name: 'Schema markup',            score: 95 },
        { name: 'Citations & sourcing',     score: 88 },
        { name: 'Technical health',         score: 85 },
        { name: 'Content depth',            score: 75 },
      ],
      summary: 'Strong editor schemas, .gov citations throughout, hardcoded JSON-LD. Minor opportunity in content depth on supporting pages.',
    },
    typical: {
      label: 'Typical AI-generated example', total: 42,
      categories: [
        { name: 'Author & E-E-A-T signals', score: 25 },
        { name: 'Schema markup',            score: 55 },
        { name: 'Citations & sourcing',     score: 30 },
        { name: 'Technical health',         score: 60 },
        { name: 'Content depth',            score: 40 },
      ],
      summary: 'Fictional author personas with fabricated credentials. Generic citations. Schemas present but inconsistent. AdSense rejection likely.',
    },
    underoptimized: {
      label: 'Underoptimized example', total: 58,
      categories: [
        { name: 'Author & E-E-A-T signals', score: 65 },
        { name: 'Schema markup',            score: 40 },
        { name: 'Citations & sourcing',     score: 70 },
        { name: 'Technical health',         score: 55 },
        { name: 'Content depth',            score: 60 },
      ],
      summary: 'Real author bylines but missing editor schema. Citations solid. JSON-LD missing on supporting pages. Recoverable with 2–3 days of work.',
    },
  };

  // Conversion audit — 5 funnel factors
  const conversionExamples = {
    founder: {
      label: 'Typical founder homepage', total: 38,
      categories: [
        { name: 'Hero clarity (sub-5s read)', score: 30 },
        { name: 'CTA visibility & contrast',  score: 40 },
        { name: 'Social proof signals',       score: 25 },
        { name: 'Urgency & scarcity',         score: 35 },
        { name: 'Trust + page speed',         score: 60 },
      ],
      summary: 'Vague hero ("AI-powered solutions"), CTA buried below the fold, no testimonials, no scarcity cues. Projected conversion ~1.2% — typical for founder-built MVPs. The rebuild target: get hero clarity above 90 and add proof bars.',
    },
    saas: {
      label: 'Templated SaaS landing', total: 62,
      categories: [
        { name: 'Hero clarity (sub-5s read)', score: 70 },
        { name: 'CTA visibility & contrast',  score: 75 },
        { name: 'Social proof signals',       score: 55 },
        { name: 'Urgency & scarcity',         score: 40 },
        { name: 'Trust + page speed',         score: 75 },
      ],
      summary: 'Standard pricing page + features grid. Generic logo strip. No urgency cues. Decent technical health. Projected conversion ~2.4% — industry baseline. Two changes (sticky CTA + animated proof bars) push it past 4%.',
    },
    rebuilt: {
      label: 'Same page, after my rebuild', total: 89,
      categories: [
        { name: 'Hero clarity (sub-5s read)', score: 92 },
        { name: 'CTA visibility & contrast',  score: 95 },
        { name: 'Social proof signals',       score: 80 },
        { name: 'Urgency & scarcity',         score: 90 },
        { name: 'Trust + page speed',         score: 88 },
      ],
      summary: 'Specific operator copy, sticky mobile CTA, scarcity strip, animated before/after bars, page speed <1.5s LCP. Projected conversion ~4.7% — a 2-4× lift vs. the typical founder baseline.',
    },
  };

  initAuditChecker(
    document.querySelector('.adsense-checker'),
    auditExamples,
    {
      scanMsg: 'Scanning E-E-A-T signals, schema, citations…',
      summarySuffix: 'overall compliance',
    }
  );

  initAuditChecker(
    document.querySelector('.conversion-checker'),
    conversionExamples,
    {
      scanMsg: 'Measuring hero clarity, CTA visibility, social proof…',
      summarySuffix: 'overall conversion',
    }
  );

  // ============================================
  // Revenue Lift Calculator
  // 3 sliders × 3 scenarios + lift readout. Live update on input.
  // ============================================
  const sliderVisitors = document.getElementById('slider-visitors');
  const sliderRate     = document.getElementById('slider-rate');
  const sliderValue    = document.getElementById('slider-value');
  if (sliderVisitors && sliderRate && sliderValue) {
    const outVisitors = document.getElementById('out-visitors');
    const outRate     = document.getElementById('out-rate');
    const outValue    = document.getElementById('out-value');
    const revToday    = document.getElementById('rev-today');
    const revIndustry = document.getElementById('rev-industry');
    const revMine     = document.getElementById('rev-mine');
    const revLift     = document.getElementById('rev-lift');
    const revLiftYr   = document.getElementById('rev-lift-yr');

    const INDUSTRY_RATE = 0.025;   // industry-avg conversion ~2.5%
    const MINE_RATE_TARGET = 0.05; // built-by-me target ~5%
    const MINE_MULTIPLIER  = 1.8;  // floor: at least 1.8× current rate

    const fmtCurrency = (n) => '$' + Math.round(n).toLocaleString('en-US');
    const fmtVisitors = (n) => n >= 1000
      ? (n % 1000 === 0 ? (n / 1000) + 'K' : (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K')
      : n.toLocaleString('en-US');

    // Tint slider track to match thumb position via background-image
    const tintSlider = (input) => {
      const min = parseFloat(input.min);
      const max = parseFloat(input.max);
      const v = parseFloat(input.value);
      const pct = ((v - min) / (max - min)) * 100;
      input.style.background = `linear-gradient(90deg, var(--accent) 0%, var(--accent) ${pct}%, var(--border-subtle) ${pct}%, var(--border-subtle) 100%)`;
    };

    const compute = () => {
      const visitors = parseInt(sliderVisitors.value, 10);
      const rate     = parseFloat(sliderRate.value) / 100;
      const value    = parseInt(sliderValue.value, 10);

      outVisitors.textContent = fmtVisitors(visitors);
      outRate.textContent     = (rate * 100).toFixed(1) + '%';
      outValue.textContent    = fmtCurrency(value);

      const today    = visitors * rate * value;
      const industry = visitors * Math.max(rate, INDUSTRY_RATE) * value;
      const mineRate = Math.min(Math.max(rate * MINE_MULTIPLIER, MINE_RATE_TARGET), 0.08); // cap at 8%
      const mine     = visitors * mineRate * value;

      revToday.textContent    = fmtCurrency(today)    + '/mo';
      revIndustry.textContent = fmtCurrency(industry) + '/mo';
      revMine.textContent     = fmtCurrency(mine)     + '/mo';

      const lift = Math.max(0, mine - today);
      revLift.textContent    = '+' + fmtCurrency(lift);
      revLiftYr.textContent  = '+' + fmtCurrency(lift * 12);

      tintSlider(sliderVisitors);
      tintSlider(sliderRate);
      tintSlider(sliderValue);
    };

    [sliderVisitors, sliderRate, sliderValue].forEach(el => {
      el.addEventListener('input', compute);
    });
    compute();
  }

  // ============================================
  // FAQ accordion — single-open behavior
  // When one item opens, close any other open siblings.
  // ============================================
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length) {
    faqItems.forEach(item => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;
        faqItems.forEach(other => {
          if (other !== item && other.open) other.open = false;
        });
      });
    });
  }

  // ============================================
  // Demo tabs — toggle panels
  // ============================================
  const demoTabs = document.querySelectorAll('.demo-tab[data-demo]');
  const demoPanels = document.querySelectorAll('.demo-panel[data-panel]');
  if (demoTabs.length && demoPanels.length) {
    demoTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.demo;
        demoTabs.forEach(t => {
          const active = t === tab;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', String(active));
        });
        demoPanels.forEach(p => {
          const active = p.dataset.panel === target;
          p.classList.toggle('is-active', active);
          p.hidden = !active;
        });
      });
    });
  }

  // ============================================
  // Multi-agent visualizer — About section
  // 4 nodes cycle on a 900ms-per-step beat (3.6s full loop).
  // Hover/focus peeks into a node (pauses cycle); release resumes.
  // Pause/Replay buttons give explicit control.
  // ============================================
  const flow = document.querySelector('.agent-flow');
  if (flow) {
    const nodes      = Array.from(flow.querySelectorAll('.agent-node'));
    const connectors = Array.from(flow.querySelectorAll('.agent-connector'));
    const detail     = flow.querySelector('.agent-flow-detail');
    const detailTitle = detail.querySelector('.agent-flow-detail-title');
    const detailBody  = detail.querySelector('.agent-flow-detail-body');
    const pauseBtn   = flow.querySelector('[data-action="pause"]');
    const replayBtn  = flow.querySelector('[data-action="replay"]');
    const pauseLabel = pauseBtn.querySelector('.agent-flow-btn-label');
    const pauseIcon  = pauseBtn.querySelector('.agent-flow-btn-icon');

    const stepData = [
      { title: 'Opus 4.7 · diagnostic',  body: 'Root cause analysis. High-stakes decisions. Reads code, identifies architectural issues, proposes plan.' },
      { title: 'Sonnet 4.6 · executor',  body: 'Plan execution. Multi-file edits, script generation, batch operations. Validated by Opus.' },
      { title: 'Verification',           body: 'Live site audit. curl checks, schema validation, redirect testing. Catches regressions before commit.' },
      { title: 'Human approval',         body: 'Final review. Diff inspection, visual check, explicit OK before git push. No autonomous commits.' },
    ];

    const STEP_MS = 900;       // 4 × 900 = 3.6s full cycle
    const PEEK_HOLD_MS = 2500; // touch peek auto-resume

    let step = 0;
    let paused = false;
    let peeking = false;
    let timer = null;
    let peekTimer = null;

    const setActive = (i, { animateConnector = true } = {}) => {
      step = i;
      flow.dataset.active = String(i);

      nodes.forEach((n, idx) => n.classList.toggle('is-active', idx === i));

      // Connector animation: the segment that LEADS INTO node i
      // i=0 → connector 3 (the loop-back) · i=1 → connector 0 · etc.
      if (animateConnector) {
        const incomingIdx = (i - 1 + connectors.length + 1) % (connectors.length + 1);
        // connectors are 3 segments between 4 nodes; for i=0 we don't flow
        // (no visual loop-back arc to avoid clutter)
        connectors.forEach(c => c.classList.remove('is-flowing'));
        if (i > 0) {
          const seg = connectors[i - 1];
          if (seg) {
            // restart animation by forcing reflow
            void seg.offsetWidth;
            seg.classList.add('is-flowing');
          }
        }
      }

      detailTitle.textContent = stepData[i].title;
      detailBody.textContent  = stepData[i].body;
    };

    const tick = () => {
      if (paused || peeking) return;
      const next = (step + 1) % nodes.length;
      setActive(next);
      timer = setTimeout(tick, STEP_MS);
    };

    const start = () => {
      clearTimeout(timer);
      if (paused || peeking) return;
      timer = setTimeout(tick, STEP_MS);
    };

    const stop = () => { clearTimeout(timer); timer = null; };

    const togglePause = (forceState) => {
      paused = typeof forceState === 'boolean' ? forceState : !paused;
      pauseBtn.setAttribute('aria-pressed', String(paused));
      pauseLabel.textContent = paused ? 'Play' : 'Pause';
      // Swap icon: pause bars ⇄ play triangle
      pauseIcon.innerHTML = paused
        ? '<path d="m4 3 9 5-9 5z"/>'
        : '<path d="M4 3v10M10 3v10"/>';
      if (paused) stop();
      else start();
    };

    pauseBtn.addEventListener('click', () => togglePause());

    replayBtn.addEventListener('click', () => {
      stop();
      if (paused) togglePause(false); // unpause if needed
      setActive(0, { animateConnector: false });
      start();
    });

    // Hover/focus peek: pause cycle on the targeted node, resume on leave
    nodes.forEach((node, idx) => {
      const onEnter = () => {
        if (paused) return;
        peeking = true;
        stop();
        setActive(idx);
      };
      const onLeave = () => {
        if (paused) return;
        peeking = false;
        start();
      };
      node.addEventListener('mouseenter', onEnter);
      node.addEventListener('mouseleave', onLeave);
      node.addEventListener('focus', onEnter);
      node.addEventListener('blur', onLeave);
      // Touch / click: peek for PEEK_HOLD_MS then resume
      node.addEventListener('click', () => {
        if (paused) { setActive(idx); return; }
        peeking = true;
        stop();
        setActive(idx);
        clearTimeout(peekTimer);
        peekTimer = setTimeout(() => {
          peeking = false;
          start();
        }, PEEK_HOLD_MS);
      });
      // Keyboard activation
      node.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          node.click();
        }
      });
    });

    // Kickoff
    setActive(0, { animateConnector: false });
    if (reducedMotion) {
      // No auto-cycle. Static state showing Opus, user can click nodes.
      togglePause(true);
    } else {
      // Start when in viewport so we don't burn cycles before scroll
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !paused && !peeking) {
              start();
              io.unobserve(flow);
            }
          });
        }, { threshold: 0.25 });
        io.observe(flow);
      } else {
        start();
      }
    }
  }
})();
