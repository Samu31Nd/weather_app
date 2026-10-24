// Viento (RF-APP-01): brújula con aguja y ráfaga, velocidad actual, promedios y escala de Beaufort.

import type { CurrentConditions } from '@tt/core'
import { valueText, windText } from '@tt/i18n'
import { Card, CardHeader } from '@/components/shell/card'
import { usePreferences } from '@/components/providers/app-providers'

const BEAUFORT_CELLS = 9 // el diseño muestra 0–8; de 9 en adelante se marca la última celda

export function WindCard({ wind, units }: { wind: CurrentConditions['wind']; units: CurrentConditions['units'] }) {
  const { t, format } = usePreferences()
  const v = valueText(units, format)
  const text = windText(wind, units, t, format)
  const activeCell = Math.min(wind.beaufort, BEAUFORT_CELLS - 1)

  return (
    <Card label={t.hero.wind}>
      <CardHeader
        iconBg="bg-wx-wind-soft"
        title={t.hero.wind}
        subtitle={t.wind.subtitle}
        icon={
          <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 6h8a2 2 0 1 0-2-2M2 10h10a2 2 0 1 1-2 2" fill="none" stroke="var(--wind)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        }
      />
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="relative size-[168px] flex-none">
          <svg width="168" height="168" viewBox="0 0 200 200" role="img" aria-label={text.accessibilityLabel}>
            <circle cx="100" cy="100" r="92" fill="var(--wind-soft)" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="var(--sf)" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="46" fill="none" stroke="var(--sf)" strokeWidth="1.5" />
            <path d="M100 14v10M100 176v10M14 100h10M176 100h10" stroke="var(--tm)" strokeWidth="2" strokeLinecap="round" />
            <path d="M161 39l-5 5M39 161l5-5M161 161l-5-5M39 39l5 5" stroke="var(--gs)" strokeWidth="1.5" strokeLinecap="round" />
            <g transform={`rotate(${wind.gustDirectionDeg ?? 0} 100 100)`} style={{ transition: 'transform 1.5s ease-out' }}>
              <path d="M100 8l7 12h-14z" fill="var(--gust)" />
            </g>
            <g transform={`rotate(${wind.directionDeg ?? 0} 100 100)`} opacity={wind.calm ? 0.35 : 1}>
              <path d="M100 26l10 74h-20z" fill="var(--wind)" />
              <path d="M100 174l10-74h-20z" fill="var(--gs)" />
            </g>
            <circle cx="100" cy="100" r="32" fill="var(--sf)" />
          </svg>
          <span aria-hidden="true" className="absolute left-1/2 top-[21px] -translate-x-1/2 text-[11px] font-semibold">N</span>
          <span aria-hidden="true" className="absolute bottom-[21px] left-1/2 -translate-x-1/2 text-[11px] font-semibold">S</span>
          <span aria-hidden="true" className="absolute right-[23px] top-1/2 -translate-y-1/2 text-[11px] font-semibold">E</span>
          <span aria-hidden="true" className="absolute left-[23px] top-1/2 -translate-y-1/2 text-[11px] font-semibold">{t.wind.west}</span>
          <div aria-hidden="true" className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center leading-[1.15]">
            <span className="num text-[17px] font-medium">{text.center}</span>
            <span className="num text-[10px] text-wx-t2">{text.centerDetail}</span>
          </div>
        </div>

        <div className="flex min-w-0 flex-[1_1_140px] flex-col gap-[9px]">
          <div className="flex flex-col gap-px">
            <span className="text-xs text-wx-t2">{t.wind.now}</span>
            <span className="flex items-baseline gap-1.5">
              <span className="num text-[32px]">{wind.calm ? '0' : format.number(wind.speed, 1)}</span>
              <span className="text-[13px] text-wx-t2">{v.symbols.speed}</span>
            </span>
            <span className="text-[13px] font-medium text-wx-wind-text">{text.beaufortName}</span>
          </div>
          {text.bars.map((bar) => (
            <div key={bar.label} className="flex flex-col gap-1">
              <div className="flex justify-between gap-1.5 text-xs">
                <span className="text-wx-t2">{bar.label}</span>
                <span className="num">{bar.value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-md bg-wx-gr">
                <div className={`h-full rounded-md ${bar.gust ? 'bg-wx-gust' : 'bg-wx-wind'}`} style={{ width: `${bar.fraction * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-1.5">
        <div className="flex justify-between gap-2 text-xs text-wx-t2">
          <span>{t.wind.beaufort}</span>
          <span>{text.beaufortSummary}</span>
        </div>
        <ol className="grid grid-cols-9 gap-[3px]">
          {Array.from({ length: BEAUFORT_CELLS }, (_, force) => (
            <li
              key={force}
              title={`${force}: ${t.wind.beaufortNames[force]}`}
              aria-current={force === activeCell ? 'true' : undefined}
              className={`num flex h-[22px] items-center justify-center rounded-md text-[11px] ${
                force === activeCell ? 'bg-wx-wind-text font-semibold text-wx-sf' : force < activeCell ? 'bg-wx-wind-soft text-wx-t2' : 'bg-wx-bg text-wx-tm'
              }`}
            >
              {force}
            </li>
          ))}
        </ol>
      </div>
    </Card>
  )
}
