import { z } from 'zod';
import projects from '@/content/projects.json';
import editorial from '@/content/editorial.json';
import { isOwner, privateJson, readBoundedJson } from '@/lib/admin';
import { contentFiles, validateContent } from '@/lib/content-schema';
import { githubStatus, readContent, writeContent } from '@/lib/github-content';

export const dynamic = 'force-dynamic';
const bundled = { projects, editorial };
const schema = z.object({ file: z.enum(contentFiles), data: z.unknown(), sha: z.string().min(1).max(64), message: z.string().max(200).optional() }).strict();
const fail = (error: unknown, status = 400) => privateJson({ error: error instanceof z.ZodError ? `${error.issues[0].path.join(' › ') || 'Content'}: ${error.issues[0].message}` : error instanceof Error ? error.message : 'Something went wrong.' }, status);

// Both content files, read live from GitHub so the admin always edits the latest version.
export async function GET() {
  if (!await isOwner()) return privateJson({ error: 'Owner access required.' }, 403);
  const status = githubStatus();
  if (!status.ready) return privateJson({ status, readOnly: true, files: Object.fromEntries(contentFiles.map(f => [f, { sha: '', data: validateContent(f, bundled[f]) }])) });
  try {
    const entries = await Promise.all(contentFiles.map(async f => [f, await readContent(f)] as const));
    return privateJson({ status, readOnly: false, files: Object.fromEntries(entries) });
  } catch (error) { return fail(error, 502); }
}

// Validates and commits one file. Vercel rebuilds the site from that commit.
export async function POST(request: Request) {
  if (!await isOwner()) return privateJson({ error: 'Owner access required.' }, 403);
  try {
    const input = schema.parse(await readBoundedJson(request, 600000));
    return privateJson(await writeContent(input.file, input.data, input.sha, input.message || `Update ${input.file} from admin`));
  } catch (error) { return fail(error, error instanceof z.ZodError ? 400 : 409); }
}
