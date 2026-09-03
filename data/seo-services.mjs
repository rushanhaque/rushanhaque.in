/* data/seo-services.mjs — content for the generated service pages.
 *
 * WHY THESE EXIST
 * A single page ranks for a few hundred long-tail variants of the thing it is
 * about. The way to target thousands of queries is therefore thousands of
 * queries' worth of real, indexed content — not keywords hidden in the markup,
 * which Google names as a spam violation and penalises with deindexing.
 *
 * Each entry below is a genuinely different page: different subject, different
 * argument, different questions. None of it is a template with the service name
 * swapped in. That distinction is exactly what separates a legitimate service
 * network from a doorway network.
 *
 * Nothing here states a fact that cannot be backed up — no invented prices, no
 * invented turnaround times, no invented credentials.
 */

export const SERVICES = [
  /* ─────────────────────────────────────────────────────────────────── */
  {
    slug: 'website-design-development',
    card:
      'Custom business sites, portfolios and landing pages, written from scratch rather than assembled from a template.',
    nav: 'Website design',
    title: 'Website Design & Development Services in India | Rushan Haque',
    description:
      'Custom website design and development for businesses across India. Built from scratch, not from a template — fast, mobile-first and built to rank.',
    eyebrow: 'Service',
    h1: 'Website design and development',
    answer:
      'Rushan Haque designs and builds custom websites for businesses across India, from a base in Moradabad, Uttar Pradesh. Every site is written from scratch rather than assembled from a template, which is what makes it fast, genuinely yours, and possible to rank.',
    facts: [
      ['Discipline', 'Design &amp; development'],
      ['Built', 'From scratch, no template'],
      ['Serving', 'Moradabad, India &amp; remote'],
    ],
    sections: [
      {
        h2: 'What a website is actually for',
        lede:
          'A business website has one job: take someone who has never met you and give them enough reason, and enough of a route, to get in touch. Everything else is decoration.',
        prose: [
          'Most sites fail at this quietly. They load slowly enough that a third of visitors leave before seeing anything. They read like a brochure written for the person who commissioned it rather than the person reading it. They bury the phone number. None of that shows up as an error — the site is simply there, costing money, converting nobody.',
          'The build starts from what the site has to do, and works backwards into design and code from there.',
        ],
      },
      {
        h2: 'Why from scratch, and not a template',
        items: [
          ['Speed', 'A template ships the code for every feature it might ever need. A site built for you ships only what your site uses, which is usually a fraction of the weight — and weight is what makes a site slow on a phone.'],
          ['Ownership', 'No monthly licence, no locked page builder, no plugin that stops being maintained and takes the contact form down with it.'],
          ['Difference', 'A template is sold to thousands of businesses. Yours will look like theirs. That is a strange thing to pay for.'],
          ['Search', 'Templates carry markup you cannot control, which is where a lot of technical SEO problems start. A hand-built site has the structure search engines and AI assistants need, because that structure was a decision rather than an accident.'],
        ],
      },
      {
        h2: 'What gets built',
        items: [
          ['Business and corporate sites', 'The core case: who you are, what you sell, why you are credible, and how to reach you.'],
          ['Portfolio sites', 'For people whose work is the argument — designers, photographers, architects, studios.'],
          ['Landing pages', 'One page with one job, usually behind paid traffic.'],
          ['E-commerce', 'Product pages, cart and checkout that survive a phone on a weak connection.'],
          ['Web applications', 'Custom tools when an off-the-shelf product does not fit how you actually work.'],
        ],
      },
      {
        h2: 'What comes with it',
        prose: [
          'Responsive layout tested on real screen sizes, not just a resized browser window. Semantic, accessible markup. Structured data so search engines and AI assistants can read the site as a business rather than as a page of markup. Compressed, correctly sized images. A sitemap, a robots file and canonical URLs that agree with each other.',
          'None of that is an upsell. It is what building a site properly means.',
        ],
      },
    ],
    faq: [
      ['How much does a custom website cost in India?',
       'It depends entirely on scope — a single-page site and a twenty-page e-commerce build are different pieces of work. Rather than selling fixed packages, the quote follows the brief once it is clear what the site has to do. Send the brief through the contact page and you will get a number against it.'],
      ['Do you use WordPress?',
       'Only when a project genuinely needs it — usually when a non-technical team has to publish frequently. For most business sites a hand-built site is faster, safer and cheaper to run, because there is no plugin surface to maintain and nothing to break on an update.'],
      ['Will I be able to edit the site myself?',
       'Yes, where that is part of the brief. Content that changes often gets an admin panel; content that changes twice a year does not need one, and adding it would only add something else to break.'],
      ['Do you build sites for businesses outside Moradabad?',
       'Yes. The work is remote-friendly and has shipped for clients across India as well as in Saudi Arabia, Poland and Nepal.'],
      ['What happens after launch?',
       'You own the site and the code. Ongoing changes, maintenance and further work can be arranged, but you are not locked into anything to keep the site running.'],
    ],
    related: ['ecommerce-website-development', 'website-redesign', 'landing-page-design', 'website-speed-optimization'],
  },

  /* ─────────────────────────────────────────────────────────────────── */
  {
    slug: 'ecommerce-website-development',
    card:
      'Online stores built for how India shops &mdash; mostly on a phone, often on a weak connection, increasingly paying by UPI.',
    nav: 'E-commerce',
    title: 'E-Commerce Website Development in India | Rushan Haque',
    description:
      'Custom e-commerce website development for Indian businesses — product pages, cart and checkout built for mobile, patchy connections and UPI-first payments.',
    eyebrow: 'Service',
    h1: 'E-commerce website development',
    answer:
      'Custom online stores built for how India actually shops: mostly on a phone, often on an unreliable connection, and increasingly paying by UPI. The build covers product pages, cart, checkout and payment integration, with the checkout treated as the part that matters most.',
    facts: [
      ['Discipline', 'E-commerce build'],
      ['Optimised for', 'Mobile &amp; low bandwidth'],
      ['Payments', 'UPI, cards, gateways'],
    ],
    sections: [
      {
        h2: 'The checkout is the product',
        lede:
          'Everything before the checkout is persuasion. The checkout itself is where the money either arrives or does not, and it is the part most stores treat as an afterthought.',
        prose: [
          'A store can have beautiful product photography and still lose most of its buyers on a slow, multi-step, desktop-shaped checkout being used on a phone with two bars of signal. In India that is the normal case, not the edge case.',
          'So the checkout gets built first and tested hardest: as few steps as it can honestly have, forms that remember what you typed when the connection drops, payment options people actually use, and a total that never changes shape at the last screen.',
        ],
      },
      {
        h2: 'What an e-commerce build covers',
        items: [
          ['Product pages', 'Images that load fast at the size they are shown, variants that do not reload the page, and stock state that is honest.'],
          ['Catalogue and search', 'Categories, filters and a search that finds things when the spelling is close but not exact.'],
          ['Cart and checkout', 'Persistent cart, minimum steps, and no surprise charges introduced at the end.'],
          ['Payments', 'UPI, cards, netbanking and wallets through the gateway that suits you — Razorpay, PayU, Cashfree, Stripe.'],
          ['Shipping and tax', 'Rates, zones and GST handled at the point they affect the total, not after.'],
          ['Admin', 'A way to add products and see orders that does not require calling anyone.'],
        ],
      },
      {
        h2: 'Built for Indian conditions',
        prose: [
          'Most e-commerce templates are built and tested on fast connections and expensive phones. That is not the audience. A store here has to work on a mid-range Android over a congested mobile network, and it has to work the first time, because a shopper who sees a blank screen does not come back to test your recovery behaviour.',
          'That means aggressive image compression, minimal JavaScript on the critical path, and a page that shows something useful before every asset has arrived.',
        ],
      },
    ],
    faq: [
      ['How much does an e-commerce website cost?',
       'More than a brochure site and less than most people fear. The variables are catalogue size, how many payment and shipping rules you need, and whether you want a custom admin. The quote follows the brief.'],
      ['Should I use Shopify instead?',
       'Sometimes, honestly, yes — if you want to run everything yourself from day one and the monthly fee plus transaction cut suits you. A custom build wins when you need something Shopify will not do, when the running cost matters over years, or when the storefront has to be genuinely distinctive.'],
      ['Which payment gateway do you integrate?',
       'Whichever you have or want — Razorpay, PayU, Cashfree and Stripe are all straightforward. If you have not chosen yet, the choice usually comes down to settlement time and per-transaction cost for your volume.'],
      ['Can I add products myself?',
       'Yes. Any store that expects a changing catalogue gets an admin for adding products, editing prices and viewing orders.'],
      ['Will it work on slow connections?',
       'That is the design target, not a bonus. Pages are built to render something useful early and to keep a cart intact if the connection drops mid-session.'],
    ],
    related: ['website-design-development', 'website-speed-optimization', 'seo-services', 'landing-page-design'],
  },

  /* ─────────────────────────────────────────────────────────────────── */
  {
    slug: 'web-application-development',
    card:
      'Internal tools, dashboards and portals for when off-the-shelf software does not fit how you actually work.',
    nav: 'Web apps',
    title: 'Web Application Development Services | Rushan Haque',
    description:
      'Custom web application development — internal tools, dashboards and product front-ends built for businesses whose work does not fit off-the-shelf software.',
    eyebrow: 'Service',
    h1: 'Web application development',
    answer:
      'Custom web applications for businesses whose process does not fit an off-the-shelf product: internal tools, dashboards, booking and inventory systems, and product front-ends. Built around how the work is actually done rather than forcing the work to match the software.',
    facts: [
      ['Discipline', 'Application development'],
      ['Typical output', 'Tools, dashboards, portals'],
      ['Starts with', 'Your existing process'],
    ],
    sections: [
      {
        h2: 'When you need one, and when you do not',
        lede:
          'Most businesses should buy software rather than build it. A custom application is worth it in a narrow set of cases — but in those cases it is worth a great deal.',
        prose: [
          'You probably do not need one if a well-known product does the job and you are only irritated by its pricing. You probably do need one when your team is holding a spreadsheet together with conventions everybody has memorised, when three products are being kept in sync by a person retyping things, or when the thing you sell depends on doing something no packaged product does.',
          'The honest test: if the tool disappeared tomorrow, would the business slow down, or would somebody just feel mildly inconvenienced?',
        ],
      },
      {
        h2: 'What gets built',
        items: [
          ['Internal tools', 'The thing that replaces the spreadsheet everyone is afraid to touch.'],
          ['Dashboards', 'Numbers your team actually acts on, in one place, current.'],
          ['Booking and scheduling', 'Availability, reservations and the confirmations around them.'],
          ['Inventory and order systems', 'Stock, movement and fulfilment, with a history you can audit.'],
          ['Client portals', 'A logged-in area where customers see their own data instead of emailing to ask.'],
          ['Product front-ends', 'The interface for a product whose backend already exists.'],
        ],
      },
      {
        h2: 'How it is approached',
        prose: [
          'The first pass is not code. It is working out what the process really is, including the parts nobody documented and the exceptions everyone works around. Software that automates a misunderstood process is worse than the spreadsheet, because now the misunderstanding is enforced.',
          'After that it is built in slices that each do something useful on their own, so you are never waiting six months to find out whether the thing works.',
        ],
      },
    ],
    faq: [
      ['How is this different from a website?',
       'A website mostly shows information to people who are not logged in. An application holds data, changes it, and usually knows who you are. The build is longer, the testing is heavier, and the questions are about process rather than presentation.'],
      ['Can you work with our existing system or database?',
       'Usually yes. Building a new interface onto a backend or database that already works is often the cheapest useful thing that can be done.'],
      ['Do you handle hosting and infrastructure?',
       'Yes — hosting, storage and the infrastructure around an application are part of the service, scoped alongside the build.'],
      ['What if requirements change halfway through?',
       'They will. Building in useful slices exists precisely so that a change of direction costs one slice rather than the whole project.'],
    ],
    related: ['website-design-development', 'ecommerce-website-development', 'website-speed-optimization'],
  },

  /* ─────────────────────────────────────────────────────────────────── */
  {
    slug: 'seo-services',
    card:
      'Technical, local and on-page SEO, done by the person with commit access so the fixes actually ship.',
    nav: 'SEO',
    title: 'SEO Services in India — Technical & Local SEO | Rushan Haque',
    description:
      'SEO services for businesses in India — technical SEO, local SEO and on-page work done by the person who builds the site, not sold as a monthly retainer for reports.',
    eyebrow: 'Service',
    h1: 'SEO services',
    answer:
      'Technical, local and on-page SEO for businesses in India. The work is done by the person who builds the site, which means fixes ship rather than being written into a report and handed to somebody else to implement.',
    facts: [
      ['Discipline', 'Search optimisation'],
      ['Covers', 'Technical, local, on-page'],
      ['Not sold as', 'Monthly report retainers'],
    ],
    sections: [
      {
        h2: 'Most SEO problems are build problems',
        lede:
          'The reason so much SEO work produces nothing is that the findings and the fixing are done by different people, and only the findings get delivered.',
        prose: [
          'An audit tells you your canonical tags point at a redirecting host, your pages have two h1 elements, your images have no alt text and your sitemap lists URLs that 308. Then it is emailed to a developer who has other priorities, and nine months later the same audit finds the same problems.',
          'When the person auditing is the person with commit access, that gap closes. The finding and the fix are the same afternoon.',
        ],
      },
      {
        h2: 'What the work covers',
        items: [
          ['Technical SEO', 'Crawlability, indexing, canonicals, redirects, sitemaps, robots rules, structured data, and the site architecture underneath all of it.'],
          ['Local SEO', 'Google Business Profile, name-address-phone consistency, local landing pages, citations and review strategy — the things that decide the map pack.'],
          ['On-page', 'Titles, meta descriptions, heading structure, internal linking, and content that answers the query rather than circling it.'],
          ['Performance', 'Core Web Vitals, because a slow page is an SEO problem before it is a UX problem.'],
          ['Measurement', 'Search Console and analytics set up so you can see what actually changed.'],
        ],
      },
      {
        h2: 'What it will not do',
        prose: [
          'It will not put a new domain at the top of a national commercial term in a month. Those results are held by sites with years of history and large backlink profiles, and nothing on-page overcomes that on its own.',
          'What it does reliably is win local and long-tail searches, fix the technical faults quietly suppressing a site, and build the structure that lets authority convert into rankings as it accumulates.',
        ],
      },
    ],
    faq: [
      ['How long does SEO take to work?',
       'Technical fixes can move things within weeks because you are removing something actively holding the site back. Competitive rankings take months and depend on authority you build over time. Anyone promising fast national rankings is describing something that does not happen.'],
      ['Do you offer monthly SEO packages?',
       'The default is project work with a defined scope — an audit and the fixes, or a local SEO setup. Ongoing arrangements are possible, but a retainer that produces a monthly report and no shipped changes is not worth either of our time.'],
      ['Can you do SEO on a site you did not build?',
       'Yes. That is most SEO work. The site needs to be one where changes can actually be made — if it is locked inside a page builder nobody has access to, that gets fixed first.'],
      ['What is the single biggest factor for local SEO?',
       'A complete, verified Google Business Profile with consistent name, address and phone details, and real reviews on it. The map pack sits above the normal results and you cannot appear in it without one.'],
    ],
    related: ['generative-engine-optimization', 'website-speed-optimization', 'website-redesign', 'website-design-development'],
  },

  /* ─────────────────────────────────────────────────────────────────── */
  {
    slug: 'generative-engine-optimization',
    card:
      'Becoming the source ChatGPT, Perplexity and Gemini cite &mdash; a new field, and still uncrowded.',
    nav: 'GEO',
    title: 'Generative Engine Optimization (GEO) Services | Rushan Haque',
    description:
      'GEO services — getting your business cited by ChatGPT, Perplexity, Gemini and Google AI Overviews. Structured data, answer-shaped content and AI crawler access.',
    eyebrow: 'Service',
    h1: 'Generative Engine Optimization',
    answer:
      'GEO is the work of becoming the source AI assistants cite. Where SEO competes for a position in a list of links, GEO competes to be quoted inside the answer itself — a different target that needs structured data, answer-shaped content and crawler access built for machines that do not run JavaScript.',
    facts: [
      ['Discipline', 'AI search visibility'],
      ['Targets', 'ChatGPT, Perplexity, Gemini'],
      ['Status', 'Early, and uncrowded'],
    ],
    sections: [
      {
        h2: 'The search box is moving',
        lede:
          'A growing share of questions that used to produce ten blue links now produce a written answer with a handful of citations. If you are not in those citations, you are not in the result at all.',
        prose: [
          'This is a harsher outcome than a low ranking. Position eight on Google still exists and still gets clicks. Not being cited in an AI answer means being absent — the user reads a paragraph, gets what they needed, and never sees a list to scroll.',
          'The mechanics differ from SEO enough to need their own work. Assistants favour content they can extract cleanly, facts they can attribute, and pages they were allowed to read in the first place.',
        ],
      },
      {
        h2: 'What GEO work involves',
        items: [
          ['Structured data', 'Schema.org markup describing the business, its services, its location and its reviews as machine-readable facts rather than prose an assistant has to infer from.'],
          ['Answer-shaped content', 'Direct answers placed high on the page, in the 40-to-60 word block an assistant can lift whole. Questions phrased the way people ask them.'],
          ['Crawler access', 'GPTBot, ClaudeBot, PerplexityBot, Google-Extended and the rest explicitly permitted in robots.txt. Many sites block them by accident and wonder why they are never cited.'],
          ['Server-rendered content', 'AI crawlers largely do not execute JavaScript. Content that only exists after a script runs is, to them, not there.'],
          ['llms.txt', 'A plain-language summary written for machines, giving an assistant a clean account of who you are and what you do.'],
          ['Entity consistency', 'The same name, address, phone and description everywhere, so an assistant can be confident two mentions are the same business.'],
        ],
      },
      {
        h2: 'Why it is worth doing now',
        prose: [
          'SEO is thirty years old and every competitive term has someone defending it. GEO is new enough that most businesses have done nothing at all — many are actively blocking the crawlers that would cite them.',
          'That gap will close. Doing the work while it is open is worth more than doing it well later.',
        ],
      },
    ],
    faq: [
      ['What is Generative Engine Optimization?',
       'GEO is optimising a site so that AI assistants — ChatGPT, Perplexity, Gemini, Google AI Overviews and others — cite it as a source when answering questions. It overlaps with SEO but targets citation inside an answer rather than a position in a list of results.'],
      ['Is GEO different from SEO?',
       'It builds on SEO and adds to it. Fast, crawlable, well-structured pages help both. GEO then adds structured data, extractable answer blocks, explicit AI crawler permissions and server-rendered content, none of which traditional SEO required.'],
      ['How do I get cited by ChatGPT?',
       'Allow OpenAI\'s crawlers in robots.txt, publish content that answers real questions directly and early, mark the facts up in schema so they can be attributed, and make sure the content exists in the HTML rather than appearing after JavaScript runs.'],
      ['Can you measure GEO results?',
       'Partly, and honestly less precisely than search rankings. You can track referral traffic from AI tools, and you can test directly by asking the assistants the questions you want to be the answer to. Anyone claiming a precise AI ranking number is inventing it.'],
      ['Do AI crawlers really ignore JavaScript?',
       'Largely, yes. Most AI crawlers fetch the HTML and read it. If your content is rendered client-side, they see an empty shell — which is why server-rendered or prerendered content matters more for GEO than it does for Google.'],
    ],
    related: ['seo-services', 'website-design-development', 'website-speed-optimization'],
  },

  /* ─────────────────────────────────────────────────────────────────── */
  {
    slug: 'website-redesign',
    card:
      'Diagnose what is genuinely costing you &mdash; speed, mobile, structure or search &mdash; then fix that.',
    nav: 'Redesign',
    title: 'Website Redesign Services in India | Rushan Haque',
    description:
      'Website redesign that starts by diagnosing what is actually costing you — speed, mobile layout, structure or search visibility — instead of restyling and hoping.',
    eyebrow: 'Service',
    h1: 'Website redesign',
    answer:
      'A redesign that begins with a diagnosis rather than a mockup. Most underperforming sites have one or two specific faults — load time, mobile layout, unclear structure, or technical SEO problems — and fixing those beats restyling everything and hoping.',
    facts: [
      ['Discipline', 'Redesign &amp; rebuild'],
      ['Starts with', 'Diagnosis, not a mockup'],
      ['Scope', 'Targeted pass or full rebuild'],
    ],
    sections: [
      {
        h2: 'Redesign is usually the wrong first question',
        lede:
          '“The site looks dated” is rarely why a site is not working. It is simply the most visible thing about it, so it gets blamed.',
        prose: [
          'The actual cause is usually measurable. The site takes eleven seconds on a phone. The contact form has been silently failing since a plugin update. Half the pages are not indexed because a canonical tag points somewhere else. Nobody can find the pricing.',
          'A redesign that does not identify which of those is happening produces a better-looking site with the same conversion rate — an expensive way to change nothing.',
        ],
      },
      {
        h2: 'What the diagnosis looks at',
        items: [
          ['Speed', 'Real load time on a mid-range phone over mobile data, not a desktop score.'],
          ['Mobile behaviour', 'Whether the layout works on a phone or merely fits on one.'],
          ['Search health', 'Indexing, canonicals, redirects, structured data, and whether the site is even eligible to rank.'],
          ['Structure', 'Whether a first-time visitor can find what they came for without guessing.'],
          ['Conversion path', 'Whether it is obvious what to do next, and whether the mechanism for doing it actually works.'],
          ['Content', 'Whether the copy answers the questions people arrive with.'],
        ],
      },
      {
        h2: 'Two ways it goes',
        prose: [
          'Sometimes the diagnosis says the foundation is sound and three specific things are wrong. Then the work is a targeted pass, which is faster and cheaper than a rebuild and usually recovers most of the loss.',
          'Sometimes the site is built on something that cannot be fixed economically — a locked page builder, a theme with unfixable markup, a stack nobody maintains. Then it is a rebuild, and the diagnosis at least means the new site is designed against known problems instead of taste.',
        ],
      },
    ],
    faq: [
      ['How do I know if I need a redesign or just fixes?',
       'Look at the diagnosis before deciding. If the site loads reasonably, is indexed, and works on a phone, targeted fixes will usually get you most of the way. If it fails on several of those at once, a rebuild is generally cheaper than repeatedly patching.'],
      ['Will I lose my Google rankings if I redesign?',
       'Only if the migration is done carelessly. Rankings are lost when URLs change without redirects, when content is cut, or when the new site blocks crawling. Done properly — URL mapping, 301s, structure preserved — rankings hold and usually improve as speed improves.'],
      ['Can you redesign without changing our branding?',
       'Yes. Plenty of redesigns keep the identity entirely and change only the things that were costing money.'],
      ['How long does a redesign take?',
       'A targeted pass is short. A full rebuild follows the same timeline as a new site of the same size. The diagnosis itself is quick, and it is what makes the estimate meaningful.'],
    ],
    related: ['website-design-development', 'website-speed-optimization', 'seo-services'],
  },

  /* ─────────────────────────────────────────────────────────────────── */
  {
    slug: 'landing-page-design',
    card:
      'One page, one action, built to make the paid traffic you are already buying pay for itself.',
    nav: 'Landing pages',
    title: 'Landing Page Design & Development | Rushan Haque',
    description:
      'High-converting landing page design and development for paid campaigns — one page, one action, built to make the traffic you buy pay for itself.',
    eyebrow: 'Service',
    h1: 'Landing page design',
    answer:
      'A landing page has one job and one action. These are built for traffic you are already paying for — ads, campaigns, launches — where the difference between a two per cent and a six per cent conversion rate is the difference between the campaign working and not.',
    facts: [
      ['Discipline', 'Conversion-focused build'],
      ['Structure', 'One page, one action'],
      ['Built for', 'Paid and campaign traffic'],
    ],
    sections: [
      {
        h2: 'Why the homepage is the wrong place to send ads',
        lede:
          'A homepage is built for everybody: existing customers, job applicants, suppliers, and people who are merely curious. An ad clicks from a specific promise, and a homepage answers it with a menu.',
        prose: [
          'That mismatch is where paid budgets go. Someone clicks an ad about one thing, arrives somewhere that talks about eight things, cannot immediately see the one they came for, and leaves. You paid for that click either way.',
          'A landing page continues the sentence the ad started, and removes every route that is not the one action you want.',
        ],
      },
      {
        h2: 'What makes one work',
        items: [
          ['Message match', 'The headline says what the ad promised, in the same words. Anything else reads as a wrong turn.'],
          ['One action', 'A single thing to do. Every extra option measurably reduces how many people do any of them.'],
          ['Speed', 'Paid traffic is mostly mobile. A slow landing page loses people you have already bought.'],
          ['Proof placed where the doubt is', 'Testimonials and evidence next to the claim they support, not collected in a section at the bottom.'],
          ['A form that does not interrogate', 'Every additional field costs completions. Ask for what you will actually use.'],
          ['Honest above the fold', 'What it is, who it is for, what it costs or how to find out — before any scrolling.'],
        ],
      },
    ],
    faq: [
      ['How is a landing page different from a website page?',
       'A website page belongs to a site and links onward to the rest of it. A landing page usually removes the navigation entirely, because every link away from the page is a way to not convert.'],
      ['Do you write the copy?',
       'Copy can be part of the work. On a landing page the words are the conversion mechanism, so writing and layout are difficult to separate usefully.'],
      ['Can you build several variants for testing?',
       'Yes. Variants for A/B testing are straightforward, and worth doing once traffic is high enough for a result to mean anything.'],
      ['Will it integrate with my ads and analytics?',
       'Yes — conversion tracking, pixels and analytics are set up so the campaign can actually be measured. A landing page without tracking is an untested guess.'],
    ],
    related: ['website-design-development', 'website-speed-optimization', 'ecommerce-website-development'],
  },

  /* ─────────────────────────────────────────────────────────────────── */
  {
    slug: 'website-speed-optimization',
    card:
      'Core Web Vitals fixed against a mid-range phone on mobile data, not a desktop test on office broadband.',
    nav: 'Speed',
    title: 'Website Speed Optimization & Core Web Vitals | Rushan Haque',
    description:
      'Website speed optimization and Core Web Vitals fixes, measured on real mid-range phones over mobile data — how your visitors actually load the site.',
    eyebrow: 'Service',
    h1: 'Website speed optimization',
    answer:
      'Speed work measured the way visitors experience it: a mid-range Android phone on mobile data, not a desktop test on office broadband. Covers Core Web Vitals, image and font delivery, render-blocking scripts, and the JavaScript weight most sites carry without needing it.',
    facts: [
      ['Discipline', 'Performance engineering'],
      ['Measured on', 'Mid-range phone, mobile data'],
      ['Targets', 'LCP, INP, CLS'],
    ],
    sections: [
      {
        h2: 'The score is not the point',
        lede:
          'A perfect score from a testing tool run on a fast desktop connection tells you very little about the person trying to load your site on a bus.',
        prose: [
          'Performance work should be judged on field data — what real visitors on real devices actually experience — because that is also what Google uses. A lab score is a debugging aid, not a result.',
          'In India that distinction matters more than almost anywhere. The median visitor is on a mid-range Android over a mobile network, and a site tuned only against a desktop test can be several seconds slower for them than the score suggests.',
        ],
      },
      {
        h2: 'Where the time usually goes',
        items: [
          ['Images', 'Almost always the largest cost. Uncompressed, wrongly sized, in outdated formats, and loaded before anything the visitor can see.'],
          ['JavaScript', 'Frameworks and plugins loaded for features a page never uses. Every kilobyte is downloaded, parsed and executed on a phone with far less processing power than a laptop.'],
          ['Render-blocking resources', 'Stylesheets and scripts in the head that stop the page painting until they arrive.'],
          ['Fonts', 'Custom fonts that block text from appearing, or swap in late and shift the layout under the reader.'],
          ['Third-party tags', 'Analytics, chat widgets, pixels and embeds, each adding a connection to somewhere you do not control.'],
          ['Server response', 'Slow hosting or an uncached backend that delays the very first byte, before the browser can start on anything else.'],
        ],
      },
      {
        h2: 'What Core Web Vitals actually measure',
        items: [
          ['LCP — Largest Contentful Paint', 'How long until the main thing appears. Usually an image or headline. Should be under 2.5 seconds.'],
          ['INP — Interaction to Next Paint', 'How quickly the page responds when someone taps. Replaced FID in 2024 and is harder to pass, because it measures every interaction rather than the first.'],
          ['CLS — Cumulative Layout Shift', 'How much the page moves while loading. The reason you tap the wrong thing on a news site.'],
        ],
      },
    ],
    faq: [
      ['Why is my website slow?',
       'Most often images that are far larger than the space they are shown in, followed by JavaScript the page does not need. A measurement identifies which, because guessing usually leads to optimising something that was not the problem.'],
      ['Does site speed affect Google rankings?',
       'Yes, though less dramatically than often claimed. Core Web Vitals are a ranking signal, but relevance matters more. The larger effect is on conversion — people leave slow pages, and that costs more than the ranking does.'],
      ['What is a good Core Web Vitals score?',
       'LCP under 2.5 seconds, INP under 200 milliseconds, CLS under 0.1 — measured on real mobile visits, not a lab test.'],
      ['Can you speed up a site on WordPress or Shopify?',
       'Usually yes, though the ceiling is lower than on a hand-built site because a lot of the weight comes from the platform and its plugins. Substantial gains are still normally available.'],
    ],
    related: ['seo-services', 'website-redesign', 'website-design-development', 'generative-engine-optimization'],
  },
];
