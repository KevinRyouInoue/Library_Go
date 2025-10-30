type Props = {
  q: string;
  onChangeQ: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export default function SearchBar({ q, onChangeQ, onSubmit, disabled }: Props) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} style={{ display: 'grid', gap: 12 }}>
      <label style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>🔎 自由キーワード</label>
      <input
        value={q}
        onChange={(e) => onChangeQ(e.target.value)}
        placeholder="キーワード (例: golang, react, machine learning...)"
        style={{ 
          padding: '14px 18px',
          borderRadius: 12,
          border: '2px solid rgba(102, 126, 234, 0.2)',
          fontSize: 15,
          outline: 'none',
          transition: 'all 0.3s ease',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#667eea';
          e.currentTarget.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button 
          type="submit" 
          disabled={disabled}
          style={{
            padding: '12px 32px',
            borderRadius: 12,
            border: 'none',
            background: disabled 
              ? '#cbd5e1' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxShadow: disabled ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }
          }}
        >
          検索
        </button>
      </div>
    </form>
  );
}
