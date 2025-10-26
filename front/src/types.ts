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
