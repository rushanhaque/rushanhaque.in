/* data/seo-locations.mjs — content for the generated city pages.
 *
 * THE DOORWAY-PAGE LINE
 * Google's spam policies name "doorway pages" — batches of near-identical
 * pages differing only by a place name — as manipulative, and penalises them.
 * A set of location pages is legitimate when each one says something true and
 * particular about that place that a reader there would recognise.
 *
 * So every entry below is written around the actual economy of the city: the
 * brass workshops in Moradabad, the sports-goods factories in Meerut, the
 * tanneries in Kanpur, the lock industry in Aligarh. Those are real, verifiable
 * facts about those places, and they are what makes each page a different page
 * rather than a template with a variable in it.
 *
 * Cities are ordered by distance from Moradabad, then by size.
 */

/* The FAQ each location page answers.
 *
 * Lives here rather than in the generator because TWO things consume it:
 * scripts/build-pages.mjs renders it as visible <details> blocks, and
 * scripts/seo-schema.mjs renders the same strings as FAQPage markup. Google
 * only honours FAQ markup whose answers are visible on the page, so the two
 * must never drift — one definition makes that structural rather than a
 * discipline someone has to remember.
 *
 * The city, its distance and its trade are woven through the answers, so these
 * read as different text on every page rather than a template with a hole in it.
 */
export function locationFAQ(loc) {
  const c = loc.city;
  return [
    ...(loc.faq || []),
    [`Do you build websites for businesses in ${c}?`,
     `Yes. The studio is based in Moradabad, ${loc.distance}, and works with businesses in ${c} regularly. Everything from a single-page site to an e-commerce store or a custom web application, built from scratch rather than assembled from a template.`],
    ['Do we need to meet in person?',
     `Almost never, and nothing about the work depends on it. Briefs, feedback and handover all happen over call and email, which is how projects for clients in Saudi Arabia, Poland and Nepal have run. Being ${loc.distance} means an in-person meeting is possible when a project genuinely calls for one.`],
    [`How much does a website cost in ${c}?`,
     'It depends on scope — a single-page site and a full e-commerce build are different pieces of work, and quoting a number before knowing which one you need would be guesswork. Send the brief through the contact page and you will get a quote with a timeline attached to it.'],
    ['Will my website work properly on phones?',
     `Yes, and it is treated as the default case rather than an afterthought. Most traffic in ${c}, as everywhere in India, arrives on a mid-range phone over mobile data, so layout and load speed are built and tested against that first.`],
    [`Can you help my ${c} business appear on Google?`,
     'Yes. SEO is part of the build rather than an upsell: proper page structure, structured data, fast loading and correct technical setup. For local searches the largest single factor is a complete Google Business Profile, and that gets set up alongside the site.'],
    [`Do you only work with ${loc.trade} businesses?`,
     `No — that is simply what ${c} is best known for. The work spans any business that needs a site: retail, services, manufacturing, professional practices and startups alike.`],
  ];
}

