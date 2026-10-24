// Tiempo. México eliminó el horario de verano en 2022, así que Ciudad de México es UTC−6 todo el año.
// La consola tiene el reloj de pared bien (hora de CDMX), pero su zona horaria está configurada en UTC−5
// (docs/06-datos.md, D12): su `utctime` sale 1 h atrasado y el amanecer/ocaso que calcula, 1 h adelantados.

const MINUTE_MS = 60_000
export const MEXICO_CITY_UTC_OFFSET_MINUTES = -360

/** Instante a partir de una fecha y hora de pared de Ciudad de México ("2026-10-19", "23:45:00"). */
export function instantFromMexicoCityWallTime(date: string, time: string): Date {
  const [hours = '0', minutes = '0', seconds = '0'] = time.split(':')
  const [year, month, day] = date.slice(0, 10).split('-').map(Number) as [number, number, number]
  const wallTimeAsUtc = Date.UTC(year, month - 1, day, Number(hours), Number(minutes), Number(seconds))
  return new Date(wallTimeAsUtc - MEXICO_CITY_UTC_OFFSET_MINUTES * MINUTE_MS)
}

/** Instante a partir de segundos epoch que codifican una hora de pared de Ciudad de México (`loctime`). */
export function instantFromMexicoCityEpochWallTime(epochSeconds: number): Date {
  return new Date(epochSeconds * 1000 - MEXICO_CITY_UTC_OFFSET_MINUTES * MINUTE_MS)
}

/** Fecha y hora de pared de Ciudad de México en formato `YYYY-MM-DDTHH:mm:ss`. */
export function toMexicoCityWallTime(instant: Date): string {
  return new Date(instant.getTime() + MEXICO_CITY_UTC_OFFSET_MINUTES * MINUTE_MS).toISOString().slice(0, 19)
}

/** Minutos desde la medianoche para una hora `H:MM` de la consola; `null` si no es válida. */
export function parseClockTime(value: string | null | undefined): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value?.trim() ?? '')
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null
}

/**
 * Convierte una hora `H:MM` dada en la zona `offsetMinutes` en un instante, tomando el día de esa zona en el
 * momento de la observación. Para los extremos `hl*` es la hora de CDMX; para amanecer y ocaso, la zona que
 * la consola cree tener: `(loctime − utctime) / 60`.
 */
export function consoleClockToInstant(
  clockTime: string | null | undefined,
  observedAt: Date,
  offsetMinutes: number,
): Date | null {
  const minutesOfDay = parseClockTime(clockTime)
  if (minutesOfDay === null) return null
  const zonedNow = new Date(observedAt.getTime() + offsetMinutes * MINUTE_MS)
  const zonedMidnightAsUtc = Date.UTC(zonedNow.getUTCFullYear(), zonedNow.getUTCMonth(), zonedNow.getUTCDate())
  return new Date(zonedMidnightAsUtc + (minutesOfDay - offsetMinutes) * MINUTE_MS)
}
