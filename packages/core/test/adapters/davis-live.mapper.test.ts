/**
 * Mapper del dato en vivo (`wflexp.json` → LiveReading) con una lectura real de la consola.
 * Fuente: test/fixtures/wflexp-2026-10-24.json; docs/06-datos.md, rarezas D1 (orden de `hl*`), D3 (presión a
 * nivel del mar), D4 (`bartr`), D10 (`---`) y D12 (reloj de pared correcto, zona horaria en UTC−5).
 * Requerimientos: RF-APP-01, RF-APP-05, RNF-APP-01.
 */
import { describe, expect, it } from 'vitest'
import { mapDavisLive } from '../../src/adapters/davis-live/davis-live.mapper'
import { toMexicoCityWallTime } from '../../src/domain/time'
import { liveFixture } from '../fixtures/load'

describe('mapeo de la lectura real del 24-oct', () => {
  const reading = mapDavisLive(liveFixture())

  it('toma el instante de `loctime` (reloj de pared de CDMX), no de `utctime`, que sale 1 h atrasado', () => {
    expect(reading.observedAt.toISOString()).toBe('2026-10-24T15:59:58.000Z')
  })

  it('convierte las variables a unidades canónicas', () => {
    expect(reading.outdoor.temperatureC).toBeCloseTo(17.83, 2)
    expect(reading.outdoor.humidityPct).toBe(61)
    expect(reading.outdoor.dewPointC).toBeCloseTo(10, 5)
    expect(reading.wind.gustKmh).toBeCloseTo(9.656, 3)
    expect(reading.wind.directionDeg).toBe(109)
    expect(reading.pressure.seaLevelHPa).toBeCloseTo(1029.2, 1)
    expect(reading.rain.rateMmH).toBe(0)
  })

  it('interpreta `bartr = 20` como subiendo lento', () => {
    expect(reading.pressure.trend).toBe('risingSlowly')
  })

  it('lee los extremos en su orden real: hoy, mes y año', () => {
    const t = reading.extremes.outdoorTemperatureC
    expect(t.today.low).toBeCloseTo(10, 5) // 50.0 °F
    expect(t.today.high).toBeCloseTo(18.28, 2) // 64.9 °F
    expect(t.month.high).toBeCloseTo(28.22, 2) // 82.8 °F
    expect(t.month.low).toBeCloseTo(7.83, 2) // 46.1 °F
    expect(t.year.high).toBeCloseTo(33.22, 2) // 91.8 °F
    expect(t.year.low).toBeCloseTo(2.83, 2) // 37.1 °F
  })

  it('lee las horas de los extremos como hora de CDMX (reloj de pared): mínima a las 04:58', () => {
    const lowAt = reading.extremes.outdoorTemperatureC.today.lowAt
    expect(lowAt && toMexicoCityWallTime(lowAt)).toBe('2026-10-24T04:58:00')
  })

  it('corrige amanecer y ocaso, que la consola calcula en UTC−5 (7:35 y 19:08), a hora de CDMX', () => {
    expect(reading.sun.sunrise && toMexicoCityWallTime(reading.sun.sunrise)).toBe('2026-10-24T06:35:00')
    expect(reading.sun.sunset && toMexicoCityWallTime(reading.sun.sunset)).toBe('2026-10-24T18:08:00')
  })

  it('no deja pasar datos internos de red (MAC, IP, SSID)', () => {
    const serialized = JSON.stringify(reading)
    expect(serialized).not.toMatch(/mac|ssid|\bip\b/i)
    expect(Object.keys(reading.station).sort()).toEqual(['batteryVolts', 'name', 'signalDbm', 'uptimeSeconds'])
  })
})

describe('datos ausentes', () => {
  it('convierte `---` y campos faltantes en null, nunca en 0', () => {
    const reading = mapDavisLive({ tempout: '---', bartr: '---', hltempout: ['---'] }, new Date('2026-10-24T15:00:00Z'))
    expect(reading.outdoor.temperatureC).toBeNull()
    expect(reading.outdoor.humidityPct).toBeNull()
    expect(reading.pressure.trend).toBeNull()
    expect(reading.extremes.outdoorTemperatureC.month.high).toBeNull()
    expect(reading.sun.sunrise).toBeNull()
  })

  it('usa el momento de recepción y un nombre genérico si la consola no los da', () => {
    const receivedAt = new Date('2026-10-24T15:00:00Z')
    const reading = mapDavisLive({}, receivedAt)
    expect(reading.observedAt).toEqual(receivedAt)
    expect(reading.station.name).toBe('Estación')
  })
})
