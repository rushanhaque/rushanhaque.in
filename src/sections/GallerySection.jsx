import { useEffect, useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useChapter, ramp, clamp01, director } from '../lib/director'
import { scrollTo } from '../lib/scroll'
import { corridor } from '../lib/corridor'
import { small, srcSet } from '../lib/img'
import { device } from '../lib/device'
import { works } from '../data/content'
import { TLink, useGo } from '../components/Transition'
import Btn from '../components/Btn'

const two = (n) => String(n).padStart(2, '0')

// The long gallery: a walk down a dark enfilade of arches, one client's site in each bay. The picture is a
// line drawing until you get near it, then the lattice opens and it is the real thing. When you move on it
// parts down the middle like a pair of doors, and the next one is behind it. The camera is framed from what
// the page measures, so a picture always sits in the clear space between the bar and its caption. Where a
// device gets no canvas, the same six sites are a plain list.
export default function GallerySection() {
  const root = useRef(null)
  const stage = useRef(null)
  const lead = useRef(null)
  const hit = useRef(null)
  const tls = useRef([])
  const blocks = useRef([])
  const leadTl = useRef(null)
  const active = useRef(-1)
  const go = useGo()

  useEffect(() => {
    corridor.sway = !device().touch
    const measure = () => {
      const st = stage.current
      if (!st || !st.offsetHeight) return
      const H = director.engine?.ctx.h || innerHeight
      const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar-h')) || 64
      let labelTop = st.offsetHeight
      blocks.current.forEach((b) => { labelTop = Math.min(labelTop, b.offsetTop) })
      corridor.region = {
        top: (bar + 14) / H,
        bottom: (labelTop - 16) / H,
        lead: ((lead.current?.offsetTop ?? st.offsetHeight * 0.6) - 16) / H,
      }
      corridor.update(corridor.u, innerWidth, H)
    }
    measure()
    addEventListener('resize', measure)
    document.fonts?.ready.then(measure)
    const off = director.onEngine((e) => { e.prepare('gallery'); measure() })
    return () => { removeEventListener('resize', measure); off() }
  }, [])

  // each caption's animation is only built the first time that caption is reached
  const build = useRef(null)
  useGSAP((_, safe) => {
    blocks.current = gsap.utils.toArray('.gal__label', root.current)
    tls.current = []
    build.current = safe((i) => {
      const b = blocks.current[i]
      const chars = b.querySelectorAll('.gal__ch')
      const rest = b.querySelectorAll('[data-g]')
      tls.current[i] = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
        .fromTo(chars, { yPercent: 135 }, { yPercent: 0, duration: 0.5, stagger: 0.012, ease: 'power3.out' }, 0)
        .fromTo(rest, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.03, ease: 'power3.out' }, 0.2)
        .to({}, { duration: 1.1 })
        .to(chars, { yPercent: -135, duration: 0.36, stagger: 0.006, ease: 'power3.in' }, '>')
        .to(rest, { autoAlpha: 0, y: -12, duration: 0.2, ease: 'power2.in' }, '<')
      return tls.current[i]
    })
    leadTl.current = gsap.timeline({ paused: true, defaults: { ease: 'none' } }).to(lead.current, { autoAlpha: 0, y: -30, duration: 1 })
  }, { scope: root })

  useChapter(root, {
    id: 'gallery',
    name: 'Selected works',
    hidden: true,
    time: [7.5, 11.8],
    stage: 'gallery',
    frame: ({ stick, engine }) => {
      const n = works.length
      // the walk starts a little way back from the first arch, and only sets off once the title has gone
      const u = -0.5 + stick * (n + 0.75)
      corridor.update(u, innerWidth, engine ? engine.ctx.h : innerHeight)
      leadTl.current?.progress(ramp(stick, 0.002, 0.036))
      let now = -1
      blocks.current.forEach((b, i) => {
        // each label is on for the time its picture is held in focus
        const a = clamp01((u - i - 0.2) / 0.62)
        if (a > 0 && a < 1) now = i
        const tl = tls.current[i] || (a > 0 ? build.current?.(i) : null)
        if (tl && Math.abs(tl.progress() - a) > 0.0005) tl.progress(a)
        b.style.visibility = a > 0.001 && a < 0.999 ? 'visible' : 'hidden'
      })
      // a real link lies exactly over the picture in focus
      const el = hit.current
      if (!el) return
      const r = now >= 0 ? corridor.plates[now]?.rect : null
      const held = r && r.w > 40
      if (now !== active.current) {
        active.current = now
        if (now >= 0) {
          el.href = `/work/${works[now].slug}`
          el.setAttribute('aria-label', `${works[now].title}, view the case`)
        }
      }
      el.style.display = held ? 'block' : 'none'
      if (held) {
        el.style.transform = `translate(${r.x.toFixed(1)}px, ${r.y.toFixed(1)}px)`
        el.style.width = `${r.w.toFixed(1)}px`
        el.style.height = `${r.h.toFixed(1)}px`
      }
    },
    leave: () => {
      if (hit.current) hit.current.style.display = 'none'
      blocks.current.forEach((b) => { b.style.visibility = 'hidden' })
    },
  })

  return (
    <div className="galw" id="gallery" ref={root} data-wear="ivory">
      <section className="gal" aria-label="Selected works">
        <div className="pin__stage" ref={stage}>
          <div className="gal__scrim" aria-hidden="true" />
          <div className="gal__lead wrap" ref={lead}>
            <h1 className="gal__title pillar">Selected works</h1>
            <div className="gal__intro">
              <p className="note">Six client websites, for export houses, interiors brands and a visa consultancy. Scroll to walk through them.</p>
              <button type="button" className="tlink" onClick={() => scrollTo('#all-work')}>Skip to the full list</button>
            </div>
          </div>
          <a
            className="gal__hit"
            ref={hit}
            href="/work"
            data-cursor="View case"
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey) return
              e.preventDefault()
              const w = works[active.current]
              if (w) go(`/work/${w.slug}`, { title: w.short })
            }}
          />
          {works.map((w, i) => (
            <article className="gal__label wrap" key={w.slug}>
              <h2 className="gal__name pillar" aria-label={w.title}>
                <span className="gal__mask" aria-hidden="true">
                  {w.title.split('').map((c, j) => <span className="gal__ch" key={j}>{c === ' ' ? ' ' : c}</span>)}
                </span>
              </h2>
              <div className="gal__meta">
                <p className="gal__idx note" data-g>{two(i + 1)} / {two(works.length)}</p>
                <p className="gal__line" data-g>{w.line}</p>
                <dl className="gal__facts note" data-g>
                  <div><dt>Field</dt><dd>{w.field.replace(' · ', ', ')}</dd></div>
                  <div><dt>Year</dt><dd>{w.year}</dd></div>
                  <div><dt>Status</dt><dd>{w.status}</dd></div>
                </dl>
                <div className="gal__cta" data-g>
                  <Btn to={`/work/${w.slug}`} title={w.short}>View case</Btn>
                  {w.url && <a className="gal__visit" href={w.url} target="_blank" rel="noopener noreferrer">Visit site</a>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="galp wrap" aria-label="Selected works">
        <p className="gal__title pillar" aria-hidden="true">Selected works</p>
        <ul className="galp__list">
          {works.map((w) => (
            <li key={w.slug}>
              <TLink to={`/work/${w.slug}`} title={w.short} className="galp__card">
                <img src={small(w.image)} srcSet={srcSet(w.image)} sizes="(max-width: 760px) 92vw, 90vw" alt={`${w.title} home page`} loading="lazy" decoding="async" width={w.w} height={w.h} />
                <span className="galp__name pillar">{w.title}</span>
                <span className="body">{w.line}</span>
                <span className="note">{w.field.replace(' · ', ', ')}, {w.year}. {w.status}.</span>
              </TLink>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
