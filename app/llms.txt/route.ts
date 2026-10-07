import sourcePages from '@/content/source-pages.json';
import guides from '@/content/guides.json';
import { getPublishedContent } from '@/lib/published-content';
import { projectAccess } from '@/lib/project-access';
import { siteOrigin } from '@/lib/seo';
import { email, phone, address, socials } from '@/lib/content';

export const dynamic = 'force-static';

// A plain-language summary for AI assistants and answer engines (llmstxt.org).
export async function GET() {
  const { projects, reviews } = await getPublishedContent();
  const live = projects.filter(p => p.category === 'Client work' && projectAccess(p) === 'visit');
  const line = (title: string, path: string, text: string) => `- [${title}](${siteOrigin}${path}): ${text}`;
  const body = `# Rushan Haque

> Website designer and full-stack developer based in Moradabad, Uttar Pradesh, India. Designs and builds custom business websites, e-commerce stores, export catalogues and web applications from scratch, for clients in Moradabad, across India and abroad. Fast, mobile-first, and set up to be found on Google and in AI search.

## Key facts
- Location: ${address.label} (works remotely across India and worldwide)
- Contact: ${email}, ${phone.label} (WhatsApp), ${siteOrigin}/connect
- Languages: English, Hindi, French
- Pricing: every project gets a fixed, written quote with a timeline before work starts.
- Typical timelines: landing page 1–2 weeks; business website 2–4 weeks; e-commerce or catalogue 4–8 weeks.
- Specialism: websites for Moradabad's brass, metal, wood and handicraft exporters and manufacturers.
- Client reviews: ${reviews.length} reviews, average ${(reviews.reduce((a, r) => a + Number(r.rating || 5), 0) / Math.max(1, reviews.length)).toFixed(1)} out of 5, at ${siteOrigin}/reviews
- Profiles: ${socials.filter(s => s.name !== 'WhatsApp').map(s => s.url).join(', ')}

## Services
${sourcePages.filter(p => p.kind === 'Service').map(p => line(p.title, '/' + p.slug, p.description)).join('\n')}

## Guides
${guides.map(g => line(g.title, '/' + g.slug, g.description)).join('\n')}

## Areas served
${sourcePages.filter(p => p.kind === 'Location').map(p => line(p.title, '/' + p.slug, p.description)).join('\n')}

## Live client websites
${live.map(p => `- [${p.title}](${p.url}): ${p.description}`).join('\n')}

## Other pages
${line('Portfolio', '/projects', 'Client websites, upcoming launches and personal software experiments.')}
${line('Credentials', '/certifications', 'Certifications and training.')}
${line('Contact', '/connect', 'WhatsApp, email or a short form; replies within a day.')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
