// A site's line drawing laid over its screenshot. components/plan-scan.tsx moves a
// scan line across it, so the drawing gives way to the built site as it scrolls
// into view (or, with mode="time", once it is on screen).
export function Plan({ src, label, mode, delay }: { src: string; label: string; mode?: 'time'; delay?: number }) {
  return <span className="plan" data-plan={mode} data-delay={delay} aria-hidden="true">
    <span className="plan-sheet">
      <img src={src} alt="" width="1200" height="578" loading="lazy" decoding="async"/>
      <span className="plan-stamp"><b>DWG</b><span>{label}</span><b>1:1</b></span>
    </span>
    <i className="plan-scan"/>
  </span>;
}
