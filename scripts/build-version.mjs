import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const hash = value => createHash('sha256').update(value).digest('hex');
const content = Object.fromEntries(['projects', 'editorial'].map(file => [file, hash(JSON.stringify(JSON.parse(readFileSync(`content/${file}.json`, 'utf8'))))]));
let commit = process.env.VERCEL_GIT_COMMIT_SHA || '';
if (!commit) { try { commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { /* Source archives have no git metadata. */ } }
const source = createHash('sha256');
function visit(path) {
  for (const entry of readdirSync(path, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name))) {
    const name = join(path, entry.name);
    if (entry.isDirectory()) visit(name);
    else source.update(name.replaceAll('\\', '/')).update(readFileSync(name));
  }
}
for (const directory of ['app', 'components', 'lib', 'content', 'public']) visit(directory);
source.update(readFileSync('package-lock.json')).update(readFileSync('next.config.ts'));
const buildId = `${commit || 'source'}-${source.digest('hex').slice(0, 16)}`;
mkdirSync('generated', { recursive: true });
writeFileSync('generated/release.json', JSON.stringify({ buildId, commit: commit || null, content }, null, 2) + '\n');
console.log(`Release: ${buildId}`);
