import { useCallback, useEffect, useMemo, useState } from 'react';
import { searchBooks, type SearchParams } from '../api';
import { getQueriesFor } from '../tags';
import type { Book } from '../types';

export function useBooksSearch(initial?: SearchParams) {
  const [q, setQ] = useState<string>(initial?.q ?? '');
  const [page, setPage] = useState<number>(initial?.page ?? 1);
  const [limit, setLimit] = useState<number>(initial?.limit ?? 20);
  const [orderBy, setOrderBy] = useState<'relevance' | 'newest'>(initial?.orderBy ?? 'relevance');
  const [lang, setLang] = useState<string>(initial?.lang ?? '');
  const [tagKeys, setTagKeys] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [items, setItems] = useState<Book[]>([]);
  const [total, setTotal] = useState<number>(0);

  const hasNext = useMemo(() => page * limit < total, [page, limit, total]);

  // 検索可能条件（q または タグのいずれか）
  const canSearch = useMemo(() => q.trim() !== '' || tagKeys.length > 0, [q, tagKeys]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    // 空クエリの場合はリクエストを送らない
    const tagTerms = getQueriesFor(tagKeys);
    const orExpr = tagTerms.length > 0
      ? `(${tagTerms.map((t) => (t.includes(' ') ? `"${t}"` : t)).join(' OR ')})`
      : '';

    const free = q.trim();
    const tokenExprs = free === ''
      ? []
      : free.split(/\s+/).map((w) => {
          const quoted = w.includes(' ') ? `"${w}"` : w;
          // タイトルに含む or テキストに含む のどちらかを満たす
          return `(intitle:${quoted} OR "${w}")`;
        });

    const finalQ = [orExpr, ...tokenExprs].filter(Boolean).join(' ');
    if (finalQ === '') return;

    setLoading(true);
    setError('');
    try {
      const data = await searchBooks({ q: finalQ, page, limit, orderBy, lang });
      setItems(Array.isArray(data.Items) ? data.Items : []);
      setTotal(typeof data.TotalItems === 'number' ? data.TotalItems : 0);
    } catch (e: any) {
      setError(e?.message || 'fetch error');
    } finally {
      setLoading(false);
    }
  }, [q, page, limit, orderBy, lang, tagKeys]);

  // 初回は自動取得しない。検索後のみ、page/limit変更で再取得。
  useEffect(() => {
    if (hasSearched) {
      fetchData();
    }
  }, [fetchData, hasSearched, page, limit]);

  // 入力が空（qもタグも空）になったら結果を非表示にしてエラーもクリア
  useEffect(() => {
    if (q.trim() === '' && tagKeys.length === 0) {
      setHasSearched(false);
      setItems([]);
      setTotal(0);
      setError('');
    }
  }, [q, tagKeys]);

  const search = useCallback(() => {
    if (!canSearch) return;
    setHasSearched(true);
    // page は呼び出し元で調整される前提
    fetchData();
  }, [canSearch, fetchData]);

  return {
    state: { q, page, limit, orderBy, lang, tagKeys },
    setQ, setPage, setLimit, setOrderBy, setLang,
    setTagKeys,
    loading, error, items, total, hasNext,
    refetch: fetchData,
    canSearch,
    hasSearched,
    search,
  } as const;
}
