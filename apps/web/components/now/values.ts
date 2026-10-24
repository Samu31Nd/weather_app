// Valores con su unidad y los decimales del diseño para cada magnitud (RF-APP-10).

import { type DisplayUnits, UNIT_SYMBOLS } from '@tt/core'
import type { Formatter } from '@tt/i18n'

export interface ValueText {
  readonly symbols: (typeof UNIT_SYMBOLS)[DisplayUnits]
  temperature(value: number | null): string
  degrees(value: number | null): string
  speed(value: number | null): string
  rain(value: number | null): string
  rainRate(value: number | null): string
  /** Presión con los decimales de la tarjeta (1 en hPa, 3 en inHg). */
  pressure(value: number | null): string
  /** Presión resumida para el héroe (0 en hPa, 2 en inHg). */
  pressureShort(value: number | null): string
  percent(value: number | null): string
}

export function valueText(units: DisplayUnits, format: Formatter): ValueText {
  const symbols = UNIT_SYMBOLS[units]
  const metric = units === 'metric'
  const withUnit = (text: string, unit: string) => (text === format.number(null) ? text : `${text} ${unit}`)
  return {
    symbols,
    temperature: (value) => withUnit(format.number(value, 1), symbols.temperature),
    degrees: (value) => (value === null ? format.number(null) : `${format.number(value, 1)}°`),
    speed: (value) => withUnit(format.number(value, 1), symbols.speed),
    rain: (value) => withUnit(format.number(value, metric ? (value !== null && value >= 10 ? 0 : 1) : 2), symbols.rain),
    rainRate: (value) => withUnit(format.number(value, metric ? 1 : 2), symbols.rainRate),
    pressure: (value) => format.number(value, metric ? 1 : 3),
    pressureShort: (value) => withUnit(format.number(value, metric ? 0 : 2), symbols.pressure),
    percent: (value) => (value === null ? format.number(null) : `${format.number(value, 0)} %`),
  }
}
