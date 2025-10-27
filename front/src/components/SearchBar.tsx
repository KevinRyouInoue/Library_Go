type Props = {
  q: string;
  onChangeQ: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export default function SearchBar({ q, onChangeQ, onSubmit, disabled }: Props) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: '#333' }}>自由キーワード</label>
      <input
        value={q}
        onChange={(e) => onChangeQ(e.target.value)}
        placeholder="キーワード (例: golang)"
        style={{ padding: 8 }}
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="submit" disabled={disabled}>検索</button>
      </div>
    </form>
  );
}
