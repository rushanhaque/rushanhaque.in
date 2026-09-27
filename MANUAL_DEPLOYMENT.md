# Edition 02 — manual handoff

No deployment was performed for this update. The existing hosted version is unchanged.

## Preview

From this directory, use `npm.cmd run dev` on Windows (or `npm run dev` elsewhere).

- Portfolio: http://localhost:5173/
- CMS: http://localhost:5173/studio
- Local sign-in uses the starter's local-only mock identity. The ignored `.dev.vars` sets `CMS_OWNER_EMAIL` to `seedy@sites.test` for local testing only. Do not use that identity in production.

## CMS workflow

1. Sign in as the configured owner at `/studio`.
2. Select Projects or an editorial collection. Search and select an entry, edit its fields, or add/reorder/remove entries.
3. Save private draft. This does not affect published content.
4. Validate & preview. Correct any validation errors.
5. Publish reviewed content. The server-rendered portfolio, collection/detail pages, navigation count, RSS, and sitemap use published content on the next request.
6. Restore previous publication if needed. This swaps the current and preceding published versions; it leaves the draft unchanged. Export backup downloads validated collection JSON.

The first three projects supply the homepage showcase. The first three writing entries supply the reading shelf. Images reference existing files under `/images/`; asset uploading is not included. Fixed layout headings, contact addresses, and art-direction copy remain in source. The GitHub commit action is optional and requires the repository configuration in `OPERATIONS.md`.

## Build and checks

```powershell
npm.cmd run validate:content
npx.cmd tsc --noEmit
npm.cmd run build
```

With the development server running and the local database initialized:

```powershell
node scripts/verify-site.mjs
node scripts/verify-cms.mjs
```

The CMS check exercises owner access, cross-origin rejection, private drafts, stale revision conflicts, publishing, and rollback. It restores the original draft and published content; it advances local revision numbers. The broader site check creates a clearly labelled local enquiry.

## Deploy later

Keep the existing Sites project and its configured audience unless you intend to change them. This checkout uses a Cloudflare Worker, D1, and Sites gateway authentication; it is not a static HTML export.

- Build the exact source you intend to publish. Output lives in `dist/client` and `dist/server`.
- Include the generated Drizzle migrations, including `0003_nifty_nick_fury.sql`, in your normal Sites release. It adds `content_publications`; earlier applied migrations must remain unchanged.
- Retain the existing `DB` binding and production `CMS_OWNER_EMAIL` secret. The latter must match the verified email forwarded by the Sites gateway.
- Never package `.dev.vars`, `.env*`, local `.wrangler` data, dependencies, or local test outputs as public assets.
- Preserve the Sites authentication gateway. Deploying this Worker directly behind a proxy that accepts caller-supplied identity headers would invalidate the CMS access model. Another host needs a real authentication integration first.
- After deployment, sign in at `/studio`, save a harmless private edit, validate it, and check publishing/rollback before routine use.

Public indexing and audience settings are unchanged. Email delivery and confirmed calendar booking remain separate integrations; the inbox stores enquiries and requested times.

## Design and motion

Edition 02 adds an interactive three-discipline composition, a scroll-linked type ribbon, orbital hero detail, project hover previews, row reveals, book-cover lifts, and responsive editorial spacing. Animations stay enabled regardless of system motion preference, as requested. Hover-only mechanics require a pointer; mobile retains scroll animations and button/touch interaction.
