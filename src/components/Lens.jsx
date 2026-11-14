import { useEffect, useRef } from 'react'
import { device } from '../lib/device'
import { follow, tween, killTweensOf, ease } from '../lib/motion'
import { small, srcSet } from '../lib/img'

// The finished site, with the drawing it began as underneath. With a mouse, a brass line follows the pointer across
// the picture: everything to its left is the drawing, everything to its right is the site, so you can sweep between
// the two. On a phone the line crosses once by itself each time the picture comes into view.
export default function Lens({ image, plan, width, height, alt, sizes = '(max-width: 760px) 92vw, 46vw', className = '' }) {
  const root = useRef(null)
  useEffect(() => {
    const el = root.current
    const d = device()
    const s = { x: 0 }
    const write = () => el.style.setProperty('--lx', `${(s.x * 100).toFixed(2)}%`)
    write()
    if (d.reduced) return undefined
    let to = null
    const go = (x) => { to ??= follow(s, 'x', { duration: 0.55, onUpdate: write }); to(Math.max(0, Math.min(1, x))) }
    const at = (e) => { const r = el.getBoundingClientRect(); return (e.clientX - r.left) / r.width }
    const move = (e) => { if (e.pointerType === 'mouse') go(at(e)) }
    const enter = (e) => { if (e.pointerType !== 'mouse') return; killTweensOf(s); el.classList.add('is-on'); go(at(e)) }
    const leave = (e) => {
      if (e.pointerType !== 'mouse') return
      el.classList.remove('is-on')
      to?.stop(); to = null
      tween(s, { x: 0 }, { duration: 0.8, ease: ease.expoOut, onUpdate: write })
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    let io = null
    if (d.touch) {
      io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return
        killTweensOf(s)
        el.classList.add('is-on')
        tween(s, { x: 0.62 }, {
          duration: 1.6, ease: ease.power2InOut, onUpdate: write,
          onComplete: () => tween(s, { x: 0 }, { duration: 1.3, delay: 0.6, ease: ease.power2InOut, onUpdate: write, onComplete: () => el.classList.remove('is-on') }),
        })
      }, { threshold: 0.6 })
      io.observe(el)
    }
    return () => {
      io?.disconnect()
      killTweensOf(s)
      to?.stop()
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
    }
  }, [])
  return (
    <div className={`lens ${className}`} ref={root} style={{ aspectRatio: `${width} / ${height}` }}>
      <img className="lens__real" src={small(image)} srcSet={srcSet(image)} sizes={sizes} alt={alt} loading="lazy" decoding="async" width={width} height={height} />
      <img className="lens__plan" src={small(plan)} srcSet={srcSet(plan)} sizes={sizes} alt="" loading="lazy" decoding="async" width={width} height={height} />
      <span className="lens__line" aria-hidden="true" />
      <span className="lens__tag lens__tag--l note" aria-hidden="true">Drawing</span>
      <span className="lens__tag lens__tag--r note" aria-hidden="true">Built</span>
    </div>
  )
}
