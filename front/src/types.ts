export type Book = {
  ID: string;
  Title: string;
  Authors: string[];
  PublishedDate?: string;
  Description?: string;
  Categories?: string[] | null;
  PageCount?: number;
  Thumbnail?: string;
  InfoLink?: string;
};

export type SearchResponse = {
  TotalItems: number;
  Items: Book[];
};

export type TsundokuStatus = 'stacked' | 'reading' | 'done';

export type TsundokuItem = {
  ID: string;
  Book: Book;
  Note?: string;
  Priority?: number | null;
  Status: TsundokuStatus;
  AddedAt: string;
  UpdatedAt: string;
  StartedAt?: string | null;
  CompletedAt?: string | null;
};

export type FavoriteItem = {
  ID: string;
  Book: Book;
  AddedAt: string;
};
