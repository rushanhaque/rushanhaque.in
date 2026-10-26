'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useContent } from '@/components/content-provider';
import { useMotion } from '@/components/site-motion';

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/* III — Where I work: one map that travels as you scroll, from home   */
/* in Moradabad, out across India, to the rest of the world. The stage */
/* stays put (CSS sticky) while the camera moves, on phones as well.   */
/* Map data (lib/reach-map.json): India's states from DataMeet, land   */
/* dots from the IBM globe, on one world Mercator plane 1000 wide. It  */
/* loads only as the section comes near.                               */
/* ------------------------------------------------------------------ */
type MapData = { w: number; h: number; india: [number, number, number]; dots: string; states: { n: string; d: string }[] };
type Side = 'l' | 'r' | 't' | 'b';
type Place = { name: string; lat: number; lon: number; stage: 0 | 1 | 2; label?: Side };

const HOME = { name: 'Moradabad', lat: 28.84, lon: 78.77 };
// Cities the site serves (its city pages), and the countries clients have written from.
const PLACES: Place[] = [
  { name: 'Rampur', lat: 28.8, lon: 79.03, stage: 0, label: 'r' },
  { name: 'Amroha', lat: 28.9, lon: 78.47, stage: 0, label: 'l' },
  { name: 'Sambhal', lat: 28.59, lon: 78.57, stage: 0, label: 'b' },
  { name: 'Bijnor', lat: 29.37, lon: 78.13, stage: 0, label: 'l' },
  { name: 'Kashipur', lat: 29.21, lon: 78.96, stage: 0, label: 't' },
  { name: 'Bareilly', lat: 28.37, lon: 79.43, stage: 0, label: 'r' },
  { name: 'Rudrapur', lat: 28.98, lon: 79.4, stage: 0 },
  { name: 'Haldwani', lat: 29.22, lon: 79.51, stage: 0 },
  { name: 'Delhi NCR', lat: 28.61, lon: 77.21, stage: 1, label: 'l' },
  { name: 'Noida', lat: 28.54, lon: 77.39, stage: 1 },
  { name: 'Meerut', lat: 28.98, lon: 77.71, stage: 1 },
  { name: 'Muzaffarnagar', lat: 29.47, lon: 77.7, stage: 1 },
  { name: 'Saharanpur', lat: 29.96, lon: 77.55, stage: 1 },
  { name: 'Haridwar', lat: 29.95, lon: 78.16, stage: 1 },
  { name: 'Dehradun', lat: 30.32, lon: 78.03, stage: 1, label: 't' },
  { name: 'Aligarh', lat: 27.88, lon: 78.08, stage: 1 },
  { name: 'Agra', lat: 27.18, lon: 78.01, stage: 1, label: 'l' },
  { name: 'Kanpur', lat: 26.45, lon: 80.33, stage: 1, label: 'b' },
  { name: 'Lucknow', lat: 26.85, lon: 80.95, stage: 1, label: 'r' },
  // The metros: every one served remotely, over calls and WhatsApp.
  { name: 'Jaipur', lat: 26.91, lon: 75.79, stage: 1, label: 'l' },
  { name: 'Chandigarh', lat: 30.73, lon: 76.78, stage: 1, label: 'l' },
  { name: 'Ahmedabad', lat: 23.02, lon: 72.57, stage: 1, label: 'l' },
  { name: 'Indore', lat: 22.72, lon: 75.86, stage: 1 },
  { name: 'Mumbai', lat: 19.08, lon: 72.88, stage: 1, label: 'l' },
  { name: 'Pune', lat: 18.52, lon: 73.86, stage: 1, label: 'b' },
  { name: 'Hyderabad', lat: 17.39, lon: 78.49, stage: 1, label: 'r' },
  { name: 'Bengaluru', lat: 12.97, lon: 77.59, stage: 1, label: 'l' },
  { name: 'Chennai', lat: 13.08, lon: 80.27, stage: 1, label: 'r' },
  { name: 'Kolkata', lat: 22.57, lon: 88.36, stage: 1, label: 'r' },
  { name: 'Patna', lat: 25.59, lon: 85.14, stage: 1, label: 'r' },
  { name: 'Guwahati', lat: 26.14, lon: 91.74, stage: 1 },
];
// Where work is taken from, beyond the client countries: shown lighter, as reach, not as clients.
const REACH = [
  { city: 'Dubai', lat: 25.2, lon: 55.27, side: 'b' as Side }, { city: 'London', lat: 51.51, lon: -.13, side: 'l' as Side },
  { city: 'New York', lat: 40.71, lon: -74.01, side: 'r' as Side }, { city: 'Toronto', lat: 43.65, lon: -79.38, side: 't' as Side },
  { city: 'Singapore', lat: 1.35, lon: 103.82, side: 'r' as Side }, { city: 'Sydney', lat: -33.87, lon: 151.21, side: 'l' as Side },
  { city: 'Berlin', lat: 52.52, lon: 13.4, side: 't' as Side },
];
const ABROAD: Record<string, { lat: number; lon: number; city: string; side: Side }> = {
  'Saudi Arabia': { lat: 24.71, lon: 46.68, city: 'Riyadh', side: 'l' },
  Poland: { lat: 52.23, lon: 21.01, city: 'Warsaw', side: 'r' },
  Nepal: { lat: 27.72, lon: 85.32, city: 'Kathmandu', side: 'b' },
};
const CORE = ['Uttar Pradesh'];
const STRONG = ['Uttarakhand', 'NCT of Delhi'];

