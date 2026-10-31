# Rushan Haque — Portfolio

A multi-page portfolio built with **React 18, Vite 6, GSAP 3.15 (ScrollTrigger, SplitText, ScrambleText, DrawSVG, Draggable, Inertia) and Lenis**, with self-hosted fonts. The palette is white first and wine second, with wine-black for the dark rooms and brushed brass for detail.

**Type.** The same pairing as the previous portfolio: **Geist** for reading and display, with **Instrument Serif** italic as its italic, so every emphasised word turns to a fine serif. Labels are **Martian Mono**. All self-hosted in `public/fonts` (licences included), wired in `src/styles/base.css`.

**Motion vocabulary** (`src/lib/useReveals.js`):
- Section labels settle letter by letter, like a departure board.
- Titles rise word by word out of masks; a small figure count sits against each one.
- Image frames wipe open while the picture settles from a zoom.
- Work images bloom from grey to colour as they cross the middle of the screen.
- Links and buttons roll letter by letter on hover. No hover overshoots or springs anywhere.
- The header palette follows whichever section is under it, however far you jump.

```bash
npm install
npm run dev       # http://localhost:5190
npm run build     # pre-rendered site in dist/: every page as finished HTML, plus sitemap, robots.txt and llms.txt
npm run preview   # serve the build on :5191
npm run indexnow  # after a deploy is live: tell Bing, Yandex and other IndexNow engines about every page
```

## Home, in order

| # | Section | What happens |
|---|---------|--------------|
| — | **Hero** | Only the name, drawn in a few thousand dots (ivory and brass) over a live WebGL liquid in wine. Beneath it, the roles line from the previous portfolio: "Developer" decodes out of `<developer />`, then "& writer." joins in serif italic. The dots gather on arrival, part around the cursor, and blow apart as an aperture opens onto the next chapter. |
| 01 | **Recent works** | One large card holds the stage, captioned like a figure. On scroll it shatters: Voronoi shards of the screenshot (~43,000 particles, drawn in WebGL) lift and turn over while their grains come loose, round off and drift on a slight breeze, then gather back as the next site, sweeping left to right. At rest it is the sharp screenshot; the scroll snaps to each site. Without WebGL it crossfades; with reduced motion the tabs swap the picture. |
| 02 | **Currently building** | The window from the previous portfolio's recent works: the names scroll by on the left, and as each reaches the middle a liquid, noise-edged front rises through the window (falls, scrolling back) with the next site behind it; the site arrives as its line drawing and a brass scan builds it. The page bulges softly under the cursor. On phones, or without WebGL, the cards wipe up instead. |
| 03 | **Products** | Inventory software and Mailwright. Each screen settles flat as you scroll, and the steps light up in turn. |
| 04 | **Clientele** | A grid of client plots, plus an open "Your brand, next." plot. |
| — | *Narration* | Between some chapters a single line carries the story on ("Behind every build is a business…"); its words brighten as you read down. Also before Reviews and Writing. |
| 05 | **Where I serve** | A white paper map opens as the section arrives, and the scroll itself drives it: the camera glides from Moradabad to India to the world, routes draw in dark maroon, pins and labels land as each route arrives, and the counters count up. Live coordinates, a scale bar and local clocks. |
| 06 | **Other services** | Ten services as sheets on a drawing board. On wide screens the section holds still and the scroll slides the sheets past: the one at the margin comes forward, its pictogram draws and its outlined numeral warms; the last sheet asks for anything not on the list. On phones it is a row you swipe. |
| 07 | **Reviews** | Client notes pinned to a drawing board. Pick one up and throw it on a desktop; swipe on phones. |
| 08 | **Writing** | Papers and books on a walnut shelf. |
| 09 | **About** | The working sentence with client sites set into it, then a dossier: a profile card with local time and availability, beside the bio, facts and numbers. |

