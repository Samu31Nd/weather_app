/**
 * Viento: rumbo de 16 puntos y escala de Beaufort.
 * Fuente: tabla de Beaufort de la OMM en km/h; docs/04-modelo-dominio.md (reglas de dominio).
 * Requerimientos: RF-APP-01.
 */
import { describe, expect, it } from 'vitest'
import { beaufortFromKmh, compassPointFromDegrees, isCompassPoint } from '../../src/domain/wind'

describe('rumbo de 16 puntos', () => {
  it.each([
    { caso: 'norte exacto', grados: 0, rumbo: 'N' },
    { caso: '360 equivale a norte', grados: 360, rumbo: 'N' },
    { caso: 'límite N/NNE (11.24°)', grados: 11.24, rumbo: 'N' },
    { caso: 'límite N/NNE (11.25°)', grados: 11.25, rumbo: 'NNE' },
    { caso: 'este', grados: 90, rumbo: 'E' },
    { caso: 'lectura del fixture (109°)', grados: 109, rumbo: 'ESE' },
    { caso: 'sur', grados: 180, rumbo: 'S' },
    { caso: 'oeste-noroeste', grados: 292.5, rumbo: 'WNW' },
    { caso: 'ángulo negativo', grados: -90, rumbo: 'W' },
  ])('convierte $grados° en $rumbo: $caso', ({ grados, rumbo }) => {
    expect(compassPointFromDegrees(grados)).toBe(rumbo)
  })

  it('reconoce solo los 16 rumbos válidos', () => {
    expect(isCompassPoint('WSW')).toBe(true)
    expect(isCompassPoint('calma')).toBe(false)
  })
})

describe('escala de Beaufort', () => {
  it.each([
    { kmh: 0, fuerza: 0 }, { kmh: 0.99, fuerza: 0 }, { kmh: 1, fuerza: 1 }, { kmh: 5.9, fuerza: 1 },
    { kmh: 6, fuerza: 2 }, { kmh: 12, fuerza: 3 }, { kmh: 20, fuerza: 4 }, { kmh: 28.9, fuerza: 4 },
    { kmh: 29, fuerza: 5 }, { kmh: 39, fuerza: 6 }, { kmh: 50, fuerza: 7 }, { kmh: 62, fuerza: 8 },
    { kmh: 75, fuerza: 9 }, { kmh: 89, fuerza: 10 }, { kmh: 103, fuerza: 11 }, { kmh: 117.9, fuerza: 11 },
    { kmh: 118, fuerza: 12 }, { kmh: 200, fuerza: 12 },
  ])('$kmh km/h es fuerza $fuerza (límites de la tabla OMM)', ({ kmh, fuerza }) => {
    expect(beaufortFromKmh(kmh)).toBe(fuerza)
  })
})
