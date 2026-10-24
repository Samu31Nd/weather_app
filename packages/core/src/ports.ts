// Puertos: lo que el núcleo necesita del exterior. Las implementaciones viven en `adapters/` o en cada app.

import type { DateRange, HistorySample } from './domain/history'
import type { LiveReading } from './domain/live-reading'

export interface LiveWeatherRepository {
  getCurrent(): Promise<LiveReading>
}

export interface HistoryRepository {
  /** Muestras del rango (extremos incluidos), en cualquier orden. */
  getSamples(range: DateRange): Promise<HistorySample[]>
}

export interface Clock {
  now(): Date
}

export const systemClock: Clock = { now: () => new Date() }
