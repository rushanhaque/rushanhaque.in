# Rushan Haque — Open Form

Custom React portfolio, implemented with the Sites Vinext starter (Next-compatible App Router), TypeScript, GSAP, ScrollTrigger, Flip, Radix/Shadcn primitives, and Cloudflare D1.

## Design

White is the primary canvas. The requested accent is **#072319**. Geist Variable provides the structural typography; Instrument Serif italic adds editorial contrast. Fonts are self-hosted and their licences are included. The original silver/forest sculpture is a 43,266-byte WebP. Project screenshots document the actual work; the former portfolio was used only for factual information and those project assets.

The redesigned homepage uses a connected GSAP story: oversized individually revealed lettering separates as a forest-green curtain opens, followed by three pinned project compositions with layered image wipes, counter-moving images and masked titles. Project chapter buttons control the native scroll position. Only the visible desktop project accepts keyboard focus; reduced motion and mobile expose every project in normal document flow. Mobile has a shorter opening timeline and individual project parallax. Short landscape screens also use the unpinned presentation.

The type laboratory is a custom spring simulation with pointer/touch repulsion, stronger press response, scatter/recompose controls, three compositions, and a reset. It is independent of React rendering while animating. The writing collection assembles into a paper fan on scroll, with perspective hover/focus responses. A sticky process study develops from grid to typography, image, and final composition as the corresponding explanation enters view. Services, reviews, the filterable project archive, mobile navigation, and all existing form flows remain available.

Native scrolling is preserved. The canvas loop stops when offscreen, when the tab is hidden, when the composition settles without a pointer, and under reduced motion. Its pixel ratio is capped at 1.5. No video background, heavy 3D engine, external font request, or autoplay audio is used. Motion follows system reduced-motion preferences and can be reduced manually. Project and article content is server-rendered and remains available if motion is disabled. All timelines and observers are reverted on unmount or breakpoint changes.

Navigation uses native links with progressive cross-document view transitions. During production testing, the locked Vinext beta's client-router prefetch/navigation exports failed; native navigation removes that failure path and avoids speculative route downloads. Interactive components remain React-driven. Unsupported browsers receive normal document navigation.

## Content

- `content/projects.json`: 22 project entries, including work in progress and forthcoming projects. These are not presented as 22 completed client deliveries.
- `lib/content.ts`: writing metadata, experience, selected certifications, original reviews, services, and insight drafts.
- `app/page.tsx`: curated homepage; the complete archive is separate.
- 45 implemented content routes, including project and writing detail pages.

The three personal-insight pieces and positioning copy are **new editorial drafts written for this build** and should be reviewed by Rushan before public launch. They are not represented as previously published essays. The Zenodo item is described as a technical note, not peer-reviewed research. The former site's “To the Moon and Beyond” entry is not published here because the linked Amazon byline needs clarification. No conversion metrics, awards won by this site, or guaranteed client outcomes are invented.

## Forms

Contact, review, and call requests are persisted in D1. Validation is shared between browser and server. The endpoint enforces same-origin JSON submission, a 16 KB body cap, honeypot validation, hourly request limits, and idempotent request IDs. Reviews enter the database with `pending` status and are never automatically made public. There is no public endpoint exposing submissions.

Call times are preferences in **Asia/Kolkata (IST)**, not available calendar slots or confirmed appointments. A Cal.com/Calendly URL can replace this flow when provided. Email notifications and calendar synchronization are **not connected**; the interface does not claim an email has been sent. Direct email links remain available.

New enquiries are available through the site database; there is no public administration screen. A private inbox/notification integration is the next operational addition before opening the site to client traffic. Do not publish submissions from the database without the corresponding review consent and moderation.

## Run and maintain

Use Node 22.13+ and the lockfile.

```sh
npm run install:ci
npm run dev
npm run build
npm run start
npx tsc --noEmit
node scripts/verify-site.mjs
```

The development URL is `http://localhost:5173`. On this Windows machine, the npm shim used by the Sites helper had a path-resolution issue; invoking the installed npm CLI with Node works:

```powershell
node 'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js' run dev
node 'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js' run build
```

Schema is in `db/schema.ts`. Generate migrations with `npm run db:generate`; never rewrite an applied migration. The first local migration has already been applied. For a fresh local database, build and apply it with:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_chunky_prism.sql
```

The locked local runtime supports compatibility date `2026-05-22`. This is explicit in Vite configuration. Upgrade the runtime before advancing the date.

## Verification

- TypeScript validation passed.
- Production build passed.
- Automated local checks: 45 routes, four 404 cases, durable enquiry creation, idempotent retry, and eight invalid-input/security cases.
- Browser checks: desktop/mobile composition, navigation sheet, 320/390 px layouts, project filtering and list view, live typography preset, call date selection, successful contact and call submissions.
- WebMCP archive tool: valid filtering and invalid-input rejection verified in the browser.

No Lighthouse score or real-user Core Web Vitals claim is made. A full throttled performance trace was unavailable in this tool configuration. Field performance still needs measurement after public launch. Keep third-party analytics and scheduling embeds deferred if later added.

## Launch preparation

Review the editorial drafts, project descriptions, dates and current roles, budget options, selected credentials, and review wording. Add fuller project narratives and outcome evidence when available. Connect the operational inbox and optional live scheduling provider. Confirm the public domain, canonical URLs, privacy wording, and retention process before changing the private preview's audience.

## Primary implementation references

- GSAP: https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/
- Cloudflare D1: https://developers.cloudflare.com/d1/worker-api/prepared-statements/
- Workers: https://developers.cloudflare.com/workers/best-practices/workers-best-practices/
- User's factual source: https://rushanhaque.in/
- Technical note: https://zenodo.org/records/19024124

## Story choreography enhancement

Added a nine-chapter journey control with scroll progress, direct chapter navigation, and a compact mobile presentation. A new Attention / Trust / Connection chapter uses a pinned GSAP sequence on large screens and a flowing, scroll-revealed composition on mobile. Editorial headings use accessible SplitText word masks; project hover labels follow the pointer, selected controls respond magnetically, and experience and insight rows reveal with directional wipes.

Pin refresh priorities preserve downstream reveal positions after resize. Reduced motion removes pins and text masks and keeps every story panel available. Browser checks cover 320/390 px layouts, chapter navigation, and toggling motion off and back on.


## Completion audit update — 21 September 2026

The site now includes a private `/studio` content desk and inbox, GitHub CMS adapter, review moderation, reading tools/RSS, expanded archive filtering/pagination, SEO routes and an Azurio-inspired service chapter. Earlier notes saying there is no CMS or inbox are superseded. See `PLAN_COMPLETION_AUDIT.md` and `OPERATIONS.md` for exact implemented/deferred boundaries. GitHub and Cal.com configuration are deferred by the owner; email notifications are not connected.

## Motion and spacing refinement — 21 September 2026

Replaced overlapping service stacks and book fan with separate cards. Hero now separates text and artwork; featured projects reserve independent image, caption and control rows. The chapter navigator is in normal flow, with focus transferred to the selected section without jumping back. Fixed archive min-content overflow and the narrow contact headline. Replaced small-screen sticky process coverage with normal flow. Added a shared gutter/section spacing scale and slower GSAP easing/scrubbing with smaller travel distances; native scrolling and reduced-motion controls remain.

Verified homepage bounds at 320, 390, 768 and 1920 pixels; mobile archive and contact overflow corrected; reduced-motion mode removes pins. Desktop work image/caption/control geometry and separate service/book spacing checked in-browser. TypeScript validation and production build are release checks; this is not a full device or assistive-technology certification.
