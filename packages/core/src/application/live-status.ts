// Vigencia del dato en vivo (RF-APP-02, docs/05-flujos.md, estados de "Ahora").
// Se mide desde la última consulta exitosa, no desde la hora de la consola: su reloj puede derivar minutos
// (D12). Aparte, si la consola entrega la misma lectura vieja por mucho tiempo, también se marca.

export type LiveStatus = 'loading' | 'ok' | 'stale' | 'offline' | 'offlineWithData'

export const STALE_AFTER_MS = 2 * 60_000
export const FROZEN_CONSOLE_AFTER_MS = 15 * 60_000

export interface LiveStatusInput {
  readonly now: Date
  readonly lastSuccessAt: Date | null
  readonly observedAt: Date | null
  readonly lastFailed: boolean
}

export function liveStatus({ now, lastSuccessAt, observedAt, lastFailed }: LiveStatusInput): LiveStatus {
  if (lastSuccessAt === null) return lastFailed ? 'offline' : 'loading'
  if (lastFailed) return 'offlineWithData'
  const sinceSuccess = now.getTime() - lastSuccessAt.getTime()
  const sinceObservation = observedAt === null ? 0 : now.getTime() - observedAt.getTime()
  return sinceSuccess > STALE_AFTER_MS || sinceObservation > FROZEN_CONSOLE_AFTER_MS ? 'stale' : 'ok'
}
