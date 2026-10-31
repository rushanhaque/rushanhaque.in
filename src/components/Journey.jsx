import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP, reduced } from '../lib/gsap'
import { education, experience } from '../data/content'
import { Kicker } from './Head'

const items = [
  ...experience.map((e) => ({ title: e.role, place: e.company, period: e.period, note: e.text, study: false })),
  ...education.map((e) => ({ title: e.title, place: e.institution, period: e.period, note: '', study: true })),
]

/**
 * The journey, as in the previous portfolio: roles alternate either side of a centre lane, and
 * a path winds down through their markers. The scroll inks the path, a marker rides its tip,
 * and each role lights up and slides in as the reader reaches it.
 */
export default function Journey({ n = '01' }) {
  const root = useRef(null)
  const line = useRef(null)
  const tip = useRef(null)
  const [d, setD] = useState('')

  // the path is measured through the markers, and again whenever the list changes size
  useEffect(() => {
    const list = root.current.querySelector('.jr__list')
    const measure = () => {
      const box = list.getBoundingClientRect()
      const pts = [...list.querySelectorAll('.jr__dot')].map((dot) => { const r = dot.getBoundingClientRect(); return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top] })
      if (pts.length < 2) return
      // the line sways inside the centre lane only, so it never crosses the text
      const sway = box.width >= 900 ? 58 : 9
      let next = `M ${pts[0][0]} ${pts[0][1] - 70} L ${pts[0][0]} ${pts[0][1]}`
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1]
        const [x1, y1] = pts[i]
        const s = (i % 2 ? 1 : -1) * sway
        const k = (y1 - y0) * 0.5
        next += ` C ${x0 + s} ${y0 + k}, ${x1 + s} ${y1 - k}, ${x1} ${y1}`
      }
      const [lx, ly] = pts[pts.length - 1]
      setD(`${next} L ${lx} ${ly + 70}`)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    return () => ro.disconnect()
  }, [])

  useGSAP(
    () => {
      const el = root.current
      if (!d || reduced()) return
      const path = line.current
      const len = path.getTotalLength()
      const follow = (p) => {
        const pt = path.getPointAtLength(len * p)
        tip.current.setAttribute('transform', `translate(${pt.x} ${pt.y})`)
        tip.current.style.opacity = p > 0.002 && p < 0.998 ? '1' : '0'
      }
      gsap.fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', scrollTrigger: { trigger: '.jr__list', start: 'top 82%', end: 'bottom 78%', scrub: 0.3 }, onUpdate() { follow(this.progress()) } })
      gsap.utils.toArray('.jr__item', el).forEach((item) => ScrollTrigger.create({ trigger: item, start: 'top 84%', onEnter: () => item.classList.add('is-lit'), onLeaveBack: () => item.classList.remove('is-lit') }))
      el.classList.add('is-live')
      return () => el.classList.remove('is-live')
    },
    { scope: root, dependencies: [d] },
  )

  return (
    <section className="jr wrap" ref={root} data-theme="ivory" data-chapter="Journey" id="journey">
      <header className="jr__head">
        <Kicker n={n} label="Journey" />
        <h2 data-split>Roles, rooms <em>and lessons.</em></h2>
        <span className="jr__legend" aria-hidden="true"><i className="is-work" />Experience<i />Education</span>
      </header>
      <div className="jr__list">
        <svg className="jr__svg" aria-hidden="true">
          <defs>
            <linearGradient id="jr-ink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset=".3" stopColor="#4a2228" /><stop offset="1" stopColor="#2b1418" /></linearGradient>
          </defs>
          <path className="jr__track" d={d} />
          <path className="jr__ink" ref={line} d={d} />
          <g className="jr__tip" ref={tip}><circle r="14" /><circle r="4.5" /></g>
        </svg>
        <span className="jr__now" aria-hidden="true">Now</span>
        {items.map((it, i) => (
          <article className={`jr__item ${i % 2 ? 'is-right' : ''} ${it.study ? 'is-study' : ''}`} key={it.title + it.place}>
            <span className="jr__dot" aria-hidden="true" />
            <div>
              <span className="jr__period">{it.period}</span>
              <h3>{it.title}</h3>
              <span className="jr__place">{it.place}</span>
              {it.note && <p>{it.note}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
