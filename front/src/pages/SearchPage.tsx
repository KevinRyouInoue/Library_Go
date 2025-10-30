import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import SearchBar from '../components/SearchBar';
import ResultsGrid from '../components/ResultsGrid';
import Pagination from '../components/Pagination';
import { useBooksSearch } from '../hooks/useBooksSearch';
import TechTags from '../components/TechTags';
import type { Book, TsundokuItem, FavoriteItem } from '../types';

type Props = {
  tsundokuItems: Partial<Record<string, TsundokuItem>>;
  favoriteItems: Partial<Record<string, FavoriteItem>>;
  onAddTsundoku: (book: Book) => Promise<unknown>;
  onAddFavorite: (book: Book) => Promise<unknown>;
  onRemoveFavorite: (bookId: string) => Promise<void>;
};

export default function SearchPage({ tsundokuItems, favoriteItems, onAddTsundoku, onAddFavorite, onRemoveFavorite }: Props) {
  const {
    state: { q, page, tagKeys },
    setQ, setPage,
    setTagKeys,
    loading, error, items, total, hasNext,
    canSearch, hasSearched, search,
  } = useBooksSearch({ page: 1 });

  const tagLabel = useMemo(
    () => (hasSearched ? (loading ? '読み込み中…' : error ? <span style={{ color: 'red' }}>{error}</span> : `${total}件`) : null),
    [hasSearched, loading, error, total]
  );

  const hasItems = hasSearched && items && items.length > 0;

  return (
    <div style={{ display: 'grid', gap: 32 }}>
      <section style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>🔍</span>
          <h2 style={sectionTitleStyle}>検索条件</h2>
        </div>
        <p style={sectionHintStyle}>
          タグを一つ選ぶと関連クエリが自動でセットされます。キーワードはスペース区切りで AND、引用符でフレーズ検索になります。
        </p>
        <div style={{ display: 'grid', gap: 20 }}>
          <TechTags
            selected={tagKeys}
            onToggle={(key) => {
              if (tagKeys.length === 1 && tagKeys[0] === key) {
                setTagKeys([]); // 同じタグなら解除
                setPage(1);
              } else {
                setTagKeys([key]); // 別タグを選んだら置き換え
                setPage(1);
              }
            }}
          />

          <SearchBar
            q={q}
            onChangeQ={setQ}
            onSubmit={() => { setPage(1); search(); }}
            disabled={!canSearch}
          />
          {tagLabel && (
            <div style={{ 
              color: '#667eea', 
              fontSize: 14, 
              fontWeight: 600,
              padding: '8px 16px',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: 8,
              display: 'inline-block',
            }}>
              {tagLabel}
            </div>
          )}
        </div>
      </section>

      <section style={cardStyle}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>📖</span>
            <h2 style={sectionTitleStyle}>検索結果</h2>
          </div>
          <p style={sectionHintStyle}>
            気になる本はカード右上の「⭐」でお気に入りへ、「＋」で積読リストへ追加できます。
          </p>
        </div>

        {hasSearched ? (
          <>
            <ResultsGrid
              items={items}
              getTsundokuItem={(id) => tsundokuItems[id]}
              getFavoriteItem={(id) => favoriteItems[id]}
              onAddTsundoku={onAddTsundoku}
              onAddFavorite={onAddFavorite}
              onRemoveFavorite={onRemoveFavorite}
            />

            <div style={{ marginTop: 24 }}>
              <Pagination
                page={page}
                hasNext={hasNext}
                loading={loading}
                onPrev={() => { const np = Math.max(1, page - 1); setPage(np); }}
                onNext={() => { const np = page + 1; setPage(np); }}
              />
            </div>
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '64px 16px',
            color: '#94a3b8',
            fontSize: 15,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            borderRadius: 12,
            border: '2px dashed rgba(102, 126, 234, 0.2)',
          }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            上の検索ボックスでキーワードやタグを指定してみてください。
          </div>
        )}

        {hasSearched && !hasItems && (
          <div style={{ 
            marginTop: 16, 
            fontSize: 14, 
            color: '#64748b',
            textAlign: 'center',
            padding: 24,
            background: 'rgba(241, 245, 249, 0.8)',
            borderRadius: 8,
          }}>
            条件に合う書籍が見つかりませんでした。キーワードやタグを変えて再検索してみてください。
          </div>
        )}
      </section>
    </div>
  );
}

const cardStyle: CSSProperties = {
  background: 'rgba(255, 255, 255, 0.98)',
  borderRadius: 20,
  padding: '32px',
  boxShadow: '0 10px 40px rgba(102, 126, 234, 0.15)',
  display: 'grid',
  gap: 16,
  border: '1px solid rgba(102, 126, 234, 0.1)',
  backdropFilter: 'blur(10px)',
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 700,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const sectionHintStyle: CSSProperties = {
  margin: 0,
  color: '#64748b',
  fontSize: 13,
};
