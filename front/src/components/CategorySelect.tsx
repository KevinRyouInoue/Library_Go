type Props = {
  value: string;
  onChange: (v: string) => void;
};

const CATEGORIES = [
  { key: 'all', label: 'すべて' },
  { key: 'programming', label: 'Programming' },
  { key: 'web', label: 'Web' },
  { key: 'data', label: 'Data' },
  { key: 'ml', label: 'ML' },
  { key: 'security', label: 'Security' },
  { key: 'cloud', label: 'Cloud' },
];

export default function CategorySelect({ value, onChange }: Props) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ padding: 8 }}>
      {CATEGORIES.map((c) => (
        <option key={c.key} value={c.key}>{c.label}</option>
      ))}
    </select>
  );
}
