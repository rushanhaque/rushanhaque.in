import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { setTheme } from '../lib/theme'
import Button from '../components/Button'

/** 404 — an arch drawn in outline, with nothing built behind it yet. */
export default function NotFound() {
  const root = useRef(null)
  useGSAP(() => {
    setTheme('ivory')
    const q = gsap.utils.selector(root)
    gsap.timeline()
      .from(q('.nf__arch path'), { drawSVG: 0, duration: 2, stagger: 0.1, ease: 'silk' })
      .from(q('.nf__code span'), { yPercent: 120, stagger: 0.08, duration: 1.2 }, 0.4)
      .from(q('.nf__copy > *'), { y: 30, autoAlpha: 0, stagger: 0.08, duration: 1 }, 0.8)
  }, { scope: root })
  return (
    <section className="nf" ref={root}>
      <svg className="nf__arch" viewBox="0 0 300 420" fill="none" aria-hidden="true">
        <path d="M40 410 V170 A110 110 0 0 1 260 170 V410" />
        <path d="M60 410 V172 A90 90 0 0 1 240 172 V410" />
        <path d="M10 410 H290" />
        <path d="M150 40 V20 M138 30 H162" />
      </svg>
      <div className="nf__copy">
        <h1 className="nf__code" aria-label="404"><span>4</span><span>0</span><span>4</span></h1>
        <p>This room hasn’t been built yet.</p>
        <Button to="/" variant="solid">Back to the entrance</Button>
      </div>
    </section>
  )
}
