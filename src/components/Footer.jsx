import { useEffect, useRef } from 'react'
import { site } from '../config/site'
import { device } from '../lib/device'
import { scrub } from '../lib/motion'
import { lift } from '../lib/lift'
import { scrollToY } from '../lib/scroll'
import { services, areas, articles, industries } from '../lib/pages'
import { A } from '../lib/router'
import { BookLink } from './Booking'
import Clock from './Clock'

// The name again, and this time the letters are columns: they rise out of the floor as you arrive, and the ones
// nearest the pointer lift. Height is all that ever changes, so none of it touches the layout.
function PillarName() {
  const root = useRef(null)
  useEffect(() => {
    const d = device()
    const el = root.current
    if (d.reduced) return undefined
    const chars = [...el.querySelectorAll('i')]
    let stop = () => {}
    if (d.touch) {
      el.classList.add('is-low')
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('is-up'); io.disconnect() } }, { rootMargin: '0px 0px -4% 0px' })
      io.observe(el)
      stop = () => io.disconnect()
    } else {
      const n = chars.length
      const T = 1 + 0.06 * (n - 1)
      let last = ''
      stop = scrub(el, {
        start: 1, end: 0.94, smooth: 0.6,
        onUpdate: (p) => {
          const key = p.toFixed(4)
          if (key === last) return
          last = key
          chars.forEach((c, i) => {
            const k = Math.min(1, Math.max(0, p * T - i * 0.06))
            c.style.transform = k >= 1 ? '' : `scaleY(${k.toFixed(4)})`
          })
        },
      })
    }
    const unlift = lift(el, chars)
    return () => { stop(); unlift(); chars.forEach((c) => { c.style.transform = ''; c.style.scale = '' }); el.classList.remove('is-low', 'is-up') }
  }, [])
  const word = 'Rushan Haque'
  return (
    <p className="foot__name pillar" ref={root} aria-hidden="true">
      {word.split('').map((c, i) => (c === ' ' ? <span key={i} className="foot__gap" /> : <i key={i} style={{ '--i': i }}>{c}</i>))}
    </p>
  )
}

const short = (t) => t.replace('Websites for ', '').replace(/^./, (c) => c.toUpperCase())

// The page above ends on a curve that flattens as you arrive, and the footer slides up from underneath it, a little
// slower than the page: a scroll-driven CSS animation (styles/chrome.css), so the compositor does all of it.
export default function Footer({ lead = true }) {
  return (
    <footer className="foot" data-tone="wine">
      <span className="foot__curve" aria-hidden="true" />
      <div className="foot__in wrap">
      <div className="foot__cols grid">
        <div className="foot__col foot__col--lead">
          <p className="lede">{lead ? 'A project, a half-formed idea, or just hello. I reply to everything myself, usually within a day.' : 'I build websites and software, and I write. Based in Moradabad, working with clients anywhere.'}</p>
        </div>
        <div className="foot__col">
          <p className="note">Pages</p>
          <ul>
            <li><A to="/">Home</A></li>
            {site.nav.map((n) => <li key={n.to}><A to={n.to}>{n.label}</A></li>)}
          </ul>
        </div>
        <div className="foot__col">
          <p className="note">Elsewhere</p>
          <ul>{site.socials.map((s) => <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}</ul>
        </div>
        <div className="foot__col foot__col--wide">
          <p className="note">Direct</p>
          <ul>
            <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
            <li><a href={site.phone.href}>{site.phone.label}</a></li>
            <li><BookLink>Book a call</BookLink></li>
          </ul>
        </div>
      </div>
      <details className="foot__more">
        <summary className="small">Services, guides and areas served</summary>
        <div className="foot__dir">
          <ul>{services.map((p) => <li key={p.slug}><A to={`/${p.slug}`}>{p.title}</A></li>)}</ul>
          <ul>{articles.map((g) => <li key={g.slug}><A to={`/${g.slug}`}>{g.title}</A></li>)}</ul>
          <ul>{industries.map((g) => <li key={g.slug}><A to={`/${g.slug}`}>{short(g.title)}</A></li>)}</ul>
          <ul>{areas.map((a) => <li key={a.slug}><A to={`/${a.slug}`}>{a.name}</A></li>)}</ul>
        </div>
      </details>
      <PillarName />
      <div className="foot__base note">
        <span>{site.location}. Local time <Clock /> IST.</span>
        <button type="button" className="foot__top" onClick={() => scrollToY(0)}>Back to top</button>
        <span><A to="/privacy">Privacy</A>, <A to="/accessibility">Accessibility</A>. © <span suppressHydrationWarning>{new Date().getFullYear()}</span> Rushan Haque.</span>
      </div>
      </div>
    </footer>
  )
}
