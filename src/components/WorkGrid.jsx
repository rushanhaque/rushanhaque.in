import { small, srcSet } from '../lib/img'
import { works, products, building, experiments } from '../data/content'
import { TLink } from './Transition'
import { ArrowUpRight } from './glyphs'
import Preview from './Preview'

export const ALL = [
  ...works.map((w) => ({ key: w.slug, group: 'Client sites', title: w.title, short: w.short, sub: w.field.replace(' · ', ', '), year: w.year, status: w.status, image: w.image, to: `/work/${w.slug}`, live: w.url, text: w.description, w: w.w, h: w.h })),
  ...products.map((p) => ({ key: p.slug, group: 'Products', title: p.short, short: p.short, sub: p.field, year: p.year, status: p.status, image: p.image, to: `/products/${p.slug}`, text: p.tags.join(', '), w: p.w, h: p.h })),
  ...building.map((b) => ({ key: b.slug, group: 'In progress', title: b.title, short: b.title, sub: b.field, year: '2026', status: 'In progress', image: b.image, href: b.url, live: b.url, text: b.description, w: b.w, h: b.h })),
  // an experiment plays when it is a web app that answers at once; downloads, repositories and sleeping free hosts keep their picture
  ...experiments.map((e) => ({ key: e.title, group: 'Experiments', title: e.title, short: e.title, sub: e.kind, year: e.year, status: '', image: e.image, thumb: true, href: e.url, live: /\.vercel\.app\b/.test(e.url) ? e.url : undefined, text: e.text, w: 19, h: 10 })),
]
export const GROUPS = ['All', 'Client sites', 'Products', 'In progress', 'Experiments']
export const count = (g) => (g === 'All' ? ALL.length : ALL.filter((i) => i.group === g).length)
export const CLIENTS = ALL.filter((i) => i.group === 'Client sites')

export function ItemLink({ it, className, children, ...rest }) {
  if (it.to) return <TLink to={it.to} title={it.short} className={className} {...rest}>{children}</TLink>
  return <a href={it.href} target="_blank" rel="noopener noreferrer" className={className} {...rest}>{children}</a>
}

export const picture = (it, sizes) => (it.thumb ? { src: it.image } : { src: small(it.image), srcSet: srcSet(it.image), sizes })

// even: every card the same size, whatever its picture or words
// live: the client sites play in their cards rather than sitting there as pictures (components/Preview.jsx), and
//       the card opens the site it is playing
// play: the same, but the card still opens its own page
export function Cards({ items, small: compact, even, live, play }) {
  return (
    <ul className={`wg__list ${compact ? 'wg__list--small' : ''} ${even ? 'wg__list--even' : ''}`}>
      {items.map((it) => {
        // where a card plays the real site, it also opens it: the case page is not what the card is showing
        const go = live && it.live ? { ...it, to: undefined, href: it.live } : it
        return (
        <li key={it.key}>
          <ItemLink it={go} className="card" data-cursor={go.to ? 'View' : 'Open'}>
            <span className={`card__pic ${it.thumb ? 'is-thumb' : ''}`} style={it.thumb || even ? undefined : { aspectRatio: `${it.w} / ${it.h}` }} data-r="plate" data-drift={it.thumb || !it.image ? undefined : ''} data-morph={go.to && it.image ? '' : undefined}>
              {it.image
                ? <img {...picture(it, '(max-width: 760px) 92vw, 44vw')} alt={`${it.title} home page`} width={it.w} height={it.h} loading="lazy" decoding="async" />
                : <span className="card__type pillar" aria-hidden="true">{it.title}</span>}
              {(live || play) && it.live ? <Preview url={it.live} title={it.title} /> : null}
            </span>
            <span className="card__txt" data-r="fade">
              <span className="card__head">
                <strong className="h4">{it.title}</strong>
                <ArrowUpRight size={17} />
              </span>
              <span className="small card__text">{it.text}</span>
              <span className="note card__meta">{[it.sub, it.year, it.status && it.status !== 'Live' ? it.status : ''].filter(Boolean).join(', ')}</span>
            </span>
          </ItemLink>
        </li>
        )
      })}
    </ul>
  )
}

// The work, in its groups.
export function Grid({ filter = 'All' }) {
  const groups = filter === 'All' ? GROUPS.slice(1) : [filter]
  return (
    <div className="wg">
      {groups.map((g) => (
        <section className="wg__group" key={g}>
          <h2 className="kick wg__name"><span>{g}</span><i /><span className="wg__n">{String(count(g)).padStart(2, '0')}</span></h2>
          <Cards items={ALL.filter((i) => i.group === g)} small={g === 'Experiments'} play />
        </section>
      ))}
    </div>
  )
}
