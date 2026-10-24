// Lluvia (RF-APP-01): intensidad actual y acumulados por ventana de tiempo, a todo el ancho.

import type { CurrentConditions } from '@tt/core'
import { rainText } from '@tt/i18n'
import { Badge, Card, CardHeader } from '@/components/shell/card'
import { usePreferences } from '@/components/providers/app-providers'

export function RainCard({ rain, units }: { rain: CurrentConditions['rain']; units: CurrentConditions['units'] }) {
  const { t, format } = usePreferences()
  const text = rainText(rain, units, t, format)
  return (
    <Card label={t.rain.title} className="gap-4 md:col-span-2 lg:col-span-3">
      <CardHeader
        iconBg="bg-wx-rain-soft"
        title={t.rain.title}
        subtitle={t.rain.subtitle}
        icon={
          <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4.5 9h7a2.5 2.5 0 0 0 0-5 3.5 3.5 0 0 0-6.6-.9A2.5 2.5 0 0 0 4.5 9z" fill="none" stroke="var(--blue)" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M6 11.5l-.8 2M9.5 11.5l-.8 2" stroke="var(--blue)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        }
        badge={<Badge className="bg-wx-rain-soft">{text.badge}</Badge>}
      />
      <div className="flex flex-wrap items-stretch gap-x-8 gap-y-5">
        <div className="flex min-w-0 flex-[3_1_320px] flex-col justify-center gap-2.5">
          {text.windows.map((window) => (
            <div key={window.label} className="grid grid-cols-[72px_1fr_72px] items-center gap-3 text-[13px]">
              <span className="text-wx-t2">{window.label}</span>
              <div className="h-3 overflow-hidden rounded-xl bg-wx-rain-soft">
                <div className="h-full rounded-xl bg-wx-blue" style={{ width: `${window.fraction * 100}%` }} />
              </div>
              <span className="num text-right">{window.value}</span>
            </div>
          ))}
        </div>
        <dl className="grid flex-[2_1_240px] grid-cols-3 gap-2">
          {text.totals.map((total) => (
            <div key={total.label} className="flex flex-col justify-between gap-1.5 rounded-[14px] bg-wx-bg p-3">
              <dt className="text-xs text-wx-t2">{total.label}</dt>
              <dd className="num text-lg font-medium">{total.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  )
}
