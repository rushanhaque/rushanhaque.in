import { useCallback, useEffect, useState } from 'react'
import { site } from '../config/site'
import { A, useRoute } from '../lib/router'
import Btn from './Btn'
import Logo from './Logo'
import Menu from './Menu'

// The bar: always there, at the top of every page. On a wide screen it carries the three pages and the way in; it
// settles into a thinner, frosted strip once the page moves. On a phone it keeps to the logo and one small button
// that opens the index.
export default function Header() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const { path } = useRoute()

  useEffect(() => { setOpen(false) }, [path])
  useEffect(() => { document.documentElement.classList.toggle('is-menu', open) }, [open])
  useEffect(() => {
    let raf = 0
    const check = () => { raf = 0; setSolid(scrollY > 12) }
    const on = () => { if (!raf) raf = requestAnimationFrame(check) }
    check()
    addEventListener('scroll', on, { passive: true })
    return () => { removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [])

  const here = (to) => path === to || path.startsWith(`${to}/`)
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <header className={`top ${solid ? 'is-solid' : ''} ${open ? 'is-open' : ''}`}>
        <A to="/" className="top__brand" aria-label="Rushan Haque, home"><Logo /></A>
        <nav className="top__nav" aria-label="Main">
          {site.nav.filter((n) => n.to !== '/contact').map((n) => (
            <A key={n.to} to={n.to} className="top__link" aria-current={here(n.to) ? 'page' : undefined}>
              <span className="top__lbl"><span data-t={n.label}>{n.label}</span></span>
            </A>
          ))}
          <Btn to="/contact" variant="solid" className="top__cta" aria-current={here('/contact') ? 'page' : undefined}>Connect</Btn>
        </nav>
        <button type="button" className="top__menu" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="menu" aria-label={open ? 'Close the menu' : 'Open the menu'}>
          <span className="top__bars" aria-hidden="true"><i /><i /><i /></span>
        </button>
      </header>
      <Menu open={open} onClose={close} path={path} />
    </>
  )
}
