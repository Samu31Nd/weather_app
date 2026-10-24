/**
 * Sensación térmica, punto de rocío, humedad y confort interior.
 * Fuente: docs/06-datos.md (interpretación de variables) y docs/04-modelo-dominio.md (reglas de dominio).
 * Requerimientos: RF-APP-01, RF-APP-04.
 */
import { describe, expect, it } from 'vitest'
import { dewPointMagnusC, feelsLike, humidityBand, indoorComfort, isNearSaturation } from '../../src/domain/thermal'

describe('sensación térmica', () => {
  it('usa el índice de calor cuando supera a la temperatura', () => {
    expect(feelsLike({ temperatureC: 30, heatIndexC: 33, windChillC: 30 })).toEqual({ valueC: 33, reason: 'heat' })
  })

  it('usa la sensación por viento cuando queda por debajo de la temperatura', () => {
    expect(feelsLike({ temperatureC: 8, heatIndexC: 8, windChillC: 5 })).toEqual({ valueC: 5, reason: 'wind' })
  })

  it('es la temperatura medida si las diferencias son menores a 0.5 °C (caso del fixture)', () => {
    expect(feelsLike({ temperatureC: 17.8, heatIndexC: 17.2, windChillC: 17.8 })).toEqual({ valueC: 17.8, reason: 'none' })
  })

  it('es la temperatura medida si la consola no entrega índices', () => {
    expect(feelsLike({ temperatureC: 20, heatIndexC: null, windChillC: null }).reason).toBe('none')
  })
})

describe('punto de rocío (Magnus)', () => {
  it('da ≈ 10 °C con 17.8 °C y 61 % (la consola reporta 50 °F = 10 °C)', () => {
    expect(dewPointMagnusC(17.83, 61)).toBeCloseTo(10.2, 0)
  })

  it('coincide con la temperatura al 100 % de humedad', () => {
    expect(dewPointMagnusC(15, 100)).toBeCloseTo(15, 6)
  })
})

describe('bandas de humedad', () => {
  it.each([
    { pct: 29, banda: 'dry' }, { pct: 30, banda: 'comfortable' }, { pct: 60, banda: 'comfortable' },
    { pct: 61, banda: 'humid' }, { pct: 80, banda: 'humid' }, { pct: 81, banda: 'veryHumid' },
  ])('$pct % es $banda', ({ pct, banda }) => {
    expect(humidityBand(pct)).toBe(banda)
  })
})

describe('saturación (neblina o rocío probable)', () => {
  it('es cierta cuando temperatura − rocío < 2.5 °C', () => {
    expect(isNearSaturation(12, 10)).toBe(true)
    expect(isNearSaturation(12.5, 10)).toBe(false)
  })
})

describe('confort interior (ASHRAE 55 simplificado)', () => {
  it.each([
    { t: 21, h: 50, esperado: { thermal: 'comfortable', moisture: 'comfortable' } },
    { t: 19.9, h: 39, esperado: { thermal: 'cold', moisture: 'dry' } },
    { t: 24.1, h: 61, esperado: { thermal: 'warm', moisture: 'humid' } },
  ])('$t °C y $h % se clasifican así', ({ t, h, esperado }) => {
    expect(indoorComfort(t, h)).toEqual(esperado)
  })
})
