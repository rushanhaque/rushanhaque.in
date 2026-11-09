import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from '../lib/gsap'
import { device } from '../lib/device'

// The pointer stays the visitor's own. Over a picture, a small label beside it says what a click will do.
export default function Cursor() {
  const root = useRef(null)
  const [label, setLabel] = useState('')
  const said = useRef('')
  const { pathname } = useLocation()

  useEffect(() => {
    if (device().touch) return
    const x = gsap.quickTo(root.current, 'x', { duration: 0.35, ease: 'power3.out' })
    const y = gsap.quickTo(root.current, 'y', { duration: 0.35, ease: 'power3.out' })
    const move = (e) => {
      x(e.clientX)
      y(e.clientY)
      const next = e.target.closest?.('[data-cursor]')?.dataset.cursor || ''
      if (next !== said.current) {
        said.current = next
        root.current.classList.toggle('is-on', !!next)
        if (next) setLabel(next)
      }
    }
    addEventListener('pointermove', move, { passive: true })
    return () => removeEventListener('pointermove', move)
  }, [])

  // a new page: what the label was offering is gone
  useEffect(() => {
    said.current = ''
    root.current?.classList.remove('is-on')
  }, [pathname])

  return <div className="cursor" ref={root} aria-hidden="true"><span>{label}</span></div>
}
