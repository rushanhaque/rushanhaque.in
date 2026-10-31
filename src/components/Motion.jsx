import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'

/** Mechanical digits — each column spins past 0–9 twice before landing. */
export function Odometer({ value, suffix = '', className = '' }) {
  const ref = useRef(null)
  const str = String(value)
  useGSAP(
    () => {
      gsap.fromTo(ref.current.querySelectorAll('.odo__col'), { yPercent: 0 }, {
        yPercent: (i, el) => -((+el.dataset.target + 20) / 30) * 100,
        duration: 2.4, stagger: 0.12, ease: 'expo',
        scrollTrigger: { trigger: ref.current, start: 'top 92%', once: true },
      })
    },
    { scope: ref },
  )
  return (
    <span className={`odo ${className}`} ref={ref}>
      <span className="sr-only">{value}{suffix}</span>
      {str.split('').map((ch, i) =>
        /\d/.test(ch) ? (
          <span className="odo__digit" key={i} aria-hidden="true">
            <span className="odo__col" data-target={ch}>{Array.from({ length: 30 }, (_, k) => <span key={k}>{k % 10}</span>)}</span>
          </span>
        ) : (
          <span className="odo__static" key={i} aria-hidden="true">{ch}</span>
        ),
      )}
      {suffix && <span className="odo__suffix" aria-hidden="true">{suffix}</span>}
    </span>
  )
}
