// Modelo de vista del histórico (artboards `Main` y `MobileHistory`, RF-APP-07, RF-APP-08): las lecturas de 15 min
// agrupadas en intervalos de la resolución elegida, la lluvia acumulada, la rosa de los vientos y los indicadores
// del periodo, ya en las unidades elegidas. La web y la móvil lo dibujan igual; los textos los pone @tt/i18n.
//
// Reglas de agregación (texto "cómo se calcula" del diseño): promedio por intervalo; la banda va del mínimo al
// máximo; la lluvia se suma; ráfaga e intensidad toman el máximo. Un intervalo sin lecturas queda vacío y se
// dibuja como hueco, nunca como cero (D8).

import {
  type DisplayUnits, displayPressure, displayRain, displaySpeed, displayTemperature, displayTemperatureDelta,
} from '../domain/display-units'
import type { DateRange, HistorySample } from '../domain/history'
import { type Resolution, bucketStart, nextBucket } from '../domain/history-period'
import { type PressureTrend, isPlausibleSeaLevelPressure, pressureTrendFromChange } from '../domain/pressure'
import { CALM_THRESHOLD_KMH, COMPASS_POINTS, type CompassPoint } from '../domain/wind'

export interface MeanRange {
  readonly mean: number
  readonly min: number
  readonly max: number
}

export interface HistoryBucket {
  readonly start: Date
  /** Sin lecturas: se dibuja como hueco. */
  readonly empty: boolean
  readonly readings: number
  readonly temperature: MeanRange | null
  readonly indoorTemperature: number | null
  readonly humidity: number | null
  readonly indoorHumidity: number | null
  readonly wind: number | null
  readonly gust: number | null
  readonly rain: number | null
  readonly rainRate: number | null
  readonly pressure: MeanRange | null
  /** Lluvia acumulada desde el inicio del periodo hasta este intervalo (incluido). */
  readonly cumulativeRain: number
}

/** Velocidades de la rosa en km/h, como el diseño: < 2, 2–5 y > 5. */
export const ROSE_SPEED_BINS_KMH = [2, 5] as const

export interface WindRose {
  /** Por rumbo (en el orden N, NNE…), el porcentaje del tiempo en cada banda de velocidad. */
  readonly directions: ReadonlyArray<{ readonly direction: CompassPoint; readonly percentBySpeed: readonly [number, number, number] }>
  readonly calmPercent: number
  /** Porcentaje del rumbo más frecuente: es el anillo exterior. */
  readonly maxPercent: number
}

export interface Extreme {
  readonly value: number
  readonly at: Date
}

export interface HistorySummary {
  readonly temperature: {
    readonly max: Extreme | null
    readonly min: Extreme | null
    readonly mean: number | null
    /** Promedio de (máx − mín) de los días con datos. */
    readonly dailySwing: number | null
    readonly humidityMean: number | null
    readonly humidityMin: number | null
    readonly humidityMax: number | null
  }
  readonly wind: {
    readonly mean: number | null
    readonly gust: Extreme | null
    readonly dominantDirection: CompassPoint | null
    readonly dominantPercent: number | null
    readonly calmPercent: number | null
  }
  readonly rain: {
    readonly total: number | null
    /** Días con al menos 0.2 mm (lo mínimo que mide el pluviómetro). */
    readonly rainyDays: number
    readonly daysWithData: number
    /** Día más lluvioso (inicio del día en CDMX); null si no llovió. */
    readonly wettestDay: Extreme | null
    readonly maxRate: Extreme | null
  }
  readonly pressure: {
    readonly last: number | null
    /** Tendencia de las últimas 3 h del periodo, con los umbrales de la consola. */
    readonly trend: PressureTrend | null
    readonly min: number | null
    readonly max: number | null
    /** Última − primera lectura del periodo. */
    readonly change: number | null
  }
}

export interface HistoryView {
  readonly units: DisplayUnits
  readonly resolution: Resolution
  readonly range: DateRange
  readonly readings: number
  readonly buckets: readonly HistoryBucket[]
  readonly emptyBuckets: number
  readonly rose: WindRose
  readonly summary: HistorySummary
}

/** Lluvia mínima que registra el pluviómetro: un "día con lluvia" junta al menos esto. */
export const RAIN_DAY_THRESHOLD_MM = 0.2
const THREE_HOURS_MS = 3 * 3_600_000

export function buildHistoryView(
  samples: readonly HistorySample[],
  options: { resolution: Resolution; units: DisplayUnits; range: DateRange },
): HistoryView {
  const { resolution, units, range } = options
  const clean = samples.map(withPlausiblePressure)
  const buckets = aggregate(clean, resolution, range, units)
  return {
    units,
    resolution,
    range,
    readings: clean.length,
    buckets,
    emptyBuckets: buckets.filter((bucket) => bucket.empty).length,
    rose: windRose(clean),
    summary: summarize(clean, range, units),
  }
}

// Las lecturas sin corregir de presión (antes del ajuste, D3) se descartan para no deformar la escala.
function withPlausiblePressure(sample: HistorySample): HistorySample {
  const pressure = sample.seaLevelPressureHPa
  return pressure === null || isPlausibleSeaLevelPressure(pressure) ? sample : { ...sample, seaLevelPressureHPa: null }
}

