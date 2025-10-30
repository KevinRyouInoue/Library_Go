import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, addFavoriteItem, fetchFavoriteItems, removeFavoriteItem } from '../api';
import type { Book, FavoriteItem } from '../types';

function sortItems(items: FavoriteItem[]): FavoriteItem[] {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.AddedAt).getTime();
    const bTime = new Date(b.AddedAt).getTime();
    if (aTime === bTime) {
      return a.ID.localeCompare(b.ID);
    }
    return aTime - bTime;
  });
}

export function useFavorites() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchFavoriteItems();
      setItems(sortItems(data));
      setError('');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'favorites fetch error';
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const upsertItem = useCallback((next: FavoriteItem) => {
    setItems((prev) => {
      const filtered = prev.filter((item) => item.ID !== next.ID);
      return sortItems([...filtered, next]);
    });
  }, []);

  const removeItem = useCallback((bookId: string) => {
    setItems((prev) => prev.filter((item) => item.ID !== bookId));
  }, []);

  const add = useCallback(async (book: Book) => {
    try {
      const created = await addFavoriteItem(book);
      upsertItem(created);
      setError('');
      return created;
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 409) {
        const friendly = new Error('この本は既にお気に入りに追加されています');
        setError(friendly.message);
        throw friendly;
      }
      const err = e instanceof Error ? e : new Error('お気に入りの追加に失敗しました');
      setError(err.message);
      throw err;
    }
  }, [upsertItem]);

  const remove = useCallback(async (bookId: string) => {
    try {
      await removeFavoriteItem(bookId);
      removeItem(bookId);
      setError('');
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 404) {
        const friendly = new Error('お気に入りが見つかりませんでした');
        setError(friendly.message);
        throw friendly;
      }
      const err = e instanceof Error ? e : new Error('お気に入りの削除に失敗しました');
      setError(err.message);
      throw err;
    }
  }, [removeItem]);

  const favoriteMap = useMemo(() => {
    const acc = new Map<string, FavoriteItem>();
    items.forEach((item) => {
      acc.set(item.ID, item);
    });
    return acc;
  }, [items]);

  const isFavorite = useCallback(
    (bookId: string) => favoriteMap.has(bookId),
    [favoriteMap]
  );

  return {
    items,
    loading,
    error,
    refresh,
    add,
    remove,
    isFavorite,
  } as const;
}
