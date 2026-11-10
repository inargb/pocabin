import React from 'react';
import { Icon, colorOf, computeSpreads, SpineBar, RingHooks, Page, CoverPage } from './core';
const { useState: useStateB, useEffect: useEffectB } = React;

const FLIP_MS = 650;

/* ──────────────────────────────────────────────────────
   BinderView — sheet-based.

   Sheets drive the data. Spreads are derived per render:
     spread 0:        [Inside Cover] | sheet[0].front
     spread 1..N-1:   sheet[i-1].back | sheet[i].front
     spread N:        sheet[N-1].back | [Inside Cover]

   The flip animation pairs the visible face on one side with
   the destination face from the next/previous spread.
   ────────────────────────────────────────────────────── */
function BinderView({
  binder, onAddSheetEnd, onInsertSheet,
  onSlotClick, onSlotEdit, onSlotDelete,
}) {
  const [spreadIdx, setSpreadIdx] = useStateB(0);
  // null | { dir: 'fwd' | 'back', target: idx }
  const [flip, setFlip] = useStateB(null);
  const [removingKey, setRemovingKey] = useStateB(null);

  /* Derive spreads from the sheet list every render. */
  const spreads = computeSpreads(binder);
  const total = spreads.length;

  // Clamp on binder change
  useEffectB(() => {
    setSpreadIdx(0);
    setFlip(null);
  }, [binder.id]);

  // Clamp when sheets removed
  useEffectB(() => {
    if (spreadIdx >= total) setSpreadIdx(Math.max(0, total - 1));
  }, [total]);

  const c = colorOf(binder);
  const skinClass = `binder--${binder.skin || 'pastel'}`;
  const current = spreads[spreadIdx];
  if (!current) return null;

  const flipping = !!flip;
  const targetSpread = flip ? spreads[flip.target] : null;

  const canPrev = spreadIdx > 0 && !flipping;
  const canNext = spreadIdx < total - 1 && !flipping;

  const goNext = () => {
    if (!canNext) return;
    const target = spreadIdx + 1;
    setFlip({ dir: 'fwd', target });
    setTimeout(() => { setSpreadIdx(target); setFlip(null); }, FLIP_MS);
  };
  const goPrev = () => {
    if (!canPrev) return;
    const target = spreadIdx - 1;
    setFlip({ dir: 'back', target });
    setTimeout(() => { setSpreadIdx(target); setFlip(null); }, FLIP_MS);
  };

  /* Slot handlers — guarded against locked covers + during flip. */
  const handleSlotClick = (side, idx) => {
    if (flipping) return;
    const f = current[side];
    if (f.kind !== 'face') return;
    onSlotClick(binder.id, f.sheetId, f.face, idx);
  };
  const handleSlotEdit = (side, idx) => {
    if (flipping) return;
    const f = current[side];
    if (f.kind !== 'face') return;
    onSlotEdit(binder.id, f.sheetId, f.face, idx);
  };
  const handleSlotDelete = (side, idx) => {
    if (flipping) return;
    const f = current[side];
    if (f.kind !== 'face') return;
    const key = `${side}-${idx}`;
    setRemovingKey(key);
    setTimeout(() => {
      onSlotDelete(binder.id, f.sheetId, f.face, idx);
      setRemovingKey(null);
    }, 280);
  };

  /* Render a side (cover or face). */
  const renderSide = (side, descriptor) => descriptor.kind === 'cover' ? (
    <CoverPage side={side} colorId={binder.colorId} skin={binder.skin || 'pastel'} />
  ) : (
    <Page
      page={{ slots: descriptor.slots }}
      side={side}
      gridType={binder.gridType}
      colorId={binder.colorId}
      onSlotClick={handleSlotClick}
      onSlotEdit={handleSlotEdit}
      onSlotDelete={handleSlotDelete}
      removingKey={removingKey}
    />
  );

  /* During flip, the static pages already render destination state.
     The flipping layer overlays the side that's "turning". */
  let staticLeft, staticRight;
  if (flip?.dir === 'fwd') {
    staticLeft  = current.left;
    staticRight = targetSpread.right;
  } else if (flip?.dir === 'back') {
    staticLeft  = targetSpread.left;
    staticRight = current.right;
  } else {
    staticLeft  = current.left;
    staticRight = current.right;
  }

  /* Flipping layer faces */
  let flipSide, flipFront, flipBack, flipBackSide;
  if (flip?.dir === 'fwd') {
    flipSide     = 'right';
    flipFront    = current.right;
    flipBack     = targetSpread.left;
    flipBackSide = 'left';
  } else if (flip?.dir === 'back') {
    flipSide     = 'left';
    flipFront    = current.left;
    flipBack     = targetSpread.right;
    flipBackSide = 'right';
  }

  const renderFlipFace = (descriptor, side) => descriptor.kind === 'cover' ? (
    <CoverPage side={side} colorId={binder.colorId} skin={binder.skin || 'pastel'} />
  ) : (
    <Page
      page={{ slots: descriptor.slots }}
      side={side}
      gridType={binder.gridType}
      colorId={binder.colorId}
      onSlotClick={() => {}} onSlotEdit={() => {}} onSlotDelete={() => {}}
      removingKey={null}
    />
  );

  /* Derived spread name (read-only). */
  const spreadName = (() => {
    const ln = current.left.kind === 'cover'  ? 'Inside Cover' : current.left.name;
    const rn = current.right.kind === 'cover' ? 'Inside Cover' : current.right.name;
    return `${ln} · ${rn}`;
  })();

  /* Insert position: insert sheet immediately AFTER the sheet whose
     face is shown on the RIGHT side of the current spread.
     - spread 0:       right is sheet[0].front  → insert AFTER sheet 0 (index 1)
     - middle i:       right is sheet[i].front  → insert AFTER sheet i (index i+1)
     - last spread:    right is the back cover  → append at end (index = sheets.length)
  */
  const insertIndexHere = (() => {
    if (current.right.kind === 'cover') return binder.sheets.length;
    // Right face is always a "front" face of some sheet
    const idx = binder.sheets.findIndex(s => s.id === current.right.sheetId);
    return idx + 1;
  })();

  return (
    <>
      <button className="nav-arrow prev" onClick={goPrev} disabled={!canPrev} aria-label="Previous spread">
        <Icon.chevL />
      </button>
      <button className="nav-arrow next" onClick={goNext} disabled={!canNext} aria-label="Next spread">
        <Icon.chevR />
      </button>

      <div className="binder-stage" style={flipping ? { perspective: '2400px' } : undefined}>
        <div
          className={`binder ${skinClass}`}
          style={{
            '--cover': c.cover,
            '--cover-tint': c.tint,
            '--cover-dark': c.dark,
            transformStyle: flipping ? 'preserve-3d' : undefined,
          }}
        >
          <div className="binder-noise"></div>
          <SpineBar />

          <div className="spread">
            {renderSide('left',  staticLeft)}
            {renderSide('right', staticRight)}

            {flipping && (
              <div className={`flip-layer ${flipSide} flip-${flip.dir === 'fwd' ? 'fwd' : 'back'}`}>
                <div className="flip-face front">
                  {renderFlipFace(flipFront, flipSide)}
                  <div className="flip-shade"></div>
                </div>
                <div className="flip-face back">
                  {renderFlipFace(flipBack, flipBackSide)}
                  <div className="flip-shade"></div>
                </div>
              </div>
            )}
          </div>

          <RingHooks />
          <div className="binder-clasp"></div>
        </div>
      </div>

      <div className="stage-footer">
        <div className="spread-meta">
          <span className="spread-count">
            Spread <strong style={{ color: 'var(--ink)' }}>{spreadIdx + 1}</strong> / {total}
          </span>
          <span className="spread-meta-dot">·</span>
          <span className="spread-name read-only" title="Derived from page names — rename pages in Manage sheets">
            <span className="spread-name-text">{spreadName}</span>
          </span>
        </div>
        {!flipping && (
          <div className="spread-actions">
            <button
              className="add-spread-btn"
              title="Insert a new sheet after the page on the right"
              onClick={() => onInsertSheet(binder.id, insertIndexHere)}
            >
              <Icon.plus /> Insert sheet here
            </button>
            <button
              className="add-spread-btn"
              title="Add a sheet at the end (before the back cover)"
              onClick={() => onAddSheetEnd(binder.id)}
            >
              <Icon.plus /> Add sheet at end
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export {
  BinderView,
};
