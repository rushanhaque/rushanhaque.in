// Everything search engines and AI assistants read about the site, in one place: each route's
// title, description, canonical address, language alternates and structured data. The build
// writes it into every pre-rendered page; in the browser, <Seo /> keeps it current per route.
import { site } from '../config/site'
import { works, products, writings, reviews, experience, education, languages, chapters } from '../data/content'
import guides from '../data/seo/guides.json'
import sourcePages from '../data/seo/source-pages.json'
import extras from '../data/seo/seo-extras.json'
import { services, areas, industries, articles, LEGAL } from './pages'

export const ORIGIN = site.url.replace(/\/$/, '')
const OG = `${ORIGIN}/og.jpg`
export const ids = { person: `${ORIGIN}/#person`, business: `${ORIGIN}/#business`, website: `${ORIGIN}/#website` }
const phone = site.phone.label.replace(/\s/g, '')

const areaName = (t) => t.replace(/^Website designer in /, '')
export { services, areas, industries, articles, LEGAL }

// Countries clients have written from, plus everywhere else: every project can run remotely.
const countries = ['India', ...new Set(reviews.map((r) => r.location).filter((l) => l && l !== 'India'))]
const served = [...countries.map((name) => ({ '@type': 'Country', name })), { '@type': 'Place', name: 'Worldwide' }]
const sameAs = site.socials.filter((s) => s.label !== 'WhatsApp').map((s) => s.href)
const address = { '@type': 'PostalAddress', addressLocality: 'Moradabad', addressRegion: 'Uttar Pradesh', postalCode: '244001', addressCountry: 'IN' }

/** The identity graph: the person, the practice and the site, linked by @id. */
export function siteGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': ids.website, url: `${ORIGIN}/`, name: 'Rushan Haque', alternateName: 'rushanhaque.in', inLanguage: 'en-IN', publisher: { '@id': ids.person } },
      {
        '@type': 'Person', '@id': ids.person, name: 'Rushan Haque', alternateName: 'Rushan Ul Haque', url: `${ORIGIN}/`, image: OG,
        jobTitle: 'Website developer, designer and writer',
        description: 'Rushan Haque is a developer and writer from Moradabad, India, specialising in UI/UX design, client relationships and development: websites, online stores and software for businesses in India and abroad.',
        email: `mailto:${site.email}`, telephone: phone, address, knowsLanguage: languages,
        knowsAbout: ['Website design', 'Web development', 'UI/UX design', 'E-commerce websites', 'Web applications', 'SEO', 'Generative engine optimization', 'Website speed optimization', 'React', 'AWS', 'Writing'],
        hasOccupation: [
          { '@type': 'Occupation', name: 'Website developer and designer', occupationLocation: served, skills: 'UI/UX design, front-end and back-end development, e-commerce, SEO, generative engine optimization' },
          { '@type': 'Occupation', name: 'Writer', skills: 'Research papers, essays and Urdu poetry' },
        ],
        alumniOf: { '@type': 'CollegeOrUniversity', name: education[0].institution },
        worksFor: { '@id': ids.business }, sameAs,
      },
      {
        '@type': 'ProfessionalService', '@id': ids.business, name: 'Rushan Haque – Website Designer & Developer',
        alternateName: ['Rushan Haque', 'Rushan Haque Web Design'], url: `${ORIGIN}/`,
        description: 'Website designer and web developer in Moradabad, India, for businesses across India and abroad: custom business websites, online stores, export catalogues and web applications, designed and built from scratch, fast and optimised for Google and AI search.',
        image: OG, logo: `${ORIGIN}/favicon-48.png`, priceRange: '₹₹', currenciesAccepted: 'INR',
        telephone: phone, email: site.email, address,
        geo: { '@type': 'GeoCoordinates', latitude: 28.8386, longitude: 78.7733 },
        hasMap: 'https://maps.google.com/?q=Moradabad,+Uttar+Pradesh,+India',
        areaServed: [...areas.map((a) => ({ '@type': 'City', name: a.name })), ...served],
        founder: { '@id': ids.person }, knowsLanguage: languages, sameAs,
        contactPoint: { '@type': 'ContactPoint', telephone: phone, email: site.email, contactType: 'sales', availableLanguage: languages, areaServed: countries },
        hasOfferCatalog: {
          '@type': 'OfferCatalog', name: 'Website services',
          itemListElement: services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.title, url: `${ORIGIN}/${s.slug}`, description: s.description } })),
        },
      },
    ],
  }
}

