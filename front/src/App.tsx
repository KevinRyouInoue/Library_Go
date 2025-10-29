import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import SearchPage from './pages/SearchPage';
import TsundokuPage from './pages/TsundokuPage';
import { useTsundoku } from './hooks/useTsundoku';
import type { Book, TsundokuItem } from './types';

type View = 'search' | 'tsundoku';

export default function App() {
  const [view, setView] = useState<View>('search');
  const tsundoku = useTsundoku();

  const tsundokuIndex = useMemo<Partial<Record<string, TsundokuItem>>>(() => {
    const index: Record<string, TsundokuItem> = {};
    tsundoku.items.forEach((item) => {
      index[item.ID] = item;
    });
    return index;
  }, [tsundoku.items]);

  const handleAddTsundoku = (book: Book) => tsundoku.add(book);

  return (
    <div style={{ minHeight: '100vh', background: '#e2e8f0' }}>
      <header style={{
        background: '#0f172a',
        color: '#fff',
        padding: '20px 0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.35)',
      }}
      >
        <div style={headerInnerStyle}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24 }}>Technical Books Search</h1>
          </div>
          <nav style={{ display: 'flex', gap: 12 }}>
            {(['search', 'tsundoku'] as View[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                style={navButtonStyle(view === key)}
              >
                {key === 'search' ? '検索' : '積読リスト'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main style={mainStyle}>
        {view === 'search' ? (
          <SearchPage
            tsundokuItems={tsundokuIndex}
            onAddTsundoku={handleAddTsundoku}
          />
        ) : (
          <TsundokuPage
            items={tsundoku.items}
            loading={tsundoku.loading}
            error={tsundoku.error}
            onRefresh={tsundoku.refresh}
            onPickup={tsundoku.pickup}
            onPickupSpecific={tsundoku.pickupSpecific}
            onUpdateStatus={tsundoku.updateStatus}
            onRestack={tsundoku.restack}
          />
        )}
      </main>
    </div>
  );
}

const headerInnerStyle: CSSProperties = {
  maxWidth: 1080,
  margin: '0 auto',
  padding: '0 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 24,
  flexWrap: 'wrap',
};

const mainStyle: CSSProperties = {
  maxWidth: 1080,
  margin: '0 auto',
  padding: '32px 24px 48px',
  display: 'grid',
  gap: 24,
};

function navButtonStyle(active: boolean): CSSProperties {
  return {
    padding: '6px 20px',
    borderRadius: 999,
    border: active ? '1px solid rgba(255,255,255,0.9)' : '1px solid rgba(148,163,184,0.35)',
    background: active ? '#e2e8f0' : 'transparent',
    color: active ? '#0f172a' : '#e2e8f0',
    cursor: active ? 'default' : 'pointer',
    fontSize: 15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}
