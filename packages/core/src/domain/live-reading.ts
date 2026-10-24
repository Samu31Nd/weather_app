// Lectura en vivo de la consola, ya en unidades canónicas (°C, km/h, mm, hPa). `null` = sin dato.

import type { PressureTrend } from './pressure'

export interface Extremes {
  readonly today: { readonly low: number | null; readonly high: number | null; readonly lowAt: Date | null; readonly highAt: Date | null }
  readonly month: { readonly low: number | null; readonly high: number | null }
  readonly year: { readonly low: number | null; readonly high: number | null }
}

export interface LiveReading {
  readonly observedAt: Date
  readonly station: {
    readonly name: string
    readonly batteryVolts: number | null
    readonly signalDbm: number | null
    readonly uptimeSeconds: number | null
  }
  readonly outdoor: {
    readonly temperatureC: number | null
    readonly humidityPct: number | null
    readonly dewPointC: number | null
    readonly heatIndexC: number | null
    readonly windChillC: number | null
  }
  readonly indoor: {
    readonly temperatureC: number | null
    readonly humidityPct: number | null
  }
  readonly wind: {
    readonly speedKmh: number | null
    readonly avg2MinKmh: number | null
    readonly avg10MinKmh: number | null
    readonly gustKmh: number | null
    readonly directionDeg: number | null
    readonly gustDirectionDeg: number | null
  }
  readonly pressure: {
    readonly seaLevelHPa: number | null
    readonly trend: PressureTrend | null
  }
  readonly rain: {
    readonly rateMmH: number | null
    readonly last15MinMm: number | null
    readonly lastHourMm: number | null
    readonly todayMm: number | null
    readonly last24hMm: number | null
    readonly stormMm: number | null
    readonly monthMm: number | null
    readonly yearMm: number | null
  }
  readonly sun: {
    readonly sunrise: Date | null
    readonly sunset: Date | null
  }
  readonly forecastRule: number | null
  readonly extremes: {
    readonly outdoorTemperatureC: Extremes
    readonly outdoorHumidityPct: Extremes
    readonly seaLevelPressureHPa: Extremes
  }
}
