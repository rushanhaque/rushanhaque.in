/* scripts/seo-schema.mjs — generate the JSON-LD knowledge graph from real data.
 *
 * Structured data is the only place on this site where a full commercial
 * vocabulary can live WITHOUT touching the visible design. Search engines and
 * the LLM crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) read
 * JSON-LD directly, so this is what tells them:
 *
 *   who Rushan is, what he sells, where he sells it, and how well it went.
 *
 * This is NOT hidden keyword text. Hidden text is a Google spam violation and
 * gets discounted at render time. schema.org properties are a documented,
 * machine-readable channel that is *meant* to carry exactly this.
 *
 * Ratings and reviews are read from data/reviews.js at build time, so a
 * publish from the admin panel can never leave a stale rating in the markup.
 *
 *   node scripts/seo-schema.mjs           # write
 *   node scripts/seo-schema.mjs --check   # verify committed HTML is current
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
import { SERVICES as SERVICE_PAGES } from '../data/seo-services.mjs';
import { LOCATIONS, locationFAQ } from '../data/seo-locations.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

const SITE = 'https://www.rushanhaque.in';
const ID = {
  person: `${SITE}/#person`,
  business: `${SITE}/#business`,
  website: `${SITE}/#website`,
};

/* ── load the site's own data, same shim style as prerender.mjs ───────── */
function loadData() {
  const sandbox = { window: {}, console };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  for (const file of ['data/projects.js', 'data/products.js', 'data/reviews.js']) {
    vm.runInContext(readFileSync(join(ROOT, file), 'utf8'), sandbox, { filename: file });
  }
  return sandbox.window;
}

/* ── the things Rushan actually does, in the vocabulary buyers search in ──
 * Every entry here is a real capability described on the site. This is the
 * legitimate home for the commercial keyword set. */
const KNOWS_ABOUT = [
  'Web Development', 'Website Design', 'Web Design', 'Front-End Development',
  'Responsive Web Design', 'Custom Website Development', 'Business Website Design',
  'Portfolio Website Design', 'Landing Page Design', 'E-Commerce Website Development',
  'Single Page Applications', 'Static Site Development', 'Web Performance Optimization',
  'Core Web Vitals', 'User Interface Design', 'User Experience Design',
  'Search Engine Optimization', 'Technical SEO', 'Local SEO',
  'Generative Engine Optimization', 'AI Search Optimization', 'Schema Markup',
  'Digital Marketing', 'Social Media Management', 'Content Writing', 'Copywriting',
  'Cloud Infrastructure', 'Web Hosting', 'Website Maintenance',
  'ERP Systems', 'CRM Systems', 'Business Automation',
  'HTML', 'CSS', 'JavaScript', 'Video Editing', 'Artificial Intelligence',
];

/* Service catalogue — mirrors the services shown on the site. */
const SERVICES = [
  ['Website Design and Development',
   'Custom websites designed and built from scratch — business sites, portfolios, landing pages and e-commerce, built for speed and search visibility.'],
  ['Web Application Development',
   'Custom web apps and internal tools, from single-page interfaces to full product front-ends.'],
  ['SEO and Generative Engine Optimization (GEO)',
   'Technical SEO, local SEO and GEO — ranking on Google and becoming the source AI assistants cite.'],
  ['UI and UX Design',
   'Interface and experience design: layout, type, motion and the details that make a site feel considered.'],
  ['Digital Marketing',
   'Performance-based campaigns tied to real outcomes — spend maps to results, not impressions.'],
  ['Cloud Solutions and Hosting',
   'Hosting, storage and infrastructure that scale under load without falling over.'],
  ['ERP and CRM Systems',
   'Systems that run your operations and keep every customer relationship in one place.'],
  ['Social Media Management',
   'Presence, cadence and content for brands that need to show up consistently.'],
  ['Video Editing',
   'Edits for brand, product and social — cut for the platform they land on.'],
  ['Content Writing',
   'Essays, site copy and long-form writing that sounds like a person wrote it.'],
];

