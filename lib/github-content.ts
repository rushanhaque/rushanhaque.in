import { createHash } from 'node:crypto';
import { setting } from '@/lib/admin';
import { validateContent, type ContentFile } from '@/lib/content-schema';

// The admin edits the JSON files in the GitHub repository directly. A commit
// to the deployed branch makes Vercel rebuild the site, which is how an edit
// goes live. Several variable names are accepted so existing Vercel settings work.
const first = (...names: string[]) => names.map(setting).find(Boolean) || '';
const token = () => first('GITHUB_CONTENT_TOKEN', 'GITHUB_TOKEN', 'GITHUB_PAT', 'GH_TOKEN');
export const repository = () => {
  const explicit = first('GITHUB_CONTENT_REPOSITORY', 'GITHUB_REPOSITORY');
  if (explicit) return explicit;
  const owner = first('GITHUB_OWNER', 'VERCEL_GIT_REPO_OWNER'), repo = first('GITHUB_REPO', 'VERCEL_GIT_REPO_SLUG');
  return owner && repo ? `${owner}/${repo}` : 'rushanhaque/rushanhaque.in';
};
export const branch = () => first('GITHUB_CONTENT_BRANCH', 'GITHUB_BRANCH', 'VERCEL_GIT_COMMIT_REF') || 'main';
const prefix = () => { const p = setting('GITHUB_CONTENT_PREFIX'); if (p && !/^(?:[\w.-]+\/)*$/.test(p)) throw Error('Invalid GITHUB_CONTENT_PREFIX.'); return p; };

export const contentHash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const githubStatus = () => ({ ready: !!token() && /^[\w.-]+\/[\w.-]+$/.test(repository()), repository: repository(), branch: branch() });

async function github(path: string, init: RequestInit = {}) {
  if (!githubStatus().ready) throw Error('No GitHub token is set on Vercel (GITHUB_TOKEN), so changes cannot be published.');
  return fetch(`${setting('GITHUB_API_URL') || 'https://api.github.com'}/repos/${repository()}/contents/${prefix()}${path}`, {
    ...init, cache: 'no-store', signal: AbortSignal.timeout(20000),
    headers: { Authorization: `Bearer ${token()}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'rushanhaque-admin', ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
  });
}
const explain = async (response: Response, action: string) => {
  if (response.status === 401) return Error(`GitHub rejected the token while trying to ${action}. Check that the token on Vercel is valid and not expired.`);
  if (response.status === 403 || response.status === 404) return Error(`GitHub refused to ${action}. The token needs “Contents: Read and write” access to ${repository()}.`);
  if (response.status === 409 || response.status === 422) return Error('The content changed on GitHub since you opened the admin. Reload to get the latest version, then make your change again.');
  return Error(`GitHub could not ${action} (status ${response.status}).`);
};

export async function readContent(file: ContentFile) {
  const response = await github(`content/${file}.json?ref=${encodeURIComponent(branch())}`);
  if (!response.ok) throw await explain(response, `read ${file}.json`);
  const data = await response.json() as { sha: string; content: string; encoding: string };
  if (data.encoding !== 'base64') throw Error(`Unexpected encoding for ${file}.json.`);
  return { sha: data.sha, data: validateContent(file, JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'))) };
}

export async function writeContent(file: ContentFile, value: unknown, sha: string, message: string) {
  const data = validateContent(file, value);
  const response = await github(`content/${file}.json`, { method: 'PUT', body: JSON.stringify({ message, content: Buffer.from(JSON.stringify(data, null, 2) + '\n').toString('base64'), sha, branch: branch() }) });
  if (!response.ok) throw await explain(response, `save ${file}.json`);
  const result = await response.json() as { commit: { sha: string; html_url: string }; content: { sha: string } };
  return { sha: result.content.sha, commit: result.commit.sha, url: result.commit.html_url, hash: contentHash(data) };
}

// Uploads an image to public/images, never overwriting an existing file.
export async function writeImage(name: string, base64: string) {
  let final = name;
  for (let attempt = 0; attempt < 5; attempt++) {
    const exists = await github(`public/images/${final}?ref=${encodeURIComponent(branch())}`);
    if (exists.status === 404) break;
    if (!exists.ok) throw await explain(exists, 'check the image folder');
    final = name.replace(/(\.[a-z]+)$/, `-${Math.random().toString(36).slice(2, 7)}$1`);
  }
  const response = await github(`public/images/${final}`, { method: 'PUT', body: JSON.stringify({ message: `Add image ${final} from admin`, content: base64, branch: branch() }) });
  if (!response.ok) throw await explain(response, 'upload the image');
  return `/images/${final}`;
}
