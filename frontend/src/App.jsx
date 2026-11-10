import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { Icon, gridDef, countCards, Sidebar } from './components/core';
import { BinderView } from './components/BinderView';
import { NewBinderModal, EditBinderModal, ManageSheetsModal, CardModal, ConfirmModal } from './components/modals';
import { TopTabs, CommunityView, CommunityModal } from './components/views';
import { StatsView, ScannerOverlay } from './components/stats-scanner';
import { api } from './lib/api';
import { THEME } from './lib/theme';

/* ──────────────────────────────────────────────────────
   State — the server owns the data. Every mutation goes to the
   API, which answers with the full updated binder; the reducer
   just swaps it in.
   ────────────────────────────────────────────────────── */
function reducer(state, action) {
  switch (action.type) {
    case 'LOADED':
      return { ...state, status: 'ready', binders: action.binders, selectedId: action.binders[0]?.id ?? null };
    case 'LOAD_FAILED':
      return { ...state, status: 'error', error: action.error };
    case 'ADD_BINDER':
      return { ...state, binders: [...state.binders, action.binder], selectedId: action.binder.id };
    case 'REPLACE_BINDER':
      return { ...state, binders: state.binders.map(b => b.id === action.binder.id ? action.binder : b) };
    case 'REMOVE_BINDER': {
      const binders = state.binders.filter(b => b.id !== action.id);
      const selectedId = state.selectedId === action.id ? (binders[0]?.id ?? null) : state.selectedId;
      return { ...state, binders, selectedId };
    }
    case 'SELECT_BINDER':
      return { ...state, selectedId: action.id };
    default:
      return state;
  }
}

const initialState = { status: 'loading', error: null, binders: [], selectedId: null };

