// The eight-pointed star of the favicon: two squares, one turned through forty-five degrees, as in a jali screen.
export default function Star({ className = '', size }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <g fill="currentColor">
        <rect x="19" y="19" width="26" height="26" />
        <rect x="19" y="19" width="26" height="26" transform="rotate(45 32 32)" />
      </g>
    </svg>
  )
}
