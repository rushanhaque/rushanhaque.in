import { FaqBlock, JsonLd } from '@/components/guide-blocks';
import { faqPage } from '@/lib/schema';

// The questions people search before hiring a website designer, answered on
// the homepage so search engines and AI assistants can quote them directly.
const FAQS = [
  { q: 'Who builds websites in Moradabad?', a: 'Rushan Haque is a website designer and full-stack developer based in Moradabad, Uttar Pradesh. He designs and builds custom business websites, e-commerce stores, export catalogues and web applications from scratch, for clients in Moradabad, across India and abroad.' },
  { q: 'Do you work with businesses outside Moradabad?', a: 'Yes. Projects run over calls, WhatsApp and email with a live preview link, so clients anywhere in India or abroad can follow the work. Clients so far include businesses in India, Saudi Arabia, Poland and Nepal.' },
  { q: 'How much does a website cost?', a: 'It depends on what the site has to do: a landing page, a business website, an online store and a web application are priced differently. Every project gets a fixed, written quote with a timeline before any work starts.' },
  { q: 'How long does it take to make a website?', a: 'A landing page usually takes one to two weeks, a business website two to four weeks, and an e-commerce store or catalogue four to eight weeks, depending on how ready the content is.' },
  { q: 'Will my website show up on Google?', a: 'Every site is built for search: fast pages, clear headings, structured data, a sitemap and Google Search Console. Help with your Google Business Profile, which decides most “near me” results, is included.' },
  { q: 'Do I own the website?', a: 'Yes. The domain, hosting account and code are in your name once the project is paid for, with no monthly fee to keep the site.' },
];

export function HomeFaq() {
  return <div className="imported-page home-faq" id="faq" data-chapter="Questions">
    <JsonLd data={faqPage(FAQS)}/>
    <div className="container source-content"><FaqBlock label="FAQ" faqs={FAQS} title="Getting a website <em>made.</em>"/></div>
  </div>;
}
