// Content carried over from the previous portfolio (content/projects.json, editorial.json, profile.json).
// Every image path points into /public/img. Plans are line drawings of the finished screens.

export const works = [
  {
    slug: 'taif', title: 'Taif International', short: 'Taif', field: 'Handicrafts · Export', year: '2026', status: 'Live',
    url: 'https://taifinternational.co', image: '/img/work/work-taif.webp', plan: '/img/plan/work-taif.webp', w: 1600, h: 773,
    line: 'Brass, copper and wood, shipped to 42 countries.',
    description: 'Website for a Moradabad handicraft manufacturer exporting brass, copper and wood to 42 countries.',
    tags: ['Web design', 'Development', 'Export catalogue'],
  },
  {
    slug: 'erfolg-living', title: 'Erfolg Living', short: 'Erfolg', field: 'Interiors · Living', year: '2026', status: 'Live',
    url: 'https://erfolgliving.com', image: '/img/work/work-erfolg-living.webp', plan: '/img/plan/work-erfolg-living.webp', w: 1600, h: 769,
    line: 'Copper baths and lighting, made by hand.',
    description: 'Website for a maker of handmade luxury metalwork: copper bathtubs, sinks, lighting and furniture.',
    tags: ['Web design', 'Development', 'Live site'],
    caseStudy: {
      context: 'An interiors brand site that opens on a finished space.',
      decisions: [
        { title: 'Architecture sets the rhythm.', text: 'Repeated arches give the headline a central axis.' },
        { title: 'Type carries the position.', text: 'Wide capitals and an italic accent; the image stays largest.' },
        { title: 'A direct route in.', text: 'An outlined collection button sits below the headline.' },
      ],
    },
  },
  {
    slug: 'aurelio', title: 'Aurelio', short: 'Aurelio', field: 'Furniture · Lighting', year: '2026', status: 'Live',
    url: 'https://aurelio.in', image: '/img/work/work-aurelio.webp', plan: '/img/plan/work-aurelio.webp', w: 1600, h: 780,
    line: 'Furniture and light, in metal and wood.',
    description: 'Website for Aurelio, the metal and wood atelier of AF International: handcrafted furniture, lighting and decor.',
    tags: ['Web design', 'Development', 'Live site'],
  },
  {
    slug: 'casa-and-crop', title: 'Casa&Crop', short: 'Casa&Crop', field: 'Homeware · Export', year: '2026', status: 'Live',
    url: 'https://casaandcrop.com', image: '/img/work/work-casa-and-crop.webp', plan: '/img/plan/work-casa-and-crop.webp', w: 1600, h: 775,
    line: 'Home metalware for 34 countries.',
    description: 'Website for a home-metalware manufacturer exporting from Moradabad to 34 countries.',
    tags: ['Web design', 'Development', 'Live site'],
    caseStudy: {
      context: 'Furnishings shown in one full-frame interior scene.',
      decisions: [
        { title: 'Objects in a setting.', text: 'Furniture and lighting appear together in one room.' },
        { title: 'A quiet identity.', text: 'A small white wordmark lets the photography lead.' },
        { title: 'More to see.', text: 'A slim index and a down cue hint at further scenes.' },
      ],
    },
  },
  {
    slug: 'velora', title: 'Velora', short: 'Velora', field: 'Atelier · Metalware', year: '2026', status: 'In progress',
    url: 'https://www.veloralivings.in', image: '/img/work/work-velora.webp', plan: '/img/plan/work-velora.webp', w: 1600, h: 770,
    line: 'Brass, bronze and silver, raised by hand.',
    description: 'Website for a Moradabad atelier that hand-raises objects in brass, bronze, copper and silver. Still being built.',
    tags: ['Web design', 'Development', 'In progress'],
  },
  {
    slug: 'ibm-consultancy', title: 'IBM Consultancy', short: 'IBM', field: 'Immigration · Visas', year: '2026', status: 'Live',
    url: 'https://www.ibmconsultancy.com', image: '/img/work/ibm-consultancy-v2.webp', plan: '/img/plan/ibm-consultancy-v2.webp', w: 1093, h: 569,
    line: 'Passports and visas, handled with precision.',
    description: 'Website for a New Delhi immigration and visa consultancy: passports, visas, study and work abroad.',
    tags: ['Web design', 'Development', 'Live site'],
  },
]