/* The local page's FAQ, defined ONCE.
 *
 * These strings are rendered into the visible page AND into FAQPage schema by
 * this same script, so the two can never drift apart. That matters twice over:
 * Google only honours FAQPage markup whose answers are visible on the page,
 * and an answer a reader can actually see is the one an assistant will quote.
 *
 * Nothing here states a fact that isn't verifiable — no invented pricing, no
 * invented turnaround times, no review counts that go stale when the admin
 * panel publishes a new one. */
const LOCAL_FAQ_ENTRIES = [
  ['Who is Rushan Haque?',
   'Rushan Haque is a web developer and website designer based in Moradabad, Uttar Pradesh, India. He builds custom websites, interfaces and web apps for businesses in Moradabad and across India, and has delivered work for clients in Saudi Arabia, Poland and Nepal.'],
  ['How much does a website cost in Moradabad?',
   'It depends on scope. A single-page site costs far less than an e-commerce build or a custom web application. Rather than selling fixed packages, Rushan quotes per project once he understands what the site actually needs to do. Send the brief through the contact page and you will get a quote against it.'],
  ['How long does it take to build a website?',
   'Timeline follows scope and how quickly feedback comes back. A straightforward business site moves fastest; e-commerce stores and custom web applications take longer because of the extra pages, integrations and testing. Every quote comes with a timeline attached to it.'],
  ['Do you work with businesses outside Moradabad?',
   'Yes. The work is remote-friendly. Alongside Moradabad, that covers nearby cities including Rampur, Sambhal, Amroha, Bijnor and Meerut, clients across India, and international projects already delivered in Saudi Arabia, Poland and Nepal.'],
  ['What kind of websites do you build?',
   'Business and corporate websites, portfolio sites, landing pages, e-commerce stores and custom web applications. Every site is built from scratch rather than assembled from a template, and ships optimised for speed, mobile and search visibility.'],
  ['Do you handle SEO as well as the build?',
   'Yes. SEO and Generative Engine Optimization (GEO) are offered alongside the build. SEO covers ranking on Google — technical SEO, local SEO and on-page work. GEO covers becoming the source that AI assistants such as ChatGPT, Perplexity, Gemini and Google AI Overviews cite when someone asks them a question.'],
  ['Will my website work properly on phones?',
   'Yes. Every build is responsive and tested on real screen sizes, not just resized in a browser. Most traffic in India arrives on a phone, so mobile layout and mobile load speed are treated as the default case rather than an afterthought.'],
  ['Do you redesign existing websites?',
   'Yes. That can mean a full rebuild or a targeted pass on the parts that are underperforming — speed, layout, mobile behaviour, or search visibility. The starting point is a look at the current site to work out which of those is actually costing you.'],
];

/* Where the work actually goes. Remote-first, Moradabad-rooted. */
const AREA_SERVED = [
  { '@type': 'City', name: 'Moradabad' },
  { '@type': 'City', name: 'Rampur' },
  { '@type': 'City', name: 'Sambhal' },
  { '@type': 'City', name: 'Amroha' },
  { '@type': 'City', name: 'Bijnor' },
  { '@type': 'City', name: 'Meerut' },
  { '@type': 'City', name: 'Delhi' },
  { '@type': 'State', name: 'Uttar Pradesh' },
  { '@type': 'Country', name: 'India' },
];

/* The same NAP (name, address, phone) that is printed in the footer of every
 * page. Local ranking leans hard on that pair matching — the visible address
 * and the marked-up one have to be the same string, so this is copied from
 * the footer rather than invented here. */
const ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: '94 Qazi Tola',
  addressLocality: 'Moradabad',
  addressRegion: 'Uttar Pradesh',
  postalCode: '244001',
  addressCountry: 'IN',
};

const GEO = { '@type': 'GeoCoordinates', latitude: 28.8386, longitude: 78.7733 };

const SAME_AS = [
  'https://linkedin.com/in/rushanhaque',
  'https://github.com/rushanhaque',
  'https://instagram.com/rushzxcvbnm',
];

