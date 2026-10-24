/**
 * Conversiones de unidades.
 * Fuente: docs/04-modelo-dominio.md (unidad canónica métrica) y factores oficiales (NIST).
 * Requerimientos: RNF-APP-01, RF-APP-10.
 */
import { describe, expect, it } from 'vitest'
import {
  celsiusToFahrenheit, fahrenheitToCelsius, hPaToInHg, hPaToMmHg, inHgToHPa, inchesToMillimeters,
  kmhToMph, mapNullable, millimetersToInches, mmHgToHPa, mphToKmh,
} from '../../src/domain/units'

describe('conversiones de unidades', () => {
  it.each([
    { caso: 'punto de congelación', f: 32, c: 0 },
    { caso: 'ebullición', f: 212, c: 100 },
    { caso: 'lectura real del fixture (64.1 °F)', f: 64.1, c: 17.833 },
  ])('convierte °F a °C: $caso', ({ f, c }) => {
    expect(fahrenheitToCelsius(f)).toBeCloseTo(c, 3)
    expect(celsiusToFahrenheit(c)).toBeCloseTo(f, 2)
  })

  it('convierte mph a km/h con la milla internacional y de regreso', () => {
    expect(mphToKmh(10)).toBeCloseTo(16.09344, 5)
    expect(kmhToMph(mphToKmh(7.3))).toBeCloseTo(7.3, 10)
  })

  it('convierte pulgadas de lluvia a mm (resolución del pluviómetro: 0.01 in = 0.254 mm)', () => {
    expect(inchesToMillimeters(0.01)).toBeCloseTo(0.254, 6)
    expect(millimetersToInches(25.4)).toBeCloseTo(1, 10)
  })

  it('convierte presión: 30.43 inHg ≈ 1030.5 hPa y 770.9 mmHg ≈ 1027.8 hPa', () => {
    expect(inHgToHPa(30.43)).toBeCloseTo(1030.48, 1)
    expect(mmHgToHPa(770.9)).toBeCloseTo(1027.78, 1)
    expect(hPaToInHg(inHgToHPa(29.92))).toBeCloseTo(29.92, 10)
    expect(hPaToMmHg(mmHgToHPa(760))).toBeCloseTo(760, 10)
  })

  it('no convierte "sin dato" en cero', () => {
    expect(mapNullable(null, fahrenheitToCelsius)).toBeNull()
    expect(mapNullable(32, fahrenheitToCelsius)).toBe(0)
  })
})
