/**
 * Descarga de lo que se está viendo: un registro por punto, solo las variables visibles, unidades en el nombre
 * de cada columna, hora de CDMX y huecos como celdas vacías (no ceros).
 * Fuente: artboard `Main` (descarga CSV/JSON: "n puntos × k variables · resolución").
 * Requerimientos: RF-APP-09.
 */
import { describe, expect, it } from 'vitest'
import { exportHistory } from '../../src/application/export-history'
import { buildHistoryView } from '../../src/application/history-view'
import type { HistorySample } from '../../src/domain/history'

const range = { start: new Date('2026-10-19T06:00:00Z'), end: new Date('2026-10-20T06:00:00Z') }
const sample: HistorySample = {
  at: new Date('2026-10-19T16:00:00Z'),
  temperatureC: 15.25, temperatureMaxC: 16, temperatureMinC: 14, indoorTemperatureC: 21, humidityPct: 60, indoorHumidityPct: 50,
  windKmh: 3, gustKmh: 6, windDirection: 'N', gustDirection: 'N', rainMm: 0.2, rainRateMmH: 1, seaLevelPressureHPa: 1027,
}
const view = buildHistoryView([sample], { resolution: '1d', units: 'metric', range })

describe('exportar el histórico', () => {
  it('CSV con la hora de CDMX, las variables visibles y la unidad en cada columna', () => {
    const file = exportHistory(view, { format: 'csv', variables: ['temperature', 'rain'], includeIndoor: false })
    const [header, row] = file.content.trim().split('\n')
    expect(header).toBe('time_america_mexico_city,temperature_degC,temperature_min_degC,temperature_max_degC,humidity_pct,rain_mm,rain_rate_max_mm_per_h,rain_cumulative_mm')
    expect(row).toBe('2026-10-19T00:00:00,15.25,14,16,60,0.2,1,0.2')
    expect(file.fileName).toBe('estacion-escom_2026-10-19_2026-10-19_1d.csv')
    expect(file.mimeType).toBe('text/csv')
  })

  it('JSON con los mismos nombres de columna y la resolución', () => {
    const file = exportHistory(view, { format: 'json', variables: ['wind'], includeIndoor: false })
    const parsed = JSON.parse(file.content)
    expect(parsed.resolution).toBe('1d')
    expect(parsed.rows[0]).toEqual({ time_america_mexico_city: '2026-10-19T00:00:00', 'wind_km_per_h': 3, 'gust_km_per_h': 6 })
  })

  it('un intervalo sin datos queda vacío, no en cero', () => {
    const hourly = buildHistoryView([sample], { resolution: '1h', units: 'metric', range })
    const lines = exportHistory(hourly, { format: 'csv', variables: ['pressure'], includeIndoor: false }).content.trim().split('\n')
    expect(lines).toHaveLength(25)
    expect(lines[1]).toBe('2026-10-19T00:00:00,,,')
  })

  it('agrega las columnas de interior solo si se muestran', () => {
    const file = exportHistory(view, { format: 'csv', variables: ['temperature'], includeIndoor: true })
    expect(file.content.split('\n')[0]).toContain('indoor_temperature_degC,indoor_humidity_pct')
  })
})
