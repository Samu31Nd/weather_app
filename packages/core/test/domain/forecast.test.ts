/**
 * Pronóstico de la consola (`forrule`) descompuesto en partes.
 * Fuente: tabla de 195 reglas Davis (src/domain/forecast-rules.ts) y docs/06-datos.md (escena del cielo).
 * Requerimientos: RF-APP-03.
 */
import { describe, expect, it } from 'vitest'
import { CALIBRATING_RULE, decodeForecast } from '../../src/domain/forecast'
import { DAVIS_FORECAST_RULES } from '../../src/domain/forecast-rules'

describe('decodificación del pronóstico', () => {
  it('tiene las 195 reglas y todas, salvo la 193, se descomponen en un cielo conocido', () => {
    expect(DAVIS_FORECAST_RULES).toHaveLength(195)
    for (let rule = 0; rule < 195; rule++) {
      if (rule === CALIBRATING_RULE) continue
      expect(decodeForecast(rule).kind, `regla ${rule}`).toBe('forecast')
    }
  })

  it('reconoce la calibración (193) y lo fuera de rango como no disponible', () => {
    expect(decodeForecast(193)).toEqual({ kind: 'calibrating', rule: 193 })
    expect(decodeForecast(195)).toEqual({ kind: 'unavailable' })
    expect(decodeForecast(-1)).toEqual({ kind: 'unavailable' })
    expect(decodeForecast(null)).toEqual({ kind: 'unavailable' })
  })

  it('descompone la regla 192 (cielo, temperatura, lluvia fuerte posible en 12 h y viento)', () => {
    expect(decodeForecast(192)).toMatchObject({
      sky: 'mostlyCloudy',
      temperature: 'cooler',
      precipitation: { outlook: 'possible', windowHours: '12', possiblyHeavy: true },
      wind: { windy: true, increasing: false, shiftToWestOrNorth: false },
    })
  })

  it('descompone la regla 1 del fixture (despejado sin cambios ni lluvia)', () => {
    expect(decodeForecast(1)).toMatchObject({ sky: 'mostlyClear', temperature: 'littleChange', precipitation: null })
  })

  it.each([
    { regla: 70, esperado: { sky: 'clearing', temperature: 'cooler', precipitation: { outlook: 'ending', windowHours: '6' } } },
    { regla: 184, esperado: { precipitation: { outlook: 'continuing' } } },
    { regla: 189, esperado: { precipitation: { outlook: 'likely' } } },
    { regla: 181, esperado: { precipitation: { windowHours: '6 to 12', possiblyHeavy: true }, wind: { shiftToWestOrNorth: true } } },
    { regla: 187, esperado: { wind: { windy: true, shiftToWestOrNorth: true } } },
    { regla: 24, esperado: { sky: 'mostlyClear', temperature: 'warmer', wind: { increasing: true } } },
    { regla: 12, esperado: { sky: 'increasingClouds', precipitation: { windowHours: '24 to 48' } } },
  ])('descompone la regla $regla', ({ regla, esperado }) => {
    expect(decodeForecast(regla)).toMatchObject(esperado)
  })
})
