import React from 'react';

/* ──────────────────────────────────────────────────────
   Icons (inline SVG)
   ────────────────────────────────────────────────────── */
const Icon = {
  plus:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  pencil:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>,
  trash:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>,
  chevL:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="15 18 9 12 15 6"/></svg>,
  chevR:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="9 18 15 12 9 6"/></svg>,
  close:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...p}><path d="M18 6L6 18M6 6l12 12"/></svg>,
  upload:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  heart:   (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z"/></svg>,
  sparkle: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2l1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2zm6 12l.9 2.6L21 17l-2.1.4L18 20l-.9-2.6L15 17l2.1-.4L18 14zM5 14l.7 2L8 16.7l-2.3.3L5 19l-.7-2L2 16.7 4.3 16 5 14z"/></svg>,
  book:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  arrowUp: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 15 12 9 18 15"/></svg>,
  arrowDn: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 12 15 18 9"/></svg>,
  grip:    (p) => <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>,
  shuffle: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>,
  crop:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>,
  /* Status icons */
  star:    (p) => <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}><path d="M12 2.5l2.9 6.2 6.6.7-4.9 4.6 1.4 6.6L12 17.3 5.9 20.6l1.4-6.6L2.5 9.4l6.6-.7L12 2.5z"/></svg>,
  bookmark:(p) => <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}><path d="M6 3.5a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 18 3.5V21l-6-3.6L6 21V3.5z"/></svg>,
  check:   (p) => <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.4l-4.2-4.2 1.6-1.6 2.6 2.6 5.6-5.6 1.6 1.6-7.2 7.2z"/></svg>,
  truck:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="1" y="5" width="14" height="12" rx="1.5"/><path d="M15 8h4l4 4v5h-8z"/><circle cx="6" cy="19" r="2" fill="currentColor" stroke="none"/><circle cx="18" cy="19" r="2" fill="currentColor" stroke="none"/></svg>,
  /* Added for Community / Stats / Scanner views */
  scan:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="3" y1="12" x2="21" y2="12"/></svg>,
  chart:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6" fill="currentColor" stroke="none" rx="1"/><rect x="12.5" y="7" width="3" height="10" fill="currentColor" stroke="none" rx="1"/><rect x="18" y="13" width="3" height="4" fill="currentColor" stroke="none" rx="1"/></svg>,
  search:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  pin:     (p) => <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>,
  camera:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 7h3l2-2h8l2 2h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="4"/></svg>,
  refresh: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>,
};

/* ──────────────────────────────────────────────────────
   Pastel palette — the original kawaii skin's color set.
   Also exposed as PASTELS for backward compat.
   ────────────────────────────────────────────────────── */
const PASTELS = [
  { id: 'pink',     name: 'Petal',     cover: '#f9c3c5', tint: '#f4a8ab', dark: '#e89497' },
  { id: 'coral',    name: 'Coral',     cover: '#f5b3aa', tint: '#e89388', dark: '#cf6f63' },
  { id: 'yellow',   name: 'Butter',    cover: '#f7e7a4', tint: '#e8d182', dark: '#c9af5e' },
  { id: 'mint',     name: 'Mint',      cover: '#c5e6d3', tint: '#a8d6bb', dark: '#87bf9d' },
  { id: 'sky',      name: 'Sky',       cover: '#b9d7ec', tint: '#9bc1de', dark: '#79a7c8' },
  { id: 'lavender', name: 'Lavender',  cover: '#d8c9ec', tint: '#beabd9', dark: '#a18bc4' },
  { id: 'white',    name: 'Cream',     cover: '#f5efe9', tint: '#ddd3c9', dark: '#beb1a4' },
];
const palette = (id) => PASTELS.find(p => p.id === id) || PASTELS[0];

/* ──────────────────────────────────────────────────────
   Binder skins — cover material treatments.

   Each skin has its own color palette. The rings/spine SVG
   is identical across all skins; only the cover changes.

   Skin id is set at binder creation and used by CSS via
   .binder--<skinId> class. colorOf(binder) resolves the
   binder's cover/tint/dark from the right skin palette.
   ────────────────────────────────────────────────────── */
