// Conversiones de unidades. La unidad canónica interna es métrica: °C, km/h, mm y hPa.
// Los mappers convierten al entrar; la UI convierte a imperial (o a mmHg) solo para mostrar.

export type UnitSystem = 'metric' | 'imperial'

const KM_PER_MILE = 1.609344
const MM_PER_INCH = 25.4
const HPA_PER_INHG = 33.8638866667
const HPA_PER_MMHG = 1.3332236842

export const fahrenheitToCelsius = (fahrenheit: number): number => ((fahrenheit - 32) * 5) / 9
export const celsiusToFahrenheit = (celsius: number): number => (celsius * 9) / 5 + 32

export const mphToKmh = (mph: number): number => mph * KM_PER_MILE
export const kmhToMph = (kmh: number): number => kmh / KM_PER_MILE

export const inchesToMillimeters = (inches: number): number => inches * MM_PER_INCH
export const millimetersToInches = (millimeters: number): number => millimeters / MM_PER_INCH

export const inHgToHPa = (inHg: number): number => inHg * HPA_PER_INHG
export const hPaToInHg = (hPa: number): number => hPa / HPA_PER_INHG

export const mmHgToHPa = (mmHg: number): number => mmHg * HPA_PER_MMHG
export const hPaToMmHg = (hPa: number): number => hPa / HPA_PER_MMHG

/** Aplica `convert` solo si hay dato; `null` significa "sin dato" y nunca se convierte en 0. */
export function mapNullable<T, R>(value: T | null, convert: (value: T) => R): R | null {
  return value === null ? null : convert(value)
}
