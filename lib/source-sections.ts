// Turns the imported service and location pages into structured sections, so
// they can be laid out properly without changing a word. Every section is
// checked: if anything in it is not understood, it is kept as the original HTML.

export type Action = { href: string; text: string };
export type Head = { num: string; name: string; title: string; intro: string[] };
export type Section =
  | { kind: 'lead'; crumb: string; num: string; name: string; facts: [string, string][]; paras: string[]; actions: Action[] }
  | (Head & { kind: 'list'; items: { title: string; num: string; text: string[] }[] })
  | (Head & { kind: 'links'; links: Action[] })
  | (Head & { kind: 'faq'; faqs: { num: string; q: string; a: string[] }[] })
  | (Head & { kind: 'prose' })
  | { kind: 'cta'; label: string; paras: string[]; actions: Action[] }
  | { kind: 'raw'; html: string };

const TOKEN = new RegExp([
  /<span>\s*<a href="\/">\s*<span>Home<\/span>\s*<\/a>\s*<\/span>\s*<span>([\s\S]*?)<\/span>/.source,               // 1 breadcrumb
  /<div class="source-section-label">\s*<span>([\s\S]*?)<\/span>\s*<span>([\s\S]*?)<\/span>\s*<span><\/span>/.source, // 2,3 label
  /<h2>([\s\S]*?)<\/h2>/.source,                                                                                     // 4
  /<h3>([\s\S]*?)<\/h3>/.source,                                                                                     // 5
  /<span>(\d{2})<\/span>/.source,                                                                                    // 6 item number
  /<p>([\s\S]*?)<\/p>/.source,                                                                                       // 7
  /<ul class="source-facts">([\s\S]*?)<\/ul>/.source,                                                                // 8
  /<ul>([\s\S]*?)<\/ul>/.source,                                                                                     // 9 links
  /<details>([\s\S]*?)<\/details>/.source,                                                                           // 10
  /<a href="([^"]*)">\s*<span>([\s\S]*?)<\/span>\s*<\/a>/.source,                                                    // 11,12 action
  /<span>([^<]*)<\/span>/.source,                                                                                    // 13 plain span
  /<div class="(?:source-actions|source-faq)">/.source,                                                              // wrappers
].join('|'), 'g');

const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, '’').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const paras = (html: string) => [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m => m[1].trim());

export function parseSection(raw: string, index: number): Section {
  const html = raw.replace(/<\/?div>/g, '');
  let crumb = '', num = '', name = '', title = '', label = '';
  const intro: string[] = [], items: { title: string; num: string; text: string[] }[] = [], facts: [string, string][] = [], links: Action[] = [], actions: Action[] = [], faqs: { num: string; q: string; a: string[] }[] = [];
  let rest = html;
  for (const m of html.matchAll(TOKEN)) {
    rest = rest.replace(m[0], '');
    if (m[1] !== undefined) crumb = m[0];
    else if (m[2] !== undefined) { num = m[2].trim(); name = m[3].trim(); }
    else if (m[4] !== undefined) title = m[4].trim();
    else if (m[5] !== undefined) items.push({ title: m[5].trim(), num: '', text: [] });
    else if (m[6] !== undefined) { const it = items[items.length - 1]; if (it && !it.num) it.num = m[6]; else return { kind: 'raw', html: raw }; }
    else if (m[7] !== undefined) { const it = items[items.length - 1]; (it ? it.text : intro).push(m[7].trim()); }
    else if (m[8] !== undefined) for (const f of m[8].matchAll(/<li>\s*<span>([\s\S]*?)<\/span>\s*<b>([\s\S]*?)<\/b>\s*<\/li>/g)) facts.push([f[1].trim(), f[2].trim()]);
    else if (m[9] !== undefined) for (const l of m[9].matchAll(/<li>\s*<a href="([^"]*)">([\s\S]*?)<\/a>\s*<\/li>/g)) links.push({ href: l[1], text: l[2].trim() });
    else if (m[10] !== undefined) {
      const d = m[10].match(/<summary>\s*<span class="source-question-number">(\d+)<\/span>\s*<span>([\s\S]*?)<\/span>\s*<span><\/span>\s*<\/summary>([\s\S]*)/);
      if (!d) return { kind: 'raw', html: raw };
      faqs.push({ num: d[1], q: d[2].trim(), a: paras(d[3]) });
    }
    else if (m[11] !== undefined) actions.push({ href: m[11], text: m[12].trim() });
    else if (m[13] !== undefined) label = m[13].trim();
  }
  // Anything left over that is not markup means the section was not fully understood.
  if (text(rest.replace(/<details>[\s\S]*?<\/details>/g, ''))) return { kind: 'raw', html: raw };
  const head = { num, name, title, intro };
  let parsed: Section;
  if (index === 0) parsed = { kind: 'lead', crumb, num, name, facts, paras: intro, actions };
  else if (faqs.length) parsed = { ...head, kind: 'faq', faqs };
  else if (!title && label) parsed = { kind: 'cta', label, paras: intro, actions };
  else if (items.length) parsed = { ...head, kind: 'list', items };
  else if (links.length) parsed = { ...head, kind: 'links', links };
  else if (title) parsed = { ...head, kind: 'prose' };
  else return { kind: 'raw', html: raw };
  // Final guard: the words on the page must be exactly the words imported.
  return text(raw) === text(sectionHtml(parsed)) ? parsed : { kind: 'raw', html: raw };
}

// The section's content in source order, used only to prove nothing was lost.
export function sectionHtml(s: Section): string {
  const head = (h: Head) => `<span>${h.num}</span><span>${h.name}</span><h2>${h.title}</h2>${h.intro.map(p => `<p>${p}</p>`).join('')}`;
  switch (s.kind) {
    case 'lead': return `${s.crumb}<span>${s.num}</span><span>${s.name}</span>${s.facts.map(([k, v]) => `<span>${k}</span><b>${v}</b>`).join('')}${s.paras.map(p => `<p>${p}</p>`).join('')}${s.actions.map(a => `<a>${a.text}</a>`).join('')}`;
    case 'list': return head(s) + s.items.map(i => `<h3>${i.title}</h3><span>${i.num}</span>${i.text.map(p => `<p>${p}</p>`).join('')}`).join('');
    case 'links': return head(s) + s.links.map(l => `<a>${l.text}</a>`).join('');
    case 'faq': return head(s) + s.faqs.map(f => `<span>${f.num}</span><span>${f.q}</span>${f.a.map(p => `<p>${p}</p>`).join('')}`).join('');
    case 'prose': return head(s);
    case 'cta': return `<span>${s.label}</span>${s.paras.map(p => `<p>${p}</p>`).join('')}${s.actions.map(a => `<a>${a.text}</a>`).join('')}`;
    case 'raw': return s.html;
  }
}
export const sectionText = text;
