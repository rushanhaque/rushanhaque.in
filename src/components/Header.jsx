import { useCallback, useEffect, useRef, useState } from 'react'
import { site } from '../config/site'
import { A, useRoute } from '../lib/router'
import { device } from '../lib/device'
import { follow } from '../lib/motion'
import Btn from './Btn'
import Mark from './Mark'
import Menu from './Menu'

// The way around, in two parts. At the top of every page, a quiet bar that scrolls away with it: the monogram and the
// name, the three pages and the way to get in touch. Once you are reading, a single round button stays at hand in the
// corner, with a ring that fills as you go down the page, and it opens the index.
export default function Header() {
  const [open, setOpen] = useState(false)
  const [float, setFloat] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const fab = useRef(null)
  const { path } = useRoute()

  useEffect(() => { setOpen(false) }, [path])
  useEffect(() => { document.documentElement.classList.toggle('is-menu', open) }, [open])

  // the button arrives once the bar has gone
  useEffect(() => {
    let raf = 0
    const check = () => { raf = 0; setFloat(scrollY > Math.min(innerHeight * 0.32, 280)) }
    const on = () => { if (!raf) raf = requestAnimationFrame(check) }
    check()
    addEventListener('scroll', on, { passive: true })
    addEventListener('resize', on)
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [])

  // with a mouse, the button leans towards the pointer as it comes near
  useEffect(() => {
    const d = device()
    if (!d.fine || d.reduced) return undefined
    const el = fab.current
    const p = { x: 0, y: 0 }
    const write = () => { el.style.translate = `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px` }
    const fx = follow(p, 'x', { duration: 0.5, onUpdate: write })
    const fy = follow(p, 'y', { duration: 0.5, onUpdate: write })
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const near = Math.hypot(dx, dy) < r.width * 1.3
      fx(near ? dx * 0.32 : 0)
      fy(near ? dy * 0.32 : 0)
    }
    addEventListener('pointermove', move, { passive: true })
    return () => { removeEventListener('pointermove', move); fx.stop(); fy.stop() }
  }, [])

  const here = (to) => path === to || path.startsWith(`${to}/`)
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <header className="top">
        <A to="/" className="top__brand" aria-label="Rushan Haque, home">
          <Mark />
          <span className="top__roll" aria-hidden="true"><span data-t={site.role}>{site.name}</span></span>
        </A>
        <nav className="top__nav" aria-label="Main">
          {site.nav.filter((n) => n.to !== '/contact').map((n) => (
            <A key={n.to} to={n.to} className="top__link" aria-current={here(n.to) ? 'page' : undefined}>
              <span className="top__lbl"><span data-t={n.label}>{n.label}</span></span>
            </A>
          ))}
          <Btn to="/contact" variant="solid" className="top__cta" aria-current={here('/contact') ? 'page' : undefined}>Contact</Btn>
        </nav>
        <button type="button" className="top__menu" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="menu">
          Menu<span className="top__bars" aria-hidden="true"><i /><i /></span>
        </button>
      </header>
      <button
        type="button"
        ref={fab}
        className={`fab ${float || open ? 'is-on' : ''} ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="menu"
        aria-label={open ? 'Close the menu' : 'Open the menu'}
        tabIndex={float || open ? 0 : -1}
      >
        <svg className="fab__ring" viewBox="0 0 66 66" aria-hidden="true"><circle cx="33" cy="33" r="31" pathLength="1" /></svg>
        <span className="fab__lines" aria-hidden="true"><i /><i /></span>
      </button>
      <Menu open={open} onClose={close} path={path} />
    </>
  )
}