function aggregate(samples: readonly HistorySample[], resolution: Resolution, range: DateRange, units: DisplayUnits): HistoryBucket[] {
  const groups = new Map<number, HistorySample[]>()
  for (const sample of samples) {
    const key = bucketStart(sample.at, resolution).getTime()
    const group = groups.get(key)
    if (group) group.push(sample)
    else groups.set(key, [sample])
  }
  const buckets: HistoryBucket[] = []
  let cumulativeMm = 0
  for (let start = bucketStart(range.start, resolution); start < range.end; start = nextBucket(start, resolution)) {
    const group = groups.get(start.getTime()) ?? []
    const rainMm = sum(group.map((s) => s.rainMm))
    cumulativeMm += rainMm ?? 0
    buckets.push({
      start,
      empty: group.length === 0,
      readings: group.length,
      temperature: meanRange(group.map((s) => s.temperatureC), group.map((s) => s.temperatureMinC ?? s.temperatureC), group.map((s) => s.temperatureMaxC ?? s.temperatureC), (c) => displayTemperature(c, units)),
      indoorTemperature: displayTemperature(mean(group.map((s) => s.indoorTemperatureC)), units),
      humidity: mean(group.map((s) => s.humidityPct)),
      indoorHumidity: mean(group.map((s) => s.indoorHumidityPct)),
      wind: displaySpeed(mean(group.map((s) => s.windKmh)), units),
      gust: displaySpeed(max(group.map((s) => s.gustKmh)), units),
      rain: displayRain(rainMm, units),
      rainRate: displayRain(max(group.map((s) => s.rainRateMmH)), units),
      pressure: meanRange(group.map((s) => s.seaLevelPressureHPa), group.map((s) => s.seaLevelPressureHPa), group.map((s) => s.seaLevelPressureHPa), (p) => displayPressure(p, units)),
      cumulativeRain: displayRain(cumulativeMm, units) ?? 0,
    })
  }
  return buckets
}

function windRose(samples: readonly HistorySample[]): WindRose {
  const withWind = samples.filter((s) => s.windKmh !== null)
  const total = withWind.length
  const counts = new Map<CompassPoint, [number, number, number]>(COMPASS_POINTS.map((point) => [point, [0, 0, 0]]))
  let calm = 0
  for (const sample of withWind) {
    const speed = sample.windKmh as number
    if (sample.windDirection === null || speed < CALM_THRESHOLD_KMH) {
      calm += 1
      continue
    }
    const bin = speed < ROSE_SPEED_BINS_KMH[0] ? 0 : speed <= ROSE_SPEED_BINS_KMH[1] ? 1 : 2
    ;(counts.get(sample.windDirection) as [number, number, number])[bin] += 1
  }
  const percent = (count: number) => (total === 0 ? 0 : (count / total) * 100)
  const directions = COMPASS_POINTS.map((direction) => {
    const [slow, medium, fast] = counts.get(direction) as [number, number, number]
    return { direction, percentBySpeed: [percent(slow), percent(medium), percent(fast)] as const }
  })
  const maxPercent = Math.max(0, ...directions.map((d) => d.percentBySpeed[0] + d.percentBySpeed[1] + d.percentBySpeed[2]))
  return { directions, calmPercent: percent(calm), maxPercent }
}

