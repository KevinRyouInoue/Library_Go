import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import SearchBar from '../components/SearchBar';
import ResultsGrid from '../components/ResultsGrid';
import Pagination from '../components/Pagination';
import { useBooksSearch } from '../hooks/useBooksSearch';
import TechTags from '../components/TechTags';
import type { Book, TsundokuItem } from '../types';

type Props = {
  tsundokuItems: Partial<Record<string, TsundokuItem>>;
  onAddTsundoku: (book: Book) => Promise<unknown>;
};

export default function SearchPage({ tsundokuItems, onAddTsundoku }: Props) {
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
    <div style={{ display: 'grid', gap: 24 }}>
      <section style={cardStyle}>
        <h2 style={sectionTitleStyle}>検索条件</h2>
        <p style={sectionHintStyle}>
          タグを一つ選ぶと関連クエリが自動でセットされます。キーワードはスペース区切りで AND、引用符でフレーズ検索になります。
        </p>
        <div style={{ display: 'grid', gap: 16 }}>
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
            <div style={{ color: '#475569', fontSize: 13 }}>
              {tagLabel}
            </div>
          )}
        </div>
      </section>

      <section style={cardStyle}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={sectionTitleStyle}>検索結果</h2>
          <p style={sectionHintStyle}>
            気になる本はカード右上の「＋」で積読へ。積読済みの本はステータスが表示されます。
          </p>
        </div>

        {hasSearched ? (
          <>
            <ResultsGrid
              items={items}
              getTsundokuItem={(id) => tsundokuItems[id]}
              onAddTsundoku={onAddTsundoku}
            />

            <div style={{ marginTop: 16 }}>
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
            padding: '48px 16px',
            color: '#94a3b8',
            fontSize: 14,
          }}
          >
            上の検索ボックスでキーワードやタグを指定してみてください。
          </div>
        )}

        {hasSearched && !hasItems && (
          <div style={{ marginTop: 16, fontSize: 14, color: '#94a3b8' }}>
            条件に合う書籍が見つかりませんでした。キーワードやタグを変えて再検索してみてください。
          </div>
        )}
      </section>
    </div>
  );
}

const cardStyle: CSSProperties = {
  background: '#ffffff',
  borderRadius: 16,
  padding: '24px 28px',
  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
  display: 'grid',
  gap: 16,
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 600,
  color: '#0f172a',
};

const sectionHintStyle: CSSProperties = {
  margin: 0,
  color: '#64748b',
  fontSize: 13,
};