const BIO =
  'Rushan Haque is a web developer and website designer based in Moradabad, ' +
  'Uttar Pradesh, India. He builds custom websites, interfaces and web apps for ' +
  'businesses in Moradabad, across India and internationally, and works on SEO ' +
  'and Generative Engine Optimization (GEO) alongside the build.';

/* ── nodes ───────────────────────────────────────────────────────────── */
function personNode() {
  return {
    '@type': 'Person',
    '@id': ID.person,
    name: 'Rushan Haque',
    url: `${SITE}/`,
    image: { '@type': 'ImageObject', url: `${SITE}/img/rh/pfp.jpeg`, width: 853, height: 878 },
    jobTitle: 'Web Developer & Website Designer',
    description: BIO,
    email: 'mailto:rushanulhaque@gmail.com',
    telephone: '+91-76680-47608',
    address: ADDRESS,
    homeLocation: { '@type': 'Place', name: 'Moradabad, Uttar Pradesh, India' },
    nationality: { '@type': 'Country', name: 'India' },
    knowsAbout: KNOWS_ABOUT,
    knowsLanguage: ['English', 'Hindi', 'Urdu'],
    worksFor: { '@id': ID.business },
    sameAs: SAME_AS,
  };
}

function reviewNodes(reviews) {
  return reviews
    .filter((r) => r && r.name && r.text)
    .map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: String(r.name) },
      datePublished: String(r.date || '').slice(0, 10) || undefined,
      reviewBody: String(r.text).replace(/\s+/g, ' ').trim(),
      reviewRating: {
        '@type': 'Rating',
        ratingValue: Number(r.rating) || 5,
        bestRating: 5,
        worstRating: 1,
      },
      itemReviewed: { '@id': ID.business },
    }));
}

/* `full` controls whether the node carries the review bodies and the offer
 * catalogue. Those are ~35KB, and repeating them on all 24 pages made the
 * JSON-LD 46% of every page for no gain — the reviews describe the business
 * once, and the business has one @id. The homepage carries the complete
 * entity; every other page carries the same @id with the identifying facts
 * (NAP, geo, areaServed, rating) so it still stands on its own, minus the bulk. */
function businessNode(reviews, full = true) {
  const rated = reviews.filter((r) => Number(r.rating) > 0);
  const avg = rated.length
    ? rated.reduce((a, b) => a + Number(b.rating), 0) / rated.length
    : null;

  const node = {
    '@type': ['ProfessionalService', 'LocalBusiness'],
    '@id': ID.business,
    name: 'Rushan Haque — Web Development & Design',
    alternateName: 'Rushan Haque Web Design Moradabad',
    description:
      'Web development and website design studio in Moradabad, Uttar Pradesh. ' +
      'Custom websites, e-commerce, web apps, SEO and GEO for businesses in ' +
      'Moradabad, across India and worldwide.',
    url: `${SITE}/`,
    image: `${SITE}/img/rh/pfp.jpeg`,
    telephone: '+91-76680-47608',
    email: 'mailto:rushanulhaque@gmail.com',
    address: ADDRESS,
    geo: GEO,
    areaServed: AREA_SERVED,
    founder: { '@id': ID.person },
    employee: { '@id': ID.person },
    knowsAbout: KNOWS_ABOUT,
    availableLanguage: ['English', 'Hindi', 'Urdu'],
    sameAs: SAME_AS,
    ...(full ? { hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Web development and digital services',
      itemListElement: SERVICES.map(([name, description]) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name,
          description,
          provider: { '@id': ID.business },
          areaServed: AREA_SERVED,
        },
      })),
    } } : {}),
  };

  if (avg && rated.length) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(avg.toFixed(1)),
      reviewCount: rated.length,
      bestRating: 5,
      worstRating: 1,
    };
    if (full) node.review = reviewNodes(reviews);
  }
  return node;
}

function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': ID.website,
    url: `${SITE}/`,
    name: 'Rushan Haque',
    description: BIO,
    publisher: { '@id': ID.person },
    inLanguage: 'en-IN',
  };
}

function webPageNode({ url, name, description, breadcrumb }) {
  const node = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    isPartOf: { '@id': ID.website },
    about: { '@id': ID.person },
    inLanguage: 'en-IN',
  };
  if (breadcrumb) node.breadcrumb = breadcrumb;
  return node;
}

