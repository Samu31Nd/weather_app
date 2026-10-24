/**
 * Pruebas de contrato contra las fuentes REALES. No corren en cada PR: `npm run test:contract`.
 * Sirven para detectar cuándo una fuente cambia de forma (y entonces capturar un fixture nuevo).
 * URLs configurables con LIVE_URL e HISTORY_URL; por defecto, la consola y la Cloud Function de producción.
 * Requerimientos: RNF-APP-01.
 */
import { describe, expect, it } from 'vitest'
import { HttpHistoryRepository } from '../../src/adapters/cloud-history/http-history.repository'
import { HttpLiveWeatherRepository } from '../../src/adapters/davis-live/http-live-weather.repository'
import { isPlausibleSeaLevelPressure } from '../../src/domain/pressure'

const LIVE_URL = process.env.LIVE_URL ?? 'http://148.204.57.118/wflexp.json'
const HISTORY_URL = process.env.HISTORY_URL ?? 'https://obtener-datos-clima-nspsuyfpwa-uc.a.run.app/'
const DAY_MS = 86_400_000

describe('contrato de la consola Davis', () => {
  it('entrega una lectura reciente con temperatura y presión plausible', async () => {
    const reading = await new HttpLiveWeatherRepository(LIVE_URL).getCurrent()
    expect(Date.now() - reading.observedAt.getTime()).toBeLessThan(10 * 60_000)
    expect(reading.outdoor.temperatureC).toBeTypeOf('number')
    expect(isPlausibleSeaLevelPressure(reading.pressure.seaLevelHPa ?? 0)).toBe(true)
    expect(reading.sun.sunrise).toBeInstanceOf(Date)
  }, 20_000)
})

describe('contrato de la Cloud Function de histórico', () => {
  it('entrega un día completo de hace 3 días con unas 96 filas', async () => {
    const end = new Date(Math.floor(Date.now() / DAY_MS) * DAY_MS - 2 * DAY_MS + 6 * 3_600_000)
    const samples = await new HttpHistoryRepository(HISTORY_URL).getSamples({ start: new Date(end.getTime() - DAY_MS), end })
    expect(samples.length).toBeGreaterThanOrEqual(90)
    expect(samples.every((s) => s.temperatureC !== null)).toBe(true)
  }, 30_000)
})
