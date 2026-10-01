import sourcePages from '@/content/source-pages.json';
import { ImportedPage } from '@/components/imported-page';
import type { Metadata } from 'next';
import { CredentialCatalogue } from '@/components/credential-catalogue';
import { pageMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { PageIntro } from '@/components/page-intro';
import { email,socials } from '@/lib/content';
const titles:Record<string,string>={certifications:'Credentials & experience',privacy:'Privacy',accessibility:'Accessibility'};
type Props={params:Promise<{page:string}>};
export const dynamicParams=false;
export function generateStaticParams(){return [...Object.keys(titles),...sourcePages.map(p=>p.slug)].map(page=>({page}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {page}=await params;const imported=sourcePages.find(p=>p.slug===page);return pageMetadata('/'+page,imported?.title||titles[page]||'Page not found',imported?.description||`${titles[page]||'Page'} — Rushan Haque.`);}
export default async function InformationPage({params}:Props){const {page}=await params;const imported=sourcePages.find(p=>p.slug===page);if(imported)return <ImportedPage page={imported}/>;if(!titles[page])notFound();
  if(page==='certifications')return <main id="main-content"><PageIntro eyebrow="CREDENTIALS" title="Always a student" accent="of something." description="Certifications, workshops and documents."/><CredentialCatalogue/><p className="container page-note">Job simulations are self-paced learning. They don’t imply employment.</p></main>;
  if(page==='privacy')return <main id="main-content"><PageIntro eyebrow="PRIVACY" title="Your information," accent="handled with care." description="What this site collects, in plain language."/><section className="container policy-body"><h2>What I collect</h2><p>Enquiries, call requests and reviews store the details you enter: name, email and message. I use them to reply.</p><h2>Reviews</h2><p>Reviews are moderated. Your email stays private. With your permission, your name, company, rating and review may be published.</p><h2>Tracking</h2><p>No advertising trackers. The site counts page-level actions like project opens and form starts, with no visitor identifier. Counts are kept for 90 days and respect Do Not Track.</p><h2>Call requests</h2><p>A requested time is a preference, not a booking. I confirm by email.</p><h2>Your data</h2><p>To ask about or delete your information, email <a href={`mailto:${email}`}>{email}</a>.</p><p className="small-note">Updated September 2026.</p></section></main>;
  return <main id="main-content"><PageIntro eyebrow="ACCESSIBILITY" title="Made for" accent="everyone." description="Usable by keyboard, touch and pointer, on any screen."/><section className="container policy-body"><h2>Less motion</h2><p>Your reduced-motion setting is respected. The Motion switch in the footer turns off animation and the custom cursor. All content stays available.</p><h2>Navigation</h2><p>There is a skip link, visible keyboard focus, labelled forms and full browser zoom.</p><h2>Something in the way?</h2><p>Email <a href={`mailto:${email}`}>{email}</a> with the page and the issue.</p><div className="social-links">{socials.slice(0,2).map(s=><a href={s.url} key={s.name} target="_blank" rel="noopener noreferrer">{s.name}<ArrowUpRight size={15}/></a>)}</div></section></main>;
}
