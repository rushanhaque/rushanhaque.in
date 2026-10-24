import sourcePages from '@/content/source-pages.json';
import guides from '@/content/guides.json';
import { getPublishedContent } from '@/lib/published-content';
import { siteOrigin } from '@/lib/seo';
import { email, phone } from '@/lib/content';

export const dynamic = 'force-static';

type Section = { label: string; title: string; body?: string[]; items?: { title: string; text: string }[]; steps?: { title: string; text: string }[]; table?: { head: string[]; rows: string[][] }; links?: string[][] };

// The long form of llms.txt: every guide written out in plain text, facts and answers
// included, so an assistant can quote a complete, current answer with its source.
export async function GET() {
  const { reviews } = await getPublishedContent();
  const section = (s: Section) => [
    `### ${s.title}`,
    ...(s.body ?? []),
    ...(s.items ?? []).map(i => `- ${i.title}: ${i.text}`),
    ...(s.steps ?? []).map((i, n) => `${n + 1}. ${i.title}: ${i.text}`),
    ...(s.table ? [s.table.head.filter(Boolean).join(' | '), ...s.table.rows.map(r => r.join(' | '))] : []),
  ].join('\n');
  const english = guides.filter(g => g.lang === 'en');
  const body = `# Rushan Haque — website designer and developer (full text)

> Freelance website designer and full-stack developer based in India (IST, UTC+5:30), working remotely with businesses in India and abroad. Contact: ${email}, ${phone.label} (WhatsApp), ${siteOrigin}/connect. ${reviews.length} client reviews at ${siteOrigin}/reviews.

## Services
${sourcePages.filter(p => p.kind === 'Service').map(p => `- ${p.title} (${siteOrigin}/${p.slug}): ${p.description}`).join('\n')}

${english.map(g => `## ${g.title}
Source: ${siteOrigin}/${g.slug} (updated ${g.updated})

${g.intro}

${g.facts.map(([k, v]) => `- ${k}: ${v}`).join('\n')}

${(g.sections as Section[]).map(section).join('\n\n')}

### Questions and answers
${g.faqs.map(f => `Q: ${f.q}\nA: ${f.a}`).join('\n\n')}`).join('\n\n---\n\n')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=0, must-revalidate' } });
}
