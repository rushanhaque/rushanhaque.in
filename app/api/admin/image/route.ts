import { z } from 'zod';
import { isOwner, privateJson, readBoundedJson } from '@/lib/admin';
import { writeImage } from '@/lib/github-content';

export const dynamic = 'force-dynamic';
// About 2.6 MB once decoded; the admin resizes and converts images before sending.
const schema = z.object({ name: z.string().regex(/^[a-z0-9][a-z0-9-]{0,60}\.(webp|jpe?g|png)$/), data: z.string().max(3500000).regex(/^[A-Za-z0-9+/]+=*$/) }).strict();

export async function POST(request: Request) {
  if (!await isOwner()) return privateJson({ error: 'Owner access required.' }, 403);
  try {
    const input = schema.parse(await readBoundedJson(request, 3600000));
    return privateJson({ path: await writeImage(input.name, input.data) });
  } catch (error) {
    return privateJson({ error: error instanceof z.ZodError ? 'That image could not be read. Try a JPG, PNG or WebP under 10 MB.' : error instanceof Error ? error.message : 'Upload failed.' }, 400);
  }
}