export const products = [
  {
    slug: 'inventory-software', title: 'Inventory management software', short: 'Inventory', field: 'Web application', year: '2026', status: 'Live',
    image: '/img/work/inventory-software.webp', plan: '/img/plan/inventory-software.webp', w: 1600, h: 783,
    description: 'One place for the whole product library, with shareable catalogues, quotations and pro forma invoices in a few clicks.',
    tags: ['Inventory', 'Catalogues', 'Quotations', 'Pro formas'],
    does: [
      'The whole library in one place, by category, with prices and images.',
      'Catalogues, quotations and pro formas in a few clicks.',
      'Every change logged: who did what, and when.',
    ],
    steps: [
      { title: 'Build the library', text: 'Codes, categories, prices and photos, found instantly.' },
      { title: 'Make a catalogue', text: 'Share a set of products, and see how often it is opened.' },
      { title: 'Quote and invoice', text: 'Quotations and pro formas straight from the library, ready to send.' },
      { title: 'Track the work', text: 'Totals at a glance, and a log of everything that changed.' },
    ],
  },
  {
    slug: 'mailwright', title: 'Mailwright', short: 'Mailwright', field: 'Web application', year: '2026', status: 'Live',
    image: '/img/work/mailwright.webp', plan: '/img/plan/mailwright.webp', w: 1600, h: 824,
    description: 'Mail merge and bulk email: write once with personal fields, import your contacts, and every recipient gets their own version.',
    tags: ['Mail merge', 'Bulk email', 'Templates', 'Campaigns'],
    does: [
      'One email to many, personalised with each name and company.',
      'Saved templates and contact lists, so a send takes minutes.',
      'Subject lines suggested, and the message rephrased in your tone.',
    ],
    steps: [
      { title: 'Write', text: 'A saved template or a blank page, with fields like [name] dropped in.' },
      { title: 'Add contacts', text: 'Import a list; every field maps onto the placeholders.' },
      { title: 'Send', text: 'All at once, or as a planned campaign.' },
    ],
  },
]

export const building = [
  { slug: 'filigrana', title: 'Filigrana', field: 'Ethnic wear', sheet: 'A-101', url: 'https://filigrana-seven.vercel.app/', image: '/img/work/filigrana-v2.webp', plan: '/img/plan/filigrana-v2.webp', w: 1600, h: 808, description: 'Website for an ethnic wear brand.' },
  { slug: 'svg-express', title: 'SVG Express', field: 'Online platform', sheet: 'A-102', url: 'https://svg-express-demo.vercel.app/', image: '/img/work/svg-express-v2.webp', plan: '/img/plan/svg-express-v2.webp', w: 1199, h: 573, description: 'Online platform for SVG Express.' },
]