export const LOCATIONS = [
  {
    slug: 'website-designer-in-rampur',
    faq: [
      ['Can you build a site for a sugar or agri-trading business?',
       'Yes, and it is a common brief here. The useful version is small: what you trade, capacity, certifications where they apply, and a contact route that is actually monitored. Buyers checking you out are looking for evidence you are a real, current operation — not for a large site.'],
      ['My customers are all local. Do I still need a website?',
       'If every customer already knows you and buys by phone, a site is a low priority. It becomes worth it the moment you want buyers from outside Rampur, or when people start checking you online before dealing with you — which now happens well before the first call.'],
    ],
    needs: [
      ['Reach buyers outside the district',
       'Sugar, agri and zari businesses in Rampur increasingly sell to buyers who will never visit. The site is where those buyers decide whether you are worth a call.'],
      ['Load on a rural connection',
       'A lot of Rampur traffic arrives on patchy mobile data. A heavy site simply does not open, and you never find out it did not.'],
      ['Small, and finished',
       'Most businesses here need five good pages, not twenty half-written ones. Fewer pages, each doing a job, beats a site nobody finished.'],
    ],
    city: 'Rampur',
    region: 'Uttar Pradesh',
    nav: 'Rampur',
    distance: 'about 30 km from Moradabad',
    title: 'Website Designer in Rampur, Uttar Pradesh | Rushan Haque',
    description:
      'Website designer and web developer serving Rampur, Uttar Pradesh — custom business websites, e-commerce and web apps, built from scratch nearby.',
    answer:
      'Rushan Haque is a website designer and web developer based in Moradabad, roughly thirty kilometres from Rampur. He builds custom business websites, e-commerce stores and web applications for businesses in Rampur and across Uttar Pradesh, designed from scratch and built to be found.',
    trade: 'sugar and agri-trade',
    industry: {
      h2: 'What Rampur businesses need online',
      lede:
        'Rampur\'s commerce runs on sugar, agriculture, zari and the crafts the district has been known for since the Nawabi period — trades where reputation travels locally and buyers increasingly arrive from further away.',
      prose: [
        'That is exactly the situation a website helps with. A sugar or agri-trade business dealing with buyers outside the district needs somewhere credible to point them, with the specifications and contact routes in one place. A zari or craft workshop selling beyond Rampur needs photographs of the work and a way to be found by someone searching from Delhi or abroad.',
        'What almost none of them need is a twenty-page site. The useful version is small, fast, honest about what is made and how to reach the people making it — and built so a phone on a rural connection can actually load it.',
      ],
    },
  },

  {
    slug: 'website-designer-in-sambhal',
    faq: [
      ['Do you build export catalogue sites for handicraft businesses?',
       'Yes. That is one of the clearer briefs in Sambhal: product ranges with real photography, honest specifications, capacity and minimum order quantities, and enquiry routes that work across timezones. The site is doing the job a factory visit would do for a domestic buyer.'],
      ['Will overseas buyers actually find the site?',
       'That is the part most export sites skip. Being findable means the site loads quickly from Europe and North America, is structured so search engines understand what you manufacture, and is readable by the AI assistants buyers increasingly use to shortlist suppliers before contacting anyone.'],
    ],
    needs: [
      ['Prove production is real',
       'Overseas buyers of horn and bone handicraft cannot visit the workshop. Photographs of actual production do the work a factory visit would.'],
      ['Publish specifications and MOQ',
       'Export buyers filter on capacity and minimums before they enquire. Leaving those off the site means being filtered out silently.'],
      ['Load fast from Europe and the US',
       'Your buyers are on another continent. A site tuned only for Indian visitors is slow where it matters most.'],
    ],
    city: 'Sambhal',
    region: 'Uttar Pradesh',
    nav: 'Sambhal',
    distance: 'about 40 km from Moradabad',
    title: 'Website Designer in Sambhal, Uttar Pradesh | Rushan Haque',
    description:
      'Website designer and web developer for Sambhal, Uttar Pradesh — custom sites for horn and bone handicraft exporters, menthol traders and local businesses.',
    answer:
      'Rushan Haque builds custom websites for businesses in Sambhal from a base in Moradabad, about forty kilometres away. The work covers business sites, export catalogues, e-commerce and web applications, built from scratch and optimised for search and AI visibility.',
    trade: 'handicraft export',
    industry: {
      h2: 'Sambhal exports, and export needs a shopfront',
      lede:
        'Sambhal is a genuine export town. Its horn and bone handicraft industry ships worldwide, and the district is one of the country\'s significant centres for menthol and mint processing.',
      prose: [
        'An export business has a specific and unusual website problem: the buyer is frequently in another country, in another timezone, and has never met you. They cannot visit the workshop. Everything that would normally build trust in person has to be done by the site.',
        'That means real photographs of real production rather than stock images, clear product specifications, honest capacity and MOQ information, and contact routes that work internationally. It also means the site has to load quickly from Europe and North America, and be readable by the AI assistants that overseas buyers increasingly use to shortlist suppliers before contacting anyone.',
      ],
    },
  },

  {
    slug: 'website-designer-in-amroha',
    faq: [
      ['I make instruments. How should the site show them?',
       'Photography first, and honestly. A dholak shot well justifies its price; the same instrument as a small compressed image does not. Beyond that: what it is made of, how it is made, who makes it, and a way to ask about a specific piece.'],
      ['Can a small workshop justify a website?',
       'Usually yes, because the alternative is being invisible to everyone who is not already local. A small, well-built site is a modest cost against reaching buyers who currently cannot find you at all.'],
    ],
    needs: [
      ['Be findable at all',
       'Amroha\'s dholak makers have a discoverability problem, not a quality problem. The buyers exist; they cannot find you.'],
      ['Photograph the craft honestly',
       'A hand-made instrument shot badly looks like a cheap one. The photography is most of the price justification.'],
      ['Say what it is, in searchable words',
       'Structured data and plain descriptions let both Google and AI assistants understand what is being made and recommend it.'],
    ],
    city: 'Amroha',
    region: 'Uttar Pradesh',
    nav: 'Amroha',
    distance: 'about 45 km from Moradabad',
    title: 'Website Designer in Amroha, Uttar Pradesh | Rushan Haque',
    description:
      'Website designer and web developer serving Amroha, Uttar Pradesh — custom business websites, online stores and web apps, built from scratch.',
    answer:
      'Rushan Haque is a web developer and website designer working with businesses in Amroha from nearby Moradabad. He builds custom sites — business, e-commerce and web applications — from scratch, with search and AI visibility handled as part of the build.',
    trade: 'craft and agriculture',
    industry: {
      h2: 'A district known for what it makes',
      lede:
        'Amroha is known for two things that travel: its dholak and percussion-instrument craft, and its mango orchards. Both are businesses where the product is distinctive and the buyer is often nowhere nearby.',
      prose: [
        'An instrument maker whose work is genuinely regarded has a discoverability problem rather than a quality problem — the people who would buy simply cannot find them. A well-built site with proper photographs, a clear description of the craft, and structured data that lets search engines and AI assistants understand what is being made, fixes precisely that.',
        'The same applies to agricultural and trading businesses across the district. If your buyers are outside Amroha, the site is the part of the business they meet first.',
      ],
    },
  },

  {
    slug: 'website-designer-in-bijnor',
    faq: [
      ['What should a sugar or agri-business site actually contain?',
       'Capacity, what you trade, certifications, how long you have been operating, and current contact details. B2B buyers are deciding whether you are worth a phone call. Nothing on the page needs to sell — it needs to answer.'],
      ['Our buyers check the site on their phone in the field. Will it work?',
       'That is the design target. Low weight, fast first paint, and readable on a mid-range phone over a weak connection. A heavy site simply fails to open there, and you never learn that it did.'],
    ],
    needs: [
      ['Answer procurement questions upfront',
       'Sugar and agri buyers check capacity, certifications and trading history before calling. Put those on the page.'],
      ['Work with one bar of signal',
       'This site gets read in fields and at mill gates, not at desks. Weight is the whole game.'],
      ['Keep contact details current',
       'The most common failure in B2B agri sites is a phone number nobody answers any more. It costs more enquiries than design ever will.'],
    ],
    city: 'Bijnor',
    region: 'Uttar Pradesh',
    nav: 'Bijnor',
    distance: 'about 60 km from Moradabad',
    title: 'Website Designer in Bijnor, Uttar Pradesh | Rushan Haque',
    description:
      'Website designer and web developer for Bijnor, Uttar Pradesh. Custom websites for sugar, agri-business and local trade — fast, mobile-first, built to be found.',
    answer:
      'Rushan Haque builds custom websites for businesses in Bijnor from Moradabad, around sixty kilometres away. Work covers business sites, catalogues, e-commerce and web applications, each built from scratch rather than assembled from a template.',
    trade: 'sugar and agri',
    industry: {
      h2: 'Agri-business has an unusual audience',
      lede:
        'Bijnor\'s economy leans heavily on sugar and agriculture — mills, traders, suppliers and the businesses that serve them.',
      prose: [
        'These are B2B businesses, and B2B websites are judged differently from consumer ones. Nobody is buying from the page. What they are doing is deciding whether you are a serious operation worth a phone call — checking capacity, certifications, how long you have been trading, and whether the contact details are current.',
        'A site that answers those questions plainly does more for a trading business than any amount of visual flourish. It should also work on a phone in a field with one bar, because that is frequently where it is being read.',
      ],
    },
  },

  {
    slug: 'website-designer-in-meerut',
    faq: [
      ['Do you build sites for sports goods manufacturers and exporters?',
       'Yes. The brief is usually product ranges, real production photography, specifications a procurement person can use, certifications, and an enquiry route that works when the enquiry arrives at 2am IST. The site substitutes for a factory visit.'],
      ['How do we rank for what we make rather than our company name?',
       'By organising the site around products rather than around the company. Each range gets its own indexable page with real specifications, so a buyer searching for the product finds the page about that product — not a homepage that mentions it in passing.'],
    ],
    needs: [
      ['Do the job of a factory visit',
       'A sourcing manager comparing sports goods suppliers is deciding from a screen. Production photography, ranges and certifications are the substitute for walking the floor.'],
      ['Rank for the product, not the company',
       'Nobody searches your company name. They search what you make. The site has to be organised around products, not around your org chart.'],
      ['Handle timezone-spread enquiries',
       'Export enquiries arrive at night. A clear, working enquiry route matters more than a phone number that is only answered at 11am IST.'],
    ],
    city: 'Meerut',
    region: 'Uttar Pradesh',
    nav: 'Meerut',
    distance: 'about 160 km from Moradabad',
    title: 'Website Designer in Meerut, Uttar Pradesh | Rushan Haque',
    description:
      'Website designer and web developer serving Meerut — custom sites for sports goods manufacturers, exporters and local businesses. Built from scratch, built to rank.',
    answer:
      'Rushan Haque builds custom websites for businesses in Meerut, working remotely from Moradabad. Meerut\'s sports goods, scissors and publishing industries sell well beyond the city, and the work focuses on making those businesses findable and credible to buyers who will never visit.',
    trade: 'sports goods',
    industry: {
      h2: 'Meerut manufactures for the world',
      lede:
        'Meerut is one of India\'s major sports goods manufacturing centres, alongside long-established scissors, publishing and gold trades. A great deal of what the city makes leaves it.',
      prose: [
        'Manufacturers and exporters have the hardest website brief of anyone, because the site has to do the job a factory visit would. A buyer sourcing cricket equipment or fitness goods is comparing suppliers on a screen, and dropping the ones whose sites look abandoned, load slowly, or fail to answer basic questions about capacity and compliance.',
        'The practical version: real production photography, clear product ranges, specifications a procurement person can use, certifications where they exist, and an enquiry route that works across timezones. Plus the technical groundwork so the site appears when someone searches for what you make rather than for your company name — and so AI assistants shortlisting suppliers can read it.',
      ],
    },
  },

  {
    slug: 'website-designer-in-bareilly',
    faq: [
      ['How do you show zari and zardozi work properly online?',
       'Large, high-quality images that still load fast, which is a matter of correct formats and correctly sized variants per screen rather than a trade-off. Close detail is what justifies the price, so it cannot be compressed away.'],
      ['We sell furniture. What do buyers want on the page?',
       'Dimensions, materials and finishes, in writing. Furniture enquiries most often fail because the specifications are missing and the buyer cannot tell whether it fits their space — so they move on rather than asking.'],
    ],
    needs: [
      ['Show the detail at full quality',
       'Zari and zardozi live or die on close detail. Compressed thumbnails make premium work look cheap.'],
      ['Stay fast while staying beautiful',
       'High-quality craft images and fast loading are not in conflict — it is a matter of correct formats and sizes per screen.'],
      ['Sell furniture on dimensions',
       'Furniture buyers want measurements, materials and finishes. Missing specifications is the most common reason an enquiry never comes.'],
    ],
    city: 'Bareilly',
    region: 'Uttar Pradesh',
    nav: 'Bareilly',
    distance: 'about 90 km from Moradabad',
    title: 'Website Designer in Bareilly, Uttar Pradesh | Rushan Haque',
    description:
      'Website designer and web developer for Bareilly — custom websites for zari-zardozi, furniture and local businesses, built from scratch to rank.',
    answer:
      'Rushan Haque builds custom websites for businesses in Bareilly from nearby Moradabad. The city\'s zari-zardozi, furniture and cane trades make things worth photographing properly, and the work covers the site, the search visibility and the AI visibility together.',
    trade: 'zari and furniture',
    industry: {
      h2: 'Craft sells on the strength of its images',
      lede:
        'Bareilly is known for zari and zardozi embroidery, furniture, and cane and bamboo work — trades where the product is visual, detailed, and badly served by a bad photograph.',
      prose: [
        'For a craft business, the website is a gallery before it is anything else. The margin between work that looks premium and work that looks cheap is almost entirely in how it is photographed and how it is presented. A zardozi piece shot properly and displayed at full quality justifies its price; the same piece as a compressed thumbnail does not.',
        'The technical requirement that follows is specific: images have to be high quality and still load fast, which means correct formats, correct sizes for each screen, and loading that prioritises what the visitor is actually looking at. That is a build problem, and it is solvable.',
      ],
    },
  },

  {
    slug: 'website-designer-in-aligarh',
    faq: [
      ['We have hundreds of lock and hardware SKUs. How is that handled?',
       'As a real catalogue, not a PDF. Each product gets an indexable page with its specifications, and the range gets filters for size, finish and type. A PDF is unsearchable, unusable on a phone, and invisible to Google — which means the catalogue you already have is not working for you.'],
      ['Can buyers filter by specification?',
       'Yes, and it is the single most useful thing for a hardware site. A buyer wants one size in one finish; filters get them there in two taps, where scrolling an entire range loses them.'],
    ],
    needs: [
      ['Turn the catalogue into pages',
       'Hundreds of lock and hardware SKUs in a PDF are unsearchable and invisible to Google. As indexable pages they become findable inventory.'],
      ['Make variants filterable',
       'A buyer wants one size in one finish. Filters get them there; scrolling a full range loses them.'],
      ['Publish real specifications',
       'Materials, dimensions, finishes and standards. Hardware buying is a specification decision, not an aesthetic one.'],
    ],
    city: 'Aligarh',
    region: 'Uttar Pradesh',
    nav: 'Aligarh',
    distance: 'about 190 km from Moradabad',
    title: 'Website Designer in Aligarh, Uttar Pradesh | Rushan Haque',
    description:
      'Website designer and web developer serving Aligarh — custom websites for the lock and hardware industry, exporters and local businesses across Uttar Pradesh.',
    answer:
      'Rushan Haque builds custom websites for businesses in Aligarh, working remotely from Moradabad. Aligarh\'s lock and hardware industry sells nationally and internationally, and the work focuses on catalogues, specifications and search visibility for exactly that kind of business.',
    trade: 'lock and hardware',
    industry: {
      h2: 'The lock city has a catalogue problem',
      lede:
        'Aligarh has been India\'s lock and hardware manufacturing centre for over a century. It is an industry of ranges, sizes, finishes and specifications.',
      prose: [
        'Which makes the website problem a catalogue problem. A hardware manufacturer might have hundreds of SKUs across dozens of ranges, and a buyer needs to find the specific variant they want without scrolling through everything else. Most manufacturer sites handle this by uploading a PDF, which is unsearchable, unusable on a phone, and invisible to Google.',
        'A proper product catalogue — filterable, each item on its own indexable page with real specifications — turns the same information into something buyers can find and search engines can rank. It is more work than a PDF and it is the difference between being found and being emailed.',
      ],
    },
  },

  {
    slug: 'website-designer-in-lucknow',
    faq: [
      ['We sell chikankari online. What matters most?',
       'Accurate colour and sizing, because returns are what erode the margin on hand-embroidered garments. After that: photography that shows the work honestly, and a checkout that does not fall over on a phone.'],
      ['Do you build booking systems and portals, not just websites?',
       'Yes. For clinics, practices and startups in Lucknow the brief is often an application rather than a brochure — booking, client portals, dashboards or internal tools. That is a different project from a website and is scoped as one.'],
    ],
    needs: [
      ['Pick the right brief first',
       'A chikankari store and a clinic booking system are entirely different projects. Most wasted budget here comes from starting the wrong one.'],
      ['Reduce returns with honest sizing',
       'For chikankari sold nationally, accurate sizing and colour do more for margin than any amount of styling.'],
      ['Look credible to institutions',
       'Government, education and healthcare buyers in the capital judge on clarity and currency, not on visual flourish.'],
    ],
    city: 'Lucknow',
    region: 'Uttar Pradesh',
    nav: 'Lucknow',
    distance: 'about 340 km from Moradabad',
    title: 'Website Designer in Lucknow, Uttar Pradesh | Rushan Haque',
    description:
      'Website designer and web developer serving Lucknow — custom websites and web applications for businesses, startups and institutions across the state capital.',
    answer:
      'Rushan Haque builds custom websites and web applications for businesses in Lucknow, working remotely from Moradabad. As the state capital, Lucknow mixes traditional craft trade with a growing startup and services sector, and the work spans both.',
    trade: 'chikankari and craft',
    industry: {
      h2: 'Two economies, two briefs',
      lede:
        'Lucknow runs on two quite different engines: the chikankari and craft trades the city is historically known for, and a modern layer of government, education, healthcare and startups.',
      prose: [
        'A chikankari business selling nationally needs a store — product photography that shows the embroidery honestly, sizing that reduces returns, and a checkout that works on a phone. That is an e-commerce brief.',
        'A startup, clinic or professional services firm needs something else entirely: credibility, clarity about the offering, and usually a working application rather than a brochure. Booking, portals, dashboards, internal tools. Both are handled here, but they are genuinely different projects and it is worth being clear which one you are starting.',
      ],
    },
  },

  {
    slug: 'website-designer-in-kanpur',
    faq: [
      ['What do international leather and textile buyers look for?',
       'Compliance certifications, evidence of scale, and increasingly documented environmental and labour standards. They check before enquiring, so a site that omits these is filtered out silently — you never find out you were considered.'],
      ['Should we publish our certifications on the site?',
       'Yes, prominently. It is the highest-value thing an export manufacturer can put online. Buyers are looking for exactly that, and burying it in a PDF or leaving it off entirely costs enquiries you never see.'],
    ],
    needs: [
      ['Publish compliance where buyers look',
       'Leather and textile buyers check certifications and standards before enquiring. If they cannot find them, you are never contacted.'],
      ['Show scale honestly',
       'Evidence of capacity — real floor photography, real numbers — is what separates a serious supplier from a trading front.'],
      ['Document standards openly',
       'Environmental and labour documentation is increasingly the first filter on export shortlists, not the last.'],
    ],
    city: 'Kanpur',
    region: 'Uttar Pradesh',
    nav: 'Kanpur',
    distance: 'about 380 km from Moradabad',
    title: 'Website Designer in Kanpur, Uttar Pradesh | Rushan Haque',
    description:
      'Website designer and web developer for Kanpur — custom websites for leather exporters, textile manufacturers and industrial businesses across Uttar Pradesh.',
    answer:
      'Rushan Haque builds custom websites for businesses in Kanpur, working remotely from Moradabad. Kanpur\'s leather and textile industries export heavily, and the work centres on the credibility, catalogues and compliance information that international buyers look for.',
    trade: 'leather and textile',
    industry: {
      h2: 'Export buyers audit before they enquire',
      lede:
        'Kanpur is one of India\'s largest leather and textile centres, with a long industrial base and heavy export exposure.',
      prose: [
        'International buyers in leather and textiles do not simply browse. They check. Before an enquiry is ever sent, someone has looked for compliance certifications, evidence of scale, whether the operation appears current, and increasingly whether the environmental and labour standards are documented anywhere.',
        'A website that leaves those questions unanswered gets filtered out silently — you never learn you were considered. Publishing that information clearly, with real photography and specifications rather than stock imagery and adjectives, is the single highest-value thing an export manufacturer can do online.',
      ],
    },
  },

  {
    slug: 'website-designer-in-delhi-ncr',
    faq: [
      ['Why work with a freelancer instead of an NCR agency?',
       'Cost and directness. Agency rates carry an office, an account manager and the layers between you and whoever writes the code. Working directly means you describe the problem to the person solving it, and nothing is lost in a brief being rewritten twice.'],
      ['When should we use an agency instead?',
       'When the project is large enough to need several people working in parallel, or when you need contractual capacity guarantees and formal process. One person has finite capacity, and being told that honestly is more useful than being sold a build that will not fit.'],
    ],
    needs: [
      ['Skip the relay',
       'Working directly with the developer removes the brief being rewritten twice on its way to whoever writes the code.'],
      ['Pay for the site, not the office',
       'Agency rates carry Gurugram overhead and an account manager. For most projects that structure adds cost, not quality.'],
      ['Know when you do need an agency',
       'A large multi-team programme genuinely needs one. Being told that honestly is worth more than being sold a build that will not fit.'],
    ],
    city: 'Delhi NCR',
    region: 'Delhi',
    nav: 'Delhi NCR',
    distance: 'about 170 km from Moradabad',
    title: 'Freelance Website Designer in Delhi NCR | Rushan Haque',
    description:
      'Freelance website designer and web developer serving Delhi NCR, Noida and Gurugram — custom sites and web applications, without agency overhead.',
    answer:
      'Rushan Haque is a freelance website designer and web developer serving Delhi NCR, including Noida and Gurugram, working remotely from Moradabad. Clients get the person doing the work rather than an account manager relaying messages to a team.',
    trade: 'corporate and startup',
    industry: {
      h2: 'What you are actually choosing between',
      lede:
        'In NCR the question is rarely whether you can find someone to build a website. It is whether you want an agency, a platform, or a person.',
      prose: [
        'An agency gives you process, capacity and a contract — and a per-hour cost that covers an office in Gurugram, an account manager, and the layers between you and whoever writes the code. For a large project with many stakeholders, that structure earns its price.',
        'For most sites it does not. A single experienced developer is faster, because there is no relay: you describe the problem to the person solving it. Nothing is lost in a brief being rewritten twice. The trade-off is honest — one person has finite capacity, and an enormous multi-team project genuinely needs an agency. For everything below that, working directly is usually better and cheaper.',
      ],
    },
  },
];
