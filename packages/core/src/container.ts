// Composition root del núcleo: conecta adaptadores y casos de uso. Cada app lo llama con su configuración y
// lo reparte con un provider; las pruebas lo llaman con dobles (ADR-0001, docs/03-arquitectura.md).

import { HttpHistoryRepository } from './adapters/cloud-history/http-history.repository'
import { HttpLiveWeatherRepository } from './adapters/davis-live/http-live-weather.repository'
import type { HttpOptions } from './adapters/http'
import { GetHistory } from './application/get-history'
import { GetLiveWeather } from './application/get-live-weather'
import { ResolveCurrentSky } from './application/resolve-current-sky'
import { type Clock, type HistoryRepository, type LiveWeatherRepository, systemClock } from './ports'

export interface CoreConfig {
  /** URL del JSON en vivo: el proxy `/api/live` de la web o la consola directa. */
  readonly liveUrl?: string
  /** URL base de la Cloud Function de histórico. */
  readonly historyUrl?: string
  readonly http?: HttpOptions
  readonly clock?: Clock
  readonly liveRepository?: LiveWeatherRepository
  readonly historyRepository?: HistoryRepository
}

export interface Core {
  readonly getLiveWeather: GetLiveWeather
  readonly getHistory: GetHistory
  readonly resolveCurrentSky: ResolveCurrentSky
}

export function createCore(config: CoreConfig): Core {
  const clock = config.clock ?? systemClock
  const liveRepository = config.liveRepository ?? new HttpLiveWeatherRepository(required(config.liveUrl, 'liveUrl'), config.http)
  const historyRepository =
    config.historyRepository ?? new HttpHistoryRepository(required(config.historyUrl, 'historyUrl'), config.http)
  return {
    getLiveWeather: new GetLiveWeather(liveRepository),
    getHistory: new GetHistory(historyRepository),
    resolveCurrentSky: new ResolveCurrentSky(clock),
  }
}

function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Falta la configuración \`${name}\` del núcleo.`)
  return value
}
