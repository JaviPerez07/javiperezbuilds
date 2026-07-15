/* ============================================================
   config.js — CONFIG central de javiperezbuilds.com
   Fuente única de verdad para contacto, formulario y tracking.
   Se carga en index.html, auditoria.html y agentes.html.
   ------------------------------------------------------------
   EDITA SÓLO ESTAS CONSTANTES:
   ============================================================ */
window.JP_CONFIG = {
  WHATSAPP_NUMBER: "34644289776",
  CONTACT_EMAIL: "javiperezguides@gmail.com",
  WEB3FORMS_ACCESS_KEY: "ac4cecc6-fe8c-4ff4-8292-a13cb0dd37e8",
  /* Pon esto en true SOLO cuando exista el primer resultado de cliente real
     (ver plantilla #tpl-casos-clientes en index.html) — nunca antes. */
  SHOW_CLIENT_RESULTS: false
};

(function () {
  "use strict";

  /* ---- UTM: captura al aterrizar y persiste (localStorage) durante toda la sesión ---- */
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  var STORAGE_KEY = "jp_utms";

  function captureUtms() {
    try {
      var params = new URLSearchParams(window.location.search);
      var found = {};
      var any = false;
      UTM_KEYS.forEach(function (k) {
        var v = params.get(k);
        if (v) { found[k] = v; any = true; }
      });
      if (any) localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    } catch (e) { /* localStorage puede fallar en modo privado: degradamos sin romper */ }
  }

  function getUtms() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  captureUtms();
  window.JP_GET_UTMS = getUtms;

  /* ---- Tracking: stub centralizado. Hoy = consola (solo en debug) + dataLayer si existe.
     Cuando Javi conecte un pixel/analytics real, se sustituye SOLO el cuerpo de esta
     función — el resto del sitio ya llama a JP_TRACK(evento, datos) y no cambia. ---- */
  window.JP_TRACK = function (eventName, data) {
    var payload = Object.assign({}, data || {}, getUtms());
    try {
      if (window.dataLayer && typeof window.dataLayer.push === "function") {
        window.dataLayer.push(Object.assign({ event: eventName }, payload));
      }
      var debug = window.location.hostname === "localhost" ||
                  window.location.hostname === "127.0.0.1" ||
                  window.location.search.indexOf("debug_track") !== -1;
      if (debug) console.debug("[JP_TRACK]", eventName, payload);
    } catch (e) { /* el tracking nunca debe romper la página */ }
  };

  /* ---- Clic a WhatsApp: centraliza el número (igual que antes) + trackea cada clic ---- */
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.setAttribute("href", "https://wa.me/" + window.JP_CONFIG.WHATSAPP_NUMBER +
      (a.getAttribute("data-wa-text") ? "?text=" + encodeURIComponent(a.getAttribute("data-wa-text")) : ""));
  });
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest && ev.target.closest("a[data-wa]");
    if (a) window.JP_TRACK("whatsapp_click", { href: a.getAttribute("href") || "" });
  }, true);

  /* ---- Clic genérico marcado con data-track="nombre_evento" (CTAs, nav, etc.) ---- */
  document.addEventListener("click", function (ev) {
    var el = ev.target.closest && ev.target.closest("[data-track]");
    if (el) window.JP_TRACK(el.getAttribute("data-track"));
  }, true);

  /* ---- Email anti-spam: se ensambla en cliente desde data-email-* (igual que antes en home.js) ---- */
  var em = document.getElementById("email-link");
  if (em) {
    var u = em.getAttribute("data-email-user"), dom_ = em.getAttribute("data-email-domain");
    if (u && dom_) {
      var addr = u + "@" + dom_;
      em.setAttribute("href", "mailto:" + addr);
      em.textContent = addr;
    }
  }
})();
