import { badRequest, notFound } from './errors.js';
import { newId } from './ids.js';
import { imageIdFromUrl, imageUrl } from './images.js';
import {
  CARD_MODES, COLLECTION_TYPES, FACES, GRID_TYPES, MAX_NAME, MAX_SHEETS,
  SKINS, SLEEVE_TYPES, STATUSES,
} from './domain.js';

/*
 * Binder repository.
 *
 * Storage is normalized (binders → sheets → cards), but every read returns
 * the nested shape the frontend works with:
 *
 *   { id, name, colorId, gridType, collectionType, skin, nextPageNumber,
 *     sheets: [{ id, frontName, backName, front: { slots }, back: { slots } }] }
 *
 * where each slot is null or a card { id, mode, image, color, sleeve, status, notes, meta }.
 * Every mutation returns the full updated binder so the client can replace
 * its copy wholesale.
 */

const str = (v, max, fallback = '') => (typeof v === 'string' ? v.trim().slice(0, max) : fallback);
const now = () => new Date().toISOString();

function parseJson(text, fallback) {
  try { return JSON.parse(text); } catch { return fallback; }
}

function resolveSkin(skin, colorId) {
  const s = SKINS[skin] ? skin : 'pastel';
  const c = SKINS[s].includes(colorId) ? colorId : SKINS[s][0];
  return { skin: s, colorId: c };
}

