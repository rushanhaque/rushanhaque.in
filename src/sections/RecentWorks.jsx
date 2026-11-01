import { useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP, reduced, isTouch } from '../lib/gsap'
import { scrollTo } from '../lib/lenis'
import { low } from '../lib/device'
import { small, srcSet } from '../lib/img'
import { works } from '../data/content'
import { TLink } from '../components/Transition'
import { Kicker, Count } from '../components/Head'
import Icon from '../components/Icon'

const two = (n) => String(n).padStart(2, '0')
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' } }
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

// how far past the last arch the walk goes, in arches: the light at the end of the hall opens
const TAIL = 0.8
// the fanlight's rays, as angles across the half-ellipse
const RAYS = [18, 36, 54, 72, 90, 108, 126, 144, 162].map((a) => (a * Math.PI) / 180)

/** The fanlight over each window: brass rays from the sill to the arch, after the old havelis. */
function Fan() {
  return (
    <svg className="ar__fan" viewBox="0 0 200 44" preserveAspectRatio="none" aria-hidden="true">
      <path d="M2 44 A98 42 0 0 1 198 44" />
      <path d="M58 44 A42 18 0 0 1 142 44" />
      {RAYS.map((a) => <path key={a} d={`M${100 + 42 * Math.cos(a)} ${44 - 18 * Math.sin(a)} L${100 + 98 * Math.cos(a)} ${44 - 42 * Math.sin(a)}`} />)}
    </svg>
  )
}

/**
 * 01 — Recent works, as an arcade you walk through. Each site hangs in its own arched window
 * with a brass fanlight. Scrolling walks you down a winding hall: the next window waits further
 * on, turned a little to one side; it comes to stand before you, and as you walk on it lifts
 * overhead and you pass beneath it. Brass floor lines run on to a point of light at the end of
 * the hall, and after the last window that light opens into the next room.
 *
 * Plain 3D-transformed layers rather than WebGL, so every browser draws it on the graphics chip.
 * On wide screens the section is pinned; on touch screens it is held by CSS (sticky) and the
 * walk simply follows the scroll. With reduced motion the windows stand in a plain gallery.
 */
