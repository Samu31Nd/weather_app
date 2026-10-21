// Application Layer - Use Cases
// Business logic and orchestration

import type { WeatherEntity, WeatherRepository } from '../domain/weather.entity'

export class GetWeatherUseCase {
  constructor(private weatherRepository: WeatherRepository) {}

  async execute(): Promise<WeatherEntity> {
    return this.weatherRepository.fetchWeatherData()
  }
}

// Utility functions for the application layer
export function formatTemperatureFromEntity(
  value: number | null,
  isMetric: boolean
): string {
  if (value === null) return '--'
  if (isMetric) {
    const celsius = ((value - 32) * 5) / 9
    return `${celsius.toFixed(1)}°C`
  }
  return `${value.toFixed(1)}°F`
}

export function formatSpeedFromEntity(
  value: number | null,
  isMetric: boolean
): string {
  if (value === null) return '--'
  if (isMetric) {
    const kmh = value * 1.60934
    return `${kmh.toFixed(1)} km/h`
  }
  return `${value.toFixed(1)} mph`
}

export function formatPressureFromEntity(
  value: number | null,
  isMetric: boolean
): string {
  if (value === null) return '--'
  if (isMetric) {
    const hpa = value * 33.8639
    return `${hpa.toFixed(0)} hPa`
  }
  return `${value.toFixed(3)} inHg`
}

export function formatRainFromEntity(
  value: number | null,
  isMetric: boolean
): string {
  if (value === null) return '--'
  if (isMetric) {
    const mm = value * 25.4
    return `${mm.toFixed(1)} mm`
  }
  return `${value.toFixed(2)} in`
}

export function getWindDirectionLabel(degrees: number | null): string {
  if (degrees === null) return '--'
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ]
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

export function getBarometerTrendInfo(
  trend: number
): { label: string; direction: 'up' | 'down' | 'steady' } {
  if (trend < 20) return { label: 'Falling', direction: 'down' }
  if (trend > 20) return { label: 'Rising', direction: 'up' }
  return { label: 'Steady', direction: 'steady' }
}
