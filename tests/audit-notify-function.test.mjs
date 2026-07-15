import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { onRequest } from '../functions/api/audit-notify.js';

const originalFetch = globalThis.fetch;
after(() => { globalThis.fetch = originalFetch; });

const baseEnvironment = {
  BREVO_API_KEY: 'test-placeholder-key',
  AUDIT_NOTIFY_EMAIL: 'notifications@example.com',
  AUDIT_FROM_EMAIL: 'verified-sender@example.com',
  AUDIT_FROM_NAME: 'JaviPerezBuilds Auditorías'
};

function validPayload(overrides = {}) {
  return Object.assign({
    name: 'Ada Example',
    company: 'Example Studio',
    city: 'Almería',
    sector: 'Clínica dental',
    website_url: 'https://example.com/landing',
    has_active_ad: 'Sí',
    ad_description: 'Campaña de captación local',
    channel: 'Meta',
    monthly_ad_spend: '300–1000€',
    valid_lead_definition: 'Una persona que solicita una cita',
    contact_whatsapp_email: 'ada@example.com',
    utm_source: 'test',
    utm_medium: 'cpc',
    utm_campaign: 'audit',
    utm_term: '',
    utm_content: '',
    botcheck: false,
    source_url: 'https://javiperezbuilds.com/auditoria?utm_source=test'
  }, overrides);
}

async function invoke(payload, options = {}) {
  const pending = [];
  const method = options.method || 'POST';
  const headers = new Headers(options.headers || {});
  if (!headers.has('Origin')) headers.set('Origin', options.origin || 'https://javiperezbuilds.com');
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const requestOptions = { method, headers };
  if (method !== 'GET' && method !== 'HEAD') requestOptions.body = JSON.stringify(payload);
  globalThis.fetch = options.fetchImpl || (async () => new Response('{}', { status: 201 }));
  const response = await onRequest({
    request: new Request('https://javiperezbuilds.com/api/audit-notify', requestOptions),
    env: Object.assign({}, baseEnvironment, options.env || {}),
    waitUntil(promise) { pending.push(promise); }
  });
  await Promise.all(pending);
  return response;
}

test('Web3Forms success path can produce Brevo email and optional contact', { concurrency: false }, async () => {
  const calls = [];
  const response = await invoke(validPayload(), {
    env: { BREVO_LIST_ID_AUDIT: '42' },
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return new Response('{}', { status: 201 });
    }
  });
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.success, true);
  assert.match(result.request_id, /^[0-9a-f-]{36}$/i);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, 'https://api.brevo.com/v3/smtp/email');
  const email = JSON.parse(calls[0].init.body);
  assert.equal(email.subject, 'Nueva solicitud de auditoría — Example Studio');
  assert(email.htmlContent.includes(result.request_id));
  assert.equal(email.replyTo.email, 'ada@example.com');
  const contact = JSON.parse(calls[1].init.body);
  assert.deepEqual(contact, { email: 'ada@example.com', listIds: [42], updateEnabled: true });
});

test('Brevo error returns a generic failure without private response data', { concurrency: false }, async () => {
  const response = await invoke(validPayload(), {
    fetchImpl: async () => new Response(JSON.stringify({ private: 'provider detail' }), { status: 400 })
  });
  const body = await response.text();
  assert.equal(response.status, 502);
  assert(!body.includes('provider detail'));
  assert(!body.includes(baseEnvironment.BREVO_API_KEY));
  assert.deepEqual(JSON.parse(body), { success: false, message: 'Notification could not be delivered.' });
});

test('honeypot rejects the request before contacting Brevo', { concurrency: false }, async () => {
  let calls = 0;
  const response = await invoke(validPayload({ botcheck: 'on' }), {
    fetchImpl: async () => { calls += 1; return new Response('{}', { status: 201 }); }
  });
  assert.equal(response.status, 400);
  assert.equal(calls, 0);
});

test('incomplete payload is rejected before contacting Brevo', { concurrency: false }, async () => {
  let calls = 0;
  const response = await invoke(validPayload({ company: '' }), {
    fetchImpl: async () => { calls += 1; return new Response('{}', { status: 201 }); }
  });
  assert.equal(response.status, 400);
  assert.equal(calls, 0);
});

test('malicious HTML is escaped and header newlines are removed', { concurrency: false }, async () => {
  const calls = [];
  const response = await invoke(validPayload({
    company: 'Studio\r\nBcc: attacker@example.com',
    valid_lead_definition: '<script>alert("x")</script><img src=x onerror=alert(1)>'
  }), {
    fetchImpl: async (url, init) => { calls.push({ url, init }); return new Response('{}', { status: 201 }); }
  });
  assert.equal(response.status, 200);
  const email = JSON.parse(calls[0].init.body);
  assert(!email.subject.includes('\n'));
  assert(!email.subject.includes('\r'));
  assert(!email.htmlContent.includes('<script>'));
  assert(!email.htmlContent.includes('<img src=x'));
  assert(email.htmlContent.includes('&lt;script&gt;'));
  assert(email.htmlContent.includes('&lt;img src=x onerror=alert(1)&gt;'));
});

test('non-POST and untrusted origins are rejected', { concurrency: false }, async () => {
  const getResponse = await invoke(null, { method: 'GET' });
  assert.equal(getResponse.status, 405);
  assert.equal(getResponse.headers.get('Allow'), 'POST');
  const originResponse = await invoke(validPayload(), { origin: 'https://attacker.example' });
  assert.equal(originResponse.status, 403);
});

test('legitimate Cloudflare preview origin is accepted', { concurrency: false }, async () => {
  const previewOrigin = 'https://feature-branch.javiperezbuilds.pages.dev';
  const response = await invoke(validPayload({ source_url: previewOrigin + '/auditoria' }), {
    origin: previewOrigin,
    fetchImpl: async () => new Response('{}', { status: 201 })
  });
  assert.equal(response.status, 200);
});
