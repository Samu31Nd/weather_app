// Infrastructure Layer - API Adapter
// Implements the WeatherRepository port using axios

import axios from 'axios'
import { Platform } from 'react-native'
import type { WeatherEntity, WeatherRepository } from '../../core/domain/models/WeatherEntity'
import type { WeatherApiResponse } from './WeatherApiDto'
import { mapApiResponseToEntity } from './WeatherApiMapper'

const API_URL: string = 'http://148.204.57.118/wflexp.json';

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
