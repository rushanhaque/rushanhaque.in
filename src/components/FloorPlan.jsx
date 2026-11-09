import { useEffect, useRef } from 'react'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import { gsap } from '../lib/gsap'
import { ItemLink, picture } from './WorkGrid'

gsap.registerPlugin(Draggable, InertiaPlugin)

// The floor plan: the work laid out on one floor that you can drag around, with a little weight to it.
// It only loads for someone who asks for it.
export default function FloorPlan({ items }) {
  const frame = useRef(null)
  const floor = useRef(null)
  const moved = useRef(false)

  useEffect(() => {
    const el = floor.current
    const fr = frame.current
    const bounds = () => ({ minX: Math.min(0, fr.clientWidth - el.offsetWidth), maxX: 0, minY: Math.min(0, fr.clientHeight - el.offsetHeight), maxY: 0 })
    gsap.set(el, { x: 0, y: 0 })
    const [drag] = Draggable.create(el, {
      type: 'x,y',
      inertia: true,
      bounds: bounds(),
      edgeResistance: 0.82,
      dragClickables: true,
      minimumMovement: 5,
      onPress() { moved.current = false },
      onDragStart() { moved.current = true; fr.classList.add('is-drag') },
      onDragEnd() { fr.classList.remove('is-drag') },
    })
    // a drag that ends on a tile is not a click on it
    const click = (e) => {
      if (moved.current) { e.preventDefault(); e.stopPropagation() }
    }
    fr.addEventListener('click', click, true)
    // tabbing to a tile walks the floor over to it
    const focus = (e) => {
      const t = e.target.closest('.tile')
      if (!t) return
      fr.scrollTop = 0
      fr.scrollLeft = 0
      const b = bounds()
      const x = gsap.utils.clamp(b.minX, b.maxX, fr.clientWidth / 2 - t.offsetLeft - t.offsetWidth / 2)
      const y = gsap.utils.clamp(b.minY, b.maxY, fr.clientHeight / 2 - t.offsetTop - t.offsetHeight / 2)
      gsap.to(el, { x, y, duration: 0.9, ease: 'power3.out', overwrite: 'auto', onUpdate: () => drag.update() })
    }
    fr.addEventListener('focusin', focus)
    const resize = () => { drag.applyBounds(bounds()) }
    addEventListener('resize', resize)
    gsap.fromTo(el.querySelectorAll('.tile'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.2, stagger: { amount: 0.4, from: 'center', grid: 'auto' }, ease: 'expo.out', delay: 0.1 })
    return () => {
      drag.kill()
      gsap.killTweensOf(el)
      fr.removeEventListener('click', click, true)
      fr.removeEventListener('focusin', focus)
      removeEventListener('resize', resize)
    }
  }, [items])

  return (
    <div className="plan" ref={frame} data-cursor="Drag">
      <p className="plan__hint note" aria-hidden="true">Drag to move around</p>
      <ul className="plan__floor" ref={floor}>
        {items.map((it, i) => (
          <li className={`tile tile--${i % 3}`} key={it.key}>
            <ItemLink it={it} className="tile__in" data-cursor={it.to ? 'View' : 'Open'} draggable="false">
              <span className={`tile__pic ${it.thumb ? 'is-thumb' : ''}`} style={it.thumb ? undefined : { aspectRatio: `${it.w} / ${it.h}` }}>
                {it.image
                  ? <img {...picture(it, '420px')} alt="" loading="lazy" decoding="async" draggable="false" />
                  : <span className="card__type pillar" aria-hidden="true">{it.title}</span>}
              </span>
              <span className="tile__cap">
                <b>{it.title}</b>
                <span className="note">{it.sub}</span>
              </span>
            </ItemLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
