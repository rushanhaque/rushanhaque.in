# Admin panel — setup and troubleshooting

## Which site is "live"

This repo deploys to **Vercel**, serving `https://www.rushanhaque.in`
(and `https://rushanhaque-in.vercel.app`).

`rushanhaque.in` is **a different, older website** on GitHub Pages. It is not
built from this repo — `/admin.html` and `/data/projects.js` both 404 there. If you
publish from the admin panel and then check `.online`, you will never see your
change, because that host serves a different project entirely.

`sitemap.xml` and the JSON-LD block in `index.html` still advertise `.online` as
the canonical URL. That is pointing search engines at the wrong site, but changing
it is an SEO decision — left as-is deliberately. Decide which domain you want and
fix them together.

## Required environment variables (Vercel → Project → Settings → Environment Variables)

| Variable | Required | What it is |
|---|---|---|
| `ADMIN_PUBLISH_SECRET` | **yes** | Any long random string. You type this into the Publish tab. **Without it, publishing is disabled** — both `/api/publish` and `/api/save` return 503. |
| `GITHUB_TOKEN` | yes | Fine-grained PAT, **Contents: read & write** on this repo only. |
| `GITHUB_OWNER` | yes | `rushanhaque` |
| `GITHUB_REPO` | yes | `rushanhaque.in` |
| `GITHUB_BRANCH` | no | Defaults to `main`. |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> Previously `/api/save` skipped its auth check entirely when no token was set,
> which left it callable by anyone on the internet. Both routes now **fail closed**.

## When something looks wrong, run this first

```bash
npm run check:live
```

It reports, in order: whether the host is serving *this* repo or a different site,
whether the latest commit is deployed, whether every API route exists, whether
photos are filed correctly, and whether the cache headers are right.

Point it at another host with `npm run check:live -- https://example.com`.

## Other commands

```bash
npm run validate
```

Validates `vercel.json` against the keys Vercel accepts. This also runs as the
build command, so a bad config fails the build instead of being silently rejected
by the host. It specifically catches `"//"` comment keys — `vercel.json` sets
`additionalProperties: false`, so one comment key rejects the entire deploy with
no useful error, and the site just stops updating.

```bash
npm test
```

27 tests, no browser and no network required.

## How publishing works

Pressing **Publish** sends one request to `/api/publish`, which makes **one commit**
via the GitHub Git Data API:

```
get ref → get parent commit → stage photo blobs → create tree → create commit → fast-forward ref
```

Everything lands together, so the site never sees a half-published state.

- **Photos** are hashed in the browser (SHA-256) and filed as
  `img/rh/{products,projects,reviews}/<first-20-hex>.<ext>`. Identical bytes produce
  an identical filename, so the same photo is only ever committed once. They are
  committed as real image files — never as base64 inside the catalogue.
- Because the filenames are content-addressed, photos are immutable and served
  `Cache-Control: public, max-age=31536000, immutable`.
- A photo you pick but never attach to an item is never committed.
- `updatedAt` is stamped from the **server** clock into `data/published.json`.
- If the branch moved while you were editing, you get a **409** and a banner.
  Nothing is force-pushed, ever.
- A photo over 3 MB is reported as a **413** with the actual size.

## Staying off stale versions

- Every HTML page is `public, max-age=0, must-revalidate`.
- `/admin.html` is `no-store` plus `X-Robots-Tag: noindex, nofollow`.
- `/version.json` (→ `/api/version`) reports the deployed commit SHA and is `no-store`.
- `js/version-check.js` runs on every public page. It records the build ID at page
  load, then re-checks on focus, visibility change, and `pageshow` with
  `persisted: true` (the bfcache back/forward case — the usual way a phone ends up
  showing a version from hours ago). If the build changed, it reloads **once**,
  guarded by `sessionStorage` against reload loops.
- It never reloads the admin panel, and never reloads while there are unpublished
  local changes.

## Known limitation

Content changes still require a redeploy. A live `/api/catalogue` endpoint that
reads the catalogue straight from GitHub on every request — making publishes visible
within seconds with no rebuild — is **not** implemented. Vercel redeploys this repo
in well under a minute, so this is a latency improvement rather than a fix.
