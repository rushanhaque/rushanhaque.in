import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap, useGSAP, reduced } from '../lib/gsap'
import { stopScroll, startScroll } from '../lib/lenis'
import { site } from '../config/site'
import { chapters } from '../data/content'
import { TLink, usePageTransition } from './Transition'
import { Clock } from './Header'
import Icon from './Icon'

const two = (n) => String(n).padStart(2, '0')
const PAGES = [['Index', '/'], ['Work', '/work'], ['About', '/about'], ['Contact', '/contact']]
const COLS = 6

/**
 * Contents: the site as a book's contents page. It falls in as six columns, each led by a thin
 * edge of ink with the paper close behind. The chapters are set with dotted leaders; the one
 * under the pointer (or the one being read) gives its abstract on the right, under a large
 * outlined numeral.
 */
export default function Contents({ open, onClose, here }) {
  const root = useRef(null)
  const tl = useRef(null)
  const { pathname } = useLocation()
  const { go } = usePageTransition()
  const [peek, setPeek] = useState(null)
  const shown = chapters.findIndex((c) => c.id === (peek ?? here))
  const c = chapters[shown >= 0 ? shown : 0]
  const k = shown >= 0 ? shown : 0

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      tl.current = gsap
        .timeline({ paused: true, defaults: { ease: 'expo' } })
        .set(root.current, { visibility: 'visible' })
        .fromTo(q('.ct__ink'), { scaleY: 0 }, { scaleY: 1, duration: 0.75, stagger: 0.045, ease: 'expo.inOut' }, 0)
        .fromTo(q('.ct__paper'), { scaleY: 0 }, { scaleY: 1, duration: 0.75, stagger: 0.045, ease: 'expo.inOut' }, 0.1)
        .fromTo(q('.ct__row a'), { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.035 }, 0.5)
        .fromTo(q('.ct__lead'), { scaleX: 0 }, { scaleX: 1, duration: 1.1, stagger: 0.035, ease: 'expo.inOut' }, 0.55)
        .fromTo(q('.ct__kick, .ct__side > *, .ct__foot > *'), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.04 }, 0.65)
    },
    { scope: root },
  )

  // open and close; the page underneath holds still and takes no focus while the contents are up
  useEffect(() => {
    const t = tl.current
    const main = document.getElementById('main')
    if (!t) return
    if (open) {
      stopScroll()
      if (main) main.inert = true
      t.timeScale(1).play()
      if (reduced()) t.progress(1)
      // focus comes into the contents page itself, so nothing is pre-selected; Tab reaches the chapters
      setTimeout(() => root.current?.focus({ preventScroll: true }), 400)
    } else if (t.progress() > 0) {
      if (main) main.inert = false
      startScroll()
      t.timeScale(1.7).reverse()
      if (reduced()) t.progress(0)
      setPeek(null)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const key = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [open, onClose])

  // leave the contents, then travel: the page is unlocked before it is scrolled
  const read = (e, id) => {
    e.preventDefault()
    onClose()
    if (document.getElementById('main')) document.getElementById('main').inert = false
    startScroll()
    go(`/#${id}`)
  }

  return (
    <div id="contents" className={`ct ${open ? 'is-open' : ''}`} ref={root} role="dialog" aria-modal="true" aria-label="Contents" tabIndex={-1} inert={open ? undefined : ''}>
      <div className="ct__blinds" aria-hidden="true">
        {Array.from({ length: COLS }, (_, i) => <span key={i}><i className="ct__ink" /><i className="ct__paper" /></span>)}
      </div>

      <div className="ct__body wrap">
        <div className="ct__main">
          <p className="ct__kick"><span>Contents</span><span>{chapters.length} chapters · {site.city}, {new Date().getFullYear()}</span></p>
          <ol className="ct__list" onPointerLeave={() => setPeek(null)}>
            {chapters.map((ch, i) => (
              <li className={`ct__row ${ch.id === here ? 'is-here' : ''}`} key={ch.id}>
                <a href={`/#${ch.id}`} onClick={(e) => read(e, ch.id)} onPointerEnter={() => setPeek(ch.id)} onFocus={() => setPeek(ch.id)}>
                  <small>{two(i + 1)}</small>
                  <span className="ct__title">{ch.title}</span>
                  <i className="ct__lead" aria-hidden="true" />
                  <span className="ct__kind">{ch.id === here ? <><i className="ct__dot" />You are here</> : ch.kind}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>

        <aside className="ct__side" aria-live="polite">
          <span className="ct__num" key={`n${c.id}`} aria-hidden="true">{two(k + 1)}</span>
          <div className="ct__abstract" key={`a${c.id}`}>
            <span className="ct__label">Abstract</span>
            <p className="ct__name">{c.title}</p>
            <p className="ct__text">{c.abstract}</p>
          </div>
          <nav className="ct__pages" aria-label="Pages">
            <span className="ct__label">Pages</span>
            {PAGES.map(([label, to]) => (
              <TLink key={to} to={to} onClick={onClose} aria-current={(to === '/' ? pathname === '/' : pathname.startsWith(to)) ? 'page' : undefined}>
                {label}<Icon name="arrowUpRight" size={14} />
              </TLink>
            ))}
          </nav>
        </aside>

        <div className="ct__foot">
          <div><span className="ct__label">Write</span><a href={`mailto:${site.email}`}>{site.email}</a></div>
          <div><span className="ct__label">Talk</span><a href={site.phone.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a><a href={site.booking} target="_blank" rel="noopener noreferrer">Book a call</a></div>
          <div><span className="ct__label">Elsewhere</span>{site.socials.slice(0, 3).map((s) => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>)}</div>
          <div><span className="ct__label">Local time</span><span>{site.city} · <Clock /> IST</span></div>
          <button type="button" className="ct__search" onClick={() => { onClose(); setTimeout(() => window.dispatchEvent(new Event('palette:open')), 350) }}>
            <Icon name="search" size={14} />Search<kbd>⌘K</kbd>
          </button>
        </div>
      </div>
    </div>
  )
}
