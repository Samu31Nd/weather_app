// Caso de uso: escena del cielo para una lectura en vivo, o "sin conexión" si no la hay (RF-APP-03).

import { decodeForecast } from '../domain/forecast'
import type { LiveReading } from '../domain/live-reading'
import { type SkyScene, resolveSkyScene } from '../domain/sky-scene'
import { type DayPhase, dayPhase } from '../domain/sun'
import type { Clock } from '../ports'

export class ResolveCurrentSky {
  constructor(private readonly clock: Clock) {}

  execute(reading: LiveReading | null): SkyScene {
    if (reading === null) return resolveSkyScene({ ...EMPTY_CONDITIONS, forecast: null })
    return resolveSkyScene({
      forecast: decodeForecast(reading.forecastRule),
      phase: this.phaseFor(reading),
      rainRateMmH: reading.rain.rateMmH,
      gustKmh: reading.wind.gustKmh,
      humidityPct: reading.outdoor.humidityPct,
      temperatureC: reading.outdoor.temperatureC,
      dewPointC: reading.outdoor.dewPointC,
    })
  }

  private phaseFor({ sun }: LiveReading): DayPhase {
    if (sun.sunrise === null || sun.sunset === null) return 'day'
    return dayPhase(this.clock.now(), { sunrise: sun.sunrise, sunset: sun.sunset })
  }
}

const EMPTY_CONDITIONS = {
  phase: 'day',
  rainRateMmH: null,
  gustKmh: null,
  humidityPct: null,
  temperatureC: null,
  dewPointC: null,
} as const
