// Composition root del núcleo: conecta adaptadores y casos de uso. Cada app lo llama con su configuración y
// lo reparte con un provider; las pruebas lo llaman con dobles (ADR-0001, docs/03-arquitectura.md).

import { HttpHistoryRepository } from './adapters/cloud-history/http-history.repository'
import { HttpLiveWeatherRepository } from './adapters/davis-live/http-live-weather.repository'
import type { HttpOptions } from './adapters/http'
import { GetHistory } from './application/get-history'
import { GetPreferences, UpdatePreferences } from './application/preferences'
import { KeyValuePreferencesRepository } from './adapters/key-value-preferences.repository'
import { GetLiveWeather } from './application/get-live-weather'
import { ResolveCurrentSky } from './application/resolve-current-sky'
import { type Clock, type HistoryRepository, type KeyValueStorage, type LiveWeatherRepository, type PreferencesRepository, systemClock } from './ports'

export interface CoreConfig {
  /** URL del JSON en vivo: el proxy `/api/live` de la web o la consola directa. */
  readonly liveUrl?: string
  /** URL base de la Cloud Function de histórico. */
  readonly historyUrl?: string
  readonly http?: HttpOptions
  readonly clock?: Clock
  readonly liveRepository?: LiveWeatherRepository
  readonly historyRepository?: HistoryRepository
  /** Almacén de preferencias (`localStorage`, AsyncStorage); sin él, se guardan solo en memoria. */
  readonly storage?: KeyValueStorage
  readonly preferencesRepository?: PreferencesRepository
}

export interface Core {
  readonly getLiveWeather: GetLiveWeather
  readonly getHistory: GetHistory
  readonly resolveCurrentSky: ResolveCurrentSky
  readonly getPreferences: GetPreferences
  readonly updatePreferences: UpdatePreferences
  readonly clock: Clock
}

export function createCore(config: CoreConfig): Core {
  const clock = config.clock ?? systemClock
  const liveRepository: LiveWeatherRepository =
    config.liveRepository ??
    (config.liveUrl ? new HttpLiveWeatherRepository(config.liveUrl, config.http) : { getCurrent: () => missing('liveUrl') })
  const historyRepository: HistoryRepository =
    config.historyRepository ??
    (config.historyUrl ? new HttpHistoryRepository(config.historyUrl, config.http) : { getSamples: () => missing('historyUrl') })
  const preferencesRepository =
    config.preferencesRepository ?? new KeyValuePreferencesRepository(config.storage ?? inMemoryStorage())
  return {
    getLiveWeather: new GetLiveWeather(liveRepository),
    getHistory: new GetHistory(historyRepository),
    resolveCurrentSky: new ResolveCurrentSky(clock),
    getPreferences: new GetPreferences(preferencesRepository),
    updatePreferences: new UpdatePreferences(preferencesRepository),
    clock,
  }
}

/** Un repositorio sin URL falla al usarse, no al crear el contenedor: una app puede no necesitarlo. */
function missing(name: string): Promise<never> {
  return Promise.reject(new Error(`Falta la configuración \`${name}\` del núcleo.`))
}

function inMemoryStorage(): KeyValueStorage {
  const values = new Map<string, string>()
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => void values.set(key, value) }
}
