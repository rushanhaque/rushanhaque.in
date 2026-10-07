import sourcePages from '@/content/source-pages.json';
import profile from '@/content/profile.json';
import { siteOrigin } from '@/lib/seo';
import { email, phone, socials } from '@/lib/content';

// One identity graph for search engines and AI assistants: the person, the
// practice and the site, linked by @id so every page can point back to them.
export const ids = { person: `${siteOrigin}/#person`, business: `${siteOrigin}/#business`, website: `${siteOrigin}/#website` };

const areas = ['Moradabad', ...sourcePages.filter(p => p.kind === 'Location').map(p => p.title.replace('Website designer in ', '')).filter(a => a !== 'Moradabad')];
const services = sourcePages.filter(p => p.kind === 'Service');

export function siteGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite', '@id': ids.website, url: siteOrigin, name: 'Rushan Haque', inLanguage: 'en-IN',
        publisher: { '@id': ids.person },
      },
      {
        '@type': 'Person', '@id': ids.person, name: 'Rushan Haque', alternateName: 'Rushan Ul Haque', url: siteOrigin,
        image: `${siteOrigin}/og.jpg`, jobTitle: 'Website designer and full-stack developer',
        description: profile.bio, email: `mailto:${email}`, telephone: phone.label.replace(/\s/g, ''),
        address: { '@type': 'PostalAddress', addressLocality: 'Moradabad', addressRegion: 'Uttar Pradesh', postalCode: '244001', addressCountry: 'IN' },
        knowsLanguage: profile.languages,
        knowsAbout: ['Website design', 'Web development', 'E-commerce websites', 'Web applications', 'SEO', 'Generative engine optimization', 'Website speed optimization', 'Next.js', 'React', 'AWS'],
        alumniOf: { '@type': 'CollegeOrUniversity', name: 'Moradabad Institute of Technology' },
        sameAs: socials.filter(s => s.name !== 'WhatsApp').map(s => s.url),
        worksFor: { '@id': ids.business },
      },
      {
        '@type': 'ProfessionalService', '@id': ids.business, name: 'Rushan Haque — Website Design & Development',
        alternateName: ['Rushan Haque', 'Rushan Haque Web Design'], url: siteOrigin,
        description: 'Website designer and web developer in Moradabad, Uttar Pradesh. Custom business websites, e-commerce stores, export catalogues and web applications, designed and built from scratch, fast and optimised for Google and AI search.',
        image: `${siteOrigin}/og.jpg`, logo: `${siteOrigin}/logo.webp`,
        telephone: phone.label.replace(/\s/g, ''), email,
        address: { '@type': 'PostalAddress', streetAddress: '94 Qazi Tola', addressLocality: 'Moradabad', addressRegion: 'Uttar Pradesh', postalCode: '244001', addressCountry: 'IN' },
        geo: { '@type': 'GeoCoordinates', latitude: 28.8386, longitude: 78.7733 },
        hasMap: 'https://maps.google.com/?q=Moradabad,+India',
        areaServed: [...areas.map(name => ({ '@type': 'City', name })), { '@type': 'Country', name: 'India' }],
        founder: { '@id': ids.person }, knowsLanguage: profile.languages,
        sameAs: socials.filter(s => s.name !== 'WhatsApp').map(s => s.url),
        contactPoint: { '@type': 'ContactPoint', telephone: phone.label.replace(/\s/g, ''), email, contactType: 'sales', availableLanguage: profile.languages, areaServed: 'IN' },
        hasOfferCatalog: {
          '@type': 'OfferCatalog', name: 'Website services',
          itemListElement: services.map(s => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.title, url: `${siteOrigin}/${s.slug}`, description: s.description } })),
        },
      },
    ],
  };
}

export function breadcrumbs(items: [string, string][]) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', '/'] as [string, string], ...items].map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: siteOrigin + (path === '/' ? '' : path) })) };
}

export function faqPage(faqs: { q: string; a: string }[]) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
}

// A page about one service, offered by the practice in the named areas.
export function servicePage({ path, name, description, area }: { path: string; name: string; description: string; area?: string }) {
  return {
    '@context': 'https://schema.org', '@type': 'Service', '@id': `${siteOrigin}${path}#service`, name, description, url: siteOrigin + path,
    serviceType: 'Website design and development', provider: { '@id': ids.business },
    areaServed: area ? { '@type': 'City', name: area } : areas.map(name => ({ '@type': 'City', name })),
  };
}

// Questions and answers pulled out of an imported page's FAQ markup.
export function faqsFromHtml(sections: string[]) {
  const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, '’').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
  const faqs: { q: string; a: string }[] = [];
  for (const html of sections) for (const m of html.matchAll(/<details>\s*<summary>[\s\S]*?<span>([\s\S]*?)<\/span>[\s\S]*?<\/summary>([\s\S]*?)<\/details>/g)) faqs.push({ q: text(m[1]), a: text(m[2]) });
  return faqs;
}
