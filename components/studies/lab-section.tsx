import { XrayStudy } from '@/components/studies/xray-study';
import { ResizeStudy } from '@/components/studies/resize-study';
import { SeismographStudy } from '@/components/studies/seismograph-study';
import { SiteCheckStudy } from '@/components/studies/site-check-study';
import { HandoverStudy } from '@/components/studies/handover-study';

const index = [
  ['study-01', '01', 'Look underneath'],
  ['study-02', '02', 'Resize me'],
  ['study-03', '03', 'The seismograph'],
  ['study-04', '04', 'Your site, under the lens'],
  ['study-05', '05', 'Yours to run'],
];

// Chapter VII: the five studies, played in place on the homepage.
export function LabSection() {
  return <section id="lab" className="lab" data-chapter="VII — The lab" aria-labelledby="lab-title">
    <header className="lab-intro">
      <span className="lab-kicker">VII — THE LAB</span>
      <h2 id="lab-title">Don’t take my word.<br/><em>Test it.</em></h2>
      <p>Five small instruments. Drag, scrub, pick or type; every number here is measured, not asserted.</p>
      <nav className="lab-index" aria-label="Studies">{index.map(([id, n, name]) => <a key={id} href={`#${id}`}><span>{n}</span>{name}</a>)}</nav>
    </header>
    <XrayStudy/>
    <ResizeStudy/>
    <SeismographStudy/>
    <SiteCheckStudy/>
    <HandoverStudy/>
  </section>;
}
