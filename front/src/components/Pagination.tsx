type Props = {
  page: number;
  hasNext: boolean;
  loading?: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export default function Pagination({ page, hasNext, loading, onPrev, onNext }: Props) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
      <button disabled={page <= 1 || !!loading} onClick={onPrev}>前へ</button>
      <span>Page {page}</span>
      <button disabled={!hasNext || !!loading} onClick={onNext}>次へ</button>
    </div>
  );
}
