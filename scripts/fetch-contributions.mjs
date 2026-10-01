// Fetches daily GitHub contribution counts at build time for the seismograph
// study and saves them as static JSON. Uses the GraphQL API when GITHUB_TOKEN is
// set (the token stays on the build machine), otherwise the public contribution
// calendar. Never fails the build: on any error the last saved file is kept.
import { writeFileSync, existsSync } from 'node:fs';

const USER = process.env.GITHUB_USER || 'rushanhaque';
const OUT = 'content/studies/contributions.json';
const FIRST_YEAR = 2024; // account created September 2024

async function viaGraphql(token) {
  const days = [];
  const now = new Date();
  for (let year = FIRST_YEAR; year <= now.getUTCFullYear(); year++) {
    const from = `${year}-01-01T00:00:00Z`, to = year === now.getUTCFullYear() ? now.toISOString() : `${year}-12-31T23:59:59Z`;
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST', headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(15000),
      body: JSON.stringify({ query: 'query($u:String!,$f:DateTime!,$t:DateTime!){user(login:$u){contributionsCollection(from:$f,to:$t){contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}', variables: { u: USER, f: from, t: to } }),
    });
    const json = await res.json();
    const weeks = json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
    if (!weeks) throw new Error('GraphQL returned no calendar');
    for (const w of weeks) for (const d of w.contributionDays) days.push([d.date, d.contributionCount]);
  }
  return days;
}

async function viaPublicCalendar() {
  const days = new Map();
  const now = new Date();
  for (let year = FIRST_YEAR; year <= now.getUTCFullYear(); year++) {
    const res = await fetch(`https://github.com/users/${USER}/contributions?from=${year}-01-01&to=${year}-12-31`, { signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'rushanhaque.in build' } });
    if (!res.ok) throw new Error(`calendar ${year}: HTTP ${res.status}`);
    const html = await res.text();
    const dates = new Map();
    for (const m of html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="([^"]+)"|id="([^"]+)"[^>]*data-date="(\d{4}-\d{2}-\d{2})"/g)) dates.set(m[2] ?? m[3], m[1] ?? m[4]);
    for (const m of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
      const date = dates.get(m[1]);
      if (!date || date.slice(0, 4) !== String(year)) continue;
      const count = /^No contributions/.test(m[2]) ? 0 : Number((m[2].match(/^([\d,]+) contribution/) ?? [, '0'])[1].replace(/,/g, ''));
      days.set(date, count);
    }
  }
  return [...days.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

try {
  const token = process.env.GITHUB_TOKEN;
  const days = token ? await viaGraphql(token) : await viaPublicCalendar();
  const today = new Date().toISOString().slice(0, 10);
  const trimmed = days.filter(([d]) => d <= today);
  if (trimmed.length < 30) throw new Error(`only ${trimmed.length} days parsed`);
  writeFileSync(OUT, JSON.stringify({ user: USER, source: token ? 'github-graphql' : 'github-public-calendar', fetchedAt: today, days: trimmed }) + '\n');
  console.log(`Contributions: ${trimmed.length} days, ${trimmed.reduce((s, [, c]) => s + c, 0)} total (${token ? 'GraphQL' : 'public calendar'})`);
} catch (error) {
  console.warn(`Contributions not refreshed (${error.message}); ${existsSync(OUT) ? 'keeping the saved file' : 'no saved file yet'}.`);
  if (!existsSync(OUT)) writeFileSync(OUT, JSON.stringify({ user: USER, source: 'none', fetchedAt: null, days: [] }) + '\n');
}