export const experiments = [
  { title: 'ShadowChat', kind: 'Web', year: '2025', text: 'Encrypted chat where messages self-destruct.', url: 'https://shadow-chat-7ifp.onrender.com', image: '/img/work/work-shadow-chat.webp' },
  { title: 'CodeSense AI', kind: 'AI', year: '2025', text: 'Paste code, get a plain-English breakdown.', url: 'https://code-sense-ai-omega.vercel.app/', image: '/img/work/work-codesense-ai.webp' },
  { title: 'Novellect', kind: 'AI', year: '2025', text: 'Literary curation for the modern mind.', url: 'https://novellect.vercel.app/', image: '/img/work/work-novellect.webp' },
  { title: 'Upside Sound', kind: 'AI', year: '2025', text: 'Turns your personality into a music profile.', url: 'https://upsidesound.vercel.app/', image: '/img/work/work-upside-sound.webp' },
  { title: 'Quorum', kind: 'Product', year: '2025', text: 'Four people answer privately about you.', url: 'https://quorum-tan.vercel.app/', image: '/img/work/work-quorum.webp' },
  { title: 'Superlatives', kind: 'Product', year: '2025', text: 'Anonymous nominations: who’s most likely to?', url: 'https://superlatives-wheat.vercel.app/', image: '/img/work/work-superlatives.webp' },
  { title: 'LinguaLens', kind: 'AI', year: '2025', text: 'Point your camera, get a live translation.', url: 'https://lingua-lens-tan.vercel.app/' },
  { title: 'Symphony', kind: 'Web', year: '2025', text: 'In-browser piano with a built-in synthesizer, played with the keyboard or mouse.', url: 'https://symphony-coral.vercel.app' },
  { title: 'AuraAI', kind: 'AI', year: '2025', text: 'An AI assistant invisible to screen recordings.', url: 'https://rushanhaque.itch.io/auraai' },
  { title: 'Cortex', kind: 'Tool', year: '2025', text: 'Screen capture with surrounding context.', url: 'https://rushanhaque.itch.io/cortex' },
  { title: 'GitHub Auto-Push', kind: 'Tool', year: '2025', text: 'Commit and push without the terminal.', url: 'https://rushanhaque.itch.io/autorepopusher' },
  { title: 'ShadowKill', kind: 'Tool', year: '2025', text: 'Knock twice on your desk and every browser closes and a spreadsheet opens.', url: 'https://github.com/rushanhaque/killswitch/releases/tag/trial' },
  { title: 'Sentry Mode', kind: 'IoT', year: '2025', text: 'A USB-key alarm for your PC: remove the Arduino to arm it, and any mouse movement sets off a siren and a phone alert.', url: 'https://github.com/rushanhaque/sentry-mode' },
  { title: 'DeadDrop', kind: 'IoT', year: '2025', text: 'A pocket file server with its own Wi-Fi: send files between devices with no internet.', url: 'https://github.com/rushanhaque/NordeMCU_FileServer' },
]

// page: the service's own page, where it has one (the others are asked about directly)
export const services = [
  { title: 'UI/UX design', page: 'website-design-development', text: 'Interfaces designed around the people who use them: websites, apps and software that feel obvious to use and look considered.', items: ['Interface design', 'User flows', 'Prototypes', 'Motion'], icon: 'design' },
  { title: 'Web development', page: 'website-design-development', text: 'Full-stack builds that load in a blink on any phone, stay easy to update, and keep working long after launch.', items: ['React', 'Full-stack', 'Performance', 'Accessibility'], icon: 'code' },
  { title: 'E-commerce & catalogues', page: 'ecommerce-website-development', text: 'Online stores and digital catalogues for product businesses and exporters, made for buyers anywhere.', items: ['Online stores', 'Catalogues', 'Exporters', 'Payments'], icon: 'bag' },
  { title: 'ERPs & CRMs', page: 'web-application-development', text: 'Software to run your operations and keep track of customers - inventories, quotations, invoices and logs.', items: ['Inventory', 'Quotations', 'Dashboards', 'Activity logs'], icon: 'grid' },
  { title: 'SEO & AI search', page: 'seo-services', text: 'Get found on Google, and in AI answers like ChatGPT and Gemini.', items: ['Technical SEO', 'Structured data', 'AI visibility', 'Local search'], icon: 'search' },
  { title: 'Mobile apps', text: 'iOS and Android apps, published to the App Store and Google Play.', items: ['iOS', 'Android', 'Store listing', 'Releases'], icon: 'phone' },
  { title: 'Cloud solutions', text: 'Hosting and servers that keep up as you grow.', items: ['AWS', 'Hosting', 'Domains', 'Monitoring'], icon: 'cloud' },
  { title: 'Digital marketing', page: 'landing-page-design', text: 'Ad campaigns judged by the enquiries and sales they bring.', items: ['Campaigns', 'Landing pages', 'Analytics', 'Enquiries'], icon: 'spark' },
  { title: 'Social media', text: 'Regular, on-brand posts across your channels.', items: ['Content calendar', 'Brand voice', 'Posts', 'Reels'], icon: 'chat' },
  { title: 'Video editing', text: 'Edits for launches, reels and ads.', items: ['Launch films', 'Reels', 'Ads', 'Captions'], icon: 'play' },
]

