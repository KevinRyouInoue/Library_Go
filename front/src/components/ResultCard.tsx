import { useState, type MouseEvent, type CSSProperties } from 'react';
import type { Book, TsundokuItem, FavoriteItem } from '../types';

type Props = {
  item: Book;
  tsundokuItem?: TsundokuItem;
  favoriteItem?: FavoriteItem;
  onAddTsundoku?: (book: Book) => Promise<unknown>;
  onAddFavorite?: (book: Book) => Promise<unknown>;
  onRemoveFavorite?: (bookId: string) => Promise<void>;
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

export default function ResultCard({ item, tsundokuItem, favoriteItem, onAddTsundoku, onAddFavorite, onRemoveFavorite }: Props) {
  const [adding, setAdding] = useState(false);
  const [favoriting, setFavoriting] = useState(false);
  const status = tsundokuItem?.Status;
  const disabled = adding || (status !== undefined && status !== 'done');
  const isFavorite = !!favoriteItem;

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

  const handleFavoriteToggle = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite && onRemoveFavorite) {
      try {
        setFavoriting(true);
        await onRemoveFavorite(item.ID);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'お気に入りから削除できませんでした';
        window.alert(message);
      } finally {
        setFavoriting(false);
      }
    } else if (!isFavorite && onAddFavorite) {
      try {
        setFavoriting(true);
        await onAddFavorite(item);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'お気に入りに追加できませんでした';
        window.alert(message);
      } finally {
        setFavoriting(false);
      }
    }
  };

  return (
    <div style={{
      border: '1px solid rgba(102, 126, 234, 0.15)',
      padding: 12,
      borderRadius: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      background: '#fff',
      position: 'relative',
      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.08)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      overflow: 'hidden',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.08)';
    }}
    >
      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6, zIndex: 2 }}>
        {(onAddFavorite || onRemoveFavorite) && (
          <button
            type="button"
            onClick={handleFavoriteToggle}
            disabled={favoriting}
            title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              background: isFavorite 
                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' 
                : 'rgba(255, 255, 255, 0.95)',
              cursor: favoriting ? 'default' : 'pointer',
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              if (!favoriting) {
                e.currentTarget.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {favoriting ? '…' : isFavorite ? '⭐' : '☆'}
          </button>
        )}
        {onAddTsundoku && (
          <button
            type="button"
            onClick={handleAdd}
            disabled={disabled}
            title={buttonTitle}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              background: disabled 
                ? 'rgba(203, 213, 225, 0.8)' 
                : 'rgba(255, 255, 255, 0.95)',
              cursor: disabled ? 'default' : 'pointer',
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {buttonIcon}
          </button>
        )}
      </div>
      <a href={item.InfoLink} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
        <div style={{ 
          width: '100%', 
          aspectRatio: '3/4', 
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: 12, 
          borderRadius: 12, 
          overflow: 'hidden',
          position: 'relative',
        }}>
          {item.Thumbnail
            ? <img src={item.Thumbnail} alt={item.Title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ color: '#a5b4fc', fontSize: 48 }}>📖</span>}
        </div>
        <div style={{ 
          fontWeight: 700, 
          fontSize: 15, 
          lineHeight: 1.4, 
          marginBottom: 8,
          color: '#1e293b',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>{item.Title}</div>
        <div style={{ 
          fontSize: 13, 
          color: '#64748b',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>{Array.isArray(item.Authors) ? item.Authors.join(', ') : ''}</div>
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
    fontSize: 12,
    padding: '6px 12px',
    borderRadius: 999,
    fontWeight: 600,
  };
  switch (status) {
    case 'stacked':
      return { ...base, background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', color: '#1e40af' };
    case 'reading':
      return { ...base, background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)', color: '#9a3412' };
    case 'done':
      return { ...base, background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', color: '#065f46' };
    default:
      return base;
  }
}
