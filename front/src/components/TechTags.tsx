import { TECH_TAGS } from '../tags';

type Props = {
  selected: string[];
  onToggle: (key: string) => void;
};

export default function TechTags({ selected, onToggle }: Props) {
  return (
    <div>
      <label style={{ fontSize: 13, color: '#475569', fontWeight: 600, marginBottom: 12, display: 'block' }}>🏷️ テクノロジータグ</label>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {TECH_TAGS.map((t) => {
          const active = selected.includes(t.key);
          return (
            <button
              key={t.key}
              onClick={(e) => { e.preventDefault(); onToggle(t.key); }}
              style={{
                padding: '10px 20px',
                borderRadius: 999,
                border: 'none',
                background: active 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'rgba(102, 126, 234, 0.1)',
                color: active ? '#fff' : '#667eea',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                transition: 'all 0.3s ease',
                boxShadow: active ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