function breadcrumb(trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, item], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      ...(item ? { item } : {}),
    })),
  };
}

function faqNode(pairs) {
  return {
    '@type': 'FAQPage',
    mainEntity: pairs.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

/* ── per-page graphs ─────────────────────────────────────────────────── */
export function buildGraphs(data) {
  const reviews = Array.isArray(data.RH_REVIEWS) ? data.RH_REVIEWS : [];
  const projects = Array.isArray(data.RH_PROJECTS) ? data.RH_PROJECTS : [];

  const core = [personNode(), businessNode(reviews, true), websiteNode()];
  const lean = [personNode(), businessNode(reviews, false), websiteNode()];

  const graphs = {};

  graphs['index.html'] = [
    ...core,
    webPageNode({
      url: `${SITE}/`,
      name: 'Web Developer & Website Designer in Moradabad | Rushan Haque',
      description:
        'Custom websites for businesses in Moradabad and across India — web ' +
        'development, UI design, SEO and GEO by Rushan Haque.',
    }),
  ];

  /* work.html — the portfolio, expressed as a real item list so an assistant
     can enumerate the projects without executing any JavaScript. */
  const items = projects.slice(0, 30).map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'CreativeWork',
      name: String(p.title || p.name || '').trim(),
      ...(p.url ? { url: String(p.url) } : {}),
      ...(p.description ? { description: String(p.description) } : {}),
      ...(p.niche ? { genre: String(p.niche) } : {}),
      ...(/^\d{4}$/.test(String(p.year || '')) ? { dateCreated: String(p.year) } : {}),
      ...(Array.isArray(p.tags) && p.tags.length ? { keywords: p.tags.join(', ') } : {}),
      creator: { '@id': ID.person },
    },
  })).filter((x) => x.item.name);

  graphs['work.html'] = [
    ...lean,
    webPageNode({
      url: `${SITE}/work`,
      name: 'Web Design Portfolio — Websites & Apps | Rushan Haque',
      description:
        'Portfolio of websites, interfaces and tools built by Rushan Haque for ' +
        'clients in Moradabad, across India and abroad.',
      breadcrumb: breadcrumb([['Home', `${SITE}/`], ['Work', `${SITE}/work`]]),
    }),
    { '@type': 'ItemList', name: 'Projects by Rushan Haque', itemListElement: items },
  ];

  graphs['contact.html'] = [
    ...lean,
    webPageNode({
      url: `${SITE}/contact`,
      name: 'Hire a Web Developer in Moradabad | Rushan Haque',
      description:
        'Start a website project with Rushan Haque — web developer and designer ' +
        'in Moradabad, India.',
      breadcrumb: breadcrumb([['Home', `${SITE}/`], ['Contact', `${SITE}/contact`]]),
    }),
    {
      '@type': 'ContactPage',
      '@id': `${SITE}/contact#contactpage`,
      url: `${SITE}/contact`,
      mainEntity: { '@id': ID.business },
    },
  ];

  /* The local landing page. FAQ entries here are ALSO rendered visibly on the
     page — Google requires FAQPage content to be visible, and an answer the
     user can read is the one an assistant will quote. */
  const LOCAL_FAQ = LOCAL_FAQ_ENTRIES;

  /* ── hub pages ────────────────────────────────────────────────────────
   * These are the breadcrumb parents the generated pages name, so the trail
   * resolves instead of pointing at a 404, and they are the link hubs that
   * stop eighteen pages behaving like eighteen orphans. */
  graphs['services.html'] = [
    ...lean,
    webPageNode({
      url: `${SITE}/services`,
      name: 'Web Development & SEO Services in India | Rushan Haque',
      description:
        'Website design, e-commerce, web applications, SEO and GEO — every service in one place.',
      breadcrumb: breadcrumb([['Home', `${SITE}/`], ['Services', `${SITE}/services`]]),
    }),
    {
      '@type': 'ItemList',
      name: 'Services offered by Rushan Haque',
      itemListElement: SERVICE_PAGES.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: s.h1,
        url: `${SITE}/${s.slug}`,
      })),
    },
  ];

  graphs['areas-served.html'] = [
    ...lean,
    webPageNode({
      url: `${SITE}/areas-served`,
      name: 'Areas Served Across Uttar Pradesh | Rushan Haque',
      description:
        'Website design and development across Uttar Pradesh, Delhi NCR and remote worldwide.',
      breadcrumb: breadcrumb([['Home', `${SITE}/`], ['Areas served', `${SITE}/areas-served`]]),
    }),
    {
      '@type': 'ItemList',
      name: 'Cities served',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Website designer in Moradabad',
          url: `${SITE}/website-designer-in-moradabad`,
        },
        ...LOCATIONS.map((l, i) => ({
          '@type': 'ListItem',
          position: i + 2,
          name: `Website designer in ${l.city}`,
          url: `${SITE}/${l.slug}`,
        })),
      ],
    },
  ];

  /* ── generated service pages ──────────────────────────────────────────
   * Each carries a Service node describing what is sold, a FAQPage whose
   * answers are visible on the page, and a breadcrumb. The Service links
   * back to the same business @id as everything else, so the whole site
   * resolves to one entity rather than eighteen unrelated ones. */
  for (const svc of SERVICE_PAGES) {
    const url = `${SITE}/${svc.slug}`;
    graphs[`${svc.slug}.html`] = [
      ...lean,
      webPageNode({
        url,
        name: svc.title,
        description: svc.description,
        breadcrumb: breadcrumb([
          ['Home', `${SITE}/`],
          ['Services', `${SITE}/services`],
          [svc.h1, url],
        ]),
      }),
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: svc.h1,
        description: svc.answer,
        serviceType: svc.h1,
        provider: { '@id': ID.business },
        areaServed: AREA_SERVED,
        url,
        ...(svc.related && svc.related.length
          ? { isRelatedTo: svc.related.map((s) => ({ '@id': `${SITE}/${s}#service` })) }
          : {}),
      },
      faqNode(svc.faq),
    ];
  }

  /* ── generated location pages ─────────────────────────────────────────
   * A LocalBusiness scoped to the city it serves, so a local query has an
   * entity to match against, plus the same visible FAQ as markup. */
  for (const loc of LOCATIONS) {
    const url = `${SITE}/${loc.slug}`;
    graphs[`${loc.slug}.html`] = [
      ...lean,
      webPageNode({
        url,
        name: loc.title,
        description: loc.description,
        breadcrumb: breadcrumb([
          ['Home', `${SITE}/`],
          ['Areas served', `${SITE}/areas-served`],
          [`Website designer in ${loc.city}`, url],
        ]),
      }),
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: `Website design and development in ${loc.city}`,
        description: loc.answer,
        serviceType: 'Website design and development',
        provider: { '@id': ID.business },
        areaServed: {
          '@type': 'City',
          name: loc.city,
          containedInPlace: { '@type': 'AdministrativeArea', name: loc.region },
        },
        url,
      },
      faqNode(locationFAQ(loc)),
    ];
  }

  graphs['website-designer-in-moradabad.html'] = [
    ...lean,
    webPageNode({
      url: `${SITE}/website-designer-in-moradabad`,
      name: 'Website Designer in Moradabad — Custom Websites | Rushan Haque',
      description:
        'Website designer and web developer in Moradabad, Uttar Pradesh. Custom ' +
        'business websites, e-commerce and web apps, built and optimised for search.',
      breadcrumb: breadcrumb([
        ['Home', `${SITE}/`],
        ['Website Designer in Moradabad', `${SITE}/website-designer-in-moradabad`],
      ]),
    }),
    faqNode(LOCAL_FAQ),
  ];

  return { graphs, LOCAL_FAQ };
}

