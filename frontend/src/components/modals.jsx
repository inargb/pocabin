import React from 'react';
import ReactDOM from 'react-dom';
import { Icon, SKINS, skinDef, STATUSES, GRID_TYPES, gridDef, COLLECTIONS, collectionDef, fileToDataURL } from './core';
const { useState: useStateM, useEffect: useEffectM, useRef: useRefM, useCallback: useCallbackM } = React;

/* ──────────────────────────────────────────────────────
   Generic modal scaffold
   ────────────────────────────────────────────────────── */
function Modal({ size = 'small', title, subtitle, onClose, children, footer }) {
  useEffectM(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-scrim" onMouseDown={(e) => { if (e.target.classList.contains('modal-scrim')) onClose(); }}>
      <div className={`modal ${size}`} onMouseDown={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{title}</div>
            {subtitle && <div className="modal-sub">{subtitle}</div>}
          </div>
          <button className="icon-btn" onClick={onClose}><Icon.close /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   Confirm Modal — reusable destructive-action prompt.
   ────────────────────────────────────────────────────── */
function ConfirmModal({
  title = 'Are you sure?',
  body,
  detail,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  tone = 'danger',          // 'danger' | 'primary'
  onCancel,
  onConfirm,
}) {
  // focus the confirm button so Enter triggers it
  const confirmRef = useRefM(null);
  useEffectM(() => {
    const t = setTimeout(() => { confirmRef.current?.focus(); }, 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <Modal
      size="small"
      title={title}
      onClose={onCancel}
      footer={<>
        <button className="btn ghost" onClick={onCancel}>{cancelLabel}</button>
        <button
          ref={confirmRef}
          className={`btn ${tone === 'danger' ? 'danger-solid' : 'primary'}`}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </>}
    >
      <div className="confirm-body">
        {tone === 'danger' && (
          <div className="confirm-icon" aria-hidden="true">
            <Icon.trash />
          </div>
        )}
        <div className="confirm-text">
          {body && <p className="confirm-lead">{body}</p>}
          {detail && <p className="confirm-detail">{detail}</p>}
        </div>
      </div>
    </Modal>
  );
}
/* ──────────────────────────────────────────────────────
   Color swatch row — skin-aware. Reads the active skin's
   palette and renders each color as a tappable swatch.
   ────────────────────────────────────────────────────── */
function ColorSwatches({ skin = 'pastel', value, onChange }) {
  const colors = skinDef(skin).colors;
  return (
    <div className="swatches">
      {colors.map(p => (
        <div
          key={p.id}
          className={`swatch ${value === p.id ? 'selected' : ''}`}
          style={{ background: p.cover }}
          title={p.name}
          onClick={() => onChange(p.id)}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   Skin picker — mini-binder thumbnail grid.

   Each card renders a stylized closed binder (cover with the
   skin's texture/effect + a sliver of pages behind it). The
   color picker for the selected skin appears below the grid.
   ────────────────────────────────────────────────────── */
function SkinThumb({ skin, color }) {
  /* The covered area paints in the skin-specific color where the
     class doesn't already hard-code one (e.g. leather/dark variants).
     For pastel + matte the user's chosen color tints the cover. */
  const tintable = skin === 'pastel' || skin === 'matte';
  return (
    <div className={`skin-thumb skin-thumb--${skin}`}>
      <div
        className="skin-thumb-cover"
        style={tintable && color ? { background: color.cover } : undefined}
      />
      <div className="skin-thumb-pages" />
      <div className="skin-thumb-rings" />
    </div>
  );
}

function SkinPicker({ skin, colorId, onSkinChange, onColorChange }) {
  const activeSkin = skinDef(skin);
  /* Each skin card shows a thumbnail using either the user's selected
     color (when the same skin is active) or that skin's first color
     as a representative preview. */
  return (
    <>
      <div className="skin-grid">
        {SKINS.map(s => {
          const representative = s.id === skin
            ? (s.colors.find(c => c.id === colorId) || s.colors[0])
            : s.colors[0];
          return (
            <button
              type="button"
              key={s.id}
              className={`skin-card ${skin === s.id ? 'selected' : ''}`}
              onClick={() => {
                if (skin === s.id) return;
                /* When switching skins, reset color to the new skin's first option
                   so we never carry an invalid colorId across palettes. */
                onSkinChange(s.id);
                onColorChange(s.colors[0].id);
              }}
            >
              <SkinThumb skin={s.id} color={representative} />
              <div className="skin-card-label">{s.label}</div>
              <div className="skin-card-sub">{s.note}</div>
            </button>
          );
        })}
      </div>
      <div className="skin-color-row">
        <div className="skin-color-row-label">{activeSkin.label} · cover color</div>
        <ColorSwatches skin={skin} value={colorId} onChange={onColorChange} />
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────────────
   Collection type picker — a 3×2 kawaii card-select grid.
   Used in the New Binder modal. Read-only after creation.
   ────────────────────────────────────────────────────── */
function CollectionPicker({ value, onChange }) {
  return (
    <div className="coll-grid">
      {COLLECTIONS.map(c => (
        <button
          type="button"
          key={c.id}
          className={`coll-card ${value === c.id ? 'selected' : ''}`}
          onClick={() => onChange(c.id)}
        >
          <div className="coll-emoji" aria-hidden="true">{c.emoji}</div>
          <div className="coll-label">{c.label}</div>
        </button>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   New Binder Modal — collection type → skin → details.
   ────────────────────────────────────────────────────── */
function NewBinderModal({ onClose, onCreate }) {
  const [collectionType, setCollectionType] = useStateM('kpop');
  const [name, setName]       = useStateM('');
  const [skin, setSkin]       = useStateM('pastel');
  const [colorId, setColorId] = useStateM('pink');
  const [gridType, setGrid]   = useStateM('2x2');
  const [sheets, setSheets]   = useStateM(3);

  const submit = () => {
    const n = (name.trim() || 'My binder').slice(0, 60);
    onCreate({
      name: n, colorId, gridType, collectionType, skin,
      sheetCount: Math.max(1, Math.min(50, Number(sheets) || 1)),
    });
  };

  return (
    <Modal
      size="medium"
      title="Create a new binder"
      subtitle="Collection type and grid can't be changed after creation. Skin and color can."
      onClose={onClose}
      footer={<>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" onClick={submit}>Create binder</button>
      </>}
    >
      <div className="field">
        <label>Collection type</label>
        <CollectionPicker value={collectionType} onChange={setCollectionType} />
      </div>

      <div className="field">
        <label>Binder style</label>
        <SkinPicker
          skin={skin}
          colorId={colorId}
          onSkinChange={setSkin}
          onColorChange={setColorId}
        />
      </div>

      <div className="field">
        <label>Name</label>
        <input
          type="text" autoFocus placeholder="e.g. NewJeans collection"
          value={name} maxLength={60}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
        />
      </div>

      <div className="row2">
        <div className="field">
          <label>Grid layout (locked after create)</label>
          <div className="grid-picker">
            {GRID_TYPES.map(g => (
              <div
                key={g.id}
                className={`grid-option ${gridType === g.id ? 'selected' : ''}`}
                onClick={() => setGrid(g.id)}
              >
                <div className={`grid-thumb g${g.cols}`}>
                  {Array.from({ length: g.cols * g.rows }).map((_, i) => <span key={i} />)}
                </div>
                <div className="grid-option-label">{g.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Starting sheets</label>
          <input
            type="number" min={1} max={50}
            value={sheets} onChange={e => setSheets(e.target.value)}
          />
          <div style={{ fontSize: 12, color: 'var(--ink-fade)', marginTop: 2 }}>
            Each sheet has a front + back face. N sheets → N+1 spreads.
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ──────────────────────────────────────────────────────
   Edit Binder Modal — rename + change skin + change color.
   (Grid + collection type locked.)
   ────────────────────────────────────────────────────── */
function EditBinderModal({ binder, onClose, onSave }) {
  const [name, setName] = useStateM(binder.name);
  const [skin, setSkin] = useStateM(binder.skin || 'pastel');
  const [colorId, setColorId] = useStateM(binder.colorId);

  const submit = () => {
    const n = (name.trim() || 'My binder').slice(0, 60);
    onSave({ name: n, skin, colorId });
  };

  return (
    <Modal
      size="medium"
      title="Edit binder"
      subtitle="Rename it, switch skin, or change its cover color."
      onClose={onClose}
      footer={<>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" onClick={submit}>Save changes</button>
      </>}
    >
      <div className="field">
        <label>Name</label>
        <input
          type="text" autoFocus value={name} maxLength={60}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
        />
      </div>
      <div className="field">
        <label>Binder style</label>
        <SkinPicker
          skin={skin}
          colorId={colorId}
          onSkinChange={setSkin}
          onColorChange={setColorId}
        />
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-fade)' }}>
        Collection type ({collectionDef(binder.collectionType).label}) and grid ({gridDef(binder.gridType).label}) can't be changed after creation.
      </div>
    </Modal>
  );
}

/* ──────────────────────────────────────────────────────
   Manage Sheets Modal — reorder, rename (per face), delete.

   Covers are shown as locked rows at the top + bottom of the
   list. Renames + reorder are buffered locally and committed
   together on "Done". Deletes apply immediately (with confirm).
   ────────────────────────────────────────────────────── */
function ManageSheetsModal({ binder, onClose, onApply, onDeleteSheet }) {
  /* Local drafts so changes feel atomic until "Done". */
  const [order, setOrder] = useStateM(binder.sheets.map(s => s.id));
  const [drafts, setDrafts] = useStateM(() => {
    const m = {};
    binder.sheets.forEach(s => { m[s.id] = { frontName: s.frontName, backName: s.backName }; });
    return m;
  });
  const [draggingId, setDraggingId] = useStateM(null);
  const [overId, setOverId]         = useStateM(null);
  const [overPos, setOverPos]       = useStateM(null);

  /* Re-sync drafts when the binder mutates underneath us
     (e.g. a sheet was deleted via the trash button — it dispatches
     immediately so the binder prop updates, and we drop the stale row). */
  useEffectM(() => {
    setOrder(prev => prev.filter(id => binder.sheets.some(s => s.id === id))
      .concat(binder.sheets.filter(s => !prev.includes(s.id)).map(s => s.id)));
    setDrafts(prev => {
      const next = {};
      binder.sheets.forEach(s => {
        next[s.id] = prev[s.id] || { frontName: s.frontName, backName: s.backName };
      });
      return next;
    });
  }, [binder.sheets]);

  const move = (fromId, toId, pos) => {
    if (!fromId || !toId || fromId === toId) return;
    const next = order.filter(x => x !== fromId);
    let at = next.indexOf(toId);
    if (at < 0) return;
    if (pos === 'after') at += 1;
    next.splice(at, 0, fromId);
    setOrder(next);
  };

  const updateDraft = (sheetId, key, value) => {
    setDrafts(d => ({
      ...d,
      [sheetId]: { ...d[sheetId], [key]: value.slice(0, 60) },
    }));
  };

  const requestDelete = (sheetId) => {
    if (binder.sheets.length <= 1) {
      alert('A binder must have at least one sheet.');
      return;
    }
    const sh = binder.sheets.find(s => s.id === sheetId);
    const name = sh ? `${sh.frontName} · ${sh.backName}` : 'this sheet';
    if (!confirm(`Delete ${name}? This will remove both its front and back pages and all cards on them.`)) return;
    onDeleteSheet(sheetId);
  };

  const submit = () => {
    /* Collect renames that differ from current binder state. */
    const renames = [];
    binder.sheets.forEach(s => {
      const d = drafts[s.id];
      if (!d) return;
      const fn = (d.frontName || '').trim() || s.frontName;
      const bn = (d.backName  || '').trim() || s.backName;
      if (fn !== s.frontName) renames.push({ sheetId: s.id, face: 'front', name: fn });
      if (bn !== s.backName)  renames.push({ sheetId: s.id, face: 'back',  name: bn });
    });
    onApply({ order, renames });
  };

  /* drag handlers (HTML5 DnD) */
  const onDragStart = (e, id) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', id); } catch {}
  };
  const onDragOver = (e, id) => {
    if (!draggingId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientY - rect.top) < rect.height / 2 ? 'before' : 'after';
    if (id !== overId || pos !== overPos) {
      setOverId(id); setOverPos(pos);
    }
  };
  const onDragLeave = (e, id) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (overId === id) { setOverId(null); setOverPos(null); }
  };
  const onDrop = (e, id) => {
    e.preventDefault();
    if (draggingId && id && draggingId !== id) {
      move(draggingId, id, overPos || 'before');
    }
    setDraggingId(null); setOverId(null); setOverPos(null);
  };
  const onDragEnd = () => {
    setDraggingId(null); setOverId(null); setOverPos(null);
  };

  /* Tiny preview of a sheet face — dots for filled slots. */
  const FacePreview = ({ slots, gridType }) => {
    const g = gridDef(gridType);
    return (
      <div className={`sheet-thumb g${g.cols}`}>
        {slots.map((c, i) => (
          <span key={i} className={c ? 'on' : ''}></span>
        ))}
      </div>
    );
  };

  return (
    <Modal
      size="medium"
      title="Manage sheets"
      subtitle="Drag to reorder. Rename either face. Delete with the trash icon. Covers are fixed."
      onClose={onClose}
      footer={<>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" onClick={submit}>Done</button>
      </>}
    >
      <div className="sheet-list">
        {/* Locked front cover row */}
        <div className="sheet-row cover-row" aria-hidden="true">
          <div className="drag-handle locked"><Icon.book /></div>
          <div className="sheet-row-cover-label">Inside Front Cover</div>
        </div>

        {order.map((id) => {
          const sh = binder.sheets.find(s => s.id === id);
          if (!sh) return null;
          const d = drafts[id] || { frontName: sh.frontName, backName: sh.backName };
          const filled = sh.front.slots.filter(Boolean).length + sh.back.slots.filter(Boolean).length;
          const dragging = draggingId === id;
          const showDropBefore = overId === id && overPos === 'before' && draggingId && draggingId !== id;
          const showDropAfter  = overId === id && overPos === 'after'  && draggingId && draggingId !== id;
          return (
            <div
              key={id}
              className={`sheet-row dnd ${dragging ? 'dragging' : ''} ${showDropBefore ? 'drop-before' : ''} ${showDropAfter ? 'drop-after' : ''}`}
              onDragOver={(e) => onDragOver(e, id)}
              onDragLeave={(e) => onDragLeave(e, id)}
              onDrop={(e) => onDrop(e, id)}
            >
              <div
                className="drag-handle"
                title="Drag to reorder"
                draggable
                onDragStart={(e) => onDragStart(e, id)}
                onDragEnd={onDragEnd}
              >
                <Icon.grip />
              </div>
              <div className="sheet-thumb-pair">
                <FacePreview slots={sh.front.slots} gridType={binder.gridType} />
                <FacePreview slots={sh.back.slots}  gridType={binder.gridType} />
              </div>
              <div className="sheet-row-fields">
                <div className="sheet-field">
                  <label>Front page</label>
                  <input
                    type="text"
                    value={d.frontName}
                    maxLength={60}
                    placeholder="e.g. Page 1"
                    onChange={(e) => updateDraft(id, 'frontName', e.target.value)}
                  />
                </div>
                <div className="sheet-field">
                  <label>Back page</label>
                  <input
                    type="text"
                    value={d.backName}
                    maxLength={60}
                    placeholder="e.g. Page 2"
                    onChange={(e) => updateDraft(id, 'backName', e.target.value)}
                  />
                </div>
              </div>
              <div className="sheet-row-meta">
                <span>{filled} card{filled === 1 ? '' : 's'}</span>
                <button
                  className="icon-btn danger"
                  title="Delete sheet"
                  onClick={() => requestDelete(id)}
                  disabled={binder.sheets.length <= 1}
                >
                  <Icon.trash />
                </button>
              </div>
            </div>
          );
        })}

        {/* Locked back cover row */}
        <div className="sheet-row cover-row" aria-hidden="true">
          <div className="drag-handle locked"><Icon.book /></div>
          <div className="sheet-row-cover-label">Inside Back Cover</div>
        </div>
      </div>
      <div className="reorder-hint">
        <Icon.grip />
        Drag a sheet's handle to slot it between the covers. Click “Done” to apply.
      </div>
    </Modal>
  );
}

/* ──────────────────────────────────────────────────────
   CuteSelect — pastel dropdown that matches the kawaii UI.

   Renders a button styled like a soft input; clicking opens a
   portal-positioned popover with the options. Closes on outside
   click / Escape / option pick. Auto-flips above if no room below.
   ────────────────────────────────────────────────────── */
function CuteSelect({ value, options, placeholder, onChange }) {
  const [open, setOpen] = useStateM(false);
  const [flip, setFlip] = useStateM(false);
  const anchorRef       = useRefM(null);
  const popoverRef      = useRefM(null);

  useEffectM(() => {
    if (!open) return;
    const onDown = (e) => {
      if (anchorRef.current?.contains(e.target)) return;
      if (popoverRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffectM(() => {
    if (!open || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    const POP_H = Math.min(320, 44 * options.length + 12);
    const below = window.innerHeight - r.bottom;
    setFlip(below < POP_H + 16 && r.top > POP_H + 16);
  }, [open]);

  const popoverStyle = (() => {
    if (!anchorRef.current) return { display: 'none' };
    const r = anchorRef.current.getBoundingClientRect();
    const left = Math.max(8, Math.min(window.innerWidth - r.width - 8, r.left));
    const top  = flip ? (r.top - 6) : (r.bottom + 6);
    return {
      position: 'fixed',
      left: `${left}px`,
      top:  `${top}px`,
      width: `${r.width}px`,
      transform: flip ? 'translateY(-100%)' : 'none',
      zIndex: 1000,
    };
  })();

  return (
    <>
      <button
        type="button"
        ref={anchorRef}
        className={`cute-select ${open ? 'open' : ''} ${value ? '' : 'placeholder'}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className="cute-select-value">{value || placeholder || 'Choose…'}</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && ReactDOM.createPortal(
        <div ref={popoverRef} className="cute-select-pop" style={popoverStyle}>
          {placeholder && (
            <button
              type="button"
              className={`cute-select-opt ${!value ? 'selected' : ''}`}
              onClick={() => { onChange(''); setOpen(false); }}
            >
              <span className="cute-select-opt-label muted">{placeholder}</span>
            </button>
          )}
          {options.map(opt => (
            <button
              type="button"
              key={opt}
              className={`cute-select-opt ${value === opt ? 'selected' : ''}`}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              <span className="cute-select-opt-label">{opt}</span>
              {value === opt && <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

/* PillMulti — multi-select row of toggleable pill buttons. */
function PillMulti({ value, options, onChange }) {
  const set = new Set(Array.isArray(value) ? value : []);
  const toggle = (opt) => {
    const next = new Set(set);
    if (next.has(opt)) next.delete(opt); else next.add(opt);
    onChange(Array.from(next));
  };
  return (
    <div className="pill-multi">
      {options.map(opt => (
        <button
          type="button"
          key={opt}
          className={`pill ${set.has(opt) ? 'on' : ''}`}
          onClick={() => toggle(opt)}
        >
          {set.has(opt) && <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ToggleField — a single yes/no switch with a label. */
function ToggleField({ value, onChange }) {
  return (
    <button
      type="button"
      className={`toggle-switch ${value ? 'on' : ''}`}
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
    >
      <span className="toggle-track">
        <span className="toggle-knob" />
      </span>
      <span className="toggle-label">{value ? 'Yes' : 'No'}</span>
    </button>
  );
}

/* ──────────────────────────────────────────────────────
   Card Add / Edit Modal — schema-driven by binder's collection type.

   Universal blocks (shown for every collection):
     - Card face: image (with crop) OR plain color
     - Sleeve
     - Notes
     - Status
   Type-specific blocks come from collectionDef(binder.collectionType).sections.
   ────────────────────────────────────────────────────── */
function CardModal({ initialCard, binder, face, onClose, onSave }) {
  const coll = collectionDef(binder?.collectionType);

  const blank = {
    mode: 'image',
    image: null,
    color: '#ffd1dc',
    sleeve: { type: 'none', color: '#ffffff' },
    status: null,
    notes: '',
    meta: {},
  };
  const [cropOpen, setCropOpen] = useStateM(false);
  const [card, setCard] = useStateM(() => {
    if (initialCard) {
      return {
        mode: initialCard.mode || 'image',
        image: initialCard.image ?? initialCard.front ?? null,
        color: initialCard.color || '#ffd1dc',
        sleeve: initialCard.sleeve || { type: 'none', color: '#ffffff' },
        status: initialCard.status ?? null,
        notes: initialCard.notes || '',
        meta: initialCard.meta || {},
      };
    }
    return blank;
  });

  const setSleeve = (patch) => setCard(c => ({ ...c, sleeve: { ...c.sleeve, ...patch } }));
  const setMetaField = (id, val) => setCard(c => ({ ...c, meta: { ...c.meta, [id]: val } }));

  const uploadImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const url = await fileToDataURL(file);
    setCard(c => ({ ...c, image: url, mode: 'image' }));
  };

  const sleeveOpts = [
    { id: 'none',         label: 'None',         mini: 'none' },
    { id: 'colored',      label: 'Colored',      mini: 'color' },
    { id: 'holographic',  label: 'Holographic',  mini: 'holo' },
  ];

  const faceLabel = face === 'back' ? 'Back' : 'Front';
  const titleVerb = initialCard ? 'Edit Card' : 'Add Card';
  const title     = `${titleVerb} — ${faceLabel}`;
  const subtitle  = `${coll.emoji} ${coll.label}`;

  /* Render a single field by kind. */
  const renderField = (f) => {
    const val = card.meta[f.id];
    if (f.kind === 'select') {
      return (
        <CuteSelect
          value={val || ''}
          options={f.options}
          placeholder={'\u2014'}
          onChange={(v) => setMetaField(f.id, v)}
        />
      );
    }
    if (f.kind === 'multiselect') {
      return (
        <PillMulti
          value={Array.isArray(val) ? val : []}
          options={f.options}
          onChange={(v) => setMetaField(f.id, v)}
        />
      );
    }
    if (f.kind === 'toggle') {
      return (
        <ToggleField
          value={!!val}
          onChange={(v) => setMetaField(f.id, v)}
        />
      );
    }
    /* text (default) */
    return (
      <input
        type="text"
        value={val || ''}
        placeholder={f.placeholder || ''}
        onChange={(e) => setMetaField(f.id, e.target.value)}
      />
    );
  };

  /* Decide layout per field kind:
     - Multiselect/toggle/notes stretch full-width
     - Everything else lives in a 2-col grid */
  const wideKinds = new Set(['multiselect', 'toggle']);

  return (
    <Modal
      size="medium"
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      footer={<>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" onClick={() => onSave(card)}>Save card</button>
      </>}
    >
      <div className="row2" style={{ gap: 24, alignItems: 'flex-start' }}>
        {/* Left column: image / color + sleeve */}
        <div className="card-modal-col-left">
          <div className="card-section-label">Card face</div>

          <div className="seg">
            <button
              className={`seg-btn ${card.mode === 'image' ? 'on' : ''}`}
              onClick={() => setCard(c => ({ ...c, mode: 'image' }))}
            >Image</button>
            <button
              className={`seg-btn ${card.mode === 'color' ? 'on' : ''}`}
              onClick={() => setCard(c => ({ ...c, mode: 'color' }))}
            >Plain color</button>
          </div>

          {card.mode === 'image' ? (
            <div className="upload-single" style={{ marginTop: 10 }}>
              <UploadZone
                label="Card image"
                image={card.image}
                onPick={(f) => uploadImage(f)}
                onClear={() => setCard(c => ({ ...c, image: null }))}
                onCrop={() => setCropOpen(true)}
              />
              {card.image && (
                <button className="crop-btn" onClick={() => setCropOpen(true)} style={{ marginTop: 8 }}>
                  <Icon.crop /> Crop image
                </button>
              )}
            </div>
          ) : (
            <div className="color-pick" style={{ marginTop: 10 }}>
              <div className="color-preview" style={{ background: card.color }}>
                <input
                  type="color"
                  value={card.color}
                  onChange={e => setCard(c => ({ ...c, color: e.target.value }))}
                />
              </div>
              <div className="color-presets">
                {['#ffd1dc','#ffe5d1','#fff5b8','#d1ffe5','#b9d7ec','#d8c9ec','#f5b3aa','#f5efe9','#1a1a1a','#ffffff']
                  .map(c => (
                    <button
                      key={c}
                      className={`color-preset ${card.color === c ? 'on' : ''}`}
                      style={{ background: c }}
                      onClick={() => setCard(s => ({ ...s, color: c }))}
                    />
                  ))}
              </div>
            </div>
          )}

          <div className="card-section-label" style={{ marginTop: 18 }}>Sleeve</div>
          <div className="sleeve-row">
            {sleeveOpts.map(opt => (
              <div
                key={opt.id}
                className={`sleeve-opt ${card.sleeve.type === opt.id ? 'selected' : ''}`}
                onClick={() => setSleeve({ type: opt.id })}
              >
                {opt.id === 'colored'
                  ? <div className="sleeve-mini" style={{ background: card.sleeve.color }} />
                  : <div className={`sleeve-mini ${opt.mini}`}></div>}
                {opt.label}
              </div>
            ))}
            {card.sleeve.type === 'colored' && (
              <SleeveColorPicker
                value={card.sleeve.color || '#ffffff'}
                onChange={(c) => setSleeve({ color: c })}
              />
            )}
          </div>
        </div>

        {/* Right column: schema-driven metadata + notes + status */}
        <div className="card-modal-col-right">
          {coll.sections.map(section => (
            <React.Fragment key={section.id}>
              <div className="card-section-label">{section.label}</div>
              <div className="card-field-grid">
                {section.fields.map(f => (
                  <div
                    key={f.id}
                    className={`card-field ${wideKinds.has(f.kind) ? 'wide' : ''}`}
                  >
                    <label>{f.label}</label>
                    {renderField(f)}
                  </div>
                ))}
              </div>
            </React.Fragment>
          ))}

          <div className="card-section-label">Notes</div>
          <div className="card-field wide">
            <textarea
              className="notes-input"
              rows={3}
              maxLength={500}
              placeholder="Anything you want to remember about this card…"
              value={card.notes}
              onChange={(e) => setCard(c => ({ ...c, notes: e.target.value }))}
            />
          </div>

          <div className="card-section-label">Status</div>
          <div className="status-row">
            <button
              type="button"
              className={`status-opt none ${card.status == null ? 'selected' : ''}`}
              onClick={() => setCard(c => ({ ...c, status: null }))}
              title="No status"
            >
              <div className="status-swatch none"></div>
              None
            </button>
            {STATUSES.map(st => {
              const StIcon = Icon[st.icon];
              const selected = card.status === st.id;
              return (
                <button
                  type="button"
                  key={st.id}
                  className={`status-opt ${selected ? 'selected' : ''}`}
                  style={{ '--st-bg': st.bg, '--st-ink': st.ink, '--st-ring': st.ring }}
                  onClick={() => setCard(c => ({ ...c, status: st.id }))}
                  title={st.label}
                >
                  <div className="status-swatch"><StIcon /></div>
                  {st.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {cropOpen && card.image && (
        <CropModal
          src={card.image}
          onClose={() => setCropOpen(false)}
          onApply={(dataUrl) => {
            setCard(c => ({ ...c, image: dataUrl, mode: 'image' }));
            setCropOpen(false);
          }}
        />
      )}
    </Modal>
  );
}

/* ──────────────────────────────────────────────────────
   CropModal — pan + zoom into a 2:3 photocard frame.
   Output is a new data URL drawn onto a 600×900 canvas.
   ────────────────────────────────────────────────────── */
function CropModal({ src, onClose, onApply }) {
  const FRAME_W = 320;
  const FRAME_H = 480;          // 2:3 aspect
  const OUT_W   = 600;
  const OUT_H   = 900;

  const [img, setImg]     = useStateM(null); // HTMLImageElement
  const [minScale, setMinScale] = useStateM(1);
  const [scale, setScale] = useStateM(1);
  const [tx, setTx]       = useStateM(0);
  const [ty, setTy]       = useStateM(0);

  const stageRef = useRefM(null);
  const dragRef  = useRefM(null);

  // load image, compute min-fit scale
  useEffectM(() => {
    const el = new Image();
    el.onload = () => {
      const ms = Math.max(FRAME_W / el.naturalWidth, FRAME_H / el.naturalHeight);
      setImg(el);
      setMinScale(ms);
      setScale(ms);
      setTx(0);
      setTy(0);
    };
    el.src = src;
  }, [src]);

  /* clamp helper: keep image covering the frame */
  const clamp = useCallbackM((nx, ny, s) => {
    if (!img) return [nx, ny];
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    const limX = Math.max(0, (w - FRAME_W) / 2);
    const limY = Math.max(0, (h - FRAME_H) / 2);
    return [Math.max(-limX, Math.min(limX, nx)), Math.max(-limY, Math.min(limY, ny))];
  }, [img]);

  const onPointerDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { px: e.clientX, py: e.clientY, x0: tx, y0: ty };
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const { px, py, x0, y0 } = dragRef.current;
    const [nx, ny] = clamp(x0 + (e.clientX - px), y0 + (e.clientY - py), scale);
    setTx(nx); setTy(ny);
  };
  const onPointerUp = (e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
  };

  const onScale = (val) => {
    const s = Number(val);
    const [nx, ny] = clamp(tx, ty, s);
    setScale(s); setTx(nx); setTy(ny);
  };

  /* render to canvas and return data URL */
  const apply = () => {
    if (!img) return;
    // Image rect in stage coords (frame is FRAME_W × FRAME_H, origin top-left, image centered + translated)
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const imgLeft = FRAME_W / 2 + tx - w / 2;
    const imgTop  = FRAME_H / 2 + ty - h / 2;
    // Source rect on the original image that maps to the frame
    const sx = (0 - imgLeft) / scale;
    const sy = (0 - imgTop)  / scale;
    const sw = FRAME_W / scale;
    const sh = FRAME_H / scale;

    const canvas = document.createElement('canvas');
    canvas.width = OUT_W; canvas.height = OUT_H;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, OUT_W, OUT_H);
    onApply(canvas.toDataURL('image/jpeg', 0.92));
  };

  const reset = () => {
    setScale(minScale);
    setTx(0); setTy(0);
  };

  return (
    <Modal
      size="small"
      title="Crop image"
      subtitle="Drag to pan, slide to zoom. Crops to a 2:3 photocard."
      onClose={onClose}
      footer={<>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn ghost" onClick={reset}>Reset</button>
        <button className="btn primary" onClick={apply} disabled={!img}>Apply crop</button>
      </>}
    >
      <div className="crop-wrap">
        <div
          ref={stageRef}
          className="crop-stage"
          style={{ width: FRAME_W, height: FRAME_H }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {img && (
            <img
              className="crop-img"
              src={src}
              alt=""
              draggable={false}
              style={{
                width:  img.naturalWidth  * scale,
                height: img.naturalHeight * scale,
                transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`,
              }}
            />
          )}
          <div className="crop-overlay" />
          <div className="crop-grid" />
        </div>

        <div className="crop-controls">
          <label className="crop-zoom-label">Zoom</label>
          <input
            type="range"
            min={minScale}
            max={minScale * 5}
            step={0.001}
            value={scale}
            onChange={e => onScale(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

/* ──────────────────────────────────────────────────────
   Sleeve Color Picker — kawaii pastel swatch popover.

   - Chip button shows the current color + hex.
   - Click opens a fixed-position popover (no modal reflow).
   - Auto-flips above the chip when room below is tight.
   - Click outside, Escape, or pick a swatch → closes.
   - Hex input below the grid for custom colors.
   ────────────────────────────────────────────────────── */
const SLEEVE_SWATCHES = [
  '#ffd6e0', '#ffc1d4', '#ffb3c1', '#ffa8b8', '#ff9999',
  '#ffe2d6', '#ffd0b3', '#ffc7a3', '#ffb88c', '#ffaa77',
  '#fff5b8', '#fff080', '#ffe066', '#f7e7a4', '#ffd97a',
  '#d6ffe0', '#b3ffd9', '#c5e6d3', '#a8d6bb', '#9be3c4',
  '#d6f0ff', '#b9d7ec', '#9bc1de', '#a8d8f0', '#c4e0f5',
  '#e0d6ff', '#c1b3ff', '#d8c9ec', '#b9a4d9', '#cab8e8',
  '#ffffff', '#fff5e1', '#faf0e6', '#f5efe9', '#1a1a1a',
];

function SleeveColorPicker({ value, onChange }) {
  const [open, setOpen] = useStateM(false);
  const [hex, setHex]   = useStateM(value);
  const [flip, setFlip] = useStateM(false);
  const anchorRef       = useRefM(null);
  const popoverRef      = useRefM(null);

  useEffectM(() => { setHex(value); }, [value]);

  useEffectM(() => {
    if (!open) return;
    const onDown = (e) => {
      if (anchorRef.current?.contains(e.target)) return;
      if (popoverRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffectM(() => {
    if (!open || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    const POP_H = 280;
    const below = window.innerHeight - r.bottom;
    setFlip(below < POP_H + 16 && r.top > POP_H + 16);
  }, [open]);

  const popoverStyle = (() => {
    if (!anchorRef.current) return { display: 'none' };
    const r = anchorRef.current.getBoundingClientRect();
    const W = 260;
    let left = r.left;
    if (left + W > window.innerWidth - 8) left = window.innerWidth - W - 8;
    if (left < 8) left = 8;
    const top = flip ? (r.top - 10) : (r.bottom + 10);
    return {
      position: 'fixed',
      left: `${left}px`,
      top:  `${top}px`,
      width: `${W}px`,
      transform: flip ? 'translateY(-100%)' : 'none',
      zIndex: 1000,
    };
  })();

  const pick = (c) => {
    onChange(c);
    setHex(c);
    setOpen(false);
  };

  const commitHex = () => {
    const v = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex) ? hex : value;
    setHex(v);
    onChange(v);
  };

  return (
    <>
      <button
        type="button"
        ref={anchorRef}
        className={`sleeve-color-chip ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        title="Pick sleeve color"
      >
        <span className="sleeve-color-swatch" style={{ background: value }} />
        <span className="sleeve-color-hex">{(value || '').toUpperCase()}</span>
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && ReactDOM.createPortal(
        <div ref={popoverRef} className="sleeve-color-pop" style={popoverStyle}>
          <div className="sleeve-color-grid">
            {SLEEVE_SWATCHES.map(c => {
              const selected = c.toLowerCase() === (value || '').toLowerCase();
              return (
                <button
                  type="button"
                  key={c}
                  className={`sleeve-color-swatch-btn ${selected ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => pick(c)}
                  title={c}
                />
              );
            })}
          </div>
          <div className="sleeve-color-hex-row">
            <span className="sleeve-color-hex-dot" style={{ background: /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex) ? hex : value }} />
            <input
              type="text"
              spellCheck={false}
              value={hex}
              maxLength={7}
              onChange={e => setHex(e.target.value)}
              onBlur={commitHex}
              onKeyDown={(e) => { if (e.key === 'Enter') { commitHex(); setOpen(false); } }}
              placeholder="#ffd6e0"
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function UploadZone({ label, image, onPick, onClear, onCrop }) {
  const inputRef = useRefM(null);
  const [drag, setDrag] = useStateM(false);

  return (
    <div
      className="upload-zone"
      style={drag ? { borderColor: 'var(--accent)', background: '#fff3f6' } : undefined}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => {
        e.preventDefault(); setDrag(false);
        const f = e.dataTransfer.files?.[0]; if (f) onPick(f);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={e => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ''; }}
      />
      {image ? (
        <>
          <img src={image} alt="" />
          {onCrop && (
            <button className="upload-crop" title="Crop" onClick={e => { e.stopPropagation(); onCrop(); }}>
              <Icon.crop />
            </button>
          )}
          <button className="upload-clear" title="Remove" onClick={e => { e.stopPropagation(); onClear(); }}><Icon.close /></button>
          <div className="upload-label">{label}</div>
        </>
      ) : (
        <div className="upload-placeholder">
          <Icon.upload />
          <div>{label}</div>
          <div style={{ fontSize: 10, color: 'var(--ink-fade)' }}>Click or drop</div>
        </div>
      )}
    </div>
  );
}

export {
  Modal,
  ConfirmModal,
  NewBinderModal,
  EditBinderModal,
  ManageSheetsModal,
  CardModal,
  CropModal,
  UploadZone,
  SleeveColorPicker,
  CuteSelect,
  PillMulti,
  ToggleField,
  CollectionPicker,
};
