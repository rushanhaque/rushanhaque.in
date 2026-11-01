/**
 * The RH mark (see scripts/brand.mjs, which renders the favicon, icons and share image from
 * the same drawing). R and H as one ligature: the R's bowl rounds into the stem both letters
 * share, its leg lands at that stem's foot, and one hairline is the bowl's close and the H's
 * crossbar. Thick verticals, hairline curves and bars, and a brass full stop: the point of
 * light. The strokes take the text colour; at small sizes they are drawn a little heavier.
 */
export default function Mark({ size = 30, className = '', title }) {
  const small = size < 40
  const thick = small ? 4.6 : 3.6
  const thin = small ? 2.3 : 1.6
  return (
    <svg className={`mark ${className}`} width={size} height={size} viewBox="0 0 64 64" fill="none" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <g stroke="currentColor" strokeLinecap="butt" strokeLinejoin="miter">
        <path className="mark__stems" pathLength="1" d="M9 13V51M30 13V51M50 13V51M17.5 31L30 51" strokeWidth={thick} />
        <path className="mark__hair" pathLength="1" d="M9 13.8H21A8.6 8.6 0 0 1 21 31M9 31H50" strokeWidth={thin} />
        <path className="mark__serifs" pathLength="1" d="M4.5 51H13.5M25.5 51H34.5M45.5 51H54.5M4.5 13H9M25.5 13H34.5M45.5 13H54.5" strokeWidth={thin * 0.85} />
      </g>
      <circle className="mark__dot" cx="58.6" cy="49" r="2.6" />
    </svg>
  )
}
