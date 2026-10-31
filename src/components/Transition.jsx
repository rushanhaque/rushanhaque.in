import { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { gsap } from '../lib/gsap'
import { scrollTo } from '../lib/lenis'
import { projectBySlug } from '../data/content'

const Ctx = createContext({ go: () => {} })
export const usePageTransition = () => useContext(Ctx)

const labelFor = (to) => {
  const path = to.split('#')[0]
  if (path === '/') return 'Index'
  const [, a, b] = path.split('/')
  if (a === 'work' && b) return projectBySlug(b)?.title || 'Work'
  return a.charAt(0).toUpperCase() + a.slice(1)
}

// The leading edge of each curtain is an arch: the middle rises first.
const cover = (p, c) => `M0 100 L0 ${100 - p} Q50 ${100 - p - c} 100 ${100 - p} L100 100 Z`
const uncover = (p, c) => `M0 0 L100 0 L100 ${100 - p} Q50 ${100 - p - c} 0 ${100 - p} Z`

/**
 * Two transitions:
 *  · arch curtain — brass then wine panels rise with an arched leading edge, the
 *    destination is named in italic, then the panels keep rising and reveal the page
 *  · zoom — the clicked image grows to fill the screen and becomes the next page
 */
export function TransitionProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const busy = useRef(false)
  const via = useRef(false)
  const root = useRef(null)

  const land = useCallback(
    (to) => {
      scrollTo(0, { immediate: true, force: true })
      window.scrollTo(0, 0)
      navigate(to)
    },
    [navigate],
  )

  const zoom = useCallback(
    (to, from) => {
      const img = from?.querySelector('img:last-of-type') || from?.querySelector('img')
      const src = img?.currentSrc || img?.src
      if (!src) return false
      const r = from.getBoundingClientRect()
      const clone = document.createElement('div')
      clone.className = 'pt-zoom'
      Object.assign(clone.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, backgroundImage: `url("${src}")` })
      document.body.appendChild(clone)
      const main = document.querySelector('main')
      gsap
        .timeline({ onComplete: () => { clone.remove(); busy.current = false } })
        .to(main, { autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, 0)
        .to(clone, { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight, borderRadius: 0, duration: 1.1, ease: 'snap' }, 0)
        .add(() => land(to))
        .set(main, { autoAlpha: 1 }, '+=0.1')
        .to(clone, { autoAlpha: 0, scale: 1.04, duration: 0.9, ease: 'power2.inOut' }, '+=0.15')
      return true
    },
    [land],
  )

  const go = useCallback(
    (to, label, opts = {}) => {
      if (busy.current) return
      const [path, hash] = to.split('#')
      if (path === location.pathname) {
        scrollTo(hash ? `#${hash}` : 0)
        return
      }
      busy.current = true
      via.current = true
      if (opts.from && zoom(to, opts.from)) return

      const el = root.current
      const [a, b] = el.querySelectorAll('path')
      el.querySelector('.pt__text').textContent = label || labelFor(to)
      const s = { pa: 0, pb: 0, ca: 0, cb: 0 }
      const draw = (fn) => () => {
        a.setAttribute('d', fn(s.pa, s.ca))
        b.setAttribute('d', fn(s.pb, s.cb))
      }
      const arc = (k) => (t) => Math.sin(t * Math.PI) * k
      gsap
        .timeline({ onComplete: () => { busy.current = false } })
        .set(el, { autoAlpha: 1 })
        .to(s, { pa: 100, duration: 0.85, ease: 'power3.inOut', onUpdate: () => { s.ca = arc(28)(s.pa / 100); draw(cover)() } }, 0)
        .to(s, { pb: 100, duration: 0.85, ease: 'power3.inOut', onUpdate: () => { s.cb = arc(28)(s.pb / 100); draw(cover)() } }, 0.12)
        .fromTo(el.querySelectorAll('.pt__label > *'), { yPercent: 120 }, { yPercent: 0, duration: 0.7, stagger: 0.06, ease: 'expo' }, 0.6)
        .add(() => land(hash ? path : to))
        .add(() => { s.pa = 0; s.pb = 0 }, '+=0.25')
        .to(el.querySelectorAll('.pt__label > *'), { yPercent: -120, duration: 0.45, stagger: 0.04, ease: 'expo.in' })
        .to(s, { pb: 100, duration: 0.9, ease: 'power3.inOut', onUpdate: () => { s.cb = arc(30)(s.pb / 100); draw(uncover)() } }, '-=0.1')
        .to(s, { pa: 100, duration: 0.9, ease: 'power3.inOut', onUpdate: () => { s.ca = arc(30)(s.pa / 100); draw(uncover)() } }, '<0.1')
        .add(() => hash && setTimeout(() => scrollTo(`#${hash}`, { offset: -40 }), 300))
        .set(el, { autoAlpha: 0 })
    },
    [location.pathname, zoom, land],
  )

  // Back and Forward: return to the top before the next page renders, so its scroll scenes are
  // measured from the top rather than from wherever the last page was left
  useEffect(() => {
    const top = () => { scrollTo(0, { immediate: true, force: true }); window.scrollTo(0, 0) }
    window.addEventListener('popstate', top)
    return () => window.removeEventListener('popstate', top)
  }, [])

  useEffect(() => {
    if (!via.current) {
      scrollTo(0, { immediate: true, force: true })
      window.scrollTo(0, 0)
    }
    via.current = false
  }, [location.pathname])

  return (
    <Ctx.Provider value={{ go }}>
      {children}
      <div className="pt" ref={root} aria-hidden="true">
        <svg className="pt__svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path className="pt__a" d="M0 100 L100 100 Z" />
          <path className="pt__b" d="M0 100 L100 100 Z" />
        </svg>
        <div className="pt__label">
          <span className="pt__text" />
        </div>
      </div>
    </Ctx.Provider>
  )
}

/** Router link that runs the curtain. `zoom` turns the link's first .media into a shared element. */
export function TLink({ to, label, children, onClick, className = '', zoom = false, ...rest }) {
  const { go } = usePageTransition()
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
        e.preventDefault()
        // a handler can return false to cancel the navigation (e.g. after a drag)
        if (onClick?.(e) === false) return
        go(to, label, zoom ? { from: e.currentTarget.querySelector('.media') } : undefined)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
