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

  const primaryError = error && !/積読の一覧が空です/.test(error);
  const pickupDisabled = loading || stacked.length === 0 || reading.length > 0;

  const columns: ColumnConfig[] = [
    {
      key: 'stacked',
      title: '積読中',
      description: stacked.length > 0
        ? `次に読む予定は先頭の「${stacked[0].Book.Title}」。再読で戻した本は末尾に並びます。`
        : 'まだ積んでいません。検索結果のカード右上から追加してください。',
      items: stacked,
      renderActions: (item) => (
        <div style={stackedActionRowStyle}>
          <span style={metaTextStyle}>追加日: {formatDate(item.AddedAt)}</span>
          <button
            type="button"
            onClick={() => { onPickupSpecific(item.ID).catch(openAlert); }}
            style={tertiaryActionStyle}
            disabled={reading.length > 0}
          >
            この本を読む
          </button>
        </div>
      ),
    },
    {
      key: 'reading',
      title: '読書中',
      description: reading.length > 0
        ? '読んでいる本に集中しましょう。読み終えたら読了、まだなら積読に戻せます。'
        : '「先頭から取り出す」で読書中の本を一冊だけ選べます。',
      items: reading,
      renderActions: (item) => (
        <div style={readingActionRowStyle}>
          <span style={metaTextStyle}>開始日: {formatDate(item.StartedAt)}</span>
          <button
            type="button"
            onClick={() => { onUpdateStatus(item.ID, 'done').catch(openAlert); }}
            style={primaryActionStyle}
          >
            読了にする
          </button>
          <button
            type="button"
            onClick={() => { onUpdateStatus(item.ID, 'stacked').catch(openAlert); }}
          >
            積読に戻す
          </button>
        </div>
      ),
    },
    {
      key: 'done',
      title: '読了済み',
      description: done.length > 0
        ? '再読したくなったら「積読に戻す」で末尾へ積み直せます。'
        : '読了履歴はまだありません。',
      items: done,
      renderActions: (item) => (
        <div style={readingActionRowStyle}>
          <span style={metaTextStyle}>読了日: {formatDate(item.CompletedAt)}</span>
          <button
            type="button"
            onClick={() => { onRestack(item.ID).catch(openAlert); }}
            style={secondaryActionStyle}
          >
            積読に戻す
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section style={summaryCardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: 22 }}>積読ダッシュボード</h2>
          <button type="button" onClick={() => { onRefresh().catch(openAlert); }} disabled={loading}>
            再読み込み
          </button>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => { onPickup().catch(openAlert); }}
            disabled={pickupDisabled}
            style={primaryActionStyle}
          >
            先頭から取り出す
          </button>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            先頭以外を読みたいときは下のリストから選択できます。
          </span>
          {reading.length > 0 && (
            <span style={{ fontSize: 12, color: '#f97316' }}>読書中の本があります。まず読了にするか積読へ戻してください。</span>
          )}
        </div>
        {primaryError && <div style={{ color: '#ef4444', marginTop: 8 }}>{error}</div>}
        {loading && <div style={{ color: '#475569', marginTop: 8 }}>最新の積読情報を取得しています...</div>}
      </section>

      <div style={columnGridStyle}>
        {columns.map((col) => (
          <section key={col.key} style={columnCardStyle}>
            <div>
              <h3 style={columnTitleStyle}>{col.title}</h3>
              <p style={columnHintStyle}>{col.description}</p>
            </div>
            {col.items.length === 0 ? (
              <div style={emptyStateStyle}>該当する本はまだありません。</div>
            ) : (
              <ul style={itemListStyle}>
                {col.items.map((item) => (
                  <li key={item.ID} style={itemCardStyle}>
                    <div style={{ display: 'grid', gap: 4 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{item.Book.Title}</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>{item.Book.Authors?.join(', ')}</div>
                      {item.Note && <div style={noteStyle}>メモ: {item.Note}</div>}
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
  background: '#ffffff',
  borderRadius: 18,
  padding: '24px 28px',
  boxShadow: '0 14px 40px rgba(15, 23, 42, 0.12)',
  display: 'grid',
  gap: 12,
};

const columnGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 20,
};

const columnCardStyle: CSSProperties = {
  background: '#ffffff',
  borderRadius: 16,
  padding: '20px 22px',
  boxShadow: '0 10px 28px rgba(15, 23, 42, 0.08)',
  display: 'grid',
  gap: 16,
  minHeight: 220,
};

const columnTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 600,
  color: '#0f172a',
};

const columnHintStyle: CSSProperties = {
  margin: '6px 0 0',
  fontSize: 13,
  color: '#64748b',
};

const emptyStateStyle: CSSProperties = {
  background: '#f8fafc',
  borderRadius: 12,
  padding: '24px 16px',
  textAlign: 'center',
  color: '#94a3b8',
  fontSize: 13,
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
