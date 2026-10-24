// Sol: mediodía solar, fase del día y avance sobre el arco diurno (RF-APP-01, capa 1 de la escena).

export type DayPhase = 'dawn' | 'day' | 'dusk' | 'night'

export interface SunTimes {
  readonly sunrise: Date
  readonly sunset: Date
}

/** Ventana alrededor del amanecer y del ocaso que se considera crepúsculo (nota `skyMap`). */
export const TWILIGHT_WINDOW_MINUTES = 50

const MINUTE_MS = 60_000

export function solarNoon({ sunrise, sunset }: SunTimes): Date {
  return new Date((sunrise.getTime() + sunset.getTime()) / 2)
}

export function dayPhase(now: Date, { sunrise, sunset }: SunTimes): DayPhase {
  const window = TWILIGHT_WINDOW_MINUTES * MINUTE_MS
  const t = now.getTime()
  if (Math.abs(t - sunrise.getTime()) <= window) return 'dawn'
  if (Math.abs(t - sunset.getTime()) <= window) return 'dusk'
  return t > sunrise.getTime() && t < sunset.getTime() ? 'day' : 'night'
}

/** Avance del sol entre 0 (amanecer) y 1 (ocaso); `null` de noche. */
export function sunProgress(now: Date, { sunrise, sunset }: SunTimes): number | null {
  const t = now.getTime()
  if (t < sunrise.getTime() || t > sunset.getTime()) return null
  return (t - sunrise.getTime()) / (sunset.getTime() - sunrise.getTime())
}
