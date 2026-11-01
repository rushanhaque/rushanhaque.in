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

const load = {
  Work: () => import('./pages/Work'),
  Case: () => import('./pages/Case'),
  Product: () => import('./pages/Product'),
  About: () => import('./pages/About'),
  Contact: () => import('./pages/Contact'),
  Landing: () => import('./pages/Landing'),
  NotFound: () => import('./pages/NotFound'),
}
const LAZY = { Home, ...Object.fromEntries(Object.entries(load).map(([k, f]) => [k, lazy(f)])) }

// which page a path shows, matching the routes below
const pageFor = (path) => {
  const p = path.replace(/\/+$/, '') || '/'
  if (p === '/') return 'Home'
  if (p === '/work') return 'Work'
  if (/^\/work\/[^/]+$/.test(p)) return 'Case'
  if (/^\/products\/[^/]+$/.test(p)) return 'Product'
  if (p === '/about') return 'About'
  if (p === '/contact') return 'Contact'
  return /^\/[^/]+$/.test(p) ? 'Landing' : 'NotFound'
}

/**
 * The pages for the first render, with the one at `path` already loaded. A lazy page always
 * suspends on its first render, which would swap the pre-rendered page for an empty fallback
 * until its code arrived; fetched first, it renders straight over the same words.
 */
export async function preload(path) {
  const key = pageFor(path)
  if (!load[key]) return LAZY
  try {
    return { ...LAZY, [key]: (await load[key]()).default }
  } catch {
    return LAZY
  }
}

/**
 * The site. In the browser the pages load as they are needed; at build time the pre-renderer
 * passes them in directly (`pages`) and leaves out what only makes sense on screen (`server`).
 */
export default function App({ pages = LAZY, server = false }) {
  const [ready, setReady] = useState(server)
  const [loaderGone, setLoaderGone] = useState(server)
  const location = useLocation()
  const { Home: HomePage, Work, Case, Product, About, Contact, Landing, NotFound } = pages

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
              <Route path="/products/:slug" element={<Product />} />
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
