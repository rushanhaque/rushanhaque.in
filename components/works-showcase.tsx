import { ArrowUpRight, MessageCircle } from 'lucide-react';
import Link from '@/components/site-link';
import { planOf, responsive } from '@/lib/images';
import { Plan } from '@/components/plan';
import type { Project } from '@/lib/content';
import { projectAccess, projectLink } from '@/lib/project-access';
import { hostOf, storyOf } from '@/lib/work-stories';
import { Split } from '@/components/split';
import { phone } from '@/lib/content';

// A WhatsApp chat that opens with the message already written, naming the project seen.
export const quoteLink = (title: string) => `${phone.whatsapp}?text=${encodeURIComponent(`Hi Rushan, I saw ${title} on your portfolio and I would like a quote for a website like it.`)}`;

const two = (n: number) => String(n).padStart(2, '0');

// A screenshot set in a quiet browser window, with the site's own address in the bar.
export function BrowserShot({ project, sizes, eager = false, drawing = 'scan' }: { project: Project; sizes: string; eager?: boolean; drawing?: 'scan' | 'lens' }) {
  const host = hostOf(project.url);
  const plan = project.imageBlurred ? undefined : planOf(project.image);
  return <span className="wk-shot">
    <span className="wk-bar" aria-hidden="true"><i/><i/><i/><span>{host || project.title.toLowerCase()}</span></span>
    <span className="wk-frame">{project.image && <img className={project.imageBlurred ? 'unreleased-preview' : undefined} src={project.image} {...responsive(project.image, sizes)} alt={`${project.title} website`} width="1600" height="772" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} decoding="async"/>}{plan && <Plan src={plan} label={host || project.title} mode={drawing === 'lens' ? 'lens' : undefined}/>}</span>
  </span>;
}

// The Works page: each site told as one chapter, image and story side by side.
export function WorksList({ works }: { works: Project[] }) {
  return <section className="wk container" aria-labelledby="wk-title">
    <h2 id="wk-title" className="sr-only">Selected works</h2>
    <ol className="wk-list">{works.map((p, i) => {
      const story = storyOf(p), visit = projectAccess(p) === 'visit', host = hostOf(p.url);
      return <li className={`wk-row ${i % 2 ? 'is-flip' : ''}`} key={p.slug} data-reveal>
        <Link {...projectLink(p)} className="wk-media" aria-label={visit ? `Visit ${p.title} (opens in a new tab)` : `${p.title}: about the project`}>
          <BrowserShot project={p} sizes="(max-width: 899px) 100vw, 60vw" eager={i === 0}/>
          <span className="wk-cursor" aria-hidden="true">{visit ? 'Visit site' : 'View project'}<ArrowUpRight size={15}/></span>
        </Link>
        <span className="wk-bg-n" aria-hidden="true">{two(i + 1)}</span>
        <div className="wk-info">
          <span className="wk-n">{two(i + 1)}<small>/ {two(works.length)}</small><i/>{story.field}</span>
          <Split as="h3" text={p.title}/>
          <p className="wk-line"><em>{story.line}</em></p>
          <Link {...projectLink(p)} className="wk-go">{visit && host ? host : 'About the project'}<ArrowUpRight size={16}/>{visit && <span className="sr-only"> (opens in a new tab)</span>}</Link>
        </div>
      </li>;
    })}</ol>
  </section>;
}

// A site still on the desk: its screenshot if there is one, otherwise a page being drafted.
export function DraftWindow({ project: p, sizes = '(max-width: 899px) 100vw, 50vw', className = '' }: { project: Project; sizes?: string; className?: string }) {
  return <span className={`wb-draft ${className}`} aria-hidden="true">
    <span className="wk-bar"><i/><i/><i/><span>{hostOf(p.url) || 'in progress'}</span></span>
    {p.image
      ? <img className={p.imageBlurred ? 'unreleased-preview' : undefined} src={p.image} {...responsive(p.image, sizes)} alt="" width="1600" height="772" loading="lazy" decoding="async"/>
      : <span className="wb-sketch"><b>{p.title}<i/></b><Plot/></span>}
  </span>;
}

