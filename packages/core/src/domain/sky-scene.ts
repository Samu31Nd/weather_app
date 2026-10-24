// Escena del cielo (RF-APP-03). Implementa la nota `skyMap` del canvas de diseño: siete capas evaluadas en
// orden. Cada capa refina o reemplaza la escena de la anterior; la tabla está en docs/06-datos.md.

import type { Forecast } from './forecast'
import type { DayPhase } from './sun'
import { isNearSaturation } from './thermal'

export const SKY_SCENES = [
  'clearDay', 'clearNight', 'dawn', 'twilight', 'partly', 'increasing', 'cloudy', 'nightCloudy',
  'clearing', 'drizzle', 'rain', 'nightRain', 'storm', 'likely', 'windy', 'windShift',
  'warmer', 'cooler', 'fog', 'calibrating', 'offline',
] as const

export type SkyScene = (typeof SKY_SCENES)[number]

export interface SkySceneInput {
  /** `null` cuando la consola no respondió. */
  readonly forecast: Forecast | null
  readonly phase: DayPhase
  readonly rainRateMmH: number | null
  readonly gustKmh: number | null
  readonly humidityPct: number | null
  readonly temperatureC: number | null
  readonly dewPointC: number | null
}

export const DRIZZLE_MAX_MM_H = 0.5
export const HEAVY_RAIN_MM_H = 7.6
export const WINDY_GUST_KMH = 29
export const FOG_MIN_HUMIDITY_PCT = 90

const PRECIPITATION_SCENES: ReadonlySet<SkyScene> = new Set(['drizzle', 'rain', 'nightRain', 'storm', 'likely'])

export function resolveSkyScene(input: SkySceneInput): SkyScene {
  const { forecast } = input
  if (forecast === null || forecast.kind === 'unavailable') return 'offline'
  if (forecast.kind === 'calibrating') return 'calibrating'

  const isNight = input.phase === 'night'
  const raining = (input.rainRateMmH ?? 0) > 0

  let scene = sceneForTimeOfDay(input.phase)
  scene = applySky(scene, forecast.sky, input.phase)
  scene = applyPrecipitation(scene, input.rainRateMmH, forecast, isNight)
  if (!PRECIPITATION_SCENES.has(scene)) scene = applyWind(scene, forecast, input.gustKmh)
  if (scene === 'clearDay' || scene === 'partly') scene = applyTemperature(scene, forecast)
  if (!raining && (isNight || input.phase === 'dawn') && isFoggy(input)) scene = 'fog'
  return scene
}

function sceneForTimeOfDay(phase: DayPhase): SkyScene {
  switch (phase) {
    case 'dawn': return 'dawn'
    case 'dusk': return 'twilight'
    case 'day': return 'clearDay'
    case 'night': return 'clearNight'
  }
}

function applySky(scene: SkyScene, sky: Extract<Forecast, { kind: 'forecast' }>['sky'], phase: DayPhase): SkyScene {
  const isNight = phase === 'night'
  switch (sky) {
    case 'mostlyClear':
      return scene
    case 'partlyCloudy':
      return phase === 'day' ? 'partly' : scene
    case 'increasingClouds':
      return isNight ? 'nightCloudy' : 'increasing'
    case 'mostlyCloudy':
      return isNight ? 'nightCloudy' : 'cloudy'
    case 'clearing':
      return isNight ? scene : 'clearing'
  }
}

function applyPrecipitation(
  scene: SkyScene,
  rainRateMmH: number | null,
  forecast: Extract<Forecast, { kind: 'forecast' }>,
  isNight: boolean,
): SkyScene {
  const rate = rainRateMmH ?? 0
  const outlook = forecast.precipitation?.outlook
  if (rate > 0) {
    if (rate >= HEAVY_RAIN_MM_H || forecast.precipitation?.possiblyHeavy) return 'storm'
    if (rate < DRIZZLE_MAX_MM_H) return 'drizzle'
    return isNight ? 'nightRain' : 'rain'
  }
  if (outlook === 'likely' || outlook === 'continuing') return 'likely'
  if (outlook === 'ending' && !isNight) return 'clearing'
  return scene
}

function applyWind(scene: SkyScene, forecast: Extract<Forecast, { kind: 'forecast' }>, gustKmh: number | null): SkyScene {
  if (forecast.wind.shiftToWestOrNorth) return 'windShift'
  if (forecast.wind.windy || forecast.wind.increasing || (gustKmh ?? 0) >= WINDY_GUST_KMH) return 'windy'
  return scene
}

function applyTemperature(scene: SkyScene, forecast: Extract<Forecast, { kind: 'forecast' }>): SkyScene {
  if (forecast.temperature === 'warmer') return 'warmer'
  if (forecast.temperature === 'cooler') return 'cooler'
  return scene
}

function isFoggy({ humidityPct, temperatureC, dewPointC }: SkySceneInput): boolean {
  if (humidityPct === null || temperatureC === null || dewPointC === null) return false
  return humidityPct >= FOG_MIN_HUMIDITY_PCT && isNearSaturation(temperatureC, dewPointC)
}
