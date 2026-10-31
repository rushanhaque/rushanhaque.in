import { building } from '../data/content'
import Head from '../components/Head'
import Showcase from '../components/Showcase'

const items = building.map((b) => ({ ...b, status: 'In progress' }))

/**
 * 02 — Currently building. The card switch from the previous portfolio's recent works: the
 * names scroll by on the left, and as each reaches the middle of the screen its site wipes up
 * over the last in one browser window that holds its place.
 */
export default function Drafting() {
  return (
    <section className="draft sec" data-theme="ivory" data-chapter="Currently building" id="drafting">
      <div className="wrap">
        <Head n="02" label="On the drawing board" title={<>Currently <em>building</em></>} count={items.length} lede="Sites in progress right now, each a preview you can open today." />
        <Showcase items={items} external />
      </div>
    </section>
  )
}
