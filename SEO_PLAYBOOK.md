# SEO map: getting rushanhaque.in found

Every factor that decides whether rushanhaque.in shows up when someone in India searches for a website designer, what has been done on the site, and what is left for you. Status: ✅ done in code · 🟡 partly done · ⬜ your action.

## Where things stand (16 Oct 2026)

- **Indexing is the bottleneck.** A `site:rushanhaque.in` check on Bing/DuckDuckGo shows only about 10 pages indexed, several of them old URLs (`/products`, `/services`, `/work`) that now redirect. Google refused an automated check (CAPTCHA). Most of the 69 pages haven't been crawled yet, and a page that isn't indexed can't rank.
- **Directories own the results.** For "website designer in Moradabad", the top results are IndiaMART, ThreeBestRated, TechBehemoths, JustDial-style listings and older agencies (Solidale Infotech, Abacus TechnoSoft, Web Technical). You need to be on those directories *and* outrank them.
- **"Near me" searches are answered by Google Maps first.** That map pack comes from Google Business Profiles, ranked by relevance, distance from the searcher and prominence (reviews, links, mentions). A website alone can't get you into it.

## 1. Crawling and indexing

| | Item | Notes |
|---|---|---|
| ✅ | XML sitemap with every public page, hreflang pairs, real `lastmod` | `/sitemap.xml`, 69 URLs, none redirect |
| ✅ | robots.txt allows Google, Bing and AI crawlers; blocks `/studio`, `/api` | |
| ✅ | One canonical host: `rushanhaque.in` → `www` (308) | |
| ✅ | Canonical tag on every page; 404s return 404 with `noindex` | |
| ✅ | Old URLs (`.html`, `/work`, `/services`…) permanently redirected | |
| ✅ | IndexNow key and `npm run indexnow` script | Bing currently answers 403 until the site is verified in Bing Webmaster Tools |
| ⬜ | **Google Search Console**: verify, submit the sitemap, request indexing for key pages | Set `GOOGLE_SITE_VERIFICATION` in Vercel, or verify by DNS |
| ⬜ | **Bing Webmaster Tools**: import from Search Console, then rerun `npm run indexnow` | Bing also feeds ChatGPT search and DuckDuckGo |
| ⬜ | Check Search Console → Pages weekly for "Discovered/Crawled – not indexed" and request those | |

Ask Google to index these first: `/`, `/website-designer-in-moradabad`, `/website-designer-in-india`, `/website-developer-in-moradabad`, `/website-maker-in-moradabad`, `/website-cost-in-moradabad`, `/how-to-get-a-website-made`, `/website-kaise-banwaye`, `/website-banwaye-moradabad`.

## 2. Technical and page speed

| | Item | Notes |
|---|---|---|
| ✅ | Server-rendered HTML; all content readable without JavaScript | |
| ✅ | Mobile layout, no horizontal scroll, HTTPS + HSTS, compression | |
| ✅ | Lighthouse SEO 100 / Best practices 100 / Accessibility 97–100 | Mobile, Oct 2026 |
| 🟡 | Performance: area pages 89, homepage 73 (mobile, simulated slow 4G) | Homepage cost is the particle hero and GSAP (700 ms blocking time). It already has a lighter mode for slow phones. Cutting it further would change the design. With low traffic Google has little real-user data, so this weighs little in ranking today |
| ✅ | Header logo cut from 30 KB to 8 KB (right-sized `srcset`) | |
| ✅ | Hero no longer crashes when it loads in a hidden tab | |
| ⬜ | Recheck Core Web Vitals in Search Console once traffic builds | |

## 3. Pages and keyword coverage

| | Search intent | Page |
|---|---|---|
| ✅ | website designer / developer / maker in Moradabad | `/website-designer-in-moradabad`, `/website-developer-in-moradabad`, `/website-maker-in-moradabad`, homepage |
| ✅ | website designer in India / freelance web developer India | `/website-designer-in-india` |
| ✅ | Hindi: वेबसाइट बनवाएं, website kaise banwaye | `/website-banwaye-moradabad`, `/website-kaise-banwaye` |
| ✅ | how to get a website made | `/how-to-get-a-website-made` |
| ✅ | website cost / price | `/website-cost-in-moradabad` |
| ✅ | Wix vs designer | `/website-builder-vs-web-designer` |
| ✅ | Services: e-commerce, landing pages, redesign, speed, SEO, GEO, web apps | 8 service pages |
| ✅ | 20 area pages: Moradabad, Rampur, Amroha, Sambhal, Bijnor, Bareilly, Meerut, Aligarh, Kanpur, Lucknow, Delhi NCR, Noida, Agra, Saharanpur, Muzaffarnagar, Dehradun, Haridwar, Haldwani, Kashipur, Rudrapur | Each with local industries and questions, not copy-paste |
| ✅ | Industries: exporters, doctors, schools, hotels, real estate, small business, CAs/lawyers/consultants | |
| ✅ | Homepage title, H1 and FAQ target "website designer & developer in Moradabad, India" | |
| ✅ | Footer links to area pages from every page; "Explore" directory on every landing page | |
| ⬜ | **Case studies.** Live client projects currently redirect to the client's site, so there is no page about the work itself. A short case study per client (the problem, what was built, the result, a screenshot) is the strongest content you can add for both trust and ranking | Write 2–3 paragraphs per client and I can turn them into pages |
| ⬜ | One new guide a month on a real client question | e.g. Shopify vs custom store in India; how exporters get enquiries from abroad; domain and hosting explained |
| ⬜ | Only add new city pages where you have real clients or work | Thin city pages count as doorway pages and can pull the whole site down |

