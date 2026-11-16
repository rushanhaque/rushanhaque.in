// Every address the site answers, and what each one needs before it can be shown. Pages load as they are needed;
// the guide, service and area pages each load their own words and nothing else.
import { works, products } from '../data/content'
import { isLanding, titleFor } from './pages'

export const PAGES = {
  home: () => import('../pages/Home'),
  works: () => import('../pages/Works'),
  case: () => import('../pages/Case'),
  product: () => import('../pages/Product'),
  about: () => import('../pages/About'),
  contact: () => import('../pages/Contact'),
  landing: () => import('../pages/Landing'),
  admin: () => import('../pages/Admin'),
  notfound: () => import('../pages/NotFound'),
}

const SEO = import.meta.glob('../data/seo/pages/*.json', { import: 'default' })

export function match(pathname) {
  const p = pathname.replace(/\/+$/, '') || '/'
  let m
  if (p === '/') return { key: 'home', path: p, name: 'Home' }
  if (p === '/work') return { key: 'works', path: p, name: 'Works' }
  if (p === '/about') return { key: 'about', path: p, name: 'About' }
  if (p === '/contact') return { key: 'contact', path: p, name: 'Contact' }
  if (p === '/admin') return { key: 'admin', path: p, name: 'Admin' }
  if ((m = p.match(/^\/work\/([^/]+)$/))) {
    const w = works.find((x) => x.slug === m[1])
    if (w) return { key: 'case', path: p, params: { slug: w.slug }, name: w.short }
  }
  if ((m = p.match(/^\/products\/([^/]+)$/))) {
    const x = products.find((y) => y.slug === m[1])
    if (x) return { key: 'product', path: p, params: { slug: x.slug }, name: x.short }
  }
  if ((m = p.match(/^\/([^/]+)$/)) && isLanding(m[1])) return { key: 'landing', path: p, params: { slug: m[1] }, name: titleFor(m[1]) }
  return { key: 'notfound', path: p, name: 'Lost' }
}

async function dataFor(r) {
  if (r.key !== 'landing') return null
  const load = SEO[`../data/seo/pages/${r.params.slug}.json`]
  return load ? load() : null
}

/** Everything a route needs, loaded: its page and its data. */
export async function resolve(url) {
  const u = new URL(url, location.origin)
  const r = match(u.pathname)
  const [mod, data] = await Promise.all([PAGES[r.key](), dataFor(r)])
  return { ...r, hash: u.hash, search: u.search, Page: mod.default, data }
}

const done = new Set()
export const prefetch = (to) => {
  if (done.has(to)) return
  done.add(to)
  try {
    const u = new URL(to, location.origin)
    if (u.origin !== location.origin) return
    const r = match(u.pathname)
    PAGES[r.key]()
    dataFor(r)
  } catch { /* not a page */ }
}

// Once the page has settled: the code of the main pages, then the words behind every page link as it comes into
// view, so a click or a tap never waits for the network. Skipped when the visitor is saving data.
export function warm() {
  if (typeof window === 'undefined' || navigator.connection?.saveData || /(^|-)2g/.test(navigator.connection?.effectiveType || '')) return
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 300))
  idle(() => ['home', 'works', 'about', 'contact', 'landing'].forEach((k) => PAGES[k]()), { timeout: 3000 })
  const io = new IntersectionObserver((list) => {
    for (const e of list) if (e.isIntersecting) { io.unobserve(e.target); idle(() => prefetch(e.target.getAttribute('href')), { timeout: 2000 }) }
  }, { rootMargin: '200px' })
  const watch = () => document.querySelectorAll('a[href^="/"]:not([data-warm])').forEach((a) => { a.dataset.warm = ''; io.observe(a) })
  watch()
  new MutationObserver(() => idle(watch, { timeout: 1000 })).observe(document.getElementById('root'), { childList: true, subtree: true })
}