export function createBinderRepo(db, images) {
  const q = {
    binders: db.prepare('SELECT * FROM binders ORDER BY position, created_at'),
    binder: db.prepare('SELECT * FROM binders WHERE id = ?'),
    sheetsOf: db.prepare('SELECT * FROM sheets WHERE binder_id = ? ORDER BY position'),
    cardsOf: db.prepare(`SELECT c.* FROM cards c JOIN sheets s ON s.id = c.sheet_id WHERE s.binder_id = ?`),
    sheet: db.prepare('SELECT * FROM sheets WHERE id = ? AND binder_id = ?'),
    maxPos: db.prepare('SELECT COALESCE(MAX(position), -1) AS p FROM binders'),
    insBinder: db.prepare(`INSERT INTO binders (id, name, color_id, grid_type, collection_type, skin, next_page_number, position)
                           VALUES (@id, @name, @color_id, @grid_type, @collection_type, @skin, @next_page_number, @position)`),
    updBinder: db.prepare(`UPDATE binders SET name = @name, color_id = @color_id, skin = @skin, updated_at = @updated_at WHERE id = @id`),
    touch: db.prepare('UPDATE binders SET updated_at = ? WHERE id = ?'),
    bumpPage: db.prepare('UPDATE binders SET next_page_number = next_page_number + 2 WHERE id = ?'),
    delBinder: db.prepare('DELETE FROM binders WHERE id = ?'),
    insSheet: db.prepare(`INSERT INTO sheets (id, binder_id, position, front_name, back_name)
                          VALUES (@id, @binder_id, @position, @front_name, @back_name)`),
    setSheetPos: db.prepare('UPDATE sheets SET position = ? WHERE id = ?'),
    renameFront: db.prepare('UPDATE sheets SET front_name = ? WHERE id = ?'),
    renameBack: db.prepare('UPDATE sheets SET back_name = ? WHERE id = ?'),
    delSheet: db.prepare('DELETE FROM sheets WHERE id = ?'),
    upsertCard: db.prepare(`
      INSERT INTO cards (id, sheet_id, face, slot, mode, image_id, color, sleeve, status, notes, meta)
      VALUES (@id, @sheet_id, @face, @slot, @mode, @image_id, @color, @sleeve, @status, @notes, @meta)
      ON CONFLICT (sheet_id, face, slot) DO UPDATE SET
        mode = excluded.mode, image_id = excluded.image_id, color = excluded.color,
        sleeve = excluded.sleeve, status = excluded.status, notes = excluded.notes,
        meta = excluded.meta, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')`),
    delCard: db.prepare('DELETE FROM cards WHERE sheet_id = ? AND face = ? AND slot = ?'),
  };

  /* ── Reads ─────────────────────────────────────────── */

  function hydrate(row) {
    const perPage = GRID_TYPES[row.grid_type];
    const sheets = q.sheetsOf.all(row.id).map((s) => ({
      id: s.id,
      frontName: s.front_name,
      backName: s.back_name,
      front: { slots: Array(perPage).fill(null) },
      back: { slots: Array(perPage).fill(null) },
    }));
    const byId = new Map(sheets.map((s) => [s.id, s]));
    for (const c of q.cardsOf.all(row.id)) {
      const sheet = byId.get(c.sheet_id);
      if (!sheet || c.slot >= perPage) continue;
      sheet[c.face].slots[c.slot] = {
        id: c.id,
        mode: c.mode,
        image: c.image_id ? imageUrl(c.image_id) : null,
        color: c.color,
        sleeve: parseJson(c.sleeve, { type: 'none', color: '#ffffff' }),
        status: c.status,
        notes: c.notes,
        meta: parseJson(c.meta, {}),
      };
    }
    return {
      id: row.id,
      name: row.name,
      colorId: row.color_id,
      gridType: row.grid_type,
      collectionType: row.collection_type,
      skin: row.skin,
      nextPageNumber: row.next_page_number,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      sheets,
    };
  }

  function requireBinder(id) {
    const row = q.binder.get(id);
    if (!row) throw notFound('Binder not found');
    return row;
  }

  function requireSheet(binderId, sheetId) {
    const s = q.sheet.get(sheetId, binderId);
    if (!s) throw notFound('Sheet not found');
    return s;
  }

  const get = (id) => hydrate(requireBinder(id));

  /* Re-number sheet positions 0..n-1 in the given order. */
  function writeOrder(ids) {
    ids.forEach((id, i) => q.setSheetPos.run(i, id));
  }

  function insertSheet(binderRow, index) {
    const sheets = q.sheetsOf.all(binderRow.id);
    if (sheets.length >= MAX_SHEETS) throw badRequest(`A binder can have at most ${MAX_SHEETS} sheets`);
    const n = q.binder.get(binderRow.id).next_page_number;
    const id = newId();
    q.insSheet.run({ id, binder_id: binderRow.id, position: sheets.length, front_name: `Page ${n}`, back_name: `Page ${n + 1}` });
    q.bumpPage.run(binderRow.id);
    const at = index == null ? sheets.length : Math.max(0, Math.min(sheets.length, Number(index) || 0));
    const order = sheets.map((s) => s.id);
    order.splice(at, 0, id);
    writeOrder(order);
    return id;
  }

  /* Normalize a card payload from the client. Images may come in as a URL
     into the image repository, a data: URL (stored on the fly) or null. */
  function normalizeCard(card) {
    if (!card || typeof card !== 'object') throw badRequest('Card body required');
    let imageId = null;
    if (card.image) {
      if (typeof card.image !== 'string') throw badRequest('image must be a string');
      if (card.image.startsWith('data:')) {
        imageId = images.storeDataUrl(card.image).id;
      } else {
        imageId = imageIdFromUrl(card.image);
        if (!imageId || !images.get(imageId)) throw badRequest('image does not reference a stored image');
      }
    }
    const sleeveIn = card.sleeve && typeof card.sleeve === 'object' ? card.sleeve : {};
    const sleeve = {
      type: SLEEVE_TYPES.includes(sleeveIn.type) ? sleeveIn.type : 'none',
      color: str(sleeveIn.color, 32, '#ffffff') || '#ffffff',
    };
    const meta = card.meta && typeof card.meta === 'object' && !Array.isArray(card.meta) ? card.meta : {};
    const metaJson = JSON.stringify(meta);
    if (metaJson.length > 20_000) throw badRequest('meta is too large');
    return {
      mode: CARD_MODES.includes(card.mode) ? card.mode : (imageId ? 'image' : 'color'),
      image_id: imageId,
      color: str(card.color, 32, null),
      sleeve: JSON.stringify(sleeve),
      status: STATUSES.includes(card.status) ? card.status : null,
      notes: str(card.notes, 2000),
      meta: metaJson,
    };
  }

  function locateSlot(binderRow, sheetId, face, slot) {
    requireSheet(binderRow.id, sheetId);
    if (!FACES.includes(face)) throw badRequest('face must be "front" or "back"');
    const idx = Number(slot);
    if (!Number.isInteger(idx) || idx < 0 || idx >= GRID_TYPES[binderRow.grid_type]) {
      throw badRequest('slot out of range for this grid');
    }
    return idx;
  }

  /* ── Public API ────────────────────────────────────── */

  return {
    list: () => q.binders.all().map(hydrate),
    get,

    create: db.transaction((input = {}) => {
      const gridType = GRID_TYPES[input.gridType] ? input.gridType : '2x2';
      const collectionType = COLLECTION_TYPES.includes(input.collectionType) ? input.collectionType : 'kpop';
      const { skin, colorId } = resolveSkin(input.skin, input.colorId);
      const sheetCount = Math.max(1, Math.min(MAX_SHEETS, Number.parseInt(input.sheetCount ?? 3, 10) || 1));
      const id = newId();
      q.insBinder.run({
        id,
        name: str(input.name, MAX_NAME) || 'New binder',
        color_id: colorId,
        grid_type: gridType,
        collection_type: collectionType,
        skin,
        next_page_number: 1,
        position: q.maxPos.get().p + 1,
      });
      const row = q.binder.get(id);
      for (let i = 0; i < sheetCount; i++) insertSheet(row, null);
      return get(id);
    }),

    /* Only name / skin / color are editable — grid and collection type are fixed at creation. */
    update: db.transaction((id, patch = {}) => {
      const row = requireBinder(id);
      const { skin, colorId } = resolveSkin(patch.skin ?? row.skin, patch.colorId ?? row.color_id);
      q.updBinder.run({
        id,
        name: patch.name !== undefined ? (str(patch.name, MAX_NAME) || row.name) : row.name,
        skin,
        color_id: colorId,
        updated_at: now(),
      });
      return get(id);
    }),

    remove(id) {
      requireBinder(id);
      q.delBinder.run(id);
    },

    addSheet: db.transaction((id, index) => {
      const row = requireBinder(id);
      insertSheet(row, index);
      q.touch.run(now(), id);
      return get(id);
    }),

    deleteSheet: db.transaction((id, sheetId) => {
      requireBinder(id);
      requireSheet(id, sheetId);
      const sheets = q.sheetsOf.all(id);
      if (sheets.length <= 1) throw badRequest('A binder needs at least one sheet');
      q.delSheet.run(sheetId);
      writeOrder(sheets.filter((s) => s.id !== sheetId).map((s) => s.id));
      q.touch.run(now(), id);
      return get(id);
    }),

    /* Bulk edit from the "Manage sheets" dialog: renames + a new order. */
    updateSheets: db.transaction((id, { order, renames } = {}) => {
      requireBinder(id);
      const current = q.sheetsOf.all(id).map((s) => s.id);
      for (const r of Array.isArray(renames) ? renames : []) {
        requireSheet(id, r.sheetId);
        const name = str(r.name, MAX_NAME);
        if (r.face === 'front') q.renameFront.run(name, r.sheetId);
        else if (r.face === 'back') q.renameBack.run(name, r.sheetId);
        else throw badRequest('rename face must be "front" or "back"');
      }
      if (order !== undefined) {
        if (!Array.isArray(order) || order.length !== current.length
          || new Set(order).size !== order.length || !order.every((s) => current.includes(s))) {
          throw badRequest('order must list every sheet id of the binder exactly once');
        }
        writeOrder(order);
      }
      q.touch.run(now(), id);
      return get(id);
    }),

    upsertCard: db.transaction((id, sheetId, face, slot, card) => {
      const row = requireBinder(id);
      const idx = locateSlot(row, sheetId, face, slot);
      q.upsertCard.run({ id: newId(), sheet_id: sheetId, face, slot: idx, ...normalizeCard(card) });
      q.touch.run(now(), id);
      return get(id);
    }),

    deleteCard: db.transaction((id, sheetId, face, slot) => {
      const row = requireBinder(id);
      const idx = locateSlot(row, sheetId, face, slot);
      q.delCard.run(sheetId, face, idx);
      q.touch.run(now(), id);
      return get(id);
    }),
  };
}
