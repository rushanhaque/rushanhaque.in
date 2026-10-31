import { useRef } from 'react'
import { gsap, SplitText, useGSAP, reduced } from '../lib/gsap'

/**
 * A line of narration between two chapters. It is read as you scroll: each word brightens in
 * turn, the way the previous portfolio's journey introduction did.
 */
export function Bridge({ children, theme = 'ivory' }) {
  const root = useRef(null)
  useGSAP(
    () => {
      if (reduced()) return
      const split = SplitText.create(root.current.querySelector('.bridge__line'), { type: 'words', aria: 'none' })
      gsap.fromTo(split.words, { opacity: 0.14 }, { opacity: 1, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 82%', end: 'bottom 58%', scrub: 0.3 } })
      gsap.fromTo(root.current.querySelector('.bridge__cord'), { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 90%', end: 'top 50%', scrub: 0.3 } })
      return () => split.revert()
    },
    { scope: root },
  )
  return (
    <section className="bridge" ref={root} data-theme={theme}>
      <div className="wrap">
        <i className="bridge__cord" aria-hidden="true" />
        <p className="bridge__line">{children}</p>
      </div>
    </section>
  )
}
