/*
 * Demo collection from the original Claude Design prototype
 * (design/binder-organizer.html). Seeded into an empty database so the app
 * opens with something to look at. Disable with POCABIN_SEED_DEMO=false.
 */

function demoImage({ bg1, bg2, accent, member }) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 320' preserveAspectRatio='xMidYMid slice'>
    <defs>
      <linearGradient id='bg' x1='0' x2='0' y1='0' y2='1'>
        <stop offset='0' stop-color='${bg1}'/>
        <stop offset='1' stop-color='${bg2}'/>
      </linearGradient>
      <radialGradient id='glow' cx='50%' cy='35%' r='50%'>
        <stop offset='0' stop-color='white' stop-opacity='.45'/>
        <stop offset='1' stop-color='white' stop-opacity='0'/>
      </radialGradient>
    </defs>
    <rect width='220' height='320' fill='url(#bg)'/>
    <rect width='220' height='320' fill='url(#glow)'/>
    <ellipse cx='110' cy='145' rx='44' ry='52' fill='${accent}' opacity='.92'/>
    <path d='M65 120 Q70 70 110 65 Q150 70 155 120 Q155 105 145 100 Q135 85 110 82 Q85 85 75 100 Q65 105 65 120 Z' fill='#2a1f1a' opacity='.78'/>
    <path d='M40 320 Q40 235 110 220 Q180 235 180 320 Z' fill='${accent}' opacity='.78'/>
    <g fill='white' opacity='.85'>
      <circle cx='55' cy='65' r='2.5'/><circle cx='175' cy='90' r='1.8'/>
      <circle cx='40' cy='200' r='2'/><circle cx='190' cy='250' r='2.4'/>
    </g>
    <rect x='14' y='275' width='192' height='30' rx='6' fill='white' opacity='.92'/>
    <text x='110' y='295' text-anchor='middle' font-family='Quicksand, sans-serif' font-weight='700' font-size='14' fill='${bg2}'>${member}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function demoCard({ bg1, bg2, accent, member, group, album, version, pob, year, sleeve, status }) {
  return {
    mode: 'image',
    image: demoImage({ bg1, bg2, accent, member }),
    color: '#ffd1dc',
    sleeve: sleeve || { type: 'none', color: '#ffffff' },
    status: status || null,
    meta: { member, group, album, version, pob, year },
  };
}