const SKINS = [
  {
    id: 'pastel', label: 'Pastel Cute', emoji: '🌸',
    note: 'Soft pastels',
    colors: PASTELS,
  },
  {
    id: 'leather', label: 'Classic Leather', emoji: '📕',
    note: 'Warm collector tones',
    colors: [
      { id: 'cognac',   name: 'Cognac',    cover: '#8B4513', tint: '#A05A23', dark: '#5B2E0C' },
      { id: 'forest',   name: 'Forest',    cover: '#2F4F2F', tint: '#3F6B3F', dark: '#1F351F' },
      { id: 'navy',     name: 'Navy',      cover: '#2C3E5A', tint: '#3D547A', dark: '#1A2540' },
      { id: 'burgundy', name: 'Burgundy',  cover: '#6E1F2C', tint: '#8C2D3C', dark: '#481318' },
      { id: 'charcoal', name: 'Charcoal',  cover: '#3A3A3A', tint: '#525252', dark: '#252525' },
    ],
  },
  {
    id: 'holo', label: 'Holographic', emoji: '✨',
    note: 'Animated shimmer',
    colors: [
      { id: 'silver',     name: 'Silver',     cover: '#E8E8EC', tint: '#D0D0D5', dark: '#A8A8AD' },
      { id: 'soft-black', name: 'Soft Black', cover: '#2A2A30', tint: '#3A3A42', dark: '#1A1A20' },
    ],
  },
  {
    id: 'matte', label: 'Matte Modern', emoji: '□',
    note: 'Clean, design-forward',
    colors: [
      { id: 'warm-white', name: 'Warm White', cover: '#F0EBE4', tint: '#E0DACE', dark: '#C2BBA9' },
      { id: 'slate',      name: 'Slate',      cover: '#7B8794', tint: '#9AA4AF', dark: '#5A6772' },
      { id: 'terracotta', name: 'Terracotta', cover: '#C97B5F', tint: '#D08F76', dark: '#A65C44' },
      { id: 'sage',       name: 'Sage',       cover: '#9CAB8E', tint: '#AEBBA1', dark: '#7B8A6C' },
      { id: 'mauve',      name: 'Dusty Mauve', cover: '#B19A9F', tint: '#C3AEB2', dark: '#8E7A7F' },
    ],
  },
  {
    id: 'dark', label: 'Dark Collector', emoji: '🌒',
    note: 'Deep, premium',
    colors: [
      { id: 'midnight',    name: 'Midnight',     cover: '#0F0F12', tint: '#1A1A20', dark: '#050507' },
      { id: 'deep-navy',   name: 'Deep Navy',    cover: '#0E1A2D', tint: '#1E2D45', dark: '#070F1A' },
      { id: 'deep-forest', name: 'Deep Forest',  cover: '#0F1F18', tint: '#1B3127', dark: '#06120D' },
      { id: 'deep-plum',   name: 'Deep Plum',    cover: '#1F0E1F', tint: '#341A34', dark: '#120712' },
    ],
  },
];
const skinDef = (id) => SKINS.find(s => s.id === id) || SKINS[0];
/* Resolve a binder's cover/tint/dark colors from its skin+colorId. */
function colorOf(binder) {
  if (!binder) return PASTELS[0];
  const s = skinDef(binder.skin || 'pastel');
  return s.colors.find(c => c.id === binder.colorId) || s.colors[0];
}

/* ───────────────────────────────────────────────────
   Card status definitions
   Each status has an id, label, icon, and a soft kawaii color pair
   (bg + ink) that pulls from the same palette family as the binders.
   ─────────────────────────────────────────────────── */
const STATUSES = [
  { id: 'priority',    label: 'Priority',    icon: 'star',     bg: '#ffd1a8', ink: '#a25510', ring: '#f0a060' },
  { id: 'want-to-buy', label: 'Want to buy', icon: 'bookmark', bg: '#ffd6e2', ink: '#a23a66', ring: '#f29ab4' },
  { id: 'have',        label: 'Have',        icon: 'check',    bg: '#c8e8c4', ink: '#2f7a3d', ring: '#7cc080' },
  { id: 'on-the-way',  label: 'On the way',  icon: 'truck',    bg: '#c8dff3', ink: '#1f5a8a', ring: '#7aa8d0' },
];
const statusDef = (id) => STATUSES.find(s => s.id === id) || null;

