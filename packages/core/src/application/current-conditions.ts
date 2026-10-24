// Modelo de vista de "Ahora" (RF-APP-01, 03, 04, 05): todos los cálculos del dashboard, en las unidades
// elegidas y sin texto. La web y la móvil lo dibujan igual; los textos los pone @tt/i18n. Fuente de cada
// cálculo: artboards `Dashboard` y `MobileNow` del canvas de diseño.

import {
  type DisplayUnits, displayPressure, displayRain, displaySpeed, displayTemperature, displayTemperatureDelta,
} from '../domain/display-units'
import { type Forecast, decodeForecast } from '../domain/forecast'
import type { LiveReading } from '../domain/live-reading'
import { type PressureTrend, isPlausibleSeaLevelPressure } from '../domain/pressure'
import { type SkyScene } from '../domain/sky-scene'
import { solarNoon, sunProgress } from '../domain/sun'
import {
  type FeelsLikeReason, FOG_DEW_POINT_SPREAD_C, type IndoorComfort, feelsLike, indoorComfort,
} from '../domain/thermal'
import { hPaToMmHg } from '../domain/units'
import { type BeaufortForce, CALM_THRESHOLD_KMH, type CompassPoint, beaufortFromKmh, compassPointFromDegrees } from '../domain/wind'

export type RainIntensity = 'none' | 'light' | 'moderate' | 'heavy' | 'torrential'
export type HumidityInsight = 'saturated' | 'humid' | 'dry'
export type SignalLevel = 1 | 2 | 3 | 4

export interface CurrentConditions {
  readonly units: DisplayUnits
  readonly observedAt: Date
  readonly scene: SkyScene
  readonly forecast: Forecast
  readonly temperature: {
    readonly now: number | null
    readonly feelsLike: number | null
    readonly feelsLikeReason: FeelsLikeReason
    /** Rango del día dentro del rango del mes, en fracciones 0–1 de la barra (null si faltan datos). */
    readonly range: {
      readonly todayLow: number | null
      readonly todayHigh: number | null
      readonly monthLow: number | null
      readonly monthHigh: number | null
      readonly swing: number | null
      readonly bar: { readonly todayStart: number; readonly todayWidth: number; readonly current: number } | null
    }
  }
  readonly humidity: {
    readonly now: number | null
    readonly todayLow: number | null
    readonly todayHigh: number | null
    readonly dewPoint: number | null
    readonly spread: number | null
    readonly insight: HumidityInsight | null
  }
  readonly wind: {
    readonly speed: number | null
    readonly calm: boolean
    readonly directionDeg: number | null
    readonly direction: CompassPoint | null
    readonly beaufort: BeaufortForce
    readonly avg2Min: number | null
    readonly avg10Min: number | null
    readonly gust: number | null
    readonly gustDirectionDeg: number | null
    readonly gustDirection: CompassPoint | null
  }
  readonly pressure: {
    readonly value: number | null
    /** Valores canónicos para la línea secundaria ("770.9 mmHg · 30.39 inHg"). */
    readonly hPa: number | null
    readonly mmHg: number | null
    readonly trend: PressureTrend | null
    readonly todayLow: number | null
    readonly todayHigh: number | null
    /** Posición de la aguja y del arco del día en el medidor, como fracciones 0–1. */
    readonly gauge: { readonly needle: number; readonly todayFrom: number; readonly todayTo: number } | null
    /** Algún extremo del mes o del año no es creíble (lecturas sin corregir de antes del 20-oct, D3). */
    readonly implausibleExtreme: number | null
  }
  readonly rain: {
    readonly rate: number | null
    readonly intensity: RainIntensity
    readonly last15Min: number | null
    readonly lastHour: number | null
    readonly today: number | null
    readonly last24h: number | null
    readonly storm: number | null
    readonly month: number | null
    readonly year: number | null
  }
  readonly indoor: {
    readonly temperature: number | null
    readonly humidity: number | null
    readonly comfort: IndoorComfort | null
    /** Interior − exterior, en la unidad elegida. */
    readonly differenceFromOutdoor: number | null
  }
  readonly sun: {
    readonly sunrise: Date | null
    readonly sunset: Date | null
    readonly solarNoon: Date | null
    readonly isDay: boolean
    readonly progress: number | null
    /** Minutos de luz restantes (de día) o hasta el próximo amanecer (de noche). */
    readonly minutesToNextEvent: number | null
  }
  readonly station: {
    readonly batteryVolts: number | null
    readonly batteryLevel: number | null
    readonly signalDbm: number | null
    readonly signalLevel: SignalLevel | null
    readonly uptimeSeconds: number | null
  }
}