/* ── visible FAQ markup ──────────────────────────────────────────────────
 * Rendered from the same LOCAL_FAQ_ENTRIES that feed the FAQPage schema.
 * Plain <details> — no JS, works with the keyboard, and the answer text is in
 * the DOM as served, so a crawler that never runs a script still reads it. */
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function faqHTML(entries) {
  return entries.map(([q, a], i) => `
                    <details class="a-faq__item a-reveal"${i === 0 ? ' open' : ''} data-reveal-delay="${i * 40}">
                      <summary class="a-faq__q">
                        <span class="a-faq__no">${String(i + 1).padStart(2, '0')}</span>
                        <span class="a-faq__label">${esc(q)}</span>
                        <span class="a-faq__mark" aria-hidden="true"></span>
                      </summary>
                      <div class="a-faq__a"><p>${esc(a)}</p></div>
                    </details>`).join('\n');
}

/* ── injection ───────────────────────────────────────────────────────── */
const OPEN = '<!-- rh:schema — generated by scripts/seo-schema.mjs, do not edit by hand -->';
const CLOSE = '<!-- /rh:schema -->';
const FAQ_OPEN = '<!-- rh:faq — generated by scripts/seo-schema.mjs, do not edit by hand -->';
const FAQ_CLOSE = '<!-- /rh:faq -->';

