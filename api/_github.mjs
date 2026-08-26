/* api/_github.mjs — shared GitHub + validation helpers.
 * Pure functions here are unit-tested by test/*.test.mjs (no network, no browser).
 */

/* Data files the admin panel is allowed to rewrite. Anything else is rejected. */
export const ALLOWED_FILES = new Set([
  'data/projects.js',
  'data/products.js',
  'data/reviews.js',
  'data/journey.js',
  'data/published.json',
]);

/* Content-addressed photos only: a known folder, 20 hex chars, known extension.
 * Anchored at both ends, so "../", absolute paths and nested dirs cannot match. */
export const PHOTO_PATH_RE =
  /^img\/rh\/(products|projects|reviews)\/[a-f0-9]{20}\.(jpg|jpeg|png|webp|avif|gif)$/;

/* A git blob SHA is exactly 40 lowercase hex characters. */
export const BLOB_SHA_RE = /^[a-f0-9]{40}$/;

/* Vercel's request body ceiling for serverless/edge functions is 4.5 MB.
 * Stay under it so we can return a clean 413 instead of a platform error. */
export const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 4 * 1024 * 1024;

export function isAllowedFilePath(path) {
  return typeof path === 'string' && ALLOWED_FILES.has(path);
}

export function isAllowedPhotoPath(path) {
  return typeof path === 'string' && PHOTO_PATH_RE.test(path);
}

export function isValidBlobSha(sha) {
  return typeof sha === 'string' && BLOB_SHA_RE.test(sha);
}

/* Bytes represented by a base64 string, without decoding it. */
export function base64ByteLength(b64) {
  if (typeof b64 !== 'string') return 0;
  const clean = b64.replace(/[^A-Za-z0-9+/=]/g, '');
  const padding = (clean.match(/=+$/) || [''])[0].length;
  return Math.max(0, (clean.length * 3) / 4 - padding);
}

/* Validate the whole publish payload before touching the network.
 * Returns { ok:true, files, photos } or { ok:false, status, error }. */
export function validatePayload(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, status: 400, error: 'Body must be a JSON object' };
  }

  const files = Array.isArray(body.files) ? body.files : [];
  const photos = Array.isArray(body.photos) ? body.photos : [];

  if (!files.length && !photos.length) {
    return { ok: false, status: 400, error: 'Nothing to publish' };
  }

  for (const f of files) {
    if (!isAllowedFilePath(f && f.path)) {
      return { ok: false, status: 400, error: `Invalid file path: ${f && f.path}` };
    }
    if (typeof f.content !== 'string' || !f.content.trim()) {
      return { ok: false, status: 400, error: `Empty content for ${f.path}` };
    }
  }

  let total = 0;
  for (const p of photos) {
    if (!isAllowedPhotoPath(p && p.path)) {
      return { ok: false, status: 400, error: `Invalid photo path: ${p && p.path}` };
    }
    const hasSha = p.sha != null;
    const hasBytes = p.contentBase64 != null;
    if (hasSha && !isValidBlobSha(p.sha)) {
      return { ok: false, status: 400, error: `Invalid blob sha for ${p.path}` };
    }
    if (!hasSha && !hasBytes) {
      return { ok: false, status: 400, error: `Photo ${p.path} has no content or sha` };
    }
    if (hasBytes) {
      const bytes = base64ByteLength(p.contentBase64);
      if (bytes > MAX_PHOTO_BYTES) {
        return {
          ok: false,
          status: 413,
          error: `Photo ${p.path} is ${(bytes / 1048576).toFixed(1)} MB — the limit is ${MAX_PHOTO_BYTES / 1048576} MB. Resize it and try again.`,
        };
      }
      total += bytes;
    }
  }

  if (total > MAX_TOTAL_BYTES) {
    return {
      ok: false,
      status: 413,
      error: `This publish carries ${(total / 1048576).toFixed(1)} MB of photos — the limit is ${MAX_TOTAL_BYTES / 1048576} MB per publish. Publish fewer photos at a time.`,
    };
  }

  /* Same photo staged twice in one payload is committed once. */
  const seen = new Set();
  const deduped = [];
  for (const p of photos) {
    if (seen.has(p.path)) continue;
    seen.add(p.path);
    deduped.push(p);
  }

  return { ok: true, files, photos: deduped };
}

/* Build the git tree entries for a commit. */
export function buildTreeEntries(files, photoBlobs) {
  const entries = files.map((f) => ({
    path: f.path,
    mode: '100644',
    type: 'blob',
    content: f.content,
  }));
  for (const p of photoBlobs) {
    entries.push({ path: p.path, mode: '100644', type: 'blob', sha: p.sha });
  }
  return entries;
}
