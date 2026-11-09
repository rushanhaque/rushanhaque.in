# Rushan Haque

The portfolio of Rushan Haque, website developer and designer in Moradabad, India. Live at [rushanhaque.in](https://www.rushanhaque.in).

A dark, clean site in the wine and brass of the previous portfolio. The Work page opens with the one 3D background on the site: a walk down a sunlit corridor of arches, one client site in each bay.

## Stack

- React 19, Vite 8, React Router 7. Every page is prerendered to HTML at build time, then React takes over.
- GSAP (ScrollTrigger, SplitText) for scroll and reveals. Draggable and Inertia load only with the Work page.
- Lenis for wheel smoothing, on desktop only. Touch devices never download it.
- Raw WebGL2 with no 3D library, for the Work page corridor and the Where I serve globe. It lives in its own chunk (`src/gl`), and the page is complete without it.

## Commands

```bash
npm install
npm run dev       # http://localhost:5300
npm run build     # browser build, server build, then prerenders every page into dist/
npm run preview   # serves dist/
npm run globe     # rebuilds the globe map in public/data
npm run indexnow  # tells search engines what changed
```

Deployed on Vercel. See `vercel.json` for redirects, clean URLs and headers.

## Environment

Copy `.env.example`. All of these are optional for local work.

| Variable | Used for |
| --- | --- |
| `VITE_FORMSPREE_ID` | The form endpoint. Falls back to the id in `src/config/site.js`. |
| `ADMIN_PUBLISH_SECRET` | The password for `/admin`. |
| `CMS_SESSION_SECRET` | Signs the admin session cookie. |
| `GITHUB_TOKEN` | Lets `/admin` commit the edited About text. |
| `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` | Search console tags, added at build. |

## Where things live

```
src/
  sections/     the rooms of the home page, in walking order (see pages/Home.jsx)
  pages/        Home, Work, Case, Product, About, Contact, Landing (guides, services, areas), Admin
  components/   Chrome, Menu, Loader, Transition (the star between pages), Sundial (section list), Btn, Ur, Lens, Footer
  lib/
    director.js   turns scroll position into the current section and the scene to draw
    sun.js        the hour, which sets the angle of the sun in the corridor
    corridor.js   the gallery's geometry, shared by the canvas and the real picture elements
    places.js     the globe camera and projection, shared by the canvas and the city labels
    reveal.js     the scroll reveals, asked for in markup with data-r
    seo.js        titles, descriptions and structured data for every route
  gl/           Engine, and one file per scene in gl/stages
  data/         content.js holds the words; editable.json is what /admin edits; seo/ holds the guides
  styles/       tokens, base, chrome, sections (home), pages (everything else)
scripts/        prerender, atlas and search helpers
api/            the admin endpoints (Vercel functions)
```

## How it stays fast

- The page is finished HTML before any script runs. The canvas loads when the browser is idle and fades in over it.
- The canvas draws only when something changed, each scene at its own resolution, and quality steps down by itself if frames run long. If it keeps struggling, it turns off.
- Devices with no usable GPU, or that ask for reduced motion, get a plain version with the same words and pictures: the corridor becomes a simple list.
- Three fonts, subset, about 85 kB.

Add `?tier=low`, `?tier=mid` or `?tier=high` to any URL to force a quality level, and `?skip` to skip the opening.

## Editing content

Nearly all copy is in `src/data/content.js`. Contact details and navigation are in `src/config/site.js`. Each picture needs a 1600px file and a matching `-800.webp`.
