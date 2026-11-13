// After the browser and server builds: writes every route as a finished HTML page (words, head tags
// and structured data already in place), then the sitemap, robots.txt, and the llms.txt summaries that
// AI assistants read. Run by `npm run build`.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(import.meta.dirname, '..')
const dist = path.join(root, 'dist')
const ssr = path.join(root, 'dist-ssr')

const warn = console.error
console.error = (msg, ...rest) => { if (!String(msg).includes('useLayoutEffect')) warn(msg, ...rest) }

const m = await import(pathToFileURL(path.join(ssr, 'entry-server.js')).href)
const { render, routes, headFor, headHtml, ORIGIN, site, works, products, writings, reviews, faq, experience, education, languages, services, areas, industries, articles, guides, sourcePages } = m
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const verify = {
  google: process.env.GOOGLE_SITE_VERIFICATION || process.env.VITE_GOOGLE_SITE_VERIFICATION || '',
  bing: process.env.BING_SITE_VERIFICATION || process.env.VITE_BING_SITE_VERIFICATION || '',
}

const GROUNDS = { ivory: '#f7f4f1', wine: '#241419' }
function page(head, html) {
  const tone = html.match(/data-(?:tone|fixed)="(\w+)"/)?.[1]
  const opens = GROUNDS[tone]
  return template
    .replace('<html lang="en"', `<html lang="${head.lang === 'hi' ? 'hi' : 'en'}"${opens ? ` data-tone="${tone}"` : ''}`)
    .replace('content="#120a0c"', `content="${opens || '#120a0c'}"`)
    .replace('<!--app-head-->', headHtml(head, { verify }))
    .replace('<!--app-html-->', html)
    // Geist sets only the name on the home page's first screen; every other page would download it for nothing
    .replace(head.path === '/' ? /^$/ : /\s*<link rel="preload" href="\/fonts\/geist\.woff2"[^>]*>/, '')
}
const write = (file, text) => {
  const to = path.join(dist, file)
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.writeFileSync(to, text)
}

// 1. every page, as /about.html served at /about (Vercel's clean URLs)
const list = routes()
for (const r of list) write(r.path === '/' ? 'index.html' : `${r.path.slice(1)}.html`, page(r, render(r.path)))
write('404.html', page(headFor('/404'), render('/this-page-does-not-exist')))
// the owner's admin screen exists as a page, kept out of search
write('admin.html', page({ path: '/admin', title: 'Admin | Rushan Haque', description: 'Private.', robots: 'noindex, nofollow', ld: [] }, render('/admin')))

// 2. the sitemap, with language pairs and the screenshots each page shows
const today = new Date().toISOString().slice(0, 10)
const xml = (s) => s.replace(/&/g, '&amp;')
const loc = (r) => `${ORIGIN}${r.path === '/' ? '/' : r.path}`
const urlXml = (r) => `  <url>
    <loc>${loc(r)}</loc>
    <lastmod>${r.lastmod || today}</lastmod>
    <changefreq>${r.changefreq || 'monthly'}</changefreq>
    <priority>${r.priority}</priority>${Object.entries(r.alternates || {}).map(([l, p]) => `
    <xhtml:link rel="alternate" hreflang="${l}" href="${ORIGIN}${p}"/>`).join('')}${(r.images || []).map((i) => `
    <image:image><image:loc>${xml(ORIGIN + i)}</image:loc></image:image>`).join('')}
  </url>`
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${list.map(urlXml).join('\n')}
</urlset>
`)

// 3. robots.txt: every search engine and AI assistant is welcome to read and cite the site
const bots = ['Googlebot', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot', 'Applebot-Extended', 'DuckDuckBot', 'YandexBot', 'CCBot', 'Meta-ExternalAgent', 'Amazonbot']
write('robots.txt', `# rushanhaque.in: open to search engines and AI assistants alike
User-agent: *
Allow: /

${bots.map((b) => `User-agent: ${b}`).join('\n')}
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`)

// 4. llms.txt: who, what, where and how to get in touch, in plain words, with the key pages
const strip = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, '’').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim()
const link = (title, p, note) => `- [${title}](${ORIGIN}${p})${note ? `: ${note}` : ''}`
const llms = `# Rushan Haque

> Rushan Haque is a website developer, designer and writer based in Moradabad, Uttar Pradesh, India. He designs and builds custom business websites, online stores, export catalogues and web applications from scratch, for businesses across India and abroad (clients in India, Saudi Arabia, Poland and Nepal), and looks after them after launch.

## Key facts

- Name: Rushan Haque (Rushan Ul Haque)
- Role: Website developer and designer; writer. Specialises in UI/UX design, client relationships and development.
- Based in: Moradabad, Uttar Pradesh 244001, India. Works with clients anywhere, remotely.
- Contact: ${site.email}, WhatsApp ${site.phone.label}, ${site.booking}
- Languages: ${languages.join(', ')}
- Education: ${education[0].title}, ${education[0].institution} (${education[0].period})
- Experience: ${experience.map((e) => `${e.role}, ${e.company} (${e.period})`).join('; ')}
- Reviews: ${reviews.length} client reviews, all five stars
- Website: ${ORIGIN}/

## Main pages

