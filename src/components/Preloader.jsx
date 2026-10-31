import { useRef } from 'react'
import { gsap, useGSAP, reduced } from '../lib/gsap'
import { stopScroll, startScroll } from '../lib/lenis'
import { low } from '../lib/device'

const ARCHES = [120, 220, 320, 420, 520]
const uncover = (p, c) => `M0 0 L100 0 L100 ${100 - p} Q50 ${100 - p - c} 0 ${100 - p} Z`

/**
 * A loggia draws itself in a single stroke and the page rises through an arched curtain.
 * About two seconds on a first visit to the home page; a quick fade on every other arrival.
 */
export default function Preloader({ onReady, onFinish }) {
  const root = useRef(null)

  useGSAP(
    () => {
      stopScroll()
      const q = gsap.utils.selector(root)
      const curtain = q('.pre__curtain path')[0]
      let seen = false
      try {
        seen = sessionStorage.getItem('rh:intro') === '1'
        sessionStorage.setItem('rh:intro', '1')
      } catch {
        /* storage unavailable */
      }
      const done = () => { startScroll(); onFinish() }
      // the full entrance belongs to the home page; anyone arriving deeper (often from a search),
      // or on an entry-level phone, goes straight to the page
      if (seen || reduced() || low() || window.location.pathname !== '/') {
        // the page is already on screen (pre-rendered), so step aside before the first paint
        gsap.set(root.current, { autoAlpha: 0 })
        onReady()
        done()
        return
      }
      const s = { p: 0 }
      gsap.timeline({ onComplete: done })
        .from(q('.pre__draw'), { drawSVG: 0, duration: 1.05, stagger: 0.02, ease: 'silk' }, 0)
        .from(q('.pre__name'), { yPercent: 110, duration: 0.9 }, 0.2)
        .to(q('.pre__name'), { yPercent: -110, duration: 0.45, ease: 'expo.in' }, 1.15)
        .to(q('.pre__svg'), { autoAlpha: 0, y: -20, duration: 0.4, ease: 'power2.in' }, 1.15)
        .set(q('.pre__curtain'), { autoAlpha: 1 }, 1.5)
        .set(root.current, { backgroundColor: 'transparent' }, 1.5)
        .call(onReady, [], 1.5)
        .to(s, { p: 100, duration: 0.95, ease: 'power3.inOut', onUpdate: () => curtain.setAttribute('d', uncover(s.p, Math.sin((s.p / 100) * Math.PI) * 30)) }, 1.5)
    },
    { scope: root },
  )

  return (
    <div className="pre" ref={root} aria-hidden="true">
      <div className="pre__stage">
        <svg className="pre__svg" viewBox="0 0 640 320" fill="none">
          <path className="pre__draw" d="M24 74 H616 M40 98 H600" />
          {ARCHES.map((cx) => <path key={cx} className="pre__draw" d={`M${cx - 34} 270 V170 A34 34 0 0 1 ${cx + 34} 170 V270`} />)}
          <path className="pre__draw" d="M28 270 H612 M20 290 H620" />
        </svg>
        <span className="pre__mask"><span className="pre__name">Rushan Haque</span></span>
      </div>
      <svg className="pre__curtain" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 0 L100 0 L100 100 L0 100 Z" />
      </svg>
    </div>
  )
}
