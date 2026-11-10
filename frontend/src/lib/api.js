/*
 * Thin client for the Pocabin API (backend/src/app.js).
 * Every binder mutation resolves to the full, updated binder.
 */

const BASE = import.meta.env.VITE_API_BASE || '/api';

async function request(method, path, body) {
  const isForm = body instanceof FormData;
  const res = await fetch(BASE + path, {
    method,
    headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

const slotPath = (binderId, sheetId, face, idx) =>
  `/binders/${encodeURIComponent(binderId)}/sheets/${encodeURIComponent(sheetId)}/${face}/${idx}`;

/* data: URL → Blob, without a network round-trip through fetch(). */
function dataUrlToBlob(url) {
  const [head, data] = url.split(',', 2);
  const mime = /data:([^;]+)/.exec(head)?.[1] || 'application/octet-stream';
  if (head.includes(';base64')) {
    const bin = atob(data);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }
  return new Blob([decodeURIComponent(data)], { type: mime });
}

export const api = {
  listBinders: () => request('GET', '/binders'),
  createBinder: (opts) => request('POST', '/binders', opts),
  updateBinder: (id, patch) => request('PATCH', `/binders/${encodeURIComponent(id)}`, patch),
  deleteBinder: (id) => request('DELETE', `/binders/${encodeURIComponent(id)}`),

  /* index omitted → append at the end */
  addSheet: (id, index) => request('POST', `/binders/${encodeURIComponent(id)}/sheets`, index == null ? {} : { index }),
  updateSheets: (id, { order, renames }) => request('PATCH', `/binders/${encodeURIComponent(id)}/sheets`, { order, renames }),
  deleteSheet: (id, sheetId) => request('DELETE', `/binders/${encodeURIComponent(id)}/sheets/${encodeURIComponent(sheetId)}`),

  /* Card images picked/cropped in the browser arrive as data: URLs; upload
     them to the image repository first so the card stores a reference. */
  async putCard(binderId, sheetId, face, idx, card) {
    let image = card.image || null;
    if (image && image.startsWith('data:')) {
      image = (await api.uploadImage(dataUrlToBlob(image))).url;
    }
    return request('PUT', slotPath(binderId, sheetId, face, idx), { ...card, image });
  },
  deleteCard: (binderId, sheetId, face, idx) => request('DELETE', slotPath(binderId, sheetId, face, idx)),

  uploadImage(blob, filename) {
    const fd = new FormData();
    const ext = (blob.type.split('/')[1] || 'bin').replace('svg+xml', 'svg').replace('jpeg', 'jpg');
    fd.append('file', blob, filename || `card.${ext}`);
    return request('POST', '/images', fd);
  },
  listImages: ({ limit = 50, offset = 0 } = {}) => request('GET', `/images?limit=${limit}&offset=${offset}`),
};
