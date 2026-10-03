import { cookies } from 'next/headers';
import { z } from 'zod';
import { privateJson, readBoundedJson, sameOrigin } from '@/lib/admin';
import { createSession, matchesSecret, sessionCookie, sessionLifetime } from '@/lib/session';

export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    const { password } = z.object({ password: z.string().max(512) }).strict().parse(await readBoundedJson(request, 2000));
    const secret = process.env.ADMIN_PUBLISH_SECRET || '';
    if (secret.length < 16) return privateJson({ error: 'Admin sign-in is not configured.' }, 503);
    if (!matchesSecret(password, secret)) return privateJson({ error: 'Incorrect access key.' }, 401);
    (await cookies()).set(sessionCookie, createSession(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: sessionLifetime });
    return privateJson({ ok: true });
  } catch (error) { return privateJson({ error: error instanceof Error && error.message === 'Invalid origin.' ? 'Sign in from the site itself.' : 'Unable to sign in.' }, 400); }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: 'Invalid origin.' }, 403);
  (await cookies()).set(sessionCookie, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
  return privateJson({ ok: true });
}
