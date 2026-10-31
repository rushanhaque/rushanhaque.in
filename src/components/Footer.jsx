import { useEffect, useId, useRef } from 'react'
import { gsap, useGSAP, reduced } from '../lib/gsap'
import { site } from '../config/site'
import { scrollTo } from '../lib/lenis'
import { TLink } from './Transition'
import { RollText } from './Button'
import { Clock } from './Header'
import { Kicker } from './Head'
import Icon from './Icon'
import { services, areas, industries, articles } from '../lib/pages'

export function OrbLink({ to = '/contact', text = 'Start a project' }) {
  const ring = `${text} · ${text} · `
  const id = `orb${useId().replace(/:/g, '')}`
  return (
    <TLink to={to} className="orb beam">
      <svg viewBox="0 0 200 200" className="orb__ring" aria-hidden="true">
        <defs><path id={id} d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" /></defs>
        <text><textPath href={`#${id}`}>{ring}</textPath></text>
      </svg>
      <span className="orb__core"><Icon name="arrowUpRight" size={30} stroke={1.2} /></span>
      <span className="sr-only">{text}</span>
    </TLink>
  )
}

// the wordmark is sized from the margins, measured once the fonts are in
function Wordmark() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    let last = 0
    const fit = (force) => {
      if (!force && el.clientWidth === last) return
      last = el.clientWidth
      const inner = el.firstElementChild
      el.style.fontSize = '100px'
      const room = el.clientWidth - parseFloat(getComputedStyle(el).paddingLeft) * 2
      // edge to edge on phones; on wider screens a quieter signature, never taller than about 7.5% of the width
      const fit = (100 * room) / inner.scrollWidth
      el.style.fontSize = `${window.innerWidth < 900 ? fit : Math.min(fit, window.innerWidth * 0.075)}px`
    }
    fit(true)
    document.fonts?.ready.then(() => fit(true))
    const ro = new ResizeObserver(() => fit())
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useGSAP(() => {
    if (reduced()) return
    gsap.from(ref.current.querySelectorAll('.ftr__ch'), { yPercent: 110, duration: 1.4, ease: 'expo', stagger: 0.04, scrollTrigger: { trigger: ref.current, start: 'top 95%', once: true } })
  }, { scope: ref })
  return (
    <p className="ftr__word" ref={ref} aria-hidden="true">
      <span className="ftr__word-in">{site.name.split('').map((c, i) => <span className="ftr__ch" key={i}>{c === ' ' ? '\u00a0' : c}</span>)}</span>
    </p>
  )
}

/** A small index of the guides, services and areas served, set quietly above the wordmark. */
function Directory() {
  const groups = [
    ['Services', services.map((p) => [p.slug, p.title])],
    ['Areas', areas.map((a) => [a.slug, a.name])],
    ['Guides', [...articles, ...industries].map((g) => [g.slug, g.lang === 'hi' ? `${g.title} (हिंदी)` : g.title])],
  ]
  return (
    <nav className="ftr__dir wrap" aria-label="Services, areas and guides">
      {groups.map(([name, links]) => (
        <p key={name}><span>{name}</span>{links.map(([slug, text]) => <TLink key={slug} to={`/${slug}`}>{text}</TLink>)}</p>
      ))}
    </nav>
  )
}

export default function Footer({ cta = true }) {
  return (
    <footer className="ftr" data-theme="wine">
      <div className="wrap">
        {cta && (
          <section className="ftr__cta" aria-labelledby="ftr-title">
            <Kicker label="Start a project" />
            <div className="ftr__cta-row">
              <h2 className="ftr__title" id="ftr-title" data-split>Got something <em>worth building?</em></h2>
              <OrbLink />
            </div>
          </section>
        )}
        <div className="ftr__grid">
          <div className="ftr__col ftr__col--wide">
            <span className="ftr__label">Email</span>
            <a className="ftr__mail" href={`mailto:${site.email}?subject=Hello%20from%20your%20site`}><RollText>{site.email}</RollText></a>
          </div>
          <div className="ftr__col">
            <span className="ftr__label">Talk</span>
            <a className="ftr__link" href={site.phone.whatsapp} target="_blank" rel="noopener noreferrer"><RollText>WhatsApp</RollText></a>
            <a className="ftr__link" href={site.booking} target="_blank" rel="noopener noreferrer"><RollText>Book a call</RollText></a>
            <span className="ftr__muted">{site.city} · <Clock /> IST</span>
          </div>
          <div className="ftr__col">
            <span className="ftr__label">Pages</span>
            {[{ label: 'Index', to: '/' }, ...site.nav].map((n) => <TLink key={n.to} to={n.to} className="ftr__link"><RollText>{n.label}</RollText></TLink>)}
          </div>
          <div className="ftr__col">
            <span className="ftr__label">Elsewhere</span>
            {site.socials.slice(0, 3).map((s) => <a key={s.label} href={s.href} className="ftr__link" target="_blank" rel="noopener noreferrer"><RollText>{s.label}</RollText></a>)}
          </div>
        </div>
      </div>
      <Directory />
      <Wordmark />
      <div className="ftr__base wrap">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <TLink to="/privacy" className="ftr__legal">Privacy</TLink>
        <TLink to="/accessibility" className="ftr__legal">Accessibility</TLink>
        <span className="ftr__colophon">Set in Geist and Instrument Serif. Designed and built by hand in {site.city}.</span>
        <button className="ftr__top" onClick={() => scrollTo(0, { duration: 2 })}>
          <RollText>Back to top</RollText>
          <Icon name="arrowUpRight" size={14} className="ftr__top-ico" />
        </button>
      </div>
    </footer>
  )
}
