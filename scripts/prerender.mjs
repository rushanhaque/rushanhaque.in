// After the browser and server builds: writes every route as a finished HTML page (words, head
// tags and structured data already in place), then the sitemap, robots.txt, and the llms.txt
// summaries that AI assistants read. Run by `npm run build`.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(import.meta.dirname, '..')
const dist = path.join(root, 'dist')
const ssr = path.join(root, 'dist-ssr')

// React warns about layout effects when rendering on the server; they only run in the browser
const warn = console.error
console.error = (msg, ...rest) => { if (!String(msg).includes('useLayoutEffect')) warn(msg, ...rest) }

const m = await import(pathToFileURL(path.join(ssr, 'entry-server.js')).href)
const { render, routes, headFor, headHtml, ORIGIN, site, works, products, writings, reviews, faq, experience, education, languages, services, areas, industries, articles, guides, sourcePages } = m
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const verify = {
  google: process.env.GOOGLE_SITE_VERIFICATION || process.env.VITE_GOOGLE_SITE_VERIFICATION || '',
  bing: process.env.BING_SITE_VERIFICATION || process.env.VITE_BING_SITE_VERIFICATION || '',
}

function page(head, html) {
  const out = template
    .replace('<html lang="en">', `<html lang="${head.lang === 'hi' ? 'hi' : 'en'}">`)
    .replace('<!--app-head-->', headHtml(head, { verify }))
    .replace('<!--app-html-->', html)
  // a page that failed to render must stop the build, not ship empty
  const failed = html.match(/data-msg="([^"]*)"/)
  if (failed) throw new Error(`${head.path} did not render: ${failed[1]}`)
  return out
}
const write = (file, text) => {
  const to = path.join(dist, file)
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.writeFileSync(to, text)
}

// 1. every page, as /about.html served at /about (Vercel's clean URLs)
const list = routes()
for (const r of list) write(r.path === '/' ? 'index.html' : `${r.path.slice(1)}.html`, page(r, render(r.path)))
write('404.html', page(headFor('/404'), render('/404')))

// 2. the sitemap, with language pairs and the screenshots each page shows
const today = new Date().toISOString().slice(0, 10)
const xml = (s) => s.replace(/&/g, '&amp;')
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${list.map((r) => `  <url>
    <loc>${ORIGIN}${r.path === '/' ? '/' : r.path}</loc>
    <lastmod>${r.lastmod || today}</lastmod>
    <changefreq>${r.changefreq || 'monthly'}</changefreq>
    <priority>${r.priority}</priority>${Object.entries(r.alternates || {}).map(([l, p]) => `
    <xhtml:link rel="alternate" hreflang="${l}" href="${ORIGIN}${p}"/>`).join('')}${(r.images || []).map((i) => `
    <image:image><image:loc>${xml(ORIGIN + i)}</image:loc></image:image>`).join('')}
  </url>`).join('\n')}
</urlset>
`
write('sitemap.xml', sitemap)

// 3. robots.txt: every search engine and AI assistant is welcome to read and cite the site
const bots = ['Googlebot', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot', 'Applebot-Extended', 'DuckDuckBot', 'YandexBot', 'CCBot', 'Meta-ExternalAgent', 'Amazonbot']
write('robots.txt', `# rushanhaque.in — open to search engines and AI assistants alike
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
- Contact: ${site.email} · WhatsApp ${site.phone.label} · ${site.booking}
- Languages: ${languages.join(', ')}
- Education: ${education[0].title}, ${education[0].institution} (${education[0].period})
- Experience: ${experience.map((e) => `${e.role}, ${e.company} (${e.period})`).join('; ')}
- Reviews: ${reviews.length} client reviews, all five stars
- Website: ${ORIGIN}/

## Main pages

${link('Home', '/', 'recent client sites, current builds, products, clientele, areas served, services, reviews, writing')}
${link('Work', '/work', 'selected client websites and software')}
${link('About', '/about', 'journey, credentials, writing')}
${link('Contact', '/contact', 'start a project')}

## Services

${services.map((s) => link(s.title, `/${s.slug}`, s.description)).join('\n')}

## Areas served

${areas.map((a) => link(`Website designer in ${a.name}`, `/${a.slug}`)).join('\n')}

## Guides

${[...articles, ...industries].map((g) => link(g.title, `/${g.slug}`, g.description)).join('\n')}

## Client work

${[...works, ...products].map((p) => link(p.title, `/work/${p.slug}`, `${p.description}${p.url ? ` Live at ${p.url}` : ''}`)).join('\n')}

## Writing

${writings.map((w) => `- ${w.title} (${w.kind}, ${w.year})${w.url ? `: ${w.url}` : ''}`).join('\n')}

## Optional

- [Full text of every page](${ORIGIN}/llms-full.txt)
`
write('llms.txt', llms)

// 5. llms-full.txt: the words of every landing page and the common questions, for assistants
// that want more than the summary
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

fs.rmSync(ssr, { recursive: true, force: true })
console.log(`prerendered ${list.length} pages + 404, sitemap, robots.txt, llms.txt, llms-full.txt${verify.google || verify.bing ? ' (with site verification)' : ''}`)
