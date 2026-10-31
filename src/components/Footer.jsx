import { Fragment, useEffect, useId, useRef, useState } from 'react'
import { gsap, useGSAP, reduced } from '../lib/gsap'
import { site } from '../config/site'
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

/**
 * The signature: the name in ivory with a second copy in engraved brass laid exactly over it,
 * hidden. As it arrives the letters rise, then a light sweeps once across and the brass shows
 * through wherever it falls. After that the light follows the pointer (a tap places it on
 * touch screens). The letters never move; only the light does.
 */
function Wordmark() {
  const ref = useRef(null)
  const chars = (cls) => <span className={`ftr__word-in ${cls}`} aria-hidden="true">{site.name.split('').map((c, i) => <span className="ftr__ch" key={i}>{c === ' ' ? ' ' : c}</span>)}</span>
  // sized from the margins once the fonts are in: edge to edge, never taller than ~10% of the width
  useEffect(() => {
    const el = ref.current
    let last = 0
    const fit = (force) => {
      if (!force && el.clientWidth === last) return
      last = el.clientWidth
      const ch = el.querySelector('.is-ivory').children
      el.style.fontSize = '100px'
      const text = ch[ch.length - 1].getBoundingClientRect().right - ch[0].getBoundingClientRect().left
      const room = el.clientWidth - parseFloat(getComputedStyle(el).paddingLeft) * 2
      el.style.fontSize = `${Math.min((100 * room) / text, window.innerWidth * (window.innerWidth < 900 ? 0.16 : 0.1))}px`
    }
    fit(true)
    document.fonts?.ready.then(() => fit(true))
    const ro = new ResizeObserver(() => fit())
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useGSAP(() => {
    const el = ref.current
    if (reduced()) return
    const light = { x: -20, y: 50, r: 0 }
    const apply = () => {
      el.style.setProperty('--mx', `${light.x}%`)
      el.style.setProperty('--my', `${light.y}%`)
      el.style.setProperty('--r', `${light.r}px`)
    }
    const span = () => Math.max(160, el.clientHeight * 1.1)
    gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 92%', once: true } })
      .from(el.querySelectorAll('.ftr__ch'), { yPercent: 110, duration: 1.4, ease: 'expo', stagger: 0.035 }, 0)
      .to(light, { r: () => span(), duration: 0.4, ease: 'power2.out', onUpdate: apply }, 0.7)
      .to(light, { x: 120, duration: 2, ease: 'power2.inOut', onUpdate: apply }, 0.7)
      .to(light, { r: 0, duration: 0.5, ease: 'power2.in', onUpdate: apply }, 2.3)
    // the light follows the pointer, eased so it glides rather than jumps
    const to = { x: 50, y: 50 }
    const glide = gsap.quickTo(light, 'x', { duration: 0.6, ease: 'power3.out', onUpdate: apply })
    const glideY = gsap.quickTo(light, 'y', { duration: 0.6, ease: 'power3.out', onUpdate: apply })
    const layer = el.querySelector('.is-brass')
    const at = (e) => {
      const r = layer.getBoundingClientRect()
      to.x = ((e.clientX - r.left) / r.width) * 100
      to.y = ((e.clientY - r.top) / r.height) * 100
      glide(to.x)
      glideY(to.y)
    }
    const enter = (e) => { gsap.to(light, { r: span(), duration: 0.5, ease: 'power2.out', onUpdate: apply }); at(e) }
    // after a tap the light lingers a moment before it fades
    const leave = (e) => gsap.to(light, { r: 0, duration: 0.6, delay: e?.pointerType === 'touch' ? 1.4 : 0, ease: 'power2.inOut', onUpdate: apply })
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointermove', at)
    el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointerenter', enter); el.removeEventListener('pointermove', at); el.removeEventListener('pointerleave', leave) }
  }, { scope: ref })
  return (
    <div className="ftr__word" ref={ref}>
      <span className="sr-only">{site.name}</span>
      {chars('is-ivory')}
      {chars('is-brass')}
    </div>
  )
}

/** A small index of the guides, services and areas served, set quietly above the wordmark. */
function Directory() {
  const groups = [
    ['Services', services.map((p) => [p.slug, p.title])],
    ['Areas', areas.map((a) => [a.slug, a.name])],
    ['Guides', [...articles, ...industries].map((g) => [g.slug, g.lang === 'hi' ? `${g.title} (हिंदी)` : g.title])],
    ['Site', [['privacy', 'Privacy'], ['accessibility', 'Accessibility']]],
  ]
  // the index folds behind one line; its links stay in the page for search engines
  const [open, setOpen] = useState(false)
  return (
    <nav className={`ftr__dir wrap ${open ? 'is-open' : ''}`} aria-label="Services, areas and guides">
      <button type="button" className="ftr__dir-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Services, areas and guides <Icon name={open ? 'arrowUp' : 'arrowDown'} size={13} />
      </button>
      {groups.map(([name, links]) => (
        // a space after each link, so a line can break between them
        <p key={name}><span>{name}</span>{links.map(([slug, text]) => <Fragment key={slug}><TLink to={`/${slug}`}>{text}</TLink>{' '}</Fragment>)}</p>
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
    </footer>
  )
}
