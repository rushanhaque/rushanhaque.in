import { useEffect, useRef, useState } from 'react'
import { director, onChapter } from '../lib/director'
import { scrollTo } from '../lib/scroll'

// Where you are on the page, in the middle of the bar. Open it and every section is listed. It only appears on
// the home page, where there are sections to move between.
export default function Sundial() {
  const [open, setOpen] = useState(false)
  const [rooms, setRooms] = useState([])
  const [current, setCurrent] = useState('')
  const [name, setName] = useState('')
  const [away, setAway] = useState(true)
  const root = useRef(null)

  useEffect(() => onChapter((c) => {
    setCurrent(c.id)
    setName(c.name || '')
    setAway(!!c.hidden || c.id === 'threshold')
    setRooms(director.chapters.filter((k) => k.name && !k.hidden).map((k) => ({ id: k.id, name: k.name })))
  }), [])

  useEffect(() => {
    if (!open) return undefined
    const close = (e) => { if (!root.current?.contains(e.target)) setOpen(false) }
    const key = (e) => e.key === 'Escape' && setOpen(false)
    addEventListener('pointerdown', close)
    addEventListener('keydown', key)
    return () => { removeEventListener('pointerdown', close); removeEventListener('keydown', key) }
  }, [open])

  return (
    <div className={`dial ${open ? 'is-open' : ''} ${away || rooms.length < 2 ? 'is-away' : ''}`} ref={root}>
      <button type="button" className="dial__face" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={`Current section: ${name}. Show all sections`} tabIndex={away ? -1 : 0}>
        <i aria-hidden="true" />
        <span className="dial__name"><span key={name}>{name}</span></span>
        <svg width="9" height="6" viewBox="0 0 9 6" aria-hidden="true"><path d="M.5 1 4.5 5l4-4" fill="none" stroke="currentColor" /></svg>
      </button>
      <div className="dial__list" aria-hidden={!open} inert={!open}>
        <ul>
          {rooms.map((r) => (
            <li key={r.id} className={r.id === current ? 'is-on' : ''}>
              <button type="button" onClick={() => { setOpen(false); scrollTo(director.jumpY(r.id) + 2) }}>{r.name}</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
