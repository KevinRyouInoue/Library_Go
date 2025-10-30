import type { Book, SearchResponse, TsundokuItem, TsundokuStatus, FavoriteItem } from './types';

/**
 * Parameters for searching books via Google Books API
 */
export type SearchParams = {
  q?: string;
  page?: number;
  startIndex?: number;
  orderBy?: 'relevance' | 'newest';
  lang?: string;
};

/**
 * Custom error class for API-related errors
 */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

/**
 * Helper function to parse API responses
 */
async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text || res.statusText);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

/**
 * Search for technical books using the Google Books API
 */
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
  return parseResponse<SearchResponse>(res);
}

// ============================================================================
// Tsundoku (Reading List) API
// ============================================================================

/**
 * Fetch all tsundoku items, optionally filtered by status
 */
export async function fetchTsundokuItems(status?: TsundokuStatus): Promise<TsundokuItem[]> {
  const usp = new URLSearchParams();
  if (status) usp.set('status', status);
  const query = usp.toString();
  const res = await fetch(`/api/tsundoku${query ? `?${query}` : ''}`);
  return parseResponse<TsundokuItem[]>(res);
}

export async function createTsundokuItem(params: {
  book: Book;
  note?: string;
  priority?: number | null;
}): Promise<TsundokuItem> {
  const payload: Record<string, unknown> = {
    Book: params.book,
  };
  if (params.note) {
    payload.Note = params.note;
  }
  if (typeof params.priority === 'number') {
    payload.Priority = params.priority;
  }
  const res = await fetch('/api/tsundoku', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse<TsundokuItem>(res);
}

export async function pickupTsundokuItem(): Promise<TsundokuItem> {
  const res = await fetch('/api/tsundoku/pickup', { method: 'POST' });
  return parseResponse<TsundokuItem>(res);
}

export async function pickupSpecificTsundokuItem(id: string): Promise<TsundokuItem> {
  const res = await fetch(`/api/tsundoku/${encodeURIComponent(id)}/pickup`, {
    method: 'POST',
  });
  return parseResponse<TsundokuItem>(res);
}

export async function updateTsundokuStatus(id: string, status: TsundokuStatus): Promise<TsundokuItem> {
  const res = await fetch(`/api/tsundoku/${encodeURIComponent(id)}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Status: status }),
  });
  return parseResponse<TsundokuItem>(res);
}

export async function restackTsundokuItem(id: string): Promise<TsundokuItem> {
  const res = await fetch(`/api/tsundoku/${encodeURIComponent(id)}/restack`, {
    method: 'POST',
  });
  return parseResponse<TsundokuItem>(res);
}

// ============================================================================
// Favorites API
// ============================================================================

/**
 * Fetch all favorite items
 */
export async function fetchFavoriteItems(): Promise<FavoriteItem[]> {
  const res = await fetch('/api/favorites');
  return parseResponse<FavoriteItem[]>(res);
}

/**
 * Add a book to favorites
 */
export async function addFavoriteItem(book: Book): Promise<FavoriteItem> {
  const res = await fetch('/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Book: book }),
  });
  return parseResponse<FavoriteItem>(res);
}

/**
 * Remove a book from favorites by its ID
 */
export async function removeFavoriteItem(bookId: string): Promise<void> {
  const res = await fetch(`/api/favorites/${encodeURIComponent(bookId)}`, {
    method: 'DELETE',
  });
  return parseResponse<void>(res);
}
