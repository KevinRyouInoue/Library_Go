import type { Book, TsundokuItem, FavoriteItem } from '../types';
import ResultCard from './ResultCard';

type Props = {
  items?: Book[];
  getTsundokuItem?: (id: string) => TsundokuItem | undefined;
  getFavoriteItem?: (id: string) => FavoriteItem | undefined;
  onAddTsundoku?: (book: Book) => Promise<unknown>;
  onAddFavorite?: (book: Book) => Promise<unknown>;
  onRemoveFavorite?: (bookId: string) => Promise<void>;
};

export default function ResultsGrid({ items, getTsundokuItem, getFavoriteItem, onAddTsundoku, onAddFavorite, onRemoveFavorite }: Props) {
  if (!items) return null;
  if (items.length === 0) return <div>結果がありません</div>;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: 20
    }}>
      {items.map((b) => (
        <ResultCard
          key={b.ID}
          item={b}
          tsundokuItem={getTsundokuItem?.(b.ID)}
          favoriteItem={getFavoriteItem?.(b.ID)}
          onAddTsundoku={onAddTsundoku}
          onAddFavorite={onAddFavorite}
          onRemoveFavorite={onRemoveFavorite}
        />
      ))}
    </div>
  );
}
