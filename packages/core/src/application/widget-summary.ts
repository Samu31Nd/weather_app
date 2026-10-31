// Qué muestra el widget de Android (artboards `WidgetsClaro`/`WidgetsOscuro`): un ícono estático que resume la
// escena del cielo y UN dato contextual en el tamaño 2×2. Reglas de la nota del diseño:
// normal → máx/mín del día; lloviendo → lluvia de hoy; ráfaga ≥ 29 km/h → ráfaga; neblina → humedad;
// sin conexión → hora de la última lectura.

import type { SkyScene } from '../domain/sky-scene'
import { displaySpeed } from '../domain/display-units'
import type { CurrentConditions } from './current-conditions'

/** Íconos del widget: versiones fijas y simplificadas de las 21 escenas. */
export const WIDGET_KINDS = ['clear', 'night', 'partly', 'rain', 'storm', 'fog', 'offline'] as const
export type WidgetKind = (typeof WIDGET_KINDS)[number]

export type WidgetDetail = 'range' | 'rainToday' | 'gust' | 'humidity' | 'lastReading'

/** Ráfaga a partir de la cual el viento es el dato más importante (la escena "Ventoso" usa el mismo umbral). */
export const WIDGET_GUST_THRESHOLD_KMH = 29

const KIND_BY_SCENE: Readonly<Record<SkyScene, WidgetKind>> = {
  clearDay: 'clear', warmer: 'clear', dawn: 'clear', twilight: 'clear',
  clearNight: 'night', nightCloudy: 'night',
  partly: 'partly', increasing: 'partly', cloudy: 'partly', clearing: 'partly', cooler: 'partly',
  windy: 'partly', windShift: 'partly', likely: 'partly', calibrating: 'partly',
  drizzle: 'rain', rain: 'rain', nightRain: 'rain',
  storm: 'storm',
  fog: 'fog',
  offline: 'offline',
}

export function widgetKind(scene: SkyScene): WidgetKind {
  return KIND_BY_SCENE[scene]
}

/** El dato contextual del 2×2. Si hay varios, manda el más urgente: ráfaga, lluvia, neblina, rango del día. */
export function widgetDetail(view: CurrentConditions): WidgetDetail {
  if (view.scene === 'offline') return 'lastReading'
  const gustThreshold = displaySpeed(WIDGET_GUST_THRESHOLD_KMH, view.units) as number
  if ((view.wind.gust ?? 0) >= gustThreshold) return 'gust'
  if (view.rain.intensity !== 'none') return 'rainToday'
  if (view.scene === 'fog') return 'humidity'
  return 'range'
}