const crumbs = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [['Home', '/'], ...items].map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: ORIGIN + (path === '/' ? '/' : path) })),
})
const faqPage = (faqs) => faqs.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) } : null
const servicePage = ({ path, name, description, area, lang }) => ({
  '@context': 'https://schema.org', '@type': 'Service', '@id': `${ORIGIN}${path}#service`, name, description, url: ORIGIN + path,
  serviceType: 'Website design and development', provider: { '@id': ids.business }, ...(lang ? { inLanguage: lang } : {}),
  areaServed: area === 'Worldwide' ? served : area ? { '@type': area === 'India' ? 'Country' : 'City', name: area } : areas.map((a) => ({ '@type': 'City', name: a.name })),
})
const strip = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, '’').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim()
const faqsFromHtml = (sections) => {
  const out = []
  for (const html of sections) for (const m of html.matchAll(/<details>\s*<summary>[\s\S]*?<span>([\s\S]*?)<\/span>[\s\S]*?<\/summary>([\s\S]*?)<\/details>/g)) out.push({ q: strip(m[1]), a: strip(m[2]) })
  return out
}

export const guideBySlug = (slug) => guides.find((g) => g.slug === slug)
export const sourceBySlug = (slug) => sourcePages.find((p) => p.slug === slug)
export const extraFor = (slug) => extras[slug]

const BUILT = new Date().toISOString().slice(0, 10)
// the name goes on the end of a title, unless that would push it past what results show
const T = (s) => (s.length + 15 <= 70 ? `${s} | Rushan Haque` : s)

