import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP, reduced } from '../lib/gsap'
import { scrollTo } from '../lib/lenis'
import { small, srcSet } from '../lib/img'
import { createShards, sample } from '../lib/shards'
import { low, tier } from '../lib/device'
import { works } from '../data/content'
import { TLink } from '../components/Transition'
import { Kicker, Count } from '../components/Head'
import Icon from '../components/Icon'

const two = (n) => String(n).padStart(2, '0')
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' } }

/**
 * 01 — Recent works. One card holds the stage. Scroll on and it breaks into glass shards that
 * lift, turn over and settle back as the next site, in a sweep from left to right. At rest the
 * card is the real screenshot; the particles only stand in while it changes. The scroll snaps
 * to each site, so a change never stops halfway.
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
      const bar = q('.rw__bar i')[0]
      const still = reduced()
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

      const frame = () => {
        const d = goal - shown
        if (Math.abs(d) > 0.0004) { shown += d * 0.085; dirty = true } else if (shown !== goal) { shown = goal; dirty = true }
        if (!dirty) return
        dirty = false
        const k = Math.min(Math.max(Math.floor(shown), 0), n - 2)
        // each change runs through the first three quarters of its stretch of scroll, so the
        // last quarter is already rest and a scroll that stops a little short still lands sharp
        const mix = Math.min(1, Math.max(0, (shown - k - 0.05) / 0.7))
        const near = Math.round(shown)
        if (near !== last) { last = near; setActive(near) }
        bar.style.transform = `scaleX(${shown / (n - 1)})`
        if (morph && colours) {
          if (k !== pair) { pair = k; morph.setPair(colours[k], colours[k + 1]) }
          // the particles are only a stand-in: as they settle, the real screenshot takes over
          // from them, so the card is never left showing the grains
          const handover = Math.min(1, Math.max(0, (mix - 0.8) / 0.17))
          imgs.forEach((_, i) => setOpacity(i, i === k ? 1 - Math.min(1, mix / 0.04) : i === k + 1 ? handover : 0))
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

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: () => `+=${(n - 1) * 80 + 30}%`,
        pin: true,
        scrub: true,
        snap: { snapTo: 1 / (n - 1), duration: { min: 0.35, max: 0.9 }, delay: 0.1, ease: 'power2.inOut' },
        invalidateOnRefresh: true,
        onUpdate: (s) => { goal = s.progress * (n - 1) },
        onRefresh: layout,
      })
      // development only: hold the morph at any point to inspect it
      if (import.meta.env.DEV) root.current.__hold = (v) => { goal = v; shown = v; dirty = true }
      root.current.__go = (i) => scrollTo(st.start + ((st.end - st.start) * i) / (n - 1), { duration: 1.4 })

      // the pictures are sampled into particles once the section is close
      const phone = window.innerWidth < 900
      const cols = (phone ? 170 : 300) * (tier() === 'mid' ? 0.75 : 1) | 0
      const rows = Math.round(cols / (1600 / 773))
      let alive = true
      const prep = ScrollTrigger.create({
        trigger: root.current, start: 'top 250%', once: true,
        onEnter: async () => {
          // an entry-level phone keeps the plain crossfade
          if (low()) return
          const pics = await Promise.all(works.map((w) => new Promise((res) => {
            const im = new Image()
            im.decoding = 'async'
            im.onload = () => res(im)
            im.onerror = () => res(null)
            im.src = small(w.image)
          })))
          if (!alive || pics.some((p) => !p)) return
          morph = createShards(canvas, { cols, rows, shard: phone ? 10 : 12 })
          if (!morph) return
          colours = pics.map((p) => sample(p, cols, rows))
          layout()
        },
      })

      gsap.ticker.add(frame)
      const ro = new ResizeObserver(layout)
      ro.observe(card)
      return () => {
        alive = false
        gsap.ticker.remove(frame)
        ro.disconnect()
        st.kill()
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

  const go = (i) => (reduced() ? setActive(i) : root.current.__go?.(i))
  const w = works[active]
  return (
    <section className="rw" ref={root} data-theme="ivory" data-chapter="Recent works" id="work" aria-label="Recent works">
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

        <footer className="rw__foot wrap">
          <ol className="rw__tabs">
            {works.map((x, i) => (
              <li key={x.slug}>
                <button type="button" className={i === active ? 'is-on' : ''} aria-current={i === active ? 'true' : undefined} onClick={() => go(i)}>
                  <small>{two(i + 1)}</small>{x.short || x.title}
                </button>
              </li>
            ))}
          </ol>
          <span className="rw__bar" aria-hidden="true"><i /></span>
        </footer>
      </div>
    </section>
  )
}
