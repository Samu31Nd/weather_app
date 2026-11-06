/**
 * Descarga de lo que se está viendo: un registro por punto, solo las variables visibles, unidades en el nombre
 * de cada columna, hora de CDMX y huecos como celdas vacías (no ceros).
 * Fuente: artboard `Main` (descarga CSV/JSON: "n puntos × k variables · resolución"); Parquet se pidió después
 * para análisis de datos y se lee de vuelta con `hyparquet`.
 * Requerimientos: RF-APP-09.
 */
import { parquetMetadata, parquetReadObjects } from 'hyparquet'
import { describe, expect, it } from 'vitest'
import { type HistoryExport, exportHistory } from '../../src/application/export-history'
import { buildHistoryView } from '../../src/application/history-view'
import type { HistorySample } from '../../src/domain/history'

const range = { start: new Date('2026-10-19T06:00:00Z'), end: new Date('2026-10-20T06:00:00Z') }
const sample: HistorySample = {
  at: new Date('2026-10-19T16:00:00Z'),
  temperatureC: 15.25, temperatureMaxC: 16, temperatureMinC: 14, indoorTemperatureC: 21, humidityPct: 60, indoorHumidityPct: 50,
  windKmh: 3, gustKmh: 6, windDirection: 'N', gustDirection: 'N', rainMm: 0.2, rainRateMmH: 1, seaLevelPressureHPa: 1027,
}
const view = buildHistoryView([sample], { resolution: '1d', units: 'metric', range })

function text(file: HistoryExport): string {
  if (typeof file.content !== 'string') throw new Error('se esperaba texto')
  return file.content
}

function bytes(file: HistoryExport): ArrayBuffer {
  if (typeof file.content === 'string') throw new Error('se esperaban bytes')
  return file.content.slice().buffer
}

describe('exportar el histórico', () => {
  it('CSV con la hora de CDMX, las variables visibles y la unidad en cada columna', () => {
    const file = exportHistory(view, { format: 'csv', variables: ['temperature', 'rain'], includeIndoor: false })
    const [header, row] = text(file).trim().split('\n')
    expect(header).toBe('time_america_mexico_city,temperature_degC,temperature_min_degC,temperature_max_degC,humidity_pct,rain_mm,rain_rate_max_mm_per_h,rain_cumulative_mm')
    expect(row).toBe('2026-10-19T00:00:00,15.25,14,16,60,0.2,1,0.2')
    expect(file.fileName).toBe('estacion-escom_2026-10-19_2026-10-19_1d.csv')
    expect(file.mimeType).toBe('text/csv')
  })

  it('JSON con los mismos nombres de columna y la resolución', () => {
    const file = exportHistory(view, { format: 'json', variables: ['wind'], includeIndoor: false })
    const parsed = JSON.parse(text(file))
    expect(parsed.resolution).toBe('1d')
    expect(parsed.rows[0]).toEqual({ time_america_mexico_city: '2026-10-19T00:00:00', 'wind_km_per_h': 3, 'gust_km_per_h': 6 })
  })

  it('un intervalo sin datos queda vacío, no en cero', () => {
    const hourly = buildHistoryView([sample], { resolution: '1h', units: 'metric', range })
    const lines = text(exportHistory(hourly, { format: 'csv', variables: ['pressure'], includeIndoor: false })).trim().split('\n')
    expect(lines).toHaveLength(25)
    expect(lines[1]).toBe('2026-10-19T00:00:00,,,')
  })

  it('agrega las columnas de interior solo si se muestran', () => {
    const file = exportHistory(view, { format: 'csv', variables: ['temperature'], includeIndoor: true })
    expect(text(file).split('\n')[0]).toContain('indoor_temperature_degC,indoor_humidity_pct')
  })

  it('Parquet con las mismas columnas, la hora en UTC como TIMESTAMP y la resolución en los metadatos', async () => {
    const file = exportHistory(view, { format: 'parquet', variables: ['temperature'], includeIndoor: false })
    expect(file.fileName).toBe('estacion-escom_2026-10-19_2026-10-19_1d.parquet')
    expect(file.mimeType).toBe('application/vnd.apache.parquet')
    const rows = await parquetReadObjects({ file: bytes(file) })
    expect(rows).toEqual([{
      time_america_mexico_city: '2026-10-19T00:00:00', time_utc: new Date('2026-10-19T06:00:00Z'),
      temperature_degC: 15.25, temperature_min_degC: 14, temperature_max_degC: 16, humidity_pct: 60,
    }])
    const metadata = parquetMetadata(bytes(file)).key_value_metadata
    expect(metadata).toEqual(expect.arrayContaining([{ key: 'resolution', value: '1d' }, { key: 'units', value: 'metric' }]))
  })

  it('en Parquet un intervalo sin datos queda como null', async () => {
    const hourly = buildHistoryView([sample], { resolution: '1h', units: 'metric', range })
    const rows = await parquetReadObjects({ file: bytes(exportHistory(hourly, { format: 'parquet', variables: ['pressure'], includeIndoor: false })) })
    expect(rows).toHaveLength(24)
    expect(rows[0]?.pressure_sea_level_hPa).toBeNull()
  })
})
