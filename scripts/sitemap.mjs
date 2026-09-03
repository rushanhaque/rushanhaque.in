/* scripts/sitemap.mjs — build sitemap.xml from the routes that actually exist.
 *
 * The sitemap used to be hand-maintained, which meant two failure modes:
 * a new page was invisible to search until someone remembered to add it, and
 * every <lastmod> said whatever date it was last typed. A stale lastmod is
 * worse than none — Google learns to distrust the file and crawls it less.
 *
 * Dates come from the last git commit that touched the page or the data it
 * renders, so publishing new work from the admin panel moves the date on its
 * own. Falls back to file mtime when git history is unavailable (shallow
 * clone, tarball deploy).
 *
 *   node scripts/sitemap.mjs           # write
 *   node scripts/sitemap.mjs --check   # verify committed sitemap is current
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SERVICES } from '../data/seo-services.mjs';
import { LOCATIONS } from '../data/seo-locations.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const SITE = 'https://www.rushanhaque.in';

/* route -> [source file, ...files whose content the page renders]
 *
 * priority is a hint about relative importance within THIS site only; it does
 * not compete with other domains. changefreq is advisory. Both are cheap to
 * get roughly right and harmless when approximate. */
const ROUTES = [
  { loc: '/', file: 'index.html', priority: '1.0', changefreq: 'weekly',
    deps: ['data/projects.js', 'data/products.js', 'data/reviews.js', 'data/journey.js'] },
  { loc: '/website-designer-in-moradabad', file: 'website-designer-in-moradabad.html',
    priority: '0.9', changefreq: 'monthly', deps: [] },
  { loc: '/services', file: 'services.html',
    priority: '0.9', changefreq: 'monthly', deps: ['data/seo-services.mjs'] },
  { loc: '/work', file: 'work.html', priority: '0.8', changefreq: 'weekly',
    deps: ['data/projects.js', 'data/products.js'] },
  { loc: '/areas-served', file: 'areas-served.html',
    priority: '0.8', changefreq: 'monthly', deps: ['data/seo-locations.mjs'] },
  { loc: '/contact', file: 'contact.html', priority: '0.7', changefreq: 'yearly', deps: [] },

  /* The generated network. Service pages outrank city pages in priority
     because they carry the national terms; both sit below the hubs. */
  ...SERVICES.map((s) => ({
    loc: `/${s.slug}`,
    file: `${s.slug}.html`,
    priority: '0.8',
    changefreq: 'monthly',
    deps: ['data/seo-services.mjs'],
  })),
  ...LOCATIONS.map((l) => ({
    loc: `/${l.slug}`,
    file: `${l.slug}.html`,
    priority: '0.7',
    changefreq: 'monthly',
    deps: ['data/seo-locations.mjs'],
  })),
];

function gitDate(file) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], {
      cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out ? out.slice(0, 10) : null;
  } catch {
    return null;
  }
}

function mtime(file) {
  try {
    return statSync(join(ROOT, file)).mtime.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

/* The newest date across the page and everything it renders. */
function lastmod(route) {
  const dates = [route.file, ...route.deps]
    .map((f) => gitDate(f) || mtime(f))
    .filter(Boolean)
    .sort();
  return dates.length ? dates[dates.length - 1] : new Date().toISOString().slice(0, 10);
}

const body = ROUTES.map((r) => `  <url>
    <loc>${SITE}${r.loc}</loc>
    <lastmod>${lastmod(r)}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

const path = join(ROOT, 'sitemap.xml');
let current = '';
try { current = readFileSync(path, 'utf8'); } catch { /* first run */ }

if (current === xml) {
  console.log('sitemap.xml — already current.');
} else if (CHECK) {
  console.error('\nsitemap.xml is out of date. Run "npm run sitemap" and commit the result.');
  process.exit(1);
} else {
  writeFileSync(path, xml);
  console.log(`sitemap.xml — written (${ROUTES.length} routes).`);
}