const GRID_TYPES = [
  { id: '1x1', cols: 1, rows: 1, label: '1 × 1', perPage: 1 },
  { id: '2x2', cols: 2, rows: 2, label: '2 × 2', perPage: 4 },
  { id: '3x3', cols: 3, rows: 3, label: '3 × 3', perPage: 9 },
];
const gridDef = (id) => GRID_TYPES.find(g => g.id === id) || GRID_TYPES[1];

/* ──────────────────────────────────────────────────────
   Collection types

   Each binder is bound to a single collection type at creation
   time. The type drives:
     - Sidebar grouping (binders cluster under the type's header)
     - The Card modal's metadata schema (sections + fields)

   Field kinds: 'text' | 'select' | 'multiselect' | 'toggle'
   All metadata is optional — saving a card never blocks on it.
   ────────────────────────────────────────────────────── */
const COLLECTIONS = [
  {
    id: 'kpop', label: 'K-pop Photocard', emoji: '🎤', short: 'K-pop',
    sections: [
      { id: 'info', label: 'Card Info', fields: [
        { id: 'member',  label: 'Member',          kind: 'text', placeholder: 'e.g. Minji' },
        { id: 'group',   label: 'Group / Artist',  kind: 'text', placeholder: 'e.g. NewJeans' },
        { id: 'album',   label: 'Album',           kind: 'text', placeholder: 'e.g. Get Up' },
        { id: 'version', label: 'Version',         kind: 'text', placeholder: 'Digipack Ver.' },
        { id: 'pob',     label: 'POB',             kind: 'text', placeholder: 'Weverse' },
        { id: 'year',    label: 'Year',            kind: 'text', placeholder: '2024' },
      ] },
    ],
  },
  {
    id: 'pokemon', label: 'Pokémon', emoji: '🃏', short: 'Pokémon',
    sections: [
      { id: 'info', label: 'Card Info', fields: [
        { id: 'name',     label: 'Pokémon name', kind: 'text', placeholder: 'e.g. Pikachu ex' },
        { id: 'set',      label: 'Set name',     kind: 'text', placeholder: 'Prismatic Evolutions' },
        { id: 'number',   label: 'Card number',  kind: 'text', placeholder: '025/131' },
        { id: 'year',     label: 'Year',         kind: 'text' },
        { id: 'language', label: 'Language',     kind: 'text', placeholder: 'English' },
      ] },
      { id: 'cg', label: 'Variant & Condition', fields: [
        { id: 'rarity',    label: 'Rarity',    kind: 'select', options: ['Common','Uncommon','Rare','Double Rare','Ultra Rare','Special Illustration Rare','Hyper Rare','Secret Rare'] },
        { id: 'variant',   label: 'Variant',   kind: 'select', options: ['Standard','Reverse Holo','Holo','Full Art','Special Illustration','Rainbow','Gold'] },
        { id: 'condition', label: 'Condition', kind: 'select', options: ['Mint','Near Mint','Lightly Played','Moderately Played','Heavily Played','Damaged'] },
      ] },
    ],
  },
  {
    id: 'sports', label: 'Sports Card', emoji: '⚽', short: 'Sports',
    sections: [
      { id: 'info', label: 'Card Info', fields: [
        { id: 'player',   label: 'Player name', kind: 'text' },
        { id: 'team',     label: 'Team',        kind: 'text' },
        { id: 'sport',    label: 'Sport / League', kind: 'select', options: ['NBA','NFL','MLB','NHL','Soccer','F1','Other'] },
        { id: 'brand',    label: 'Brand',       kind: 'text', placeholder: 'Topps, Panini, Upper Deck' },
        { id: 'set',      label: 'Set / Series', kind: 'text', placeholder: 'Prizm, Select, Chrome' },
        { id: 'number',   label: 'Card number', kind: 'text', placeholder: '#344' },
        { id: 'year',     label: 'Year',        kind: 'text' },
        { id: 'parallel', label: 'Parallel / Variant', kind: 'text', placeholder: 'Base, Refractor, Gold' },
        { id: 'serial',   label: 'Serial number', kind: 'text', placeholder: '/25, /99' },
      ] },
      { id: 'features', label: 'Special Features', fields: [
        { id: 'rookie',   label: 'Rookie card', kind: 'toggle' },
        { id: 'features', label: 'Features',    kind: 'multiselect', options: ['Autograph','Memorabilia/Patch','Short Print'] },
      ] },
      { id: 'cg', label: 'Condition & Grading', fields: [
        { id: 'condition', label: 'Condition', kind: 'select', options: ['Gem Mint','Mint','Near Mint','Excellent','Very Good','Poor'] },
        { id: 'grade',     label: 'Grade',     kind: 'text', placeholder: 'PSA 10, BGS 9.5' },
      ] },
    ],
  },
  {
    id: 'yugioh', label: 'Yu-Gi-Oh!', emoji: '⚔️', short: 'Yu-Gi-Oh!',
    sections: [
      { id: 'info', label: 'Card Info', fields: [
        { id: 'name',     label: 'Card name', kind: 'text', placeholder: 'Blue-Eyes White Dragon' },
        { id: 'set',      label: 'Set name',  kind: 'text', placeholder: 'Legend of Blue Eyes White Dragon' },
        { id: 'setCode',  label: 'Set code + #', kind: 'text', placeholder: 'LOB-001' },
        { id: 'passcode', label: 'Passcode',  kind: 'text', placeholder: '8-digit code' },
        { id: 'year',     label: 'Year / Print date', kind: 'text' },
        { id: 'language', label: 'Language',  kind: 'text' },
      ] },
      { id: 'cg', label: 'Rarity & Condition', fields: [
        { id: 'rarity',    label: 'Rarity',    kind: 'select', options: ['Common','Rare','Super Rare','Ultra Rare','Secret Rare','Ultimate Rare','Ghost Rare',"Collector's Rare",'Starlight Rare'] },
        { id: 'edition',   label: 'Edition',   kind: 'select', options: ['1st Edition','Unlimited','Limited Edition'] },
        { id: 'condition', label: 'Condition', kind: 'select', options: ['Mint','Near Mint','Lightly Played','Moderately Played','Heavily Played','Damaged'] },
      ] },
    ],
  },
  {
    id: 'mtg', label: 'Magic: The Gathering', emoji: '🧙', short: 'MTG',
    sections: [
      { id: 'info', label: 'Card Info', fields: [
        { id: 'name',     label: 'Card name',         kind: 'text' },
        { id: 'set',      label: 'Set name',          kind: 'text', placeholder: 'Bloomburrow' },
        { id: 'number',   label: 'Collector number',  kind: 'text', placeholder: '042/286' },
        { id: 'mana',     label: 'Mana cost',         kind: 'text', placeholder: '{2}{U}{U}' },
        { id: 'type',     label: 'Card type',         kind: 'text', placeholder: 'Creature — Dragon' },
        { id: 'year',     label: 'Year / Set release', kind: 'text' },
        { id: 'language', label: 'Language',          kind: 'text' },
      ] },
      { id: 'cg', label: 'Rarity & Condition', fields: [
        { id: 'rarity',    label: 'Rarity',    kind: 'select', options: ['Common','Uncommon','Rare','Mythic Rare','Special'] },
        { id: 'finish',    label: 'Finish',    kind: 'select', options: ['Nonfoil','Foil','Etched Foil','Serialized','Borderless','Extended Art','Showcase','Full Art'] },
        { id: 'condition', label: 'Condition', kind: 'select', options: ['Mint','Near Mint','Lightly Played','Moderately Played','Heavily Played','Damaged'] },
      ] },
      { id: 'legality', label: 'Format Legality', fields: [
        { id: 'formats', label: 'Legal in', kind: 'multiselect',
          options: ['Standard','Pioneer','Modern','Legacy','Vintage','Commander','Pauper'] },
      ] },
    ],
  },
  {
    id: 'other', label: 'Other / Generic', emoji: '📦', short: 'Other',
    sections: [
      { id: 'info', label: 'Card Info', fields: [
        { id: 'name',      label: 'Card name',         kind: 'text' },
        { id: 'set',       label: 'Collection / Set',  kind: 'text' },
        { id: 'number',    label: 'Card number',       kind: 'text' },
        { id: 'rarity',    label: 'Rarity',            kind: 'text' },
        { id: 'condition', label: 'Condition',         kind: 'text' },
        { id: 'year',      label: 'Year',              kind: 'text' },
      ] },
      { id: 'custom', label: 'Custom Field', fields: [
        { id: 'customLabel', label: 'Label', kind: 'text', placeholder: 'e.g. Region' },
        { id: 'customValue', label: 'Value', kind: 'text', placeholder: 'e.g. Japan exclusive' },
      ] },
    ],
  },
];
const collectionDef = (id) => COLLECTIONS.find(c => c.id === id) || COLLECTIONS[0];

