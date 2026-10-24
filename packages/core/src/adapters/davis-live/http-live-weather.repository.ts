// Repositorio del dato en vivo por HTTP. Sirve igual para la consola directa o para el proxy `/api/live`
// de la web, porque el proxy devuelve el JSON crudo de la consola (ADR-0007).

import type { LiveReading } from '../../domain/live-reading'
import type { LiveWeatherRepository } from '../../ports'
import { fetchJson, type HttpOptions } from '../http'
import type { DavisLiveDto } from './davis-live.dto'
import { mapDavisLive } from './davis-live.mapper'

export class HttpLiveWeatherRepository implements LiveWeatherRepository {
  constructor(
    private readonly url: string,
    private readonly http: HttpOptions = {},
  ) {}

  async getCurrent(): Promise<LiveReading> {
    const dto = await fetchJson<DavisLiveDto>(this.url, this.http)
    return mapDavisLive(dto)
  }
}
