/**
 * The RH mark (see scripts/brand.mjs, which renders the favicon, icons and share image from
 * the same drawing). Two letters cut like a high-contrast Roman: thick stems, hairline bars and
 * serifs, the R's bowl swelling at its right as a pen stroke does. They stand apart, and the
 * H's crossbar runs on past the letter to a brass full stop: a line drawn out to the point of
 * light the site opens on (Rushan: light). The ink takes the text colour; at small sizes the
 * strokes are drawn a little heavier. `size` is the height; the mark is half as wide again.
 */
export default function Mark({ size = 30, className = '', title }) {
  const small = size < 40
  const T = small ? 4.6 : 3.8
  const t = small ? 1.9 : 1.3
  const s = t * 0.85
  const top = 8 + s / 2
  const base = 40 - s / 2
  return (
    <svg className={`mark ${className}`} width={size * 1.5} height={size} viewBox="0 0 72 48" fill="none" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <g className="mark__body" fill="currentColor">
        <path d="M17 8.2A8.4 8.4 0 0 1 17 25L17 23.7A5 7.1 0 0 0 17 9.5Z" />
        <path d="M12.4 24.4L15.9 24.4L25.4 40L21.7 40Z" />
      </g>
      <g stroke="currentColor" strokeLinecap="butt">
        <path className="mark__stems" pathLength="1" d="M8 8V40M35 8V40M53 8V40" strokeWidth={T} />
        <path className="mark__hair" pathLength="1" d="M8 8.85H17M8 24.35H17" strokeWidth={t} />
        <path className="mark__serifs" pathLength="1" d={`M3.6 ${top}H8M3.6 ${base}H12.4M19.6 ${base}H27.2M30.6 ${top}H39.4M48.6 ${top}H57.4M30.6 ${base}H39.4M48.6 ${base}H57.4`} strokeWidth={s} />
        <path className="mark__reach" pathLength="1" d="M35 24H64" strokeWidth={t} />
      </g>
      <circle className="mark__dot" cx="67.4" cy="24" r={small ? 3 : 2.5} />
    </svg>
  )
}
