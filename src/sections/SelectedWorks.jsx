import { useRef } from 'react'
import { works } from '../data/content'
import { useReveals } from '../lib/reveal'
import { small, srcSet } from '../lib/img'
import { A } from '../lib/router'
import Head from '../components/Head'
import Btn from '../components/Btn'
import { ArrowUpRight } from '../components/glyphs'

const two = (n) => String(n).padStart(2, '0')
const host = (u) => (u ? u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : '')

// The client sites, two to a row: each one framed as it appears in a browser, with its name and what it is beneath.
export default function SelectedWorks() {
  const root = useRef(null)
  useReveals(root)
  return (
    <section className="sw wrap" ref={root} id="work" data-tone="ivory" data-chapter="01" data-name="Selected works">
      <Head no="01" label="Client sites" title={<>Selected <em>works</em></>} count={works.length} lede="Websites for makers of beautiful things, each composed from the first conversation to launch." />
      <ul className="wg">
        {works.map((w, i) => (
          <li key={w.slug} data-r="card">
            <A to={`/work/${w.slug}`} className="wg__card" data-cursor="View case">
              <span className="wg__frame card-pic">
                <span className="stk__bar" aria-hidden="true"><i /><i /><i /><span>{host(w.url) || w.short}</span></span>
                <span className="wg__pic">
                  <img src={small(w.image)} srcSet={srcSet(w.image)} sizes="(max-width: 760px) 92vw, 46vw" alt={`${w.title} home page`} width={w.w} height={w.h} loading="lazy" decoding="async" />
                </span>
              </span>
              <span className="wg__txt card-txt">
                <span className="wg__no note">{two(i + 1)}</span>
                <span className="wg__body">
                  <strong className="wg__name">{w.title}</strong>
                  <span className="wg__line">{w.line}</span>
                  <span className="wg__meta note">{w.field.replace(' · ', ', ')} <i /> {w.year} <i /> {w.status === 'Live' ? <><b className="wg__live" />Live</> : w.status}</span>
                </span>
                <span className="wg__go" aria-hidden="true"><ArrowUpRight size={17} /></span>
              </span>
            </A>
          </li>
        ))}
      </ul>
      <div className="sw__more" data-r="up">
        <Btn to="/work">See all works</Btn>
      </div>
    </section>
  )
}
