// Caso de uso: obtener todas las muestras de un periodo aunque superen el tope de la fuente (RF-APP-06).
// Parte el rango en tramos, los pide en paralelo, quita duplicados en las uniones y ordena ascendente.

import { type DateRange, type HistorySample, MAX_DAYS_PER_REQUEST, mergeSamples, splitRange } from '../domain/history'
import type { HistoryRepository } from '../ports'

export class GetHistory {
  constructor(
    private readonly repository: HistoryRepository,
    private readonly maxDaysPerRequest: number = MAX_DAYS_PER_REQUEST,
  ) {}

  async execute(range: DateRange): Promise<HistorySample[]> {
    const chunks = splitRange(range, this.maxDaysPerRequest)
    const results = await Promise.all(chunks.map((chunk) => this.repository.getSamples(chunk)))
    return mergeSamples(results)
  }
}
