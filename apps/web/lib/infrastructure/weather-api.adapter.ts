// Infrastructure Layer - API Adapter
// Implements the WeatherRepository port using axios

import axios from 'axios'
import type { WeatherEntity, WeatherRepository } from '../domain/weather.entity'
import type { WeatherApiResponse } from './weather-api.dto'
import { mapApiResponseToEntity } from './weather.mapper'

const API_URL: string = process.env.NEXT_PUBLIC_API_URL! + 'wflexp.json';

export class WeatherApiAdapter implements WeatherRepository {
  async fetchWeatherData(): Promise<WeatherEntity> {
    const response = await axios.get<WeatherApiResponse>(API_URL, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      },
    })

    return mapApiResponseToEntity(response.data)
  }
}

// Singleton instance for use throughout the app
export const weatherApiAdapter = new WeatherApiAdapter()
