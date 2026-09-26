import React, { createContext, useContext, ReactNode } from 'react';
import { MockStationRepository } from '../adapters/MockStationRepository';
import { InitializeStationUseCase } from '../../core/application/use-cases/InitializeStationUseCase';
import { weatherApiAdapter } from '../weather-api/WeatherApiAdapter';
import { GetLiveWeatherUseCase } from '../../core/application/usecases/GetLiveWeatherUseCase';

interface Dependencies {
  initializeStationUseCase: InitializeStationUseCase;
  getLiveWeatherUseCase: GetLiveWeatherUseCase;
}

const stationRepo = new MockStationRepository();
const initializeStationUseCase = new InitializeStationUseCase(stationRepo);
const getLiveWeatherUseCase = new GetLiveWeatherUseCase(weatherApiAdapter);

const defaultDependencies: Dependencies = {
  initializeStationUseCase,
  getLiveWeatherUseCase,
};

const DependencyContext = createContext<Dependencies>(defaultDependencies);

export const DependencyProvider = ({ children }: { children: ReactNode }) => {
  return (
    <DependencyContext.Provider value={defaultDependencies}>
      {children}
    </DependencyContext.Provider>
  );
};

export const useDependencies = () => useContext(DependencyContext);
