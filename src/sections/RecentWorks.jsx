import { Fragment, useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, reduced, isTouch } from '../lib/gsap'
import { small, srcSet } from '../lib/img'
import { works } from '../data/content'
import { TLink } from '../components/Transition'
import Head from '../components/Head'
import Icon from '../components/Icon'

const two = (n) => String(n).padStart(2, '0')
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' } }
const clamp = (v) => Math.min(1, Math.max(0, v))

/**
 * 01 — Recent works, as a deck of cases. Each site is a large dark card: the home page edge to
 * edge, and a bar beneath with its number, field, name, year and the ways in. On wide screens
 * the cards are held in a stack as you scroll: the next one rises over the last, which recedes
 * and dims, so a sliver of every case read so far stays at the top. A card settles its picture
 * and lifts its name in as it arrives. On phones (and with reduced motion) the cards simply
 * follow one another down the page; nothing is held, so nothing can shake.
 */
export default function RecentWorks() {
  const root = useRef(null)
  const n = works.length

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const items = q('.rw__item')
      const cards = q('.rw__card')
      const mm = gsap.matchMedia()

      // every card names itself as it comes into view, on every screen
      const arrive = ScrollTrigger.batch(cards, { start: 'top 82%', onEnter: (b) => b.forEach((c) => c.classList.add('is-in')) })

      mm.add('(min-width: 900px) and (hover: hover) and (prefers-reduced-motion: no-preference)', () => {
        const imgs = cards.map((c) => c.querySelector('.rw__media img'))
        const shades = cards.map((c) => c.querySelector('.rw__shade'))
        // where each card stops, and where it would be without stopping (heights are not moved by sticking)
        let stops = []
        let tops = []
        const measure = () => {
          let y = 0
          tops = items.map((li) => { y += parseFloat(getComputedStyle(li).marginTop) || 0; const t = y; y += li.offsetHeight; return t })
          stops = items.map((li) => parseFloat(getComputedStyle(li).top) || 0)
        }
        const list = q('.rw__list')[0]
        const update = () => {
          const vh = window.innerHeight
          const top = list.getBoundingClientRect().top
          cards.forEach((c, i) => {
            // as it arrives, the picture settles from a slight drift
            const k = clamp((vh - (top + tops[i])) / Math.max(1, vh - stops[i]))
            imgs[i].style.transform = `translate3d(0, ${((1 - k) * 7).toFixed(2)}%, 0) scale(${(1.08 - k * 0.08).toFixed(4)})`
            // as the next one covers it, it steps back and dims
            const cover = i + 1 < n ? clamp((vh - (top + tops[i + 1])) / Math.max(1, vh - stops[i + 1])) : 0
            c.style.transform = `scale(${(1 - cover * 0.06).toFixed(4)})`
            shades[i].style.opacity = (cover * 0.62).toFixed(3)
          })
        }
        measure()
        update()
        const st = ScrollTrigger.create({ trigger: list, start: 'top bottom', end: 'bottom top', onUpdate: update, onRefresh: () => { measure(); update() } })
        return () => {
          st.kill()
          cards.forEach((c, i) => { c.style.transform = ''; imgs[i].style.transform = ''; shades[i].style.opacity = '' })
        }
      })

      // on a desktop a round "View case" follows the pointer over a picture
      let off = () => {}
      if (!isTouch() && !reduced()) {
        const badge = q('.rw__badge')[0]
        const x = gsap.quickTo(badge, 'x', { duration: 0.5, ease: 'power3.out' })
        const y = gsap.quickTo(badge, 'y', { duration: 0.5, ease: 'power3.out' })
        const move = (e) => { x(e.clientX); y(e.clientY) }
        const show = (e) => { gsap.set(badge, { x: e.clientX, y: e.clientY }); badge.classList.add('is-on') }
        const hide = () => badge.classList.remove('is-on')
        const media = q('.rw__media')
        media.forEach((m) => { m.addEventListener('pointerenter', show); m.addEventListener('pointermove', move); m.addEventListener('pointerleave', hide) })
        window.addEventListener('scroll', hide, { passive: true })
        off = () => {
          media.forEach((m) => { m.removeEventListener('pointerenter', show); m.removeEventListener('pointermove', move); m.removeEventListener('pointerleave', hide) })
          window.removeEventListener('scroll', hide)
        }
      }
      return () => { off(); arrive.forEach((t) => t.kill()); mm.revert() }
    },
    { scope: root },
  )

  return (
    <section className="rw sec" ref={root} data-theme="ivory" data-chapter="Recent works" id="work" aria-label="Recent works">
      <div className="wrap">
        <Head n="01" label="Client sites" title={<>Recent <em>works</em></>} count={n} lede="Websites for makers and businesses, each designed and built from the first conversation to launch." />
        <ol className="rw__list">
          {works.map((w, i) => (
            <li className="rw__item" key={w.slug} style={{ '--i': i }}>
              <article className="rw__card">
                <TLink to={`/work/${w.slug}`} label={w.title} zoom className="rw__media media" aria-label={`${w.title}: view the case`}>
                  <img src={small(w.image)} srcSet={srcSet(w.image)} sizes="(max-width: 899px) 92vw, 90vw" alt={`${w.title} website`} width={w.w} height={w.h} loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />
                </TLink>
                <div className="rw__bar">
                  <div className="rw__meta">
                    <span className="rw__no">{two(i + 1)}<small> / {two(n)}</small></span>
                    <span className="rw__field">{w.field}</span>
                  </div>
                  <h3 className="rw__name" aria-label={w.title}>
                    {w.title.split(' ').map((word, k) => (
                      <Fragment key={k}>
                        {k > 0 && ' '}
                        <span className="rw__mask" aria-hidden="true"><span style={{ '--d': `${k * 70}ms` }}>{word}</span></span>
                      </Fragment>
                    ))}
                  </h3>
                  <p className="rw__line">{w.line}</p>
                  <div className="rw__facts">
                    <span>{w.year}</span>
                    <span className={`status status--${w.status === 'Live' ? 'live' : 'wip'}`}><i />{w.status}</span>
                  </div>
                  <div className="rw__links">
                    <TLink to={`/work/${w.slug}`} label={w.title} className="rw__case">View the case <Icon name="arrowRight" size={15} /></TLink>
                    <a href={w.url} target="_blank" rel="noopener noreferrer" className="rw__visit">{host(w.url)} <Icon name="arrowUpRight" size={15} /></a>
                  </div>
                </div>
                <i className="rw__shade" aria-hidden="true" />
              </article>
            </li>
          ))}
        </ol>
      </div>
      <span className="rw__badge" aria-hidden="true"><span>View<br />case</span></span>
    </section>
  )
}
