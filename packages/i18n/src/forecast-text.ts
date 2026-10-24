// Frase del pronóstico en el idioma elegido, compuesta a partir de las partes que decodifica @tt/core
// (cielo, temperatura, lluvia y viento), en lugar de traducir 195 frases completas (RF-APP-03, RNF-APP-07).

import type { Forecast } from '@tt/core'
import type { Catalog } from './catalogs/es'

export interface ForecastText {
  readonly summary: string
  readonly sky: string
  readonly temperature: string
  readonly precipitation: string
  readonly wind: string
}

export function forecastText(forecast: Forecast, catalog: Catalog): ForecastText {
  const t = catalog.forecast
  if (forecast.kind !== 'forecast') {
    const message = forecast.kind === 'calibrating' ? t.calibrating : t.unavailable
    return { summary: message, sky: catalog.units.noData, temperature: catalog.units.noData, precipitation: catalog.units.noData, wind: catalog.units.noData }
  }

  const sky = t.skies[forecast.sky]
  const temperature = forecast.temperature === null ? catalog.units.noData : t.temperatures[forecast.temperature]
  const precipitation = precipitationText(forecast, catalog)
  const wind = windText(forecast, catalog)
  const sentences = [
    forecast.temperature === null || forecast.temperature === 'littleChange' ? sky : `${sky}, ${temperature.toLowerCase()}`,
    forecast.precipitation === null ? null : `${catalog.forecast.rain}: ${precipitation.toLowerCase()}`,
    wind === t.calmWind ? null : wind,
  ].filter((sentence): sentence is string => sentence !== null)

  return { summary: `${sentences.join('. ')}.`, sky, temperature, precipitation, wind }
}

function precipitationText(forecast: Extract<Forecast, { kind: 'forecast' }>, catalog: Catalog): string {
  const t = catalog.forecast
  const { precipitation } = forecast
  if (precipitation === null) return t.noRain
  return [
    t.precipitation[precipitation.outlook],
    precipitation.windowHours === null ? null : t.within(precipitation.windowHours),
    precipitation.possiblyHeavy ? t.heavyAtTimes : null,
  ]
    .filter((part): part is string => part !== null)
    .join(', ')
    .replace(/^(\S+), (en|within) /, '$1 $2 ')
}

function windText(forecast: Extract<Forecast, { kind: 'forecast' }>, catalog: Catalog): string {
  const t = catalog.forecast
  const { wind } = forecast
  const base = wind.windy ? t.windy : wind.increasing ? t.increasingWinds : null
  if (wind.shiftToWestOrNorth) return base === null ? t.windShift.charAt(0).toUpperCase() + t.windShift.slice(1) : `${base} · ${t.windShift}`
  return base ?? t.calmWind
}
