const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(file, overrides = {}) {
  const filename = path.join(root, file);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = new Module(filename, module); mod.filename = filename; mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const original = mod.require.bind(mod); mod.require = id => id in overrides ? overrides[id] : original(id);
  mod._compile(compiled, filename); return mod.exports;
}
const contact = load('lib/contact.ts');
const payload = { phone: '8 (985) 287-44-31', consent: true, source: { form: 'calculator', utm_source: 'yandex', private: 'omit' } };
test('normalizes a phone-only lead and allowlists campaign attribution', () => {
  const { lead } = contact.parseLead(payload);
  assert.equal(lead.phone, '+79852874431'); assert.equal(lead.name, 'Не указано');
  assert.deepEqual(lead.source, { form: 'calculator', utm_source: 'yandex' });
  assert.match(contact.leadMessage(lead), /utm_source: yandex/);
});
test('rejects invalid phone, missing consent, honeypot, and malformed payloads', () => {
  for (const value of [null, [], 'test', { ...payload, phone: '123' }, { ...payload, consent: false }, { ...payload, website: 'spam' }]) assert.ok(contact.parseLead(value).error);
});
function route(results, fail = false) {
  let calls = 0;
  const api = load('app/api/contact/route.ts', { 'next/server': { NextResponse: { json: (data, init) => Response.json(data, init) } }, '@/lib/contact': contact, '@/lib/telegram': { sendToAll: async () => { calls++; if (fail) throw Error('delivery'); return results; } } });
  return { POST: api.POST, calls: () => calls };
}
const request = (body, origin = 'https://www.rooki-remont.ru') => new Request('https://www.rooki-remont.ru/api/contact', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) });
test('reports failure when no configured recipient receives a lead', async () => {
  for (const results of [[], [false], [false, false]]) { const res = await route(results).POST(request(payload)); assert.equal(res.status, 502); assert.notEqual((await res.json()).success, true); }
});
test('acknowledges an accepted lead even if another recipient fails', async () => {
  const res = await route([false, true]).POST(request(payload)); assert.equal(res.status, 200); assert.equal((await res.json()).success, true);
});
test('does not deliver malformed, unconsented, oversized, or cross-origin leads', async () => {
  const api = route([true]);
  assert.equal((await api.POST(request('{'))).status, 400);
  assert.equal((await api.POST(request({ ...payload, consent: false }))).status, 400);
  assert.equal((await api.POST(request(payload, 'https://other.example'))).status, 403);
  assert.equal((await api.POST(request('x'.repeat(13000)))).status, 413);
  assert.equal(api.calls(), 0);
});
test('delivery infrastructure errors become a retryable service response', async () => { assert.equal((await route([], true).POST(request(payload))).status, 503); });
test('Telegram HTTP errors, ok:false, and network failures are not acknowledged', async () => {
  const beforeFetch = global.fetch; const beforeToken = process.env.TELEGRAM_BOT_TOKEN;
  process.env.TELEGRAM_BOT_TOKEN = 'test-only';
  try {
    const telegram = load('lib/telegram.ts', { '@/lib/chatIds': { CHAT_IDS: ['test-recipient'] } });
    for (const fake of [async () => Response.json({ ok: false }, { status: 403 }), async () => Response.json({ ok: false }), async () => { throw Error('network'); }]) { global.fetch = fake; assert.deepEqual(await telegram.sendToAll('TEST'), [false]); }
    global.fetch = async () => Response.json({ ok: true }); assert.deepEqual(await telegram.sendToAll('TEST'), [true]);
  } finally { global.fetch = beforeFetch; if (beforeToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN; else process.env.TELEGRAM_BOT_TOKEN = beforeToken; }
});
