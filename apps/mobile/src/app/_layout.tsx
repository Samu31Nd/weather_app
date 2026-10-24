// Raíz de la app: fuentes del diseño, providers y barra de estado según el tema. La pantalla de arranque nativa
// se mantiene hasta tener las fuentes y las preferencias guardadas, para no pintar con las de fábrica.

import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AppProviders, usePreferences } from '@/providers/app-providers'
import { FONT_SOURCES } from '@/theme/fonts'

void SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts(FONT_SOURCES)
  return (
    <SafeAreaProvider>
      <AppProviders>
        <ThemedStack fontsLoaded={fontsLoaded} />
      </AppProviders>
    </SafeAreaProvider>
  )
}

function ThemedStack({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { loaded, isDark, palette } = usePreferences()
  const ready = fontsLoaded && loaded

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync()
  }, [ready])

  if (!ready) return null
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.bg } }} />
    </>
  )
}
