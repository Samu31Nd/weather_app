/**
 * Presión: código de tendencia Davis y rango plausible.
 * Fuente: docs/06-datos.md, rarezas D3 (presión a nivel del mar, 740–790 mmHg) y D4 (`bartr` es un código).
 * Corrige un bug previo: la web trataba `bartr = 0` (estable) como "bajando" y el móvil convertía 0 en 20.
 * Requerimientos: RF-APP-01, RNF-APP-01.
 */
import { describe, expect, it } from 'vitest'
import { isPlausibleSeaLevelPressure, pressureTrendFromChange, pressureTrendFromDavisCode } from '../../src/domain/pressure'
import { mmHgToHPa } from '../../src/domain/units'

describe('tendencia de presión (código Davis)', () => {
  it.each([
    { codigo: -60, tendencia: 'fallingRapidly' },
    { codigo: -20, tendencia: 'fallingSlowly' },
    { codigo: 0, tendencia: 'steady' },
    { codigo: 20, tendencia: 'risingSlowly' },
    { codigo: 60, tendencia: 'risingRapidly' },
  ])('traduce $codigo como $tendencia', ({ codigo, tendencia }) => {
    expect(pressureTrendFromDavisCode(codigo)).toBe(tendencia)
  })

  it('trata cualquier otro código, o la falta de dato, como sin dato', () => {
    expect(pressureTrendFromDavisCode(5)).toBeNull()
    expect(pressureTrendFromDavisCode(null)).toBeNull()
  })
})

describe('rango plausible de presión a nivel del mar', () => {
  it('acepta 740–790 mmHg y rechaza la lectura sin corregir de antes del 20-oct (≈ 578 mmHg)', () => {
    expect(isPlausibleSeaLevelPressure(mmHgToHPa(770.9))).toBe(true)
    expect(isPlausibleSeaLevelPressure(mmHgToHPa(740))).toBe(true)
    expect(isPlausibleSeaLevelPressure(mmHgToHPa(790))).toBe(true)
    expect(isPlausibleSeaLevelPressure(mmHgToHPa(578))).toBe(false)
  })
})

describe('tendencia por el cambio en 3 h (histórico)', () => {
  it.each([
    [-2.5, 'fallingRapidly'], [-1, 'fallingSlowly'], [0.3, 'steady'], [0.7, 'risingSlowly'], [2, 'risingRapidly'],
  ] as const)('%s hPa → %s, con los umbrales Davis', (change, trend) => {
    expect(pressureTrendFromChange(change)).toBe(trend)
  })
})
