const MAX_BODY_BYTES = 24 * 1024;
const BREVO_EMAIL_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_CONTACT_URL = 'https://api.brevo.com/v3/contacts';

const FIELD_RULES = {
  name: { max: 120, required: true },
  company: { max: 160, required: true },
  city: { max: 120, required: true },
  sector: { max: 120, required: true },
  website_url: { max: 500, required: true },
  has_active_ad: { max: 10, required: true },
  ad_description: { max: 600, required: false },
  channel: { max: 80, required: true },
  monthly_ad_spend: { max: 50, required: true },
  valid_lead_definition: { max: 1000, required: true },
  contact_whatsapp_email: { max: 320, required: true },
  utm_source: { max: 200, required: false },
  utm_medium: { max: 200, required: false },
  utm_campaign: { max: 200, required: false },
  utm_term: { max: 200, required: false },
  utm_content: { max: 200, required: false },
  source_url: { max: 800, required: true }
};

function jsonResponse(status, payload, headers) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: Object.assign({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }, headers || {})
  });
}

function isAllowedHostname(hostname) {
  var host = String(hostname || '').toLowerCase();
  return host === 'javiperezbuilds.com' ||
    host === 'www.javiperezbuilds.com' ||
    host === 'javiperezbuilds.pages.dev' ||
    host.endsWith('.javiperezbuilds.pages.dev');
}

function isAllowedOrigin(origin) {
  try {
    var url = new URL(origin);
    return url.protocol === 'https:' && isAllowedHostname(url.hostname) && url.port === '';
  } catch (error) {
    return false;
  }
}

function isHoneypotFilled(value) {
  return !(value === undefined || value === null || value === false || value === '' || value === 0 || value === '0' || value === 'false');
}

function cleanFields(input) {
  var data = {};
  var keys = Object.keys(FIELD_RULES);
  for (var index = 0; index < keys.length; index += 1) {
    var key = keys[index];
    var rule = FIELD_RULES[key];
    var raw = input[key];
    if (raw === undefined || raw === null) raw = '';
    if (typeof raw !== 'string' && typeof raw !== 'number' && typeof raw !== 'boolean') return null;
    var value = String(raw).trim();
    if (rule.required && !value) return null;
    if (value.length > rule.max) return null;
    data[key] = value;
  }
  return data;
}

function isHttpUrl(value) {
  try {
    var url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && !!url.hostname;
  } catch (error) {
    return false;
  }
}

function isAllowedSource(value) {
  try {
    var url = new URL(value);
    var allowedPath = url.pathname === '/auditoria' || url.pathname === '/auditoria/' || url.pathname === '/auditoria.html';
    return url.protocol === 'https:' && isAllowedHostname(url.hostname) && url.port === '' && allowedPath;
  } catch (error) {
    return false;
  }
}

function hasAllowedSelections(data) {
  return ['Sí', 'No'].includes(data.has_active_ad) &&
    ['Meta', 'Google', 'Otro', 'Ninguno'].includes(data.channel) &&
    ['0€', '<300€', '300–1000€', '>1000€'].includes(data.monthly_ad_spend);
}