## 4. Structured data and AI search

| | Item |
|---|---|
| ✅ | Person + ProfessionalService (address, geo, areas served, services, price range, languages) + WebSite, linked by `@id` |
| ✅ | Service schema on every service/area page; Article on guides; FAQPage; BreadcrumbList |
| ✅ | Homepage FAQ with short answers AI Overviews and ChatGPT can quote |
| ✅ | `/llms.txt` summary for AI assistants, now listing all services, industries and areas |
| ⬜ | Once your Google Business Profile exists, add its link to `socials` in `lib/content.ts` and `hasMap` in `lib/schema.ts` (I can do this when you have the link) |

## 5. Google Business Profile (the biggest lever for "near me")

⬜ Create or claim it at business.google.com:
- **Name:** your real business name, e.g. `Rushan Haque – Website Designer & Developer`. Don't stuff keywords into it; that gets profiles suspended.
- **Primary category:** Website designer. Secondary, only where true: Internet marketing service, Software company, Graphic designer.
- **Service area:** Moradabad and nearby districts; hide the street address if clients don't visit you.
- **Website:** `https://www.rushanhaque.in/website-designer-in-moradabad`. **Phone:** `+91 76680 47608`, exactly as on the site.
- **Services:** list every service with a one-line description. Add opening hours, 10+ real photos, and a logo and cover image.
- **Weekly:** a post (new project, tip, offer), new photos, and answers in the Q&A section.

## 6. Reviews

⬜ Ask every past and current client for a Google review with your profile's review link. Aim for 10, then 1–2 a month. Reply to each one. Reviews that mention the service and city naturally ("our export website, made in Moradabad") help most. Never buy reviews or swap them.

## 7. Citations: the same name, address and phone everywhere

⬜ List on: **JustDial, IndiaMART, Sulekha, ThreeBestRated** (request a listing), TechBehemoths, Clutch, GoodFirms, DesignRush, Bing Places, Apple Business Connect, Facebook page, LinkedIn company page, Instagram, Upwork/Fiverr/Freelancer profiles.

Use exactly: `Rushan Haque – Website Designer & Developer` · `94 Qazi Tola, Moradabad, Uttar Pradesh 244001` · `+91 76680 47608` · `https://www.rushanhaque.in`

## 8. Links from other sites (authority)

⬜ In order of value:
1. **Footer credit on every client site:** "Website by Rushan Haque" linking to `https://www.rushanhaque.in/`. Most clients agree; it is the easiest relevant link you can get.
2. **Local:** Moradabad Handicrafts Export associations, EPCH member pages, local news (a story on helping exporters go online), MIT Moradabad alumni pages.
3. **Profiles:** Dribbble, Behance and GitHub with your work and a link back.
4. **Community:** genuinely helpful answers on Quora and Reddit (r/india, r/IndianEntrepreneur, r/smallbusiness), linking to a guide only where it answers the question.
5. **Avoid:** paid link packages, PBNs and "1000 backlinks for ₹999". They can get the site penalised.

## 9. Brand signals

⬜ Searches for "Rushan Haque" and clicks on your results tell Google you're a real, chosen business. Put the website and Google profile link on your WhatsApp Business profile, email signature, invoices, visiting cards and Instagram bio.

## 10. Conversion (more enquiries from the same traffic)

| | Item |
|---|---|
| ✅ | WhatsApp, call and contact form on every landing page; fixed-quote message; reviews page |
| ⬜ | Set up WhatsApp Business with a catalogue and a quick-reply message for website enquiries |
| ⬜ | Reply within the hour where you can; speed wins local leads |

## 11. Measurement

⬜ Track monthly: Search Console clicks, impressions and average position for "website designer moradabad", "website developer moradabad", "website maker moradabad" and "website banwaye"; Google Business Profile calls and direction requests; enquiries by source.

## 12. Optional: paid visibility while SEO builds

⬜ A small Google Ads search campaign (₹300–500/day) on "website designer moradabad" and similar terms gets you to the top immediately and shows which keywords bring real enquiries. Stop or cut it once organic results come in.

## 30 / 60 / 90 days

- **Week 1:** Google Business Profile, Search Console, Bing Webmaster Tools, request indexing, then rerun `npm run indexnow`.
- **Weeks 2–4:** 5+ Google reviews; JustDial, IndiaMART, Sulekha and ThreeBestRated listings; ask clients for footer credits.
- **Month 2:** case studies for live clients; the rest of the directories; first weekly Google profile posts.
- **Month 3:** first monthly guide; review Search Console and strengthen the pages ranking 5–15.

## What to expect

New pages usually get indexed in 1–4 weeks and settle in rankings over 2–6 months. Nobody can guarantee position 1 for every search everywhere in India. Google ranks "near me" results largely by the searcher's distance from the business. Realistic targets: the top 3 of the Maps pack and page-one organic results in Moradabad and nearby cities, page one for the Hindi and long-tail searches nationally, and being named by AI assistants when asked for a website designer in Moradabad.
