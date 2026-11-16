import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { RouterCtx } from './lib/router'
import { match, resolve, warm } from './lib/routes'
import { applyMeta } from './lib/meta'
import { device } from './lib/device'
import { initScroll, jumpTo, scrollToEl, scrollToY } from './lib/scroll'
import Header from './components/Header'
import Footer from './components/Footer'
import Curtain from './components/Curtain'
import Cursor from './components/Cursor'
import Intro from './components/Intro'
import { BookingProvider } from './components/Booking'

const findHash = (hash) => { try { return hash ? document.querySelector(decodeURIComponent(hash)) : null } catch { return null } }

// The site: one page at a time between the bar and the footer, and the curtain that passes between them.
export default function App({ initial }) {
  const [route, setRoute] = useState(initial)
  const curtain = useRef(null)
  const busy = useRef(false)
  const first = useRef(true)

  useEffect(() => {
    initScroll()
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    history.replaceState({ ...(history.state || {}), y: scrollY }, '')
    const save = () => { clearTimeout(save.t); save.t = setTimeout(() => history.replaceState({ ...(history.state || {}), y: scrollY }, ''), 120) }
    addEventListener('scroll', save, { passive: true })
    const pop = async () => {
      const next = await resolve(location.href)
      const y = history.state?.y || 0
      flushSync(() => setRoute(next))
      requestAnimationFrame(() => (next.hash && findHash(next.hash) ? scrollToEl(findHash(next.hash), { smooth: false }) : jumpTo(y)))
    }
    addEventListener('popstate', pop)
    // warm the other pages once this one has finished loading
    if (document.readyState === 'complete') warm(); else addEventListener('load', warm, { once: true })
    // the page the visitor landed on, if it pointed at a part of itself
    if (location.hash) setTimeout(() => scrollToEl(findHash(location.hash), { smooth: false }), 80)
    return () => { removeEventListener('scroll', save); removeEventListener('popstate', pop) }
  }, [])

  const navigate = useCallback(async (to) => {
    const u = new URL(to, location.href)
    if (u.origin !== location.origin) { location.href = to; return }
    const same = u.pathname.replace(/\/+$/, '') === location.pathname.replace(/\/+$/, '')
    if (same) {
      if (u.hash) { history.pushState({ y: scrollY }, '', u.pathname + u.hash); scrollToEl(findHash(u.hash)) } else scrollToY(0)
      return
    }
    if (busy.current) return
    busy.current = true
    const calm = device().reduced
    try {
      // a page that cannot load in time is simply opened the ordinary way
      const slow = new Promise((_, no) => setTimeout(() => no(new Error('slow')), 9000))
      const [next] = await Promise.race([Promise.all([resolve(u.href), calm ? null : curtain.current.cover(nameOf(u.pathname))]), slow])
      history.replaceState({ ...(history.state || {}), y: scrollY }, '')
      history.pushState({ y: 0 }, '', u.pathname + u.search + u.hash)
      flushSync(() => setRoute(next))
      const target = u.hash && findHash(u.hash)
      if (target) scrollToEl(target, { smooth: false })
      else jumpTo(0)
      document.getElementById('main')?.focus({ preventScroll: true })
      if (!calm) await curtain.current.reveal()
    } catch {
      location.href = u.href
    } finally {
      busy.current = false
    }
  }, [])

  useLayoutEffect(() => {
    if (first.current) { first.current = false; return }
    applyMeta(route)
    document.documentElement.dataset.page = route.key
  }, [route])

  const ctx = useMemo(() => ({ route, navigate }), [route, navigate])
  const { Page } = route
  return (
    <RouterCtx.Provider value={ctx}>
      <BookingProvider>
        <Header />
        <main id="main" tabIndex={-1} key={route.path}>
          <Page params={route.params} data={route.data} />
        </main>
        {route.key !== 'admin' && <Footer lead={route.key !== 'home' && route.key !== 'contact'} />}
        <Curtain ref={curtain} />
        <Cursor />
        <Intro />
      </BookingProvider>
    </RouterCtx.Provider>
  )
}

function nameOf(path) {
  return match(path).name
}
