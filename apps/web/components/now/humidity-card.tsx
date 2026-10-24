// Humedad (RF-APP-01, RF-APP-04): anillo de humedad relativa, rango de hoy, punto de rocío y su interpretación.

import { type CurrentConditions, ringDashArray } from '@tt/core'
import { humidityInsightText, valueText } from '@tt/i18n'
import { Card, CardHeader, LabelValueRow } from '@/components/shell/card'
import { usePreferences } from '@/components/providers/app-providers'

export function HumidityCard({ humidity, units }: { humidity: CurrentConditions['humidity']; units: CurrentConditions['units'] }) {
  const { t, format } = usePreferences()
  const v = valueText(units, format)
  const insight = humidityInsightText(humidity, t, format)
  return (
    <Card label={t.hero.humidity}>
      <CardHeader
        iconBg="bg-wx-hum-soft"
        title={t.hero.humidity}
        subtitle={t.humidity.subtitle}
        icon={
          <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 2c0 0-4.5 5.2-4.5 8.2a4.5 4.5 0 0 0 9 0C12.5 7.2 8 2 8 2z" fill="none" stroke="var(--hum)" strokeWidth="1.5" />
          </svg>
        }
      />
      <div className="flex items-center justify-center gap-[18px]">
        <svg width="120" height="120" viewBox="0 0 84 84" role="img" aria-label={t.humidity.label(format.number(humidity.now, 0))} className="flex-none">
          <circle cx="42" cy="42" r="34" fill="none" stroke="var(--hum-soft)" strokeWidth="9" />
          <circle cx="42" cy="42" r="34" fill="none" stroke="var(--hum)" strokeWidth="9" strokeLinecap="round" strokeDasharray={ringDashArray(humidity.now ?? 0)} transform="rotate(-90 42 42)" />
          <path d="M42 28c0 0-8 9.5-8 15a8 8 0 0 0 16 0c0-5.5-8-15-8-15z" fill="var(--hum)" opacity="0.9" />
        </svg>
        <div className="flex flex-col gap-1">
          <span className="num text-[32px]">{v.percent(humidity.now)}</span>
          <span className="num text-xs text-wx-t2">{t.humidity.today(format.number(humidity.todayLow, 0), format.number(humidity.todayHigh, 0))}</span>
        </div>
      </div>
      <LabelValueRow label={t.humidity.dewPoint} value={v.temperature(humidity.dewPoint)} />
      {insight ? <p className="mt-auto text-[13px] leading-[1.45]">{insight}</p> : null}
    </Card>
  )
}
