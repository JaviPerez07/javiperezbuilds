/* ============================================================
   home.js — lógica de la home de javiperezbuilds.com
   ------------------------------------------------------------
   EDITA SÓLO ESTAS CONSTANTES (lo demás funciona solo):
   ============================================================ */
const VIDEO_URL      = "assets/web-animada.mp4";          /* grabación del Mustang, ya comprimida (480p, 2.3 MB, faststart, sin audio).
                                                              Para cambiarla: comprime con avconvert/ffmpeg a <4 MB y reemplaza el archivo. */
const VIDEO_POSTER   = "assets/web-animada-poster.jpg";   /* primer frame (poster mientras carga el vídeo). */
const OFFER_DEADLINE = "2026-07-15T23:59:59";             /* fin de la oferta de lanzamiento. ÚNICA fuente de verdad de la fecha. */
const BUILDERS_COUNT = 40;                                /* prueba social "+N builders ya los usan". Pon 0 para ocultarla.
                                                              (Si no la puedes respaldar con datos, déjala en 0 — regla anti-humo.) */
const WHATSAPP       = "https://wa.me/34644289776";
/* ============================================================ */

(function () {
  "use strict";

  var MONTHS = ["enero","febrero","marzo","abril","mayo","junio","julio",
                "agosto","septiembre","octubre","noviembre","diciembre"];
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- 1. WhatsApp centralizado (href ya viene en el HTML como fallback) ---- */
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    if (WHATSAPP) a.setAttribute("href", WHATSAPP);
  });

  /* ---- 1b. Email anti-spam: se ensambla en cliente desde data-email-* ---- */
  var em = document.getElementById("email-link");
  if (em) {
    var u = em.getAttribute("data-email-user"), dom_ = em.getAttribute("data-email-domain");
    if (u && dom_) {
      var addr = u + "@" + dom_;
      em.setAttribute("href", "mailto:" + addr);
      em.textContent = addr;
    }
  }

  /* ---- 2. Prueba social: SÓLO se inyecta si hay un nº verificado (>0). ---- */
  var proofLine = document.getElementById("proof-line");
  if (proofLine && BUILDERS_COUNT <= 0) {
    proofLine.textContent = ""; /* el constante manda: 0 oculta la afirmación aunque el HTML traiga el fallback */
  } else if (proofLine && BUILDERS_COUNT > 0) {
    if (reduceMotion) {
      proofLine.textContent = " · +" + BUILDERS_COUNT + " builders ya los usan";
    } else {
      var target = BUILDERS_COUNT, dur = 1300, t0 = performance.now();
      (function tick(t) {
        var p = Math.min(1, (t - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        proofLine.textContent = " · +" + Math.round(eased * target) + " builders ya los usan";
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }
  }

  /* ---- 3. Cuenta atrás real a fecha fija (no se rompe si la fecha pasa) ---- */
  var dl  = new Date(OFFER_DEADLINE);
  function renderDeadline() {
    var dStr = document.getElementById("deadline-str");
    if (dStr && !isNaN(dl.getTime())) dStr.textContent = dl.getDate() + " de " + MONTHS[dl.getMonth()];
  }
  function renderCd() {
    var cd = document.getElementById("cd-text");
    if (!cd) return true;
    if (isNaN(dl.getTime())) { cd.textContent = ""; return true; }
    var diff = dl.getTime() - Date.now();
    if (diff <= 0) { cd.textContent = "Oferta finalizada"; return true; }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    cd.textContent = d + "d " + pad(h) + "h " + pad(m) + "m";
    return false;
  }
  renderDeadline();
  var cdEl = document.getElementById("cd-text");
  if (cdEl && !renderCd()) {
    var it = setInterval(function () { if (renderCd()) clearInterval(it); }, 1000);
  }
  /* i18n re-escribe el <h3> de la oferta al cambiar de idioma → reponemos la fecha/contador */
  document.addEventListener("langchange", function () { renderDeadline(); renderCd(); });

  /* ---- 4. Vídeo de fondo: carga diferida (lazy) y sólo si hay URL ---- */
  var v     = document.getElementById("hero-video");
  var badge = document.getElementById("video-badge");
  if (v && VIDEO_URL) {
    if (badge) badge.hidden = true;
    if (VIDEO_POSTER) v.setAttribute("poster", VIDEO_POSTER);
    var loadVid = function () {
      v.src = VIDEO_URL;
      v.load();
      var pr = v.play();
      if (pr && pr.catch) pr.catch(function () {});
    };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) { if (e.isIntersecting) { loadVid(); obs.disconnect(); } });
      }, { rootMargin: "400px" });
      io.observe(v);
    } else { loadVid(); }
  } else if (badge) {
    badge.hidden = false; /* sin VIDEO_URL: recordatorio visible, degradado de fondo */
  }

  /* ---- 5. Mini-terminales animadas (output REAL, efecto typing en bucle) ---- */
  var TERMINALS = {
    webblood: [
      { t: "$ /javiperez-webblood https://cliente-ejemplo.es", c: "cmd" },
      { t: "› Analizando 8 módulos...", c: "muted" },
      { t: "› SEO local: 41/100  ✕", c: "bad" },
      { t: "› Teléfono no pulsable en móvil  ✕", c: "bad" },
      { t: "› Sin schema LocalBusiness  ✕", c: "bad" },
      { t: "› Móvil: viewport correcto  ✓", c: "ok" },
      { t: "Veredicto: 3 fallos que cuestan clientes · plan de tratamiento listo", c: "verdict" }
    ],
    poligrafo: [
      { t: "$ /javiperez-curvefit backtest.htm", c: "cmd" },
      { t: "› Analizando robustez...", c: "muted" },
      { t: "› Overfitting detectado (PBO alto)  ✕", c: "bad" },
      { t: "› Dependencia de parámetros  ✕", c: "bad" },
      { t: "› Lo que SÍ está bien: gestión de riesgo  ✓", c: "ok" },
      { t: "Veredicto: backtest poco fiable · informe forense listo", c: "verdict" }
    ]
  };
  function esc(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  function runTerminal(termEl) {
    var lines = TERMINALS[termEl.getAttribute("data-term")];
    var body = termEl.querySelector(".term-body");
    if (!lines || !body) return;
    if (reduceMotion) {  /* accesibilidad: sin animación, texto completo */
      body.innerHTML = lines.map(function (l){ return '<span class="'+l.c+'">'+esc(l.t)+'</span>'; }).join("\n");
      return;
    }
    var li = 0, ci = 0;
    function frame() {
      var html = "";
      for (var i = 0; i < li; i++) html += '<span class="'+lines[i].c+'">'+esc(lines[i].t)+'</span>\n';
      if (li < lines.length) {
        html += '<span class="'+lines[li].c+'">'+esc(lines[li].t.slice(0, ci))+'</span><span class="term-cursor"></span>';
      }
      body.innerHTML = html;
      if (li < lines.length) {
        ci++;
        if (ci > lines[li].t.length) { li++; ci = 0; setTimeout(frame, 380); }
        else setTimeout(frame, 20);
      } else {
        setTimeout(function () { li = 0; ci = 0; frame(); }, 2800); /* bucle */
      }
    }
    frame();
  }
  var terms = document.querySelectorAll(".term");
  if (terms.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      var tio = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) { if (e.isIntersecting) { runTerminal(e.target); obs.unobserve(e.target); } });
      }, { rootMargin: "120px" });
      terms.forEach(function (t) { tio.observe(t); });
    } else {
      terms.forEach(runTerminal);
    }
  }
})();
