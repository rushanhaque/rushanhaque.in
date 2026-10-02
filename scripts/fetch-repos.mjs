// Fetches the public GitHub repositories at build time for the seismograph
// study and saves them as static JSON. Uses GITHUB_TOKEN when set (it stays on
// the build machine). Never fails the build: on any error the last saved file is kept.
import { writeFileSync, existsSync } from 'node:fs';

const USER = process.env.GITHUB_USER || 'rushanhaque';
const OUT = 'content/studies/repos.json';
// Housekeeping repositories that are not projects.
const SKIP = new Set([USER.toLowerCase(), 'google-verification-', 'badge1']);

// "AFUrnsCatalogue" -> "AF Urns Catalogue", "SHADOW_CHAT" -> "Shadow Chat".
const title = name => name
  .replace(/[-_]+/g, ' ')
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .replace(/(\d)([A-Z][a-z])/g, '$1 $2')
  .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
  .split(' ').filter(Boolean)
  .map(w => (w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w) ? w[0] + w.slice(1).toLowerCase() : w))
  .map(w => w[0].toUpperCase() + w.slice(1))
  .join(' ');

try {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'rushanhaque.in build' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const repos = [];
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&type=owner&sort=created&page=${page}`, { headers, signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const batch = await res.json();
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  const projects = repos
    .filter(r => !r.fork && !r.archived && !SKIP.has(r.name.toLowerCase()) && !r.name.toLowerCase().endsWith('.github.io'))
    .map(r => ({ name: r.name, title: title(r.name), date: r.created_at.slice(0, 10), pushed: r.pushed_at.slice(0, 10), language: r.language ?? null, description: r.description ?? null, url: r.homepage || r.html_url, repo: r.html_url }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
  if (!projects.length) throw new Error('no repositories returned');
  // A listed live site that no longer answers falls back to the repository.
  const alive = async url => { try { const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(10000), headers: { 'User-Agent': 'Mozilla/5.0 rushanhaque.in build' } }); return r.status < 400; } catch { return false; } };
  let dead = 0;
  for (let i = 0; i < projects.length; i += 8) await Promise.all(projects.slice(i, i + 8).map(async p => { if (p.url !== p.repo && !(await alive(p.url))) { p.url = p.repo; dead++; } }));
  if (dead) console.log(`Repositories: ${dead} dead site links now point to GitHub`);
  writeFileSync(OUT, JSON.stringify({ user: USER, fetchedAt: new Date().toISOString().slice(0, 10), projects }, null, 1) + '\n');
  console.log(`Repositories: ${projects.length} projects`);
} catch (error) {
  console.warn(`Repositories not refreshed (${error.message}); ${existsSync(OUT) ? 'keeping the saved file' : 'no saved file yet'}.`);
  if (!existsSync(OUT)) writeFileSync(OUT, JSON.stringify({ user: USER, fetchedAt: null, projects: [] }) + '\n');
}
