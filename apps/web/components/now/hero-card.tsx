// Tarjeta principal (artboard `Dashboard`, fila 1): escena del cielo, temperatura, día dentro del mes,
// sensación térmica, interior y los cuatro indicadores rápidos (RF-APP-01, RF-APP-03).

import type { CurrentConditions } from '@tt/core'
import { usePreferences } from '@/components/providers/app-providers'
import { SkyScene } from './sky-scene'
import { valueText } from './values'

export function HeroCard({ view }: { view: CurrentConditions }) {
  const { t, format } = usePreferences()
  const v = valueText(view.units, format)
  const { temperature, indoor } = view
  const sceneName = t.scene.names[view.scene]
  const range = temperature.range
  const pct = (fraction: number) => `${(fraction * 100).toFixed(1)}%`

  return (
    <section aria-label={t.hero.aria} className="flex flex-col overflow-hidden rounded-[20px] border border-wx-bd bg-wx-sf md:col-span-2">
      <div className="relative min-h-[180px] flex-[1_1_180px]">
        <SkyScene scene={view.scene} label={t.scene.label(sceneName)} chip={sceneName} />
      </div>
      <div className="flex flex-col gap-4 px-6 pb-[22px] pt-[18px]">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-wx-t2">{t.hero.outdoorTemperature}</span>
            <div className="flex items-start gap-1 leading-none">
              <span className="text-[80px] font-light tracking-[-0.04em]">{format.number(temperature.now, 1)}</span>
              <span className="mt-2 text-[28px] text-wx-temp-text">{v.symbols.temperature}</span>
            </div>
          </div>

          <div className="flex max-w-[420px] flex-[1_1_260px] flex-col gap-2">
            <div className="flex justify-between text-xs text-wx-t2">
              <span>{t.hero.todayWithinMonth}</span>
              <span className="num">{t.hero.swingToday(v.degrees(range.swing))}</span>
            </div>
            <div className="relative h-3.5">
              <div className="absolute inset-x-0 top-[5px] h-1 rounded bg-wx-gr" />
              {range.bar ? (
                <>
                  <div
                    className="absolute top-[3px] h-2 rounded-lg bg-[linear-gradient(90deg,var(--hum),var(--temp))]"
                    style={{ left: pct(range.bar.todayStart), width: pct(range.bar.todayWidth) }}
                  />
                  <div
                    className="absolute top-0 -ml-[7px] box-border size-3.5 rounded-full border-[3px] border-wx-tx bg-wx-sf"
                    style={{ left: pct(range.bar.current) }}
                  />
                </>
              ) : null}
            </div>
            <div className="num flex justify-between gap-2 text-[11.5px] text-wx-t2">
              <span>{t.hero.monthLow(v.degrees(range.monthLow))}</span>
              <span>{t.hero.todayRange(v.degrees(range.todayLow), v.degrees(range.todayHigh))}</span>
              <span>{t.hero.monthHigh(v.degrees(range.monthHigh))}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 text-right">
            <span className="text-[13px] text-wx-t2">{t.hero.feelsLike}</span>
            <span className="num text-[26px] font-medium text-wx-temp-text">{v.degrees(temperature.feelsLike)}</span>
            <span className="max-w-[200px] text-xs text-wx-t2">{t.hero.feelsLikeReason[temperature.feelsLikeReason]}</span>
          </div>
        </div>

        <IndoorStrip indoor={indoor} />

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Tile label={t.hero.humidity} value={v.percent(view.humidity.now)} className="bg-wx-hum-soft" />
          <Tile label={t.hero.wind} value={view.wind.calm ? t.hero.calm : v.speed(view.wind.speed)} className="bg-wx-wind-soft" />
          <Tile label={t.hero.rainToday} value={v.rain(view.rain.today)} className="bg-wx-rain-soft" />
          <Tile label={t.hero.pressure} value={v.pressureShort(view.pressure.value)} className="bg-wx-pres-soft" />
        </div>
      </div>
    </section>
  )
}

function IndoorStrip({ indoor }: { indoor: CurrentConditions['indoor'] }) {
  const { t, format, preferences } = usePreferences()
  const v = valueText(preferences.units, format)
  const comfort = indoor.comfort
  const comfortable = comfort?.thermal === 'comfortable' && comfort.moisture === 'comfortable'
  const comfortLabel =
    comfort === null
      ? null
      : comfortable
        ? t.indoor.comfortable
        : comfort.thermal !== 'comfortable'
          ? t.indoor[comfort.thermal]
          : t.indoor[comfort.moisture as 'dry' | 'humid']
  const delta = indoor.differenceFromOutdoor
  const difference =
    delta === null ? null : Math.abs(delta) < 0.5 ? t.indoor.same : delta > 0 ? t.indoor.warmer(format.number(Math.abs(delta), 1)) : t.indoor.cooler(format.number(Math.abs(delta), 1))

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-[14px] bg-wx-in-soft px-3.5 py-3">
      <div className="flex items-center gap-2.5">
        <svg width="26" height="26" viewBox="0 0 44 44" aria-hidden="true">
          <path d="M7 21L22 8l15 13" fill="none" stroke="var(--lav)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 18v18h22V18" fill="var(--sf)" stroke="var(--lav)" strokeWidth="3" strokeLinejoin="round" />
          <rect x="18.5" y="25" width="7" height="11" rx="1.5" fill="var(--lav)" opacity="0.5" />
        </svg>
        <span className="text-[13px] font-semibold">{t.indoor.title}</span>
      </div>
      <span className="num text-[17px]">
        {v.temperature(indoor.temperature)} · {v.percent(indoor.humidity)}
      </span>
      {comfortLabel ? (
        <span className={`rounded-full px-[9px] py-[3px] text-xs font-medium ${comfortable ? 'bg-wx-ok-soft' : 'bg-wx-sun-soft'}`}>{comfortLabel}</span>
      ) : null}
      {difference ? <span className="ml-auto text-xs text-wx-t2">{difference}</span> : null}
    </div>
  )
}

function Tile({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className={`flex flex-col gap-0.5 rounded-[14px] px-3.5 py-3 ${className}`}>
      <span className="text-xs text-wx-t2">{label}</span>
      <span className="num text-xl">{value}</span>
    </div>
  )
}
