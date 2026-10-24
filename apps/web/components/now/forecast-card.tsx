// Pronóstico de la consola (RF-APP-03): frase compuesta por partes en el idioma elegido, con su ícono.

import type { Forecast } from '@tt/core'
import { forecastText } from '@tt/i18n'
import { usePreferences } from '@/components/providers/app-providers'

export function ForecastCard({ forecast }: { forecast: Forecast }) {
  const { t } = usePreferences()
  const text = forecastText(forecast, t)
  const parts = [
    { label: t.forecast.sky, value: text.sky },
    { label: t.forecast.temperature, value: text.temperature },
    { label: t.forecast.rain, value: text.precipitation },
    { label: t.forecast.wind, value: text.wind },
  ]
  return (
    <section aria-label={t.forecast.aria} className="flex flex-col gap-3.5 rounded-[20px] border border-wx-bd bg-wx-sf p-5">
      <div className="flex items-center gap-3.5">
        <div className="flex size-14 flex-none items-center justify-center rounded-2xl bg-wx-rain-soft">
          <ForecastIcon forecast={forecast} />
        </div>
        <div className="flex min-w-0 flex-col gap-[3px]">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-wx-t2">{t.forecast.title}</h2>
          <p className="text-[15px] font-medium leading-[1.4]">{text.summary}</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-2">
        {parts.map((part) => (
          <div key={part.label} className="flex flex-col gap-0.5 rounded-xl bg-wx-bg px-3 py-[9px]">
            <dt className="text-[11px] uppercase tracking-[0.05em] text-wx-t2">{part.label}</dt>
            <dd className="text-[13px] font-medium">{part.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs leading-[1.45] text-wx-t2">{t.forecast.note}</p>
    </section>
  )
}

function ForecastIcon({ forecast }: { forecast: Forecast }) {
  const sky = forecast.kind === 'forecast' ? forecast.sky : null
  const showSun = sky === 'mostlyClear' || sky === 'partlyCloudy' || sky === 'clearing'
  const showCloud = sky !== null && sky !== 'mostlyClear'
  const showRain = forecast.kind === 'forecast' && forecast.precipitation !== null && forecast.precipitation.outlook !== 'ending'
  return (
    <svg width="44" height="44" viewBox="0 0 48 48" aria-hidden="true">
      {showSun ? <circle cx="31" cy="15" r="8" fill="#fab387" /> : null}
      {showCloud ? (
        <path d="M11 32h22a7.5 7.5 0 0 0 0-15 10 10 0 0 0-19-2.5A8.5 8.5 0 0 0 11 32z" fill="var(--sf)" stroke="var(--blue)" strokeWidth="2" strokeLinejoin="round" />
      ) : null}
      {showRain ? (
        <g stroke="var(--blue)" strokeWidth="2.2" strokeLinecap="round">
          <path d="M15 37l-2 5" />
          <path d="M23 37l-2 5" />
          <path d="M31 37l-2 5" />
        </g>
      ) : null}
    </svg>
  )
}
