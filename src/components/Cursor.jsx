import { useEffect, useRef, useState } from 'react'
import { device } from '../lib/device'
import { follow } from '../lib/motion'
import { useRoute } from '../lib/router'

// The pointer stays the visitor's own. Over a picture, a small label beside it says what a click will do.
export default function Cursor() {
  const root = useRef(null)
  const [label, setLabel] = useState('')
  const said = useRef('')
  const { path } = useRoute()

  useEffect(() => {
    const d = device()
    if (!d.fine || d.reduced) return undefined
    const el = root.current
    const p = { x: -100, y: -100 }
    const write = () => { el.style.transform = `translate3d(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px,0)` }
    const fx = follow(p, 'x', { duration: 0.35, onUpdate: write })
    const fy = follow(p, 'y', { duration: 0.35, onUpdate: write })
    const move = (e) => {
      fx(e.clientX)
      fy(e.clientY)
      const next = e.target.closest?.('[data-cursor]')?.dataset.cursor || ''
      if (next !== said.current) {
        said.current = next
        el.classList.toggle('is-on', !!next)
        if (next) setLabel(next)
      }
    }
    addEventListener('pointermove', move, { passive: true })
    return () => { removeEventListener('pointermove', move); fx.stop(); fy.stop() }
  }, [])

  useEffect(() => { said.current = ''; root.current?.classList.remove('is-on') }, [path])
  return <div className="cursor" ref={root} aria-hidden="true"><span>{label}</span></div>
}
