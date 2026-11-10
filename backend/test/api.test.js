import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../src/app.js';

// 1×1 transparent PNG
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

let dir, server, base, ctx;

before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pocabin-test-'));
  ctx = createApp({
    dbFile: path.join(dir, 'test.db'),
    uploadDir: path.join(dir, 'uploads'),
    maxUploadMb: 1,
    seedDemo: false,
    frontendDist: null,
  });
  await new Promise((r) => { server = ctx.app.listen(0, r); });
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(() => {
  server.close();
  ctx.db.close();
  fs.rmSync(dir, { recursive: true, force: true });
});

const call = async (method, url, body) => {
  const res = await fetch(base + url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
};

const uploadPng = async (buf = PNG, name = 'card.png') => {
  const fd = new FormData();
  fd.append('file', new Blob([buf], { type: 'image/png' }), name);
  const res = await fetch(base + '/images', { method: 'POST', body: fd });
  return { status: res.status, body: await res.json() };
};

test('creates a binder with sheets sized to its grid', async () => {
  const { status, body } = await call('POST', '/binders', { name: 'Test', gridType: '3x3', sheetCount: 2, collectionType: 'pokemon', skin: 'leather', colorId: 'navy' });
  assert.equal(status, 201);
  assert.equal(body.name, 'Test');
  assert.equal(body.colorId, 'navy');
  assert.equal(body.sheets.length, 2);
  assert.equal(body.sheets[0].front.slots.length, 9);
  assert.deepEqual(body.sheets.map((s) => [s.frontName, s.backName]), [['Page 1', 'Page 2'], ['Page 3', 'Page 4']]);
  assert.equal(body.nextPageNumber, 5);
});

test('falls back to valid skin colors', async () => {
  const { body } = await call('POST', '/binders', { name: 'x', skin: 'holo', colorId: 'pink' });
  assert.equal(body.skin, 'holo');
  assert.equal(body.colorId, 'silver');
});

test('sheet insert, reorder, rename and delete', async () => {
  const { body: b } = await call('POST', '/binders', { name: 'Sheets', gridType: '2x2', sheetCount: 2 });
  const [s1, s2] = b.sheets.map((s) => s.id);

  const { body: b2 } = await call('POST', `/binders/${b.id}/sheets`, { index: 1 });
  assert.equal(b2.sheets.length, 3);
  const inserted = b2.sheets[1];
  assert.equal(inserted.frontName, 'Page 5');

  const { body: b3 } = await call('PATCH', `/binders/${b.id}/sheets`, {
    order: [s2, inserted.id, s1],
    renames: [{ sheetId: s1, face: 'back', name: 'Rares' }],
  });
  assert.deepEqual(b3.sheets.map((s) => s.id), [s2, inserted.id, s1]);
  assert.equal(b3.sheets[2].backName, 'Rares');

  const bad = await call('PATCH', `/binders/${b.id}/sheets`, { order: [s1] });
  assert.equal(bad.status, 400);

  const { body: b4 } = await call('DELETE', `/binders/${b.id}/sheets/${inserted.id}`);
  assert.deepEqual(b4.sheets.map((s) => s.id), [s2, s1]);
  await call('DELETE', `/binders/${b.id}/sheets/${s2}`);
  const last = await call('DELETE', `/binders/${b.id}/sheets/${s1}`);
  assert.equal(last.status, 400, 'cannot delete the last sheet');
});

test('image upload is content-addressed and served back', async () => {
  const a = await uploadPng();
  assert.equal(a.status, 201);
  assert.equal(a.body.mime, 'image/png');
  const again = await uploadPng(PNG, 'other-name.png');
  assert.equal(again.body.id, a.body.id, 'same bytes → same image');

  const res = await fetch(base.replace('/api', '') + a.body.url);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'image/png');
  assert.deepEqual(Buffer.from(await res.arrayBuffer()), PNG);

  const notImage = await uploadPng(Buffer.from('hello world'), 'x.png');
  assert.equal(notImage.status, 400);
});

test('cards: upsert with stored image, data URL, delete; image in use cannot be deleted', async () => {
  const { body: b } = await call('POST', '/binders', { name: 'Cards', gridType: '2x2', sheetCount: 1 });
  const sheet = b.sheets[0].id;
  const img = (await uploadPng()).body;

  const put = await call('PUT', `/binders/${b.id}/sheets/${sheet}/front/2`, {
    mode: 'image', image: img.url, status: 'have', sleeve: { type: 'holographic' }, meta: { member: 'Minji' },
  });
  assert.equal(put.status, 200);
  const card = put.body.sheets[0].front.slots[2];
  assert.equal(card.image, img.url);
  assert.equal(card.status, 'have');
  assert.equal(card.meta.member, 'Minji');

  const inUse = await call('DELETE', `/images/${img.id}`);
  assert.equal(inUse.status, 409);

  const svg = 'data:image/svg+xml;utf8,' + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'/>");
  const put2 = await call('PUT', `/binders/${b.id}/sheets/${sheet}/back/0`, { image: svg });
  assert.match(put2.body.sheets[0].back.slots[0].image, /^\/api\/images\/.+\/file$/);

  const outOfRange = await call('PUT', `/binders/${b.id}/sheets/${sheet}/front/4`, { mode: 'color' });
  assert.equal(outOfRange.status, 400);
  const foreignImage = await call('PUT', `/binders/${b.id}/sheets/${sheet}/front/0`, { image: 'https://example.com/x.png' });
  assert.equal(foreignImage.status, 400);

  const del = await call('DELETE', `/binders/${b.id}/sheets/${sheet}/front/2`);
  assert.equal(del.body.sheets[0].front.slots[2], null);
  const freed = await call('DELETE', `/images/${img.id}`);
  assert.equal(freed.status, 204);
});

test('binder update only touches name/skin/color; delete cascades', async () => {
  const { body: b } = await call('POST', '/binders', { name: 'Edit me', gridType: '2x2', sheetCount: 1 });
  const { body: u } = await call('PATCH', `/binders/${b.id}`, { name: 'Edited', skin: 'matte', colorId: 'slate', gridType: '3x3' });
  assert.equal(u.name, 'Edited');
  assert.equal(u.skin, 'matte');
  assert.equal(u.colorId, 'slate');
  assert.equal(u.gridType, '2x2');

  assert.equal((await call('DELETE', `/binders/${b.id}`)).status, 204);
  assert.equal((await call('GET', `/binders/${b.id}`)).status, 404);
  const orphans = ctx.db.prepare('SELECT COUNT(*) n FROM sheets WHERE binder_id = ?').get(b.id).n;
  assert.equal(orphans, 0);
});

test('demo seed builds the prototype collection', async () => {
  const { seedDemo } = await import('../src/seed-data.js');
  const before = ctx.binders.list().length;
  seedDemo(ctx.binders);
  const all = ctx.binders.list();
  assert.equal(all.length, before + 5);
  const nj = all.find((x) => x.name === 'NewJeans');
  assert.equal(nj.sheets[0].front.slots.filter(Boolean).length, 4);
});
