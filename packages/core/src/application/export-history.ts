// Descarga de lo que se está viendo (RF-APP-09): un registro por punto de la resolución elegida (a 15 min, uno
// por lectura) con las variables visibles. Cada columna lleva su unidad en el nombre, y la hora va en hora de
// pared de Ciudad de México con la zona explícita. Parquet (para pandas, DuckDB, Spark…) lleva además la hora como
// TIMESTAMP en UTC y las cifras como DOUBLE; `hyparquet-writer` es JS puro, así que corre igual en el navegador y en
// Hermes (Metro lo resuelve con la condición `browser`; ver `apps/mobile/metro.config.js`).

import { parquetWriteBuffer } from 'hyparquet-writer'
import { type DisplayUnits, UNIT_SYMBOLS } from '../domain/display-units'
import { toMexicoCityWallTime } from '../domain/time'
import type { HistoryBucket, HistoryView } from './history-view'

export const HISTORY_VARIABLES = ['temperature', 'wind', 'rain', 'pressure'] as const
export type HistoryVariable = (typeof HISTORY_VARIABLES)[number]

export const EXPORT_FORMATS = ['csv', 'json', 'parquet'] as const
export type ExportFormat = (typeof EXPORT_FORMATS)[number]

interface Column {
  readonly name: string
  readonly value: (bucket: HistoryBucket) => number | null
}

/** Nombres de columna estables (en inglés, sin espacios) para que otras herramientas los lean igual. */
function columnsFor(variables: readonly HistoryVariable[], units: DisplayUnits, includeIndoor: boolean): Column[] {
  const symbol = UNIT_SYMBOLS[units]
  const unit = (s: string) => s.replace('°', 'deg').replace('/', '_per_').replace(/\s+/g, '')
  const t = unit(symbol.temperature)
  const columns: Record<HistoryVariable, Column[]> = {
    temperature: [
      { name: `temperature_${t}`, value: (b) => b.temperature?.mean ?? null },
      { name: `temperature_min_${t}`, value: (b) => b.temperature?.min ?? null },
      { name: `temperature_max_${t}`, value: (b) => b.temperature?.max ?? null },
      { name: 'humidity_pct', value: (b) => b.humidity },
      ...(includeIndoor
        ? [
            { name: `indoor_temperature_${t}`, value: (b: HistoryBucket) => b.indoorTemperature },
            { name: 'indoor_humidity_pct', value: (b: HistoryBucket) => b.indoorHumidity },
          ]
        : []),
    ],
    wind: [
      { name: `wind_${unit(symbol.speed)}`, value: (b) => b.wind },
      { name: `gust_${unit(symbol.speed)}`, value: (b) => b.gust },
    ],
    rain: [
      { name: `rain_${unit(symbol.rain)}`, value: (b) => b.rain },
      { name: `rain_rate_max_${unit(symbol.rainRate)}`, value: (b) => b.rainRate },
      { name: `rain_cumulative_${unit(symbol.rain)}`, value: (b) => (b.empty ? null : b.cumulativeRain) },
    ],
    pressure: [
      { name: `pressure_sea_level_${unit(symbol.pressure)}`, value: (b) => b.pressure?.mean ?? null },
      { name: `pressure_min_${unit(symbol.pressure)}`, value: (b) => b.pressure?.min ?? null },
      { name: `pressure_max_${unit(symbol.pressure)}`, value: (b) => b.pressure?.max ?? null },
    ],
  }
  return HISTORY_VARIABLES.filter((v) => variables.includes(v)).flatMap((v) => columns[v])
}

const TIME_COLUMN = 'time_america_mexico_city'
const UTC_TIME_COLUMN = 'time_utc'
const round = (value: number | null) => (value === null ? null : Math.round(value * 100) / 100)

export interface HistoryExport {
  readonly fileName: string
  readonly mimeType: string
  /** Texto en CSV y JSON; bytes en Parquet. */
  readonly content: string | Uint8Array
}

export function exportHistory(
  view: HistoryView,
  options: { format: ExportFormat; variables: readonly HistoryVariable[]; includeIndoor: boolean },
): HistoryExport {
  const columns = columnsFor(options.variables, view.units, options.includeIndoor)
  const rows = view.buckets.map((bucket) => [toMexicoCityWallTime(bucket.start), ...columns.map((c) => round(c.value(bucket)))] as const)
  const day = (date: Date) => toMexicoCityWallTime(date).slice(0, 10)
  const lastDay = new Date(view.range.end.getTime() - 1)
  const fileName = `estacion-escom_${day(view.range.start)}_${day(lastDay)}_${view.resolution}.${options.format}`

  if (options.format === 'parquet') {
    const buffer = parquetWriteBuffer({
      columnData: [
        { name: TIME_COLUMN, type: 'STRING', data: rows.map(([time]) => time) },
        { name: UTC_TIME_COLUMN, type: 'TIMESTAMP', data: view.buckets.map((bucket) => bucket.start) },
        ...columns.map((c, i) => ({ name: c.name, type: 'DOUBLE' as const, data: rows.map((row) => row[i + 1] as number | null) })),
      ],
      kvMetadata: [
        { key: 'resolution', value: view.resolution },
        { key: 'units', value: view.units },
      ],
    })
    return { fileName, mimeType: 'application/vnd.apache.parquet', content: new Uint8Array(buffer) }
  }
  if (options.format === 'json') {
    const records = rows.map(([time, ...values]) => Object.fromEntries([[TIME_COLUMN, time], ...columns.map((c, i) => [c.name, values[i]])]))
    return { fileName, mimeType: 'application/json', content: JSON.stringify({ resolution: view.resolution, units: view.units, rows: records }, null, 2) }
  }
  const header = [TIME_COLUMN, ...columns.map((c) => c.name)].join(',')
  const lines = rows.map((row) => row.map((value) => (value === null ? '' : String(value))).join(','))
  return { fileName, mimeType: 'text/csv', content: [header, ...lines].join('\n') + '\n' }
}
