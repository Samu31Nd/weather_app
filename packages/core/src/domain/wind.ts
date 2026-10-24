// Viento: rumbo de 16 puntos y escala de Beaufort (OMM), sobre velocidades en km/h.

export const COMPASS_POINTS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
] as const

export type CompassPoint = (typeof COMPASS_POINTS)[number]

export type BeaufortForce = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

/** Por debajo de esta velocidad (km/h) el viento se considera calma (Beaufort 0). */
export const CALM_THRESHOLD_KMH = 1

// Límite inferior en km/h de cada fuerza 1..12 según la tabla de la OMM.
const BEAUFORT_LOWER_BOUNDS_KMH = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118] as const

export function compassPointFromDegrees(degrees: number): CompassPoint {
  const normalized = ((degrees % 360) + 360) % 360
  return COMPASS_POINTS[Math.round(normalized / 22.5) % COMPASS_POINTS.length] as CompassPoint
}

export function isCompassPoint(value: string): value is CompassPoint {
  return (COMPASS_POINTS as readonly string[]).includes(value)
}

export function beaufortFromKmh(speedKmh: number): BeaufortForce {
  const force = BEAUFORT_LOWER_BOUNDS_KMH.filter((lowerBound) => speedKmh >= lowerBound).length
  return force as BeaufortForce
}
