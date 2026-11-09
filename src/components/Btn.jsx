import { useRef } from 'react'
import { ArrowUpRight } from './glyphs'
import { TLink } from './Transition'

// The pill. Its arrow sits in its own socket; on hover a star of colour opens from exactly where the
// pointer came in, and the label rolls.
export default function Btn({ to, href, children, icon: Icon = ArrowUpRight, variant = 'ghost', cursor, className = '', onClick, type, disabled, title, ...rest }) {
  const ref = useRef(null)
  const aim = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--x', `${e.clientX - r.left}px`)
    el.style.setProperty('--y', `${e.clientY - r.top}px`)
  }
  const inner = (
    <>
      <span className="btn__fill" aria-hidden="true" />
      <span className="btn__label"><span data-t={typeof children === 'string' ? children : undefined}>{children}</span></span>
      {Icon && <span className="btn__socket" aria-hidden="true"><Icon size={15} /></span>}
    </>
  )
  const props = { ref, className: `btn btn--${variant} ${className}`, onPointerEnter: aim, onPointerLeave: aim, ...rest }
  if (to) return <TLink to={to} title={title} onClick={onClick} {...props}>{inner}</TLink>
  if (href) return <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} onClick={onClick} {...props}>{inner}</a>
  return <button type={type || 'button'} disabled={disabled} onClick={onClick} {...props}>{inner}</button>
}
