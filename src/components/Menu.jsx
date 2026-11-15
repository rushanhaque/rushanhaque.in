import { useEffect, useRef, useState } from 'react'
import { site } from '../config/site'
import { lockScroll, unlockScroll, scrollToEl } from '../lib/scroll'
import { A } from '../lib/router'
import { BookLink } from './Booking'
import Clock from './Clock'

const LINKS = [{ label: 'Home', to: '/' }, ...site.nav]

// The index: a sheet of wine slides in from the side on a curve that flattens as it settles, and the pages rise into
// it one after another. On a long page it also lists that page's own chapters, so any part of it is one tap away.
export default function Menu({ open, onClose, path }) {
  const panel = useRef(null)
  const was = useRef(false)
  const [chapters, setChapters] = useState([])

  useEffect(() => {
    if (open) {
      lockScroll()
      was.current = true
      setChapters([...document.querySelectorAll('[data-chapter]')].map((el) => ({ el, no: el.dataset.chapter, name: el.dataset.name })))
      const back = document.activeElement
      const first = setTimeout(() => panel.current?.querySelector('a')?.focus({ preventScroll: true }), 420)
      const key = (e) => {
        if (e.key === 'Escape') onClose()
        // the keyboard stays inside the sheet while it is open
        if (e.key === 'Tab' && panel.current) {
          const list = [...panel.current.querySelectorAll('a, button'), document.querySelector('.top__menu')].filter(Boolean)
          const i = list.indexOf(document.activeElement)
          if (e.shiftKey && i <= 0) { e.preventDefault(); list[list.length - 1].focus() } else if (!e.shiftKey && i === list.length - 1) { e.preventDefault(); list[0].focus() }
        }
      }
      addEventListener('keydown', key)
      return () => { clearTimeout(first); removeEventListener('keydown', key); back?.focus?.({ preventScroll: true }) }
    }
    if (was.current) { unlockScroll(); was.current = false }
    return undefined
  }, [open, onClose])

  const jump = (el) => {
    onClose()
    setTimeout(() => scrollToEl(el), 80)
  }

  return (
    <div className={`dw ${open ? 'is-open' : ''}`} id="menu" aria-hidden={!open} inert={!open}>
      <div className="dw__veil" onClick={onClose} />
      <aside className="dw__panel" ref={panel} data-tone="wine" role="dialog" aria-modal="true" aria-label="Menu">
        <svg className="dw__curve" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true"><path d="M100 0 C 0 300, 0 700, 100 1000 Z" /></svg>
        <div className="dw__in">
          <div className="dw__main">
            <p className="note dw__label">Navigation</p>
            <ol className="dw__nav">
              {LINKS.map((l, i) => (
                <li key={l.to} style={{ '--i': i }}>
                  <A to={l.to} className="dw__link" onClick={onClose} aria-current={(l.to === '/' ? path === '/' : path === l.to || path.startsWith(`${l.to}/`)) ? 'page' : undefined}>
                    <i className="dw__dot" aria-hidden="true" />
                    <span className="dw__word">{l.label}</span>
                  </A>
                </li>
              ))}
            </ol>
            {chapters.length > 1 && (
              <div className="dw__chap" style={{ '--i': LINKS.length }}>
                <p className="note dw__label">On this page</p>
                <ul>
                  {chapters.map((c) => (
                    <li key={c.no}><button type="button" onClick={() => jump(c.el)}><span className="note">{c.no}</span>{c.name}</button></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="dw__foot" style={{ '--i': LINKS.length + 1 }}>
            <div>
              <p className="note dw__label">Get in touch</p>
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <a href={site.phone.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <a href={site.phone.href}>Call</a>
              <BookLink>Book a call</BookLink>
            </div>
            <div>
              <p className="note dw__label">Elsewhere</p>
              <ul className="dw__soc">{site.socials.map((s) => <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}</ul>
            </div>
            <p className="note dw__time">{site.city}, India <span><Clock /> IST</span></p>
          </div>
        </div>
      </aside>
    </div>
  )
}
