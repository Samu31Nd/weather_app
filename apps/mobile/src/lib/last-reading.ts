// Última lectura en vivo recibida, guardada en AsyncStorage para dibujarla sin red. La guardan la app y el widget
// cada vez que reciben un dato; el widget la usa cuando la consola no responde, por vieja que sea. Este módulo no
// importa la librería nativa del widget: la app lo puede usar en cualquier plataforma.

import AsyncStorage from '@react-native-async-storage/async-storage'
import { type LiveReading, parseLiveReading, serializeLiveReading } from '@tt/core'
import type { WidgetLastReading } from '@tt/i18n'

export const LAST_READING_KEY = 'wx-last-reading'
/** Formato anterior del widget (solo temperatura y hora); se lee para no perderla al actualizar el APK. */
export const LEGACY_WIDGET_KEY = 'wx-widget-last'

export async function saveLastReading(reading: LiveReading): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_READING_KEY, serializeLiveReading(reading))
  } catch {
    // Sin almacenamiento solo se pierde el respaldo sin conexión.
  }
}

export async function loadLastReading(): Promise<LiveReading | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_READING_KEY)
    return raw === null ? null : parseLiveReading(raw)
  } catch {
    return null
  }
}

export async function loadLegacyWidgetReading(): Promise<WidgetLastReading | null> {
  try {
    const raw = await AsyncStorage.getItem(LEGACY_WIDGET_KEY)
    if (!raw) return null
    const stored = JSON.parse(raw) as { stationName: string; temperatureC: number | null; observedAt: string }
    const observedAt = new Date(stored.observedAt)
    return Number.isNaN(observedAt.getTime()) ? null : { stationName: stored.stationName, temperatureC: stored.temperatureC, observedAt }
  } catch {
    return null
  }
}
