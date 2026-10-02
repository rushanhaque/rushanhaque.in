import { responsive } from '@/lib/images';

type Book = { slug: string; originalTitle: string; category: string; year: string; image?: string; imageBlurred?: boolean; author?: string };

// One publisher's series: every book shares a layout, each has its own cloth.
const TONES: Record<string, { bg: string; ink: string; foil: string }> = {
  'feedback-loop-collapse': { bg: '#e9e6d6', ink: '#07241a', foil: '#07241a' },
  'to-the-moon-and-beyond': { bg: '#1d2346', ink: '#f1ecdc', foil: '#d8bf7a' },
  'aabshar-e-khayaal': { bg: '#07241a', ink: '#f1ecdc', foil: '#d8bf7a' },
  'the-psychology-framework': { bg: '#5a2a1d', ink: '#f4e9db', foil: '#e2c58d' },
  samundar: { bg: '#34303f', ink: '#edece9', foil: '#cfcbc2' },
};
const FALLBACK = { bg: '#07241a', ink: '#f1ecdc', foil: '#d8bf7a' };
export const bookTone = (slug: string) => TONES[slug] ?? FALLBACK;
export const toneStyle = (slug: string) => { const t = bookTone(slug); return { '--bk': t.bg, '--bk-ink': t.ink, '--bk-foil': t.foil } as React.CSSProperties; };

// Rows of a signal that loses its range each generation: the idea of the
// technical note, drawn as its cover art.
const DECAY = Array.from({ length: 9 }, (_, row) => {
  const amp = 13 * Math.pow(.72, row), y = 14 + row * 12;
  let d = `M 0 ${y}`;
  for (let x = 4; x <= 200; x += 4) d += ` L ${x} ${(y + Math.sin(x / 9 + row * .8) * amp).toFixed(1)}`;
  return d;
});

export function BookCover({ book, size = 'card' }: { book: Book; size?: 'shelf' | 'card' | 'large' }) {
  const art = book.slug === 'feedback-loop-collapse' || !book.image ? null : book.image;
  return <span className={`bk-cover is-${size}`} style={toneStyle(book.slug)}>
    <span className="bk-cover-top"><span>{book.category}</span><span>{book.year}</span></span>
    <span className="bk-art">
      {art
        ? <img src={art} {...responsive(art, size === 'large' ? '420px' : '240px')} alt="" loading="lazy" decoding="async" className={book.imageBlurred ? 'is-veiled' : undefined}/>
        : <svg viewBox="0 0 200 120" preserveAspectRatio="none" aria-hidden="true">{DECAY.map((d, i) => <path key={i} d={d} style={{ opacity: 1 - i * .08 }}/>)}</svg>}
      {book.imageBlurred && <i>Forthcoming</i>}
    </span>
    <span className="bk-title">{book.originalTitle}</span>
    <span className="bk-foot">{book.author ? <span>{book.author}</span> : <span/>}<b>RH</b></span>
  </span>;
}

// A cover with a page block behind it, for flat listings.
export function BookObject({ book, size = 'card' }: { book: Book; size?: 'card' | 'large' }) {
  return <span className={`bk-object is-${size}`} aria-hidden="true"><BookCover book={book} size={size}/></span>;
}
