// Textos derivados del modelo de vista que web y móvil muestran igual: valores con su unidad y decimales, confort
// interior, aviso del sol, estado de la estación y vigencia del dato en vivo (RF-APP-01, 02, 05, 10).

import { type CurrentConditions, type DisplayUnits, type LiveStatus, UNIT_SYMBOLS } from '@tt/core'
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
