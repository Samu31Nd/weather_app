// Última lectura que vio el widget, para mostrarla en gris si la consola no responde en la siguiente
// actualización. Solo guarda lo que muestra el estado "sin conexión" (temperatura y hora).

import AsyncStorage from '@react-native-async-storage/async-storage'
import type { WidgetLastReading } from '@tt/i18n'

const KEY = 'wx-widget-last'

export async function saveLastReading(last: WidgetLastReading): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...last, observedAt: last.observedAt.toISOString() }))
  } catch {
    // Sin almacenamiento el widget solo pierde el respaldo para "sin conexión".
  }
}

export async function loadLastReading(): Promise<WidgetLastReading | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    if (!raw) return null
    const stored = JSON.parse(raw) as { stationName: string; temperatureC: number | null; observedAt: string }
    return { stationName: stored.stationName, temperatureC: stored.temperatureC, observedAt: new Date(stored.observedAt) }
  } catch {
    return null
  }
}
