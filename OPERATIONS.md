# Operations and configuration

The portfolio runs on Sites with D1. The public content uses published D1 collections, with `content/projects.json` and `content/editorial.json` as the bundled fallback. Keep authentication behind the Sites gateway, which supplies trusted identity headers; do not expose this Worker through an untrusted proxy that accepts caller-supplied identity headers.

## Content desk

`/studio` is owner-only. `CMS_OWNER_EMAIL` must match the signed-in owner's verified email. Missing configuration denies access. Drafts live in D1, use revision checks, and do not alter the public website. Save a draft, validate the preview, then use Publish reviewed content to update the site immediately. Restore previous publication swaps back to the previous snapshot without changing the private draft. Both draft saves and publishing reject stale revisions. The visual editor supports projects, case studies, writing, services, insights, experience, certifications, and reviews. Search, add, remove, reorder, validate, preview, and export records; advanced JSON remains available. Images use existing asset paths; this release does not include binary asset uploads.

Configure these server-side runtime values when ready:

- `GITHUB_CONTENT_TOKEN`: fine-grained token restricted to the chosen repository, with Contents read/write. Never use a public/client environment variable.
- `GITHUB_CONTENT_REPOSITORY`: `owner/repository`.
- `GITHUB_CONTENT_BRANCH`: the existing content branch.
- `GITHUB_CONTENT_PREFIX`: optional folder containing `content/`, without a leading slash.

Load the GitHub source before editing. Save a draft, validate its preview, then commit. GitHub SHA checks prevent silently overwriting external edits. A GitHub commit does not automatically deploy this Sites project. Pull/reconcile the selected content into this checkout, validate, build, then publish through Sites. GitHub is an optional source export. Direct D1 publishing does not require GitHub credentials.

## Enquiries, reviews and booking

Contact, review and call requests persist in D1. Inspect and mark handled through the private inbox in `/studio`. A request is not a calendar booking. Set `CAL_BOOKING_URL` to a real HTTPS Cal.com or Calendly booking URL to display the booking action.

Email notifications are not configured. Check the inbox directly until an email provider and verified sending domain are supplied. Do not report email delivery on submission success.

Before approving a review, verify the relationship and publication consent. Apply the same relevance and authenticity criteria to favourable and critical reviews. Approved reviews expose only name, company and message; contact email remains private. Reject or return a review to pending to remove it from the public projection.

## Release, backup and recovery

Before a release: validate content, run TypeScript, build, apply new migrations to a local D1 database and exercise affected routes. Commit and push the exact source, package the build, save a Sites version and deploy to the existing audience. Never rewrite applied migrations. Production migrations are bundled with the release.

Before a schema change, take an authorised D1 export or provider backup and retain it in access-controlled storage. Verify restoration into a separate local/test database before relying on it. For an application regression, redeploy the previous saved Sites version; database schema rollback needs a separately reviewed forward migration or restored backup. Do not assume redeploying code rolls back data.

`/api/health` checks D1 connectivity. The studio shows approximate aggregate interaction counts for 30 days; records older than 90 days are removed on new event writes. No visitor identity or query parameters are captured. Do Not Track and Global Privacy Control suppress browser events. Counts are not unique visitors or independently verified conversion attribution.

## Public launch gate

The current site is owner-private and intentionally noindexed. Before a public launch, confirm audience/domain, canonical origin, redirects, indexing policy, publication permissions, and real booking/email configuration. Perform device and assistive-technology testing plus lab and field performance measurement. No Lighthouse score, Core Web Vitals result, delivery SLA or award claim has been verified by this implementation.

## Edition 02 verification

TypeScript and content validation, local route/form checks, and the CMS publishing/rollback test are available through the documented commands in MANUAL_DEPLOYMENT.md. Motion is always enabled across system preferences at the owner's explicit request; there is no motion toggle. Desktop pointer effects have responsive touch/scroll counterparts. No award or measured performance score is claimed.
