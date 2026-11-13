// One landing page's words: its guide or page, its extra sections and its title, from the file
// scripts/seo-index.mjs writes for it. Each is its own small chunk, so a landing page downloads only itself.
//
// What comes back is a promise that React's use() can read. On the server every page is handed over already
// settled (entry-server.jsx), so the prerender has the words at once; in the browser the first one is asked for
// as the app starts (main.jsx), alongside the page's code rather than after it.
const files = import.meta.glob('../data/seo/pages/*.json', { import: 'default' })
const cache = new Map()

const settled = (value) => {
  const p = Promise.resolve(value)
  p.status = 'fulfilled'
  p.value = value
  return p
}

export function seoPage(slug) {
  let p = cache.get(slug)
  if (p) return p
  const load = files[`../data/seo/pages/${slug}.json`]
  if (!load) return settled(null)
  // a bad moment on a connection is tried once more before the page gives up
  p = load().catch(() => load()).then(
    (value) => { p.status = 'fulfilled'; p.value = value; return value },
    (err) => { cache.delete(slug); throw err },
  )
  cache.set(slug, p)
  return p
}

export function providePages(all) {
  for (const [slug, value] of Object.entries(all)) cache.set(slug, settled(value))
}