/* Fill <div id="rh-faq"> with the rendered FAQ, replacing whatever is there. */
function injectFAQ(html, entries) {
  const m = html.match(/(<div\b[^>]*\bid=["']rh-faq["'][^>]*>)([\s\S]*?)(<\/div>\s*<!-- \/rh-faq -->)/);
  if (!m) return { html, found: false };
  const body = `\n${FAQ_OPEN}\n${faqHTML(entries)}\n${FAQ_CLOSE}\n                  `;
  return { html: html.replace(m[0], m[1] + body + m[3]), found: true };
}

function block(graph) {
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
  const indented = json.split('\n').map((l) => '    ' + l).join('\n');
  return `    ${OPEN}\n    <script type="application/ld+json">\n${indented}\n    </script>\n    ${CLOSE}`;
}

function injectSchema(html, graph) {
  const body = block(graph);
  const start = html.indexOf(OPEN);
  if (start !== -1) {
    const end = html.indexOf(CLOSE, start);
    if (end === -1) throw new Error('schema: opening marker without a closing marker');
    const lineStart = html.lastIndexOf('\n', start) + 1;
    return html.slice(0, lineStart) + body + html.slice(end + CLOSE.length);
  }
  /* First run on this page: replace any hand-written ld+json, else sit
     directly before </head>. */
  const legacy = html.match(
    /[ \t]*<!--[^>]*[Ss]tructured data[\s\S]*?-->\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/
  );
  if (legacy) return html.replace(legacy[0], body);

  const solo = html.match(/[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>/);
  if (solo) return html.replace(solo[0], body);

  return html.replace(/([ \t]*)<\/head>/, `${body}\n$1</head>`);
}

/* ── run ─────────────────────────────────────────────────────────────── */
const data = loadData();
const { graphs, LOCAL_FAQ } = buildGraphs(data);

const stale = [];
let wrote = 0;

for (const [file, graph] of Object.entries(graphs)) {
  const path = join(ROOT, file);
  let original;
  try {
    original = readFileSync(path, 'utf8');
  } catch {
    console.log(`  ${file} — not present, skipped`);
    continue;
  }

  let next = injectSchema(original, graph);

  /* The local page also carries the visible FAQ that its schema describes. */
  if (file === 'website-designer-in-moradabad.html') {
    const res = injectFAQ(next, LOCAL_FAQ);
    if (!res.found) throw new Error(`schema: ${file} is missing its <div id="rh-faq"> container`);
    next = res.html;
  }
  if (next === original) {
    console.log(`  ${file} — already current`);
    continue;
  }
  if (CHECK) stale.push(file);
  else {
    writeFileSync(path, next);
    wrote++;
    console.log(`  ${file} — schema written (${graph.length} nodes)`);
  }
}

if (CHECK && stale.length) {
  console.error(
    `\nJSON-LD is out of date: ${stale.join(', ')}\n` +
    `Run "npm run schema" and commit the result.`
  );
  process.exit(1);
}

console.log(CHECK ? 'JSON-LD is current.' : `Schema OK (${wrote} file(s) written).`);
