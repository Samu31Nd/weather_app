// Textos derivados del modelo de vista que web y móvil muestran igual: valores con su unidad y decimales, confort
// interior, aviso del sol, estado de la estación y vigencia del dato en vivo (RF-APP-01, 02, 05, 10).

import {
  type CurrentConditions, type DisplayUnits, type LiveStatus, PRESSURE_GAUGE_HPA, UNIT_SYMBOLS, displayPressure, hPaToInHg,
} from '@tt/core'
import type { Catalog } from './catalogs/es'
import type { Formatter } from './format'

export interface ValueText {
  readonly symbols: (typeof UNIT_SYMBOLS)[DisplayUnits]
  temperature(value: number | null): string
  degrees(value: number | null): string
  speed(value: number | null): string
  rain(value: number | null): string
  rainRate(value: number | null): string
  /** Presión con los decimales de la tarjeta (1 en hPa, 3 en inHg). */
  pressure(value: number | null): string
  /** Presión resumida para el héroe (0 en hPa, 2 en inHg). */
  pressureShort(value: number | null): string
  percent(value: number | null): string
}

export function valueText(units: DisplayUnits, format: Formatter): ValueText {
  const symbols = UNIT_SYMBOLS[units]
  const metric = units === 'metric'
  const withUnit = (text: string, unit: string) => (text === format.number(null) ? text : `${text} ${unit}`)
  return {
    symbols,
    temperature: (value) => withUnit(format.number(value, 1), symbols.temperature),
    degrees: (value) => (value === null ? format.number(null) : `${format.number(value, 1)}°`),
    speed: (value) => withUnit(format.number(value, 1), symbols.speed),
    rain: (value) => withUnit(format.number(value, metric ? (value !== null && value >= 10 ? 0 : 1) : 2), symbols.rain),
    rainRate: (value) => withUnit(format.number(value, metric ? 1 : 2), symbols.rainRate),
    pressure: (value) => format.number(value, metric ? 1 : 3),
    pressureShort: (value) => withUnit(format.number(value, metric ? 0 : 2), symbols.pressure),
    percent: (value) => (value === null ? format.number(null) : `${format.number(value, 0)} %`),
  }
}

export interface IndoorText {
  /** "Confortable", "Fresco", "Húmedo"…; null sin lectura interior. */
  readonly comfort: string | null
  readonly comfortable: boolean
  /** "2.1° más cálido que afuera"; null sin las dos temperaturas. */
  readonly difference: string | null
}

export function indoorText(indoor: CurrentConditions['indoor'], t: Catalog, format: Formatter): IndoorText {
  const { comfort, differenceFromOutdoor: delta } = indoor
  const comfortable = comfort?.thermal === 'comfortable' && comfort.moisture === 'comfortable'
  const comfortLabel =
    comfort === null
      ? null
      : comfortable
        ? t.indoor.comfortable
        : comfort.thermal !== 'comfortable'
          ? t.indoor[comfort.thermal]
          : t.indoor[comfort.moisture as 'dry' | 'humid']
  const difference =
    delta === null
      ? null
      : Math.abs(delta) < 0.5
        ? t.indoor.same
        : delta > 0
          ? t.indoor.warmer(format.number(Math.abs(delta), 1))
          : t.indoor.cooler(format.number(Math.abs(delta), 1))
  return { comfort: comfortLabel, comfortable, difference }
}

/** "Quedan 3 h 10 min de luz" de día, "Amanece en 9 h 35 min" de noche. */
export function sunBadgeText(sun: CurrentConditions['sun'], t: Catalog, format: Formatter): string | null {
  if (sun.minutesToNextEvent === null) return null
  const duration = format.duration(sun.minutesToNextEvent)
  return sun.isDay ? t.sun.daylightLeft(duration) : t.sun.sunriseIn(duration)
}

export interface StationText {
  readonly battery: string
  readonly signal: string
  readonly uptime: string
}

export function stationText(station: CurrentConditions['station'], t: Catalog, format: Formatter): StationText {
  const noData = format.number(null)
  return {
    battery: station.batteryVolts === null ? noData : `${format.number(station.batteryVolts, 2)} V`,
    signal: station.signalLevel === null ? noData : `${t.station.signalLevels[station.signalLevel]} · ${station.signalDbm} dBm`,
    uptime: station.uptimeSeconds === null ? noData : t.station.runningFor(format.uptime(station.uptimeSeconds)),
  }
}

export type LiveTone = 'ok' | 'stale' | 'offline'

export interface LiveText {
  readonly tone: LiveTone
  /** "En vivo", "Dato desactualizado", "Sin conexión". */
  readonly label: string
  /** "hace 12 s · cada 60 s", "actualizado ahora" o "Sin conexión · último dato 10:42". */
  readonly detail: string
}

export function liveText(
  live: { status: LiveStatus; secondsSinceUpdate: number | null; observedAt: Date | null },
  t: Catalog,
  format: Formatter,
): LiveText {
  const healthy = live.status === 'ok' || live.status === 'loading'
  const tone: LiveTone = healthy ? 'ok' : live.status === 'stale' ? 'stale' : 'offline'
  const label = tone === 'ok' ? t.live.live : tone === 'stale' ? t.live.stale : t.live.offline
  const detail =
    live.status === 'offlineWithData'
      ? t.live.offlineSince(format.time(live.observedAt))
      : live.secondsSinceUpdate === null || live.secondsSinceUpdate < 2
        ? t.live.justUpdated
        : t.live.secondsAgo(live.secondsSinceUpdate)
  return { tone, label, detail }
}

