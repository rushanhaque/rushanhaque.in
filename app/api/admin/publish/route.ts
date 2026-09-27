import { z } from 'zod';
import { getDatabase } from '@/lib/database';
import { isOwner, privateJson, readBoundedJson } from '@/lib/admin';
import { contentFiles, validateContent } from '@/lib/content-schema';
import projects from '@/content/projects.json';
import editorial from '@/content/editorial.json';

const schema = z.object({ file: z.enum(contentFiles), action: z.enum(['publish', 'rollback']), revision: z.number().int().min(0), publicationRevision: z.number().int().min(0) }).strict();
export async function POST(request: Request) {
  if (!await isOwner()) return privateJson({ error: 'Owner access required.' }, 403);
  try {
    const input = schema.parse(await readBoundedJson(request, 2000));
    const db = getDatabase();
    if (input.action === 'rollback') {
      const row = await db.prepare('UPDATE content_publications SET body = previous_body, previous_body = body, revision = revision + 1, updated_at = ? WHERE key = ? AND revision = ? RETURNING revision').bind(Date.now(), input.file, input.publicationRevision).first<{revision:number}>();
      return row ? privateJson({ publicationRevision: row.revision }) : privateJson({ error: 'Publication changed or no previous version exists. Reload before restoring.' }, 409);
    }
    const draft = await db.prepare('SELECT body, revision FROM content_drafts WHERE key = ?').bind(input.file).first<{body:string;revision:number}>();
    if (!draft || draft.revision !== input.revision) return privateJson({ error: 'Save your draft and reload the latest revision before publishing.' }, 409);
    validateContent(input.file, JSON.parse(draft.body));
    const fallback = JSON.stringify(input.file === 'projects' ? projects : editorial);
    // Both the saved draft and publication revisions are checked by the write itself.
    const row = input.publicationRevision === 0
      ? await db.prepare('INSERT INTO content_publications (key, body, previous_body, revision, updated_at) SELECT key, body, ?, 1, ? FROM content_drafts WHERE key = ? AND revision = ? AND body = ? ON CONFLICT(key) DO NOTHING RETURNING revision').bind(fallback, Date.now(), input.file, input.revision, draft.body).first<{revision:number}>()
      : await db.prepare('UPDATE content_publications SET previous_body = body, body = ?, revision = revision + 1, updated_at = ? WHERE key = ? AND revision = ? AND EXISTS (SELECT 1 FROM content_drafts WHERE key = ? AND revision = ? AND body = ?) RETURNING revision').bind(draft.body, Date.now(), input.file, input.publicationRevision, input.file, input.revision, draft.body).first<{revision:number}>();
    return row ? privateJson({ publicationRevision: row.revision }) : privateJson({ error: 'Content changed in another session. Reload before publishing.' }, 409);
  } catch (error) {
    return privateJson({ error: error instanceof z.ZodError ? error.issues[0].message : 'Publishing is unavailable. Your saved draft is safe.' }, error instanceof z.ZodError ? 400 : 503);
  }
}
