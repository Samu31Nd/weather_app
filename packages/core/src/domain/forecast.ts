// Pronóstico cualitativo de la consola (`forrule`). Se descompone en partes para poder escribir la frase en
// cualquier idioma y para alimentar la escena del cielo (RF-APP-03).

import { DAVIS_FORECAST_RULES } from './forecast-rules'

export type ForecastSky = 'mostlyClear' | 'partlyCloudy' | 'increasingClouds' | 'mostlyCloudy' | 'clearing'
export type ForecastTemperature = 'cooler' | 'warmer' | 'littleChange'
export type PrecipitationOutlook = 'possible' | 'likely' | 'continuing' | 'ending'

export interface ForecastPrecipitation {
  readonly outlook: PrecipitationOutlook
  /** Ventana en horas tal como la da la consola, p. ej. `"12"` o `"6 to 12"`; `null` si no la indica. */
  readonly windowHours: string | null
  readonly possiblyHeavy: boolean
}

export interface ForecastWind {
  readonly windy: boolean
  readonly increasing: boolean
  readonly shiftToWestOrNorth: boolean
}

export type Forecast =
  | {
      readonly kind: 'forecast'
      readonly rule: number
      readonly sky: ForecastSky
      readonly temperature: ForecastTemperature | null
      readonly precipitation: ForecastPrecipitation | null
      readonly wind: ForecastWind
      readonly text: string
    }
  | { readonly kind: 'calibrating'; readonly rule: number }
  | { readonly kind: 'unavailable' }

/** La consola acaba de arrancar y necesita 3 h de datos para pronosticar. */
export const CALIBRATING_RULE = 193

const SKY_PATTERNS: ReadonlyArray<readonly [RegExp, ForecastSky]> = [
  [/^Mostly clear/, 'mostlyClear'],
  [/^Partly cloudy/, 'partlyCloudy'],
  [/^Increasing clouds/, 'increasingClouds'],
  [/^Mostly cloudy/, 'mostlyCloudy'],
  [/^Clearing/, 'clearing'],
]

export function decodeForecast(rule: number | null): Forecast {
  if (rule === CALIBRATING_RULE) return { kind: 'calibrating', rule }
  const text = rule === null ? undefined : DAVIS_FORECAST_RULES[rule]
  const sky = text && SKY_PATTERNS.find(([pattern]) => pattern.test(text))?.[1]
  if (rule === null || !text || !sky) return { kind: 'unavailable' }
  return {
    kind: 'forecast',
    rule,
    sky,
    temperature: parseTemperature(text),
    precipitation: parsePrecipitation(text),
    wind: parseWind(text),
    text,
  }
}

function parseTemperature(text: string): ForecastTemperature | null {
  if (/\bcooler\b/.test(text)) return 'cooler'
  if (/\bwarmer\b/.test(text)) return 'warmer'
  if (/little temperature change/.test(text)) return 'littleChange'
  return null
}

function parsePrecipitation(text: string): ForecastPrecipitation | null {
  const sentence = /Precipitation[^.]*(?:\.[^A-Z]*)?/.exec(text)?.[0]
  if (!sentence) return null
  const outlook: PrecipitationOutlook = /ending/.test(sentence)
    ? 'ending'
    : /continuing/.test(sentence)
      ? 'continuing'
      : /likely/.test(sentence)
        ? 'likely'
        : 'possible'
  return {
    outlook,
    windowHours: /(?:within|in) (\d+(?: to \d+)?) h/.exec(sentence)?.[1] ?? null,
    possiblyHeavy: /possibl[ey] heavy/.test(sentence),
  }
}

function parseWind(text: string): ForecastWind {
  return {
    windy: /\bwindy\b/i.test(text),
    increasing: /Increasing winds/.test(text),
    shiftToWestOrNorth: /wind shift to the W, NW, or N/.test(text),
  }
}

/** Partes del ícono del pronóstico (sol, nube, lluvia), igual en web y móvil. */
export interface ForecastIcon {
  readonly sun: boolean
  readonly cloud: boolean
  readonly rain: boolean
}

export function forecastIcon(forecast: Forecast): ForecastIcon {
  const sky = forecast.kind === 'forecast' ? forecast.sky : null
  return {
    sun: sky === 'mostlyClear' || sky === 'partlyCloudy' || sky === 'clearing',
    cloud: sky !== null && sky !== 'mostlyClear',
    rain: forecast.kind === 'forecast' && forecast.precipitation !== null && forecast.precipitation.outlook !== 'ending',
  }
}
