/**
 * Avance de la pantalla de carga: pasos, porcentaje, estado de cada variable, lluvia y giro del anemómetro.
 * Fuente: artboards `LoadingWeb` y `LoadingMobile` (pasos "Conectando…" → "¡Listo!", chips por variable).
 * Requerimientos: RF-APP-02.
 */
import { describe, expect, it } from 'vitest'
import { LOADING_DONE_STEP, LOADING_LAST_WAITING_STEP, loadingProgress } from '../../src'

describe('pantalla de carga', () => {
  it('al empezar todo espera y el anemómetro gira lento', () => {
    expect(loadingProgress(0, false)).toEqual({
      step: 0,
      percent: 0,
      variables: { temp: 'waiting', wind: 'waiting', rain: 'waiting', pres: 'waiting' },
      rainVisible: false,
      spinMs: 1600,
    })
  })

  it('cada paso recibe una variable y marca la anterior como recibida', () => {
    expect(loadingProgress(2, false).variables).toEqual({ temp: 'received', wind: 'receiving', rain: 'waiting', pres: 'waiting' })
    expect(loadingProgress(2, false).spinMs).toBe(900)
  })

  it('sin respuesta no pasa de "Recibiendo presión…", y ahí ya llueve en la ilustración', () => {
    const waiting = loadingProgress(99, false)
    expect(waiting.step).toBe(LOADING_LAST_WAITING_STEP)
    expect(waiting.percent).toBe(80)
    expect(waiting.rainVisible).toBe(true)
  })

  it('al llegar el dato se completa todo, sea cual sea el paso', () => {
    const done = loadingProgress(1, true)
    expect(done.step).toBe(LOADING_DONE_STEP)
    expect(done.percent).toBe(100)
    expect(Object.values(done.variables).every((state) => state === 'received')).toBe(true)
    expect(done.spinMs).toBe(2600)
  })
})
