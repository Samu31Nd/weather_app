/**
 * La lectura en vivo se guarda como texto y se recupera idéntica, con sus fechas como `Date`, para que el widget y
 * la app la vuelvan a dibujar sin red. Un texto dañado o incompleto no da una lectura a medias.
 * Fuente: reporte de uso (el widget quedaba "sin conexión" aunque ya había visto datos); lectura real del 24-oct.
 * Requerimientos: RF-APP-02.
 */
import { describe, expect, it } from 'vitest'
import { mapDavisLive } from '../../src/adapters/davis-live/davis-live.mapper'
import { parseLiveReading, serializeLiveReading } from '../../src/adapters/live-reading-json'
import { liveFixture } from '../fixtures/load'

const reading = mapDavisLive(liveFixture())

describe('lectura en vivo como texto', () => {
  it('vuelve idéntica, con las fechas como Date', () => {
    const restored = parseLiveReading(serializeLiveReading(reading))
    expect(restored).toEqual(reading)
    expect(restored?.observedAt).toBeInstanceOf(Date)
    expect(restored?.sun.sunrise).toBeInstanceOf(Date)
  })

  it('conserva los nulls de fechas que faltan', () => {
    const withoutSun = { ...reading, sun: { sunrise: null, sunset: null } }
    expect(parseLiveReading(serializeLiveReading(withoutSun))?.sun).toEqual({ sunrise: null, sunset: null })
  })

  it.each([
    ['texto que no es JSON', '{roto'],
    ['sin hora de la lectura', JSON.stringify({ ...reading, observedAt: null })],
    ['hora inválida', JSON.stringify({ ...reading, observedAt: 'ayer' })],
    ['formato viejo del widget (solo temperatura)', JSON.stringify({ stationName: 'Liz', temperatureC: 18, observedAt: '2026-10-24T15:00:00Z' })],
  ])('%s da null', (_, raw) => {
    expect(parseLiveReading(raw)).toBeNull()
  })
})
