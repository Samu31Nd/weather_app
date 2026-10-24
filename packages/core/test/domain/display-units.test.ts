/**
 * Conversión a las unidades elegidas, solo para mostrar.
 * Fuente: docs/04-modelo-dominio.md (unidad canónica métrica; imperial solo en pantalla).
 * Requerimientos: RF-APP-10.
 */
import { describe, expect, it } from 'vitest'
import {
  UNIT_SYMBOLS, displayPressure, displayRain, displaySpeed, displayTemperature, displayTemperatureDelta,
} from '../../src/domain/display-units'

describe('unidades de pantalla', () => {
  it('deja los valores métricos tal cual', () => {
    expect([displayTemperature(20, 'metric'), displaySpeed(10, 'metric'), displayRain(2, 'metric'), displayPressure(1013, 'metric')]).toEqual([20, 10, 2, 1013])
  })

  it('convierte a imperial', () => {
    expect(displayTemperature(20, 'imperial')).toBeCloseTo(68, 10)
    expect(displaySpeed(16.09344, 'imperial')).toBeCloseTo(10, 10)
    expect(displayRain(25.4, 'imperial')).toBeCloseTo(1, 10)
    expect(displayPressure(1013.25, 'imperial')).toBeCloseTo(29.92, 2)
  })

  it('convierte diferencias de temperatura sin sumar 32', () => {
    expect(displayTemperatureDelta(5, 'imperial')).toBe(9)
    expect(displayTemperatureDelta(5, 'metric')).toBe(5)
  })

  it('no inventa datos: null sigue siendo null', () => {
    expect(displayTemperature(null, 'imperial')).toBeNull()
  })

  it('tiene los símbolos de cada sistema', () => {
    expect(UNIT_SYMBOLS.metric.pressure).toBe('hPa')
    expect(UNIT_SYMBOLS.imperial.speed).toBe('mph')
  })
})
