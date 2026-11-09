import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { site } from '../config/site'
import { lockScroll, unlockScroll } from '../lib/scroll'
import { TLink } from './Transition'

const SLATS = 12
const LINKS = [{ label: 'Home', to: '/' }, ...site.nav]

// The index opens like the shutters of a jali room: a row of tall slats turn on their pivots to close off
// the light, one after another, and the names rise in front of them.
export default function Menu({ open, onClose }) {
  const root = useRef(null)
  const tl = useRef(null)
  const was = useRef(false)

  useEffect(() => {
    const q = gsap.utils.selector(root)
    gsap.set(root.current, { autoAlpha: 0 })
    gsap.set(q('.menu__slat'), { rotateY: -90 })
    gsap.set(q('.menu__big'), { yPercent: 112 })
    gsap.set(q('.menu__fade'), { autoAlpha: 0, y: 14 })
    tl.current = gsap.timeline({ paused: true, defaults: { ease: 'expo.inOut' } })
      .set(root.current, { autoAlpha: 1 })
      .to(q('.menu__slat'), { rotateY: 0, duration: 0.8, stagger: { each: 0.024, from: 'end' } }, 0)
      .to(q('.menu__big'), { yPercent: 0, duration: 0.95, stagger: 0.05, ease: 'expo.out' }, 0.34)
      .to(q('.menu__fade'), { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.03, ease: 'expo.out' }, 0.5)
    return () => tl.current?.kill()
  }, [])

  useEffect(() => {
    if (!tl.current) return
    if (open) { tl.current.timeScale(1).play(); lockScroll(); was.current = true } else if (was.current) { tl.current.timeScale(1.4).reverse(); unlockScroll(); was.current = false }
  }, [open])

  useEffect(() => {
    if (!open) return
    const key = (e) => e.key === 'Escape' && onClose()
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  }, [open, onClose])

  return (
    <div className="menu" ref={root} aria-hidden={!open} inert={!open}>
      <div className="menu__slats" aria-hidden="true">
        {Array.from({ length: SLATS }, (_, i) => <span className="menu__slat" key={i} />)}
      </div>
      <nav className="menu__nav" aria-label="Pages">
        <ul>
          {LINKS.map((l) => (
            <li key={l.to}>
              <div className="menu__mask">
                <TLink to={l.to} className="menu__big" onClick={onClose} title={l.label}>
                  {l.label}
                </TLink>
              </div>
            </li>
          ))}
        </ul>
      </nav>
      <div className="menu__side">
        <div className="menu__fade">
          <p className="note">Write</p>
          <a className="menu__line" href={`mailto:${site.email}`}>{site.email}</a>
        </div>
        <div className="menu__fade">
          <p className="note">Call or WhatsApp</p>
          <a className="menu__line" href={site.phone.whatsapp} target="_blank" rel="noopener noreferrer">{site.phone.label}</a>
        </div>
        <div className="menu__fade">
          <p className="note">Elsewhere</p>
          <ul className="menu__soc">
            {site.socials.map((s) => <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}
          </ul>
        </div>
        <div className="menu__fade">
          <p className="note">Based in</p>
          <p className="menu__line">{site.location}</p>
        </div>
      </div>
    </div>
  )
}
