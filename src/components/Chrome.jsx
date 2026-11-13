import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from '../lib/gsap'
import { site } from '../config/site'
import { TLink } from './Transition'
import Mark from './Mark'
import Menu from './Menu'
import Sundial from './Sundial'

// What stays still while the page moves: a solid bar with the name, where you are, and the way around.
// Nothing shows through it, so nothing ever collides with it.
export default function Chrome() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const bar = useRef(null)
  const mark = useRef(null)
  const line = useRef(null)
  const loc = useLocation()

  useEffect(() => { setOpen(false) }, [loc.pathname])
  const sized = useRef(null)
  useEffect(() => { sized.current?.() }, [loc.pathname])

  useEffect(() => {
    document.documentElement.classList.toggle('is-menu', open)
  }, [open])

  // the bar turns solid once the page has moved, and a hairline shows how far down you are
  useEffect(() => {
    let height = 1
    let lastY = -1
    let stuckAt = 8
    let first = false
    const size = () => {
      height = Math.max(1, document.documentElement.scrollHeight - innerHeight)
      // the first screen keeps the whole window: the bar only turns solid once it is over
      const hero = document.querySelector('.thr')
      first = !!hero && !document.documentElement.classList.contains('static')
      stuckAt = first ? hero.offsetHeight - innerHeight * 1.02 : 8
      lastY = -1
    }
    // the scroll position is taken when the page scrolls, not read mid-frame, where it would force the browser to
    // work out the whole layout again after whatever else this frame has changed
    let at = scrollY
    const onScroll = () => { at = scrollY }
    addEventListener('scroll', onScroll, { passive: true })
    const tick = () => {
      const y = at
      if (y === lastY) return
      lastY = y
      bar.current?.classList.toggle('is-stuck', y > stuckAt)
      bar.current?.classList.toggle('is-first', first && y <= stuckAt)
      if (line.current) line.current.style.transform = `scaleX(${Math.min(1, y / height).toFixed(4)})`
    }
    size()
    sized.current = size
    const ro = new ResizeObserver(size)
    ro.observe(document.body)
    addEventListener('resize', size)
    gsap.ticker.add(tick)
    return () => { ro.disconnect(); removeEventListener('resize', size); removeEventListener('scroll', onScroll); gsap.ticker.remove(tick) }
  }, [])

  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <header className="bar" ref={bar}>
        <TLink to="/" className="bar__home" aria-label="Rushan Haque, home" title="Home">
          <span ref={mark} className="bar__mark"><Mark /></span>
        </TLink>
        <Sundial />
        <nav className="bar__nav" aria-label="Main">
          {site.nav.map((n) => (
            <TLink key={n.to} to={n.to} className={`bar__link ${n.to === '/contact' ? 'bar__link--cta' : ''}`} title={n.label} aria-current={loc.pathname === n.to ? 'page' : undefined}>
              {n.label}
            </TLink>
          ))}
          <button type="button" className="bar__menu" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? 'Close the menu' : 'Open the menu'}>
            <i /><i />
          </button>
        </nav>
        <span className="bar__line" ref={line} aria-hidden="true" />
      </header>
      <Menu open={open} onClose={close} />
    </>
  )
}
