/* scripts/validate-config.mjs — fail loudly here, not silently on the host.
 *
 * Vercel sets additionalProperties:false on every object in vercel.json, so a
 * single unknown key — including a "//" comment key — makes the platform
 * reject the whole deploy with no obvious error: the site simply stops
 * updating. This runs as the build command, so a bad config fails the build
 * instead of quietly serving a stale site.
 *
 *   npm run validate
 */
import { readFileSync, existsSync } from 'node:fs';

const problems = [];
const notes = [];

/* Keys Vercel actually accepts at the top level of vercel.json. */
const TOP_LEVEL = new Set([
  '$schema', 'buildCommand', 'cleanUrls', 'crons', 'devCommand', 'framework',
  'functions', 'git', 'headers', 'ignoreCommand', 'images', 'installCommand',
  'outputDirectory', 'public', 'redirects', 'regions', 'rewrites', 'routes',
  'trailingSlash',
]);

const ROUTE_KEYS = {
  headers: new Set(['source', 'headers', 'has', 'missing']),
  rewrites: new Set(['source', 'destination', 'has', 'missing']),
  redirects: new Set(['source', 'destination', 'permanent', 'statusCode', 'has', 'missing']),
};

function validateVercel(file) {
  let raw;
  try {
    raw = readFileSync(file, 'utf8');
  } catch (e) {
    problems.push(`${file}: cannot read (${e.message})`);
    return;
  }

  let cfg;
  try {
    cfg = JSON.parse(raw);
  } catch (e) {
    problems.push(`${file}: not valid JSON — ${e.message}. Vercel rejects the deploy outright. Note JSON has no comments: // and /* */ are syntax errors here.`);
    return;
  }

  if (cfg === null || typeof cfg !== 'object' || Array.isArray(cfg)) {
    problems.push(`${file}: top level must be a JSON object.`);
    return;
  }

  for (const key of Object.keys(cfg)) {
    if (TOP_LEVEL.has(key)) continue;
    const hint = key.trim().startsWith('//')
      ? ' This looks like a comment. vercel.json has additionalProperties:false — a comment key silently rejects the ENTIRE deploy.'
      : '';
    problems.push(`${file}: unknown top-level key ${JSON.stringify(key)}.${hint}`);
  }

  for (const section of ['headers', 'rewrites', 'redirects']) {
    const list = cfg[section];
    if (list === undefined) continue;
    if (!Array.isArray(list)) {
      problems.push(`${file}: "${section}" must be an array.`);
      continue;
    }
    list.forEach((entry, i) => {
      const where = `${file}: ${section}[${i}]`;
      if (!entry || typeof entry !== 'object') {
        problems.push(`${where} must be an object.`);
        return;
      }
      for (const key of Object.keys(entry)) {
        if (!ROUTE_KEYS[section].has(key)) {
          problems.push(`${where}: unknown key ${JSON.stringify(key)}.`);
        }
      }
      if (typeof entry.source !== 'string') {
        problems.push(`${where}: "source" is required and must be a string.`);
      }
      if (section === 'headers') {
        if (!Array.isArray(entry.headers)) {
          problems.push(`${where}: "headers" must be an array of {key,value}.`);
        } else {
          entry.headers.forEach((h, j) => {
            if (!h || typeof h.key !== 'string' || typeof h.value !== 'string') {
              problems.push(`${where}.headers[${j}]: needs string "key" and "value".`);
            }
          });
        }
      }
      if (section !== 'headers' && typeof entry.destination !== 'string') {
        problems.push(`${where}: "destination" is required and must be a string.`);
      }
    });
  }

  /* Things that are valid but almost certainly wrong for this site. */
  const adminHeader = (cfg.headers || []).find((h) => h.source === '/admin.html');
  if (!adminHeader) {
    notes.push('vercel.json: no /admin.html header rule — the admin panel should be no-store + noindex.');
  } else {
    const cc = (adminHeader.headers || []).find((h) => h.key.toLowerCase() === 'cache-control');
    if (!cc || !/no-store/.test(cc.value)) {
      notes.push('vercel.json: /admin.html is not no-store — the admin may load a stale snapshot.');
    }
  }
  if (!(cfg.rewrites || []).some((r) => r.source === '/version.json')) {
    notes.push('vercel.json: /version.json is not routed — browsers cannot detect new deploys.');
  }
}

/* Other hosts, so this stays useful if the site ever moves. */
function validateNetlify(file) {
  const raw = readFileSync(file, 'utf8');
  if (/^\s*\/\//m.test(raw)) {
    problems.push(`${file}: "//" is not a TOML comment — use "#".`);
  }
}

if (existsSync('vercel.json')) validateVercel('vercel.json');
else notes.push('No vercel.json found.');

if (existsSync('netlify.toml')) validateNetlify('netlify.toml');

/* The API routes the site depends on must exist on disk. */
for (const route of ['api/publish.js', 'api/version.js', 'api/_github.mjs']) {
  if (!existsSync(route)) problems.push(`Missing required API route: ${route}`);
}

for (const n of notes) console.warn(`warning  ${n}`);

if (problems.length) {
  console.error(`\nHost config validation FAILED (${problems.length} problem${problems.length > 1 ? 's' : ''}):\n`);
  for (const p of problems) console.error(`  error  ${p}`);
  console.error('\nFix these before deploying — the host will otherwise reject the deploy without a useful message.\n');
  process.exit(1);
}

console.log(`Host config OK${notes.length ? ` (${notes.length} warning${notes.length > 1 ? 's' : ''})` : ''}.`);
