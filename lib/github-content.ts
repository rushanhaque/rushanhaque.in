import { createHash } from 'node:crypto';
import { setting } from '@/lib/admin';
import { validateContent, type ContentFile } from '@/lib/content-schema';
const repository = () => setting('GITHUB_CONTENT_REPOSITORY') || [setting('GITHUB_OWNER'), setting('GITHUB_REPO')].filter(Boolean).join('/');
const token = () => setting('GITHUB_CONTENT_TOKEN') || setting('GITHUB_TOKEN');
const branch = () => setting('GITHUB_CONTENT_BRANCH') || setting('GITHUB_BRANCH') || 'main';
export const contentHash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function githubReady() { return !!(token() && /^[\w.-]+\/[\w.-]+$/.test(repository())); }
function config(file: ContentFile) {
  if (!githubReady()) throw Error('GitHub publishing is not configured. Your draft can still be saved.');
  const prefix = setting('GITHUB_CONTENT_PREFIX');
  if (prefix && !/^(?:[\w.-]+\/)*$/.test(prefix)) throw Error('Invalid content prefix.');
  if (setting('VERCEL_ENV') === 'production' && setting('VERCEL_GIT_COMMIT_REF') && branch() !== setting('VERCEL_GIT_COMMIT_REF')) throw Error('The CMS branch differs from the production deployment branch.');
  return { url: `https://api.github.com/repos/${repository()}/contents/${prefix}content/${file}.json`, headers: { Authorization: `Bearer ${token()}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'Rushan-Portfolio-CMS' }, branch: branch() };
}
export async function readGithub(file: ContentFile) {
  const c = config(file);
  const response = await fetch(c.url + '?ref=' + encodeURIComponent(c.branch), { cache: 'no-store', headers: c.headers, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw Error('Could not read GitHub content. Check the repository, branch, and token permissions.');
  const data = await response.json() as { sha: string; content: string; size: number; encoding: string };
  if (data.size > 200000 || data.encoding !== 'base64') throw Error('Unsupported content file.');
  return { sha: data.sha, data: validateContent(file, JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'))) };
}
export async function commitGithub(file: ContentFile, value: unknown, sha: string) {
  const c = config(file);
  const response = await fetch(c.url, { method: 'PUT', cache: 'no-store', headers: { ...c.headers, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(15000), body: JSON.stringify({ message: `Update ${file} from portfolio CMS`, content: Buffer.from(JSON.stringify(value, null, 2) + '\n').toString('base64'), sha, branch: c.branch }) });
  if (response.status === 409 || response.status === 422) throw Error('The source changed. Load the latest GitHub version before publishing again. Your saved draft is preserved.');
  if (!response.ok) throw Error('GitHub did not accept this change. Check token permissions and branch protection.');
  const data = await response.json() as { commit: { sha: string; html_url: string }; content: { sha: string } };
  return { commit: data.commit.sha, url: data.commit.html_url, sha: data.content.sha, contentHash: contentHash(value) };
}
