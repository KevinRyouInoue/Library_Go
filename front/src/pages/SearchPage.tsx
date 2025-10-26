import SearchBar from '../components/SearchBar';
import ResultsGrid from '../components/ResultsGrid';
import Pagination from '../components/Pagination';
import { useBooksSearch } from '../hooks/useBooksSearch';

export default function SearchPage() {
  const {
    state: { q, category, page, limit },
    setQ, setCategory, setPage, setLimit,
    loading, error, items, total, hasNext,
    canSearch, hasSearched, search,
  } = useBooksSearch({ page: 1, limit: 20 });

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <h1>Technical Books Search</h1>

      <SearchBar
        q={q}
        onChangeQ={setQ}
        category={category}
        onChangeCategory={(v) => { setCategory(v); setPage(1); }}
        limit={limit}
        onChangeLimit={(n) => { setLimit(n); setPage(1); if (hasSearched) search(); }}
        onSubmit={() => { setPage(1); search(); }}
        disabled={!canSearch}
      />

      {hasSearched && (
        <div style={{ marginBottom: 8 }}>
          {loading ? '読み込み中…' : error ? <span style={{ color: 'red' }}>{error}</span> : `${total}件`}
        </div>
      )}

      <ResultsGrid items={hasSearched ? items : undefined} />

      {hasSearched && (
      <Pagination
        page={page}
        hasNext={hasNext}
        loading={loading}
        onPrev={() => { const np = Math.max(1, page - 1); setPage(np); search(); }}
        onNext={() => { const np = page + 1; setPage(np); search(); }}
      />)}
    </div>
  );
}