function summarize(samples: readonly HistorySample[], range: DateRange, units: DisplayUnits): HistorySummary {
  const t = (c: number | null) => displayTemperature(c, units)
  const extremeOf = (pick: (s: HistorySample) => number | null, better: (a: number, b: number) => boolean): { value: number; at: Date } | null => {
    let best: { value: number; at: Date } | null = null
    for (const sample of samples) {
      const value = pick(sample)
      if (value !== null && (best === null || better(value, best.value))) best = { value, at: sample.at }
    }
    return best
  }
  const convert = (extreme: { value: number; at: Date } | null, to: (v: number) => number | null): Extreme | null =>
    extreme === null ? null : { value: to(extreme.value) as number, at: extreme.at }

  const days = aggregateDays(samples, range)
  const swings = days.flatMap((day) => (day.maxC !== null && day.minC !== null ? [day.maxC - day.minC] : []))
  const rainyDays = days.filter((day) => (day.rainMm ?? 0) >= RAIN_DAY_THRESHOLD_MM)
  const wettest = days.reduce<{ rainMm: number; start: Date } | null>(
    (best, day) => ((day.rainMm ?? 0) > (best?.rainMm ?? 0) ? { rainMm: day.rainMm as number, start: day.start } : best),
    null,
  )

  const directions = new Map<CompassPoint, number>()
  let calm = 0
  let windReadings = 0
  for (const sample of samples) {
    if (sample.windKmh === null) continue
    windReadings += 1
    if (sample.windDirection === null || sample.windKmh < CALM_THRESHOLD_KMH) calm += 1
    else directions.set(sample.windDirection, (directions.get(sample.windDirection) ?? 0) + 1)
  }
  const dominant = [...directions.entries()].sort((a, b) => b[1] - a[1])[0] ?? null

  const pressures = samples.filter((s) => s.seaLevelPressureHPa !== null)
  const first = pressures[0]?.seaLevelPressureHPa ?? null
  const lastSample = pressures[pressures.length - 1]
  const last = lastSample?.seaLevelPressureHPa ?? null
  const threeHoursBefore = lastSample ? [...pressures].reverse().find((s) => lastSample.at.getTime() - s.at.getTime() >= THREE_HOURS_MS) : undefined
  const totalRain = sum(samples.map((s) => s.rainMm))
  const p = (hPa: number | null) => displayPressure(hPa, units)

  return {
    temperature: {
      max: convert(extremeOf((s) => s.temperatureMaxC ?? s.temperatureC, (a, b) => a > b), t),
      min: convert(extremeOf((s) => s.temperatureMinC ?? s.temperatureC, (a, b) => a < b), t),
      mean: t(mean(samples.map((s) => s.temperatureC))),
      dailySwing: swings.length === 0 ? null : displayTemperatureDelta(swings.reduce((a, b) => a + b, 0) / swings.length, units),
      humidityMean: mean(samples.map((s) => s.humidityPct)),
      humidityMin: min(samples.map((s) => s.humidityPct)),
      humidityMax: max(samples.map((s) => s.humidityPct)),
    },
    wind: {
      mean: displaySpeed(mean(samples.map((s) => s.windKmh)), units),
      gust: convert(extremeOf((s) => s.gustKmh, (a, b) => a > b), (v) => displaySpeed(v, units)),
      dominantDirection: dominant?.[0] ?? null,
      dominantPercent: dominant && windReadings > 0 ? (dominant[1] / windReadings) * 100 : null,
      calmPercent: windReadings > 0 ? (calm / windReadings) * 100 : null,
    },
    rain: {
      total: displayRain(totalRain, units),
      rainyDays: rainyDays.length,
      daysWithData: days.length,
      wettestDay: wettest ? { value: displayRain(wettest.rainMm, units) as number, at: wettest.start } : null,
      maxRate: (() => {
        const best = extremeOf((s) => s.rainRateMmH, (a, b) => a > b)
        return best && best.value > 0 ? { value: displayRain(best.value, units) as number, at: best.at } : null
      })(),
    },
    pressure: {
      last: p(last),
      trend: last !== null && threeHoursBefore?.seaLevelPressureHPa != null ? pressureTrendFromChange(last - threeHoursBefore.seaLevelPressureHPa) : null,
      min: p(min(pressures.map((s) => s.seaLevelPressureHPa))),
      max: p(max(pressures.map((s) => s.seaLevelPressureHPa))),
      change: last !== null && first !== null ? (p(last) as number) - (p(first) as number) : null,
    },
  }
}

interface DayTotals {
  readonly start: Date
  readonly maxC: number | null
  readonly minC: number | null
  readonly rainMm: number | null
}

/** Días (en CDMX) del periodo que tienen lecturas, con sus extremos y su lluvia. */
function aggregateDays(samples: readonly HistorySample[], range: DateRange): DayTotals[] {
  const byDay = new Map<number, HistorySample[]>()
  for (const sample of samples) {
    if (sample.at < range.start || sample.at > range.end) continue
    const key = bucketStart(sample.at, '1d').getTime()
    const group = byDay.get(key)
    if (group) group.push(sample)
    else byDay.set(key, [sample])
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([start, group]) => ({
      start: new Date(start),
      maxC: max(group.map((s) => s.temperatureMaxC ?? s.temperatureC)),
      minC: min(group.map((s) => s.temperatureMinC ?? s.temperatureC)),
      rainMm: sum(group.map((s) => s.rainMm)),
    }))
}

// ── Agregados que ignoran los huecos (null) ─────────────────────────────────────────────────────────────────

const present = (values: ReadonlyArray<number | null>): number[] => values.filter((v): v is number => v !== null)

function mean(values: ReadonlyArray<number | null>): number | null {
  const xs = present(values)
  return xs.length === 0 ? null : xs.reduce((a, b) => a + b, 0) / xs.length
}

function sum(values: ReadonlyArray<number | null>): number | null {
  const xs = present(values)
  return xs.length === 0 ? null : xs.reduce((a, b) => a + b, 0)
}

function min(values: ReadonlyArray<number | null>): number | null {
  const xs = present(values)
  return xs.length === 0 ? null : Math.min(...xs)
}

function max(values: ReadonlyArray<number | null>): number | null {
  const xs = present(values)
  return xs.length === 0 ? null : Math.max(...xs)
}

function meanRange(
  means: ReadonlyArray<number | null>,
  lows: ReadonlyArray<number | null>,
  highs: ReadonlyArray<number | null>,
  convert: (value: number | null) => number | null,
): MeanRange | null {
  const average = mean(means)
  const low = min(lows)
  const high = max(highs)
  if (average === null || low === null || high === null) return null
  return { mean: convert(average) as number, min: convert(low) as number, max: convert(high) as number }
}