export const process = [
  { no: 'I', room: 'The conversation', title: 'Discovery', text: 'It starts with listening: what the business makes, who buys it, and what the website must do for them. Then a clear scope everyone can hold.', tags: ['Goals', 'Audience', 'Scope'] },
  { no: 'II', room: 'The drawing', title: 'Design', text: 'Structure first, then surface. Wireframes become a visual language - type, colour, motion - designed around your products, not a template.', tags: ['Wireframes', 'Visual design', 'Prototype'] },
  { no: 'III', room: 'The building', title: 'Development', text: 'Hand-built and responsive, fast on any phone, accessible, and simple for your team to update.', tags: ['Front-end', 'Back-end', 'CMS'] },
  { no: 'IV', room: 'The opening', title: 'Launch', text: 'Domains, hosting, analytics and search set up properly, then a careful release - checked on real devices.', tags: ['Hosting', 'SEO', 'QA'] },
  { no: 'V', room: 'The keys', title: 'Handover', text: 'Everything explained and documented, so the site belongs to you - not to whoever built it.', tags: ['Training', 'Docs', 'Access'] },
  { no: 'VI', room: 'The years after', title: 'Care', text: 'I stay in touch long after the site goes live: updates, improvements and a person to call.', tags: ['Updates', 'Support', 'Growth'] },
]

export const stats = [
  { value: '40', suffix: '+', label: 'Projects worked on, and counting' },
  { value: '17', suffix: '+', label: 'Certificates, trainings & simulations' },
  { value: '5.0', suffix: '', label: 'Average rating across nine client reviews' },
  { value: '3', suffix: '', label: 'Languages spoken - English, Hindi, French' },
]

export const writings = [
  { slug: 'borrowed-brilliance', title: 'Borrowed Brilliance', sub: 'A thesis on the erosion of human skill through AI dependency', kind: 'Research paper', year: '2026', status: 'Published', url: 'https://doi.org/10.13140/RG.2.2.25183.83367', source: 'DOI · ResearchGate', page: '/img/write/writing-borrowed-brilliance-v2.webp', color: '#4b2631', ink: '#F0DFC0', text: 'Work produced by AI but presented by a person is borrowed brilliance: competence displayed by the individual, owned by the model. The paper names the cost - Competence Debt - and closes with the Deliberate Friction Framework.' },
  { slug: 'algorithmic-empathy', title: 'The Paradox of Algorithmic Empathy', sub: 'Can a machine understand suffering?', kind: 'Research paper', year: '2026', status: 'Published', url: 'https://zenodo.org/records/23289920', source: 'Zenodo', color: '#371f27', ink: '#EFE7CF', text: 'Can a machine truly understand human suffering, or does it only sound like it does?' },
  { slug: 'feedback-loop-collapse', title: 'Feedback Loop Collapse', sub: 'When AI learns from its own reflection', kind: 'Technical note', year: '2026', status: 'Published', url: 'https://zenodo.org/records/19024124', source: 'DOI 10.5281/zenodo.19024124', page: '/img/write/writing-feedback-loop-collapse.webp', color: '#2A211D', ink: '#D9B97E', text: 'As models learn from model-made text, their training data drifts from the real world. This note names the effect Corpus Entropy Decay and traces its cost to diversity, correctness and creativity. Published on Zenodo, 14 March 2026.' },
  { slug: 'to-the-moon-and-beyond', title: 'To the Moon and Beyond', sub: 'A book contribution', kind: 'Book contribution', year: '2021', status: 'Published', url: 'https://www.amazon.in/Moon-Beyond-Insha-Haque-ebook/dp/B09HKYJLFW', source: 'Blue Rose Publishers · Kindle', color: '#9C7A45', ink: '#231A15', text: 'A contribution to a book published by Blue Rose Publishers on 29 September 2021. Available as a Kindle ebook.' },
  { slug: 'aabshar-e-khayaal', title: 'Aabshar-e-Khayaal', sub: 'Urdu poetry & reflective writing', kind: 'Poetry', year: 'Ongoing', status: 'On Instagram', url: 'https://www.instagram.com/aabshar_e_khayaal/', source: 'Instagram', color: '#3B1B2C', ink: '#E9CFA0', text: 'A waterfall of thought - Urdu poetry and reflective writing, published as an ongoing series.' },
  { slug: 'the-psychology-framework', title: 'The Psychology Framework', sub: 'The architecture of how we think', kind: 'Book in progress', year: '2026', status: 'Forthcoming', url: '', source: 'In progress', color: '#D9CFBD', ink: '#3B302B', text: 'An upcoming book on the architecture of how we think. Details soon.' },
]

