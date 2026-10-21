import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UnitSystem = 'metric' | 'imperial';

interface UnitContextType {
  unitSystem: UnitSystem;
  setUnitSystem: (unit: UnitSystem) => void;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export const UnitProvider = ({ children }: { children: ReactNode }) => {
  // Default to metric as requested
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>('metric');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadUnit = async () => {
      try {
        const storedUnit = await AsyncStorage.getItem('@app_unit');
        if (storedUnit === 'metric' || storedUnit === 'imperial') {
          setUnitSystemState(storedUnit);
        }
      } catch (e) {
        console.warn("Failed to load unit setting", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadUnit();
  }, []);

  const setUnitSystem = async (unit: UnitSystem) => {
    setUnitSystemState(unit);
    try {
      await AsyncStorage.setItem('@app_unit', unit);
    } catch (e) {
      console.warn("Failed to save unit setting", e);
    }
  };

  // Only render children after loaded to prevent initial flash
  if (!isLoaded) return null;

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
