import { mmHgToHPa } from './units'

// Presión atmosférica. La consola entrega el valor ya reducido a nivel del mar (desde el 2026-10-20) y la
// tendencia de 3 h como un código Davis, no como una diferencia (docs/06-datos.md, rarezas D3 y D4).

export type PressureTrend =
  | 'fallingRapidly'
  | 'fallingSlowly'
  | 'steady'
  | 'risingSlowly'
  | 'risingRapidly'

const TREND_BY_DAVIS_CODE: Readonly<Record<number, PressureTrend>> = {
  [-60]: 'fallingRapidly',
  [-20]: 'fallingSlowly',
  0: 'steady',
  20: 'risingSlowly',
  60: 'risingRapidly',
}

/** Traduce `bartr`; cualquier código fuera de la tabla Davis se trata como "sin dato". */
export function pressureTrendFromDavisCode(code: number | null): PressureTrend | null {
  if (code === null) return null
  return TREND_BY_DAVIS_CODE[code] ?? null
}

// 740–790 mmHg reducidos a nivel del mar: el rango plausible para ESCOM (docs/06-datos.md, D3).
const PLAUSIBLE_SEA_LEVEL_HPA = { min: mmHgToHPa(740), max: mmHgToHPa(790) } as const

export function isPlausibleSeaLevelPressure(hPa: number): boolean {
  return hPa >= PLAUSIBLE_SEA_LEVEL_HPA.min && hPa <= PLAUSIBLE_SEA_LEVEL_HPA.max
}

// Umbrales Davis de tendencia en 3 h: 0.02 inHg (≈ 0.7 hPa) lento y 0.06 inHg (≈ 2 hPa) rápido.
const SLOW_CHANGE_HPA = 0.7
const RAPID_CHANGE_HPA = 2

/** Tendencia a partir del cambio de presión en 3 h, con los mismos umbrales que usa la consola. */
export function pressureTrendFromChange(changeHPa: number): PressureTrend {
  if (changeHPa <= -RAPID_CHANGE_HPA) return 'fallingRapidly'
  if (changeHPa <= -SLOW_CHANGE_HPA) return 'fallingSlowly'
  if (changeHPa >= RAPID_CHANGE_HPA) return 'risingRapidly'
  if (changeHPa >= SLOW_CHANGE_HPA) return 'risingSlowly'
  return 'steady'
}
