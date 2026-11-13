import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { device } from '../lib/device'
import { holePath, solidPath, coverRadius } from '../lib/star'
import { jumpTop, lockScroll, unlockScroll } from '../lib/scroll'
import { pointer } from '../lib/pointer'
import { director } from '../lib/director'
import { prepare } from '../lib/routes'

const Ctx = createContext({ go: () => {} })
export const useGo = () => useContext(Ctx).go

const NAMES = { '/': 'Home', '/work': 'Works', '/about': 'About', '/contact': 'Contact' }
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
const warmed = new Set()
// reaching for a link loads the page it leads to, and for a picture its large image too, so the change starts without waiting
function warm(link) {
  if (warmed.has(link.href)) return
  warmed.add(link.href)
  const url = new URL(link.href)
  if (url.origin === location.origin) prepare(url.pathname)
  const plate = plateOf(link)
  if (!plate) return
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
      if (busy.current && performance.now() - busy.current < 20000) { pending.current = { to, title }; return }
      pending.current = null
      if (to === loc.pathname) { jumpSmooth(); return }
      // The next page's code (and a landing page's words) start loading the moment it is asked for, and the curtain
      // only opens once that page is really on screen. Opening on time regardless is how a slow connection used to
      // show the page you were leaving, as if the click had gone somewhere else.
      const ready = prepare(to)
      if (device().reduced) { ready.then(() => { nav(to); jumpTop() }); return }
      busy.current = performance.now()
      const main = document.getElementById('main')
      const leaving = main?.firstElementChild
      const arrived = () => until(() => {
        const page = main?.firstElementChild
        return page && page !== leaving && !page.classList.contains('route-wait') ? page : null
      }, 8000)
      const finish = () => {
        busy.current = 0
        next()
        unlockScroll()
        ScrollTrigger.refresh()
        director.measure()
      }

      // where the browser can do it, the picture you clicked flies to its place on the next page
      if (from && document.startViewTransition) {
        lockScroll()
        const html = document.documentElement
        html.classList.add('is-going')
        ready.then(() => {
          html.classList.remove('is-going')
          const old = document.querySelector('[data-plate]')
          let plate = null
          from.style.viewTransitionName = 'plate'
          const flight = document.startViewTransition(async () => {
            from.style.viewTransitionName = ''
            nav(to)
            jumpTop()
            await arrived()
            plate = await until(() => { const p = document.querySelector('[data-plate]'); return p && p !== old ? p : null }, 1500)
            if (!plate) return
            plate.style.viewTransitionName = 'plate'
            const img = plate.matches('img') ? plate : plate.querySelector('img')
            await Promise.race([img?.decode?.().catch(() => {}), wait(450)])
          })
          flight.ready.catch(() => {})
          flight.finished.catch(() => {}).finally(() => {
            if (plate) plate.style.viewTransitionName = ''
            finish()
          })
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
      const name = word.current
      lockScroll()
      const s = { r: 0 }
      gsap.set(el, { display: 'grid', clipPath: solidPath(cx, cy, 0) })
      const hole = { r: 0 }
      const hcx = w / 2
      const hcy = h / 2
      const HR = coverRadius(w, h, hcx, hcy)
      let loaded = false
      ready.then(() => { loaded = true })
      const close = gsap.timeline()
        .to(s, { r: R, duration: 0.5, ease: 'expo.inOut', onUpdate: () => { el.style.clipPath = solidPath(cx, cy, s.r) } })
        .fromTo(name, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power3.out' }, 0.22)
      close.then(async () => {
        // still on its way: the page's name breathes on the curtain until it is here
        if (!loaded) name.classList.add('is-waiting')
        await ready
        // Changed your mind while the curtain was closed? It goes to the last page asked for and opens once, there,
        // rather than opening on the first choice and closing again.
        let target = to
        while (pending.current && pending.current.to !== target) {
          const p = pending.current
          pending.current = null
          target = p.to
          setLabel(p.title || NAMES['/' + target.split('/')[1]] || '')
          name.classList.add('is-waiting')
          await prepare(target)
        }
        if (pending.current?.to === target) pending.current = null
        name.classList.remove('is-waiting')
        // asking for the page already on screen changes nothing, so there is nothing new to wait for
        if (target !== window.location.pathname) {
          nav(target)
          jumpTop()
          await arrived()
        }
        jumpTop()
        gsap.timeline({ onComplete: () => { gsap.set(el, { display: 'none', clipPath: 'none' }); finish() } })
          .to(name, { autoAlpha: 0, duration: 0.14, ease: 'power2.in' })
          .to(hole, { r: HR, duration: 0.6, ease: 'expo.inOut', onUpdate: () => { el.style.clipPath = holePath(w, h, hcx, hcy, hole.r) } }, '-=0.1')
      })
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
