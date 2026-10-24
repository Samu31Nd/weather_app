// Formateo dependiente del idioma: números, horas en Ciudad de México y duraciones (RNF-APP-07).
// Las horas usan siempre America/Mexico_City (UTC−6, sin horario de verano), nunca la zona del dispositivo.

import { MEXICO_CITY_UTC_OFFSET_MINUTES, type Language } from '@tt/core'
import type { Catalog } from './catalogs/es'

const LOCALES: Readonly<Record<Language, string>> = { es: 'es-MX', en: 'en-US' }
const MINUTE_MS = 60_000

export interface Formatter {
  /** Número con `decimals` decimales en el formato del idioma; "—" si no hay dato. */
  number(value: number | null, decimals?: number): string
  /** Hora `HH:mm` de Ciudad de México. */
  time(instant: Date | null): string
  /** Hora `HH:mm:ss` de Ciudad de México. */
  clock(instant: Date): string
  /** Fecha larga de Ciudad de México ("sábado 24 de octubre" / "Saturday, October 24"). */
  longDate(instant: Date): string
  /** Duración en minutos como "9 h 35 min". */
  duration(minutes: number): string
  /** Tiempo encendido de la estación: "4 min", "3 h" o "2 días". */
  uptime(seconds: number): string
}

export function createFormatter(language: Language, catalog: Catalog): Formatter {
  const locale = LOCALES[language]
  const noData = catalog.units.noData
  const pad = (n: number) => String(n).padStart(2, '0')
  const wallClock = (instant: Date) => new Date(instant.getTime() + MEXICO_CITY_UTC_OFFSET_MINUTES * MINUTE_MS)

  return {
    number(value, decimals = 1) {
      if (value === null || !Number.isFinite(value)) return noData
      return new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
    },
    time(instant) {
      if (instant === null) return noData
      const wall = wallClock(instant)
      return `${pad(wall.getUTCHours())}:${pad(wall.getUTCMinutes())}`
    },
    clock(instant) {
      const wall = wallClock(instant)
      return `${pad(wall.getUTCHours())}:${pad(wall.getUTCMinutes())}:${pad(wall.getUTCSeconds())}`
    },
    longDate(instant) {
      const wall = wallClock(instant)
      const { weekdays, months, longDate } = catalog.calendar
      return longDate(weekdays[wall.getUTCDay()] as string, wall.getUTCDate(), months[wall.getUTCMonth()] as string)
    },
    duration(minutes) {
      const total = Math.max(0, Math.round(minutes))
      return `${Math.floor(total / 60)} ${catalog.units.hours} ${pad(total % 60)} ${catalog.units.minutes}`
    },
    uptime(seconds) {
      const { minutes, hours, days } = catalog.units
      if (seconds < 3600) return `${Math.max(1, Math.round(seconds / 60))} ${minutes}`
      if (seconds < 86_400) return `${Math.round(seconds / 3600)} ${hours}`
      return `${Math.round(seconds / 86_400)} ${days}`
    },
  }
}
