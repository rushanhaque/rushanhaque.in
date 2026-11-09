import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import { initScroll, getLenis, jumpTo, scrollTo } from './lib/scroll'
import { ScrollTrigger } from './lib/gsap'
import { ReadyContext } from './lib/ready'
import { director } from './lib/director'
import { device } from './lib/device'
import Stage from './components/Stage'
import { TransitionProvider } from './components/Transition'
import Chrome from './components/Chrome'
import Cursor from './components/Cursor'
import Loader from './components/Loader'
import Home from './pages/Home'

const LAZY = {
  Home,
  Work: lazy(() => import('./pages/Work')),
  Case: lazy(() => import('./pages/Case')),
  Product: lazy(() => import('./pages/Product')),
  About: lazy(() => import('./pages/About')),
  Contact: lazy(() => import('./pages/Contact')),
  Admin: lazy(() => import('./pages/Admin')),
  Landing: lazy(() => import('./pages/Landing')),
}

// The site. In the browser pages load as they are needed; at build time the prerenderer passes them in
// directly and leaves out what only makes sense on screen.
export default function App({ pages = LAZY }) {
  const [ready, setReady] = useState(false)
  const location = useLocation()
  const navType = useNavigationType()
  const first = useRef(true)
  const done = useCallback(() => setReady(true), [])
  const { Home: HomePage, Work, Case, Product, About, Contact, Admin, Landing } = pages

  useEffect(() => {
    initScroll()
    if (!device().reduced) director.start()
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    // Everything that moves the page changes its height: a font arriving, a section opening, a late picture. So the
    // page is only measured again when its height really has changed, and however many ask, they share one measure.
    let timer = 0
    const refresh = () => {
      clearTimeout(timer)
      timer = setTimeout(() => { ScrollTrigger.refresh(); director.measure() }, 180)
    }
    const main = document.getElementById('main')
    let last = main.getBoundingClientRect().height
    const ro = new ResizeObserver(([e]) => {
      const h = e.contentRect.height
      if (Math.abs(h - last) < 2) return
      last = h
      refresh()
    })
    ro.observe(main)
    return () => { ro.disconnect(); clearTimeout(timer) }
  }, [])

  // a new page has moved everything; the first page was measured as it was made
  const landed = useRef(false)
  useEffect(() => {
    if (!landed.current) { landed.current = true; return }
    requestAnimationFrame(() => { ScrollTrigger.refresh(); getLenis()?.resize() })
  }, [location.pathname])

  // Remember how far down each page was, so the back button returns you to where you were. A link to a
  // part of a page goes there, and a new page moves keyboard focus to its content.
  useEffect(() => {
    const key = `y:${location.key}`
    let timer = 0
    const save = () => {
      clearTimeout(timer)
      timer = setTimeout(() => { try { sessionStorage.setItem(key, String(Math.round(scrollY))) } catch { /* private mode */ } }, 120)
    }
    addEventListener('scroll', save, { passive: true })
    return () => { clearTimeout(timer); removeEventListener('scroll', save) }
  }, [location.key])

  useEffect(() => {
    const isFirst = first.current
    first.current = false
    let tries = 0
    let id = 0
    const until = (test, act) => {
      if (test()) { act(); return }
      if (tries++ < 30) id = setTimeout(() => until(test, act), 100)
    }
    if (location.hash) {
      const sel = location.hash
      until(() => { try { return document.querySelector(sel) } catch { return true } }, () => { try { const el = document.querySelector(sel); if (el) setTimeout(() => (isFirst ? jumpTo(el.getBoundingClientRect().top + scrollY) : scrollTo(el)), 60) } catch { /* not a selector */ } })
    } else if (navType === 'POP' && !isFirst) {
      let y = 0
      try { y = Number(sessionStorage.getItem(`y:${location.key}`)) || 0 } catch { /* private mode */ }
      until(() => document.documentElement.scrollHeight - innerHeight >= y, () => jumpTo(y))
    } else if (navType === 'PUSH') {
      document.getElementById('main')?.focus({ preventScroll: true })
    }
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  return (
    <ReadyContext.Provider value={ready}>
      <TransitionProvider>
        <Stage />
        <Chrome />
        <main id="main" tabIndex={-1}>
          <Suspense fallback={<div className="route-wait" />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/work" element={<Work />} />
              <Route path="/work/:slug" element={<Case />} />
              <Route path="/products/:slug" element={<Product />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/:slug" element={<Landing />} />
              <Route path="*" element={<Landing />} />
            </Routes>
          </Suspense>
        </main>
        <Loader onDone={done} />
        <Cursor />
      </TransitionProvider>
    </ReadyContext.Provider>
  )
}
