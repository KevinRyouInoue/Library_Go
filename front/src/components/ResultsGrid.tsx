import type { Book, TsundokuItem } from '../types';
import ResultCard from './ResultCard';

type Props = {
  items?: Book[];
  getTsundokuItem?: (id: string) => TsundokuItem | undefined;
  onAddTsundoku?: (book: Book) => Promise<unknown>;
};

export default function ResultsGrid({ items, getTsundokuItem, onAddTsundoku }: Props) {
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
          onAddTsundoku={onAddTsundoku}
        />
      ))}
    </div>
  );
}
