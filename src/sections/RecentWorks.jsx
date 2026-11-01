import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP, reduced, isTouch } from '../lib/gsap'
import { small, srcSet } from '../lib/img'
import { createParticles, sample } from '../lib/particles'
import { tier } from '../lib/device'
import { setNormalize } from '../lib/lenis'
import { works } from '../data/content'
import { TLink } from '../components/Transition'
import { Kicker, Count } from '../components/Head'
import Icon from '../components/Icon'

const two = (n) => String(n).padStart(2, '0')
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' } }

/**
 * 01 — Recent works. One card holds the stage. Scroll on and it pours apart into particles,
 * as the "Why Axiom" field does: every grain of the picture sets off at its own moment, swirls
 * on a current and settles into its place in the next site (lib/particles.js). At rest the
 * card is the real screenshot; the particles only stand in while it changes. The scroll only
 * chooses the site; each change plays out whole in its own time.
 */
export default function RecentWorks() {
  const root = useRef(null)
  const [active, setActive] = useState(0)
  const n = works.length

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const imgs = q('.rw__img')
      const canvas = q('.rw__gl')[0]
      const card = q('.rw__card')[0]
      const still = reduced()
      const touch = isTouch()
      let goal = 0
      let shown = 0
      let pair = -1
      let last = -1
      let dirty = true
      let morph = null
      let colours = null
      const opacity = imgs.map(() => -1)

      const setOpacity = (i, v) => {
        const o = Math.round(v * 1000) / 1000
        if (o !== opacity[i]) { opacity[i] = o; imgs[i].style.opacity = o }
      }

      const layout = () => {
        if (!morph) return
        const a = canvas.getBoundingClientRect()
        const b = card.getBoundingClientRect()
        morph.layout({ x: b.left - a.left, y: b.top - a.top, w: b.width, h: b.height }, { left: window.innerWidth < 900 ? 1 : 0.3 })
        dirty = true
      }

      // The scroll only chooses the site; the change then plays out whole, in its own time, so
      // the card is always seen breaking apart and settling as the next one however fast you go.
      // Skipping several sites at once runs through each of them, a little quicker.
      const pos = { v: 0 }
      const go = (to) => {
        if (to === goal) return
        goal = to
        const steps = Math.abs(goal - pos.v)
        gsap.to(pos, { v: goal, duration: Math.min(3, 1.9 + (steps - 1) * 0.6), ease: steps > 1.2 ? 'none' : 'sine.inOut', overwrite: true, onUpdate: () => { shown = pos.v; dirty = true } })
      }

      const frame = () => {
        if (!dirty) return
        dirty = false
        const k = Math.min(Math.max(Math.floor(shown), 0), n - 2)
        const mix = Math.min(1, Math.max(0, (shown - k) / 0.94))
        const near = Math.round(shown)
        if (near !== last) { last = near; setActive(near) }
        if (morph && colours) {
          if (k !== pair) { pair = k; morph.setPair(colours[k], colours[k + 1]) }
          // the particles are only a stand-in: the old screenshot gives way to them as they set
          // off, the new one comes up underneath while they land (so the last grains settle
          // onto the picture, not over gaps), and the grains go once the last are home
          const under = Math.min(1, Math.max(0, (mix - 0.62) / 0.3))
          const handover = Math.min(1, Math.max(0, (mix - 0.93) / 0.07))
          imgs.forEach((_, i) => setOpacity(i, i === k ? 1 - Math.min(1, mix / 0.1) : i === k + 1 ? under * under * (3 - 2 * under) : 0))
          const live = mix > 0 && handover < 1
          canvas.style.opacity = live ? (1 - handover).toFixed(3) : 0
          if (live) morph.draw(mix)
        } else {
          // no WebGL (or not loaded yet): a plain crossfade
          imgs.forEach((_, i) => setOpacity(i, i === k ? 1 - mix : i === k + 1 ? mix : 0))
        }
      }

      if (still) {
        imgs.forEach((im, i) => (im.style.opacity = i === 0 ? 1 : 0))
        return
      }

      // touch only, set up below: one site per swipe
      let engage = null
      let hold = null
      let glide = null
      // on touch the stage is held by CSS (sticky, the section made tall enough, see .rw) since a
      // pin set from script lands a frame behind the phone's own scrolling and jolts
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: touch ? 'bottom bottom' : () => `+=${(n - 1) * 80 + 30}%`,
        pin: !touch,
        scrub: true,
        // a phone's momentum scroll and a snap pull against each other; there the scroll only
        // chooses the site, and each change plays through in time on its own
        ...(touch ? {} : { snap: { snapTo: 1 / (n - 1), duration: { min: 0.35, max: 0.9 }, delay: 0.1, ease: 'power2.inOut' } }),
        invalidateOnRefresh: true,
        onUpdate: (s) => go(Math.round(s.progress * (n - 1))),
        onToggle: (s) => { if (s.isActive) engage?.(s.direction) },
        onRefresh: layout,
      })

      // On touch a swipe moves exactly one site. A flick's momentum would otherwise carry the
      // scroll past two or three, so while the stage is held the page's own scrolling pauses
      // and each swipe glides to the next site's place; a swipe past the first or last lets go.
      if (touch) {
        const at = (i) => st.start + ((st.end - st.start) * i) / (n - 1)
        let idx = 0
        let swiped = false
        let leaving = false
        const to = (y, done) => {
          glide?.kill()
          const sy = { y: window.scrollY }
          glide = gsap.to(sy, { y, duration: 0.85, ease: 'power2.inOut', onUpdate: () => window.scrollTo(0, sy.y), onComplete: done })
        }
        const step = (d) => {
          const i = idx + d
          if (i >= 0 && i < n) { idx = i; to(at(i)); return }
          leaving = true
          hold.disable()
          setNormalize(true)
          to(d > 0 ? st.end + 2 : st.start - 2, () => { leaving = false })
        }
        hold = ScrollTrigger.observe({
          target: window, type: 'touch', preventDefault: true, tolerance: 12,
          onPress: () => { swiped = false },
          // a finger moving up scrolls the page on, to the next site
          onUp: () => { if (!swiped) { swiped = true; step(1) } },
          onDown: () => { if (!swiped) { swiped = true; step(-1) } },
        })
        hold.disable()
        engage = (dir) => {
          if (leaving || hold.isEnabled) return
          setNormalize(false)
          hold.enable()
          // the swipe that brought the stage in doesn't also move it on
          swiped = true
          idx = dir < 0 ? n - 1 : 0
          to(at(idx))
        }
      }
      // development only: hold the morph at any point to inspect it
      if (import.meta.env.DEV) root.current.__hold = (v) => { gsap.killTweensOf(pos); goal = Math.round(v); pos.v = shown = v; dirty = true }

      // the pictures are sampled into particles once the section is close
      const phone = window.innerWidth < 900
      // every device gets the grains: entry-level ones a lighter grid of larger grains
      const cols = (phone ? 110 : 170) * ({ high: 1, mid: 0.85, low: 0.7 }[tier()]) | 0
      const rows = Math.round(cols / (1600 / 773))
      let alive = true
      const prep = ScrollTrigger.create({
        trigger: root.current, start: 'top 250%', once: true,
        onEnter: async () => {
          const pics = await Promise.all(works.map((w) => new Promise((res) => {
            const im = new Image()
            im.decoding = 'async'
            im.onload = () => res(im)
            im.onerror = () => res(null)
            im.src = small(w.image)
          })))
          if (!alive || pics.some((p) => !p)) return
          morph = createParticles(canvas, { cols, rows })
          if (!morph) return
          colours = pics.map((p) => sample(p, cols, rows))
          layout()
        },
      })

      // if the GPU is taken back (a phone's tab in the background), fall back to the crossfade
      const lost = () => {
        morph = null
        canvas.style.opacity = 0
        dirty = true
      }
      canvas.addEventListener('webglcontextlost', lost)

      gsap.ticker.add(frame)
      const ro = new ResizeObserver(layout)
      ro.observe(card)
      return () => {
        canvas.removeEventListener('webglcontextlost', lost)
        alive = false
        gsap.ticker.remove(frame)
        gsap.killTweensOf(pos)
        ro.disconnect()
        st.kill()
        glide?.kill()
        if (hold?.isEnabled) setNormalize(true)
        hold?.kill()
        prep.kill()
        morph?.destroy()
      }
    },
    { scope: root },
  )

  // without motion, the tabs simply swap the picture
  useEffect(() => {
    if (!reduced()) return
    root.current.querySelectorAll('.rw__img').forEach((im, i) => (im.style.opacity = i === active ? 1 : 0))
  }, [active])

  const w = works[active]
  return (
    <section className="rw" ref={root} style={{ '--run': (n - 1) * 80 + 130 }} data-theme="ivory" data-chapter="Recent works" id="work" aria-label="Recent works">
      <div className="rw__pin">
        <header className="rw__head wrap">
          <Kicker n="01" label="Client sites" />
          <div className="rw__headrow">
            <h2 className="rw__title">Recent <em>works</em><Count n={n} /></h2>
            <span className="rw__count"><b>{two(active + 1)}</b> / {two(n)}</span>
          </div>
        </header>

        <div className="rw__stage wrap">
          <div className="rw__copy" key={w.slug} aria-live="polite">
            <span className="rw__no">{two(active + 1)} · {w.field}</span>
            <h3 className="rw__name">{w.title}</h3>
            <p className="rw__line">{w.line}</p>
            <div className="rw__links">
              <TLink to={`/work/${w.slug}`} label={w.title} className="rw__case">View the case <Icon name="arrowRight" size={14} /></TLink>
              <a href={w.url} target="_blank" rel="noopener noreferrer" className="rw__visit">{host(w.url)} <Icon name="arrowUpRight" size={14} /></a>
            </div>
            <span className={`status status--${w.status === 'Live' ? 'live' : 'wip'}`}><i />{w.status}</span>
          </div>

          <div className="rw__visual">
            <canvas className="rw__gl" aria-hidden="true" />
            <figure className="rw__fig">
            <TLink to={`/work/${w.slug}`} label={w.title} className="rw__card" aria-label={`${w.title}: view the case`}>
              {works.map((x, i) => (
                <img key={x.slug} className="rw__img" src={small(x.image)} srcSet={srcSet(x.image)} sizes="(max-width: 899px) 92vw, 70vw" alt={i === active ? `${x.title} website` : ''} width={x.w} height={x.h} loading={i < 2 ? 'eager' : 'lazy'} decoding="async" style={{ opacity: i === 0 ? 1 : 0 }} />
              ))}
            </TLink>
            <figcaption className="rw__cap" key={w.slug}><span>Fig. {two(active + 1)}</span> — Home page, {host(w.url)}</figcaption>
            </figure>
          </div>
        </div>

        {/* with reduced motion there is no scroll scene, so these are the way from site to site */}
        <ol className="rw__tabs wrap">
          {works.map((x, i) => (
            <li key={x.slug}>
              <button type="button" className={i === active ? 'is-on' : ''} aria-current={i === active ? 'true' : undefined} onClick={() => setActive(i)}>
                <small>{two(i + 1)}</small>{x.short || x.title}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
