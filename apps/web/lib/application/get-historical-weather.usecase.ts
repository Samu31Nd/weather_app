// Use case for fetching historical weather data

import { CleanWeatherEntity, HistoricalQueryParams, PressureEntity, RainEntity, TemperatureEntity, WindEntity } from "../domain/historical-weather.entity"
import { cloudApiAdapter } from "../infrastructure/cloud-api.adapter"
import { CleanWeatherDto, PressureDto, RainDto, TemperatureDto, WindDto } from "../infrastructure/cloud-api.dto"
import { mapCleanWeatherDto, mapPressureDto, mapRainDto, mapTemperatureDto, mapWindDto } from "../infrastructure/cloud-api.mapper"


export interface HistoricalDataResult<T> {
  total: number
  data: T[]
  cachedAt?: string
}

export class GetHistoricalWeatherUseCase {
  async executeForTemperature(
    params: Omit<HistoricalQueryParams, 'view'>
  ): Promise<HistoricalDataResult<TemperatureEntity>> {
    const response = await cloudApiAdapter.fetchData<TemperatureDto>({
      ...params,
      view: 'vw_temperatura',
    })
    return {
      total: response.total,
      data: response.data.map(mapTemperatureDto),
    }
  }

  async executeForWind(
    params: Omit<HistoricalQueryParams, 'view'>
  ): Promise<HistoricalDataResult<WindEntity>> {
    const response = await cloudApiAdapter.fetchData<WindDto>({
      ...params,
      view: 'vw_viento',
    })
    return {
      total: response.total,
      data: response.data.map(mapWindDto),
    }
  }

  async executeForRain(
    params: Omit<HistoricalQueryParams, 'view'>
  ): Promise<HistoricalDataResult<RainEntity>> {
    const response = await cloudApiAdapter.fetchData<RainDto>({
      ...params,
      view: 'vw_lluvia',
    })
    return {
      total: response.total,
      data: response.data.map(mapRainDto),
    }
  }

  async executeForPressure(
    params: Omit<HistoricalQueryParams, 'view'>
  ): Promise<HistoricalDataResult<PressureEntity>> {
    const response = await cloudApiAdapter.fetchData<PressureDto>({
      ...params,
      view: 'vw_presion',
    })
    return {
      total: response.total,
      data: response.data.map(mapPressureDto),
    }
  }

  async executeForCleanWeather(
    params: Omit<HistoricalQueryParams, 'view'>
  ): Promise<HistoricalDataResult<CleanWeatherEntity>> {
    const response = await cloudApiAdapter.fetchData<CleanWeatherDto>({
      ...params,
      view: 'vw_clean_weather',
    })
    return {
      total: response.total,
      data: response.data.map(mapCleanWeatherDto),
    }
  }
}

export const getHistoricalWeatherUseCase = new GetHistoricalWeatherUseCase()