// Rango del medidor de presión a nivel del mar (≈ 746–784 mmHg): cubre las lecturas plausibles de ESCOM.
export const PRESSURE_GAUGE_HPA = { min: 995, max: 1045 } as const

const MINUTE_MS = 60_000
const DAY_MINUTES = 1440
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

export function buildCurrentConditions(
  reading: LiveReading,
  options: { units: DisplayUnits; now: Date; scene: SkyScene },
): CurrentConditions {
  const { units, now, scene } = options
  const t = (celsius: number | null) => displayTemperature(celsius, units)
  const { outdoor, wind, pressure, rain, indoor, extremes } = reading
  const temperatureNowC = outdoor.temperatureC
  const feels = temperatureNowC === null ? null : feelsLike({ temperatureC: temperatureNowC, heatIndexC: outdoor.heatIndexC, windChillC: outdoor.windChillC })
  const speedKmh = wind.speedKmh
  const calm = speedKmh === null || speedKmh < CALM_THRESHOLD_KMH

  return {
    units,
    observedAt: reading.observedAt,
    scene,
    forecast: decodeForecast(reading.forecastRule),
    temperature: {
      now: t(temperatureNowC),
      feelsLike: t(feels?.valueC ?? null),
      feelsLikeReason: feels?.reason ?? 'none',
      range: temperatureRange(temperatureNowC, extremes.outdoorTemperatureC, units),
    },
    humidity: humidity(reading, units),
    wind: {
      speed: displaySpeed(speedKmh, units),
      calm,
      directionDeg: wind.directionDeg,
      direction: wind.directionDeg === null ? null : compassPointFromDegrees(wind.directionDeg),
      beaufort: beaufortFromKmh(speedKmh ?? 0),
      avg2Min: displaySpeed(wind.avg2MinKmh, units),
      avg10Min: displaySpeed(wind.avg10MinKmh, units),
      gust: displaySpeed(wind.gustKmh, units),
      gustDirectionDeg: wind.gustDirectionDeg,
      gustDirection: wind.gustDirectionDeg === null ? null : compassPointFromDegrees(wind.gustDirectionDeg),
    },
    pressure: pressureView(pressure.seaLevelHPa, pressure.trend, extremes.seaLevelPressureHPa, units),
    rain: {
      rate: displayRain(rain.rateMmH, units),
      intensity: rainIntensity(rain.rateMmH),
      last15Min: displayRain(rain.last15MinMm, units),
      lastHour: displayRain(rain.lastHourMm, units),
      today: displayRain(rain.todayMm, units),
      last24h: displayRain(rain.last24hMm, units),
      storm: displayRain(rain.stormMm, units),
      month: displayRain(rain.monthMm, units),
      year: displayRain(rain.yearMm, units),
    },
    indoor: {
      temperature: t(indoor.temperatureC),
      humidity: indoor.humidityPct,
      comfort: indoor.temperatureC === null || indoor.humidityPct === null ? null : indoorComfort(indoor.temperatureC, indoor.humidityPct),
      differenceFromOutdoor:
        indoor.temperatureC === null || temperatureNowC === null ? null : displayTemperatureDelta(indoor.temperatureC - temperatureNowC, units),
    },
    sun: sunView(reading, now),
    station: stationView(reading),
  }
}

/** Intensidad de lluvia por tasa (mm/h), con los cortes del diseño. */
export function rainIntensity(rateMmH: number | null): RainIntensity {
  const rate = rateMmH ?? 0
  if (rate <= 0) return 'none'
  if (rate < 2.5) return 'light'
  if (rate < 7.6) return 'moderate'
  if (rate < 50) return 'heavy'
  return 'torrential'
}

/** Barras de señal Wi-Fi a partir del RSSI (dBm), con los cortes del diseño. */
export function signalLevel(dbm: number): SignalLevel {
  if (dbm > -55) return 4
  if (dbm > -65) return 3
  if (dbm > -75) return 2
  return 1
}

