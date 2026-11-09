// The one way every section opens: a label on a hairline, the title on the left and its summary on the right.
export default function Head({ label, title, count, lede, aside, as: Tag = 'h2', className = '', id }) {
  return (
    <header className={`sh ${className}`} data-r="head">
      <div className="kick"><span>{label}</span><i /></div>
      <Tag className="sh__title" id={id}>
        {title}
        {count != null && <sup className="count" aria-hidden="true">({String(count).padStart(2, '0')})</sup>}
      </Tag>
      {lede && <p className="sh__lede lede">{lede}</p>}
      {aside && <div className="sh__lede">{aside}</div>}
    </header>
  )
}
