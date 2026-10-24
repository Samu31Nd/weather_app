// Ícono de la estación del diseño (mástil con veleta y pluviómetro).

export function StationLogo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 29V9" stroke="var(--t2)" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 11h18" stroke="var(--t2)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="7" cy="7.5" r="2.4" fill="var(--wind)" />
      <path d="M7 11V7.5" stroke="var(--t2)" strokeWidth="1.4" />
      <path d="M25 11V7M20 7h9" stroke="var(--t2)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M19 7l3-2v4z" fill="var(--wind)" />
      <path d="M10 21h7l-1 3h-5z" fill="var(--blue)" />
    </svg>
  )
}
