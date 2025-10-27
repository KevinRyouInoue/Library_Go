import { TECH_TAGS } from '../tags';

type Props = {
  selected: string[];
  onToggle: (key: string) => void;
};

export default function TechTags({ selected, onToggle }: Props) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
      {TECH_TAGS.map((t) => {
        const active = selected.includes(t.key);
        return (
          <button
            key={t.key}
            onClick={(e) => { e.preventDefault(); onToggle(t.key); }}
            style={{
              padding: '4px 8px',
              borderRadius: 16,
              border: active ? '1px solid #1e40af' : '1px solid #ccc',
              background: active ? '#dbeafe' : '#fff',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