export interface WindText {
  /** Dirección de donde viene ("NO"), o "—". */
  readonly direction: string
  readonly gustDirection: string
  /** Texto central de la brújula: dirección, o "Calma". */
  readonly center: string
  /** Debajo del centro: "315°", o "última NO 315°" en calma. */
  readonly centerDetail: string
  readonly beaufortName: string
  readonly beaufortSummary: string
  /** Promedios y ráfaga con su fracción de la barra (la escala crece si la ráfaga la supera). */
  readonly bars: ReadonlyArray<{ readonly label: string; readonly value: string; readonly fraction: number; readonly gust: boolean }>
  readonly accessibilityLabel: string
}

export function windText(wind: CurrentConditions['wind'], units: DisplayUnits, t: Catalog, format: Formatter): WindText {
  const v = valueText(units, format)
  const noData = format.number(null)
  const direction = wind.direction ? t.wind.compass[wind.direction] : noData
  const gustDirection = wind.gustDirection ? t.wind.compass[wind.gustDirection] : noData
  const beaufortName = t.wind.beaufortNames[wind.beaufort] as string
  const barMax = Math.max(wind.gust ?? 0, units === 'metric' ? 20 : 12)
  const bar = (label: string, value: number | null, gust: boolean) => ({ label, value: v.speed(value), fraction: Math.min(1, (value ?? 0) / barMax), gust })
  return {
    direction,
    gustDirection,
    center: wind.calm ? t.hero.calm : direction,
    centerDetail: wind.directionDeg === null ? '' : wind.calm ? t.wind.lastDirection(direction, wind.directionDeg) : `${wind.directionDeg}°`,
    beaufortName,
    beaufortSummary: t.wind.force(wind.beaufort, beaufortName.toLowerCase()),
    bars: [bar(t.wind.avg2, wind.avg2Min, false), bar(t.wind.avg10, wind.avg10Min, false), bar(t.wind.gustFrom(gustDirection), wind.gust, true)],
    accessibilityLabel: wind.calm ? t.wind.calmLabel(direction) : t.wind.label(direction, v.speed(wind.speed), gustDirection),
  }
}

export interface RainText {
  /** "Sin lluvia ahora" o "Lluvia ligera · 1.2 mm/h". */
  readonly badge: string
  readonly windows: ReadonlyArray<{ readonly label: string; readonly value: string; readonly fraction: number }>
  readonly totals: ReadonlyArray<{ readonly label: string; readonly value: string }>
}

export function rainText(rain: CurrentConditions['rain'], units: DisplayUnits, t: Catalog, format: Formatter): RainText {
  const v = valueText(units, format)
  const windows = [
    [t.rain.last15Min, rain.last15Min], [t.rain.lastHour, rain.lastHour], [t.rain.today, rain.today], [t.rain.last24h, rain.last24h],
  ] as const
  const max = Math.max(...windows.map(([, value]) => value ?? 0), units === 'metric' ? 1 : 0.04)
  return {
    badge: rain.intensity === 'none' ? t.rain.noRainNow : `${t.rain.intensity[rain.intensity]} · ${v.rainRate(rain.rate)}`,
    windows: windows.map(([label, value]) => ({ label, value: v.rain(value), fraction: Math.min(1, (value ?? 0) / max) })),
    totals: [
      { label: t.rain.storm, value: v.rain(rain.storm) },
      { label: t.rain.month, value: v.rain(rain.month) },
      { label: t.rain.year, value: v.rain(rain.year) },
    ],
  }
}

export interface PressureText {
  /** La lectura en las otras unidades: "770.9 mmHg · 30.394 inHg". */
  readonly alternate: string | null
  readonly scaleLow: string
  readonly scaleHigh: string
  /** Variación de hoy: "1,027.1 – 1,029.8". */
  readonly dayRange: string
  readonly trend: string | null
  readonly implausibleNote: string | null
  readonly accessibilityLabel: string
}

export function pressureText(pressure: CurrentConditions['pressure'], units: DisplayUnits, t: Catalog, format: Formatter): PressureText {
  const v = valueText(units, format)
  const metric = units === 'metric'
  const scaleDecimals = metric ? 0 : 2
  return {
    alternate:
      pressure.hPa === null || pressure.mmHg === null
        ? null
        : `${format.number(pressure.mmHg, 1)} mmHg · ${metric ? `${format.number(hPaToInHg(pressure.hPa), 3)} inHg` : `${format.number(pressure.hPa, 1)} hPa`}`,
    scaleLow: format.number(displayPressure(PRESSURE_GAUGE_HPA.min, units), scaleDecimals),
    scaleHigh: format.number(displayPressure(PRESSURE_GAUGE_HPA.max, units), scaleDecimals),
    dayRange: `${v.pressure(pressure.todayLow)} – ${v.pressure(pressure.todayHigh)}`,
    trend: pressure.trend ? t.pressure.trends[pressure.trend] : null,
    implausibleNote: pressure.implausibleExtreme === null ? null : t.pressure.implausible(v.pressureShort(pressure.implausibleExtreme)),
    accessibilityLabel: t.pressure.label(v.pressureShort(pressure.value), v.pressure(pressure.todayLow), v.pressure(pressure.todayHigh)),
  }
}

/** Interpretación del punto de rocío ("El aire está casi saturado…"), o null sin datos. */
export function humidityInsightText(humidity: CurrentConditions['humidity'], t: Catalog, format: Formatter): string | null {
  return humidity.insight === null ? null : t.humidity.insight[humidity.insight](format.number(humidity.spread, 1))
}
