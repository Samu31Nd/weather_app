/**
 * Frase del pronóstico compuesta por partes, en español e inglés, con reglas reales de la consola.
 * Fuente: artboard `Dashboard` (tarjeta del pronóstico: cielo, temperatura, lluvia y viento) y la tabla de 195
 * reglas Davis de @tt/core.
 * Requerimientos: RF-APP-03, RNF-APP-07.
 */
import { decodeForecast } from '@tt/core'
import { describe, expect, it } from 'vitest'
import { CATALOGS, forecastText } from '../src'

const es = (rule: number) => forecastText(decodeForecast(rule), CATALOGS.es)
const en = (rule: number) => forecastText(decodeForecast(rule), CATALOGS.en)

describe('pronóstico en español', () => {
  it('regla 192: nublado, más fresco, posible lluvia fuerte en 12 h y ventoso (ejemplo del diseño)', () => {
    expect(es(192)).toEqual({
      summary: 'Mayormente nublado, más fresco. Lluvia: posible en 12 h, a ratos fuerte. Ventoso.',
      sky: 'Mayormente nublado',
      temperature: 'Más fresco',
      precipitation: 'Posible en 12 h, a ratos fuerte',
      wind: 'Ventoso',
    })
  })

  it('regla 1 (la del fixture): solo el cielo, sin lluvia ni viento', () => {
    expect(es(1)).toMatchObject({ summary: 'Mayormente despejado.', precipitation: 'Sin lluvia', wind: 'Sin cambios', temperature: 'Sin cambios' })
  })

  it('regla 177: ventana "12 a 24 h" y giro del viento', () => {
    expect(es(177)).toMatchObject({ precipitation: 'Posible en 12–24 h', wind: 'Ventoso · giro al O/NO/N' })
  })

  it('regla 70: despejando con lluvia que termina', () => {
    expect(es(70)).toMatchObject({ sky: 'Despejando', precipitation: 'Terminando en 6 h' })
  })

  it('calibrando y no disponible tienen su propio mensaje', () => {
    expect(es(193).summary).toBe('La consola necesita 3 horas de datos recientes para pronosticar.')
    expect(es(400).summary).toBe('Pronóstico no disponible por ahora.')
  })
})

describe('pronóstico en inglés', () => {
  it('regla 192', () => {
    expect(en(192).summary).toBe('Mostly cloudy, cooler. Rain: possible within 12 h, heavy at times. Windy.')
  })

  it('regla 24: viento en aumento', () => {
    expect(en(24)).toMatchObject({ temperature: 'Warmer', wind: 'Increasing winds' })
  })
})