// The camera for each chapter, as [west, south, east, north] in degrees.
const BOXES: [number, number, number, number][] = [[77.55, 27.95, 79.95, 29.75], [67.5, 7.5, 97.5, 36.5], [-125, -40, 156, 62]];

const W = 1000, K = W / (2 * Math.PI), merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)), TOP = merc(76);
const project = (lon: number, lat: number): [number, number] => [((lon + 180) * Math.PI / 180) * K, (TOP - merc(lat)) * K];
const unproject = (x: number, y: number): [number, number] => [x / K * 180 / Math.PI - 180, (2 * Math.atan(Math.exp(TOP - y / K)) - Math.PI / 2) * 180 / Math.PI];
// A box framed for the stage's shape, so every chapter fills the map area.
const frame = (box: [number, number, number, number], aspect: number) => {
  const [x0, y0] = project(box[0], box[3]), [x1, y1] = project(box[2], box[1]);
  let w = x1 - x0, h = y1 - y0;
  const cx = x0 + w / 2, cy = y0 + h / 2;
  if (w / h > aspect) h = w / aspect; else w = h * aspect;
  return `${(cx - w / 2).toFixed(2)} ${(cy - h / 2).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`;
};
// Where a label sits beside its pin.
const SIDE: Record<Side, { dx: string; dy: string; anchor: 'start' | 'middle' | 'end' }> = { r: { dx: '.9em', dy: '.35em', anchor: 'start' }, l: { dx: '-.9em', dy: '.35em', anchor: 'end' }, t: { dx: '0', dy: '-.95em', anchor: 'middle' }, b: { dx: '0', dy: '1.55em', anchor: 'middle' } };
const arc = (a: [number, number], b: [number, number], bend = .22) => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  return `M${a[0].toFixed(2)} ${a[1].toFixed(2)}Q${(mx + dy * bend).toFixed(2)} ${(my - dx * bend).toFixed(2)} ${b[0].toFixed(2)} ${b[1].toFixed(2)}`;
};

