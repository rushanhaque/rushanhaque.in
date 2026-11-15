// What the admin can edit, field by field. Shared by the admin page (to draw the forms) and the server (to check
// what it is sent), so the two can never disagree. Files starting with _ are not routes on Vercel.

export const LOGO = /^\/img\/clients\/[a-z0-9-]+\.(webp|png)$/
// pictures added in the admin: a 1600px version and an 800px one beside it
export const UPLOAD = /^\/img\/up\/[a-z0-9-]+\.webp$/
const IMAGE = /^\/img\/(work|plan|cert|write|up|clients)\/[a-z0-9-]+\.(webp|png|jpe?g)$/
const URL_OK = /^https?:\/\/[^\s<>"']+$/

// the fields shown in the admin; `keep` are values carried over from the original data but not edited
export const LISTS = {
  works: {
    label: 'Works', one: 'work', max: 40,
    hint: 'Client websites. Shown on the home page and the Works page, and each one opens the live site.',
    fields: [
      { k: 'title', label: 'Name', max: 60, req: true },
      { k: 'url', label: 'Live site address', type: 'url', req: true, ph: 'https://' },
      { k: 'field', label: 'Field', max: 50, ph: 'Furniture · Export' },
      { k: 'year', label: 'Year', max: 9, ph: '2026' },
      { k: 'status', label: 'Status', options: ['Live', 'In progress'] },
      { k: 'line', label: 'One line', max: 110, ph: 'What the business does, in a few words' },
      { k: 'description', label: 'Description', max: 280, area: true },
      { k: 'image', label: 'Screenshot of the home page', type: 'image', req: true },
    ],
    keep: ['slug', 'short', 'plan', 'tags', 'w', 'h'],
  },
  building: {
    label: 'In progress', one: 'site in progress', max: 12,
    hint: 'Sites still being built, in Currently building on the home page.',
    fields: [
      { k: 'title', label: 'Name', max: 60, req: true },
      { k: 'url', label: 'Preview address', type: 'url', req: true, ph: 'https://' },
      { k: 'field', label: 'Field', max: 50 },
      { k: 'description', label: 'Description', max: 200, area: true },
      { k: 'image', label: 'Screenshot', type: 'image', req: true },
    ],
    keep: ['slug', 'plan', 'sheet', 'w', 'h'],
  },
  products: {
    label: 'Products', one: 'product', max: 12,
    hint: 'Your own software. A product added here opens its own website, or an enquiry if it has none.',
    fields: [
      { k: 'title', label: 'Name', max: 60, req: true },
      { k: 'field', label: 'Kind', max: 40, ph: 'Web application' },
      { k: 'year', label: 'Year', max: 9 },
      { k: 'status', label: 'Status', options: ['Live', 'In progress'] },
      { k: 'description', label: 'Description', max: 280, area: true, req: true },
      { k: 'does', label: 'What it does, one per line', type: 'lines', max: 120, count: 4 },
      { k: 'tags', label: 'Tags, separated by commas', type: 'tags', max: 30, count: 6 },
      { k: 'url', label: 'Product website (optional)', type: 'url', ph: 'https://' },
      { k: 'image', label: 'Screenshot', type: 'image', req: true },
    ],
    keep: ['slug', 'short', 'plan', 'steps', 'w', 'h'],
  },
  reviews: {
    label: 'Reviews', one: 'review', max: 40,
    hint: 'Client reviews, in the Reviews section of the home page.',
    fields: [
      { k: 'quote', label: 'What they said', max: 300, area: true, req: true },
      { k: 'name', label: 'Name', max: 60, req: true },
      { k: 'company', label: 'Company or role', max: 60 },
      { k: 'location', label: 'Country', max: 40, ph: 'India' },
      { k: 'date', label: 'Month and year', max: 20, ph: 'Nov 2026' },
    ],
    keep: [],
  },
  experiments: {
    label: 'Experiments', one: 'experiment', max: 40,
    hint: 'Side projects on the Works page. They open a short description, not the project itself.',
    fields: [
      { k: 'title', label: 'Name', max: 60, req: true },
      { k: 'kind', label: 'Kind', options: ['AI', 'Web', 'Product', 'Tool', 'IoT'] },
      { k: 'year', label: 'Year', max: 9 },
      { k: 'text', label: 'One line about it', max: 200, area: true, req: true },
      { k: 'image', label: 'Picture (optional)', type: 'image' },
    ],
    keep: ['url'],
  },
  certifications: {
    label: 'Certificates', one: 'certificate', max: 60,
    hint: 'Credentials on the About page.',
    fields: [
      { k: 'title', label: 'Title', max: 90, req: true },
      { k: 'issuer', label: 'Issued by', max: 60 },
      { k: 'kind', label: 'Kind', options: ['Certificate', 'Training', 'Simulation', 'Workshop', 'Visit'] },
      { k: 'date', label: 'Month and year', max: 20, ph: 'Mar 2026' },
      { k: 'image', label: 'Picture of the certificate (optional)', type: 'image' },
    ],
    keep: [],
  },
}

const text = (v, max, multi) => {
  if (typeof v !== 'string') return ''
  const t = multi ? v.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim() : v.replace(/\s+/g, ' ').trim()
  return t.slice(0, max)
}
const bad = (s) => /[<>]/.test(s)

// one list, checked and trimmed to what the site can show; returns { value } or { error }
export function cleanList(key, input) {
  const spec = LISTS[key]
  if (!Array.isArray(input) || input.length > spec.max) return { error: `${spec.label}: the list could not be read, or has more than ${spec.max} items.` }
  const out = []
  for (const [i, item] of input.entries()) {
    const o = {}
    const name = typeof item?.title === 'string' ? item.title.trim() : typeof item?.name === 'string' ? item.name.trim() : `item ${i + 1}`
    for (const f of spec.fields) {
      const v = item?.[f.k]
      if (f.type === 'tags' || f.type === 'lines') {
        const arr = (Array.isArray(v) ? v : typeof v === 'string' ? v.split(f.type === 'tags' ? ',' : '\n') : []).map((s) => text(s, f.max)).filter(Boolean).slice(0, f.count)
        if (arr.some(bad)) return { error: `${spec.label}, ${name}: ${f.label} cannot contain < or >.` }
        o[f.k] = arr
        continue
      }
      const s = text(v, f.max || 400, f.area)
      if (f.req && !s) return { error: `${spec.label}: every ${spec.one} needs ${f.label.toLowerCase()}.` }
      if (!s) continue
      if (bad(s)) return { error: `${spec.label}, ${name}: ${f.label} cannot contain < or >.` }
      if (f.type === 'url' && !URL_OK.test(s)) return { error: `${spec.label}, ${name}: ${f.label} must start with https://` }
      if (f.type === 'image' && !IMAGE.test(s)) return { error: `${spec.label}, ${name}: the picture could not be used. Choose it again.` }
      if (f.options && !f.options.includes(s)) return { error: `${spec.label}, ${name}: choose one of the listed options for ${f.label.toLowerCase()}.` }
      o[f.k] = s
    }
    for (const k of spec.keep) {
      const v = item?.[k]
      if (v == null) continue
      if ((k === 'w' || k === 'h') && Number.isFinite(v) && v > 0 && v < 10000) o[k] = Math.round(v)
      else if (k === 'slug' && typeof v === 'string' && /^[a-z0-9-]{1,60}$/.test(v)) o[k] = v
      else if (k === 'plan' && typeof v === 'string' && IMAGE.test(v)) o[k] = v
      else if (k === 'url' && typeof v === 'string' && URL_OK.test(v)) o[k] = v
      else if ((k === 'short' || k === 'sheet') && typeof v === 'string' && !bad(v)) o[k] = text(v, 60)
      else if (k === 'tags' && Array.isArray(v)) o[k] = v.map((s) => text(s, 40)).filter((s) => s && !bad(s)).slice(0, 8)
      else if (k === 'steps' && Array.isArray(v)) o[k] = v.slice(0, 6).map((s) => ({ title: text(s?.title, 60), text: text(s?.text, 160) })).filter((s) => s.title && !bad(s.title + s.text))
    }
    out.push(o)
  }
  return { value: out }
}

// every picture a piece of content points at
export function picturesIn(content) {
  const set = new Set()
  for (const c of content?.clients || []) if (c.logo) set.add(c.logo)
  for (const key of Object.keys(LISTS)) for (const it of content?.[key] || []) if (it.image) set.add(it.image)
  return set
}
export const small800 = (p) => p.replace(/\.webp$/, '-800.webp')
