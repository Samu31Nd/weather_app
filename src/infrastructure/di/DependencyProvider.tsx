import React, { createContext, useContext, ReactNode } from 'react';
import { MockStationRepository } from '../adapters/MockStationRepository';
import { InitializeStationUseCase } from '../../core/application/use-cases/InitializeStationUseCase';

interface Dependencies {
  initializeStationUseCase: InitializeStationUseCase;
}

const stationRepo = new MockStationRepository();
const initializeStationUseCase = new InitializeStationUseCase(stationRepo);

const defaultDependencies: Dependencies = {
  initializeStationUseCase,
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
