// Sensación térmica, punto de rocío y confort: reglas de interpretación (RF-APP-01, RF-APP-04).

export type FeelsLikeReason = 'heat' | 'wind' | 'none'

export interface FeelsLike {
  readonly valueC: number
  readonly reason: FeelsLikeReason
}

/** Diferencia mínima (°C) para decir que la sensación se aparta de la temperatura medida. */
const NOTICEABLE_DIFFERENCE_C = 0.5

export function feelsLike(input: {
  temperatureC: number
  heatIndexC: number | null
  windChillC: number | null
}): FeelsLike {
  const { temperatureC, heatIndexC, windChillC } = input
  if (heatIndexC !== null && heatIndexC - temperatureC >= NOTICEABLE_DIFFERENCE_C) {
    return { valueC: heatIndexC, reason: 'heat' }
  }
  if (windChillC !== null && temperatureC - windChillC >= NOTICEABLE_DIFFERENCE_C) {
    return { valueC: windChillC, reason: 'wind' }
  }
  return { valueC: temperatureC, reason: 'none' }
}

/** Punto de rocío con la aproximación de Magnus; solo se usa si la consola no lo entrega. */
export function dewPointMagnusC(temperatureC: number, relativeHumidityPct: number): number {
  const a = 17.62
  const b = 243.12
  const gamma = Math.log(relativeHumidityPct / 100) + (a * temperatureC) / (b + temperatureC)
  return (b * gamma) / (a - gamma)
}

export type HumidityBand = 'dry' | 'comfortable' | 'humid' | 'veryHumid'

export function humidityBand(relativeHumidityPct: number): HumidityBand {
  if (relativeHumidityPct < 30) return 'dry'
  if (relativeHumidityPct <= 60) return 'comfortable'
  if (relativeHumidityPct <= 80) return 'humid'
  return 'veryHumid'
}

/** Diferencia temperatura − rocío por debajo de la cual hay neblina o rocío probable (nota `skyMap`). */
export const FOG_DEW_POINT_SPREAD_C = 2.5

export function isNearSaturation(temperatureC: number, dewPointC: number): boolean {
  return temperatureC - dewPointC < FOG_DEW_POINT_SPREAD_C
}

export interface IndoorComfort {
  readonly thermal: 'cold' | 'comfortable' | 'warm'
  readonly moisture: 'dry' | 'comfortable' | 'humid'
}

// Zona de confort simplificada de ASHRAE 55: 20–24 °C y 40–60 % de humedad relativa.
export function indoorComfort(temperatureC: number, relativeHumidityPct: number): IndoorComfort {
  const thermal = temperatureC < 20 ? 'cold' : temperatureC > 24 ? 'warm' : 'comfortable'
  const moisture = relativeHumidityPct < 40 ? 'dry' : relativeHumidityPct > 60 ? 'humid' : 'comfortable'
  return { thermal, moisture }
}
