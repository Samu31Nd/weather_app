// Composition root de la app móvil: el núcleo con sus adaptadores de plataforma (ADR-0001).
// El dato en vivo llega por el proxy `/api/live` de la web (ADR-0007): HTTPS y sin exponer la IP de la consola.
// En desarrollo, `.env` puede apuntar directo a la consola (Expo Go permite HTTP).

import AsyncStorage from '@react-native-async-storage/async-storage'
import { type Core, createCore } from '@tt/core'

export function createMobileCore(): Core {
  return createCore({
    liveUrl: process.env.EXPO_PUBLIC_WEATHER_STATION_URL,
    historyUrl: process.env.EXPO_PUBLIC_HISTORY_API_URL,
    storage: AsyncStorage,
  })
}
