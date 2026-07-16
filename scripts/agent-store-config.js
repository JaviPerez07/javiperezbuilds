/* ============================================================
   Configuración pública de la tienda de agentes.

   No guardar secretos aquí. Estas variables solo controlan URLs,
   precios y medios que ya pueden mostrarse públicamente.
   ============================================================ */
window.JP_AGENT_STORE_CONFIG = Object.freeze({
  NEXT_PUBLIC_LEAD_SCOUT_CHECKOUT_URL: "https://buy.stripe.com/fZu7sLf6bbHIasv7gH9fW0I",
  LEAD_SCOUT_PRICE: 3,
  LEAD_SCOUT_LAUNCH_PRICE: 3,
  LEAD_SCOUT_LAUNCH_ENDS_AT: "",
  LEAD_SCOUT_SETUP_URL: "/auditoria?service=lead-scout-setup",
  TELEGRAM_URL: "https://t.me/javiperezchallenger"
});

(function () {
  "use strict";

  var config = window.JP_AGENT_STORE_CONFIG;

  function validHttpsUrl(value) {
    try {
      var url = new URL(value);
      return url.protocol === "https:";
    } catch (error) {
      return false;
    }
  }

  function validInternalOrHttpsUrl(value) {
    return typeof value === "string" && (value.charAt(0) === "/" || validHttpsUrl(value));
  }

  function money(value) {
    var number = Number(value);
    return Number.isFinite(number)
      ? new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(number)
      : "";
  }

  function getPricing() {
    var normal = Number(config.LEAD_SCOUT_PRICE);
    var launch = Number(config.LEAD_SCOUT_LAUNCH_PRICE);
    var end = new Date(config.LEAD_SCOUT_LAUNCH_ENDS_AT);
    var hasValidEnd = Boolean(config.LEAD_SCOUT_LAUNCH_ENDS_AT) && !Number.isNaN(end.getTime());
    var launchActive = Number.isFinite(launch) && launch > 0 && (!hasValidEnd || end.getTime() > Date.now());

    return {
      current: launchActive ? launch : normal,
      normal: normal,
      launchActive: launchActive,
      launchEnd: hasValidEnd && launchActive ? end : null
    };
  }

  function hydratePricing() {
    var pricing = getPricing();
    document.querySelectorAll("[data-lead-price-current]").forEach(function (el) {
      el.textContent = money(pricing.current);
    });
    document.querySelectorAll("[data-lead-price-normal]").forEach(function (el) {
      el.textContent = money(pricing.normal);
      el.hidden = !pricing.launchActive || pricing.normal === pricing.current;
    });
    document.querySelectorAll("[data-lead-launch-label]").forEach(function (el) {
      if (!pricing.launchActive) {
        el.textContent = "Precio actual";
        return;
      }
      el.textContent = pricing.launchEnd
        ? "Precio de lanzamiento: " + money(pricing.current) + " hasta el " + new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(pricing.launchEnd)
        : "Precio de lanzamiento: " + money(pricing.current);
    });
  }

  function hydrateCheckout() {
    var enabled = validHttpsUrl(config.NEXT_PUBLIC_LEAD_SCOUT_CHECKOUT_URL);
    document.querySelectorAll("[data-lead-checkout]").forEach(function (link) {
      if (enabled) {
        link.href = config.NEXT_PUBLIC_LEAD_SCOUT_CHECKOUT_URL;
        link.removeAttribute("aria-disabled");
        link.removeAttribute("data-disabled");
        link.removeAttribute("target");
        link.removeAttribute("rel");
      }
    });
    document.querySelectorAll("[data-checkout-state]").forEach(function (el) {
      el.textContent = "Pago seguro con Stripe. Recibirás Lead Scout de forma privada en el email utilizado durante el pago.";
      el.dataset.state = "ready";
    });
  }

  function hydrateSetup() {
    document.querySelectorAll("[data-lead-setup]").forEach(function (link) {
      if (validInternalOrHttpsUrl(config.LEAD_SCOUT_SETUP_URL)) {
        link.href = config.LEAD_SCOUT_SETUP_URL;
        link.removeAttribute("aria-disabled");
      } else {
        link.removeAttribute("href");
        link.setAttribute("aria-disabled", "true");
      }
    });
  }

  function hydrateTelegram() {
    document.querySelectorAll("[data-agent-telegram]").forEach(function (link) {
      if (validHttpsUrl(config.TELEGRAM_URL)) link.href = config.TELEGRAM_URL;
    });
  }

  function setupMobileBuy() {
    var bar = document.querySelector(".as-mobile-buy");
    var pricePanel = document.querySelector(".as-price-panel");
    var footer = document.querySelector("footer");
    if (!bar || !pricePanel || !("IntersectionObserver" in window)) return;

    var pricePanelVisible = true;
    var footerVisible = false;

    function render() {
      document.body.classList.toggle("mobile-buy-visible", !pricePanelVisible);
      document.body.classList.toggle("mobile-buy-footer-visible", footerVisible);
    }

    document.body.classList.add("mobile-buy-ready");
    render();

    new IntersectionObserver(function (entries) {
      pricePanelVisible = entries[0].isIntersecting;
      render();
    }, { threshold: 0.05 }).observe(pricePanel);

    if (footer) {
      new IntersectionObserver(function (entries) {
        footerVisible = entries[0].isIntersecting;
        render();
      }, { threshold: 0.01 }).observe(footer);
    }
  }

  function track(eventName) {
    if (typeof window.JP_TRACK === "function") window.JP_TRACK(eventName, { product: "lead-scout" });
  }

  function setupTracking() {
    var viewEvent = document.body.getAttribute("data-agent-view-event");
    if (viewEvent) track(viewEvent);

    document.addEventListener("click", function (event) {
      var target = event.target.closest && event.target.closest("[data-agent-event]");
      if (!target) return;

      if (target.matches("[data-lead-checkout]")) {
        if (target.hasAttribute("data-checkout-started")) {
          event.preventDefault();
          return;
        }
        target.setAttribute("data-checkout-started", "true");
        target.setAttribute("aria-busy", "true");
        window.setTimeout(function () {
          target.removeAttribute("data-checkout-started");
          target.removeAttribute("aria-busy");
        }, 1600);
      }

      track(target.getAttribute("data-agent-event"));
    }, true);
  }

  hydratePricing();
  hydrateCheckout();
  hydrateSetup();
  hydrateTelegram();
  setupMobileBuy();
  setupTracking();
})();
