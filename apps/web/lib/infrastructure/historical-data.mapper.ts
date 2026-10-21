import type { HistoricalCsvRow, HistoricalDataPoint } from './historical-data.dto'

function parseValue(value: string | undefined | null): number | null {
  if (!value || value === '---' || value === '' || value === 'null') return null
  const parsed = parseFloat(value)
  return isNaN(parsed) ? null : parsed
}

// Parse date from "DD:MM:YYYY" format to "YYYY-MM-DD"
function parseDate(dateStr: string): string {
  if (!dateStr) return ''
  const parts = dateStr.split(':')
  if (parts.length === 3) {
    const [day, month, year] = parts
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  return dateStr
}

export function mapCsvRowToDataPoint(row: HistoricalCsvRow): HistoricalDataPoint {
  // Parse date from DD:MM:YYYY format and time
  const parsedDate = parseDate(row.Date || '')
  const timeStr = row.Time || '00:00'
  const timestamp = new Date(`${parsedDate}T${timeStr}:00`)

  return {
    timestamp,
    date: parsedDate,
    time: timeStr,
    units: {
      temp: row['Temp Units'] || 'C',
      bar: row['Bar Units'] || 'mm',
      wind: row['Wind Units'] || 'km/h',
      rain: row['Rain Units'] || 'mm',
    },
    outdoor: {
      temperature: parseValue(row['Temp Out']),
      highTemp: parseValue(row['Hi Temp']),
      lowTemp: parseValue(row['Low Temp']),
      humidity: parseValue(row['Out Hum']),
    },
    indoor: {
      temperature: parseValue(row['In Temp']),
      humidity: parseValue(row['In Hum']),
    },
    wind: {
      speed: parseValue(row['Wind Speed']),
      direction: row['Wind Dir'] || '',
      highSpeed: parseValue(row['Hi Speed']),
      highDirection: row['Hi Dir'] || '',
    },
    barometer: {
      pressure: parseValue(row['BAR']),
    },
    rain: {
      amount: parseValue(row['Rain']),
      rate: parseValue(row['Rain Rate']),
    },
    solar: {
      radiation: parseValue(row['Solar Rad.']),
      highRadiation: parseValue(row['Hi Solar Rad.']),
      uvIndex: parseValue(row['UV Index']),
      highUv: parseValue(row['Hi UV']),
    },
  }
}

export function mapCsvDataToDataPoints(rows: HistoricalCsvRow[]): HistoricalDataPoint[] {
  return rows
    .map(mapCsvRowToDataPoint)
    .filter(point => !isNaN(point.timestamp.getTime()))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}
