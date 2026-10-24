// Gráficas del histórico listas para dibujar (artboards `Main` y `MobileHistory`): escalas y trazos de cada
// sección a partir del modelo de vista. Los altos por defecto son los del artboard web; la móvil pasa los suyos.

import type { HistoryView } from '../application/history-view'
import { type NiceScale, areaPath, bandPath, barsPath, linePath, linearY, niceScale } from './series'

export interface ChartHeights {
  readonly temperature: number
  readonly humidity: number
  readonly wind: number
  readonly rain: number
  readonly cumulative: number
  readonly pressure: number
}

export const WEB_CHART_HEIGHTS: ChartHeights = { temperature: 220, humidity: 110, wind: 170, rain: 140, cumulative: 80, pressure: 150 }

export interface HistoryCharts {
  readonly temperature: { readonly scale: NiceScale; readonly band: string; readonly line: string; readonly indoor: string }
  readonly humidity: { readonly scale: NiceScale; readonly line: string; readonly indoor: string }
  readonly wind: { readonly scale: NiceScale; readonly line: string; readonly gust: string }
  readonly rain: { readonly scale: NiceScale; readonly bars: string }
  readonly cumulative: { readonly scale: NiceScale; readonly line: string; readonly area: string }
  readonly pressure: { readonly scale: NiceScale; readonly band: string; readonly line: string }
}

const HUMIDITY_SCALE: NiceScale = { lo: 0, hi: 100, step: 50, ticks: [0, 50, 100] }
/** Rango mínimo del eje de presión, para que el ruido no parezca una tormenta (2 mmHg ≈ 2.7 hPa ≈ 0.08 inHg). */
const MIN_PRESSURE_SPAN = { metric: 2.7, imperial: 0.08 } as const

const finite = (values: ReadonlyArray<number | null>) => values.filter((v): v is number => v !== null)
const lowest = (values: ReadonlyArray<number | null>, fallback: number) => (finite(values).length ? Math.min(...finite(values)) : fallback)
const highest = (values: ReadonlyArray<number | null>, fallback: number) => (finite(values).length ? Math.max(...finite(values)) : fallback)

export function historyCharts(view: HistoryView, options: { showIndoor: boolean; width: number; heights?: ChartHeights }): HistoryCharts {
  const { showIndoor, width } = options
  const heights = options.heights ?? WEB_CHART_HEIGHTS
  const b = view.buckets
  const series = <T>(pick: (bucket: (typeof b)[number]) => T | null) => b.map((bucket) => (bucket.empty ? null : pick(bucket)))

  const tMean = series((x) => x.temperature?.mean ?? null)
  const tMin = series((x) => x.temperature?.min ?? null)
  const tMax = series((x) => x.temperature?.max ?? null)
  const tIn = showIndoor ? series((x) => x.indoorTemperature) : []
  const tScale = niceScale(Math.min(lowest(tMin, 0), lowest(tIn, Infinity)), Math.max(highest(tMax, 1), highest(tIn, -Infinity)), 4)
  const yT = linearY(tScale, heights.temperature)

  const yH = linearY(HUMIDITY_SCALE, heights.humidity)

  const gust = series((x) => x.gust)
  const wScale = niceScale(0, Math.max(view.units === 'metric' ? 5 : 3, highest(gust, 0)), 4)
  const yW = linearY(wScale, heights.wind)

  const rain = series((x) => x.rain)
  const rScale = niceScale(0, Math.max(view.units === 'metric' ? 1 : 0.04, highest(rain, 0)), 3)
  const yR = linearY(rScale, heights.rain)
  const cumulative = b.map((bucket) => bucket.cumulativeRain)
  const cScale = niceScale(0, Math.max(view.units === 'metric' ? 1 : 0.04, highest(cumulative, 0)), 2)
  const yC = linearY(cScale, heights.cumulative)

  const pLow = series((x) => x.pressure?.min ?? null)
  const pHigh = series((x) => x.pressure?.max ?? null)
  let pLo = lowest(pLow, 1013)
  let pHi = highest(pHigh, 1013)
  const minSpan = MIN_PRESSURE_SPAN[view.units]
  if (pHi - pLo < minSpan) {
    const center = (pHi + pLo) / 2
    pLo = center - minSpan / 2
    pHi = center + minSpan / 2
  }
  const pScale = niceScale(pLo, pHi, 4)
  const yP = linearY(pScale, heights.pressure)

  return {
    temperature: { scale: tScale, band: bandPath(tMin, tMax, yT, width), line: linePath(tMean, yT, width), indoor: showIndoor ? linePath(tIn, yT, width) : '' },
    humidity: {
      scale: HUMIDITY_SCALE,
      line: linePath(series((x) => x.humidity), yH, width),
      indoor: showIndoor ? linePath(series((x) => x.indoorHumidity), yH, width) : '',
    },
    wind: { scale: wScale, line: linePath(series((x) => x.wind), yW, width), gust: linePath(gust, yW, width) },
    rain: { scale: rScale, bars: barsPath(rain, yR, width, heights.rain) },
    cumulative: { scale: cScale, line: linePath(cumulative, yC, width), area: areaPath(cumulative, yC, width, heights.cumulative) },
    pressure: { scale: pScale, band: bandPath(pLow, pHigh, yP, width), line: linePath(series((x) => x.pressure?.mean ?? null), yP, width) },
  }
}