/* Find the first empty slot in a binder, scanning sheets front → back. */
function firstEmptySlot(binder) {
  for (const sh of binder.sheets) {
    for (const face of ['front', 'back']) {
      const idx = sh[face].slots.findIndex(s => !s);
      if (idx !== -1) return { sheetId: sh.id, face, idx };
    }
  }
  return null;
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showNewBinder, setShowNewBinder] = useState(false);
  const [editBinderId, setEditBinderId] = useState(null);
  const [manageBinderId, setManageBinderId] = useState(null);
  const [deletingBinderId, setDeletingBinderId] = useState(null);
  const [cardModal, setCardModal] = useState(null);
  const [toast, setToast] = useState(null);

  /* Top-tab routing + AI scanner overlay */
  const [tab, setTab] = useState('binders'); // binders | community | stats
  const [scanning, setScanning] = useState(false);
  const [communityCol, setCommunityCol] = useState(null);

  const accent = THEME.purpleShade;

  const load = useCallback(() => {
    api.listBinders()
      .then(binders => dispatch({ type: 'LOADED', binders }))
      .catch(err => dispatch({ type: 'LOAD_FAILED', error: err.message }));
  }, []);
  useEffect(load, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  /* Run an API call that returns an updated binder; surface failures. */
  const mutate = useCallback(async (promise) => {
    try {
      const binder = await promise;
      if (binder) dispatch({ type: 'REPLACE_BINDER', binder });
      return binder;
    } catch (err) {
      setToast(err.message || 'Something went wrong');
      return null;
    }
  }, []);

  /* Scanner → drop the recognized card into the first empty slot of the
     chosen binder, appending a sheet if the binder is full. */
  const addScannedCard = async (binderId, card) => {
    let b = state.binders.find(x => x.id === binderId);
    if (!b) { setScanning(false); return; }
    let spot = firstEmptySlot(b);
    if (!spot) {
      b = await mutate(api.addSheet(binderId));
      if (!b) return;
      spot = { sheetId: b.sheets[b.sheets.length - 1].id, face: 'front', idx: 0 };
    }
    const saved = await mutate(api.putCard(binderId, spot.sheetId, spot.face, spot.idx, card));
    if (!saved) return;
    setScanning(false);
    setTab('binders');
    dispatch({ type: 'SELECT_BINDER', id: binderId });
  };

  const selectedBinder = useMemo(
    () => state.binders.find(b => b.id === state.selectedId),
    [state.binders, state.selectedId]
  );

  const totalCards = useMemo(
    () => selectedBinder ? countCards(selectedBinder) : 0,
    [selectedBinder]
  );

  const editingBinder  = state.binders.find(b => b.id === editBinderId)   || null;
  const manageBinder   = state.binders.find(b => b.id === manageBinderId) || null;
  const deletingBinder = state.binders.find(b => b.id === deletingBinderId) || null;

  /* Slot interactions (sheet-based) */
  const onSlotClick = (binderId, sheetId, face, idx) => {
    const b = state.binders.find(x => x.id === binderId);
    const sh = b?.sheets.find(x => x.id === sheetId);
    if (!sh) return;
    if (!sh[face].slots[idx]) {
      setCardModal({ binderId, sheetId, face, idx, card: null, mode: 'add' });
    }
  };
  const onSlotEdit = (binderId, sheetId, face, idx) => {
    const b = state.binders.find(x => x.id === binderId);
    const card = b?.sheets.find(x => x.id === sheetId)?.[face].slots[idx];
    if (!card) return;
    setCardModal({ binderId, sheetId, face, idx, card, mode: 'edit' });
  };
  const onSlotDelete = (binderId, sheetId, face, idx) => {
    mutate(api.deleteCard(binderId, sheetId, face, idx));
  };

  const saveCard = async (card) => {
    if (!cardModal) return;
    const { binderId, sheetId, face, idx } = cardModal;
    const saved = await mutate(api.putCard(binderId, sheetId, face, idx, card));
    if (saved) setCardModal(null);
  };

  const sheetCount = selectedBinder ? selectedBinder.sheets.length : 0;
  const spreadCount = selectedBinder ? sheetCount + 1 : 0;

  return (
    <div className="app">
      <Sidebar
        binders={state.binders}
        selectedId={state.selectedId}
        onSelect={(id) => dispatch({ type: 'SELECT_BINDER', id })}
        onNew={() => setShowNewBinder(true)}
        onEdit={(id) => setEditBinderId(id)}
        onDelete={(id) => setDeletingBinderId(id)}
        onReorderSpreads={(id) => setManageBinderId(id)}
      />

      <main className="main">
        <TopTabs tab={tab} onTab={setTab} onScan={() => setScanning(true)} />

        {tab === 'binders' && (
          <>
            <div className="topbar">
              <div>
                <div className="topbar-title">{selectedBinder ? selectedBinder.name : 'Card'}</div>
                {selectedBinder && (
                  <div className="topbar-sub">
                    {gridDef(selectedBinder.gridType).label} grid · {sheetCount} sheet{sheetCount === 1 ? '' : 's'} · {spreadCount} spread{spreadCount === 1 ? '' : 's'} · {totalCards} card{totalCards === 1 ? '' : 's'}
                  </div>
                )}
              </div>
              <div className="topbar-right">
                {selectedBinder && (
                  <>
                    <button className="chip chip-btn" onClick={() => setEditBinderId(selectedBinder.id)}>
                      <Icon.pencil /> Edit binder
                    </button>
                    <button className="chip chip-btn" onClick={() => setManageBinderId(selectedBinder.id)}>
                      <Icon.shuffle /> Manage sheets
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="stage">
              {state.status === 'loading' ? (
                <div className="empty-state"><p>Loading your binders…</p></div>
              ) : state.status === 'error' ? (
                <div className="empty-state">
                  <h2>Can't reach the server</h2>
                  <p>{state.error}</p>
                  <button className="btn primary" onClick={load}>Try again</button>
                </div>
              ) : selectedBinder ? (
                <BinderView
                  binder={selectedBinder}
                  onAddSheetEnd={(id) => mutate(api.addSheet(id))}
                  onInsertSheet={(id, index) => mutate(api.addSheet(id, index))}
                  onSlotClick={onSlotClick}
                  onSlotEdit={onSlotEdit}
                  onSlotDelete={onSlotDelete}
                />
              ) : (
                <div className="empty-state">
                  <div className="empty-art">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      <path d="M9 7h7M9 11h5"/>
                    </svg>
                  </div>
                  <h2>No binder yet</h2>
                  <p>Click <strong>+ New Binder</strong> to start your first one.</p>
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'community' && (
          <div className="view-scroll">
            <CommunityView layout={THEME.communityLayout} onOpen={setCommunityCol} />
          </div>
        )}

        {tab === 'stats' && (
          <div className="view-scroll">
            <StatsView binders={state.binders} density={THEME.statsDensity} accent={accent} />
          </div>
        )}
      </main>

      {showNewBinder && (
        <NewBinderModal
          onClose={() => setShowNewBinder(false)}
          onCreate={async (opts) => {
            try {
              const binder = await api.createBinder(opts);
              dispatch({ type: 'ADD_BINDER', binder });
              setShowNewBinder(false);
            } catch (err) {
              setToast(err.message);
            }
          }}
        />
      )}

      {editingBinder && (
        <EditBinderModal
          binder={editingBinder}
          onClose={() => setEditBinderId(null)}
          onSave={async (patch) => {
            if (await mutate(api.updateBinder(editingBinder.id, patch))) setEditBinderId(null);
          }}
        />
      )}

      {manageBinder && (
        <ManageSheetsModal
          binder={manageBinder}
          onClose={() => setManageBinderId(null)}
          onApply={async ({ order, renames }) => {
            if (await mutate(api.updateSheets(manageBinder.id, { order, renames }))) setManageBinderId(null);
          }}
          onDeleteSheet={(sheetId) => mutate(api.deleteSheet(manageBinder.id, sheetId))}
        />
      )}

      {cardModal && (
        <CardModal
          initialCard={cardModal.card}
          binder={state.binders.find(b => b.id === cardModal.binderId)}
          face={cardModal.face}
          onClose={() => setCardModal(null)}
          onSave={saveCard}
        />
      )}

      {deletingBinder && (
        <ConfirmModal
          title="Delete this binder?"
          body={<>You're about to delete <strong>{deletingBinder.name}</strong>.</>}
          detail={(() => {
            const cards = countCards(deletingBinder);
            const sCount = deletingBinder.sheets.length;
            return `All ${sCount} sheet${sCount === 1 ? '' : 's'} and ${cards} card${cards === 1 ? '' : 's'} inside will be lost. This can't be undone.`;
          })()}
          confirmLabel="Delete binder"
          cancelLabel="Keep it"
          onCancel={() => setDeletingBinderId(null)}
          onConfirm={async () => {
            try {
              await api.deleteBinder(deletingBinder.id);
              dispatch({ type: 'REMOVE_BINDER', id: deletingBinder.id });
            } catch (err) {
              setToast(err.message);
            }
            setDeletingBinderId(null);
          }}
        />
      )}

      {scanning && (
        <ScannerOverlay
          binders={state.binders}
          form={THEME.scannerForm}
          onClose={() => setScanning(false)}
          onAdd={addScannedCard}
        />
      )}

      {communityCol && (
        <CommunityModal col={communityCol} onClose={() => setCommunityCol(null)} />
      )}

      {toast && (
        <div className="toast" role="alert" onClick={() => setToast(null)}>{toast}</div>
      )}
    </div>
  );
}
