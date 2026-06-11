/* ============================================================
   Hero terminal — /javiperez-webblood demo (vanilla, ~5KB)
   Types the command, streams real-looking report lines with
   severity coloring, counts the score up, pauses, loops.
   prefers-reduced-motion → fully static render, no timers.
   ============================================================ */
(function () {
  'use strict';

  const term = document.getElementById('wb-term');
  const cmdEl = document.getElementById('wb-cmd');
  const outEl = document.getElementById('wb-out');
  const caret = document.getElementById('wb-caret');
  if (!term || !cmdEl || !outEl) return;

  const CMD = '/javiperez-webblood https://cliente-ejemplo.es';

  // Report lines. sev: crit | warn | pass | info | route. score: count-up target.
  const LINES = [
    { sev: 'info',  text: '▸ Analizando 5 páginas · robots.txt OK · 8 módulos' },
    { sev: 'crit',  tag: 'CRÍTICO', text: 'SEO Local — falta schema LocalBusiness', conf: 'MEDIDO' },
    { sev: 'crit',  tag: 'CRÍTICO', text: 'Velocidad — hero 2,4 MB sin lazy-load', conf: 'MEDIDO' },
    { sev: 'warn',  tag: 'AVISO',   text: 'Confianza — cero reseñas visibles', conf: 'INFERIDO' },
    { sev: 'warn',  tag: 'AVISO',   text: 'CRO — teléfono no clicable en móvil', conf: 'MEDIDO' },
    { sev: 'pass',  tag: 'OK',      text: 'Móvil — viewport y tap targets correctos', conf: 'MEDIDO' },
    { sev: 'score', text: 'Score global: ', score: 61, suffix: '/100 · plan de tratamiento listo' },
    { sev: 'route', text: '→ /javiperez-seolocal · /javiperez-speed · /javiperez-reviews' },
  ];

  function buildLine(l) {
    const div = document.createElement('div');
    div.className = 'term-line term-line--' + l.sev;
    if (l.tag) {
      const b = document.createElement('span');
      b.className = 'term-badge term-badge--' + l.sev;
      b.textContent = l.tag;
      div.appendChild(b);
    }
    const t = document.createElement('span');
    t.textContent = l.text + (l.sev === 'score' ? '' : '');
    div.appendChild(t);
    if (l.sev === 'score') {
      const n = document.createElement('span');
      n.className = 'term-score';
      n.textContent = l.score;
      div.appendChild(n);
      const s = document.createElement('span');
      s.textContent = l.suffix;
      div.appendChild(s);
      div._scoreEl = n;
    }
    if (l.conf) {
      const c = document.createElement('span');
      c.className = 'term-conf';
      c.textContent = '[' + l.conf + ']';
      div.appendChild(c);
    }
    return div;
  }

  // Static render (reduced motion or no-JS-timers contexts)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    cmdEl.textContent = CMD;
    if (caret) caret.style.display = 'none';
    LINES.forEach((l) => outEl.appendChild(buildLine(l)));
    return;
  }

  // Animated loop
  let timer = null;
  let running = false;

  function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }

  function typeCmd(i, done) {
    cmdEl.textContent = CMD.slice(0, i);
    if (i >= CMD.length) { timer = setTimeout(done, 450); return; }
    timer = setTimeout(() => typeCmd(i + (CMD[i] === '/' ? 1 : 1), done), 28 + Math.random() * 40);
  }

  function countUp(el, target, done) {
    const t0 = performance.now();
    const DUR = 900;
    function frame(now) {
      const p = Math.min(1, (now - t0) / DUR);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) { requestAnimationFrame(frame); } else { done(); }
    }
    requestAnimationFrame(frame);
  }

  function streamLines(idx, done) {
    if (idx >= LINES.length) { done(); return; }
    const l = LINES[idx];
    const node = buildLine(l);
    if (l.sev === 'score') node._scoreEl.textContent = '0';
    outEl.appendChild(node);
    if (l.sev === 'score') {
      countUp(node._scoreEl, l.score, () => { timer = setTimeout(() => streamLines(idx + 1, done), 300); });
    } else {
      timer = setTimeout(() => streamLines(idx + 1, done), l.sev === 'info' ? 650 : 420);
    }
  }

  function cycle() {
    cmdEl.textContent = '';
    outEl.textContent = '';
    if (caret) caret.style.display = '';
    typeCmd(0, () => {
      if (caret) caret.style.display = 'none';
      streamLines(0, () => {
        timer = setTimeout(cycle, 4500); // pause, then loop
      });
    });
  }

  // Start only when visible; pause when tab hidden / scrolled away.
  function start() { if (!running) { running = true; cycle(); } }
  function stop() { running = false; clearTimer(); }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { e.isIntersecting ? start() : stop(); });
    }, { threshold: 0.2 });
    io.observe(term);
  } else {
    start();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (term.getBoundingClientRect().top < window.innerHeight) start();
  });
})();
