import type { Book } from '../types';

type Props = { item: Book };

export default function ResultCard({ item }: Props) {
  return (
    <a href={item.InfoLink} target="_blank" rel="noreferrer" style={{
      display: 'block', border: '1px solid #eee', padding: 8, textDecoration: 'none', color: 'inherit'
    }}>
      <div style={{ width: '100%', aspectRatio: '3/4', background: '#fafafa',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        {item.Thumbnail
          ? <img src={item.Thumbnail} alt={item.Title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} />
          : <span style={{ color: '#999' }}>No Image</span>}
      </div>
      <div style={{ fontWeight: 'bold', fontSize: 14, lineHeight: 1.2, marginBottom: 4 }}>{item.Title}</div>
      <div style={{ fontSize: 12, color: '#555' }}>{Array.isArray(item.Authors) ? item.Authors.join(', ') : ''}</div>
    </a>
  );
}
