import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, createTsundokuItem, fetchTsundokuItems, pickupSpecificTsundokuItem, pickupTsundokuItem, restackTsundokuItem, updateTsundokuStatus } from '../api';
import type { Book, TsundokuItem, TsundokuStatus } from '../types';

function sortItems(items: TsundokuItem[]): TsundokuItem[] {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.AddedAt).getTime();
    const bTime = new Date(b.AddedAt).getTime();
    if (aTime === bTime) {
      return a.ID.localeCompare(b.ID);
    }
    return aTime - bTime;
  });
}

export function useTsundoku() {
  const [items, setItems] = useState<TsundokuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTsundokuItems();
      setItems(sortItems(data));
      setError('');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'tsundoku fetch error';
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const upsertItem = useCallback((next: TsundokuItem) => {
    setItems((prev) => {
      const filtered = prev.filter((item) => item.ID !== next.ID);
      return sortItems([...filtered, next]);
    });
  }, []);

  const add = useCallback(async (book: Book) => {
    try {
      const created = await createTsundokuItem({ book });
      upsertItem(created);
      setError('');
      return created;
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 409) {
        const friendly = new Error('この本は既に積読に追加されています');
        setError(friendly.message);
        throw friendly;
      }
      const err = e instanceof Error ? e : new Error('積読の追加に失敗しました');
      setError(err.message);
      throw err;
    }
  }, [upsertItem]);

  const pickup = useCallback(async () => {
    try {
      const picked = await pickupTsundokuItem();
      upsertItem(picked);
      setError('');
      return picked;
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 404) {
        const friendly = new Error('積読の一覧が空です');
        setError(friendly.message);
        throw friendly;
      }
      if (e instanceof ApiError && e.status === 409) {
        const friendly = new Error('読書中の本があります。読了にするか積読へ戻してから取り出してください。');
        setError(friendly.message);
        throw friendly;
      }
      const err = e instanceof Error ? e : new Error('積読の取り出しに失敗しました');
      setError(err.message);
      throw err;
    }
  }, [upsertItem]);

  const pickupSpecific = useCallback(async (id: string) => {
    try {
      const picked = await pickupSpecificTsundokuItem(id);
      upsertItem(picked);
      setError('');
      return picked;
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 404) {
        const friendly = new Error('指定した本が見つかりませんでした');
        setError(friendly.message);
        throw friendly;
      }
      if (e instanceof ApiError && e.status === 409) {
        const friendly = new Error('読書中の本があります。読了にするか積読へ戻してから選択してください。');
        setError(friendly.message);
        throw friendly;
      }
      const err = e instanceof Error ? e : new Error('読書開始に失敗しました');
      setError(err.message);
      throw err;
    }
  }, [upsertItem]);

  const updateStatus = useCallback(async (id: string, status: TsundokuStatus) => {
    try {
      const updated = await updateTsundokuStatus(id, status);
      upsertItem(updated);
      setError('');
      return updated;
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error('積読ステータスの更新に失敗しました');
      setError(err.message);
      throw err;
    }
  }, [upsertItem]);

  const restackItem = useCallback(async (id: string) => {
    try {
      const restacked = await restackTsundokuItem(id);
      upsertItem(restacked);
      setError('');
      return restacked;
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error('積読へ戻す操作に失敗しました');
      setError(err.message);
      throw err;
    }
  }, [upsertItem]);

  const activeMap = useMemo(() => {
    const acc = new Map<string, TsundokuItem>();
    items.forEach((item) => {
      acc.set(item.ID, item);
    });
    return acc;
  }, [items]);

  const isStacked = useCallback(
    (id: string) => {
      const item = activeMap.get(id);
      return item && item.Status !== 'done';
    },
    [activeMap]
  );

  return {
    items,
    loading,
    error,
    refresh,
    add,
    pickup,
    pickupSpecific,
    updateStatus,
    restack: restackItem,
    isStacked,
  } as const;
}
