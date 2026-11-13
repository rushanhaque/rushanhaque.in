import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { device } from '../lib/device'
import { holePath, solidPath, coverRadius } from '../lib/star'
import { jumpTop, lockScroll, unlockScroll } from '../lib/scroll'
import { pointer } from '../lib/pointer'
import { director } from '../lib/director'

const Ctx = createContext({ go: () => {} })
export const useGo = () => useContext(Ctx).go

const NAMES = { '/': 'Home', '/work': 'Works', '/services': 'Services', '/about': 'About', '/contact': 'Contact' }
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
// timers, not frames: the browser holds back rendering, and with it animation frames, while it waits for the new page
async function until(test, ms) {
  const end = performance.now() + ms
  while (performance.now() < end) {
    const v = test()
    if (v) return v
    await wait(16)
  }
  return null
}
const plateOf = (link) => (link.matches('[data-morph]') ? link : link.querySelector('[data-morph]'))
const PAGES = { work: () => import('../pages/Case'), products: () => import('../pages/Product') }
const warmed = new Set()
// reaching for a picture loads what its page will need, so the flight starts without waiting
function warm(link) {
  const plate = plateOf(link)
  if (!plate || warmed.has(link.href)) return
  warmed.add(link.href)
  PAGES[new URL(link.href).pathname.split('/')[1]]?.()
  const img = plate.querySelector('img')
  if (!img?.srcset) return
  const next = new Image()
  next.sizes = '90vw'
  next.srcset = img.srcset
}

// Between pages: a star of sandstone opens where you clicked and fills the screen. Then a star-shaped hole
// opens in it, and the next room is behind it.
export function TransitionProvider({ children }) {
  const sheet = useRef(null)
  const word = useRef(null)
  const busy = useRef(0)
  const pending = useRef(null)
  const latest = useRef(null)
  const nav = useNavigate()
  const loc = useLocation()
  const [label, setLabel] = useState('')

  const go = useCallback(
    (to, { title, from } = {}) => {
      // A click while a page is still changing is not thrown away: the last place asked for is where you end up.
      // And a change that never reported back (a tab put away mid-flight) cannot hold the links shut for good.
      if (busy.current && performance.now() - busy.current < 4000) { pending.current = { to, title }; return }
      pending.current = null
      if (to === loc.pathname) { jumpSmooth(); return }
      if (device().reduced) { nav(to); jumpTop(); return }
      busy.current = performance.now()
      // where the browser can do it, the picture you clicked flies to its place on the next page
      if (from && document.startViewTransition) {
        const old = document.querySelector('[data-plate]')
        let plate = null
        lockScroll()
        from.style.viewTransitionName = 'plate'
        const flight = document.startViewTransition(async () => {
          from.style.viewTransitionName = ''
          nav(to)
          jumpTop()
          plate = await until(() => { const p = document.querySelector('[data-plate]'); return p && p !== old ? p : null }, 1500)
          if (!plate) return
          plate.style.viewTransitionName = 'plate'
          const img = plate.matches('img') ? plate : plate.querySelector('img')
          await Promise.race([img?.decode?.().catch(() => {}), wait(450)])
        })
        flight.ready.catch(() => {})
        flight.finished.catch(() => {}).finally(() => {
          if (plate) plate.style.viewTransitionName = ''
          busy.current = 0
          next()
          unlockScroll()
          ScrollTrigger.refresh()
          director.measure()
        })
        return
      }
      const key = '/' + to.split('/')[1]
      setLabel(title || NAMES[key] || '')
      const w = innerWidth
      const h = innerHeight
      const cx = pointer.x || w / 2
      const cy = pointer.y || h / 2
      const R = coverRadius(w, h, cx, cy)
      const el = sheet.current
      lockScroll()
      const s = { r: 0 }
      gsap.set(el, { display: 'grid', clipPath: solidPath(cx, cy, 0) })
      const hole = { r: 0 }
      const hcx = w / 2
      const hcy = h / 2
      const HR = coverRadius(w, h, hcx, hcy)
      gsap.timeline({
        onComplete: () => {
          gsap.set(el, { display: 'none', clipPath: 'none' })
          busy.current = 0
          next()
          unlockScroll()
          ScrollTrigger.refresh()
          director.measure()
        },
      })
        .to(s, { r: R, duration: 0.5, ease: 'expo.inOut', onUpdate: () => { el.style.clipPath = solidPath(cx, cy, s.r) } })
        .fromTo(word.current, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power3.out' }, 0.22)
        .call(() => { nav(to); jumpTop() })
        .to({}, { duration: 0.1 })
        .to(word.current, { autoAlpha: 0, duration: 0.14, ease: 'power2.in' })
        .to(hole, { r: HR, duration: 0.6, ease: 'expo.inOut', onUpdate: () => { el.style.clipPath = holePath(w, h, hcx, hcy, hole.r) } }, '-=0.1')
    },
    [loc.pathname, nav],
  )
  latest.current = go
  // once a change lands, a click that came in during it is carried out, by the go that knows the new page
  const next = () => {
    const p = pending.current
    pending.current = null
    if (p) setTimeout(() => latest.current(p.to, { title: p.title }), 0)
  }

  return (
    <Ctx.Provider value={{ go }}>
      {children}
      <div className="iris" ref={sheet} aria-hidden="true">
        <div className="iris__word" ref={word}>
          <span>{label}</span>
        </div>
      </div>
    </Ctx.Provider>
  )
}

const jumpSmooth = () => window.scrollTo({ top: 0, behavior: 'smooth' })

// a link that walks through the iris instead of cutting
export function TLink({ to, onClick, title, children, ...rest }) {
  const go = useGo()
  return (
    <Link
      to={to}
      {...rest}
      onPointerEnter={(e) => { rest.onPointerEnter?.(e); warm(e.currentTarget) }}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        go(to, { title, from: plateOf(e.currentTarget) })
      }}
    >
      {children}
    </Link>
  )
}