/* Flatten a collection's fields for easy iteration / migration. */
function allFieldsOf(collectionId) {
  const c = collectionDef(collectionId);
  return c.sections.flatMap(s => s.fields);
}

/* ──────────────────────────────────────────────────────
   Helpers — Sheet model

   A binder is an ordered list of SHEETS. Each sheet has two
   faces (front + back). The display "spread" is DERIVED from
   the sheet list — covers are fixed at the outermost positions
   and are not sheets.

   N sheets → N+1 spreads:
     Spread 0: [Inside Front Cover] | [Sheet 0 front]
     Spread i: [Sheet i-1 back]     | [Sheet i front]
     Spread N: [Sheet N-1 back]     | [Inside Back Cover]

   Page names auto-increment from a per-binder global counter
   that NEVER resets (so names stay stable across delete/reorder).
   ────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 10);

function makeEmptyFace(gridType) {
  const { perPage } = gridDef(gridType);
  return { slots: Array.from({ length: perPage }, () => null) };
}
function makeSheet(gridType, frontPageNum) {
  const n = frontPageNum;
  return {
    id: uid(),
    frontName: `Page ${n}`,
    backName:  `Page ${n + 1}`,
    front: makeEmptyFace(gridType),
    back:  makeEmptyFace(gridType),
  };
}
function makeBinder({ name, colorId, gridType, sheetCount = 3, collectionType = 'kpop', skin = 'pastel' }) {
  const count = Math.max(1, sheetCount);
  const sheets = [];
  for (let i = 0; i < count; i++) sheets.push(makeSheet(gridType, i * 2 + 1));
  /* Default colorId to the first color in the chosen skin's palette */
  const resolvedColorId = colorId || skinDef(skin).colors[0].id;
  return {
    id: uid(),
    name: name || 'New binder',
    colorId: resolvedColorId,
    gridType,
    collectionType,
    skin,
    sheets,
    nextPageNumber: count * 2 + 1, // global counter; never resets
  };
}

