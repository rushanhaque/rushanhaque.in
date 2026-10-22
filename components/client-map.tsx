import map from '@/lib/world-map.json';

// A faint dotted map behind the reviews: arcs run from Moradabad to the countries clients
// have written from, and each city pulses softly. Decorative only (styles in backgrounds.css).
const CLIENTS = ['riyadh', 'warsaw', 'kathmandu'] as const;

export function ClientMap() {
  const { width: W, height: H, cities } = map;
  const [hx, hy] = cities.moradabad;
  return <div className="cmap" aria-hidden="true">
    <svg viewBox={`0 0 ${W} ${H}`}>
      {CLIENTS.map((c, i) => {
        const [x, y] = cities[c];
        // Each arc bows upward in proportion to its length.
        const lift = Math.hypot(x - hx, y - hy) * .38;
        return <path key={c} className="cmap-arc" d={`M${hx} ${hy}Q${(hx + x) / 2} ${(hy + y) / 2 - lift} ${x} ${y}`} pathLength={1} style={{ '--d': `${i * .6}s` } as React.CSSProperties}/>;
      })}
      {CLIENTS.map((c, i) => { const [x, y] = cities[c]; return <g key={c} transform={`translate(${x} ${y})`} style={{ '--d': `${i * .6 + 1.4}s` } as React.CSSProperties}><circle className="cmap-ring" r="12"/><circle className="cmap-pin" r="4.5"/></g>; })}
      <g transform={`translate(${hx} ${hy})`}><circle className="cmap-ring is-home" r="16"/><circle className="cmap-pin is-home" r="6.5"/></g>
    </svg>
  </div>;
}
