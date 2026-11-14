// The build's server entry: renders any route to HTML, so every page ships with its words already in it, for search
// engines and AI crawlers that don't run JavaScript. Effects never run here. It is the same App as the browser's, so
// the first paint and the page React takes over are one and the same.
import { renderToString } from 'react-dom/server'
import App from './App'
import { match } from './lib/routes'
import { LEGAL, seoIndex } from './lib/pages'
import { works, products } from './data/content'
import Home from './pages/Home'
import Works from './pages/Works'
import Case from './pages/Case'
import Product from './pages/Product'
import About from './pages/About'
import Contact from './pages/Contact'
import Landing from './pages/Landing'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

const PAGES = { home: Home, works: Works, case: Case, product: Product, about: About, contact: Contact, landing: Landing, admin: Admin, notfound: NotFound }
const SEO = import.meta.glob('./data/seo/pages/*.json', { eager: true, import: 'default' })

export function render(path) {
  const r = match(path)
  const data = r.key === 'landing' ? SEO[`./data/seo/pages/${r.params.slug}.json`] || null : null
  const html = renderToString(<App initial={{ ...r, hash: '', search: '', Page: PAGES[r.key], data }} />)
  return { html, key: r.key, lang: data?.guide?.lang === 'hi' ? 'hi' : 'en' }
}

/** Every public address, in the order the sitemap lists them. */
export function paths() {
  return [
    '/', '/work', '/about', '/contact',
    ...works.map((w) => `/work/${w.slug}`),
    ...products.map((p) => `/products/${p.slug}`),
    ...seoIndex.map((p) => `/${p.slug}`),
    ...Object.keys(LEGAL).map((s) => `/${s}`),
  ]
}

export const PAGE_FILES = {
  home: 'src/pages/Home.jsx', works: 'src/pages/Works.jsx', case: 'src/pages/Case.jsx', product: 'src/pages/Product.jsx',
  about: 'src/pages/About.jsx', contact: 'src/pages/Contact.jsx', landing: 'src/pages/Landing.jsx', admin: 'src/pages/Admin.jsx', notfound: 'src/pages/NotFound.jsx',
}
