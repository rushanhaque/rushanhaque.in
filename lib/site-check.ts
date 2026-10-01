import { parsePublicUrl, safeFetch, type SafeResponse } from '@/lib/safe-fetch';

export type CheckStatus = 'pass' | 'fix' | 'info';
export type Check = { id: string; label: string; status: CheckStatus; detail: string; service: 'Development' | 'Performance' | 'SEO + GEO' | 'Accessibility' };
export type SiteReport = { url: string; finalUrl: string; title: string; checkedAt: string; responseMs: number; htmlKb: number; checks: Check[]; summary: { total: number; pass: number; fix: number; geoReady: boolean } };

const attr = (tag: string, name: string) => tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))?.slice(2).find(v => v !== undefined) ?? null;
const tags = (html: string, name: string) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(m => m[0]);
const metaContent = (html: string, key: string, by: 'name' | 'property' = 'name') => { const tag = tags(html, 'meta').find(t => attr(t, by)?.toLowerCase() === key); return tag ? attr(tag, 'content') : null; };
const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

async function tryFetch(url: URL): Promise<SafeResponse | null> {
  try { return await safeFetch(url, { timeoutMs: 6000, maxBytes: 300_000 }); } catch { return null; }
}

// Real, verifiable checks on one public page, each mapped to the service that fixes it.
export async function checkSite(input: string): Promise<SiteReport> {
  const target = parsePublicUrl(input);
  const page = await safeFetch(target);
  if (page.status >= 400) throw new Error(`The website answered with HTTP ${page.status}.`);
  const type = String(page.headers['content-type'] || '');
  if (type && !/html/i.test(type)) throw new Error('That address does not return a web page.');
  const html = page.body;
  const final = new URL(page.url);
  const head = html.split(/<\/head>/i)[0] ?? html;
  const checks: Check[] = [];
  const add = (c: Check) => checks.push(c);

  add({ id: 'https', label: 'Served securely (HTTPS)', service: 'Development', status: final.protocol === 'https:' ? 'pass' : 'fix', detail: final.protocol === 'https:' ? 'The page loads over HTTPS.' : 'The page loads over plain HTTP; browsers mark it “Not secure”.' });
  add({ id: 'response', label: 'Fast first response', service: 'Performance', status: page.ttfbMs <= 800 ? 'pass' : 'fix', detail: `First byte in ${page.ttfbMs} ms, measured from this portfolio’s server${page.redirects ? ` after ${page.redirects} redirect${page.redirects > 1 ? 's' : ''}` : ''}.` });
  const kb = Math.round(page.bytes / 1024);
  add({ id: 'weight', label: 'Lean HTML', service: 'Performance', status: kb <= 150 ? 'pass' : 'fix', detail: `The HTML document is ${kb} KB on the wire${kb > 150 ? '; heavy markup slows the first paint' : ''}.` });
  const encoding = String(page.headers['content-encoding'] || '');
  add({ id: 'compression', label: 'Compressed transfer', service: 'Performance', status: /br|gzip|deflate/i.test(encoding) ? 'pass' : 'fix', detail: encoding ? `Sent with ${encoding} compression.` : 'Sent uncompressed.' });
  const blocking = tags(head, 'script').filter(t => attr(t, 'src') && !/\b(async|defer)\b/i.test(t) && attr(t, 'type') !== 'module').length;
  add({ id: 'blocking', label: 'No render-blocking scripts', service: 'Performance', status: blocking === 0 ? 'pass' : 'fix', detail: blocking ? `${blocking} script${blocking > 1 ? 's' : ''} in the head block rendering.` : 'Scripts in the head do not block the first paint.' });
  const viewport = metaContent(html, 'viewport');
  add({ id: 'viewport', label: 'Mobile-ready viewport', service: 'Development', status: viewport && /width=device-width/i.test(viewport) ? 'pass' : 'fix', detail: viewport ? `viewport: ${viewport}` : 'No viewport tag: phones render the desktop layout zoomed out.' });
  const title = decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  add({ id: 'title', label: 'Descriptive page title', service: 'SEO + GEO', status: title.length >= 15 && title.length <= 65 ? 'pass' : 'fix', detail: title ? `“${title.slice(0, 80)}” (${title.length} characters).` : 'No title: search results show the bare address.' });
  const description = decode(metaContent(html, 'description') ?? '');
  add({ id: 'description', label: 'Search description', service: 'SEO + GEO', status: description.length >= 50 && description.length <= 170 ? 'pass' : 'fix', detail: !description ? 'No meta description: search engines improvise one.' : description.length > 170 ? `${description.length} characters; search results cut it off after about 160.` : description.length < 50 ? `Only ${description.length} characters; too short to sell the page.` : `${description.length} characters.` });
  const h1 = tags(html, 'h1').length;
  add({ id: 'h1', label: 'One main heading', service: 'SEO + GEO', status: h1 === 1 ? 'pass' : 'fix', detail: `${h1} <h1> heading${h1 === 1 ? '' : 's'} on the page.` });
  const canonical = tags(head, 'link').find(t => attr(t, 'rel')?.toLowerCase() === 'canonical');
  add({ id: 'canonical', label: 'Canonical address', service: 'SEO + GEO', status: canonical ? 'pass' : 'fix', detail: canonical ? `Points to ${attr(canonical, 'href')}.` : 'No canonical link; duplicate addresses can split ranking.' });
  const og = metaContent(html, 'og:image', 'property');
  add({ id: 'og', label: 'Social share preview', service: 'SEO + GEO', status: og ? 'pass' : 'fix', detail: og ? 'An og:image is set for link previews.' : 'Shared links show no image on WhatsApp, LinkedIn and others.' });
  const jsonLd = (html.match(/<script[^>]+application\/ld\+json/gi) ?? []).length;
  add({ id: 'schema', label: 'Structured data', service: 'SEO + GEO', status: jsonLd ? 'pass' : 'fix', detail: jsonLd ? `${jsonLd} JSON-LD block${jsonLd > 1 ? 's' : ''} describe the business to search engines and AI assistants.` : 'No structured data for search engines or AI assistants to read.' });
  const lang = attr(tags(html, 'html')[0] ?? '', 'lang');
  add({ id: 'lang', label: 'Page language declared', service: 'Accessibility', status: lang ? 'pass' : 'fix', detail: lang ? `lang="${lang}"` : 'No lang attribute; screen readers may mispronounce the page.' });
  const imgs = tags(html, 'img');
  const missingAlt = imgs.filter(t => attr(t, 'alt') === null).length;
  add({ id: 'alt', label: 'Images described', service: 'Accessibility', status: missingAlt === 0 ? 'pass' : 'fix', detail: imgs.length ? `${imgs.length - missingAlt} of ${imgs.length} images in the HTML have alt text.` : 'No images in the initial HTML (they may load later with JavaScript).' });

  const origin = new URL(final.origin);
  const [robots, llms] = await Promise.all([tryFetch(new URL('/robots.txt', origin)), tryFetch(new URL('/llms.txt', origin))]);
  const robotsOk = robots && robots.status < 400 && /user-agent/i.test(robots.body);
  add({ id: 'robots', label: 'robots.txt', service: 'SEO + GEO', status: robotsOk ? 'pass' : 'fix', detail: robotsOk ? 'Crawlers get clear rules.' : 'No robots.txt found.' });
  const sitemapRef = robotsOk ? robots!.body.match(/^\s*sitemap:\s*(\S+)/im)?.[1] : undefined;
  let sitemapOk = false;
  if (sitemapRef) { try { const sm = await tryFetch(parsePublicUrl(new URL(sitemapRef, origin).href)); sitemapOk = !!sm && sm.status < 400 && /<(urlset|sitemapindex)/i.test(sm.body); } catch { sitemapOk = false; } }
  if (!sitemapOk) { const sm = await tryFetch(new URL('/sitemap.xml', origin)); sitemapOk = !!sm && sm.status < 400 && /<(urlset|sitemapindex)/i.test(sm.body); }
  add({ id: 'sitemap', label: 'XML sitemap', service: 'SEO + GEO', status: sitemapOk ? 'pass' : 'fix', detail: sitemapOk ? 'Search engines can list every page.' : 'No sitemap found at /sitemap.xml or in robots.txt.' });
  const llmsOk = !!llms && llms.status < 400 && llms.body.trim().length > 20 && !/<html/i.test(llms.body);
  add({ id: 'llms', label: 'AI-assistant guide (llms.txt)', service: 'SEO + GEO', status: llmsOk ? 'pass' : 'fix', detail: llmsOk ? 'An llms.txt tells AI assistants what the business does.' : 'No llms.txt: AI assistants have to guess what the business offers.' });

  const pass = checks.filter(c => c.status === 'pass').length;
  return {
    url: target.href, finalUrl: final.href, title, checkedAt: new Date().toISOString(), responseMs: page.ttfbMs, htmlKb: kb, checks,
    summary: { total: checks.length, pass, fix: checks.length - pass, geoReady: llmsOk && jsonLd > 0 },
  };
}