/* Derived view of spreads for rendering. Returns an array of
   N+1 spread descriptors, each with a left + right face.
   Each face is either { kind: 'cover' } or
   { kind: 'face', sheetId, face: 'front'|'back', name, slots }.
*/
function computeSpreads(binder) {
  const sheets = binder.sheets || [];
  const out = [];
  for (let i = 0; i <= sheets.length; i++) {
    const left = i === 0
      ? { kind: 'cover', name: 'Inside Cover' }
      : { kind: 'face', sheetId: sheets[i - 1].id, face: 'back', name: sheets[i - 1].backName,  slots: sheets[i - 1].back.slots };
    const right = i === sheets.length
      ? { kind: 'cover', name: 'Inside Cover' }
      : { kind: 'face', sheetId: sheets[i].id,     face: 'front', name: sheets[i].frontName, slots: sheets[i].front.slots };
    out.push({ index: i, left, right });
  }
  return out;
}

/* Total filled cards across a binder. */
function countCards(binder) {
  return (binder.sheets || []).reduce((sum, s) =>
    sum + s.front.slots.filter(Boolean).length + s.back.slots.filter(Boolean).length, 0);
}

/* turn a File into a data URL */
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/* ──────────────────────────────────────────────────────
   Sidebar — binders grouped by collection type.
   Section headers only render when the group has ≥1 binder.
   ────────────────────────────────────────────────────── */
