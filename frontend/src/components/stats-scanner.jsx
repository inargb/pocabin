import React from 'react';
import { Icon, collectionDef, STATUSES, countCards } from './core';
import { binderValue, money, MiniBinder } from './views';
const { useState: useStateS, useMemo: useMemoS, useEffect: useEffectS } = React;

/* ══════════════════════════════════════════════════════════════════
   views2.jsx — StatsView + ScannerOverlay
   ══════════════════════════════════════════════════════════════════ */

/* polar helper for donut */
function arc(cx, cy, r, a0, a1) {
  const p = (a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}

function StatsView({ binders, density, accent }) {
  const stats = useMemoS(() => {
    let cards = 0, slots = 0, value = 0;
    const byColl = {}, byStatus = {};
    const perBinder = [];
    binders.forEach(b => {
      const c = countCards(b);
      const sl = (b.sheets || []).reduce((a, s) => a + s.front.slots.length + s.back.slots.length, 0);
      const val = binderValue(b);
      cards += c; slots += sl; value += val;
      byColl[b.collectionType] = (byColl[b.collectionType] || 0) + val;
      (b.sheets || []).forEach(s => [...s.front.slots, ...s.back.slots].forEach(card => {
        if (card && card.status) byStatus[card.status] = (byStatus[card.status] || 0) + 1;
      }));
      perBinder.push({ b, cards: c, slots: sl, value: val });
    });
    perBinder.sort((a, z) => z.value - a.value);
    return { cards, slots, value, byColl, byStatus, perBinder };
  }, [binders]);

  const completion = stats.slots ? Math.round((stats.cards / stats.slots) * 100) : 0;
  const collEntries = Object.entries(stats.byColl).sort((a, b) => b[1] - a[1]);
  const collTotal = collEntries.reduce((a, [, v]) => a + v, 0) || 1;

  /* synthetic 8-month value trend ending at current total */
  const trend = useMemoS(() => {
    const end = stats.value || 1;
    const pts = [0.42, 0.5, 0.58, 0.55, 0.7, 0.82, 0.91, 1].map(f => Math.round(end * f));
    return pts;
  }, [stats.value]);

  const activity = [
    { icon:'scan',  txt:'Scanned & added Eevee — Full Art to Prismatic Evolutions', t:'2h ago', val:'+$38' },
    { icon:'check', txt:'Marked Karina · Tabloid Ver. as Have', t:'Yesterday', val:'' },
    { icon:'star',  txt:'Flagged Pikachu ex as Priority', t:'Yesterday', val:'' },
    { icon:'truck', txt:'Danielle · Bunini Ver. is on the way', t:'2 days ago', val:'' },
    { icon:'heart', txt:'Liked @prismatic.pulls’ master set binder', t:'4 days ago', val:'' },
  ];

  const palette = ['#9333EA', '#2563EB', '#0E7490', '#DB2777', '#7C3AED', '#0891B2', '#A16207'];
  // donut geometry
  const R = 52, CX = 64, CY = 64;
  let acc = -Math.PI / 2;
  const segs = collEntries.map(([id, v], i) => {
    const frac = v / collTotal;
    const a0 = acc, a1 = acc + frac * Math.PI * 2;
    acc = a1;
    return { id, v, frac, a0, a1: a1 - 0.02, color: palette[i % palette.length] };
  });

  const maxTrend = Math.max(...trend, 1);

  return (
    <div className="view stats" data-density={density}>
      <div className="view-head">
        <div>
          <h1 className="view-title">Collection stats</h1>
          <p className="view-sub">Across {binders.length} binders · updated just now</p>
        </div>
      </div>

      {/* headline metric cards */}
      <div className="stat-cards">
        <div className="stat-card hero">
          <div className="stat-k">Estimated value</div>
          <div className="stat-v">{money(stats.value)}</div>
          <div className="stat-trend up"><Icon.arrowUp /> +9% this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-k">Total cards</div>
          <div className="stat-v">{stats.cards}</div>
          <div className="stat-sub">{stats.slots} slots</div>
        </div>
        <div className="stat-card">
          <div className="stat-k">Completion</div>
          <div className="stat-v">{completion}%</div>
          <div className="stat-bar"><div style={{ width: completion + '%' }}></div></div>
        </div>
        <div className="stat-card">
          <div className="stat-k">Binders</div>
          <div className="stat-v">{binders.length}</div>
          <div className="stat-sub">{collEntries.length} collection types</div>
        </div>
      </div>

      <div className="stats-grid">
        {/* value trend */}
        <div className="panel trend-panel">
          <div className="panel-head"><h3>Value over time</h3><span className="panel-tag">8 months</span></div>
          <svg className="spark" viewBox="0 0 320 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={accent} stopOpacity="0.22" />
                <stop offset="1" stopColor={accent} stopOpacity="0" />
              </linearGradient>
            </defs>
            {(() => {
              const pts = trend.map((v, i) => [12 + i * (296 / (trend.length - 1)), 108 - (v / maxTrend) * 92]);
              const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
              const fill = line + ` L308 108 L12 108 Z`;
              return (<>
                <path d={fill} fill="url(#sparkFill)" />
                <path d={line} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 4 : 0} fill={accent} />)}
              </>);
            })()}
          </svg>
        </div>

        {/* value by collection donut */}
        <div className="panel">
          <div className="panel-head"><h3>Value by type</h3></div>
          <div className="donut-row">
            <svg viewBox="0 0 128 128" className="donut">
              {segs.map(s => (
                <path key={s.id} d={arc(CX, CY, R, s.a0, s.a1)} fill="none" stroke={s.color} strokeWidth="16" strokeLinecap="round" />
              ))}
              <text x="64" y="60" textAnchor="middle" className="donut-c-n">{money(stats.value)}</text>
              <text x="64" y="78" textAnchor="middle" className="donut-c-l">total</text>
            </svg>
            <div className="legend">
              {segs.map(s => {
                const coll = collectionDef(s.id);
                return (
                  <div key={s.id} className="legend-row">
                    <span className="legend-dot" style={{ background: s.color }}></span>
                    <span className="legend-l">{coll.short}</span>
                    <span className="legend-v">{money(s.v)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* status breakdown */}
        <div className="panel">
          <div className="panel-head"><h3>By status</h3></div>
          <div className="status-bars">
            {STATUSES.map(st => {
              const n = stats.byStatus[st.id] || 0;
              const max = Math.max(...STATUSES.map(s => stats.byStatus[s.id] || 0), 1);
              const I = Icon[st.icon];
              return (
                <div key={st.id} className="status-bar-row">
                  <span className="sbr-ico" style={{ background: st.bg, color: st.ink }}><I /></span>
                  <span className="sbr-l">{st.label}</span>
                  <div className="sbr-track"><div className="sbr-fill" style={{ width: (n / max * 100) + '%', background: st.ring }}></div></div>
                  <span className="sbr-n">{n}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* top binders */}
        <div className="panel">
          <div className="panel-head"><h3>Top binders by value</h3></div>
          <div className="top-binders">
            {stats.perBinder.slice(0, 5).map(({ b, cards, value }) => (
              <div key={b.id} className="tb-row">
                <div className="tb-mini"><MiniBinder binder={b} size="xs" /></div>
                <div className="tb-info">
                  <div className="tb-name">{b.name}</div>
                  <div className="tb-meta">{collectionDef(b.collectionType).short} · {cards} cards</div>
                </div>
                <div className="tb-val">{money(value)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* recent activity */}
        <div className="panel activity-panel">
          <div className="panel-head"><h3>Recent activity</h3></div>
          <div className="activity">
            {activity.map((a, i) => {
              const I = Icon[a.icon] || Icon.check;
              return (
                <div key={i} className="act-row">
                  <span className="act-ico"><I /></span>
                  <span className="act-txt">{a.txt}</span>
                  {a.val && <span className="act-val">{a.val}</span>}
                  <span className="act-t">{a.t}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── AI Scanner ───────────────────────────────────────────────────
   Simulated recognition: picks a plausible detection for the target
   binder's collection type, fills metadata, lets the user confirm and
   drop it into the first empty slot. Form variants: modal/panel/popup. */
const SCAN_SAMPLES = {
  kpop:    { color:'#ffd1dc', conf:96, status:'have', meta:{ member:'Hanni', group:'NewJeans', album:'Get Up', version:'Weverse Albums Ver.', pob:'Weverse', year:'2023' }, est:21 },
  pokemon: { color:'#b3ffd9', conf:94, status:'priority', meta:{ name:'Sylveon ex', set:'Prismatic Evolutions', number:'086/131', rarity:'Special Illustration Rare', variant:'Special Illustration', condition:'Near Mint', year:'2025', language:'English' }, est:124 },
  sports:  { color:'#3b6bd6', conf:91, status:'have', meta:{ player:'Chet Holmgren', team:'OKC Thunder', sport:'NBA', brand:'Panini', set:'Prizm', number:'#201', year:'2023', parallel:'Silver Prizm', rookie:true, condition:'Near Mint', grade:'' }, est:110 },
  mtg:     { color:'#caa6f7', conf:90, status:'have', meta:{ name:'Zur, Eternal Schemer', set:'Modern Horizons 3', number:'042/303', type:'Legendary Creature', rarity:'Mythic Rare', finish:'Foil', year:'2024', language:'English' }, est:34 },
  yugioh:  { color:'#9c7bff', conf:88, status:'have', meta:{ name:'Dark Magician', set:'Legend of Blue Eyes', setCode:'LOB-005', rarity:'Ultra Rare', edition:'1st Edition', condition:'Lightly Played', year:'2002' }, est:46 },
  other:   { color:'#d8c9ec', conf:85, status:'have', meta:{ name:'Sample Card', set:'Demo Set', number:'001', rarity:'Rare', condition:'Mint', year:'2024' }, est:8 },
};

function ScannerOverlay({ binders, form, onClose, onAdd }) {
  const [step, setStep] = useStateS('aim');      // aim | scanning | result
  const [targetId, setTargetId] = useStateS(binders[0] ? binders[0].id : null);
  const target = binders.find(b => b.id === targetId) || binders[0];
  const sample = target ? (SCAN_SAMPLES[target.collectionType] || SCAN_SAMPLES.other) : SCAN_SAMPLES.other;
  const coll = target ? collectionDef(target.collectionType) : collectionDef('other');

  useEffectS(() => {
    if (step !== 'scanning') return;
    const t = setTimeout(() => setStep('result'), 2100);
    return () => clearTimeout(t);
  }, [step]);

  const detectedTitle = sample.meta.member || sample.meta.name || sample.meta.player || 'Card';
  const fields = Object.entries(sample.meta).filter(([, v]) => v && typeof v !== 'boolean').slice(0, 6);

  const confirm = () => {
    const card = {
      mode: 'color', image: null, color: sample.color,
      sleeve: { type: 'none', color: '#fff' }, status: sample.status, meta: sample.meta,
    };
    onAdd(target.id, card);
  };

  return (
    <div className={`scanner-overlay sf-${form}`} onClick={onClose}>
      <div className="scanner" onClick={e => e.stopPropagation()}>
        <div className="scan-header">
          <div className="scan-title"><Icon.sparkle /> AI Card Scanner</div>
          <button className="modal-close" onClick={onClose}><Icon.close /></button>
        </div>

        <div className="scan-target">
          <span className="scan-target-l">Add to</span>
          <select value={targetId || ''} onChange={e => setTargetId(e.target.value)}>
            {binders.map(b => <option key={b.id} value={b.id}>{collectionDef(b.collectionType).emoji}  {b.name}</option>)}
          </select>
        </div>

        <div className="scan-stage">
          {step !== 'result' && (
            <div className={`viewfinder ${step === 'scanning' ? 'scanning' : ''}`}>
              <div className="vf-card" style={{ background: sample.color }}>
                <div className="vf-shimmer"></div>
              </div>
              <span className="vf-corner tl"></span><span className="vf-corner tr"></span>
              <span className="vf-corner bl"></span><span className="vf-corner br"></span>
              {step === 'scanning' && <div className="vf-laser"></div>}
              {step === 'scanning' && <div className="vf-status"><Icon.sparkle /> Identifying card…</div>}
            </div>
          )}

          {step === 'result' && (
            <div className="scan-result">
              <div className="sr-card" style={{ background: sample.color }}>
                <span className="sr-conf">{sample.conf}% match</span>
              </div>
              <div className="sr-info">
                <div className="sr-coll">{coll.emoji} {coll.label}</div>
                <div className="sr-name">{detectedTitle}</div>
                <div className="sr-est">Est. value <strong>{money(sample.est)}</strong></div>
                <div className="sr-fields">
                  {fields.map(([k, v]) => (
                    <div key={k} className="sr-field"><span>{k}</span><strong>{v}</strong></div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="scan-actions">
          {step === 'aim' && (<>
            <div className="scan-hint"><Icon.camera /> Point at a card or drop an image — recognition is automatic.</div>
            <button className="btn primary" onClick={() => setStep('scanning')}><Icon.scan /> Scan card</button>
          </>)}
          {step === 'scanning' && (
            <button className="btn ghost" onClick={() => setStep('aim')}>Cancel</button>
          )}
          {step === 'result' && (<>
            <button className="btn ghost" onClick={() => setStep('aim')}><Icon.refresh /> Rescan</button>
            <button className="btn primary" onClick={confirm}><Icon.plus /> Add to {target ? target.name : 'binder'}</button>
          </>)}
        </div>
      </div>
    </div>
  );
}

export {
  StatsView,
  ScannerOverlay,
};
