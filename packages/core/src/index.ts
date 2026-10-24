// API pública de @tt/core. Las apps importan solo desde aquí.

export * from './domain/units'
export * from './domain/wind'
export * from './domain/pressure'
export * from './domain/thermal'
export * from './domain/time'
export * from './domain/sun'
export * from './domain/forecast'
export * from './domain/sky-scene'
export * from './domain/history'
export type * from './domain/live-reading'

export * from './ports'

export { GetLiveWeather } from './application/get-live-weather'
export { GetHistory } from './application/get-history'
export { ResolveCurrentSky } from './application/resolve-current-sky'

export { HttpError, type HttpOptions } from './adapters/http'
export { HttpLiveWeatherRepository } from './adapters/davis-live/http-live-weather.repository'
export { mapDavisLive } from './adapters/davis-live/davis-live.mapper'
export type { DavisLiveDto } from './adapters/davis-live/davis-live.dto'
export { HttpHistoryRepository, TruncatedHistoryError } from './adapters/cloud-history/http-history.repository'
export { mapCleanWeatherRow } from './adapters/cloud-history/cloud-history.mapper'

export { createCore, type Core, type CoreConfig } from './container'
