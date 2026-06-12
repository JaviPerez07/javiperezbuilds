/* ============================================================================
   Contador de ventas fundador — ÚNICA FUENTE DE VERDAD.

   Para actualizar el número edita SOLO la línea de SALES_REMAINING de abajo.
   Este script propaga el valor a todos los elementos con clase
   .founder-counter (formato largo por defecto; data-format="short" para la
   versión corta de botones / link-in-bio).

   Nota: los .founder-counter del HTML llevan un texto estático de respaldo
   (solo visible sin JavaScript); este script lo sobrescribe en cada carga.
   ============================================================================ */
/* Global = mínimo de los packs (lo usan los contadores genéricos sin data-remaining).
   Por pack: los .founder-counter llevan data-remaining en su HTML —
   trading (El Polígrafo) = 3 · web (Pack Web Forense) = 2.
   [JAVI: confirma estos números contra tu Stripe real antes del deploy] */
var SALES_REMAINING = 2;
var FOUNDER_TOTAL = 50;

(function () {
  'use strict';

  /* --- Estado post-fundador ------------------------------------------------
     Cuando SALES_REMAINING llegue a 0 se muestra automáticamente este texto
     (nada queda roto). TODO [JAVI]: al agotar, añade el precio nuevo, p. ej.:
       var SOLD_OUT_LONG  = 'Precio fundador agotado. Precio actual: XX,XX€.';
       var SOLD_OUT_SHORT = 'Precio fundador agotado · precio actual XX,XX€';
  ------------------------------------------------------------------------- */
  var SOLD_OUT_LONG = 'Precio fundador agotado.';
  var SOLD_OUT_SHORT = 'Precio fundador agotado';

  function textFor(format, remaining, total) {
    if (remaining <= 0) {
      return format === 'short' ? SOLD_OUT_SHORT : SOLD_OUT_LONG;
    }
    return format === 'short'
      ? 'Precio fundador · quedan ' + remaining + ' de ' + total
      : 'Precio fundador: quedan ' + remaining + ' de ' + total + '. Después sube.';
  }

  /* Override por elemento: data-remaining / data-total permiten que cada pack
     muestre su propio contador sin romper la fuente de verdad global. */
  function intAttr(el, name, fallback) {
    var raw = el.getAttribute(name);
    if (raw === null || raw === '') return fallback;
    var n = parseInt(raw, 10);
    return isNaN(n) ? fallback : n;
  }

  function render() {
    var els = document.querySelectorAll('.founder-counter');
    for (var i = 0; i < els.length; i++) {
      var remaining = intAttr(els[i], 'data-remaining', SALES_REMAINING);
      var total = intAttr(els[i], 'data-total', FOUNDER_TOTAL);
      els[i].textContent = textFor(els[i].getAttribute('data-format') || 'long', remaining, total);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