function isEmail(value) {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function extractEmail(value) {
  var match = String(value || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match && isEmail(match[0]) ? match[0] : '';
}

function escapeHtml(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function subjectValue(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
}

function tableRow(label, value) {
  var visibleValue = value || '—';
  return '<tr><th style="padding:8px 12px;text-align:left;vertical-align:top;border-bottom:1px solid #dfe5e1">' + escapeHtml(label) + '</th>' +
    '<td style="padding:8px 12px;vertical-align:top;border-bottom:1px solid #dfe5e1;white-space:pre-wrap">' + escapeHtml(visibleValue) + '</td></tr>';
}

function buildEmail(data, requestId, receivedAt) {
  var rows = [
    ['Nombre', data.name],
    ['Empresa', data.company],
    ['Ciudad', data.city],
    ['Sector', data.sector],
    ['Web', data.website_url],
    ['Anuncio activo', data.has_active_ad],
    ['Descripción', data.ad_description],
    ['Canal', data.channel],
    ['Inversión aproximada', data.monthly_ad_spend],
    ['Definición de lead válido', data.valid_lead_definition],
    ['Contacto', data.contact_whatsapp_email],
    ['UTM source', data.utm_source],
    ['UTM medium', data.utm_medium],
    ['UTM campaign', data.utm_campaign],
    ['UTM term', data.utm_term],
    ['UTM content', data.utm_content],
    ['Fecha UTC', receivedAt],
    ['URL de origen', data.source_url],
    ['Request ID', requestId]
  ];
  var htmlRows = rows.map(function (row) { return tableRow(row[0], row[1]); }).join('');
  var textRows = rows.map(function (row) { return row[0] + ': ' + (row[1] || '—'); }).join('\n');
  return {
    html: '<!doctype html><html><body style="font-family:Arial,sans-serif;color:#16211d">' +
      '<h1 style="font-size:22px">Nueva solicitud de auditoría</h1>' +
      '<table style="width:100%;border-collapse:collapse">' + htmlRows + '</table>' +
      '</body></html>',
    text: 'Nueva solicitud de auditoría\n\n' + textRows
  };
}

function validatedEnvironment(env) {
  var values = {
    apiKey: typeof env.BREVO_API_KEY === 'string' ? env.BREVO_API_KEY.trim() : '',
    notifyEmail: typeof env.AUDIT_NOTIFY_EMAIL === 'string' ? env.AUDIT_NOTIFY_EMAIL.trim() : '',
    fromEmail: typeof env.AUDIT_FROM_EMAIL === 'string' ? env.AUDIT_FROM_EMAIL.trim() : '',
    fromName: typeof env.AUDIT_FROM_NAME === 'string' ? env.AUDIT_FROM_NAME.trim() : ''
  };
  if (!values.apiKey || !isEmail(values.notifyEmail) || !isEmail(values.fromEmail) || !values.fromName || values.fromName.length > 100) return null;
  return values;
}

async function brevoFetch(url, init) {
  var controller = new AbortController();
  var timer = setTimeout(function () { controller.abort(); }, 10000);
  try {
    return await fetch(url, Object.assign({}, init, { signal: controller.signal }));
  } finally {
    clearTimeout(timer);
  }
}

async function addContact(env, email) {
  var rawListId = String(env.BREVO_LIST_ID_AUDIT || '').trim();
  var listId = /^\d+$/.test(rawListId) ? Number(rawListId) : 0;
  if (!email || !Number.isSafeInteger(listId) || listId <= 0) return;
  await brevoFetch(BREVO_CONTACT_URL, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'api-key': env.BREVO_API_KEY },
    body: JSON.stringify({ email, listIds: [listId], updateEnabled: true })
  });
}

export async function onRequest(context) {
  var request = context.request;
  if (request.method !== 'POST') {
    return jsonResponse(405, { success: false, message: 'Method not allowed.' }, { Allow: 'POST' });
  }

  var origin = request.headers.get('Origin');
  if (!origin || !isAllowedOrigin(origin)) {
    return jsonResponse(403, { success: false, message: 'Request not allowed.' });
  }
  var contentType = (request.headers.get('Content-Type') || '').split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    return jsonResponse(415, { success: false, message: 'Invalid request.' });
  }

  var declaredLength = Number.parseInt(request.headers.get('Content-Length') || '0', 10);
  if (declaredLength > MAX_BODY_BYTES) return jsonResponse(413, { success: false, message: 'Invalid request.' });

  var rawBody;
  try {
    rawBody = await request.text();
  } catch (error) {
    return jsonResponse(400, { success: false, message: 'Invalid request.' });
  }
  if (!rawBody || rawBody.length > MAX_BODY_BYTES) return jsonResponse(413, { success: false, message: 'Invalid request.' });

  var input;
  try {
    input = JSON.parse(rawBody);
  } catch (error) {
    return jsonResponse(400, { success: false, message: 'Invalid request.' });
  }
  if (!input || typeof input !== 'object' || Array.isArray(input) || isHoneypotFilled(input.botcheck)) {
    return jsonResponse(400, { success: false, message: 'Invalid request.' });
  }

  var data = cleanFields(input);
  if (!data || !isHttpUrl(data.website_url) || !isAllowedSource(data.source_url) || !hasAllowedSelections(data)) {
    return jsonResponse(400, { success: false, message: 'Invalid request.' });
  }

  var environment = validatedEnvironment(context.env || {});
  if (!environment) return jsonResponse(500, { success: false, message: 'Notification service unavailable.' });

  var requestId = crypto.randomUUID();
  var receivedAt = new Date().toISOString();
  var content = buildEmail(data, requestId, receivedAt);
  var contactEmail = extractEmail(data.contact_whatsapp_email);
  var recipientLabel = subjectValue(data.company || data.name) || 'sin empresa';
  var emailPayload = {
    sender: { email: environment.fromEmail, name: environment.fromName },
    to: [{ email: environment.notifyEmail }],
    subject: 'Nueva solicitud de auditoría — ' + recipientLabel,
    htmlContent: content.html,
    textContent: content.text,
    tags: ['audit-request'],
    headers: { 'X-Audit-Request-Id': requestId }
  };
  if (contactEmail) emailPayload.replyTo = { email: contactEmail, name: subjectValue(data.name) };

  try {
    var brevoResponse = await brevoFetch(BREVO_EMAIL_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'api-key': environment.apiKey },
      body: JSON.stringify(emailPayload)
    });
    if (brevoResponse.status !== 201) {
      return jsonResponse(502, { success: false, message: 'Notification could not be delivered.' });
    }
  } catch (error) {
    return jsonResponse(502, { success: false, message: 'Notification could not be delivered.' });
  }

  if (contactEmail && context.env.BREVO_LIST_ID_AUDIT) {
    var contactPromise = addContact(context.env, contactEmail).catch(function () {});
    if (typeof context.waitUntil === 'function') context.waitUntil(contactPromise);
    else await contactPromise;
  }

  return jsonResponse(200, { success: true, request_id: requestId });
}