function temperatureRange(nowC: number | null, extremes: LiveReading['extremes']['outdoorTemperatureC'], units: DisplayUnits) {
  const { today, month } = extremes
  const t = (celsius: number | null) => displayTemperature(celsius, units)
  const swingC = today.high !== null && today.low !== null ? today.high - today.low : null
  const known = [month.low, month.high, today.low, today.high, nowC].filter((v): v is number => v !== null)
  const lo = Math.min(...known)
  const hi = Math.max(...known)
  const span = hi - lo || 1
  const position = (celsius: number) => clamp((celsius - lo) / span)
  const bar =
    today.low !== null && today.high !== null && nowC !== null && known.length > 0
      ? { todayStart: position(today.low), todayWidth: position(today.high) - position(today.low), current: position(nowC) }
      : null
  return {
    todayLow: t(today.low),
    todayHigh: t(today.high),
    monthLow: t(month.low),
    monthHigh: t(month.high),
    swing: swingC === null ? null : displayTemperatureDelta(swingC, units),
    bar,
  }
}

function humidity(reading: LiveReading, units: DisplayUnits): CurrentConditions['humidity'] {
  const { temperatureC, dewPointC, humidityPct } = reading.outdoor
  const spreadC = temperatureC !== null && dewPointC !== null ? temperatureC - dewPointC : null
  const insight: HumidityInsight | null =
    spreadC === null ? null : spreadC < FOG_DEW_POINT_SPREAD_C ? 'saturated' : spreadC < 6 ? 'humid' : 'dry'
  return {
    now: humidityPct,
    todayLow: reading.extremes.outdoorHumidityPct.today.low,
    todayHigh: reading.extremes.outdoorHumidityPct.today.high,
    dewPoint: displayTemperature(dewPointC, units),
    spread: spreadC === null ? null : displayTemperatureDelta(spreadC, units),
    insight,
  }
}

function pressureView(
  hPa: number | null,
  trend: PressureTrend | null,
  extremes: LiveReading['extremes']['seaLevelPressureHPa'],
  units: DisplayUnits,
): CurrentConditions['pressure'] {
  const fraction = (value: number) => clamp((value - PRESSURE_GAUGE_HPA.min) / (PRESSURE_GAUGE_HPA.max - PRESSURE_GAUGE_HPA.min))
  const { today } = extremes
  const longTerm = [extremes.month.low, extremes.month.high, extremes.year.low, extremes.year.high]
  const implausible = longTerm.find((value) => value !== null && !isPlausibleSeaLevelPressure(value)) ?? null
  return {
    value: displayPressure(hPa, units),
    hPa,
    mmHg: hPa === null ? null : hPaToMmHg(hPa),
    trend,
    todayLow: displayPressure(today.low, units),
    todayHigh: displayPressure(today.high, units),
    gauge:
      hPa === null
        ? null
        : {
            needle: fraction(hPa),
            todayFrom: fraction(today.low ?? hPa),
            todayTo: Math.max(fraction(today.high ?? hPa), fraction(today.low ?? hPa) + 0.01),
          },
    implausibleExtreme: displayPressure(implausible, units),
  }
}

function sunView(reading: LiveReading, now: Date): CurrentConditions['sun'] {
  const { sunrise, sunset } = reading.sun
  if (sunrise === null || sunset === null) {
    return { sunrise, sunset, solarNoon: null, isDay: true, progress: null, minutesToNextEvent: null }
  }
  const times = { sunrise, sunset }
  const progress = sunProgress(now, times)
  const isDay = progress !== null
  const minutesUntil = (event: Date) => Math.round((event.getTime() - now.getTime()) / MINUTE_MS)
  const minutesToNextEvent = isDay
    ? minutesUntil(sunset)
    : now < sunrise
      ? minutesUntil(sunrise)
      : minutesUntil(sunrise) + DAY_MINUTES
  return { sunrise, sunset, solarNoon: solarNoon(times), isDay, progress, minutesToNextEvent }
}

function stationView({ station }: LiveReading): CurrentConditions['station'] {
  // Batería de la consola: ~4.0 V vacía, ~5.0 V llena (diseño); nunca se muestra por debajo del 10 %.
  const batteryLevel = station.batteryVolts === null ? null : clamp(station.batteryVolts - 4.0, 0.1, 1)
  return {
    batteryVolts: station.batteryVolts,
    batteryLevel,
    signalDbm: station.signalDbm,
    signalLevel: station.signalDbm === null ? null : signalLevel(station.signalDbm),
    uptimeSeconds: station.uptimeSeconds,
  }
}
