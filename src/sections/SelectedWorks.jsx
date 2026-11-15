import { useRef } from 'react'
import { works } from '../data/live'
import { useReveals } from '../lib/reveal'
import { small, srcSet } from '../lib/img'
import Head from '../components/Head'
import Btn from '../components/Btn'

const two = (n) => String(n).padStart(2, '0')
const host = (u) => (u ? u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : '')

// The client sites, two to a row: each framed as it appears in a browser and opening the live site itself, with its
// name and what it is beneath, and a button that goes there too.
export default function SelectedWorks() {
  const root = useRef(null)
  useReveals(root)
  return (
    <section className="sw wrap" ref={root} id="work" data-tone="ivory" data-chapter="01" data-name="Selected works">
      <Head no="01" label="Client sites" title={<>Selected <em>works</em></>} count={works.length} lede="Sites I have designed, built and seen through to launch." />
      <ul className="wg">
        {works.map((w, i) => (
          <li key={w.slug} data-r="card">
            <div className="wg__card">
              <a href={w.url} target="_blank" rel="noopener noreferrer" className="wg__frame card-pic" data-cursor="Visit site" aria-label={`${w.title}, visit the live site`}>
                <span className="stk__bar" aria-hidden="true"><i /><i /><i /><span>{host(w.url) || w.short}</span></span>
                <span className="wg__pic">
                  <img src={small(w.image)} srcSet={srcSet(w.image)} sizes="(max-width: 760px) 92vw, 46vw" alt={`${w.title} home page`} width={w.w} height={w.h} loading="lazy" decoding="async" />
                </span>
              </a>
              <span className="wg__txt card-txt">
                <span className="wg__no note">{two(i + 1)}</span>
                <span className="wg__body">
                  <strong className="wg__name">{w.title}</strong>
                  <span className="wg__line">{w.line}</span>
                  <span className="wg__meta note">{w.field.replace(' · ', ', ')} <i /> {w.year} <i /> {w.status === 'Live' ? <><b className="wg__live" />Live</> : w.status}</span>
                </span>
                <Btn href={w.url} variant="solid" className="wg__visit">Visit site</Btn>
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className="sw__more" data-r="up">
        <Btn to="/work">See all works</Btn>
      </div>
    </section>
  )
}
