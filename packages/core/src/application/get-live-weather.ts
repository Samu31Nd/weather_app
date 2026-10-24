// Caso de uso: obtener la lectura en vivo (RF-APP-01, RF-APP-02).

import type { LiveReading } from '../domain/live-reading'
import type { LiveWeatherRepository } from '../ports'

export class GetLiveWeather {
  constructor(private readonly repository: LiveWeatherRepository) {}

  execute(): Promise<LiveReading> {
    return this.repository.getCurrent()
  }
}