export const reviews = [
  { name: 'Danish Faiz', company: 'Erfolg Living', location: 'India', date: 'Nov 2025', quote: 'Completely transformed erfolg’s online presence, great working with you' },
  { name: 'Laiba Masood', company: 'SIAAM Logistics', location: 'Saudi Arabia', date: 'Dec 2025', quote: 'Excellent overall experience. very thoughtful, collaborative and impressive. Thank you so much Rushan' },
  { name: 'MO. Saud', company: 'AF International', location: 'India', date: 'Apr 2026', quote: 'I got website for my sister concern firm Aurelio. Loved the ideas, great design, keep going' },
  { name: 'Kanishka', company: 'Nublin', location: 'Poland', date: 'Apr 2026', quote: 'Amazing person amazing work, Loved it' },
  { name: 'Sufiyan', company: 'Casa&Crop', location: 'India', date: 'Jan 2026', quote: 'quite creative, very impressive' },
  { name: 'Rafay Zahid', company: 'Barha', location: 'India', date: 'Feb 2026', quote: 'Really happy with my website. Good work' },
  { name: 'Hammad', company: 'Velora International', location: 'India', date: 'Aug 2026', quote: 'Good work and amazing design' },
  { name: 'Kanchan', company: '', location: 'Nepal', date: 'Apr 2026', quote: 'good tool really helps alot' },
  { name: 'MO. Ubaid', company: 'Sr. Merchandiser · Oliver McInroy & Co', location: 'India', date: 'Mar 2026', quote: 'Good work' },
]

