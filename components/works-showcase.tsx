import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/site-link';
import { planOf, responsive } from '@/lib/images';
import { Plan } from '@/components/plan';
import type { Project } from '@/lib/content';
import { projectAccess, projectLink } from '@/lib/project-access';
import { hostOf, storyOf } from '@/lib/work-stories';
import { Split } from '@/components/split';

const two = (n: number) => String(n).padStart(2, '0');

// A screenshot set in a quiet browser window, with the site's own address in the bar.
export function BrowserShot({ project, sizes, eager = false }: { project: Project; sizes: string; eager?: boolean }) {
  const host = hostOf(project.url);
  const plan = project.imageBlurred ? undefined : planOf(project.image);
  return <span className="wk-shot">
    <span className="wk-bar" aria-hidden="true"><i/><i/><i/><span>{host || project.title.toLowerCase()}</span></span>
    <span className="wk-frame">{project.image && <img className={project.imageBlurred ? 'unreleased-preview' : undefined} src={project.image} {...responsive(project.image, sizes)} alt={`${project.title} website`} width="1600" height="772" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} decoding="async"/>}{plan && <Plan src={plan} label={host || project.title}/>}</span>
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
        {items.map(p => <li key={p.slug} data-reveal>
          <Link {...projectLink(p)} className="wb-card spot">
            <DraftWindow project={p}/>
            <span className="wb-body">
              <span className="wb-status"><i/>{p.status}<small>{p.year}</small></span>
              <strong>{p.title}</strong>
              <span className="wb-desc">{p.description}</span>
              <span className="wb-go">About the project<ArrowUpRight size={15}/></span>
            </span>
          </Link>
        </li>)}
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
