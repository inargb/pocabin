import React from 'react';
import { Icon, colorOf, collectionDef, COLLECTIONS } from './core';
const { useState: useStateV, useMemo: useMemoV } = React;

/* ══════════════════════════════════════════════════════════════════
   views.jsx — the three top-tab destinations beyond "My Binders":
     · TopTabs       — the My Binders / Community / Stats switcher
     · CommunityView — discover other collectors (3 layout variants)
     · StatsView     — collection value / completion / activity
     · ScannerOverlay— the AI card scanner flow (3 form variants)
   plus seed data + a deterministic value estimator shared by Stats.
   ══════════════════════════════════════════════════════════════════ */

/* ── Value estimator ───────────────────────────────────────────────
   A rough, deterministic market estimate per card so the tracker reads
   like a serious value tool. Keyed off collection type + metadata. */
function estimateCardValue(card, type) {
  if (!card) return 0;
  const m = card.meta || {};
  let v = 5;
  if (type === 'pokemon') {
    const r = (m.rarity || '').toLowerCase();
    v = r.includes('special illustration') ? 118 : r.includes('hyper') ? 88
      : r.includes('secret') ? 76 : r.includes('ultra') ? 54
      : r.includes('illustration') ? 38 : r.includes('double') ? 12
      : r.includes('rare') ? 6 : 2;
    if (/Full Art|Special|Rainbow|Gold/i.test(m.variant || '')) v *= 1.25;
  } else if (type === 'sports') {
    v = 35;
    if (m.rookie) v += 55;
    if (/Silver Prizm|Refractor|Gold|Auto/i.test((m.parallel || '') + (m.features || []).join())) v += 75;
    if (/PSA 10|BGS 9\.5|Gem/i.test((m.grade || '') + (m.condition || ''))) v *= 2.4;
  } else if (type === 'mtg') {
    const r = (m.rarity || '').toLowerCase();
    v = r.includes('mythic') ? 24 : r.includes('rare') ? 8 : r.includes('uncommon') ? 2 : 1;
    if (/Foil|Serialized|Borderless|Showcase/i.test(m.finish || '')) v *= 1.8;
  } else if (type === 'yugioh') {
    const r = (m.rarity || '').toLowerCase();
    v = (r.includes('ghost') || r.includes('starlight')) ? 115 : r.includes('collector') ? 58
      : r.includes('ultimate') ? 38 : r.includes('secret') ? 28
      : r.includes('ultra') ? 12 : r.includes('super') ? 6 : 2;
  } else { /* kpop + other */
    v = 13;
    if (card.sleeve && card.sleeve.type === 'holographic') v += 9;
    if (/weverse|ktown|soundwave|aladin/i.test(m.pob || '')) v += 4;
  }
  if (card.status === 'priority') v = Math.round(v * 1.1);
  return Math.round(v);
}
function binderValue(b) {
  return (b.sheets || []).reduce((sum, s) =>
    sum + [...s.front.slots, ...s.back.slots].reduce((a, c) => a + estimateCardValue(c, b.collectionType), 0), 0);
}
const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

