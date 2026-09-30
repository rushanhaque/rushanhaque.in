import { getDatabase } from '@/lib/database';
import { readGithub, commitGithub, contentHash } from '@/lib/github-content';
import { validateContent, type ContentFile } from '@/lib/content-schema';

type Draft = { body: string; base_sha: string; revision: number };
type Publication = { body: string; previous_body: string; revision: number };
export async function publishContent(file: ContentFile, revision: number, publicationRevision: number, rollback = false) {
  const db = getDatabase();
  const draft = await db.prepare('SELECT body, base_sha, revision FROM content_drafts WHERE key = ?').bind(file).first<Draft>();
  const publication = await db.prepare('SELECT body, previous_body, revision FROM content_publications WHERE key = ?').bind(file).first<Publication>();
  if ((publication?.revision || 0) !== publicationRevision) throw Error('Publication history changed. Reload before publishing.');
  if (!rollback && (!draft || draft.revision !== revision || !draft.base_sha)) throw Error('Load GitHub content, save your draft, and review it before publishing.');
  if (rollback && !publication) throw Error('There is no previous publication to restore.');
  const value = validateContent(file, JSON.parse(rollback ? publication!.previous_body : draft!.body));
  const remote = await readGithub(file);
  const targetHash = contentHash(value);
  // A previous request may have committed successfully before its connection
  // failed. Recover its SHA without creating another commit or losing the draft.
  const alreadyCommitted = targetHash === contentHash(remote.data);
  if (!alreadyCommitted && !rollback && remote.sha !== draft!.base_sha) throw Error('GitHub changed since this draft was loaded. Load GitHub source before publishing.');
  if (!alreadyCommitted && rollback && contentHash(remote.data) !== contentHash(JSON.parse(publication!.body))) throw Error('GitHub changed since the last publication. Reload and review the source before restoring.');
  const result = alreadyCommitted
    ? { sha: remote.sha, commit: '', url: '', contentHash: targetHash }
    : await commitGithub(file, value, remote.sha);

  // GitHub is the authority. Database bookkeeping can fail after a successful
  // commit; return that success explicitly so the admin never republishes blind.
  let warning = '';
  let nextRevision = draft?.revision || 0;
  let nextPublication = publicationRevision;
  try {
    if (!alreadyCommitted) {
      const history = publicationRevision === 0
        ? await db.prepare('INSERT INTO content_publications (key, body, previous_body, revision, updated_at) VALUES (?, ?, ?, 1, ?) ON CONFLICT(key) DO NOTHING RETURNING revision').bind(file, JSON.stringify(value), JSON.stringify(remote.data), Date.now()).first<{revision:number}>()
        : await db.prepare('UPDATE content_publications SET body = ?, previous_body = ?, revision = revision + 1, updated_at = ? WHERE key = ? AND revision = ? RETURNING revision').bind(JSON.stringify(value), JSON.stringify(remote.data), Date.now(), file, publicationRevision).first<{revision:number}>();
      if (history) nextPublication = history.revision;
      else warning = 'GitHub accepted the content, but publication history changed concurrently. Reload before another publish.';
    }
    if (draft && !rollback) {
      const updated = await db.prepare('UPDATE content_drafts SET base_sha = ?, revision = revision + 1 WHERE key = ? AND revision = ?').bind(result.sha, file, revision).run();
      if (updated.rowsAffected) nextRevision = revision + 1;
      else warning = 'GitHub accepted the content, but another draft was saved. Reload before another publish.';
    }
  } catch { warning = 'GitHub accepted the content, but private history could not be updated. Reload GitHub source before your next publish.'; }
  return { ok: true, ...result, baseSha: result.sha, revision: nextRevision, publicationRevision: nextPublication, warning, state: 'awaiting-deployment' };
}
