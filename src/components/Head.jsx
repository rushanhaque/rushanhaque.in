import Split from './Split'

// The one way every section opens: a numbered label on a hairline, the title on the left and its summary on the right.
export default function Head({ no, label, title, count, lede, aside, as: Tag = 'h2', className = '', id }) {
  return (
    <header className={`sh ${className}`} data-r="head">
      <div className="kick">{no && <b className="kick__no">{no}</b>}<span>{label}</span><i /></div>
      <Tag className="sh__title" id={id}>
        <Split>{title}</Split>
        {count != null && <sup className="count" aria-hidden="true">({String(count).padStart(2, '0')})</sup>}
      </Tag>
      {lede && <p className="sh__lede lede">{lede}</p>}
      {aside && <div className="sh__lede">{aside}</div>}
    </header>
  )
}
