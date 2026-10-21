export interface WeatherData {
  stnname: string
  mac: string
  ip: string
  ssid: string
  rssi: string
  tempout: string
  humout: string
  tempin: string
  humin: string
  windspd: string
  winddir: string
  gust: string
  bar: string
  bartr: string
  rainr: string
  raind: string
  rain24: string
  rainyear: string
  dew: string
  chill: string
  heat: string
  sunrt: string
  sunst: string
  uptime: string
  lastboot: string
  bat: string
  ver: string
  hlbar?: [string, string, string, string]
  hlwind?: [string, string, string, string]
  hltempout?: [string, string, string, string]
  hlhumout?: [string, string, string, string]
  hltempin?: [string, string, string, string]
  hlhumin?: [string, string, string, string]
}

export function parseWeatherValue(value: string | undefined): number | null {
  if (!value || value === '---' || value === '') return null
  const parsed = parseFloat(value)
  return isNaN(parsed) ? null : parsed
}

export function formatTemperature(
  value: number | null,
  isMetric: boolean
): string {
  if (value === null) return '--'
  if (isMetric) {
    const celsius = ((value - 32) * 5) / 9
    return `${celsius.toFixed(1)}°C`
  }
  return `${value.toFixed(1)}°F`
}

export function formatSpeed(value: number | null, isMetric: boolean): string {
  if (value === null) return '--'
  if (isMetric) {
    const kmh = value * 1.60934
    return `${kmh.toFixed(1)} km/h`
  }
  return `${value.toFixed(1)} mph`
}

export function formatPressure(value: number | null, isMetric: boolean): string {
  if (value === null) return '--'
  if (isMetric) {
    const hpa = value * 33.8639
    return `${hpa.toFixed(0)} hPa`
  }
  return `${value.toFixed(3)} inHg`
}

export function formatRain(value: number | null, isMetric: boolean): string {
  if (value === null) return '--'
  if (isMetric) {
    const mm = value * 25.4
    return `${mm.toFixed(1)} mm`
  }
  return `${value.toFixed(2)} in`
}

export function getWindDirection(degrees: number | null): string {
  if (degrees === null) return '--'
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

export function getBarometerTrend(trend: string | undefined): { label: string; direction: 'up' | 'down' | 'steady' } {
  const trendNum = parseInt(trend || '20')
  if (trendNum < 20) return { label: 'Falling', direction: 'down' }
  if (trendNum > 20) return { label: 'Rising', direction: 'up' }
  return { label: 'Steady', direction: 'steady' }
}
