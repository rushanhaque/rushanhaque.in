# Rushan Haque

The portfolio of Rushan Haque, website developer, designer and writer in Moradabad, India. Goes live at
[rushanhaque.in](https://www.rushanhaque.in), in place of the previous design, with every address and every search tag
unchanged.

Ivory daylight, deep wine and brushed brass. The home page is told in chapters; a guilloché rosette (the engraving
on a watch dial, a nod to Moradabad, the Brass City) turns behind the name.

## Stack

- React 19 and Vite 8. Every page is prerendered to finished HTML at build time; React takes over the markup that is
  already there.
- No animation or router library: `src/lib/motion.js` (one frame loop, a tween, a scrub) and `src/lib/router.jsx`
  replace about 60 kB of dependencies. Arrivals are CSS transitions; scroll-tied effects use CSS scroll-driven
  animations where the browser has them, so the compositor does the work.
- Lenis smooths the wheel on capable desktops only.

## Commands

```bash
npm install
npm run dev       # http://localhost:5310
npm run build     # browser build, server build, then prerenders every page into dist/
npm run serve     # serves dist/ as Vercel will (clean URLs, redirects, 404) on http://localhost:5312
npm run map       # rebuilds public/data/map.bin from scripts/source
npm run indexnow  # after a deploy: tells Bing, Yandex and others what changed
```

Add `?skip` to a URL to skip the opening, and `?tier=low|mid|high` to force a quality level.

## Search, kept exactly

- `seo/heads.json` is a snapshot of the live site's head tags (titles, descriptions, canonicals, hreflang
  alternates, social cards, JSON-LD) for all 58 indexed pages. The prerender writes them back unchanged.
- `seo/sitemap.xml`, `robots.txt`, `llms.txt` and `llms-full.txt` are copied as they are. The build fails if any
  sitemap address has no page.
- `vercel.json` keeps every redirect, clean URLs and headers. The IndexNow key file stays in `public/`.
- The guide, service and area pages keep their words exactly (`src/data/seo`), and each loads only its own text.

To take a fresh snapshot from a live build: `node scripts/snapshot-seo.mjs <live dist folder>`.

## Where things live

```
src/
  sections/    the home page's chapters, in order (see pages/Home.jsx)
  pages/       Home, Works, Case, Product, About, Contact, Landing (guides, services, areas, legal), Admin, NotFound
  components/  Header (top bar + floating menu button), Menu (side sheet with this page's chapters), Footer (slides
               up from under the page), Curtain (between pages), Intro (the greeting loader), Booking (Cal.com),
               Rosette, Journey, ServeMap, Lens, Btn, Head, Split
  lib/         motion, reveal (data-r arrivals), routes, router, scroll, meta, device, forms, sections
  data/        content.js holds the words; editable.json is what /admin edits; seo/ holds the reading pages
  styles/      tokens, base, ui, chrome, header, home, works, services, pages
scripts/       prerender, seo-split, serve, build-map (the About map), indexnow, snapshot-seo
api/           the /admin endpoints (Vercel functions), unchanged
```

## Forms and booking

The contact and quote forms send through Formspree (`VITE_FORMSPREE_ID`, falling back to the id in
`src/config/site.js`); if that fails they offer email or WhatsApp with the message already written. "Book a call"
opens Cal.com's scheduler inside the site, loaded only when asked for.

## Admin

`/admin` edits the About text and the client list, exactly as before: same environment variables
(`ADMIN_PUBLISH_SECRET`, `CMS_SESSION_SECRET`, `GITHUB_TOKEN`) and the same file, `src/data/editable.json`, committed
to `rushanhaque/rushanhaque.in` on `main`.

## How it stays fast

- Finished HTML, the page's own chunk preloaded, fonts preloaded and swapped; no layout shift.
- Each guide page ships only its own words (1 to 2.5 kB). The map in About is a 47 kB file of outlines, drawn on a 2D canvas only
  when its camera moves.
- Devices are sorted into tiers before anything paints (`index.html`): old phones and data savers skip the costly
  flourishes; reduced motion gets a still site with the same words.
