# SEO playbook — getting rushanhaque.in found

The site's code-side SEO is in place: keyword-targeted titles and headings, ~35 service, location and guide pages (English and Hindi), structured data (Person, ProfessionalService, Service, FAQ, Breadcrumb, Article), a sitemap with hreflang, robots.txt, llms.txt, IndexNow, a single canonical host (bare domain 301s to www), and sitewide links to the area pages.

What decides the ranking from here happens **off the site**. Searches like "website designer near me" are answered first by the Google Maps pack, and that pack is filled from Google Business Profiles, not from websites. Do these in order.

## 1. This week (the biggest wins)

1. **Google Business Profile** — business.google.com
   - Name: `Rushan Haque – Website Designer & Developer` (your real business name only; keyword-stuffed names get suspended).
   - Primary category: **Website designer**. Secondary, only where true: *Internet marketing service*, *Software company*, *Graphic designer*.
   - Service-area business: hide the street address if you don't receive clients at home; add service areas Moradabad, Rampur, Amroha, Sambhal, Bareilly, Bijnor, Delhi, Lucknow, etc.
   - Website: `https://www.rushanhaque.in/website-designer-in-moradabad`. Phone: `+91 76680 47608`, exactly as on the site.
   - Add services (each with a short description), 10+ real photos (work on screens, you at work, logo, cover), opening hours, and a weekly post.
   - Once live, replace the generic map link in `lib/content.ts` (`address.map`) and `hasMap` in `lib/schema.ts` with your profile's share link, and add the profile URL to `socials`.
2. **Google Search Console** — search.google.com/search-console
   - Add a *Domain* property for `rushanhaque.in` (DNS TXT record), or a URL-prefix property for `https://www.rushanhaque.in` using the HTML-tag method: set `GOOGLE_SITE_VERIFICATION` in Vercel → Project → Settings → Environment Variables to the token and redeploy.
   - Submit `https://www.rushanhaque.in/sitemap.xml`.
   - Use *URL Inspection → Request indexing* for: `/`, `/website-designer-in-moradabad`, `/website-designer-in-india`, `/website-developer-in-moradabad`, `/website-maker-in-moradabad`, `/how-to-get-a-website-made`, `/website-kaise-banwaye`.
3. **Bing Webmaster Tools** — bing.com/webmasters. Import from Search Console (or set `BING_SITE_VERIFICATION`). Bing also feeds ChatGPT search. After each deploy run `npm run indexnow`.

## 2. Reviews (ongoing, the strongest local signal)

- Ask every past and current client for a Google review via your profile's "Ask for reviews" link. Aim for 10, then 1–2 a month.
- Ask them to mention the service and city naturally ("got our export website made in Moradabad").
- Reply to every review.

## 3. Citations — list the business, with identical name/phone/address

The search results for "website designer in Moradabad" are mostly these directories, so being on them gets you in front of searchers *and* builds trust signals:

JustDial · IndiaMART · Sulekha · ThreeBestRated (request a listing) · TechBehemoths · Clutch · GoodFirms · DesignRush · Bing Places · Apple Business Connect · Facebook page · LinkedIn company page · Instagram bio link · Upwork/Fiverr/Freelancer profile linking to the site.

Use exactly: `Rushan Haque – Website Designer & Developer`, `94 Qazi Tola, Moradabad, Uttar Pradesh 244001`, `+91 76680 47608`, `https://www.rushanhaque.in`.

## 4. Links from other sites

- Footer credit on every client site: "Website by Rushan Haque" linking to `https://www.rushanhaque.in/` (ask each client; most agree).
- Moradabad export, brass and handicraft associations, local news sites and college (MIT Moradabad) alumni pages.
- Guest posts or answers on Quora/Reddit (r/india, r/IndianEntrepreneur) linking to the guides where genuinely helpful.
- Showcase your work on Dribbble, Behance and GitHub with links back.

## 5. Keep the site growing

- Add each new client project with a short case study (problem, what you built, result).
- Add one useful guide a month answering a real client question (e.g. "Shopify vs custom store in India", "how exporters get enquiries from abroad").
- Only add a new city page when you have real work or clients there; thin copy-paste city pages can hurt rankings.

## What to expect

New pages usually take 1–4 weeks to be indexed and 2–6 months to settle in rankings. Nobody can guarantee position 1 for every search everywhere in India. Google ranks "near me" results mostly by the searcher's distance from the business, so the realistic target is the top of the Maps pack and organic results in and around Moradabad, plus strong positions for the long-tail and Hindi searches the guides target nationally.
