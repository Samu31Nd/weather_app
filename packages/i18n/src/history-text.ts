// Textos del histórico que web y móvil muestran igual (artboards `Main` y `MobileHistory`): fechas de cada
// intervalo según la resolución, indicadores del periodo y la lectura bajo el cursor (RF-APP-07, RF-APP-08).
// Las fechas siempre en hora de Ciudad de México.

import {
  type DateRange, type HistoryBucket, type HistorySummary, type HistoryView, MEXICO_CITY_UTC_OFFSET_MINUTES, type Resolution,
} from '@tt/core'
import type { Catalog } from './catalogs/es'
import type { Formatter } from './format'
import { valueText } from './presenters'

const wall = (instant: Date) => new Date(instant.getTime() + MEXICO_CITY_UTC_OFFSET_MINUTES * 60_000)
const pad = (n: number) => String(n).padStart(2, '0')

function shortDate(instant: Date, t: Catalog): string {
  const d = wall(instant)
  return t.calendar.shortDate(d.getUTCDate(), t.calendar.monthsShort[d.getUTCMonth()] as string)
}

function clock(instant: Date): string {
  const d = wall(instant)
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

/** Etiqueta corta del eje x: hora en un periodo de un día, mes con resolución mensual y fecha en lo demás. */
export function axisLabel(instant: Date, resolution: Resolution, days: number, t: Catalog): string {
  if (days <= 1) return clock(instant)
  if (resolution === '1M') return t.calendar.monthsShort[wall(instant).getUTCMonth()] as string
  return shortDate(instant, t)
}

/** El intervalo completo, como lo describe la lectura del cursor ("jue 23 oct", "23 oct, 14:00–15:00"…). */
export function intervalLabel(instant: Date, resolution: Resolution, t: Catalog): string {
  const d = wall(instant)
  switch (resolution) {
    case '15m':
      return `${shortDate(instant, t)}, ${clock(instant)}`
    case '1h':
      return `${shortDate(instant, t)}, ${pad(d.getUTCHours())}:00–${pad((d.getUTCHours() + 1) % 24)}:00`
    case '1d':
      return `${t.calendar.weekdaysShort[d.getUTCDay()]} ${shortDate(instant, t)}`
    case '1w':
      return t.calendar.weekOf(shortDate(instant, t))
    case '1M':
      return `${t.calendar.months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
  }
}

/** "17 oct – 23 oct": el primer y el último día del periodo. */
export function periodLabel(range: DateRange, t: Catalog): string {
  return `${shortDate(range.start, t)} – ${shortDate(new Date(range.end.getTime() - 1), t)}`
}

export interface KpiText {
  readonly label: string
  readonly value: string
  readonly detail: string
}

export interface HistorySummaryText {
  readonly temperature: readonly KpiText[]
  readonly wind: readonly KpiText[]
  readonly rain: readonly KpiText[]
  readonly pressure: readonly KpiText[]
}

/** Los indicadores de cada sección, en el orden del diseño. */
export function historySummaryText(view: HistoryView, t: Catalog, format: Formatter): HistorySummaryText {
  const { summary, units } = view
  const v = valueText(units, format)
  const k = t.history.kpi
  const when = (at: Date | undefined) => (at ? `${shortDate(at, t)}, ${clock(at)}` : '')
  const noData = format.number(null)
  const { temperature: temp, wind, rain, pressure } = summary as HistorySummary
  const signed = (value: number | null) => (value === null ? noData : `${value > 0 ? '+' : value < 0 ? '−' : '±'}${v.pressure(Math.abs(value))} ${v.symbols.pressure}`)

  return {
    temperature: [
      { label: k.max, value: v.temperature(temp.max?.value ?? null), detail: when(temp.max?.at) },
      { label: k.min, value: v.temperature(temp.min?.value ?? null), detail: when(temp.min?.at) },
      { label: k.mean, value: v.temperature(temp.mean), detail: k.outdoor },
      { label: k.swing, value: v.temperature(temp.dailySwing), detail: k.swingSub },
      {
        label: k.humidity,
        value: v.percent(temp.humidityMean),
        detail: temp.humidityMin === null || temp.humidityMax === null ? '' : k.humidityRange(format.number(temp.humidityMin, 0), format.number(temp.humidityMax, 0)),
      },
    ],
    wind: [
      { label: k.windMean, value: v.speed(wind.mean), detail: k.windMeanSub },
      { label: k.gust, value: v.speed(wind.gust?.value ?? null), detail: when(wind.gust?.at) },
      {
        label: k.direction,
        value: wind.dominantDirection ? t.wind.compass[wind.dominantDirection] : t.hero.calm,
        detail: wind.dominantPercent === null ? '' : k.directionShare(format.number(wind.dominantPercent, 0)),
      },
      { label: k.calm, value: wind.calmPercent === null ? noData : `${format.number(wind.calmPercent, 0)} %`, detail: k.calmSub },
    ],
    rain: [
      { label: k.rainTotal, value: v.rain(rain.total), detail: k.inRange },
      { label: k.rainyDays, value: String(rain.rainyDays), detail: k.ofDays(rain.daysWithData) },
      {
        label: k.wettest,
        value: rain.wettestDay ? v.rain(rain.wettestDay.value) : noData,
        detail: rain.wettestDay ? intervalLabel(rain.wettestDay.at, '1d', t) : k.noRain,
      },
      { label: k.rate, value: rain.maxRate ? v.rainRate(rain.maxRate.value) : noData, detail: rain.maxRate ? when(rain.maxRate.at) : k.noRain },
    ],
    pressure: [
      { label: k.last, value: v.pressureShort(pressure.last), detail: k.seaLevel },
      { label: k.trend, value: pressure.trend ? t.pressure.trends[pressure.trend] : noData, detail: k.last3h },
      { label: k.range, value: pressure.min === null || pressure.max === null ? noData : `${v.pressure(pressure.min)}–${v.pressure(pressure.max)}`, detail: k.minMax },
      { label: k.change, value: signed(pressure.change), detail: k.firstLast },
    ],
  }
}

export type HistorySection = 'temperature' | 'humidity' | 'wind' | 'rain' | 'pressure'

/** Lo que dice la lectura bajo el cursor para el intervalo `index` en cada gráfica. */
export function readoutText(view: HistoryView, index: number, section: HistorySection, showIndoor: boolean, t: Catalog, format: Formatter): string {
  const bucket = view.buckets[index] as HistoryBucket | undefined
  if (!bucket) return ''
  const label = intervalLabel(bucket.start, view.resolution, t)
  if (bucket.empty) return `${label} · ${t.history.noData}`
  const v = valueText(view.units, format)
  const r = t.history.readout
  switch (section) {
    case 'temperature': {
      const range = bucket.temperature ? ` (${format.number(bucket.temperature.min, 0)}–${format.number(bucket.temperature.max, 0)})` : ''
      const indoor = showIndoor ? ` · ${r.indoor} ${v.temperature(bucket.indoorTemperature)}` : ''
      return `${label} · ${r.outdoor} ${v.temperature(bucket.temperature?.mean ?? null)}${range}${indoor}`
    }
    case 'humidity':
      return `${label} · ${r.outdoor} ${v.percent(bucket.humidity)}${showIndoor ? ` · ${r.indoor} ${v.percent(bucket.indoorHumidity)}` : ''}`
    case 'wind':
      return `${label} · ${r.mean} ${v.speed(bucket.wind)} · ${r.gust} ${v.speed(bucket.gust)}`
    case 'rain':
      return `${label} · ${v.rain(bucket.rain)} · ${r.cumulative} ${v.rain(bucket.cumulativeRain)} · ${r.peakRate} ${v.rainRate(bucket.rainRate)}`
    case 'pressure': {
      const range = bucket.pressure ? ` (${v.pressure(bucket.pressure.min)}–${v.pressure(bucket.pressure.max)})` : ''
      return `${label} · ${v.pressureShort(bucket.pressure?.mean ?? null)}${range}`
    }
  }
}