export default function RecentWorks() {
  const root = useRef(null)
  const trigger = useRef(null)
  const [active, setActive] = useState(0)
  const n = works.length

  useGSAP(
    () => {
      if (reduced()) return
      const el = root.current
      const q = gsap.utils.selector(el)
      const world = q('.ar__world')[0]
      const sway = q('.ar__sway')[0]
      const arches = q('.ar__arch')
      const rungs = q('.ar__rung')
      const rails = q('.ar__rail')
      const light = q('.ar__light')[0]
      const wash = q('.ar__wash')[0]
      const fill = q('.ar__fill')[0]
      const touch = isTouch()

      // the hall's measures, taken from the laid-out window and read again on every refresh
      const m = { D: 1000, P: 1100, X: 500, H: 500, S: 340, F: 300, R: 800, phone: false }
      const measure = () => {
        const w = arches[0].offsetWidth
        const phone = window.innerWidth < 900
        m.phone = phone
        m.D = phone ? 820 : 1000
        m.P = phone ? 820 : 1100
        m.H = arches[0].offsetHeight
        m.X = w * (phone ? 0.52 : 0.6)
        m.S = m.D * 0.34
        m.F = m.H * 0.5 + w * 0.09
        m.R = w * (phone ? 0.85 : 1.05)
        world.style.perspective = `${m.P}px`
        rails.forEach((r, k) => { r.style.transform = `translate3d(${k ? m.R : -m.R}px, ${m.F}px, ${-m.D * 2.6}px) rotateX(90deg)`; r.style.height = `${m.D * 5.2}px`; r.style.marginTop = `${-m.D * 2.6}px` })
        rungs.forEach((r) => { r.style.width = `${m.R * 2}px`; r.style.marginLeft = `${-m.R}px` })
      }

      // the walk, 0 at the first window to 1 past the last
      const cam = { p: 0 }
      let shown = -1
      const render = () => {
        const { D, X } = m
        const c = cam.p * (n - 1 + TAIL) * D
        arches.forEach((a, i) => {
          const z = c - i * D
          // ahead: drifts to its side of the hall and turns to face the walk; passed: lifts overhead
          const k = sstep(0, D, -z)
          // on a phone the hall winds left and right; on a wide screen, where it ends at the right
          // margin, it winds back into the open room on the left
          const side = m.phone ? (i % 2 ? 1 : -1) : i % 2 ? -1 : -0.4
          const x = side * X * k
          const y = z > 0 ? -z * 0.75 : 0
          const zz = Math.min(z, D * 0.7)
          let op = z > 0 ? 1 - sstep(D * 0.1, D * 0.55, z) : 1 - sstep(D * 2.3, D * 3.2, -z)
          op *= 1 - 0.4 * sstep(D * 0.3, D * 2.6, -z)
          a.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${zz.toFixed(1)}px) rotateY(${(-side * 20 * k).toFixed(2)}deg)`
          a.style.opacity = op.toFixed(3)
          a.style.visibility = op < 0.01 ? 'hidden' : 'visible'
          const front = Math.abs(z) < D * 0.35
          if (front !== a.classList.contains('is-front')) { a.classList.toggle('is-front', front); a.tabIndex = front ? 0 : -1 }
        })
        // the floor's lines come towards you as you walk
        const off = ((c % m.S) + m.S) % m.S
        rungs.forEach((r, k) => {
          const z = off - (k + 1) * m.S
          r.style.transform = `translate3d(0, ${m.F}px, ${z.toFixed(1)}px)`
          r.style.opacity = (0.9 * (1 - sstep(0, m.S * rungs.length, -z)) * (1 - sstep(-m.S * 0.6, 0, z))).toFixed(3)
        })
        // the light at the end of the hall grows as you near it, then opens into the next room
        const p = Math.min(1, c / ((n - 1) * D))
        const end = sstep(n - 1, n - 1 + TAIL, c / D)
        light.style.transform = `translate(-50%, -50%) scale(${(0.8 + p * 0.5 + end * 9).toFixed(3)})`
        light.style.opacity = (0.45 + p * 0.4 + end * 0.15).toFixed(3)
        wash.style.opacity = sstep(0.45, 1, end).toFixed(3)
        fill.style.transform = `scaleX(${p.toFixed(4)})`
        const i = Math.min(n - 1, Math.max(0, Math.round(c / D)))
        if (i !== shown) { shown = i; setActive(i) }
      }

      measure()
      render()
      const tween = gsap.to(cam, {
        p: 1,
        ease: 'none',
        onUpdate: render,
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: touch ? 'bottom bottom' : `+=${(n - 1 + TAIL) * 85}%`,
          pin: !touch && q('.ar__stage')[0],
          scrub: touch ? 0.35 : 0.7,
          // with a wheel the walk comes to rest in front of a window; a finger's own momentum is left alone
          ...(touch ? {} : { snap: { snapTo: [...works.map((_, i) => i / (n - 1 + TAIL)), 1], duration: { min: 0.4, max: 1 }, delay: 0.15, ease: 'power2.inOut' } }),
          invalidateOnRefresh: true,
          onRefresh: () => { measure(); render() },
        },
      })
      trigger.current = tween.scrollTrigger

      // on a desktop the hall sways a little with the pointer, as if you turned your head
      let off = () => {}
      if (!touch && !low()) {
        const ry = gsap.quickTo(sway, 'rotationY', { duration: 1.2, ease: 'power3.out' })
        const rx = gsap.quickTo(sway, 'rotationX', { duration: 1.2, ease: 'power3.out' })
        const move = (e) => { ry((e.clientX / window.innerWidth - 0.5) * 6); rx((e.clientY / window.innerHeight - 0.5) * -4) }
        window.addEventListener('pointermove', move, { passive: true })
        off = () => window.removeEventListener('pointermove', move)
      }
      return () => { off(); trigger.current = null }
    },
    { scope: root },
  )

  // the stops along the bottom walk you to a window
  const jump = (i) => {
    const st = trigger.current
    if (!st) return
    scrollTo(st.start + ((st.end - st.start) * i) / (n - 1 + TAIL))
  }

  const w = works[active]
  return (
    <section className="ar" ref={root} style={{ '--run': Math.round((n - 1 + TAIL) * 85 + 100) }} data-theme="ivory" data-chapter="Recent works" id="work" aria-label="Recent works">
      <div className="ar__stage">
        <header className="ar__head wrap">
          <Kicker n="01" label="Client sites" />
          <div className="ar__headrow">
            <h2 className="ar__title">Recent <em>works</em><Count n={n} /></h2>
            <span className="ar__count" aria-hidden="true"><b>{two(active + 1)}</b> / {two(n)}</span>
          </div>
        </header>

        <div className="ar__world">
          <i className="ar__light" aria-hidden="true" />
          <div className="ar__sway">
            <div className="ar__hall">
              <i className="ar__rail" aria-hidden="true" />
              <i className="ar__rail" aria-hidden="true" />
              {Array.from({ length: low() ? 6 : 10 }, (_, k) => <i className="ar__rung" aria-hidden="true" key={k} />)}
              {works.map((x, i) => (
                <TLink key={x.slug} to={`/work/${x.slug}`} label={x.title} zoom className={`ar__arch ${i === 0 ? 'is-front' : ''}`} tabIndex={i === 0 ? 0 : -1} aria-label={`${x.title}: view the case`}>
                  <span className="ar__mould" aria-hidden="true" />
                  <span className="ar__frame">
                    <span className="ar__lunette"><Fan /></span>
                    <span className="ar__pane media">
                      <img src={small(x.image)} srcSet={srcSet(x.image)} sizes="(max-width: 899px) 90vw, 56vw" alt={`${x.title} website`} width={x.w} height={x.h} decoding="async" />
                    </span>
                  </span>
                  <span className="ar__plate" aria-hidden="true"><b>{two(i + 1)}</b>{x.title}</span>
                </TLink>
              ))}
            </div>
          </div>
          <i className="ar__wash" aria-hidden="true" />
        </div>

        <div className="ar__copy" key={w.slug} aria-live="polite">
          <span className="ar__no">{two(active + 1)} · {w.field}</span>
          <h3 className="ar__name">{w.title}</h3>
          <p className="ar__line">{w.line}</p>
          <div className="ar__links">
            <TLink to={`/work/${w.slug}`} label={w.title} className="ar__case">View the case <Icon name="arrowRight" size={14} /></TLink>
            <a href={w.url} target="_blank" rel="noopener noreferrer" className="ar__visit">{host(w.url)} <Icon name="arrowUpRight" size={14} /></a>
          </div>
          <span className={`status status--${w.status === 'Live' ? 'live' : 'wip'}`}><i />{w.status}</span>
        </div>

        <nav className="ar__stops wrap" aria-label="Recent works">
          <span className="ar__track" aria-hidden="true"><i className="ar__fill" /></span>
          <ol>
            {works.map((x, i) => (
              <li key={x.slug}>
                <button type="button" className={i === active ? 'is-on' : ''} aria-current={i === active ? 'true' : undefined} onClick={() => jump(i)}>
                  <small>{two(i + 1)}</small>{x.short || x.title}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  )
}
