import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { lift } from '../lib/lift'
import { device } from '../lib/device'
import { site, localTime } from '../config/site'
import { TLink } from './Transition'
import { scrollTo } from '../lib/scroll'
import { services, areas, articles, industries } from '../lib/pages'

// The name again, and this time the letters are columns: they rise out of the floor as you arrive, and the ones
// nearest the pointer lift. Height is all that ever changes, so none of it touches the layout.
function PillarName() {
  const root = useRef(null)
  useGSAP(() => {
    const d = device()
    if (d.reduced) return undefined
    const el = root.current
    const chars = [...el.querySelectorAll('i')]
    if (d.touch) gsap.from(chars, { scaleY: 0, duration: 1.5, stagger: 0.04, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 96%', once: true } })
    else gsap.fromTo(chars, { scaleY: 0 }, { scaleY: 1, ease: 'none', stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 100%', end: 'bottom 94%', scrub: 0.6 } })
    return lift(el, chars)
  }, { scope: root })
  const word = 'Rushan Haque'
  return (
    <p className="foot__name pillar" ref={root} aria-hidden="true">
      {word.split('').map((c, i) => (c === ' ' ? <span key={i} className="foot__gap" /> : <i key={i}>{c}</i>))}
    </p>
  )
}

function Clock() {
  const [t, setT] = useState('')
  useEffect(() => {
    const up = () => setT(localTime())
    up()
    const i = setInterval(up, 15000)
    return () => clearInterval(i)
  }, [])
  return <>{t || '--:--'}</>
}

const short = (t) => t.replace('Websites for ', '').replace(/^./, (c) => c.toUpperCase())

export default function Footer({ lead = true, dark = false }) {
  return (
    <footer className="foot wrap" data-fixed={dark ? 'wine' : 'ivory'}>
      <div className="foot__cols grid">
        <div className="foot__col foot__col--lead">
          <p className="lede">{lead ? 'A project, a half-formed idea, or just hello. I reply to everything myself, usually within a day.' : 'Websites and software for businesses in India and abroad, designed and built by one person.'}</p>
        </div>
        <div className="foot__col">
          <p className="note">Pages</p>
          <ul>
            <li><TLink to="/" title="Home">Home</TLink></li>
            {site.nav.map((n) => <li key={n.to}><TLink to={n.to} title={n.label}>{n.label}</TLink></li>)}
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
            <li><a href={site.booking} target="_blank" rel="noopener noreferrer">Book a call</a></li>
          </ul>
        </div>
      </div>
      <details className="foot__more">
        <summary className="small">Services, guides and areas served</summary>
        <div className="foot__dir">
          <ul>{services.map((p) => <li key={p.slug}><TLink to={`/${p.slug}`}>{p.title}</TLink></li>)}</ul>
          <ul>{articles.map((g) => <li key={g.slug}><TLink to={`/${g.slug}`}>{g.title}</TLink></li>)}</ul>
          <ul>{industries.map((g) => <li key={g.slug}><TLink to={`/${g.slug}`}>{short(g.title)}</TLink></li>)}</ul>
          <ul>{areas.map((a) => <li key={a.slug}><TLink to={`/${a.slug}`}>{a.name}</TLink></li>)}</ul>
        </div>
      </details>
      <PillarName />
      <div className="foot__base note">
        <span>{site.location}. Local time <Clock /> IST.</span>
        <button type="button" className="foot__top" onClick={() => scrollTo(0)}>Back to top</button>
        <span><TLink to="/privacy">Privacy</TLink>, <TLink to="/accessibility">Accessibility</TLink>. © <span suppressHydrationWarning>{new Date().getFullYear()}</span> Rushan Haque.</span>
      </div>
    </footer>
  )
}
