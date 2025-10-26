import { useCallback, useEffect, useMemo, useState } from 'react';
import { searchBooks, type SearchParams } from '../api';
import type { Book } from '../types';

export function useBooksSearch(initial?: SearchParams) {
  const [q, setQ] = useState<string>(initial?.q ?? '');
  const [category, setCategory] = useState<string>(initial?.category ?? 'all');
  const [page, setPage] = useState<number>(initial?.page ?? 1);
  const [limit, setLimit] = useState<number>(initial?.limit ?? 20);
  const [orderBy, setOrderBy] = useState<'relevance' | 'newest'>(initial?.orderBy ?? 'relevance');
  const [lang, setLang] = useState<string>(initial?.lang ?? '');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [items, setItems] = useState<Book[]>([]);
  const [total, setTotal] = useState<number>(0);

  const hasNext = useMemo(() => page * limit < total, [page, limit, total]);

  // 検索可能条件（q か category != 'all'）
  const canSearch = useMemo(() => q.trim() !== '' || category !== 'all', [q, category]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await searchBooks({ q, category, page, limit, orderBy, lang });
      setItems(Array.isArray(data.Items) ? data.Items : []);
      setTotal(typeof data.TotalItems === 'number' ? data.TotalItems : 0);
    } catch (e: any) {
      setError(e?.message || 'fetch error');
    } finally {
      setLoading(false);
    }
  }, [q, category, page, limit, orderBy, lang]);

  // 初回は自動取得しない。検索後のみ、page/limit変更で再取得。
  useEffect(() => {
    if (hasSearched) {
      fetchData();
    }
  }, [fetchData, hasSearched, page, limit]);

  const search = useCallback(() => {
    if (!canSearch) return;
    setHasSearched(true);
    // page は呼び出し元で調整される前提
    fetchData();
  }, [canSearch, fetchData]);

  return {
    state: { q, category, page, limit, orderBy, lang },
    setQ, setCategory, setPage, setLimit, setOrderBy, setLang,
    loading, error, items, total, hasNext,
    refetch: fetchData,
    canSearch,
    hasSearched,
    search,
  } as const;
}
