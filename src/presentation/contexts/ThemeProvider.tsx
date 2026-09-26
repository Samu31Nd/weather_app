import React, { ReactNode, useEffect, useState } from 'react';
import { Appearance, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@app_theme');
        if (storedTheme === 'dark' || storedTheme === 'light') {
          if (Platform.OS !== 'web') {
            Appearance.setColorScheme(storedTheme);
          }
        }
      } catch (e) {
        console.warn("Failed to load theme setting", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  if (!isLoaded) return null;

  return <>{children}</>;
};