function Sidebar({ binders, selectedId, onSelect, onNew, onEdit, onDelete, onReorderSpreads }) {
  /* Group binders by collectionType, preserving binder order within each group
     and rendering groups in COLLECTIONS-defined order so the sidebar stays stable. */
  const groups = COLLECTIONS
    .map(c => ({ coll: c, items: binders.filter(b => (b.collectionType || 'kpop') === c.id) }))
    .filter(g => g.items.length > 0);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo"><img src="/logo.png" alt="Card logo" /></div>
        <div>
          <div className="brand-name">Card</div>
          <div className="brand-tag">binder organizer</div>
        </div>
      </div>

      <div className="side-label">My binders</div>

      <div className="binder-list">
        {groups.length === 0 && (
          <div style={{ color: 'var(--ink-fade)', fontSize: 13, padding: '20px 10px', textAlign: 'center' }}>
            No binders yet — make your first one ↓
          </div>
        )}
        {groups.map(({ coll, items }) => (
          <div className="binder-group" key={coll.id}>
            <div className="binder-group-head">
              <span className="binder-group-emoji" aria-hidden="true">{coll.emoji}</span>
              <span className="binder-group-label">{coll.label}</span>
              <span className="binder-group-count">{items.length}</span>
            </div>
            {items.map(b => {
              const c = colorOf(b);
              const cardsCount = countCards(b);
              const sheetCount = (b.sheets || []).length;
              return (
                <div
                  key={b.id}
                  className={`binder-row ${b.id === selectedId ? 'active' : ''}`}
                  onClick={() => onSelect(b.id)}
                >
                  <div className="binder-dot" style={{ background: c.cover }}></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="binder-name">{b.name}</div>
                    <div className="binder-meta">{sheetCount} sheet{sheetCount === 1 ? '' : 's'} · {cardsCount} card{cardsCount === 1 ? '' : 's'}</div>
                  </div>
                  <div className="binder-actions">
                    <button className="icon-btn" title="Edit binder" onClick={e => { e.stopPropagation(); onEdit(b.id); }}>
                      <Icon.pencil />
                    </button>
                    <button className="icon-btn" title="Manage sheets" onClick={e => { e.stopPropagation(); onReorderSpreads(b.id); }}>
                      <Icon.shuffle />
                    </button>
                    <button className="icon-btn" title="Delete binder" onClick={e => { e.stopPropagation(); onDelete(b.id); }}>
                      <Icon.trash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <button className="new-binder-btn" onClick={onNew}>
        <Icon.plus /> New Binder
      </button>

      <div className="sidebar-foot">Card · Binder Organizer</div>
    </aside>
  );
}

/* ──────────────────────────────────────────────────────
   Card slot
   ────────────────────────────────────────────────────── */
function Slot({ card, slotBorder, onClick, onEdit, onDelete, removing }) {
  if (!card) {
    return (
      <button className="slot empty" style={{ '--slot-border': slotBorder }} onClick={onClick}>
        <Icon.plus />
      </button>
    );
  }

  const sleeveClass = card.sleeve?.type === 'holographic'
    ? 'sleeve-holo'
    : card.sleeve?.type === 'colored'
      ? 'sleeve-colored'
      : 'sleeve-none';

  const sleeveStyle = card.sleeve?.type === 'colored'
    ? { background: card.sleeve.color || '#ffffff' }
    : undefined;

  const isColorMode = card.mode === 'color';
  const status = statusDef(card.status);
  const StatusIcon = status ? Icon[status.icon] : null;

  return (
    <div className={`slot filled ${removing ? 'removing' : ''}`} onClick={onClick}>
      <div className={`card ${sleeveClass}`} style={sleeveStyle}>
        {isColorMode ? (
          <div className="card-color" style={{ background: card.color || '#fff' }} />
        ) : card.image ? (
          <img className="card-img" src={card.image} alt="" />
        ) : (
          <div className="card-back-empty">no<br/>image</div>
        )}

        {status && (
          <div
            className={`card-status status-${status.id}`}
            style={{ '--st-bg': status.bg, '--st-ink': status.ink }}
            title={status.label}
          >
            <StatusIcon />
            <span className="card-status-label">{status.label}</span>
          </div>
        )}
      </div>

      <div className="slot-tools" onClick={e => e.stopPropagation()}>
        <button className="tool-btn" title="Edit" onClick={onEdit}><Icon.pencil /></button>
        <button className="tool-btn danger" title="Delete" onClick={onDelete}><Icon.trash /></button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   Page (a grid of slots)
   ────────────────────────────────────────────────────── */
function Page({ page, side, gridType, colorId, onSlotClick, onSlotEdit, onSlotDelete, removingKey }) {
  const g = gridDef(gridType);
  const p = palette(colorId);
  return (
    <div className={`page ${side}`}>
      <div className={`page-inner grid-${g.cols}`}>
        {page.slots.map((card, i) => (
          <Slot
            key={i}
            card={card}
            slotBorder={p.tint}
            removing={removingKey === `${side}-${i}`}
            onClick={() => onSlotClick(side, i)}
            onEdit={(e) => { e.stopPropagation(); onSlotEdit(side, i); }}
            onDelete={(e) => { e.stopPropagation(); onSlotDelete(side, i); }}
          />
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   Cover page — decorative inside-cover, color matches binder.
   side = 'left' (inside front) or 'right' (inside back, mirrored).
   ────────────────────────────────────────────────────── */
function CoverPage({ side, colorId, skin = 'pastel' }) {
  /* Resolve from the binder's actual skin palette — not the pastel-only
     palette() — so leather/holo/matte/dark inside covers match the cover
     material instead of falling back to pink. */
  const s = skinDef(skin);
  const p = s.colors.find(c => c.id === colorId) || s.colors[0];
  return (
    <div
      className={`page cover-page ${side}`}
      style={{
        '--cover': p.cover,
        '--cover-tint': p.tint,
        '--cover-dark': p.dark,
      }}
    >
      <div className="cover-inner">
        <div className="cover-label">{side === 'left' ? 'Pocaroo ♡' : '♡ collection'}</div>
        <div className="cover-lines">
          <span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
        <div className="cover-pocket">
          <div className="pocket-tab"></div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   Spine bar — gray vertical bar at center, sits BEHIND pages.
   ────────────────────────────────────────────────────── */
function SpineBar() {
  return <div className="spine-bar" aria-hidden="true"></div>;
}

/* ──────────────────────────────────────────────────────
   Ring hooks — drawn ON TOP of pages, peeking out from page edges.
   Fixed intrinsic height % of binder; preserveAspectRatio="xMidYMid meet".
   ────────────────────────────────────────────────────── */
function RingHooks() {
  // 6 ring positions in % along height
  const rings = [10, 26, 42, 58, 74, 90];
  return (
    <div className="ring-hooks" aria-hidden="true">
      <svg viewBox="0 0 60 600" preserveAspectRatio="xMidYMid meet">
        {rings.map((y, i) => {
          const cy = y * 6;
          return (
            <g key={i} transform={`translate(0, ${cy})`}>
              {/* Ring is a full closed loop (D-ring viewed from front).
                  Shadow ring slightly larger for depth. */}
              <ellipse cx="30" cy="0" rx="22" ry="16" fill="none" stroke="#3a3837" strokeWidth="6" opacity=".25" />
              <ellipse cx="30" cy="0" rx="22" ry="16" fill="none" stroke="#5a5856" strokeWidth="4.5" strokeLinecap="round" />
              <ellipse cx="30" cy="-1" rx="20" ry="14" fill="none" stroke="#9d9b99" strokeWidth="1.4" />
              {/* highlight */}
              <path d="M 14 -4 Q 18 -16 30 -16" fill="none" stroke="#eae7e4" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export {
  Icon,
  PASTELS,
  palette,
  SKINS,
  skinDef,
  colorOf,
  STATUSES,
  statusDef,
  GRID_TYPES,
  gridDef,
  COLLECTIONS,
  collectionDef,
  allFieldsOf,
  uid,
  makeBinder,
  makeSheet,
  makeEmptyFace,
  computeSpreads,
  countCards,
  fileToDataURL,
  Sidebar,
  Slot,
  Page,
  CoverPage,
  SpineBar,
  RingHooks,
};
