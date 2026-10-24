// Histórico: una muestra cada 15 min, ya en unidades canónicas, y el manejo de rangos (RF-APP-06).

import type { CompassPoint } from './wind'

export interface HistorySample {
  readonly at: Date
  readonly temperatureC: number | null
  readonly temperatureMaxC: number | null
  readonly temperatureMinC: number | null
  readonly indoorTemperatureC: number | null
  readonly humidityPct: number | null
  readonly indoorHumidityPct: number | null
  readonly windKmh: number | null
  readonly gustKmh: number | null
  /** Dirección dominante del intervalo; `null` con calma. */
  readonly windDirection: CompassPoint | null
  readonly gustDirection: CompassPoint | null
  /** Lluvia caída en el intervalo de 15 min (no acumulada). */
  readonly rainMm: number | null
  readonly rainRateMmH: number | null
  readonly seaLevelPressureHPa: number | null
}

export interface DateRange {
  readonly start: Date
  readonly end: Date
}

const DAY_MS = 86_400_000

/** La fuente corta en 1000 filas (≈ 10.4 días a 96 filas/día); 10 días por tramo deja margen. */
export const MAX_DAYS_PER_REQUEST = 10

/** Parte un rango en tramos contiguos de a lo mucho `maxDays` días. */
export function splitRange(range: DateRange, maxDays: number = MAX_DAYS_PER_REQUEST): DateRange[] {
  if (range.end.getTime() <= range.start.getTime()) return []
  const chunks: DateRange[] = []
  const step = maxDays * DAY_MS
  for (let start = range.start.getTime(); start < range.end.getTime(); start += step) {
    chunks.push({ start: new Date(start), end: new Date(Math.min(start + step, range.end.getTime())) })
  }
  return chunks
}

/** Une tramos: quita duplicados por instante (los extremos de los tramos se solapan) y ordena ascendente. */
export function mergeSamples(chunks: ReadonlyArray<ReadonlyArray<HistorySample>>): HistorySample[] {
  const byInstant = new Map<number, HistorySample>()
  for (const sample of chunks.flat()) byInstant.set(sample.at.getTime(), sample)
  return [...byInstant.values()].sort((a, b) => a.at.getTime() - b.at.getTime())
}
