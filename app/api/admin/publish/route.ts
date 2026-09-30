import { z } from 'zod';
import { isOwner, privateJson, readBoundedJson } from '@/lib/admin';
import { contentFiles } from '@/lib/content-schema';
import { publishContent } from '@/lib/publish-content';
export const dynamic = 'force-dynamic';
const schema = z.object({ file: z.enum(contentFiles), action: z.enum(['publish', 'rollback']), revision: z.number().int().min(0), publicationRevision: z.number().int().min(0) }).strict();
export async function POST(request: Request) {
  if (!await isOwner()) return privateJson({ error: 'Owner access required.' }, 403);
  try {
    const input = schema.parse(await readBoundedJson(request, 2000));
    return privateJson(await publishContent(input.file, input.revision, input.publicationRevision, input.action === 'rollback'));
  } catch (error) {
    return privateJson({ error: error instanceof z.ZodError ? error.issues[0].message : error instanceof Error ? error.message : 'Publishing is unavailable. Your saved draft is safe.' }, error instanceof z.ZodError ? 400 : 409);
  }
}
