// Composition root de la app móvil: el núcleo con sus adaptadores de plataforma (ADR-0001).
// En móvil no hay CORS: la app lee la consola directo por HTTP (Android lo permite con `usesCleartextTraffic`).

import AsyncStorage from '@react-native-async-storage/async-storage'
import { type Core, createCore } from '@tt/core'

export function createMobileCore(): Core {
  return createCore({
    liveUrl: process.env.EXPO_PUBLIC_WEATHER_STATION_URL,
    historyUrl: process.env.EXPO_PUBLIC_HISTORY_API_URL,
    storage: AsyncStorage,
  })
}
