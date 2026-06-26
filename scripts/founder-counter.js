/* ============================================================================
   Precio fundador por FECHA — ÚNICA FUENTE DE VERDAD.

   Antes esto mostraba "quedan X de 50" (número a mano = falsa escasez). Ahora usa
   una FECHA real de fin de oferta, igual que la home (scripts/home.js OFFER_DEADLINE).
   Para cambiar la oferta edita SOLO la línea OFFER_DEADLINE de abajo.

   Propaga el texto a:
     · .founder-counter           (formato largo; data-format="short" para link-in-bio)
     · [data-offer-deadline]      (spans de agentes.html)
   Los elementos llevan texto estático de respaldo (sin JS); este script lo
   sobrescribe en cada carga. No se rompe si la fecha ya pasó.
   ============================================================================ */
var OFFER_DEADLINE = "2026-07-15T23:59:59"; /* = OFFER_DEADLINE de scripts/home.js — mantener en sync */

(function () {
  'use strict';

  var MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio',
                'agosto','septiembre','octubre','noviembre','diciembre'];
  var MONTHS_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

  var dl = new Date(OFFER_DEADLINE);
  var valid = !isNaN(dl.getTime());
  var active = valid && (dl.getTime() - Date.now() > 0);

  function textFor(format) {
    if (format === 'short') {
      return active
        ? 'Precio fundador · hasta ' + dl.getDate() + ' ' + MONTHS_SHORT[dl.getMonth()]
        : 'Precio fundador';
    }
    return active
      ? 'Precio fundador hasta el ' + dl.getDate() + ' de ' + MONTHS[dl.getMonth()] + '. Después sube.'
      : 'Precio fundador. Después sube.';
  }

  function render() {
    var els = document.querySelectorAll('.founder-counter, [data-offer-deadline]');
    for (var i = 0; i < els.length; i++) {
      els[i].textContent = textFor(els[i].getAttribute('data-format') || 'long');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
