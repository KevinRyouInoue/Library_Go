type Props = {
  value: number;
  onChange: (v: number) => void;
};

export default function LimitSelect({ value, onChange }: Props) {
  const options = [10, 20, 30, 40];
  return (
    <select value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ padding: 8 }}>
      {options.map((n) => (
        <option key={n} value={n}>{n}件/ページ</option>
      ))}
    </select>
  );
}