// Where I serve - the camera travels from home, across India, out to the world.
// Cities and copy carried over from the previous site's map.
export const serve = {
  home: { name: 'Moradabad', lat: 28.84, lon: 78.77 },
  steps: [
    { key: 'Moradabad', label: 'Home base', title: 'It starts in Moradabad.', text: 'Where I work from, in western Uttar Pradesh, with Rampur, Amroha, Sambhal and Bareilly all close by.', box: [77.75, 28.1, 79.75, 29.6] },
    { key: 'India', label: 'India', title: 'Then across India.', text: 'From Delhi NCR and Lucknow to Mumbai, Bengaluru, Hyderabad and Kolkata: 32 cities, served over calls and WhatsApp.', box: [67.5, 7.5, 97.5, 36.5] },
    { key: 'Worldwide', label: 'Worldwide', title: 'And anywhere online.', text: 'Clients in Saudi Arabia, Poland and Nepal already, and open to businesses from Dubai and London to New York, Singapore and Sydney.', box: [-122, -38, 154, 60] },
  ],
  places: [
    { name: 'Rampur', lat: 28.8, lon: 79.03, stage: 0, label: 'r' },
    { name: 'Amroha', lat: 28.9, lon: 78.47, stage: 0, label: 'l' },
    { name: 'Sambhal', lat: 28.59, lon: 78.57, stage: 0, label: 'b' },
    { name: 'Bijnor', lat: 29.37, lon: 78.13, stage: 0, label: 'l' },
    { name: 'Kashipur', lat: 29.21, lon: 78.96, stage: 0, label: 't' },
    { name: 'Bareilly', lat: 28.37, lon: 79.43, stage: 0, label: 'r' },
    { name: 'Rudrapur', lat: 28.98, lon: 79.4, stage: 0 },
    { name: 'Haldwani', lat: 29.22, lon: 79.51, stage: 0 },
    { name: 'Delhi NCR', lat: 28.61, lon: 77.21, stage: 1, label: 'l' },
    { name: 'Noida', lat: 28.54, lon: 77.39, stage: 1 },
    { name: 'Meerut', lat: 28.98, lon: 77.71, stage: 1 },
    { name: 'Saharanpur', lat: 29.96, lon: 77.55, stage: 1 },
    { name: 'Dehradun', lat: 30.32, lon: 78.03, stage: 1 },
    { name: 'Aligarh', lat: 27.88, lon: 78.08, stage: 1 },
    { name: 'Agra', lat: 27.18, lon: 78.01, stage: 1 },
    { name: 'Kanpur', lat: 26.45, lon: 80.33, stage: 1 },
    { name: 'Lucknow', lat: 26.85, lon: 80.95, stage: 1, label: 'r' },
    { name: 'Jaipur', lat: 26.91, lon: 75.79, stage: 1, label: 'l' },
    { name: 'Chandigarh', lat: 30.73, lon: 76.78, stage: 1, label: 'l' },
    { name: 'Ahmedabad', lat: 23.02, lon: 72.57, stage: 1, label: 'l' },
    { name: 'Indore', lat: 22.72, lon: 75.86, stage: 1 },
    { name: 'Mumbai', lat: 19.08, lon: 72.88, stage: 1, label: 'l' },
    { name: 'Pune', lat: 18.52, lon: 73.86, stage: 1 },
    { name: 'Hyderabad', lat: 17.39, lon: 78.49, stage: 1, label: 'r' },
    { name: 'Bengaluru', lat: 12.97, lon: 77.59, stage: 1, label: 'l' },
    { name: 'Chennai', lat: 13.08, lon: 80.27, stage: 1, label: 'r' },
    { name: 'Kolkata', lat: 22.57, lon: 88.36, stage: 1, label: 'r' },
    { name: 'Patna', lat: 25.59, lon: 85.14, stage: 1 },
    { name: 'Guwahati', lat: 26.14, lon: 91.74, stage: 1 },
    { name: 'Riyadh', lat: 24.71, lon: 46.68, stage: 2, label: 'l', client: true },
    { name: 'Warsaw', lat: 52.23, lon: 21.01, stage: 2, label: 'r', client: true },
    { name: 'Kathmandu', lat: 27.72, lon: 85.32, stage: 2, label: 'b', client: true },
    { name: 'Dubai', lat: 25.2, lon: 55.27, stage: 2, label: 'b' },
    { name: 'London', lat: 51.51, lon: -0.13, stage: 2, label: 'l' },
    { name: 'New York', lat: 40.71, lon: -74.01, stage: 2, label: 'r' },
    { name: 'Singapore', lat: 1.35, lon: 103.82, stage: 2, label: 'r' },
    { name: 'Sydney', lat: -33.87, lon: 151.21, stage: 2, label: 'l' },
  ],
  stats: [
    { value: '1', label: 'Home base' },
    { value: '32', label: 'Cities served' },
    { value: '4', label: 'Client countries' },
  ],
}

