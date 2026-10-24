// Periodos y resoluciones del histórico (artboards `Main` y `MobileHistory`, RF-APP-06, RF-APP-07).
// Todo se mide en hora de pared de Ciudad de México: los días, las semanas (lun–dom) y los meses empiezan a la
// medianoche de CDMX, no de UTC.

import type { DateRange } from './history'
import { MEXICO_CITY_UTC_OFFSET_MINUTES } from './time'

const MINUTE_MS = 60_000
const DAY_MS = 86_400_000
const OFFSET_MS = MEXICO_CITY_UTC_OFFSET_MINUTES * MINUTE_MS

/** Primer día con datos en la Cloud Function (hora de CDMX). Antes de esa fecha no hay lecturas. */
export const HISTORY_FIRST_DAY = '2026-04-19'

export const HISTORY_PRESETS = ['24h', '7d', '30d', '90d'] as const
export type HistoryPreset = (typeof HISTORY_PRESETS)[number]

export type HistoryPeriod = { readonly kind: 'preset'; readonly preset: HistoryPreset } | { readonly kind: 'custom'; readonly days: number }

export const RESOLUTIONS = ['15m', '1h', '1d', '1w', '1M'] as const
export type Resolution = (typeof RESOLUTIONS)[number]

/** Minutos aproximados por punto (un mes = 30.44 días, como el diseño) para estimar cuántos puntos habrá. */
const RESOLUTION_MINUTES: Readonly<Record<Resolution, number>> = { '15m': 15, '1h': 60, '1d': 1440, '1w': 10_080, '1M': 43_834 }

const PRESET_DAYS: Readonly<Record<HistoryPreset, number>> = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 }

/** Una gráfica legible tiene entre 4 y 800 puntos (regla del diseño). */
export const MIN_POINTS = 4
export const MAX_POINTS = 800

export function periodDays(period: HistoryPeriod): number {
  return period.kind === 'preset' ? PRESET_DAYS[period.preset] : period.days
}

export function estimatedPoints(days: number, resolution: Resolution): number {
  return Math.round((days * 1440) / RESOLUTION_MINUTES[resolution])
}

export function isResolutionAllowed(days: number, resolution: Resolution): boolean {
  const points = (days * 1440) / RESOLUTION_MINUTES[resolution]
  return points >= MIN_POINTS && points <= MAX_POINTS
}

/** Resolución por defecto: 15 min para un día, 1 h hasta una semana, 1 día hasta 800 días (RF-APP-07). */
export function defaultResolution(days: number): Resolution {
  return days <= 1 ? '15m' : days <= 7 ? '1h' : days <= 800 ? '1d' : '1w'
}

/** La resolución pedida si da una gráfica legible; si no, la de por defecto. */
export function resolveResolution(days: number, requested: Resolution | null): Resolution {
  return requested !== null && isResolutionAllowed(days, requested) ? requested : defaultResolution(days)
}

/** Medianoche de hoy en CDMX como instante. */
export function startOfMexicoCityDay(instant: Date): Date {
  const wall = instant.getTime() + OFFSET_MS
  return new Date(wall - (((wall % DAY_MS) + DAY_MS) % DAY_MS) - OFFSET_MS)
}

/**
 * Días completos con datos hasta ayer. El histórico llega con un día de retraso (D7): el último día completo es
 * ayer, así que el periodo termina a la medianoche de hoy.
 */
export function availableDays(now: Date): number {
  const firstDay = new Date(`${HISTORY_FIRST_DAY}T00:00:00.000Z`).getTime() - OFFSET_MS
  return Math.max(1, Math.round((startOfMexicoCityDay(now).getTime() - firstDay) / DAY_MS))
}

/** Días del periodo, recortados a lo que hay de datos. */
export function effectiveDays(period: HistoryPeriod, now: Date): number {
  return Math.min(Math.max(1, Math.floor(periodDays(period))), availableDays(now))
}

/** Rango del periodo: los últimos N días completos, hasta la medianoche de hoy en CDMX. */
export function periodRange(period: HistoryPeriod, now: Date): DateRange {
  const end = startOfMexicoCityDay(now)
  return { start: new Date(end.getTime() - effectiveDays(period, now) * DAY_MS), end }
}

/** Inicio del intervalo (en CDMX) al que pertenece un instante: 15 min, hora, día, semana lun–dom o mes. */
export function bucketStart(instant: Date, resolution: Resolution): Date {
  const wall = instant.getTime() + OFFSET_MS
  const floor = (size: number) => wall - (((wall % size) + size) % size)
  switch (resolution) {
    case '15m':
      return new Date(floor(15 * MINUTE_MS) - OFFSET_MS)
    case '1h':
      return new Date(floor(60 * MINUTE_MS) - OFFSET_MS)
    case '1d':
      return new Date(floor(DAY_MS) - OFFSET_MS)
    case '1w': {
      const day = floor(DAY_MS)
      const mondayOffset = (new Date(day).getUTCDay() + 6) % 7
      return new Date(day - mondayOffset * DAY_MS - OFFSET_MS)
    }
    case '1M': {
      const date = new Date(wall)
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1) - OFFSET_MS)
    }
  }
}

/** Inicio del intervalo siguiente. */
export function nextBucket(start: Date, resolution: Resolution): Date {
  if (resolution === '1M') {
    const wall = new Date(start.getTime() + OFFSET_MS)
    return new Date(Date.UTC(wall.getUTCFullYear(), wall.getUTCMonth() + 1, 1) - OFFSET_MS)
  }
  const sizes = { '15m': 15 * MINUTE_MS, '1h': 60 * MINUTE_MS, '1d': DAY_MS, '1w': 7 * DAY_MS }
  return new Date(start.getTime() + sizes[resolution])
}
