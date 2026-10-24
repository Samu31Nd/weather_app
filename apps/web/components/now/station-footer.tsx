// Estado de la estación (RF-APP-05): batería, señal y tiempo encendida. Nunca datos internos de red.

import type { CurrentConditions } from '@tt/core'
import { stationText } from '@tt/i18n'
import { usePreferences } from '@/components/providers/app-providers'

export function StationFooter({ station }: { station: CurrentConditions['station'] }) {
  const { t, format } = usePreferences()
  const level = station.signalLevel
  const text = stationText(station, t, format)
  const bar = (n: number) => (level !== null && level >= n ? 'var(--green)' : 'var(--gs)')
  return (
    <footer aria-label={t.station.title} className="mt-1 flex flex-wrap items-center gap-x-7 gap-y-2.5 border-t border-wx-bd px-1 pt-3.5 text-xs text-wx-t2 md:col-span-2 lg:col-span-3">
      <span className="font-semibold text-wx-tx">{t.station.title}</span>
      <span className="inline-flex items-center gap-2">
        <svg width="22" height="13" viewBox="0 0 30 18" aria-hidden="true">
          <rect x="1" y="2" width="24" height="14" rx="3" fill="none" stroke="var(--t2)" strokeWidth="1.8" />
          <rect x="26" y="6" width="3" height="6" rx="1" fill="var(--t2)" />
          <rect x="4" y="5" width={((station.batteryLevel ?? 0) * 18).toFixed(1)} height="8" rx="1.5" fill="var(--green)" />
        </svg>
        {t.station.battery} <span className="num text-wx-tx">{text.battery}</span>
      </span>
      <span className="inline-flex items-center gap-2">
        <svg width="16" height="12" viewBox="0 0 24 18" aria-hidden="true">
          <rect x="1" y="12" width="4" height="5" rx="1" fill={bar(1)} />
          <rect x="7" y="8" width="4" height="9" rx="1" fill={bar(2)} />
          <rect x="13" y="4" width="4" height="13" rx="1" fill={bar(3)} />
          <rect x="19" y="0" width="4" height="17" rx="1" fill={bar(4)} />
        </svg>
        {t.station.signal}{' '}
        <span className="num text-wx-tx">{text.signal}</span>
      </span>
      <span className="inline-flex items-center gap-2">
        <svg width="13" height="13" viewBox="0 0 18 18" aria-hidden="true">
          <circle cx="9" cy="9" r="7.5" fill="none" stroke="var(--t2)" strokeWidth="1.8" />
          <path d="M9 4.5V9l3 2" fill="none" stroke="var(--t2)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        {t.station.uptime}{' '}
        <span className="num text-wx-tx">{text.uptime}</span>
      </span>
      <span className="ml-auto">{t.app.footNote}</span>
    </footer>
  )
}
