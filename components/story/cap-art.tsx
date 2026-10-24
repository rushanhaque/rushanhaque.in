// Small technical drawings for the capabilities, one per service, drawn in a single
// pen weight like the rest of the site. Each stroke is drawn in on arrival and
// redrawn under the pointer (styles in app/finish.css). A service added later in the
// admin gets the drafting compass.
type Stroke = { d: string; accent?: boolean; dash?: boolean };
const ART: [RegExp, Stroke[]][] = [
  [/market|growth|ads?\b/i, [
    { d: 'M8 8V56H58' }, { d: 'M24 38V56', dash: true }, { d: 'M44 26V56', dash: true },
    { d: 'M12 48L24 38L32 43L44 26L56 16' }, { d: 'M48 15.5L56 16L55.5 24', accent: true },
  ]],
  [/seo|search|visib/i, [
    { d: 'M12 28a16 16 0 1 0 32 0a16 16 0 1 0-32 0' }, { d: 'M39.5 39.5L56 56' },
    { d: 'M28 19L30.2 25.8L37 28L30.2 30.2L28 37L25.8 30.2L19 28L25.8 25.8Z', accent: true }, { d: 'M4 28H8M48 28H52', dash: true },
  ]],
  [/cloud|host|server|infra/i, [
    { d: 'M18 42H47a9 9 0 0 0 1-18a14 14 0 0 0-27-4a11 11 0 0 0-3 22Z' }, { d: 'M24 48V56M32 48V56M40 48V56', dash: true },
    { d: 'M16 58H48' }, { d: 'M28 32L32 28L36 32M32 28V38', accent: true },
  ]],
  [/mobile|app\b|apps|ios|android/i, [
    { d: 'M21 5H43a4 4 0 0 1 4 4V55a4 4 0 0 1-4 4H21a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4Z' }, { d: 'M23 15H41M23 21H35' },
    { d: 'M23 29H31V38H23ZM33 29H41V38H33Z', accent: true }, { d: 'M28 52H36' }, { d: 'M10 5V59M7 5H13M7 59H13', dash: true },
  ]],
  [/erp|crm|system|data/i, [
    { d: 'M14 14a18 6 0 1 0 36 0a18 6 0 1 0-36 0' }, { d: 'M14 14V46a18 6 0 0 0 36 0V14' }, { d: 'M14 30a18 6 0 0 0 36 0' },
    { d: 'M54 22H60V40H54', dash: true }, { d: 'M22 38V40M22 22V24', accent: true },
  ]],
  [/social|presence|community/i, [
    { d: 'M8 10H38V30H20L12 37V30H8Z' }, { d: 'M28 36H56V52H51V58L45 52H28Z' }, { d: 'M14 18H32M14 23H26' },
    { d: 'M34 44H50', accent: true },
  ]],
  [/video|film|edit|content/i, [
    { d: 'M8 12H56V42H8Z' }, { d: 'M28 20L40 27L28 34Z', accent: true }, { d: 'M8 52H56' },
    { d: 'M14 49V55M24 49V55M46 49V55', dash: true }, { d: 'M34 46V58' },
  ]],
];
const COMPASS: Stroke[] = [{ d: 'M32 8L18 56M32 8L46 56' }, { d: 'M29 8a3 3 0 1 0 6 0a3 3 0 1 0-6 0', accent: true }, { d: 'M14 44a26 26 0 0 0 36 0', dash: true }];

export function CapArt({ title }: { title: string }) {
  const strokes = ART.find(([match]) => match.test(title))?.[1] ?? COMPASS;
  return <svg className="tl-cap-art" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    {strokes.map((s, i) => <path key={i} d={s.d} pathLength={1} className={s.dash ? 'is-dash' : s.accent ? 'is-accent' : undefined} style={{ '--p': i } as React.CSSProperties}/>)}
  </svg>;
}
