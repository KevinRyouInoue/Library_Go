import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import SearchPage from './pages/SearchPage';
import TsundokuPage from './pages/TsundokuPage';
import FavoritesPage from './pages/FavoritesPage';
import { useTsundoku } from './hooks/useTsundoku';
import { useFavorites } from './hooks/useFavorites';
import type { Book, TsundokuItem, FavoriteItem } from './types';

type View = 'search' | 'tsundoku' | 'favorites';

/**
 * Main application component that manages the navigation between different views
 */
export default function App() {
  const [view, setView] = useState<View>('search');
  const tsundoku = useTsundoku();
  const favorites = useFavorites();

  // Create index maps for quick lookup of tsundoku and favorite items by ID
  const tsundokuIndex = useMemo<Partial<Record<string, TsundokuItem>>>(() => {
    const index: Record<string, TsundokuItem> = {};
    tsundoku.items.forEach((item) => {
      index[item.ID] = item;
    });
    return index;
  }, [tsundoku.items]);

  const favoritesIndex = useMemo(() => {
    const index: Record<string, FavoriteItem> = {};
    favorites.items.forEach((item) => {
      index[item.ID] = item;
    });
    return index;
  }, [favorites.items]);

  // Handler functions for adding/removing items
  const handleAddTsundoku = (book: Book) => tsundoku.add(book);
  const handleAddFavorite = (book: Book) => favorites.add(book);
  const handleRemoveFavorite = (bookId: string) => favorites.remove(bookId);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <header style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        color: '#1a202c',
        padding: '20px 0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid rgba(102, 126, 234, 0.2)',
      }}
      >
        <div style={headerInnerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 32 }}>📚</span>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>
                Technical Books
              </h1>
              <p style={{ margin: 0, fontSize: 12, color: '#718096' }}>Discover & Organize Your Learning</p>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 8 }}>
            {(['search', 'tsundoku', 'favorites'] as View[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                style={navButtonStyle(view === key)}
              >
                <span style={{ fontSize: 18, marginRight: 6 }}>
                  {key === 'search' ? '🔍' : key === 'tsundoku' ? '📖' : '⭐'}
                </span>
                {key === 'search' ? 'Search' : key === 'tsundoku' ? 'Reading List' : 'Favorites'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main style={mainStyle}>
        {view === 'search' ? (
          <SearchPage
            tsundokuItems={tsundokuIndex}
            favoriteItems={favoritesIndex}
            onAddTsundoku={handleAddTsundoku}
            onAddFavorite={handleAddFavorite}
            onRemoveFavorite={handleRemoveFavorite}
          />
        ) : view === 'tsundoku' ? (
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
        ) : (
          <FavoritesPage
            items={favorites.items}
            loading={favorites.loading}
            error={favorites.error}
            onRefresh={favorites.refresh}
            onRemove={favorites.remove}
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
    padding: '10px 20px',
    borderRadius: 12,
    border: 'none',
    background: active 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      : 'transparent',
    color: active ? '#fff' : '#4a5568',
    cursor: active ? 'default' : 'pointer',
    fontSize: 14,
    fontWeight: active ? 600 : 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    boxShadow: active ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none',
    transform: active ? 'translateY(-2px)' : 'none',
  };
}