export function seedDemo(repo) {
  const put = (binder, sheetIdx, face, slot, card) =>
    repo.upsertCard(binder.id, binder.sheets[sheetIdx].id, face, slot, card);

  // K-pop: NewJeans — pastel pink
  const b1 = repo.create({ name: 'NewJeans', colorId: 'pink', gridType: '2x2', sheetCount: 4, collectionType: 'kpop', skin: 'pastel' });
  put(b1, 0, 'front', 0, demoCard({ bg1: '#ffd1dc', bg2: '#ff8aa3', accent: '#fff5e9', member: 'Minji', group: 'NewJeans', album: 'Get Up', version: 'Bunini Ver.', pob: 'Weverse', year: '2023', sleeve: { type: 'holographic' }, status: 'have' }));
  put(b1, 0, 'front', 1, demoCard({ bg1: '#ffe5d1', bg2: '#ffb78a', accent: '#fff5e9', member: 'Hanni', group: 'NewJeans', album: 'Get Up', version: 'Bunini Ver.', pob: 'Soundwave', year: '2023', sleeve: { type: 'colored', color: '#ffffff' }, status: 'priority' }));
  put(b1, 0, 'front', 2, demoCard({ bg1: '#e7d1ff', bg2: '#a98aff', accent: '#fff5e9', member: 'Danielle', group: 'NewJeans', album: 'Get Up', version: 'Bunini Ver.', pob: 'Hottracks', year: '2023', sleeve: { type: 'colored', color: '#2a2a2a' }, status: 'on-the-way' }));
  put(b1, 0, 'front', 3, demoCard({ bg1: '#d1ffe5', bg2: '#8affb7', accent: '#fff5e9', member: 'Haerin', group: 'NewJeans', album: 'Get Up', version: 'Bunini Ver.', pob: 'Weverse', year: '2023', status: 'have' }));
  put(b1, 1, 'front', 0, demoCard({ bg1: '#d1e7ff', bg2: '#8aa8ff', accent: '#fff5e9', member: 'Hyein', group: 'NewJeans', album: 'OMG', version: 'Message Ver.', pob: 'Weverse', year: '2023' }));
  put(b1, 1, 'front', 3, demoCard({ bg1: '#ffd9b3', bg2: '#ff9966', accent: '#fff5e9', member: 'Minji', group: 'NewJeans', album: 'Super Shy', version: 'Single Ver.', pob: 'Music+', year: '2023' }));
  put(b1, 1, 'back', 1, { mode: 'color', image: null, color: '#1a1a1a', sleeve: { type: 'holographic' }, status: 'want-to-buy', meta: { member: 'wishlist', group: 'NewJeans', album: '', version: '', pob: '', year: '' } });

  // K-pop: aespa — holographic silver
  const b2 = repo.create({ name: 'aespa', colorId: 'silver', gridType: '3x3', sheetCount: 3, collectionType: 'kpop', skin: 'holo' });
  put(b2, 1, 'front', 0, demoCard({ bg1: '#e7d1ff', bg2: '#9166ff', accent: '#fff5e9', member: 'Karina', group: 'aespa', album: 'My World', version: 'Tabloid Ver.', pob: 'Ktown4u', year: '2023' }));
  put(b2, 1, 'front', 4, demoCard({ bg1: '#d1d9ff', bg2: '#7a8eff', accent: '#fff5e9', member: 'Winter', group: 'aespa', album: 'My World', version: 'Tabloid Ver.', pob: 'Ktown4u', year: '2023' }));
  put(b2, 1, 'back', 2, demoCard({ bg1: '#ffd1f0', bg2: '#ff66c4', accent: '#fff5e9', member: 'Giselle', group: 'aespa', album: 'My World', version: 'Poster Ver.', pob: 'Aladin', year: '2023' }));
  put(b2, 1, 'back', 5, demoCard({ bg1: '#d1ffd9', bg2: '#66cc8a', accent: '#fff5e9', member: 'Ningning', group: 'aespa', album: 'My World', version: 'Tabloid Ver.', pob: 'Ktown4u', year: '2023', sleeve: { type: 'holographic' } }));

  // Pokémon — leather cognac
  const b3 = repo.create({ name: 'Prismatic Evolutions', colorId: 'cognac', gridType: '3x3', sheetCount: 2, collectionType: 'pokemon', skin: 'leather' });
  put(b3, 0, 'front', 0, {
    mode: 'color', image: null, color: '#ffe066', sleeve: { type: 'none', color: '#fff' }, status: 'have',
    meta: { name: 'Pikachu ex', set: 'Scarlet & Violet — Prismatic Evolutions', number: '025/131', rarity: 'Special Illustration Rare', variant: 'Special Illustration', condition: 'Mint', year: '2025', language: 'English' },
  });
  put(b3, 0, 'front', 4, {
    mode: 'color', image: null, color: '#b3ffd9', sleeve: { type: 'holographic' }, status: 'priority',
    meta: { name: 'Eevee', set: 'Scarlet & Violet — Prismatic Evolutions', number: '075/131', rarity: 'Ultra Rare', variant: 'Full Art', condition: 'Near Mint', year: '2025', language: 'English' },
  });

  // Sports — dark collector
  const b4 = repo.create({ name: 'NBA Rookies', colorId: 'deep-navy', gridType: '2x2', sheetCount: 1, collectionType: 'sports', skin: 'dark' });
  put(b4, 0, 'front', 0, {
    mode: 'color', image: null, color: '#3b6bd6', sleeve: { type: 'colored', color: '#ffd6e0' }, status: 'priority',
    meta: { player: 'Victor Wembanyama', team: 'San Antonio Spurs', sport: 'NBA', brand: 'Panini', set: 'Prizm', number: '#136', year: '2023', parallel: 'Silver Prizm', serial: '', rookie: true, features: ['Short Print'], condition: 'Gem Mint', grade: 'PSA 10' },
  });

  // Stray Kids — matte sage, empty
  repo.create({ name: 'Stray Kids', colorId: 'sage', gridType: '2x2', sheetCount: 2, collectionType: 'kpop', skin: 'matte' });
}
