import type { CSSProperties, ReactNode } from 'react';
import type { TsundokuItem, TsundokuStatus } from '../types';

type Props = {
  items: TsundokuItem[];
  loading: boolean;
  error?: string;
  onRefresh: () => Promise<unknown>;
  onPickup: () => Promise<TsundokuItem>;
  onPickupSpecific: (id: string) => Promise<TsundokuItem>;
  onUpdateStatus: (id: string, status: TsundokuStatus) => Promise<TsundokuItem>;
  onRestack: (id: string) => Promise<TsundokuItem>;
};

export default function TsundokuPage({ items, loading, error, onRefresh, onPickup, onPickupSpecific, onUpdateStatus, onRestack }: Props) {
  const stacked = items.filter((item) => item.Status === 'stacked');
  const reading = items.filter((item) => item.Status === 'reading');
  const done = items.filter((item) => item.Status === 'done');

  const primaryError = error && !/The reading list is empty/.test(error);
  const pickupDisabled = loading || stacked.length === 0 || reading.length > 0;

  const columns: ColumnConfig[] = [
    {
      key: 'stacked',
      title: 'Stacked',
      description: stacked.length > 0
        ? `Next up: "${stacked[0]?.Book.Title}". Books returned for re-reading are placed at the end.`
        : 'No books in stack yet. Add them from search results using the top-right button.',
      items: stacked,
      renderActions: (item) => (
        <div style={stackedActionRowStyle}>
          <span style={metaTextStyle}>Added: {formatDate(item.AddedAt)}</span>
          <button
            type="button"
            onClick={() => { onPickupSpecific(item.ID).catch(openAlert); }}
            style={tertiaryActionStyle}
            disabled={reading.length > 0}
          >
            Read this book
          </button>
        </div>
      ),
    },
    {
      key: 'reading',
      title: 'Currently Reading',
      description: reading.length > 0
        ? 'Focus on the book you\'re reading. Mark as done when finished, or return to stack.'
        : 'Click "Pick from top" to select one book to read.',
      items: reading,
      renderActions: (item) => (
        <div style={readingActionRowStyle}>
          <span style={metaTextStyle}>Started: {formatDate(item.StartedAt)}</span>
          <button
            type="button"
            onClick={() => { onUpdateStatus(item.ID, 'done').catch(openAlert); }}
            style={primaryActionStyle}
          >
            Mark as Done
          </button>
          <button
            type="button"
            onClick={() => { onUpdateStatus(item.ID, 'stacked').catch(openAlert); }}
          >
            Return to Stack
          </button>
        </div>
      ),
    },
    {
      key: 'done',
      title: 'Completed',
      description: done.length > 0
        ? 'Want to re-read? Use "Return to Stack" to add it back to the end of the stack.'
        : 'No completed books yet.',
      items: done,
      renderActions: (item) => (
        <div style={readingActionRowStyle}>
          <span style={metaTextStyle}>Completed: {formatDate(item.CompletedAt)}</span>
          <button
            type="button"
            onClick={() => { onRestack(item.ID).catch(openAlert); }}
            style={secondaryActionStyle}
          >
            Return to Stack
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 32 }}>
      <section style={summaryCardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 32 }}>📚</span>
            <h2 style={sectionTitleStyle}>Reading List Dashboard</h2>
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
            🔄 Reload
          </button>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => { onPickup().catch(openAlert); }}
            disabled={pickupDisabled}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              border: 'none',
              background: pickupDisabled 
                ? '#cbd5e1' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              cursor: pickupDisabled ? 'not-allowed' : 'pointer',
              boxShadow: pickupDisabled ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
            }}
          >
            📖 Pick from Top
          </button>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            To read a specific book, select from the list below.
          </span>
          {reading.length > 0 && (
            <span style={{ 
              fontSize: 13, 
              color: '#f97316',
              background: 'rgba(249, 115, 22, 0.1)',
              padding: '6px 12px',
              borderRadius: 8,
            }}>
              ⚠️ You have a book in progress. Please mark it as done or return to stack first.
            </span>
          )}
        </div>
        {primaryError && <div style={{ color: '#ef4444', marginTop: 8 }}>{error}</div>}
        {loading && <div style={{ color: '#475569', marginTop: 8 }}>Fetching latest reading list...</div>}
      </section>

      <div style={columnGridStyle}>
        {columns.map((col) => (
          <section key={col.key} style={columnCardStyle}>
            <div>
              <h3 style={columnTitleStyle}>{col.title}</h3>
              <p style={columnHintStyle}>{col.description}</p>
            </div>
            {col.items.length === 0 ? (
              <div style={emptyStateStyle}>No books found in this category yet.</div>
            ) : (
              <ul style={itemListStyle}>
                {col.items.map((item) => (
                  <li key={item.ID} style={itemCardStyle}>
                    <div style={{ display: 'grid', gap: 4 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{item.Book.Title}</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>{item.Book.Authors?.join(', ')}</div>
                      {item.Note && <div style={noteStyle}>Note: {item.Note}</div>}
                    </div>
                    {col.renderActions && (
                      <div style={{ marginTop: 8 }}>
                        {col.renderActions(item)}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

type ColumnKey = 'stacked' | 'reading' | 'done';

type ColumnConfig = {
  key: ColumnKey;
  title: string;
  description: string;
  items: TsundokuItem[];
  renderActions?: (item: TsundokuItem) => ReactNode;
};

function formatDate(value?: string | null) {
  if (!value) return '-';
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
  gap: 16,
  border: '1px solid rgba(102, 126, 234, 0.1)',
  backdropFilter: 'blur(10px)',
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 700,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const columnGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: 24,
};

const columnCardStyle: CSSProperties = {
  background: '#ffffff',
  borderRadius: 16,
  padding: '24px',
  boxShadow: '0 8px 28px rgba(102, 126, 234, 0.12)',
  display: 'grid',
  gap: 20,
  minHeight: 240,
  border: '1px solid rgba(102, 126, 234, 0.1)',
};

const columnTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 700,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const columnHintStyle: CSSProperties = {
  margin: '8px 0 0',
  fontSize: 14,
  color: '#64748b',
  lineHeight: 1.6,
};

const emptyStateStyle: CSSProperties = {
  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
  borderRadius: 12,
  padding: '32px 16px',
  textAlign: 'center',
  color: '#94a3b8',
  fontSize: 14,
  border: '2px dashed rgba(102, 126, 234, 0.2)',
};

const itemListStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'grid',
  gap: 12,
};

const itemCardStyle: CSSProperties = {
  background: '#f8fafc',
  borderRadius: 12,
  padding: '16px 14px',
  display: 'grid',
  gap: 6,
  border: '1px solid rgba(148, 163, 184, 0.2)',
};

const noteStyle: CSSProperties = {
  fontSize: 12,
  color: '#475569',
  background: '#e0f2fe',
  padding: '4px 6px',
  borderRadius: 6,
  display: 'inline-flex',
};

const metaTextStyle: CSSProperties = {
  fontSize: 12,
  color: '#64748b',
};

const readingActionRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  alignItems: 'center',
};

const stackedActionRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  alignItems: 'center',
  justifyContent: 'space-between',
};

const primaryActionStyle: CSSProperties = {
  background: '#2563eb',
  color: '#fff',
  border: '1px solid #1d4ed8',
};

const secondaryActionStyle: CSSProperties = {
  background: '#e0f2fe',
  color: '#0369a1',
  border: '1px solid rgba(14,116,144,0.4)',
};

const tertiaryActionStyle: CSSProperties = {
  background: '#f1f5f9',
  color: '#2563eb',
  border: '1px solid rgba(37,99,235,0.3)',
};
