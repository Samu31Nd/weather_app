// Puertos: lo que el núcleo necesita del exterior. Las implementaciones viven en `adapters/` o en cada app.

import type { DateRange, HistorySample } from './domain/history'
import type { LiveReading } from './domain/live-reading'
import type { UserPreferences } from './domain/preferences'

export interface LiveWeatherRepository {
  getCurrent(): Promise<LiveReading>
}

export interface HistoryRepository {
  /** Muestras del rango (extremos incluidos), en cualquier orden. */
  getSamples(range: DateRange): Promise<HistorySample[]>
}

export interface PreferencesRepository {
  load(): Promise<UserPreferences>
  save(preferences: UserPreferences): Promise<void>
}

/** Almacén clave-valor: `localStorage` (síncrono) o AsyncStorage (asíncrono) cumplen esta forma. */
export interface KeyValueStorage {
  getItem(key: string): string | null | Promise<string | null>
  setItem(key: string, value: string): void | Promise<void>
}

export interface Clock {
  now(): Date
}

export const systemClock: Clock = { now: () => new Date() }
