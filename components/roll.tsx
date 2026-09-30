// Letter-roll label: each character slides up on hover of the nearest `.roll-host`
// (links and buttons opt in by adding the class) and is replaced by its own
// text-shadow copy. Screen readers get the plain text once.
export function Roll({ children, className = '' }: { children: string; className?: string }) {
  return <span className={`roll ${className}`}>
    <span className="sr-only">{children}</span>
    <span className="roll-chars" aria-hidden="true">{[...children].map((char, i) => <span key={i} style={{ '--i': i } as React.CSSProperties}>{char === ' ' ? ' ' : char}</span>)}</span>
  </span>;
}
