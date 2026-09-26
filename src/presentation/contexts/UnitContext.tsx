import React, { createContext, useContext, useState, ReactNode } from 'react';

type UnitSystem = 'metric' | 'imperial';

interface UnitContextType {
  unitSystem: UnitSystem;
  setUnitSystem: (unit: UnitSystem) => void;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export const UnitProvider = ({ children }: { children: ReactNode }) => {
  // Assuming the station defaults to imperial (F, mph, inHg, inches) based on raw data
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');

  return (
    <UnitContext.Provider value={{ unitSystem, setUnitSystem }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnit = () => {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error('useUnit must be used within a UnitProvider');
  }
  return context;
};

// Helper for conversions (assuming raw data is Imperial)
export const convertTemp = (tempF: number | null, unit: UnitSystem) => {
  if (tempF === null) return null;
  if (unit === 'imperial') return tempF;
  return (tempF - 32) * (5 / 9);
};

export const convertPressure = (inHg: number | null, unit: UnitSystem) => {
  if (inHg === null) return null;
  if (unit === 'imperial') return inHg;
  return inHg * 33.8639; // to hPa
};

export const convertSpeed = (mph: number | null, unit: UnitSystem) => {
  if (mph === null) return null;
  if (unit === 'imperial') return mph;
  return mph * 1.60934; // to km/h
};

export const convertLength = (inches: number | null, unit: UnitSystem) => {
  if (inches === null) return null;
  if (unit === 'imperial') return inches;
  return inches * 25.4; // to mm
};
