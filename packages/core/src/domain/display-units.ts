// Conversión de unidades canónicas (°C, km/h, mm, hPa) a las que eligió el usuario, solo para mostrar.

import { celsiusToFahrenheit, hPaToInHg, kmhToMph, mapNullable, millimetersToInches } from './units'

export type DisplayUnits = 'metric' | 'imperial'

export const UNIT_SYMBOLS: Readonly<Record<DisplayUnits, { temperature: string; speed: string; rain: string; rainRate: string; pressure: string }>> = {
  metric: { temperature: '°C', speed: 'km/h', rain: 'mm', rainRate: 'mm/h', pressure: 'hPa' },
  imperial: { temperature: '°F', speed: 'mph', rain: 'in', rainRate: 'in/h', pressure: 'inHg' },
}

export const displayTemperature = (celsius: number | null, units: DisplayUnits): number | null =>
  units === 'metric' ? celsius : mapNullable(celsius, celsiusToFahrenheit)

/** Diferencia de temperatura (no se suma el desplazamiento de 32 °F). */
export const displayTemperatureDelta = (deltaC: number, units: DisplayUnits): number =>
  units === 'metric' ? deltaC : (deltaC * 9) / 5

export const displaySpeed = (kmh: number | null, units: DisplayUnits): number | null =>
  units === 'metric' ? kmh : mapNullable(kmh, kmhToMph)

export const displayRain = (millimeters: number | null, units: DisplayUnits): number | null =>
  units === 'metric' ? millimeters : mapNullable(millimeters, millimetersToInches)

export const displayPressure = (hPa: number | null, units: DisplayUnits): number | null =>
  units === 'metric' ? hPa : mapNullable(hPa, hPaToInHg)
