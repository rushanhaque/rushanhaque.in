import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, reduced, isTouch } from '../lib/gsap'
import { services } from '../data/content'
import Head from '../components/Head'
import Button from '../components/Button'

const GLYPH = {
  design: 'M32 6 L46 38 L32 58 L18 38 Z M32 6 V33 M28 37 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 M12 58 H52',
  code: 'M22 18 L8 32 L22 46 M42 18 L56 32 L42 46 M37 10 L27 54',
  bag: 'M12 22 H52 L48 57 H16 Z M23 22 V17 a9 9 0 0 1 18 0 V22 M22 31 a10 10 0 0 0 20 0',
  grid: 'M9 9 H28 V28 H9 Z M36 9 H55 V28 H36 Z M9 36 H28 V55 H9 Z M36 36 H55 V55 H36 Z',
  search: 'M9 27 a18 18 0 1 0 36 0 a18 18 0 1 0 -36 0 M40 40 L56 56',
  phone: 'M21 5 H43 a5 5 0 0 1 5 5 V54 a5 5 0 0 1 -5 5 H21 a5 5 0 0 1 -5 -5 V10 a5 5 0 0 1 5 -5 Z M28 51 H36',
  cloud: 'M17 47 a11 11 0 0 1 1 -21.9 a15 15 0 0 1 28.6 -2.2 a12 12 0 0 1 1.4 24.1 Z',
  spark: 'M32 5 V21 M32 43 V59 M5 32 H21 M43 32 H59 M13 13 L24 24 M40 40 L51 51 M51 13 L40 24 M24 40 L13 51',
  chat: 'M8 11 H56 V41 H29 L17 53 V41 H8 Z',
  play: 'M8 12 H56 V52 H8 Z M26 22 L42 32 L26 42 Z',
}
const two = (n) => String(n).padStart(2, '0')

/**
 * 06 — Other services, laid out like sheets on a drawing board. On wide screens the section
 * holds still and the scroll slides the sheets past: the one in the middle comes forward and
 * its pictogram is drawn, the rest wait a step back. On phones it is a row you swipe.
 */
export default function OtherServices() {
  const root = useRef(null)

  useGSAP(
    () => {
      const el = root.current
      const track = el.querySelector('.osv__track')
      const cards = gsap.utils.toArray('.osv__card', el)
      const paths = cards.map((c) => c.querySelector('.osv__glyph path'))
      const count = el.querySelector('.osv__count b')
      const fill = el.querySelector('.osv__bar i')
      const drawn = new Set()
      let on = -1

      const draw = (i, d = 1.6) => paths[i] && gsap.fromTo(paths[i], { drawSVG: '0%' }, { drawSVG: '100%', duration: d, ease: 'silk', overwrite: true })
      const select = (i) => {
        if (i === on) return
        on = i
        cards.forEach((c, k) => c.classList.toggle('is-on', k === i))
        if (count) count.textContent = two(Math.min(i + 1, services.length))
        if (!drawn.has(i)) { drawn.add(i); draw(i) }
      }
      // the sheet at the left margin, under the title, leads; the others ease back by distance
      const measure = () => {
        const lead = el.querySelector('.osv__viewport').getBoundingClientRect().left + parseFloat(getComputedStyle(track).paddingLeft) + cards[0].offsetWidth / 2
        let best = 0
        let bd = Infinity
        cards.forEach((c, k) => {
          const r = c.getBoundingClientRect()
          const d = (r.left + r.width / 2 - lead) / window.innerWidth
          c.style.setProperty('--d', Math.min(1, Math.abs(d) * 1.6).toFixed(3))
          // sheets already read leave quickly; the ones ahead stay half seen
          c.style.setProperty('--o', (d < 0 ? 1 - Math.min(1, -d * 3.2) : 1 - Math.min(1, d * 1.6) * 0.5).toFixed(3))
          c.style.setProperty('--x', d.toFixed(3))
          if (Math.abs(d) < bd) { bd = Math.abs(d); best = k }
        })
        select(best)
      }

      if (!isTouch()) cards.forEach((c, i) => c.addEventListener('mouseenter', () => draw(i, 0.9)))

      const mm = gsap.matchMedia()
      mm.add({ wide: '(min-width: 900px)', narrow: '(max-width: 899px)', still: '(prefers-reduced-motion: reduce)' }, (ctx) => {
        if (!ctx.conditions.wide || ctx.conditions.still) {
          // a native swipe row: the lead sheet follows the row's own scroll
          const row = el.querySelector('.osv__viewport')
          const onScroll = () => { measure(); fill && (fill.style.transform = `scaleX(${row.scrollLeft / Math.max(1, row.scrollWidth - row.clientWidth)})`) }
          row.addEventListener('scroll', onScroll, { passive: true })
          const st = ScrollTrigger.create({ trigger: el, start: 'top 75%', once: true, onEnter: onScroll })
          return () => { row.removeEventListener('scroll', onScroll); st.kill() }
        }
        // travel until the last sheet stands where the first began
        const dist = () => Math.max(0, cards[cards.length - 1].offsetLeft - cards[0].offsetLeft)
        const tween = gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: () => `+=${dist()}`,
            pin: el.querySelector('.osv__stage'),
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (s) => fill && (fill.style.transform = `scaleX(${s.progress})`),
          },
        })
        // the cards are measured every frame while the section is in view, so the scrub's glide shows
        const st = ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? gsap.ticker.add(measure) : gsap.ticker.remove(measure)) })
        measure()
        return () => { gsap.ticker.remove(measure); st.kill(); tween.scrollTrigger?.kill(); tween.kill(); gsap.set(track, { clearProps: 'x' }) }
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section className="osv" ref={root} data-theme="ivory" data-chapter="Other services" id="services">
      <div className="osv__stage">
        <div className="wrap osv__head">
          <Head n="06" label="What else I do" title={<>Other <em>services</em></>} count={services.length} lede="Design and development lead, and the rest of what a business needs online comes with them, handled by the same person." />
        </div>
        <div className="osv__viewport">
          <ul className="osv__track">
            {services.map((s, i) => (
              <li className="osv__card" key={s.title}>
                <div className="osv__plate">
                  <span className="osv__no">06.{two(i + 1)}</span>
                  <span className="osv__of">{s.items[0]}</span>
                  <svg className="osv__glyph" viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d={GLYPH[s.icon]} /></svg>
                  <span className="osv__big" aria-hidden="true">{two(i + 1)}</span>
                  <i className="osv__tick" aria-hidden="true" />
                </div>
                <div className="osv__body">
                  <h3 className="osv__name">{s.title}</h3>
                  <p className="osv__text">{s.text}</p>
                  <ul className="osv__tags">{s.items.map((t) => <li key={t}>{t}</li>)}</ul>
                </div>
              </li>
            ))}
            <li className="osv__card osv__card--cta">
              <span className="osv__no">Not on the list?</span>
              <p className="osv__ask">If it lives online, <em>ask me.</em></p>
              <Button to="/contact" variant="solid">Start a conversation</Button>
            </li>
          </ul>
        </div>
        <div className="wrap osv__foot" aria-hidden="true">
          <span className="osv__hint">Scroll to browse</span>
          <span className="osv__bar"><i /></span>
          <span className="osv__count"><b>01</b> / {two(services.length)}</span>
        </div>
      </div>
    </section>
  )
}
