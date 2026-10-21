import { WeatherEntity, WeatherRepository } from '../../domain/models/WeatherEntity';

export class GetLiveWeatherUseCase {
  constructor(private weatherRepository: WeatherRepository) {}

  async execute(): Promise<WeatherEntity> {
    return await this.weatherRepository.fetchWeatherData();
  }
}
