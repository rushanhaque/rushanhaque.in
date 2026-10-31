import Icon from './Icon'
import { TLink } from './Transition'

/**
 * Letter roll: on hover every character slides up in turn and its copy (a text-shadow one line
 * below) takes its place. Screen readers get the plain words once.
 */
export function RollText({ children, className = '' }) {
  const text = String(children)
  return (
    <span className={`roll ${className}`}>
      <span className="sr-only">{text}</span>
      <span className="roll__chars" aria-hidden="true">
        {[...text].map((c, i) => <span key={i} style={{ '--i': i }}>{c === ' ' ? ' ' : c}</span>)}
      </span>
    </span>
  )
}

/**
 * Pill button: a liquid fill blooms from wherever the cursor enters, the label rolls letter
 * by letter, and the icon sits in its own island that swaps arrows on hover.
 */
export default function Button({ to, href, children, variant = 'solid', icon = 'arrowUpRight', onClick, type = 'button', className = '', ...rest }) {
  const track = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  const cls = `btn btn--${variant} ${className}`
  const inner = (
    <>
      <span className="btn__fill" />
      <RollText className="btn__label">{children}</RollText>
      {icon && (
        <span className="btn__icon">
          <Icon name={icon} size={15} />
          <Icon name={icon} size={15} />
        </span>
      )}
    </>
  )
  const ext = href && /^https?:/.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  if (to) return <TLink to={to} className={cls} onMouseEnter={track} onMouseLeave={track} {...rest}>{inner}</TLink>
  if (href) return <a href={href} className={cls} onMouseEnter={track} onMouseLeave={track} {...ext} {...rest}>{inner}</a>
  return <button type={type} className={cls} onClick={onClick} onMouseEnter={track} onMouseLeave={track} {...rest}>{inner}</button>
}
