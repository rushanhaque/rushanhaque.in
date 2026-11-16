// The lists the owner edits in the admin (src/data/editable.json), with the original lists in content.js as the
// fallback until a list is first published from the admin. Items added in the admin carry only what the admin asks
// for, so everything else gets a sensible default here, and the components never meet a missing field.
// The indexed case-study and product pages (/work/…, /products/…) keep reading content.js, so they never change.
import * as base from './content'
import editable from './editable.json'

const pick = (key) => (Array.isArray(editable[key]) ? editable[key] : base[key])
export const slugify = (t = '') => t.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48)
const keyed = (x, i) => ({ ...x, slug: x.slug || slugify(x.title) || `item-${i + 1}` })
const PRODUCT_PAGES = new Set(base.products.map((p) => p.slug))
// short loops of a live site's moving hero, recorded from the site itself (public/video/work/<slug>.webm and .mp4)
const CLIPS = new Set(['taif', 'erfolg-living', 'aurelio', 'ibm-consultancy'])

export const works = pick('works').map(keyed).map((w) => ({ w: 1600, h: 1000, status: 'Live', year: '', field: '', ...w, short: w.short || w.title, line: w.line || w.description || '', clip: CLIPS.has(w.slug) ? `/video/work/${w.slug}` : '' }))

export const building = pick('building').map(keyed).map((b, i) => ({ w: 1600, h: 1000, field: '', description: '', ...b, sheet: b.sheet || `A-${101 + i}` }))

// a product with its own page links there; one added in the admin links to its own site, or to an enquiry
export const products = pick('products').map(keyed).map((p) => {
  const page = PRODUCT_PAGES.has(p.slug)
  const original = page ? base.products.find((o) => o.slug === p.slug) : null
  return {
    w: 1600, h: 1000, field: '', year: '', status: 'Live', tags: [], does: [], steps: original?.steps || [],
    ...p,
    to: page ? `/products/${p.slug}` : p.url ? undefined : `/contact?project=${encodeURIComponent(p.title)}`,
    href: page ? undefined : p.url || undefined,
  }
})

export const reviews = pick('reviews').map((r) => ({ company: '', location: '', date: '', ...r }))
export const experiments = pick('experiments').map((e) => ({ kind: '', year: '', text: '', ...e }))
export const certifications = pick('certifications').map((c) => ({ issuer: '', kind: 'Certificate', date: '', ...c }))
export const clients = editable.clients || []
