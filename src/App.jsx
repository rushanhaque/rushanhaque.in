import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AppContext } from './lib/app'
import { initLenis } from './lib/lenis'
import { ScrollTrigger } from './lib/gsap'
import { TransitionProvider } from './components/Transition'
import Preloader from './components/Preloader'
import Header from './components/Header'
import CommandPalette from './components/CommandPalette'
import Seo from './components/Seo'
import Home from './pages/Home'

const LAZY = {
  Home,
  Work: lazy(() => import('./pages/Work')),
  Case: lazy(() => import('./pages/Case')),
  About: lazy(() => import('./pages/About')),
  Contact: lazy(() => import('./pages/Contact')),
  Landing: lazy(() => import('./pages/Landing')),
  NotFound: lazy(() => import('./pages/NotFound')),
}

/**
 * The site. In the browser the pages load as they are needed; at build time the pre-renderer
 * passes them in directly (`pages`) and leaves out what only makes sense on screen (`server`).
 */
export default function App({ pages = LAZY, server = false }) {
  const [ready, setReady] = useState(server)
  const [loaderGone, setLoaderGone] = useState(server)
  const location = useLocation()
  const { Home: HomePage, Work, Case, About, Contact, Landing, NotFound } = pages

  useEffect(() => {
    initLenis()
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    // fonts and late images shift layout; re-measure every trigger once they settle
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => {
      window.removeEventListener('load', refresh)
    }
  }, [])

  return (
    <AppContext.Provider value={{ ready }}>
      <TransitionProvider>
        <Seo />
        <a href="#main" className="skip">Skip to content</a>
        <Header />
        <main id="main">
          <Suspense fallback={<div className="route-fallback" />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/work" element={<Work />} />
              <Route path="/work/:slug" element={<Case />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/:slug" element={<Landing />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        {!server && <CommandPalette />}
        {!loaderGone && <Preloader onReady={() => setReady(true)} onFinish={() => setLoaderGone(true)} />}
      </TransitionProvider>
    </AppContext.Provider>
  )
}
