type Props = {
  page: number;
  hasNext: boolean;
  loading?: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export default function Pagination({ page, hasNext, loading, onPrev, onNext }: Props) {
  return (
    <div style={{ 
      display: 'flex', 
      gap: 12, 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px 0',
    }}>
      <button 
        disabled={page <= 1 || !!loading} 
        onClick={onPrev}
        style={{
          padding: '10px 24px',
          borderRadius: 12,
          border: 'none',
          background: (page <= 1 || loading) ? '#e2e8f0' : 'rgba(102, 126, 234, 0.1)',
          color: (page <= 1 || loading) ? '#94a3b8' : '#667eea',
          fontSize: 14,
          fontWeight: 600,
          cursor: (page <= 1 || loading) ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          if (page > 1 && !loading) {
            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
            e.currentTarget.style.transform = 'translateX(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (page > 1 && !loading) {
            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
            e.currentTarget.style.transform = 'translateX(0)';
          }
        }}
      >
        ← 前へ
      </button>
      <span style={{
        padding: '10px 20px',
        borderRadius: 12,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        fontSize: 14,
        fontWeight: 600,
        minWidth: 80,
        textAlign: 'center',
      }}>
        Page {page}
      </span>
      <button 
        disabled={!hasNext || !!loading} 
        onClick={onNext}
        style={{
          padding: '10px 24px',
          borderRadius: 12,
          border: 'none',
          background: (!hasNext || loading) ? '#e2e8f0' : 'rgba(102, 126, 234, 0.1)',
          color: (!hasNext || loading) ? '#94a3b8' : '#667eea',
          fontSize: 14,
          fontWeight: 600,
          cursor: (!hasNext || loading) ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          if (hasNext && !loading) {
            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
            e.currentTarget.style.transform = 'translateX(2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (hasNext && !loading) {
            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
            e.currentTarget.style.transform = 'translateX(0)';
          }
        }}
      >
        次へ →
      </button>
    </div>
  );
}
