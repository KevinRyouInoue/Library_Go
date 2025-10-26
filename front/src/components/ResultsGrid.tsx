import type { Book } from '../types';
import ResultCard from './ResultCard';

type Props = { items?: Book[] };

export default function ResultsGrid({ items }: Props) {
  if (!items) return null;
  if (items.length === 0) return <div>結果がありません</div>;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: 12
    }}>
      {items.map((b) => (
        <ResultCard key={b.ID} item={b} />
      ))}
    </div>
  );
}
