import { siteOrigin } from '@/lib/seo';
// Search engines and AI answer engines may read everything public; the private studio and APIs stay out.
const agents = ['*', 'Googlebot', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'];
export function GET(){return new Response(`${agents.map(a=>`User-agent: ${a}\nAllow: /\nDisallow: /studio\nDisallow: /api/\n`).join('\n')}\nSitemap: ${siteOrigin}/sitemap.xml\n`,{headers:{'Content-Type':'text/plain; charset=utf-8'}});}