export function Reach() {
  const { reviews } = useContent();
  const root = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const hud = useRef<HTMLSpanElement>(null);
  const [data, setData] = useState<MapData | null>(null);
  const [step, setStep] = useState(0);
  const { reduced } = useMotion();

  const abroad = useMemo(() => Array.from(new Set(reviews.map(r => r.location).filter((l): l is string => !!l && l in ABROAD))), [reviews]);
  const countries = 1 + abroad.length;
  const STEPS = [
    { k: '01 · Home base', h: 'It starts in Moradabad.', d: 'Where I design and build, in western Uttar Pradesh, with Rampur, Amroha, Sambhal and Bareilly all close by.' },
    { k: '02 · India', h: 'Then across India.', d: `From Delhi NCR and Lucknow to Mumbai, Bengaluru, Hyderabad and Kolkata: ${PLACES.length + 1} cities, served over calls and WhatsApp.` },
    { k: '03 · Worldwide', h: 'And anywhere online.', d: abroad.length ? `Clients in ${abroad.join(', ')} already, and open to businesses from Dubai and London to New York, Singapore and Sydney. Every project runs remotely, so where you are is never the limit.` : 'Every project runs remotely, so where you are is never the limit.' },
  ];

  // Fetch the map once the section is within a couple of screens.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; io.disconnect(); import('@/lib/reach-map.json').then(m => setData(m.default as unknown as MapData)); }, { rootMargin: '200% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const home = project(HOME.lon, HOME.lat);
  const places = PLACES.map(p => ({ ...p, at: project(p.lon, p.lat) }));
  const reach = REACH.map(r => ({ ...r, at: project(r.lon, r.lat) }));
  const far = abroad.map(c => ({ country: c, ...ABROAD[c], at: project(ABROAD[c].lon, ABROAD[c].lat) }));

  // The scroll scene: built once the map is in, rebuilt when the stage changes shape.
  useEffect(() => {
    const section = root.current, svg = svgRef.current;
    if (!section || !svg || !data) return;
    let ctx: gsap.Context | null = null;
    let last = '';
    const sync = () => {
      const vb = svg.viewBox.baseVal;
      const u = (vb.width / Math.max(1, svg.clientWidth)).toFixed(4);
      if (u !== last) { last = u; svg.style.setProperty('--u', u); }
      if (hud.current) { const [lon, lat] = unproject(vb.x + vb.width / 2, vb.y + vb.height / 2); hud.current.textContent = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'} · ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`; }
    };
    const build = () => {
      ctx?.revert();
      const aspect = svg.clientWidth / Math.max(1, svg.clientHeight);
      const views = BOXES.map(b => frame(b, aspect));
      ctx = gsap.context(() => {
        const q = gsap.utils.selector(svg);
        gsap.set(svg, { attr: { viewBox: views[0] } });
        sync();
        if (reduced) { gsap.set(svg, { attr: { viewBox: views[2] } }); sync(); return; }
        gsap.set(q('.rm-route'), { strokeDashoffset: 1, opacity: 0 });
        gsap.set(q('.rm-pin:not(.is-home), .rm-label:not(.is-home)'), { opacity: 0 });
        gsap.set(q('.rm-dots'), { opacity: 0 });
        gsap.set(q('.rm-state'), { fill: '#ece8dc' });
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: section, start: 'top 65%', end: 'bottom bottom', scrub: .7, invalidateOnRefresh: true },
          onUpdate() { sync(); const t = this.time(); const s = t < 2.6 ? 0 : t < 5.8 ? 1 : 2; setStep(p => (p === s ? p : s)); },
        });
        // 01 · home: Uttar Pradesh lights, the neighbouring cities join by their routes.
        tl.to(q('.rm-state.is-core'), { fill: '#cfdcca', duration: .6 }, .1)
          .set(q('.rm-route.s0'), { opacity: 1 }, .3)
          .to(q('.rm-route.s0'), { strokeDashoffset: 0, duration: .9, stagger: .06, ease: 'power1.inOut' }, .3)
          .to(q('.rm-pin.s0'), { opacity: 1, duration: .3, stagger: .06 }, .7)
          .to(q('.rm-label.s0'), { opacity: 1, duration: .3, stagger: .06 }, .9)
          // 02 · India: the camera pulls back, the states fill, routes reach the rest.
          .to(svg, { attr: { viewBox: views[1] }, duration: 2.2, ease: 'power2.inOut' }, 1.9)
          .to(q('.rm-label.s0, .rm-label.is-home'), { opacity: 0, duration: .4 }, 2)
          .to(q('.rm-state.is-strong'), { fill: '#dfe7d8', duration: .6 }, 2.6)
          .to(q('.rm-state.is-rest'), { fill: '#e6e1d2', duration: .8, stagger: .01 }, 2.8)
          .set(q('.rm-route.s1'), { opacity: 1 }, 3)
          .to(q('.rm-route.s1'), { strokeDashoffset: 0, duration: 1, stagger: .04, ease: 'power1.inOut' }, 3)
          .to(q('.rm-pin.s1'), { opacity: 1, duration: .3, stagger: .03 }, 3.5)
          .to(q('.rm-label.s1'), { opacity: 1, duration: .4, stagger: .05 }, 3.9)
          // 03 · worldwide: out to the whole map, the land comes up, routes cross borders.
          .to(svg, { attr: { viewBox: views[2] }, duration: 2.4, ease: 'power2.inOut' }, 5.1)
          .to(q('.rm-label.s1'), { opacity: 0, duration: .4 }, 5.2)
          .to(q('.rm-dots'), { opacity: 1, duration: 1 }, 5.7)
          .to(q('.rm-label.is-home'), { opacity: 1, duration: .4 }, 6.2)
          .set(q('.rm-route.s2'), { opacity: 1 }, 6.4)
          .to(q('.rm-route.s2'), { strokeDashoffset: 0, duration: 1.1, stagger: .15, ease: 'power1.inOut' }, 6.4)
          .to(q('.rm-pin.s2'), { opacity: 1, duration: .3, stagger: .15 }, 7.1)
          .to(q('.rm-label.s2'), { opacity: 1, duration: .4, stagger: .15 }, 7.3)
          .to({}, { duration: .9 }, 8);
      }, svg);
    };
    build();
    let timer = 0;
    const ro = new ResizeObserver(() => { clearTimeout(timer); timer = window.setTimeout(() => { build(); ScrollTrigger.refresh(); }, 200); });
    ro.observe(svg);
    return () => { clearTimeout(timer); ro.disconnect(); ctx?.revert(); };
  }, [data, reduced]);

  // A chapter tab scrolls the story to it.
  const go = (i: number) => {
    const s = root.current;
    if (!s) return;
    const top = s.getBoundingClientRect().top + window.scrollY, span = s.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + span * [.06, .5, .95][i], behavior: 'smooth' });
  };

  const cls = (n: string) => (CORE.includes(n) ? 'is-core' : STRONG.includes(n) ? 'is-strong' : 'is-rest');
  return <section id="where" className="tl-reach" ref={root} data-chapter="II — Where I work">
    <div className="tl-reach-stage">
      <div className="tl-reach-copy">
        <span className="tl-kicker">II — WHERE I WORK</span>
        <h2 suppressHydrationWarning>Moradabad, India, <em>everywhere.</em></h2>
        <div className="tl-reach-story" aria-live="polite">
          <span key={`k${step}`}>{STEPS[step].k}</span>
          <p className="tl-reach-h" key={`h${step}`}>{STEPS[step].h}</p>
          <p className="tl-reach-d" key={`d${step}`}>{STEPS[step].d}</p>
        </div>
        <ol className="tl-reach-steps">{STEPS.map((s, i) => <li key={s.k}>
          <button type="button" className={i === step ? 'is-on' : i < step ? 'is-past' : ''} aria-current={i === step ? 'step' : undefined} onClick={() => go(i)}>
            <small>0{i + 1}</small><span>{['Moradabad', 'India', 'Worldwide'][i]}</span><i/>
          </button>
        </li>)}</ol>
        <dl className="tl-reach-stats">
          <div><dt>Home base</dt><dd>1</dd></div>
          <div><dt>Cities served</dt><dd>{PLACES.length + 1}</dd></div>
          <div><dt>Client countries</dt><dd>{countries}</dd></div>
        </dl>
      </div>
      <div className="tl-reach-map">
        <div className="tl-reach-hud" aria-hidden="true"><span>Live view</span><span ref={hud}>28.84° N · 78.77° E</span></div>
        <svg ref={svgRef} className={`tl-reach-svg ${data ? 'is-ready' : ''}`} viewBox={`0 0 ${W} 522`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Map: home base in Moradabad, cities served across India, and client countries abroad">
          {data && <>
            <path className="rm-dots" d={data.dots}/>
            <g transform={`translate(${data.india[0]} ${data.india[1]}) scale(${data.india[2]})`}>
              {data.states.map(s => <path key={s.n} d={s.d} className={`rm-state ${cls(s.n)}`}/>)}
            </g>
            <g>
              {places.map(p => <path key={p.name} className={`rm-route s${p.stage}`} pathLength={1} d={arc(home, p.at, .3)}/>)}
              {reach.map(p => <path key={p.city} className="rm-route s2 is-reach" pathLength={1} d={arc(home, p.at, .24)}/>)}
              {far.map(p => <path key={p.city} className="rm-route s2 is-far" pathLength={1} d={arc(home, p.at, .28)}/>)}
            </g>
            <g>
              {[0, 1, 2].map(i => <circle key={i} className="rm-ring" cx={home[0]} cy={home[1]} style={{ animationDelay: `${i}s` }}/>)}
              {places.map(p => <circle key={p.name} className={`rm-pin s${p.stage}`} cx={p.at[0]} cy={p.at[1]} r=".6"/>)}
              {reach.map(p => <circle key={p.city} className="rm-pin s2 is-reach" cx={p.at[0]} cy={p.at[1]} r="1.2"/>)}
              {far.map(p => <circle key={p.city} className="rm-pin s2 is-far" cx={p.at[0]} cy={p.at[1]} r="1.6"/>)}
              <circle className="rm-pin is-home" cx={home[0]} cy={home[1]} r="1"/>
            </g>
            <g className="rm-labels">
              {places.filter(p => p.label).map(p => { const o = SIDE[p.label!]; return <text key={p.name} className={`rm-label s${p.stage}`} x={p.at[0]} y={p.at[1]} dx={o.dx} dy={o.dy} textAnchor={o.anchor}>{p.name}</text>; })}
              {reach.map(p => { const o = SIDE[p.side]; return <text key={p.city} className="rm-label s2 is-reach" x={p.at[0]} y={p.at[1]} dx={o.dx} dy={o.dy} textAnchor={o.anchor}>{p.city}</text>; })}
              {far.map(p => { const o = SIDE[p.side]; return <text key={p.city} className="rm-label s2" x={p.at[0]} y={p.at[1]} dx={o.dx} dy={o.dy} textAnchor={o.anchor}>{p.city}, {p.country}</text>; })}
              <text className="rm-label is-home" x={home[0]} y={home[1]} dy="-1.25em" textAnchor="middle">Moradabad · home</text>
            </g>
          </>}
        </svg>
      </div>
    </div>
  </section>;
}