export const experience = [
  { role: 'Project Manager', company: 'TechBuzz Ideas', period: 'Jul 2026 - Present', text: 'Leading end-to-end delivery of client web and software projects: scope, timelines and the client relationship.' },
  { role: 'UI/UX Developer', company: 'TechBuzz Ideas', period: 'Apr 2026 - Jul 2026', text: 'Responsive interfaces for websites, custom software and mobile apps, with careful motion and interaction.' },
  { role: 'Merchandiser', company: 'A.F. International', period: 'Jul 2025 - Jan 2026', text: 'Product development and production schedules for an export manufacturer, coordinating international buyers and vendors.' },
  { role: 'Freelance Developer', company: 'Independent', period: '2024 - Present', text: 'Websites for commercial clients worldwide, including e-commerce stores and digital catalogues. The full lifecycle, from requirements to post-launch support.' },
]

export const education = [
  { title: 'B.Tech, Computer Science (IoT)', institution: 'Moradabad Institute of Technology', period: '2023 - 2027' },
  { title: 'Senior Secondary (CBSE)', institution: 'Bonny Anne Public School', period: '2021 - 2023' },
]

export const certifications = [
  { title: 'GenAI Data Analytics Job Simulation', issuer: 'Tata · Forage', date: 'Mar 2026', kind: 'Simulation', image: '/img/cert/credential-tata-job.webp' },
  { title: 'Technology Job Simulation', issuer: 'Deloitte Australia · Forage', date: 'Feb 2026', kind: 'Simulation', image: '/img/cert/credential-deloitte-tech.webp' },
  { title: 'Software Engineering Job Simulation', issuer: 'JPMorgan Chase · Forage', date: 'Feb 2026', kind: 'Simulation', image: '/img/cert/credential-jpmorgan-se.webp' },
  { title: 'Claude Code in Action', issuer: 'Anthropic', date: 'Mar 2026', kind: 'Training', image: '/img/cert/credential-claude-ai.webp' },
  { title: 'Model Context Protocol', issuer: 'Anthropic', date: '', kind: 'Training', image: '/img/cert/credential-anthropic-mcp.webp' },
  { title: 'Gemini Certified Student - University', issuer: 'Google for Education', date: '2026', kind: 'Training', image: '/img/cert/credential-google-gemini.webp' },
  { title: 'Google Play Store Listing', issuer: 'Google Play Academy', date: 'Feb 2026', kind: 'Training' },
  { title: 'OCI 2025 Certified AI Foundations Associate', issuer: 'Oracle University', date: 'Oct 2025', kind: 'Training', image: '/img/cert/credential-oracle-cloud.webp' },
  { title: 'Oracle Fusion AI', issuer: 'Oracle University', date: '', kind: 'Training', image: '/img/cert/credential-oracle-fusion-ai.webp' },
  { title: 'Python Essentials 1', issuer: 'Cisco', date: 'Oct 2024', kind: 'Training', image: '/img/cert/credential-cisco-python.webp' },
  { title: 'Python Essentials 2', issuer: 'Cisco', date: 'Oct 2024', kind: 'Training' },
  { title: 'Ethical Hacking Masterclass', issuer: '', date: '', kind: 'Training', image: '/img/cert/credential-ethical-hacking.webp' },
  { title: 'Python Training', issuer: '', date: '', kind: 'Training', image: '/img/cert/credential-python-training.webp' },
  { title: 'AI in Digital Marketing', issuer: '', date: '', kind: 'Workshop', image: '/img/cert/credential-ai-digital-marketing.webp' },
  { title: 'AI Tools Workshop', issuer: '', date: '', kind: 'Workshop', image: '/img/cert/credential-ai-tools-workshop.webp' },
  { title: 'Power BI Workshop', issuer: '', date: '', kind: 'Workshop', image: '/img/cert/credential-power-bi.webp' },
  { title: 'DUCAT Industrial Visit', issuer: 'DUCAT', date: '', kind: 'Visit', image: '/img/cert/credential-ducat-visit.webp' },
]

