// Repositorio del histórico por HTTP. Cada llamada cubre un solo tramo; partir rangos largos es tarea del caso
// de uso `GetHistory`. Si la fuente devuelve el tope de filas, el tramo era demasiado largo y se falla en
// lugar de entregar datos incompletos en silencio.

import type { DateRange, HistorySample } from '../../domain/history'
import { toMexicoCityWallTime } from '../../domain/time'
import type { HistoryRepository } from '../../ports'
import { fetchJson, type HttpOptions } from '../http'
import type { CloudHistoryResponseDto } from './cloud-history.dto'
import { mapCleanWeatherRow } from './cloud-history.mapper'

/** Tope de filas de la Cloud Function (`LIMIT 1000`). */
export const SOURCE_ROW_LIMIT = 1000

export class TruncatedHistoryError extends Error {
  constructor(readonly range: DateRange) {
    super(`El tramo devolvió ${SOURCE_ROW_LIMIT} filas: está truncado; pide tramos más cortos.`)
    this.name = 'TruncatedHistoryError'
  }
}

export class HttpHistoryRepository implements HistoryRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly http: HttpOptions = {},
  ) {}

  async getSamples(range: DateRange): Promise<HistorySample[]> {
    const response = await fetchJson<CloudHistoryResponseDto>(this.urlFor(range), this.http)
    if (response.data.length >= SOURCE_ROW_LIMIT) throw new TruncatedHistoryError(range)
    return response.data.map(mapCleanWeatherRow)
  }

  /** La fuente compara `fecha + hora` como hora de pared de Ciudad de México, con ambos extremos incluidos. */
  urlFor(range: DateRange): string {
    const url = new URL(this.baseUrl)
    url.searchParams.set('vista', 'vw_clean_weather')
    url.searchParams.set('date_start', toMexicoCityWallTime(range.start))
    url.searchParams.set('date_end', toMexicoCityWallTime(range.end))
    return url.toString()
  }
}