${link('Home', '/', 'recent client sites, current builds, products, clientele, areas served, services, reviews, writing')}
${link('Work', '/work', 'selected client websites, software and experiments')}
${link('About', '/about', 'journey, process, credentials, writing')}
${link('Contact', '/contact', 'start a project')}

## Services

${services.map((s) => link(s.title, `/${s.slug}`, s.description)).join('\n')}

## Areas served

${areas.map((a) => link(`Website designer in ${a.name}`, `/${a.slug}`)).join('\n')}

## Guides

${[...articles, ...industries].map((g) => link(g.title, `/${g.slug}`, g.description)).join('\n')}

## Client work

${works.map((p) => link(p.title, `/work/${p.slug}`, `${p.description}${p.url ? ` Live at ${p.url}` : ''}`)).join('\n')}

## Products

${products.map((p) => link(p.title, `/products/${p.slug}`, `${p.description} Request a quote or book a call on the page.`)).join('\n')}

## Writing

${writings.map((w) => `- ${w.title} (${w.kind}, ${w.year})${w.url ? `: ${w.url}` : ''}`).join('\n')}

## Optional

- [Full text of every page](${ORIGIN}/llms-full.txt)
`
write('llms.txt', llms)

// 5. llms-full.txt: the words of every landing page and the common questions
const guideText = (g) => [
  `## ${g.title}`, `${ORIGIN}/${g.slug}`, '', g.intro, '',
  ...g.facts.map(([k, v]) => `- ${k}: ${strip(v)}`), '',
  ...g.sections.flatMap((s) => [`### ${s.title}`, ...(s.body || []), ...(s.items || []).map((i) => `- ${i.title}: ${i.text}`), ...(s.steps || []).map((x, k) => `${k + 1}. ${x.title}: ${x.text}`), ...(s.table ? [s.table.head.join(' | '), ...s.table.rows.map((r) => r.join(' | '))] : []), ...(s.note ? [s.note] : []), '']),
  '### Questions', ...g.faqs.flatMap((f) => [`Q: ${f.q}`, `A: ${f.a}`, '']),
].join('\n')
const sourceText = (p) => [`## ${p.title}`, `${ORIGIN}/${p.slug}`, '', p.description, '', ...p.sections.map((h) => strip(h.replace(/<\/(h2|h3|p|li|summary)>/g, '\n'))), ''].join('\n')
write('llms-full.txt', `${llms}
---

# Common questions

${faq.map((f) => `Q: ${f.q}\nA: ${f.a}\n`).join('\n')}
# Every guide, service and area page

${guides.filter((g) => g.lang !== 'hi').map(guideText).join('\n\n')}

${sourcePages.map(sourceText).join('\n\n')}
`)

// 5. The search side of every page, exactly as on the live site: the same titles, descriptions, links, social cards and
// structured data, and the same sitemap, robots.txt and llms files (snapshot kept in /seo by scripts/snapshot-seo.mjs).
const kept = path.join(root, 'seo', 'heads.json')
if (fs.existsSync(kept)) {
  const heads = JSON.parse(fs.readFileSync(kept, 'utf8'))
  const SEO = /<title>[\s\S]*?<\/title>|<meta\s+(?:name|property)="(?!viewport|theme-color)[^"]+"[^>]*>|<link\s+rel="(?:canonical|alternate)"[^>]*>|<script type="application\/ld\+json">[\s\S]*?<\/script>/g
  let n = 0
  for (const [rel, h] of Object.entries(heads)) {
    const file = path.join(dist, rel)
    if (!fs.existsSync(file)) continue
    let html = fs.readFileSync(file, 'utf8')
    const end = html.indexOf('</head>')
    const head = html.slice(0, end).replace(SEO, '').replace(/\n\s*\n/g, '\n')
    html = head.replace(/(<meta name="viewport"[^>]*>)/, (m) => `${m}\n    ${h.tags.join('\n    ')}`) + html.slice(end)
    html = html.replace(/<html lang="[^"]*"/, `<html lang="${h.lang}"`)
    fs.writeFileSync(file, html)
    n++
  }
  for (const f of ['sitemap.xml', 'robots.txt', 'llms.txt', 'llms-full.txt']) if (fs.existsSync(path.join(root, 'seo', f))) fs.copyFileSync(path.join(root, 'seo', f), path.join(dist, f))
  // a page that has been added since the snapshot is added to its sitemap too, so search can find it; every
  // entry the snapshot already has stays exactly as it was
  const sm = path.join(dist, 'sitemap.xml')
  if (fs.existsSync(sm)) {
    const map = fs.readFileSync(sm, 'utf8')
    const added = list.filter((r) => !map.includes(`<loc>${loc(r)}</loc>`))
    if (added.length) fs.writeFileSync(sm, map.replace('</urlset>', `${added.map(urlXml).join('\n')}\n</urlset>`))
    if (added.length) console.log(`sitemap: added ${added.map((r) => r.path).join(', ')}`)
  }
  console.log(`kept the live site's search side on ${n} pages`)
}

fs.rmSync(ssr, { recursive: true, force: true })
console.log(`prerendered ${list.length} pages + 404, sitemap, robots.txt, llms.txt, llms-full.txt${verify.google || verify.bing ? ' (with site verification)' : ''}`)
