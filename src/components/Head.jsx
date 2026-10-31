const two = (n) => String(n).padStart(2, '0')

/**
 * The one way every section opens: number and label on a hairline, the title on the left
 * seven columns with an optional count, the lede bottom-aligned on the right four.
 */
export function Kicker({ n, label, line = true }) {
  return (
    <div className="kick">
      {n && <span className="kick__no">{n}</span>}
      <span className="kick__label">{label}</span>
      {line && <i className="kick__rule" data-line />}
    </div>
  )
}

/** A small count set against the top of a title, like a figure number. */
export function Count({ n }) {
  return <sup className="count" aria-hidden="true">({two(n)})</sup>
}

export default function Head({ n, label, title, count, lede, aside, className = '' }) {
  return (
    <header className={`sh ${className}`}>
      <Kicker n={n} label={label} />
      <h2 className="sh__title"><span data-split>{title}</span>{count != null && <Count n={count} />}</h2>
      {(lede || aside) && (
        <div className="sh__side">
          {lede && <p className="sh__lede" data-reveal>{lede}</p>}
          {aside}
        </div>
      )}
    </header>
  )
}
