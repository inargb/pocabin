import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import multer from 'multer';
import { HttpError, badRequest, notFound } from './errors.js';
import { openDb } from './db.js';
import { createImageRepo } from './images.js';
import { createBinderRepo } from './binders.js';
import { seedDemo } from './seed-data.js';

/*
 * Builds the Express app. Kept separate from server.js so tests can create an
 * app against a throwaway data directory.
 */
export function createApp(cfg) {
  const db = openDb(cfg.dbFile);
  const maxBytes = cfg.maxUploadMb * 1024 * 1024;
  const images = createImageRepo(db, { uploadDir: cfg.uploadDir, maxBytes });
  const binders = createBinderRepo(db, images);

  if (cfg.seedDemo && binders.list().length === 0) seedDemo(binders);

  const app = express();
  app.disable('x-powered-by');
  // Card payloads may carry an inline data: URL image (stored server-side), so allow some headroom.
  app.use(express.json({ limit: `${Math.ceil(cfg.maxUploadMb * 1.4) + 1}mb` }));

  const api = express.Router();
  const wrap = (fn) => (req, res, next) => {
    try { fn(req, res, next); } catch (err) { next(err); }
  };

  api.get('/health', (req, res) => res.json({ ok: true }));

  /* ── Binders ───────────────────────────────────────── */
  api.get('/binders', wrap((req, res) => res.json(binders.list())));
  api.post('/binders', wrap((req, res) => res.status(201).json(binders.create(req.body))));
  api.get('/binders/:id', wrap((req, res) => res.json(binders.get(req.params.id))));
  api.patch('/binders/:id', wrap((req, res) => res.json(binders.update(req.params.id, req.body))));
  api.delete('/binders/:id', wrap((req, res) => { binders.remove(req.params.id); res.status(204).end(); }));

  /* ── Sheets ────────────────────────────────────────── */
  // body: { index? } — insert at index, or append when omitted
  api.post('/binders/:id/sheets', wrap((req, res) =>
    res.status(201).json(binders.addSheet(req.params.id, req.body?.index))));
  // body: { order?: [sheetId], renames?: [{ sheetId, face, name }] }
  api.patch('/binders/:id/sheets', wrap((req, res) =>
    res.json(binders.updateSheets(req.params.id, req.body))));
  api.delete('/binders/:id/sheets/:sheetId', wrap((req, res) =>
    res.json(binders.deleteSheet(req.params.id, req.params.sheetId))));

  /* ── Cards (one slot on one face of a sheet) ───────── */
  const slotPath = '/binders/:id/sheets/:sheetId/:face/:slot';
  api.put(slotPath, wrap((req, res) => {
    const { id, sheetId, face, slot } = req.params;
    res.json(binders.upsertCard(id, sheetId, face, slot, req.body));
  }));
  api.delete(slotPath, wrap((req, res) => {
    const { id, sheetId, face, slot } = req.params;
    res.json(binders.deleteCard(id, sheetId, face, slot));
  }));

  /* ── Image repository ──────────────────────────────── */
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: maxBytes, files: 1 } });

  api.get('/images', wrap((req, res) => {
    const limit = Math.max(1, Math.min(200, Number(req.query.limit) || 50));
    const offset = Math.max(0, Number(req.query.offset) || 0);
    res.json(images.list({ limit, offset }));
  }));
  // multipart/form-data with a single "file" field
  api.post('/images', upload.single('file'), wrap((req, res) => {
    if (!req.file) throw badRequest('Send the image as multipart field "file"');
    res.status(201).json(images.store(req.file.buffer, req.file.originalname));
  }));
  api.get('/images/:id', wrap((req, res) => {
    const img = images.get(req.params.id);
    if (!img) throw notFound('Image not found');
    res.json(img);
  }));
  api.get('/images/:id/file', wrap((req, res) => {
    const f = images.file(req.params.id);
    if (!f || !fs.existsSync(f.path)) throw notFound('Image not found');
    res.set({
      'Content-Type': f.mime,
      // Content-addressed: the bytes behind an id never change.
      'Cache-Control': 'public, max-age=31536000, immutable',
      ETag: `"${f.sha256}"`,
      'X-Content-Type-Options': 'nosniff',
      // Neutralize scripts in SVGs opened directly in the browser.
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src data:",
    });
    if (req.headers['if-none-match'] === `"${f.sha256}"`) return res.status(304).end();
    fs.createReadStream(f.path).pipe(res);
  }));
  api.delete('/images/:id', wrap((req, res) => { images.remove(req.params.id); res.status(204).end(); }));

  api.use((req, res) => res.status(404).json({ error: 'Not found' }));
  app.use('/api', api);

  /* ── Frontend (production build) ───────────────────── */
  if (cfg.frontendDist && fs.existsSync(path.join(cfg.frontendDist, 'index.html'))) {
    app.use(express.static(cfg.frontendDist));
    app.get('*', (req, res) => res.sendFile(path.join(cfg.frontendDist, 'index.html')));
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? `Image larger than ${cfg.maxUploadMb} MB` : err.message });
    }
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large' });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return { app, db, images, binders };
}
