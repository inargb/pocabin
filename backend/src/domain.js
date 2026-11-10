/*
 * Domain constants shared with the frontend design (frontend/src/components/core.jsx).
 * Kept small on purpose: the backend validates shape and ids, the frontend owns
 * presentation (labels, colors, field schemas).
 */

export const GRID_TYPES = { '1x1': 1, '2x2': 4, '3x3': 9 }; // id -> slots per page
export const COLLECTION_TYPES = ['kpop', 'pokemon', 'sports', 'yugioh', 'mtg', 'other'];
export const SKINS = {
  pastel: ['pink', 'coral', 'yellow', 'mint', 'sky', 'lavender', 'white'],
  leather: ['cognac', 'forest', 'navy', 'burgundy', 'charcoal'],
  holo: ['silver', 'soft-black'],
  matte: ['warm-white', 'slate', 'terracotta', 'sage', 'mauve'],
  dark: ['midnight', 'deep-navy', 'deep-forest', 'deep-plum'],
};
export const STATUSES = ['priority', 'want-to-buy', 'have', 'on-the-way'];
export const FACES = ['front', 'back'];
export const SLEEVE_TYPES = ['none', 'colored', 'holographic'];
export const CARD_MODES = ['image', 'color'];

export const MAX_SHEETS = 200;
export const MAX_NAME = 60;
