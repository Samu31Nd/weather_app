// Ilustraciones de las secciones del histórico (artboard `Main`): reflejan los datos del periodo. El termómetro
// sube con la temperatura media, la gota se llena con la humedad, la brújula apunta al viento dominante, el tubo
// se llena con la proporción de días con lluvia y la aguja del barómetro marca la última presión.

import type { HistorySummary } from '../application/history-view'
import { PRESSURE_GAUGE_HPA } from '../application/current-conditions'
import { COMPASS_POINTS } from '../domain/wind'

export interface HistoryArt {
  /** Columna del termómetro (lienzo 64 × 64): tope y altura. */
  readonly thermometer: { readonly top: number; readonly height: number }
  /** Parte vacía de la gota, de 0 (llena) a 1 (vacía), para el degradado. */
  readonly dropEmpty: number
  /** Giro de la aguja de la brújula hacia el viento dominante, en grados. */
  readonly windNeedleDeg: number
  /** Gotas encendidas (1) o tenues (0.25) según cuánto llovió. */
  readonly drops: readonly [number, number, number]
  /** Agua del pluviómetro: tope y altura. */
  readonly gauge: { readonly top: number; readonly height: number }
  /** Giro de la aguja del barómetro (−120° a +120°). */
  readonly pressureNeedleDeg: number
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const round1 = (value: number) => Math.round(value * 10) / 10

/** Usa los indicadores en unidades métricas (°C, %, hPa): la ilustración no cambia con las unidades. */
export function historyArt(metric: HistorySummary): HistoryArt {
  const meanC = metric.temperature.mean ?? 0
  const thermometerTop = 46 - clamp(meanC / 35, 0.05, 1) * 36
  const rainyShare = metric.rain.daysWithData ? metric.rain.rainyDays / metric.rain.daysWithData : 0
  const water = rainyShare * 38
  const direction = metric.wind.dominantDirection
  const pressure = metric.pressure.last
  const pressureShare = pressure === null ? 0.5 : clamp((pressure - PRESSURE_GAUGE_HPA.min) / (PRESSURE_GAUGE_HPA.max - PRESSURE_GAUGE_HPA.min), 0, 1)
  return {
    thermometer: { top: round1(thermometerTop), height: round1(51 - thermometerTop) },
    dropEmpty: Math.round((1 - (metric.temperature.humidityMean ?? 0) / 100) * 1000) / 1000,
    windNeedleDeg: direction === null ? 0 : COMPASS_POINTS.indexOf(direction) * 22.5,
    drops: [(metric.rain.total ?? 0) > 0 ? 1 : 0.25, rainyShare > 0.33 ? 1 : 0.25, rainyShare > 0.66 ? 1 : 0.25],
    gauge: { top: round1(16 + 38 - water), height: round1(water) },
    pressureNeedleDeg: round1(-120 + 240 * pressureShare),
  }
}
