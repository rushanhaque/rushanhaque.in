import { XrayStudy } from '@/components/studies/xray-study';
import { ResizeStudy } from '@/components/studies/resize-study';


// Chapter VII: the four studies, played in place on the homepage.
export function LabSection() {
  return <section id="lab" className="lab" data-chapter="IV — The lab" aria-labelledby="lab-title">
    <header className="lab-intro">
      <span className="lab-kicker">IV — THE LAB</span>
      <h2 suppressHydrationWarning id="lab-title">Don’t take my word. <em>Test it.</em></h2>
      <p>Two small experiments you can try right here, running on real work.</p>
    </header>
    <XrayStudy/>
    <ResizeStudy/>
  </section>;
}
