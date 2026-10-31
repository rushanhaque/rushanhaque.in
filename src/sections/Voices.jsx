import { Fragment, useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, reduced } from '../lib/gsap'
import { reviews } from '../data/content'
import Head from '../components/Head'

// where each note is pinned: left %, top %, turn in degrees
const SPOTS = [[3, 6, -5], [28, 2, 3], [53, 8, -2], [77, 3, 5], [8, 48, 4], [33, 43, -4], [58, 51, 3], [81, 45, -6], [42, 71, 2]]
const EMOJI = /(\p{Extended_Pictographic}️?(?:\p{Emoji_Modifier})?)/u
const FINE = '(min-width: 900px) and (hover: hover) and (pointer: fine)'

// the client's words exactly as written; emoji set smaller so the serif carries the line
function Words({ text }) {
  return text.split(EMOJI).map((part, i) => (EMOJI.test(part) ? <span className="rev__emoji" key={i}>{part}</span> : <Fragment key={i}>{part}</Fragment>))
}

function Stars() {
  return (
    <span className="rev__stars" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => <svg key={i} viewBox="0 0 20 20"><path d="M10 1.6 12.6 7l5.9.7-4.4 4 1.2 5.8L10 14.6l-5.3 2.9 1.2-5.8-4.4-4L7.4 7z" /></svg>)}
    </span>
  )
}

/**
 * 07 — Reviews. Client notes pinned to a drawing board. On a desktop you can pick any note up
 * and throw it; on phones the notes sit in a row you swipe through.
 */
export default function Voices() {
  const root = useRef(null)
  const drags = useRef([])

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const notes = q('.rev__note')
      if (!reduced()) {
        gsap.from(notes, {
          y: 90, rotate: () => gsap.utils.random(-9, 9), autoAlpha: 0, duration: 1.1, ease: 'expo',
          stagger: { each: 0.07, from: 'random' }, clearProps: 'transform',
          scrollTrigger: { trigger: q('.rev__board')[0], start: 'top 78%', once: true },
        })
      }
      const mm = gsap.matchMedia()
      mm.add(FINE, () => {
        let alive = true
        let z = 10
        // Each note keeps its spot across the board and its turn, but drops below any note
        // already pinned above it that shares its width, so no two notes ever cover each other.
        const board = q('.rev__board')[0]
        const pin = () => {
          const bw = board.clientWidth
          const placed = []
          notes.forEach((n, i) => {
            const [x, y] = SPOTS[i % SPOTS.length]
            const left = (x / 100) * bw
            const w = n.offsetWidth
            const h = n.offsetHeight
            const nudge = (y % 10) * 3
            let top = 28 + nudge
            placed.forEach((p) => { if (left < p.left + p.w + 14 && p.left < left + w + 14) top = Math.max(top, p.top + p.h + 30 + nudge) })
            n.style.top = `${top}px`
            placed.push({ left, top, w, h })
          })
          board.style.height = `${Math.max(...placed.map((p) => p.top + p.h)) + 48}px`
        }
        pin()
        document.fonts?.ready.then(() => { if (alive) { pin(); ScrollTrigger.refresh() } })
        window.addEventListener('resize', pin)
        Promise.all([import('gsap/Draggable'), import('gsap/InertiaPlugin')]).then(([{ Draggable }, { InertiaPlugin }]) => {
          if (!alive) return
          gsap.registerPlugin(Draggable, InertiaPlugin)
          drags.current = Draggable.create(notes, {
            type: 'x,y', bounds: q('.rev__board')[0], inertia: true, edgeResistance: 0.75, zIndexBoost: false,
            onPress() {
              this.target.style.zIndex = ++z
              gsap.to(this.target, { scale: 1.05, boxShadow: '0 44px 60px -30px rgba(60, 30, 20, 0.5)', duration: 0.3, ease: 'power3.out' })
            },
            onRelease() {
              gsap.to(this.target, { scale: 1, boxShadow: '0 18px 40px -26px rgba(60, 30, 20, 0.42)', duration: 0.6, ease: 'power3.out' })
            },
          })
        })
        return () => {
          alive = false
          window.removeEventListener('resize', pin)
          notes.forEach((n) => (n.style.top = ''))
          board.style.height = ''
          drags.current.forEach((d) => d.kill())
          drags.current = []
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  // put every note back where it was pinned
  const tidy = () => {
    gsap.to(root.current.querySelectorAll('.rev__note'), { x: 0, y: 0, duration: 1, ease: 'expo', stagger: 0.03, onUpdate() { drags.current.forEach((d) => d.update()) } })
  }

  return (
    <section className="rev sec" ref={root} data-theme="ivory" data-chapter="Reviews" id="reviews">
      <div className="wrap">
        <Head
          n="07"
          label="Client words"
          title={<em>Reviews</em>} count={reviews.length}
          aside={(
            <p className="rev__score">
              <b>5.0</b>
              <span><Stars />{reviews.length} client reviews, every one five stars</span>
            </p>
          )}
        />
        <div className="rev__board">
          {reviews.map((r, i) => {
            const [x, y, rot] = SPOTS[i % SPOTS.length]
            return (
              <figure className="rev__note" key={r.name + i} style={{ '--x': `${x}%`, '--y': `${y}%`, '--r': `${rot}deg` }}>
                <span className="rev__pin" aria-hidden="true" />
                <blockquote><Words text={r.quote} /></blockquote>
                <figcaption>
                  <strong>{r.name}</strong>
                  <span>{[r.company, r.location].filter(Boolean).join(' · ')}</span>
                  <time>{r.date}</time>
                </figcaption>
              </figure>
            )
          })}
        </div>
        <div className="rev__foot">
          <p className="rev__hint"><span className="is-fine">Pick a note up and throw it.</span><span className="is-touch">Swipe through the notes</span></p>
          <button type="button" className="rev__tidy is-fine" onClick={tidy}>Pin them back</button>
        </div>
      </div>
    </section>
  )
}
