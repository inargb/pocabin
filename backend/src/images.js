import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { badRequest, conflict, notFound } from './errors.js';
import { newId } from './ids.js';

/*
 * Image repository.
 *
 * Files live on disk under <uploadDir>/<sha[0:2]>/<sha>.<ext>; metadata lives in
 * the `images` table. Content is addressed by SHA-256, so uploading the same
 * bytes twice returns the existing image instead of storing a duplicate.
 *
 * The file type is detected from the bytes themselves — the client's declared
 * content type is never trusted.
 */

const TYPES = [
  { mime: 'image/png',  ext: 'png',  test: (b) => b.length > 8 && b.readUInt32BE(0) === 0x89504e47 },
  { mime: 'image/jpeg', ext: 'jpg',  test: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'image/gif',  ext: 'gif',  test: (b) => b.subarray(0, 4).toString('latin1') === 'GIF8' },
  { mime: 'image/webp', ext: 'webp', test: (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP' },
  { mime: 'image/avif', ext: 'avif', test: (b) => b.subarray(4, 12).toString('latin1') === 'ftypavif' },
  { mime: 'image/svg+xml', ext: 'svg', test: (b) => /^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(b.subarray(0, 2048).toString('utf8')) },
];

export function detectType(buf) {
  return TYPES.find((t) => t.test(buf)) || null;
}

export const IMAGE_URL_PREFIX = '/api/images/';
export const imageUrl = (id) => `${IMAGE_URL_PREFIX}${id}/file`;

/* Pull an image id out of a URL produced by imageUrl(). */
export function imageIdFromUrl(url) {
  if (typeof url !== 'string' || !url.startsWith(IMAGE_URL_PREFIX)) return null;
  const id = url.slice(IMAGE_URL_PREFIX.length).split('/')[0];
  return /^[A-Za-z0-9_-]{6,40}$/.test(id) ? id : null;
}

/* Decode a data: URL (base64 or percent-encoded) into a Buffer. */
export function decodeDataUrl(url) {
  const m = /^data:([^;,]*)((?:;[^;,]*)*?)(;base64)?,(.*)$/s.exec(url);
  if (!m) throw badRequest('Malformed data URL');
  return m[3] ? Buffer.from(m[4], 'base64') : Buffer.from(decodeURIComponent(m[4]), 'utf8');
}

const toApi = (row) => row && ({
  id: row.id,
  url: imageUrl(row.id),
  mime: row.mime,
  size: row.size,
  sha256: row.sha256,
  originalName: row.original_name,
  createdAt: row.created_at,
  ...(row.usage !== undefined ? { usage: row.usage } : {}),
});

export function createImageRepo(db, { uploadDir, maxBytes }) {
  fs.mkdirSync(uploadDir, { recursive: true });

  const filePath = (row) => path.join(uploadDir, row.sha256.slice(0, 2), `${row.sha256}.${row.ext}`);

  const q = {
    bySha: db.prepare('SELECT * FROM images WHERE sha256 = ?'),
    byId: db.prepare(`SELECT i.*, (SELECT COUNT(*) FROM cards c WHERE c.image_id = i.id) AS usage
                      FROM images i WHERE i.id = ?`),
    insert: db.prepare(`INSERT INTO images (id, sha256, mime, ext, size, original_name)
                        VALUES (@id, @sha256, @mime, @ext, @size, @original_name)`),
    list: db.prepare(`SELECT i.*, (SELECT COUNT(*) FROM cards c WHERE c.image_id = i.id) AS usage
                      FROM images i ORDER BY i.created_at DESC, i.id DESC LIMIT ? OFFSET ?`),
    count: db.prepare('SELECT COUNT(*) AS n FROM images'),
    del: db.prepare('DELETE FROM images WHERE id = ?'),
  };

  return {
    /* Store raw bytes; returns the (possibly pre-existing) image record. */
    store(buf, originalName = null) {
      if (!buf || !buf.length) throw badRequest('Empty image');
      if (buf.length > maxBytes) throw badRequest(`Image larger than ${Math.round(maxBytes / 1024 / 1024)} MB`);
      const type = detectType(buf);
      if (!type) throw badRequest('Unsupported image type (use PNG, JPEG, GIF, WebP, AVIF or SVG)');

      const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
      const existing = q.bySha.get(sha256);
      if (existing) return toApi(existing);

      const row = { id: newId(), sha256, mime: type.mime, ext: type.ext, size: buf.length,
        original_name: originalName ? String(originalName).slice(0, 255) : null };
      const dest = filePath(row);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      // Write to a temp file and rename so a crash never leaves a half-written image.
      const tmp = `${dest}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, buf);
      fs.renameSync(tmp, dest);
      q.insert.run(row);
      return toApi(q.bySha.get(sha256));
    },

    storeDataUrl(url, originalName) {
      return this.store(decodeDataUrl(url), originalName);
    },

    get(id) {
      return toApi(q.byId.get(id));
    },

    /* Absolute path + mime for streaming the file, or null. */
    file(id) {
      const row = q.byId.get(id);
      if (!row) return null;
      return { path: filePath(row), mime: row.mime, sha256: row.sha256 };
    },

    list({ limit = 50, offset = 0 } = {}) {
      return { items: q.list.all(limit, offset).map(toApi), total: q.count.get().n, limit, offset };
    },

    remove(id) {
      const row = q.byId.get(id);
      if (!row) throw notFound('Image not found');
      if (row.usage > 0) throw conflict(`Image is used by ${row.usage} card(s)`);
      q.del.run(id);
      fs.rmSync(filePath(row), { force: true });
    },
  };
}
