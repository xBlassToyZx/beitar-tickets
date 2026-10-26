/** Original app mark: a yellow ticket stub. Not the club crest. */
export function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="1" y="7" width="30" height="18" rx="5" fill="#f5c518" />
      <circle cx="1" cy="16" r="3.5" fill="var(--bar-solid, #1d1d1f)" />
      <circle cx="31" cy="16" r="3.5" fill="var(--bar-solid, #1d1d1f)" />
      <path d="M21 9.5v13" stroke="#1d1d1f" strokeWidth="1.6" strokeDasharray="2 2" />
      <path d="M8 13h8M8 17h6" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
