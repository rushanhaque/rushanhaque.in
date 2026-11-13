import { seoPage } from './seoPage'

// Each page's code, loaded the first time it is needed. The router renders from these (App.jsx), and the page
// change (components/Transition.jsx) asks for the same ones first and waits for them, so the curtain never opens
// on the page you were leaving while the next one is still on its way.
export const loaders = {
  Work: () => import('../pages/Work'),
  Case: () => import('../pages/Case'),
  Product: () => import('../pages/Product'),
  About: () => import('../pages/About'),
  Contact: () => import('../pages/Contact'),
  Admin: () => import('../pages/Admin'),
  Landing: () => import('../pages/Landing'),
}

// everything a path needs before it can be shown: its page's code and, for a landing page, its own words
export function prepare(path) {
  const [first = '', second] = path.split(/[?#]/)[0].split('/').filter(Boolean)
  const done = (p) => p.then(() => {}, () => {})
  if (!first) return Promise.resolve()
  if (first === 'work') return done(second ? loaders.Case() : loaders.Work())
  if (first === 'products') return done(loaders.Product())
  if (first === 'about') return done(loaders.About())
  if (first === 'contact') return done(loaders.Contact())
  if (first === 'admin') return done(loaders.Admin())
  return done(Promise.all([loaders.Landing(), seoPage(first)]))
}
