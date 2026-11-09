// The mark: a jali's single opening. Two squares, one turned, and in the middle the point the light
// comes through. It turns very slowly with the hour (see Chrome).
export default function Mark({ size = 26, className = '' }) {
  return (
    <svg className={`mark ${className}`} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="9" y="9" width="30" height="30" />
        <rect x="9" y="9" width="30" height="30" transform="rotate(45 24 24)" />
      </g>
      <circle cx="24" cy="24" r="3.6" fill="var(--accent)" />
    </svg>
  )
}