// The page under the headline, drawn by a pen as you watch and drawn again in a loop:
// copy lines, a button, and three image boxes crossed through, the way a drawing marks
// where a picture will go.
const PLOT = [
  'M0 8H300', 'M0 24H236', 'M0 40H150',
  'M8 58H74a9 9 0 0 1 0 18H8a9 9 0 0 1 0-18Z',
  ...[0, 1, 2].flatMap(k => { const x = k * 138; return [`M${x} 96H${x + 124}V156H${x}Z`, `M${x} 96L${x + 124} 156M${x + 124} 96L${x} 156`]; }),
];
function Plot() {
  return <svg className="wb-plot" viewBox="-2 0 404 160" preserveAspectRatio="xMinYMid meet" aria-hidden="true" focusable="false">
    {PLOT.map((d, i) => <path key={i} d={d} pathLength={1} className={i > 3 && i % 2 === 1 ? 'is-cross' : undefined} style={{ '--k': i } as React.CSSProperties}/>)}
  </svg>;
}

// What is on the desk right now: each site drawn as a page still being laid out.
export function BuildingList({ items }: { items: Project[] }) {
  if (!items.length) return null;
  return <section id="building" className="wb spot" aria-labelledby="wb-title">
    <div className="container">
      <div className="wb-head" data-reveal>
        <span className="wb-kicker"><i/>IN THE STUDIO NOW</span>
        <Split id="wb-title" text="Currently *building.*"/>
        <p>Websites on the desk right now, in design or in code. Each one joins the works above on the day it launches.</p>
      </div>
      <ul className="wb-grid">
        {items.map(p => {
          const open = p.url ? { href: p.url, target: '_blank', rel: 'noopener noreferrer' } : projectLink(p);
          // The whole card opens the demo (the title's link covers it); the two buttons sit above that.
          return <li key={p.slug} data-reveal><div className="wb-card spot">
            <DraftWindow project={p}/>
            <span className="wb-body">
              <span className="wb-status"><i/>{p.status}<small>{p.year}</small></span>
              <strong><Link {...open} className="wb-hit">{p.title}{p.url && <span className="sr-only"> (opens in a new tab)</span>}</Link></strong>
              <span className="wb-desc">{p.description}</span>
              <span className="wb-actions">
                <Link {...open} className={`wb-go ${p.url ? 'is-demo' : ''}`} tabIndex={-1} aria-hidden="true">{p.url ? 'View demo' : 'About the project'}<ArrowUpRight size={15}/></Link>
                <a className="ft-btn wb-quote" href={quoteLink(p.title)} target="_blank" rel="noopener noreferrer"><MessageCircle size={15}/>Get a quote<span className="sr-only"> on WhatsApp (opens in a new tab)</span></a>
              </span>
            </span>
          </div></li>;
        })}
        <li data-reveal><Link href="/connect" className="wb-card is-open spot">
          <span className="wb-slot" aria-hidden="true"><span>{two(items.length + 1)}</span></span>
          <span className="wb-body">
            <span className="wb-status is-idle"><i/>Next in line</span>
            <strong>Your business?</strong>
            <span className="wb-desc">I take on a few projects at a time. Tell me what you need, and the next one could be yours.</span>
            <span className="wb-go">Start a project<ArrowUpRight size={15}/></span>
          </span>
        </Link></li>
      </ul>
    </div>
  </section>;
}

// Products: things made to sell or use on their own, added from the admin with
// "Show on the site as: Products". Until the first one is in, the shelf says so.
export function ProductsList({ items }: { items: Project[] }) {
  return <section id="products" className="pr container" aria-labelledby="pr-title">
    <div className="pr-head" data-reveal>
      <span className="eyebrow">PRODUCTS{items.length ? ` · ${two(items.length)}` : ''}</span>
      <Split id="pr-title" text="Products, *made to use.*"/>
      <p>Tools and products of my own, built with the same care as client work.</p>
    </div>
    {items.length ? <ul className="pr-grid">
      {items.map((p, i) => {
        const visit = !!p.url && projectAccess(p) === 'visit';
        return <li key={p.slug} data-reveal>
          <Link {...projectLink(p)} className="pr-card">
            <span className="pr-media">{p.image
              ? <img src={p.image} {...responsive(p.image, '(max-width: 899px) 92vw, 30vw')} alt={`${p.title}`} width="1600" height="1000" loading="lazy" decoding="async"/>
              : <span className="pr-blank" aria-hidden="true">{two(i + 1)}</span>}</span>
            <span className="pr-body">
              <span className="pr-kind">{two(i + 1)} · {p.discipline}</span>
              <strong>{p.title}</strong>
              <span className="pr-desc">{p.description}</span>
              <span className="pr-go">{visit ? `Visit ${hostOf(p.url)}` : 'About the product'}<ArrowUpRight size={15}/></span>
            </span>
          </Link>
        </li>;
      })}
    </ul> : <div className="pr-empty" data-reveal><span aria-hidden="true">01</span><p>The first products are on the way.</p></div>}
  </section>;
}
