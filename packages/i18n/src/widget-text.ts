// Textos del widget de Android (artboards `WidgetsClaro`/`WidgetsOscuro`). Cifras enteras, como el diseño: el widget
// se lee de un vistazo. La hora junto al nombre de la estación es la de la lectura, para que se note que no es en
// vivo (Android lo actualiza cada 30 min o al tocarlo).

import {
  type CurrentConditions, type DisplayUnits, UNIT_SYMBOLS, type WidgetKind, displayTemperature, widgetDetail, widgetKind,
} from '@tt/core'
import type { Catalog } from './catalogs/es'
import type { Formatter } from './format'

export interface WidgetText {
  readonly kind: WidgetKind
  /** "24°" */
  readonly temperature: string
  /** Gris cuando el dato no es actual (sin conexión). */
  readonly stale: boolean
  readonly condition: string
  /** El dato contextual del 2×2. */
  readonly detail: string
  /** Segunda y tercera líneas del 4×2. */
  readonly feelsLike: string
  readonly range: string
  /** Columna del 4×2: etiqueta y valor. */
  readonly facts: ReadonlyArray<{ readonly label: string; readonly value: string }>
  /** "Liz · 14:30" */
  readonly station: string
  /** Para el lector de pantalla: "Despejado, 24°". */
  readonly summary: string
}

const degrees = (format: Formatter, value: number | null) => (value === null ? format.number(null) : `${format.number(value, 0)}°`)

export function widgetText(view: CurrentConditions, stationName: string, t: Catalog, format: Formatter): WidgetText {
  const w = t.widget
  const symbols = UNIT_SYMBOLS[view.units]
  const kind = widgetKind(view.scene)
  const raining = (kind === 'rain' || kind === 'storm') && view.rain.intensity !== 'none'
  const condition = kind === 'rain' && raining ? t.rain.intensity[view.rain.intensity] : w.conditions[view.scene]
  const temperature = degrees(format, view.temperature.now)
  const range = w.range(degrees(format, view.temperature.range.todayHigh), degrees(format, view.temperature.range.todayLow))
  const rainDecimals = view.units === 'metric' ? 1 : 2
  const time = format.time(view.observedAt)

  const detailByKind = {
    range,
    rainToday: w.rainToday(`${format.number(view.rain.today, view.units === 'metric' ? 0 : 2)} ${symbols.rain}`),
    gust: w.gust(`${format.number(view.wind.gust, 0)} ${symbols.speed}`),
    humidity: w.humidity(`${format.number(view.humidity.now, 0)} %`),
    lastReading: w.lastShort(time),
  }
  const direction = view.wind.direction ? ` ${t.wind.compass[view.wind.direction]}` : ''

  return {
    kind,
    temperature,
    stale: view.scene === 'offline',
    condition,
    detail: detailByKind[widgetDetail(view)],
    feelsLike: w.feelsLike(degrees(format, view.temperature.feelsLike)),
    range,
    facts: [
      { label: t.hero.humidity, value: view.humidity.now === null ? format.number(null) : `${format.number(view.humidity.now, 0)} %` },
      { label: t.hero.wind, value: view.wind.calm ? t.hero.calm : `${format.number(view.wind.speed, 0)} ${symbols.speed}${direction}` },
      { label: t.hero.rainToday, value: view.rain.today === null ? format.number(null) : `${format.number(view.rain.today, rainDecimals)} ${symbols.rain}` },
    ],
    station: w.station(stationName, time),
    summary: `${condition}, ${temperature}`,
  }
}

/** Última lectura guardada por el widget, para mostrarla en gris si la consola no responde. */
export interface WidgetLastReading {
  readonly stationName: string
  readonly temperatureC: number | null
  readonly observedAt: Date
}

/** "Sin conexión": la última temperatura conocida y su hora; los demás datos, en blanco. */
export function widgetOfflineText(
  last: WidgetLastReading | null,
  options: { units: DisplayUnits; now: Date },
  t: Catalog,
  format: Formatter,
): WidgetText {
  const w = t.widget
  const noData = format.number(null)
  const value = displayTemperature(last?.temperatureC ?? null, options.units)
  const lastTime = last ? format.time(last.observedAt) : noData
  const temperature = degrees(format, value)
  return {
    kind: 'offline',
    temperature,
    stale: true,
    condition: w.conditions.offline,
    detail: w.lastShort(lastTime),
    feelsLike: w.lastLong(lastTime),
    range: noData,
    facts: [
      { label: t.hero.humidity, value: noData },
      { label: t.hero.wind, value: noData },
      { label: t.hero.rainToday, value: noData },
    ],
    station: w.station(last?.stationName ?? 'Liz', format.time(options.now)),
    summary: `${w.conditions.offline}, ${temperature}`,
  }
}
