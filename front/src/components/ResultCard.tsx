import { useState, type MouseEvent, type CSSProperties } from 'react';
import type { Book, TsundokuItem } from '../types';

type Props = {
  item: Book;
  tsundokuItem?: TsundokuItem;
  onAddTsundoku?: (book: Book) => Promise<unknown>;
};

function statusLabel(status?: string) {
  switch (status) {
    case 'stacked':
      return '積読中';
    case 'reading':
      return '読書中';
    case 'done':
      return '読了済み';
    default:
      return '';
  }
}

export default function ResultCard({ item, tsundokuItem, onAddTsundoku }: Props) {
  const [adding, setAdding] = useState(false);
  const status = tsundokuItem?.Status;
  const disabled = adding || (status !== undefined && status !== 'done');

  const buttonIcon = (() => {
    if (adding) return '…';
    if (!status) return '＋';
    if (status === 'stacked') return '✓';
    if (status === 'reading') return '📖';
    return '＋';
  })();

  const buttonTitle = (() => {
    if (adding) return '追加中…';
    if (!status) return '積読に追加';
    if (status === 'stacked') return '積読済み';
    if (status === 'reading') return '読書中';
    if (status === 'done') return 'もう一度積む';
    return '積読に追加';
  })();

  const handleAdd = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onAddTsundoku) return;
    try {
      setAdding(true);
      await onAddTsundoku(item);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '積読に追加できませんでした';
      window.alert(message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      padding: 8,
      borderRadius: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      background: '#fff',
      position: 'relative',
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
    }}
    >
      {onAddTsundoku && (
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled}
          title={buttonTitle}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '1px solid #d1d5db',
            background: disabled ? '#f3f4f6' : '#fff',
            cursor: disabled ? 'default' : 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {buttonIcon}
        </button>
      )}
      <a href={item.InfoLink} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
        <div style={{ width: '100%', aspectRatio: '3/4', background: '#f9fafc',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderRadius: 6, overflow: 'hidden' }}>
          {item.Thumbnail
            ? <img src={item.Thumbnail} alt={item.Title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} />
          : <span style={{ color: '#999' }}>No Image</span>}
        </div>
        <div style={{ fontWeight: 'bold', fontSize: 14, lineHeight: 1.2, marginBottom: 4 }}>{item.Title}</div>
        <div style={{ fontSize: 12, color: '#555' }}>{Array.isArray(item.Authors) ? item.Authors.join(', ') : ''}</div>
      </a>
      {status && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span style={statusBadgeStyle(status)}>{statusLabel(status)}</span>
        </div>
      )}
    </div>
  );
}

function statusBadgeStyle(status: string): CSSProperties {
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    padding: '4px 8px',
    borderRadius: 999,
    background: '#e2e8f0',
    color: '#0f172a',
    fontWeight: 500,
  };
  switch (status) {
    case 'stacked':
      return { ...base, background: '#dbeafe', color: '#1d4ed8' };
    case 'reading':
      return { ...base, background: '#ffedd5', color: '#c2410c' };
    case 'done':
      return { ...base, background: '#dcfce7', color: '#15803d' };
    default:
      return base;
  }
}
