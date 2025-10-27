import type { SearchResponse } from './types';

export type SearchParams = {
  q?: string;
  page?: number;
  startIndex?: number;
  orderBy?: 'relevance' | 'newest';
  lang?: string;
};

export async function searchBooks(params: SearchParams): Promise<SearchResponse> {
  const usp = new URLSearchParams();
  if (params.q) usp.set('q', params.q);
  usp.set('page', String(params.page ?? 1));
  if (typeof params.startIndex === 'number') {
    usp.set('startIndex', String(params.startIndex));
  }
  if (params.orderBy) usp.set('orderBy', params.orderBy);
  if (params.lang && params.lang !== 'all') usp.set('lang', params.lang);

  const res = await fetch(`/api/technical-books?${usp.toString()}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<SearchResponse>;
}