/** Every public route, with what goes in its <head>. */
export function routes() {
  const list = [
    {
      path: '/', priority: '1.0', changefreq: 'weekly',
      title: 'Rushan Haque — Website Developer & Designer in Moradabad, India',
      description: 'Website developer, designer and writer in Moradabad, India. Rushan Haque builds custom websites, online stores and software for businesses across India and abroad.',
      images: [...works, ...products].map((p) => p.image),
      ld: [siteGraph()],
    },
    {
      path: '/work', priority: '0.8', title: T('Work — Websites, Stores & Software Built in India'),
      description: `Selected work by Rushan Haque: websites for ${works.slice(0, 4).map((w) => w.title).join(', ')} and more, plus inventory software and Mailwright.`,
      images: works.map((w) => w.image),
      ld: [crumbs([['Work', '/work']]), { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Selected work', url: `${ORIGIN}/work`, about: { '@id': ids.business }, hasPart: [...works, ...products].map((p) => ({ '@type': 'CreativeWork', name: p.title, url: `${ORIGIN}/work/${p.slug}` })) }],
    },
    {
      path: '/about', priority: '0.8', title: T('About — Developer & Writer from Moradabad, India'),
      description: 'About Rushan Haque: developer and writer from Moradabad, India. Experience, education, seventeen certificates, research papers and Urdu poetry.',
      ld: [crumbs([['About', '/about']]), { '@context': 'https://schema.org', '@type': 'ProfilePage', url: `${ORIGIN}/about`, mainEntity: { '@id': ids.person }, about: { '@id': ids.person } }],
    },
    {
      path: '/contact', priority: '0.8', title: T('Contact — Hire a Website Developer in Moradabad'),
      description: `Start a website project with Rushan Haque in Moradabad, India. WhatsApp ${site.phone.label}, email ${site.email} or book a call. Replies within a day.`,
      ld: [crumbs([['Contact', '/contact']]), { '@context': 'https://schema.org', '@type': 'ContactPage', url: `${ORIGIN}/contact`, about: { '@id': ids.business } }],
    },
    ...[...works, ...products].map((p) => ({
      path: `/work/${p.slug}`, priority: '0.7', images: [p.image],
      title: T(`${p.title} — ${p.field} ${products.includes(p) ? 'software' : 'website'}`),
      description: p.description,
      ld: [crumbs([['Work', '/work'], [p.title, `/work/${p.slug}`]]), {
        '@context': 'https://schema.org', '@type': products.includes(p) ? 'SoftwareApplication' : 'CreativeWork', name: p.title, description: p.description,
        url: `${ORIGIN}/work/${p.slug}`, image: ORIGIN + p.image, creator: { '@id': ids.person }, dateCreated: p.year,
        ...(products.includes(p) ? { applicationCategory: 'BusinessApplication', operatingSystem: 'Web' } : {}), ...(p.url ? { sameAs: p.url } : {}),
      }],
    })),
    ...guides.map((g) => {
      const path = `/${g.slug}`
      const hi = g.lang === 'hi'
      const page = g.schema === 'article'
        ? { '@context': 'https://schema.org', '@type': 'Article', '@id': `${ORIGIN}${path}#article`, headline: g.title, description: g.description, inLanguage: hi ? 'hi-IN' : 'en-IN', url: ORIGIN + path, mainEntityOfPage: ORIGIN + path, datePublished: g.updated, dateModified: g.updated, image: OG, author: { '@id': ids.person }, publisher: { '@id': ids.person }, about: { '@id': ids.business } }
        : servicePage({ path, name: g.title, description: g.description, area: g.area, lang: hi ? 'hi-IN' : 'en-IN' })
      return {
        path, lang: hi ? 'hi' : 'en', priority: g.slug === 'hire-website-developer' || g.slug === 'website-developer-in-moradabad' ? '0.9' : '0.8', lastmod: g.updated <= BUILT ? g.updated : BUILT,
        title: g.metaTitle.includes('Rushan') ? g.metaTitle : T(g.metaTitle), description: g.description,
        alternates: g.alternate ? (hi ? { 'en-IN': g.alternate, 'hi-IN': path, 'x-default': g.alternate } : { 'en-IN': path, 'hi-IN': g.alternate, 'x-default': path }) : null,
        ld: [page, faqPage(g.faqs), crumbs([[g.title, path]])].filter(Boolean),
      }
    }),
    ...sourcePages.map((p) => {
      const path = `/${p.slug}`
      const extra = extras[p.slug]
      return {
        path, priority: p.slug === 'website-designer-in-moradabad' || p.slug === 'website-designer-in-india' ? '0.9' : p.kind === 'Service' ? '0.8' : '0.7',
        title: T(extra?.metaTitle ?? p.title), description: p.description,
        alternates: extra?.alternate ? { 'en-IN': path, 'hi-IN': extra.alternate, 'x-default': path } : null,
        ld: [servicePage({ path, name: p.title, description: p.description, area: p.kind === 'Location' ? areaName(p.title) : undefined }), faqPage(faqsFromHtml(p.sections)), crumbs([[p.title, path]])].filter(Boolean),
      }
    }),
    ...Object.entries(LEGAL).map(([slug, l]) => ({ path: `/${slug}`, priority: '0.2', title: T(l.title), description: l.description, ld: [crumbs([[l.title, `/${slug}`]])] })),
  ]
  // the Hindi pages point back at their English pairs
  for (const r of list) if (r.alternates) for (const [lang, p] of Object.entries(r.alternates)) {
    const pair = list.find((x) => x.path === p)
    if (pair && !pair.alternates && lang !== 'x-default') pair.alternates = r.alternates
  }
  return list
}

let index = null
/** The <head> for a path; unknown paths get the not-found page's, which is kept out of the index. */
export function headFor(path) {
  index ??= new Map(routes().map((r) => [r.path, r]))
  const clean = path.replace(/\/+$/, '') || '/'
  return index.get(clean) ?? { path: clean, title: 'Page not found | Rushan Haque', description: 'This page does not exist. Find websites, guides and contact details on rushanhaque.in.', robots: 'noindex, follow', ld: [] }
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
/** The head tags as an HTML string, for the pre-rendered pages. */
export function headHtml(h, { verify = {} } = {}) {
  const url = ORIGIN + (h.path === '/' ? '/' : h.path)
  const tags = [
    `<title>${esc(h.title)}</title>`,
    `<meta name="description" content="${esc(h.description)}" />`,
    `<meta name="robots" content="${h.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}" />`,
    h.robots ? '' : `<link rel="canonical" href="${url}" />`,
    ...Object.entries(h.alternates || {}).map(([l, p]) => `<link rel="alternate" hreflang="${l}" href="${ORIGIN}${p === '/' ? '/' : p}" />`),
    `<meta property="og:type" content="${h.path === '/' ? 'website' : 'article'}" />`,
    `<meta property="og:site_name" content="Rushan Haque" />`,
    `<meta property="og:locale" content="${h.lang === 'hi' ? 'hi_IN' : 'en_IN'}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(h.title)}" />`,
    `<meta property="og:description" content="${esc(h.description)}" />`,
    `<meta property="og:image" content="${OG}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Rushan Haque — website developer, designer and writer" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(h.title)}" />`,
    `<meta name="twitter:description" content="${esc(h.description)}" />`,
    `<meta name="twitter:image" content="${OG}" />`,
    verify.google ? `<meta name="google-site-verification" content="${esc(verify.google)}" />` : '',
    verify.bing ? `<meta name="msvalidate.01" content="${esc(verify.bing)}" />` : '',
    ...(h.ld || []).map((d) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, '\\u003c')}</script>`),
  ]
  return tags.filter(Boolean).join('\n    ')
}

export { guides, sourcePages, chapters, experience }
