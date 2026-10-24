/**
 * Hora de Ciudad de México, reloj de la consola y fases del sol.
 * Fuente: docs/06-datos.md, rarezas D9 (fecha + hora del histórico) y D12 (la consola calcula el sol en UTC−5
 * aunque CDMX es UTC−6); nota `skyMap` del canvas (±50 min de crepúsculo).
 * Requerimientos: RF-APP-01, RF-APP-03, RF-APP-06.
 */
import { describe, expect, it } from 'vitest'
import { dayPhase, solarNoon, sunProgress } from '../../src/domain/sun'
import {
  consoleClockToInstant, instantFromMexicoCityEpochWallTime, instantFromMexicoCityWallTime, parseClockTime, toMexicoCityWallTime,
} from '../../src/domain/time'

describe('hora de pared de Ciudad de México (UTC−6, sin horario de verano)', () => {
  it('convierte fecha + hora del histórico en el instante correcto', () => {
    expect(instantFromMexicoCityWallTime('2026-10-19T00:00:00.000Z', '23:45:00').toISOString()).toBe('2026-10-20T05:45:00.000Z')
  })

  it('interpreta `loctime` como hora de pared de CDMX', () => {
    expect(instantFromMexicoCityEpochWallTime(1792835998).toISOString()).toBe('2026-10-24T15:59:58.000Z')
  })

  it('formatea un instante como hora de pared y es el inverso de la conversión anterior', () => {
    const instant = new Date('2026-10-19T14:00:00Z')
    expect(toMexicoCityWallTime(instant)).toBe('2026-10-19T08:00:00')
    expect(instantFromMexicoCityWallTime('2026-10-19', '08:00:00')).toEqual(instant)
  })
})

describe('horas del reloj de la consola', () => {
  it.each([
    { valor: '7:35', minutos: 455 },
    { valor: '19:08', minutos: 1148 },
    { valor: '0:00', minutos: 0 },
    { valor: '--:--', minutos: null },
    { valor: '24:00', minutos: null },
    { valor: undefined, minutos: null },
  ])('lee "$valor" como $minutos minutos', ({ valor, minutos }) => {
    expect(parseClockTime(valor)).toBe(minutos)
  })

  it('convierte una hora dada en UTC−5 (amanecer de la consola, "7:35") a las 06:35 de CDMX', () => {
    const observedAt = new Date('2026-10-24T14:59:58Z')
    const sunrise = consoleClockToInstant('7:35', observedAt, -300)
    expect(sunrise?.toISOString()).toBe('2026-10-24T12:35:00.000Z')
    expect(toMexicoCityWallTime(sunrise as Date)).toBe('2026-10-24T06:35:00')
  })

  it('usa el día de la consola aunque en UTC ya sea el día siguiente', () => {
    const observedAt = new Date('2026-10-25T03:30:00Z') // 22:30 en la consola (UTC−5)
    expect(consoleClockToInstant('19:08', observedAt, -300)?.toISOString()).toBe('2026-10-25T00:08:00.000Z')
  })

  it('devuelve null si la hora no es válida', () => {
    expect(consoleClockToInstant('---', new Date(), -300)).toBeNull()
  })
})

describe('fases del sol', () => {
  const sun = { sunrise: new Date('2026-10-24T12:35:00Z'), sunset: new Date('2026-10-25T00:08:00Z') }
  const at = (iso: string) => new Date(iso)

  it('calcula el mediodía solar como el punto medio entre amanecer y ocaso', () => {
    expect(solarNoon(sun).toISOString()).toBe('2026-10-24T18:21:30.000Z')
  })

  it.each([
    { caso: '50 min antes del amanecer', hora: '2026-10-24T11:45:00Z', fase: 'dawn' },
    { caso: '51 min antes del amanecer', hora: '2026-10-24T11:44:00Z', fase: 'night' },
    { caso: '50 min después del amanecer', hora: '2026-10-24T13:25:00Z', fase: 'dawn' },
    { caso: 'mediodía', hora: '2026-10-24T18:00:00Z', fase: 'day' },
    { caso: 'justo al ocaso', hora: '2026-10-25T00:08:00Z', fase: 'dusk' },
    { caso: 'noche cerrada', hora: '2026-10-25T03:00:00Z', fase: 'night' },
  ])('$caso es $fase', ({ hora, fase }) => {
    expect(dayPhase(at(hora), sun)).toBe(fase)
  })

  it('da el avance del sol entre 0 y 1 durante el día y null de noche', () => {
    expect(sunProgress(sun.sunrise, sun)).toBe(0)
    expect(sunProgress(solarNoon(sun), sun)).toBeCloseTo(0.5, 10)
    expect(sunProgress(sun.sunset, sun)).toBe(1)
    expect(sunProgress(at('2026-10-25T03:00:00Z'), sun)).toBeNull()
  })
})
