import { pageMetadata } from '@/lib/seo';
import { ResizeStudy } from '@/components/studies/resize-study';
import { ConstraintStudy } from '@/components/studies/constraint-study';
import { RewindStudy } from '@/components/studies/rewind-study';
import { XrayStudy } from '@/components/studies/xray-study';
import { SeismographStudy } from '@/components/studies/seismograph-study';
import { SiteCheckStudy } from '@/components/studies/site-check-study';
import { HandoverStudy } from '@/components/studies/handover-study';
import './studies.css';

export const metadata = pageMetadata('/studies', 'The lab', 'Seven small tests of how Rushan Haque works. Live, not claimed.');

const index = [
  ['study-01', '01', 'Look underneath'],
  ['study-02', '02', 'Rewind the build'],
  ['study-03', '03', 'Resize me'],
  ['study-04', '04', 'The seismograph'],
  ['study-05', '05', 'Bring me a problem'],
  ['study-06', '06', 'Your site, under the lens'],
  ['study-07', '07', 'Yours to run'],
];

export default function Studies() {
  return <main id="main-content" className="lab">
    <header className="lab-intro">
      <span className="lab-kicker">THE LAB</span>
      <h1>Don’t read about<br/>how I work. <em>Test it.</em></h1>
      <p>Drag, scrub, pick or type. Every number on this page is measured, not asserted.</p>
      <nav className="lab-index" aria-label="Studies">{index.map(([id, n, name]) => <a key={id} href={`#${id}`}><span>{n}</span>{name}</a>)}</nav>
    </header>
    <XrayStudy/>
    <RewindStudy/>
    <ResizeStudy/>
    <SeismographStudy/>
    <ConstraintStudy/>
    <SiteCheckStudy/>
    <HandoverStudy/>
  </main>;
}
