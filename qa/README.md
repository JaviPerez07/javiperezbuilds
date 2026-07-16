# QA — Operator Atelier

Revisión local realizada el 15 de julio de 2026.

## Cobertura

- Rutas: home, auditoría, links, hub de agentes, agente web, agente trading y legal.
- Viewports responsive: 360, 390 y 430 px; escritorio: 1440 px.
- Sin desbordes horizontales en las siete rutas.
- Selector ES/EN funcional en home.
- Formulario: clave Web3Forms hidratada, UTMs persistidas y validación nativa comprobada sin enviar datos.
- Stripe: 28 URLs comparadas con la rama base, sin cambios. No se realizó ninguna compra.
- Consola: sin errores ni avisos en las siete rutas durante el recorrido local.

## Capturas

Las capturas de escritorio y móvil están guardadas en esta carpeta con el patrón `pagina-dispositivo-ancho.png`.

La pasada final del hero añade cuatro comprobaciones específicas: `hero-final-1440.png`, `hero-final-390.png`, `panel-final-1440.png` y `panel-final-390.png`.

## Revisión del 16 de julio de 2026 — /auditoria como router de dos diagnósticos

- `/auditoria` pasa de formulario único a selector visual con dos tarjetas (Funnel / Visibilidad IA).
- Rutas nuevas: `/auditoria/funnel` (formulario existente, adaptado con `audit_type`, `referrer` y `landing_path` ocultos) y `/auditoria/visibilidad-ia` (formulario nuevo).
- Viewports: 390 px (móvil) y 1440 px (escritorio) en las tres rutas.
- Sin desbordes horizontales, sin errores de consola.
- Eventos de tracking verificados en consola: `audit_selector_view`, `funnel_audit_selected`, `ai_visibility_audit_selected`, `funnel_audit_submitted`, `ai_visibility_audit_submitted`.
- Ambos formularios: honeypot comprobado (no envía), validación nativa bloquea envío incompleto, envío real contra Web3Forms comprobado en los dos (clave ya activa desde el hotfix anterior) — ver los dos leads de test marcados "TEST VERIFICACIÓN" en el dashboard de Web3Forms.
- Capturas: no se guardaron PNG en esta carpeta en esta pasada (la herramienta de navegador usada no tiene un paso de guardado a disco) — la verificación visual queda en las capturas incluidas en el informe de entrega de esta rama, no como archivos aquí.
