// Arma el contenido del widget: lee las preferencias (idioma y unidades) y el dato en vivo con el mismo núcleo que
// la app. Si la consola no responde, dibuja completa la última lectura guardada (por la app o por el widget), en
// gris y con su hora; solo si nunca hubo una queda "sin conexión". Devuelve las versiones clara y oscura; Android
// elige según el tema del sistema.

import { type LiveReading, buildCurrentConditions } from '@tt/core'
import { type WidgetText, catalogFor, createFormatter, widgetOfflineText, widgetText } from '@tt/i18n'
import type { WidgetRepresentation } from 'react-native-android-widget'
import { createMobileCore } from '@/lib/core'
import { loadLastReading, loadLegacyWidgetReading, saveLastReading } from '@/lib/last-reading'
import { WEATHER_WIDGET_WIDE, WeatherWidgetSmall, WeatherWidgetWide } from './weather-widget'

/** `fresh`: la lectura que la app acaba de recibir; así el widget no la vuelve a pedir. */
export async function loadWidgetText(fresh?: LiveReading): Promise<WidgetText> {
  const core = createMobileCore()
  const preferences = await core.getPreferences.execute()
  const t = catalogFor(preferences.language)
  const format = createFormatter(preferences.language, t)
  const now = core.clock.now()
  const textFor = (reading: LiveReading, stale: boolean) => {
    const view = buildCurrentConditions(reading, { units: preferences.units, now, scene: core.resolveCurrentSky.execute(reading) })
    return widgetText(view, reading.station.name, t, format, { stale, now })
  }

  const reading = fresh ?? (await core.getLiveWeather.execute().catch(() => null))
  if (reading !== null) {
    await saveLastReading(reading)
    return textFor(reading, false)
  }
  const saved = await loadLastReading()
  if (saved !== null) return textFor(saved, true)
  return widgetOfflineText(await loadLegacyWidgetReading(), { units: preferences.units, now }, t, format)
}

export function renderWeatherWidget(widgetName: string, text: WidgetText): WidgetRepresentation {
  const Widget = widgetName === WEATHER_WIDGET_WIDE ? WeatherWidgetWide : WeatherWidgetSmall
  return { light: <Widget text={text} theme="light" />, dark: <Widget text={text} theme="dark" /> }
}