/* ── Top tabs ──────────────────────────────────────────────────── */
const TABS = [
  { id: 'binders',   label: 'My Binders', icon: 'book' },
  { id: 'community', label: 'Community',  icon: 'heart' },
  { id: 'stats',     label: 'Stats',      icon: 'chart' },
];
function TopTabs({ tab, onTab, onScan }) {
  return (
    <div className="topnav">
      <div className="topnav-tabs" role="tablist">
        {TABS.map(t => {
          const I = Icon[t.icon] || Icon.book;
          return (
            <button key={t.id} role="tab" aria-selected={tab === t.id}
              className={`topnav-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => onTab(t.id)}>
              <I /> {t.label}
            </button>
          );
        })}
      </div>
      <button className="scan-btn" onClick={onScan}>
        <Icon.scan /> Scan cards
      </button>
    </div>
  );
}

/* ── Mini binder visual (closed front), reused across Community ──── */
function MiniBinder({ binder, size = 'md' }) {
  const c = colorOf(binder);
  const coll = collectionDef(binder.collectionType);
  return (
    <div className={`mini-binder mb-${size} mb--${binder.skin || 'pastel'}`}
      style={{ '--cover': c.cover, '--cover-tint': c.tint, '--cover-dark': c.dark }}>
      <div className="mb-spine"><span></span><span></span><span></span></div>
      <div className="mb-face">
        <div className="mb-label">
          <span className="mb-emoji">{coll.emoji}</span>
          <span className="mb-name">{binder.name}</span>
          <span className="mb-sub">{coll.short}</span>
        </div>
      </div>
      <div className="mb-clasp"></div>
    </div>
  );
}

/* ── Community seed data ───────────────────────────────────────────
   Lightweight "shared binder" records — not full binder models, just
   enough for cards + the detail modal. Mixed across collection types. */
const COLLECTORS = [
  { id:'c1', user:'minari.collects', name:'Minari', av:'#9333EA', loc:'Seoul', binder:{ name:'NewJeans — Get Up', collectionType:'kpop', skin:'pastel', colorId:'pink', gridType:'2x2' }, cards:84, slots:96, likes:1240, value:1180, tags:['NewJeans','OMG era','Weverse POBs'], blurb:'Full Get Up era set + a few grails. Always down to trade dupes.' },
  { id:'c2', user:'prismatic.pulls', name:'Devon', av:'#2563EB', loc:'Austin, TX', binder:{ name:'Prismatic Evolutions', collectionType:'pokemon', skin:'leather', colorId:'cognac', gridType:'3x3' }, cards:121, slots:144, likes:3010, value:4820, tags:['Eevee','SIR','English'], blurb:'Chasing the master set. PSA submissions in progress.' },
  { id:'c3', user:'hardwood.heroes', name:'Marcus', av:'#0E7490', loc:'Chicago', binder:{ name:'NBA Rookies 23-24', collectionType:'sports', skin:'dark', colorId:'deep-navy', gridType:'2x2' }, cards:36, slots:48, likes:842, value:6450, tags:['Wembanyama','Prizm','Rookies'], blurb:'Rookie-year Prizm parallels. The Wemby Silver is graded PSA 10.' },
  { id:'c4', user:'planeswalk', name:'Sora', av:'#7C3AED', loc:'Vancouver', binder:{ name:'Bloomburrow Foils', collectionType:'mtg', skin:'matte', colorId:'sage', gridType:'3x3' }, cards:63, slots:81, likes:519, value:910, tags:['Foil','Borderless','Commander'], blurb:'EDH-legal foils only. Sorted by color identity.' },
  { id:'c5', user:'aespa.archive', name:'Lena', av:'#DB2777', loc:'Manila', binder:{ name:'aespa — My World', collectionType:'kpop', skin:'holo', colorId:'silver', gridType:'3x3' }, cards:54, slots:81, likes:2105, value:760, tags:['Karina','Tabloid Ver.','Ktown4u'], blurb:'Holo binder for holo girls. Member-sorted, version-complete.' },
  { id:'c6', user:'blueeyes.bcds', name:'Kenji', av:'#1D4ED8', loc:'Osaka', binder:{ name:'Blue-Eyes Legacy', collectionType:'yugioh', skin:'dark', colorId:'deep-plum', gridType:'3x3' }, cards:41, slots:54, likes:1390, value:2240, tags:['Secret Rare','1st Edition','LOB'], blurb:'Vintage Blue-Eyes printings, 1st edition where possible.' },
  { id:'c7', user:'cozy.pulls', name:'Ria', av:'#C026D3', loc:'London', binder:{ name:'Stray Kids — ATE', collectionType:'kpop', skin:'matte', colorId:'mauve', gridType:'2x2' }, cards:28, slots:48, likes:660, value:410, tags:['Hyunjin','POB','OT8'], blurb:'Slowly building OT8. Matte binder, soft-girl arrangement.' },
  { id:'c8', user:'gridiron.gold', name:'Tre', av:'#0891B2', loc:'Atlanta', binder:{ name:'NFL Optic Rookies', collectionType:'sports', skin:'leather', colorId:'burgundy', gridType:'3x3' }, cards:72, slots:81, likes:980, value:3120, tags:['Optic','Holo','Rookies'], blurb:'Donruss Optic rookie holos. Centering snob, sorry not sorry.' },
];

function CommunityView({ layout, onOpen }) {
  const [filter, setFilter] = useStateV('all');
  const filtered = useMemoV(
    () => filter === 'all' ? COLLECTORS : COLLECTORS.filter(c => c.binder.collectionType === filter),
    [filter]
  );
  const chips = [{ id:'all', label:'All', emoji:'✦' },
    ...COLLECTIONS.filter(c => COLLECTORS.some(x => x.binder.collectionType === c.id))
      .map(c => ({ id:c.id, label:c.short, emoji:c.emoji }))];

  return (
    <div className="view community" data-layout={layout}>
      <div className="view-head">
        <div>
          <h1 className="view-title">Community</h1>
          <p className="view-sub">Discover binders from collectors around the world.</p>
        </div>
        <div className="view-search">
          <Icon.search /><input placeholder="Search collectors, sets, members…" />
        </div>
      </div>

      <div className="filter-row">
        {chips.map(ch => (
          <button key={ch.id} className={`filter-chip ${filter === ch.id ? 'active' : ''}`}
            onClick={() => setFilter(ch.id)}>
            <span className="fc-emoji">{ch.emoji}</span>{ch.label}
          </button>
        ))}
      </div>

      <div className={`community-grid cg-${layout}`}>
        {filtered.map(col => {
          const pct = Math.round((col.cards / col.slots) * 100);
          return (
            <button key={col.id} className="collector-card" onClick={() => onOpen(col)}>
              <div className="cc-binder">
                <MiniBinder binder={col.binder} size={layout === 'tiles' ? 'sm' : 'md'} />
              </div>
              <div className="cc-body">
                <div className="cc-top">
                  <div className="cc-avatar" style={{ background: col.av }}>{col.name[0]}</div>
                  <div className="cc-who">
                    <span className="cc-handle">@{col.user}</span>
                    <span className="cc-loc">{col.loc}</span>
                  </div>
                  <span className="cc-like"><Icon.heart />{col.likes > 999 ? (col.likes/1000).toFixed(1)+'k' : col.likes}</span>
                </div>
                <div className="cc-bname">{col.binder.name}</div>
                <div className="cc-stats">
                  <span><strong>{col.cards}</strong> cards</span>
                  <span className="cc-dot">·</span>
                  <span><strong>{money(col.value)}</strong> est.</span>
                </div>
                <div className="cc-progress"><div className="cc-progress-fill" style={{ width: pct + '%' }}></div></div>
                <div className="cc-progress-label">{pct}% complete</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Community → shared binder detail ──────────────────────────── */
function CommunityModal({ col, onClose }) {
  const [liked, setLiked] = useStateV(false);
  if (!col) return null;
  const pct = Math.round((col.cards / col.slots) * 100);
  const coll = collectionDef(col.binder.collectionType);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal community-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><Icon.close /></button>
        <div className="cm-hero">
          <MiniBinder binder={col.binder} size="lg" />
        </div>
        <div className="cm-body">
          <div className="cm-head">
            <div className="cc-avatar lg" style={{ background: col.av }}>{col.name[0]}</div>
            <div>
              <div className="cm-name">{col.name} <span className="cm-handle">@{col.user}</span></div>
              <div className="cm-loc"><Icon.pin /> {col.loc}</div>
            </div>
          </div>
          <h2 className="cm-title">{coll.emoji} {col.binder.name}</h2>
          <p className="cm-blurb">{col.blurb}</p>
          <div className="cm-tags">{col.tags.map(t => <span key={t} className="cm-tag">{t}</span>)}</div>
          <div className="cm-metrics">
            <div className="cm-metric"><span className="cm-metric-n">{col.cards}/{col.slots}</span><span className="cm-metric-l">Cards</span></div>
            <div className="cm-metric"><span className="cm-metric-n">{pct}%</span><span className="cm-metric-l">Complete</span></div>
            <div className="cm-metric"><span className="cm-metric-n">{money(col.value)}</span><span className="cm-metric-l">Est. value</span></div>
          </div>
          <div className="cm-actions">
            <button className={`btn primary ${liked ? 'liked' : ''}`} onClick={() => setLiked(v => !v)}>
              <Icon.heart /> {liked ? 'Liked' : 'Like binder'}
            </button>
            <button className="btn ghost"><Icon.book /> Follow collector</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export {
  estimateCardValue,
  binderValue,
  money,
  TopTabs,
  MiniBinder,
  CommunityView,
  CommunityModal,
  COLLECTORS,
};
