/**
 * Mapper del histórico (fila de `vw_clean_weather` → HistorySample) con un día real.
 * Fuente: test/fixtures/clean-weather-2026-10-19.json; docs/06-datos.md, rarezas D2 (mmHg), D5 (direcciones
 * tal cual) y D9 (fecha + hora de CDMX).
 * Requerimientos: RF-APP-06, RNF-APP-01.
 */
import { describe, expect, it } from 'vitest'
import { mapCleanWeatherRow } from '../../src/adapters/cloud-history/cloud-history.mapper'
import { toMexicoCityWallTime } from '../../src/domain/time'
import { historyFixture } from '../fixtures/load'

describe('mapeo del día real 2026-10-19', () => {
  const samples = historyFixture().data.map(mapCleanWeatherRow)

  it('mapea las 96 filas con su instante en hora de CDMX', () => {
    expect(samples).toHaveLength(96)
    expect(toMexicoCityWallTime(samples[0]!.at)).toBe('2026-10-19T23:45:00')
    expect(toMexicoCityWallTime(samples.at(-1)!.at)).toBe('2026-10-19T00:00:00')
  })

  it('convierte el texto a números y la presión de mmHg a hPa', () => {
    const last = samples[0]!
    expect(last.temperatureC).toBe(13)
    expect(last.humidityPct).toBe(81)
    expect(last.windKmh).toBe(1.6)
    expect(last.gustKmh).toBe(11.3)
    expect(last.seaLevelPressureHPa).toBeCloseTo(1027.78, 1) // 770.9 mmHg
  })

  it('conserva los extremos del día (primera vez: 25 °C a las 16:00 y 12 °C a las 06:15)', () => {
    const chronological = [...samples].sort((a, b) => a.at.getTime() - b.at.getTime())
    const temperatures = chronological.map((s) => s.temperatureC ?? Number.NaN)
    const firstAt = (value: number) => chronological[temperatures.indexOf(value)]!
    const max = firstAt(Math.max(...temperatures))
    const min = firstAt(Math.min(...temperatures))
    expect([max.temperatureC, toMexicoCityWallTime(max.at).slice(11, 16)]).toEqual([25, '16:00'])
    expect([min.temperatureC, toMexicoCityWallTime(min.at).slice(11, 16)]).toEqual([12, '06:15'])
  })

  it('lee las direcciones como rumbos de 16 puntos y la calma o un valor raro como null', () => {
    expect(samples[0]!.windDirection).toBe('S')
    const calm = mapCleanWeatherRow({ ...historyFixture().data[0]!, wind_dir: null, hi_dir: '---' })
    expect(calm.windDirection).toBeNull()
    expect(calm.gustDirection).toBeNull()
  })
})
