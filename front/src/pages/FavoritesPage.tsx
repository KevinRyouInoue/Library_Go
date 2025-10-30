import type { CSSProperties } from 'react';
import type { FavoriteItem } from '../types';

type Props = {
  items: FavoriteItem[];
  loading: boolean;
  error?: string;
  onRefresh: () => Promise<unknown>;
  onRemove: (bookId: string) => Promise<void>;
};

export default function FavoritesPage({ items, loading, error, onRefresh, onRemove }: Props) {
  return (
    <div style={{ display: 'grid', gap: 32 }}>
      <section style={summaryCardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 32 }}>⭐</span>
            <h2 style={titleStyle}>お気に入り一覧</h2>
          </div>
          <button 
            type="button" 
            onClick={() => { onRefresh().catch(openAlert); }} 
            disabled={loading}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              border: 'none',
              background: loading ? '#cbd5e1' : 'rgba(102, 126, 234, 0.1)',
              color: loading ? '#94a3b8' : '#667eea',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            🔄 再読み込み
          </button>
        </div>
        {error && <div style={{ color: '#ef4444', marginTop: 8, fontSize: 14 }}>{error}</div>}
        {loading && <div style={{ color: '#667eea', marginTop: 8, fontSize: 14 }}>⏳ お気に入りを取得しています...</div>}
      </section>

      {items.length === 0 ? (
        <section style={emptyCardStyle}>
          <div style={emptyStateStyle}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>⭐</div>
            お気に入りの本はまだありません。<br />
            検索結果から「⭐」ボタンで登録できます。
          </div>
        </section>
      ) : (
        <div style={gridStyle}>
          {items.map((item) => (
            <article key={item.ID} style={cardStyle}>
              {item.Book.Thumbnail && (
                <img
                  src={item.Book.Thumbnail}
                  alt={item.Book.Title}
                  style={thumbnailStyle}
                />
              )}
              <div style={contentStyle}>
                <div>
                  <h3 style={bookTitleStyle}>{item.Book.Title}</h3>
                  <div style={authorsStyle}>{item.Book.Authors?.join(', ')}</div>
                  {item.Book.PublishedDate && (
                    <div style={metaStyle}>📅 出版日: {item.Book.PublishedDate}</div>
                  )}
                  {item.Book.PageCount && (
                    <div style={metaStyle}>📄 ページ数: {item.Book.PageCount}</div>
                  )}
                  <div style={metaStyle}>🕒 追加日: {formatDate(item.AddedAt)}</div>
                </div>
                <div style={actionRowStyle}>
                  {item.Book.InfoLink && (
                    <a
                      href={item.Book.InfoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={linkButtonStyle}
                    >
                      詳細を見る
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => { onRemove(item.ID).catch(openAlert); }}
                    style={removeButtonStyle}
                  >
                    🗑️ 削除
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ja-JP', { hour12: false });
}

function openAlert(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  window.alert(message);
}

const summaryCardStyle: CSSProperties = {
  background: 'rgba(255, 255, 255, 0.98)',
  borderRadius: 20,
  padding: '32px',
  boxShadow: '0 10px 40px rgba(102, 126, 234, 0.15)',
  display: 'grid',
  gap: 12,
  border: '1px solid rgba(102, 126, 234, 0.1)',
  backdropFilter: 'blur(10px)',
};

const emptyCardStyle: CSSProperties = {
  background: 'rgba(255, 255, 255, 0.98)',
  borderRadius: 20,
  padding: '64px 28px',
  boxShadow: '0 10px 40px rgba(102, 126, 234, 0.15)',
  border: '2px dashed rgba(102, 126, 234, 0.2)',
};

const emptyStateStyle: CSSProperties = {
  textAlign: 'center',
  color: '#94a3b8',
  fontSize: 16,
  lineHeight: 1.8,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 700,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: 24,
};

const cardStyle: CSSProperties = {
  background: '#ffffff',
  borderRadius: 16,
  padding: '24px',
  boxShadow: '0 8px 28px rgba(102, 126, 234, 0.12)',
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  border: '1px solid rgba(102, 126, 234, 0.1)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
};

const thumbnailStyle: CSSProperties = {
  width: '100%',
  height: 'auto',
  maxHeight: 240,
  objectFit: 'contain',
  borderRadius: 12,
  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
  padding: 16,
};

const contentStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  flex: 1,
};

const bookTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 17,
  fontWeight: 700,
  color: '#1e293b',
  lineHeight: 1.5,
};

const authorsStyle: CSSProperties = {
  fontSize: 14,
  color: '#64748b',
  marginTop: 6,
  fontWeight: 500,
};

const metaStyle: CSSProperties = {
  fontSize: 13,
  color: '#94a3b8',
  marginTop: 6,
};

const actionRowStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  marginTop: 'auto',
  flexWrap: 'wrap',
};

const linkButtonStyle: CSSProperties = {
  padding: '10px 18px',
  borderRadius: 10,
  border: 'none',
  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
  color: '#667eea',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
};

const removeButtonStyle: CSSProperties = {
  padding: '10px 18px',
  borderRadius: 10,
  border: 'none',
  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
  color: '#dc2626',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
};