export const skills = {
  Technical: ['Full-stack development', 'React', 'AWS', 'Git & GitHub', 'UI/UX design', 'Gen AI', 'IoT'],
  Professional: ['Project management', 'Client relations', 'Communication', 'Content writing'],
}

export const languages = ['English', 'Hindi', 'French']

export const insights = [
  { tag: 'Design', title: 'Make room for the idea.', text: 'A crowded screen asks the reader to make all the decisions. White space is not a pause in the design. It is part of the sentence - it gives an image its scale, a line its emphasis, and an idea enough room to land.' },
  { tag: 'Interaction', title: 'Motion needs a reason.', text: 'A transition can explain a relationship; a small response can confirm an action. When everything moves with equal urgency, nothing has emphasis. Motion works best when it has a hierarchy, just like typography.' },
  { tag: 'Thinking', title: 'Stay with the question.', text: 'Writing is a way to test an idea. Assumptions become visible when they have to fit inside a sentence. The aim is clarity about what is known, what is inferred, and what still needs a better question.' },
]

export const faq = [
  { q: 'Do you work with clients outside India?', a: 'Yes. Clients so far are in India, Saudi Arabia, Poland and Nepal, and most of the export businesses I build for sell to buyers in dozens of countries. Everything runs smoothly over calls, WhatsApp and email.' },
  { q: 'What does a project include?', a: 'The whole lifecycle: discovery, design, development, hosting and handover. You get a site that is fast on phones, set up for search, and simple for your team to update.' },
  { q: 'Can you redesign the website I already have?', a: 'Yes. We start from what works on your current site, keep what you have earned in search, and rebuild the rest around your products and buyers.' },
  { q: 'What happens after launch?', a: 'I stay in touch long after the site goes live - updates, improvements, new pages, and a person to call when something needs doing.' },
  { q: 'Do you build online stores and software too?', a: 'Yes - e-commerce stores, digital catalogues, inventory systems, CRMs and tools like Mailwright. If your team does it by hand today, it can probably be software tomorrow.' },
]

export const allProjects = [...works, ...products]
export const projectBySlug = (slug) => allProjects.find((p) => p.slug === slug)
export const productBySlug = (slug) => products.find((p) => p.slug === slug)

// The home page's chapters, as the header's Contents lists them: number, name, the line under
// it, and a one-sentence abstract.
export const chapters = [
  { id: 'work', title: 'Recent works', kind: 'Client sites', abstract: 'Six client websites, live today, for export houses, interiors brands and a visa consultancy.' },
  { id: 'drafting', title: 'Currently building', kind: 'On the drawing board', abstract: 'Sites in progress right now, each a preview you can open today.' },
  { id: 'products', title: 'Products', kind: 'Software', abstract: 'Inventory software and Mailwright: tools teams open every morning, built for jobs once done by hand.' },
  { id: 'clientele', title: 'Clientele', kind: 'Brands I work with', abstract: 'Brands in India, Saudi Arabia, Poland and Nepal, most of them export houses.' },
  { id: 'serve', title: 'Where I serve', kind: 'Moradabad · India · World', abstract: 'From home in Moradabad to 32 cities across India, and clients in four countries.' },
  { id: 'services', title: 'Other services', kind: 'What else I do', abstract: 'Ten services, from stores, ERPs and apps to search, campaigns and video.' },
  { id: 'reviews', title: 'Reviews', kind: 'Client words', abstract: 'Nine client reviews, every one of them five stars.' },
  { id: 'writing', title: 'Writing', kind: 'Papers and books', abstract: 'Research on what AI does to the way we think, a book contribution and Urdu poetry.' },
  { id: 'about', title: 'About', kind: 'Who I am', abstract: 'A developer and writer from Moradabad, working with businesses in India and abroad.' },
]
