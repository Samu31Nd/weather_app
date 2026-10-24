// Ilustraciones del artboard `Main`. La de la cabecera es fija; las de cada sección se mueven con los datos del
// periodo (`view.art` de @tt/core).

import type { HistoryArt } from '@tt/core'

export function StationArt({ label }: { label: string }) {
  return (
    <svg width="112" height="88" viewBox="0 0 112 88" role="img" aria-label={label} className="flex-none">
      <circle cx="90" cy="20" r="12" fill="var(--art-sun)" />
      <path d="M62 34h22a7 7 0 0 0 0-14 9.5 9.5 0 0 0-18-1.5A7.5 7.5 0 0 0 62 34z" fill="var(--art-cloud)" />
      <path d="M2 84c14-12 30-13 44-4 14-10 34-12 64 4z" fill="var(--art-hill)" />
      <path d="M4 84h104" stroke="var(--gs)" strokeWidth="2" strokeLinecap="round" />
      <path d="M52 84V20" stroke="var(--t2)" strokeWidth="3" strokeLinecap="round" />
      <path d="M30 24h44" stroke="var(--t2)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 24v-8M22 16h16M30 16v-5" stroke="var(--t2)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="21" cy="16" r="3.2" fill="var(--wind)" />
      <circle cx="39" cy="16" r="3.2" fill="var(--wind)" />
      <circle cx="30" cy="10" r="3.2" fill="var(--gust)" />
      <path d="M74 24v-7M65 17h17" stroke="var(--t2)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M62 17l5-3.5v7z" fill="var(--wind)" />
      <path d="M80 12.5l5 4.5-5 4.5z" fill="var(--gust)" />
      {[40, 45, 50, 55].map((y) => (
        <rect key={y} x="45" y={y} width="14" height="3.2" rx="1.6" fill="var(--sf)" stroke="var(--t2)" strokeWidth="1.2" />
      ))}
      <path d="M52 68H40" stroke="var(--t2)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M31 60h16l-2.5 8h-11z" fill="var(--rain-soft)" stroke="var(--blue)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M36 50c0 0-2 2.8-2 4.2a2 2 0 0 0 4 0c0-1.4-2-4.2-2-4.2zM43 46c0 0-2 2.8-2 4.2a2 2 0 0 0 4 0c0-1.4-2-4.2-2-4.2z" fill="var(--blue)" />
      <path d="M52 70h6" stroke="var(--t2)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M58 70l15-7v9l-15 7z" fill="var(--rain-soft)" stroke="var(--t2)" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M63 68v9M68 65.5v9" stroke="var(--t2)" strokeWidth="0.8" opacity="0.6" />
    </svg>
  )
}

export function TemperatureArt({ art, label }: { art: HistoryArt; label: string }) {
  return (
    <svg width="60" height="60" viewBox="0 0 64 64" role="img" aria-label={label}>
      <defs>
        <linearGradient id="history-drop-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset={art.dropEmpty} stopColor="var(--hum)" stopOpacity="0" />
          <stop offset={art.dropEmpty} stopColor="var(--hum)" stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect x="14" y="6" width="12" height="42" rx="6" fill="var(--sf)" stroke="var(--temp)" strokeWidth="2" />
      <rect x="17" y={art.thermometer.top} width="6" height={art.thermometer.height} rx="3" fill="var(--temp)" />
      <circle cx="20" cy="51" r="8" fill="var(--temp)" />
      <path d="M29 14h4M29 22h4M29 30h4M29 38h4" stroke="var(--tm)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M48 22c0 0-9 11-9 17.5a9 9 0 0 0 18 0C57 33 48 22 48 22z" fill="url(#history-drop-fill)" stroke="var(--hum)" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export function WindArt({ art, label }: { art: HistoryArt; label: string }) {
  return (
    <svg width="60" height="60" viewBox="0 0 64 64" role="img" aria-label={label}>
      <circle cx="32" cy="32" r="25" fill="var(--sf)" stroke="var(--wind)" strokeWidth="2" />
      <path d="M32 9v4M32 51v4M9 32h4M51 32h4" stroke="var(--tm)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M29.6 18.5v-5l4.8 5v-5" fill="none" stroke="var(--t2)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <g transform={`rotate(${art.windNeedleDeg} 32 32)`}>
        <path d="M32 15l5 17h-10z" fill="var(--wind)" />
        <path d="M32 49l5-17h-10z" fill="var(--gs)" />
      </g>
      <circle cx="32" cy="32" r="3" fill="var(--sf)" stroke="var(--wind)" strokeWidth="1.5" />
    </svg>
  )
}

export function RainArt({ art, label }: { art: HistoryArt; label: string }) {
  const drop = (x: number, y: number) => `M${x} ${y}c0 0-3.5 4.6-3.5 7a3.5 3.5 0 0 0 7 0c0-2.4-3.5-7-3.5-7z`
  return (
    <svg width="60" height="60" viewBox="0 0 64 64" role="img" aria-label={label}>
      <path d="M13 32h25a8 8 0 0 0 0-16 11 11 0 0 0-21-2.5A9.5 9.5 0 0 0 13 32z" fill="var(--sf)" stroke="var(--blue)" strokeWidth="2" strokeLinejoin="round" />
      <path d={drop(17, 38)} fill="var(--blue)" opacity={art.drops[0]} />
      <path d={drop(27, 42)} fill="var(--blue)" opacity={art.drops[1]} />
      <path d={drop(37, 38)} fill="var(--blue)" opacity={art.drops[2]} />
      <rect x="47" y="14" width="11" height="42" rx="3" fill="var(--sf)" stroke="var(--blue)" strokeWidth="2" />
      <rect x="49.5" y={art.gauge.top} width="6" height={art.gauge.height} rx="1.5" fill="var(--blue)" />
      <path d="M47 24h3M47 34h3M47 44h3" stroke="var(--tm)" strokeWidth="1.2" />
    </svg>
  )
}

export function PressureArt({ art, label }: { art: HistoryArt; label: string }) {
  return (
    <svg width="60" height="60" viewBox="0 0 64 64" role="img" aria-label={label}>
      <circle cx="32" cy="34" r="26" fill="var(--sf)" stroke="var(--pres)" strokeWidth="2" />
      <path d="M11.2 46A24 24 0 1 1 52.8 46" fill="none" stroke="var(--tm)" strokeWidth="4" strokeDasharray="1.5 6.3" />
      <path d="M14 55h5M45 55h5M47.5 52.5v5" stroke="var(--t2)" strokeWidth="1.5" strokeLinecap="round" />
      <g transform={`rotate(${art.pressureNeedleDeg} 32 34)`}>
        <path d="M32 34V14" stroke="var(--pres)" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <circle cx="32" cy="34" r="3.5" fill="var(--pres)" />
    </svg>
  )
}
