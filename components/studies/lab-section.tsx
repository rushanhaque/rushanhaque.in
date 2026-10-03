import { XrayStudy } from '@/components/studies/xray-study';
import { ResizeStudy } from '@/components/studies/resize-study';
import { SeismographStudy } from '@/components/studies/seismograph-study';
import { SiteCheckStudy } from '@/components/studies/site-check-study';


// Chapter VII: the four studies, played in place on the homepage.
export function LabSection() {
  return <section id="lab" className="lab" data-chapter="VII — The lab" aria-labelledby="lab-title">
    <header className="lab-intro">
      <span className="lab-kicker">VII — THE LAB</span>
      <h2 id="lab-title">Don’t take my word.<br/><em>Test it.</em></h2>
      <p>Four small instruments. Drag, scrub, pick or type; every number here is measured, not asserted.</p>
    </header>
    <XrayStudy/>
    <ResizeStudy/>
    <SeismographStudy/>
    <SiteCheckStudy/>
  </section>;
}
