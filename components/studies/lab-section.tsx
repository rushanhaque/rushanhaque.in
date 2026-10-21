import { XrayStudy } from '@/components/studies/xray-study';
import { ResizeStudy } from '@/components/studies/resize-study';
import { SeismographStudy } from '@/components/studies/seismograph-study';
import { SiteCheckStudy } from '@/components/studies/site-check-study';


// Chapter VII: the four studies, played in place on the homepage.
export function LabSection() {
  return <section id="lab" className="lab" data-chapter="IX — The lab" aria-labelledby="lab-title">
    <header className="lab-intro">
      <span className="lab-kicker">IX — THE LAB</span>
      <h2 suppressHydrationWarning id="lab-title">Don’t take my word. <em>Test it.</em></h2>
      <p>Four small experiments you can try right here. Each runs on real work and real data, not mock-ups.</p>
    </header>
    <XrayStudy/>
    <ResizeStudy/>
    <SeismographStudy/>
    <SiteCheckStudy/>
  </section>;
}
