// The mark: a seal of wine with the eight-pointed brass star of the favicon set in it, two squares turned against each
// other as in a jali screen, a brass ring inside the edge and a point of wine at the centre. Beside it, the name.
export function LogoMark({ className = '' }) {
  return (
    <svg className={`logo__mark ${className}`} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="lg-wine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5f3a45" />
          <stop offset=".55" stopColor="#42242d" />
          <stop offset="1" stopColor="#241419" />
        </linearGradient>
        <linearGradient id="lg-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ecd4a2" />
          <stop offset=".5" stopColor="#d9b97e" />
          <stop offset="1" stopColor="#b08a4f" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#lg-wine)" />
      <rect x="4.5" y="4.5" width="55" height="55" rx="14" fill="none" stroke="#d9b97e" strokeOpacity=".35" strokeWidth="1" />
      <g fill="url(#lg-gold)">
        <rect x="20" y="20" width="24" height="24" rx="1.5" />
        <rect x="20" y="20" width="24" height="24" rx="1.5" transform="rotate(45 32 32)" />
      </g>
      <circle cx="32" cy="32" r="4.6" fill="#241419" />
    </svg>
  )
}

export default function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span className="logo__type">
        <b>Rushan Haque</b>
        <small>Developer &amp; writer</small>
      </span>
    </span>
  )
}
