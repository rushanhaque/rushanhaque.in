// The pages written after the live snapshot (src/data/seo/guides-added.json). The live pages keep their own tags,
// sitemap entries and llms text exactly as they are; these helpers give the added pages the same kind of tags,
// and add them to the end of the sitemap and the llms files, so nothing that is already indexed changes.
import fs from 'node:fs'
import path from 'node:path'

const ORIGIN = 'https://www.rushanhaque.in'
const OG = `${ORIGIN}/og.png`
const AREA = [
  { '@type': 'Country', name: 'India' },
  { '@type': 'Country', name: 'Saudi Arabia' },
  { '@type': 'Country', name: 'Poland' },
  { '@type': 'Country', name: 'Nepal' },
  { '@type': 'Place', name: 'Worldwide' },
]

export function loadAdded(root) {
  const file = path.join(root, 'src/data/seo/guides-added.json')
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : []
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const ld = (o) => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', ...o }).replace(/</g, '\\u003c')}</script>`
const plain = (s) => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()

// the same set of tags, in the same order, as the live guide pages carry
export function headFor(g) {
  const url = `${ORIGIN}/${g.slug}`
  const title = `${g.metaTitle} | Rushan Haque`
  const main = g.schema === 'article'
    ? { '@type': 'Article', '@id': `${url}#article`, headline: g.title, description: g.description, inLanguage: 'en-IN', url, mainEntityOfPage: url, datePublished: g.published || g.updated, dateModified: g.updated, image: OG, author: { '@id': `${ORIGIN}/#person` }, publisher: { '@id': `${ORIGIN}/#person` }, about: { '@id': `${ORIGIN}/#business` } }
    : { '@type': 'Service', '@id': `${url}#service`, name: g.title, description: g.description, url, serviceType: g.serviceType || 'Website design and development', provider: { '@id': `${ORIGIN}/#business` }, inLanguage: 'en-IN', areaServed: AREA }
  return [
    '<meta name="author" content="Rushan Haque" />',
    '<meta name="format-detection" content="telephone=no" />',
    '<meta name="geo.region" content="IN-UP" />',
    '<meta name="geo.placename" content="Moradabad" />',
    '<meta name="geo.position" content="28.8386;78.7733" />',
    '<meta name="ICBM" content="28.8386, 78.7733" />',
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(g.description)}" />`,
    '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />',
    `<link rel="canonical" href="${url}" />`,
    '<meta property="og:type" content="article" />',
    '<meta property="og:site_name" content="Rushan Haque" />',
    '<meta property="og:locale" content="en_IN" />',
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(g.description)}" />`,
    `<meta property="og:image" content="${OG}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta property="og:image:alt" content="Rushan Haque — website developer, designer and writer" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(g.description)}" />`,
    `<meta name="twitter:image" content="${OG}" />`,
    ld(main),
    ld({ '@type': 'FAQPage', mainEntity: g.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })) }),
    ld({ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` }, { '@type': 'ListItem', position: 2, name: g.title, item: url }] }),
    '<link rel="alternate" type="text/plain" href="/llms.txt" title="Summary for AI assistants" />',
  ]
}

// the live sitemap, with the added pages after its last entry
export function withSitemap(xml, added) {
  const entries = added.map((g) => `  <url>\n    <loc>${ORIGIN}/${g.slug}</loc>\n    <lastmod>${g.updated}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`).join('')
  return xml.replace(/<\/urlset>\s*$/, `${entries}</urlset>\n`)
}

const GROUPS = [
  ['service', 'Software and design services'],
  ['guide', 'More guides'],
  ['industry', 'More industries'],
]
const kind = (g) => g.group || 'guide'

// the live llms.txt, with the added pages listed at the end
export function withLlms(txt, added) {
  const parts = GROUPS.map(([k, name]) => {
    const list = added.filter((g) => kind(g) === k)
    return list.length ? `## ${name}\n\n${list.map((g) => `- [${g.title}](${ORIGIN}/${g.slug}): ${g.description}`).join('\n')}\n` : ''
  }).filter(Boolean)
  return `${txt.replace(/\s*$/, '')}\n\n${parts.join('\n')}`
}

// the live llms-full.txt, with the full words of every added page at the end
export function withLlmsFull(txt, added) {
  const page = (g) => {
    const out = [`## ${g.title}`, `${ORIGIN}/${g.slug}`, '', g.description, '', g.intro, '', g.facts.map(([k, v]) => `- ${k}: ${plain(v)}`).join('\n')]
    for (const s of g.sections) {
      out.push('', `### ${s.title}`)
      for (const p of s.body || []) out.push('', p)
      if (s.items) out.push('', s.items.map((it) => `- ${it.title}: ${it.text}`).join('\n'))
      if (s.steps) out.push('', s.steps.map((st, i) => `${i + 1}. ${st.title}: ${st.text}`).join('\n'))
      if (s.table) out.push('', s.table.rows.map((r) => `- ${r[0]}: ${s.table.head.slice(1).map((h, i) => (h ? `${h}: ${r[i + 1]}` : r[i + 1])).join('; ')}`).join('\n'))
      if (s.links) out.push('', s.links.map(([t, h]) => `- ${t}: ${h.startsWith('http') ? h : ORIGIN + h}`).join('\n'))
    }
    out.push('', '### Questions', '', g.faqs.map((f) => `- ${f.q} ${plain(f.a)}`).join('\n'))
    return out.join('\n')
  }
  return `${txt.replace(/\s*$/, '')}\n\n\n${added.map(page).join('\n\n\n')}\n`
}