The other pages are `/work` (the client sites one at a time in a single browser window that wipes between them), `/work/:slug` (case study with a drawing-vs-built slider), `/about` (with the previous portfolio's journey: roles either side of a path the scroll inks, a marker riding its tip), `/contact` and a 404 page.

The hero carries small print in its corners (where, and the years of selected work), and the footer ends with a colophon.

**Header — the Folio.** The header reads like the running head of a book. The name on the left folds to "R. H." once you leave the cover (and opens again under the pointer); the middle names the chapter you are reading and rolls over as the next begins; the bar's bottom edge is a ruler of the whole page with a tick where each chapter starts and a small diamond for where you are. Hover the ruler and it opens into a labelled timeline: click a chapter to go to it, or drag to scrub the page. **Contents** opens the site's contents page: white paper falling in as six columns, each led by a thin edge of ink, the chapters set with dotted leaders, a "you are here" mark, and the hovered chapter's abstract under a large outlined numeral, with the pages, contact details, local time and search along the foot. Chapters are read from `[data-chapter]` on any page (Home and About have them); the abstracts live in `chapters` in `src/data/content.js`.

**Contact** comes from the previous portfolio: a one-screen Connect page over a softened OpenStreetMap view of Moradabad, with WhatsApp and email cards, a booking button and a two-field form. Buttons fill with the old hatch-then-solid sweep.

## Adding client logos

Put each logo in `public/img/clients/`, as SVG preferably (a transparent PNG also works). Then set its path in `src/data/content.js`:

```js
{ name: 'Taif International', field: 'Handicrafts · Export', place: 'Moradabad', url: 'https://taifinternational.co', logo: '/img/clients/taif.svg' },
```

Logos show in greyscale and turn to full colour on hover. Clients without a logo keep their wordmark.

## Deploying

`npm run build` builds the browser bundle, then a server bundle (`src/entry-server.jsx`) that `scripts/prerender.mjs` uses to write every route as a finished HTML page: words, title, description, canonical, language alternates and structured data already in place. The browser app then takes over. Unknown addresses get a real 404 page.

- **Vercel** (the live site): `vercel.json` sets the build, clean URLs (`/about` serves `about.html`), the bare domain → `www` move, permanent redirects from every address the previous site used (`/projects`, `/connect`, `/reviews`, `/pricing`…), and caching and security headers.
- **Contact form**: set `VITE_FORMSPREE_ID` (see `.env.example`). Without it, the form opens the visitor's mail app or WhatsApp.
- **Search Console and Bing**: set `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` in Vercel's environment variables (the same names the previous site used) and the meta tags are written into every page at build time. DNS verification works too and needs nothing here.
- **Domain**: `https://www.rushanhaque.in` lives in `src/config/site.js` (`url`); everything else, including the sitemap and robots.txt, is generated from it.

## Search (SEO) and AI answers (GEO)

- **Every page is real HTML** before any JavaScript runs, so Google, Bing and the AI crawlers that don't run scripts (ChatGPT, Claude, Perplexity) read the full words of every page.
- **Head**: one source, `src/lib/seo.js`: a title and description per page, canonical, robots, Open Graph and Twitter cards, `hreflang` pairs for the Hindi pages, `lang="hi"` on them. `<Seo />` keeps the head right as you move between pages.
- **Structured data**: Person, ProfessionalService (Moradabad address, geo, every area served, the service catalogue) and WebSite as one linked graph on the home page; Service, Article, FAQPage, BreadcrumbList, CreativeWork, SoftwareApplication, ProfilePage, CollectionPage and ContactPage on the pages they describe.
- **Landing pages**: the 44 guides, service pages and area pages from the previous site, at the same addresses and with their words unchanged (`src/data/seo/`, laid out by `src/pages/Landing.jsx`). They stay out of the main navigation and are listed in the footer's small directory and in each page's Explore block. Hindi: `/website-kaise-banwaye`, `/website-banwaye-moradabad`.
- **Files**: `/sitemap.xml` (with images and language pairs), `/robots.txt` (search engines and AI assistants all welcome), `/llms.txt` and `/llms-full.txt` (plain-text summaries for AI assistants), the IndexNow key file, `/site.webmanifest`.

**Still yours to do, and they matter more than anything in the code** (the full playbook from the previous site still applies):
1. Google Search Console: verify, submit `/sitemap.xml`, request indexing for the home page and the Moradabad pages. Then Bing Webmaster Tools (it also feeds ChatGPT search and DuckDuckGo), then `npm run indexnow`.
2. Google Business Profile as a website designer in Moradabad, linked to `/website-designer-in-moradabad`. This is what wins "near me" searches and the map pack.
3. Google reviews from every client, and a "Website by Rushan Haque" footer link on every client site.
4. The same name, address and phone on JustDial, IndiaMART, Sulekha, Clutch, LinkedIn and the rest.

## Re-skinning for a client

| What | Where |
|------|-------|
| Name, contact, socials, navigation, domain | `src/config/site.js` |
| Projects, products, clients, map cities, services, process, reviews, writing, roles, credentials, FAQ | `src/data/content.js` |
| Palettes (night / ivory (white) / stone / wine) | `src/lib/theme.js` and the scoped blocks in `src/styles/base.css` |
| Hero liquid colours | the `colors` prop of `HeroShader` in `src/sections/Hero.jsx` |
| Spacing, grid and type scale | `:root` in `src/styles/base.css` |

Every section opens with the same heading component (`src/components/Head.jsx`): number and label on a hairline, the title across seven columns with its count, the lede across the right four.

## Speed

- Work images ship at 1600px and 800px (`src/lib/img.js`); the browser picks the one it needs.
- The name dots are sampled from the real type at its laid-out size, so they match at any screen width; the dot count drops on phones and low-power devices, and the canvas sleeps when nothing moves.
- The hero shader is one fragment shader drawn at a fraction of screen resolution, and only while the hero is on screen. Without WebGL a CSS gradient shows instead.
- The map data and the drag library load only when they are needed.
- Reveals animate transform, opacity and clip-path only.
- The intro plays about two seconds on a first visit to the home page only; anyone arriving deeper (often from a search) goes straight to the page.
- **Three device tiers** (`src/lib/device.js`). Entry-level phones (2 GB memory or 2 cores), Data Saver and 2G/3G connections get the CSS gradient instead of the WebGL hero, the plain crossfade instead of the particle shatter, the plain wipe instead of the liquid window, native scrolling, and no frosted glass. Mid-range devices keep every scene at fewer pixels and particles.
- The landing pages' text stays out of the main bundle: the header and footer carry only a small generated index (`scripts/seo-index.mjs`).
- `prefers-reduced-motion` turns off smooth scroll, the pinned scenes and the shader animation.
