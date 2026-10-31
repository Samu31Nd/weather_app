// Arma el contenido del widget: lee las preferencias (idioma y unidades) y el dato en vivo con el mismo núcleo que
// la app. Si la consola no responde, muestra la última lectura guardada. Devuelve las versiones clara y oscura;
// Android elige según el tema del sistema.

import { buildCurrentConditions } from '@tt/core'
import { type WidgetText, catalogFor, createFormatter, widgetOfflineText, widgetText } from '@tt/i18n'
import type { WidgetRepresentation } from 'react-native-android-widget'
import { createMobileCore } from '@/lib/core'
import { loadLastReading, saveLastReading } from './last-reading'
import { WEATHER_WIDGET_WIDE, WeatherWidgetSmall, WeatherWidgetWide } from './weather-widget'

export async function loadWidgetText(): Promise<WidgetText> {
  const core = createMobileCore()
  const preferences = await core.getPreferences.execute()
  const t = catalogFor(preferences.language)
  const format = createFormatter(preferences.language, t)
  const now = core.clock.now()
  try {
    const reading = await core.getLiveWeather.execute()
    const view = buildCurrentConditions(reading, { units: preferences.units, now, scene: core.resolveCurrentSky.execute(reading) })
    await saveLastReading({ stationName: reading.station.name, temperatureC: reading.outdoor.temperatureC, observedAt: reading.observedAt })
    return widgetText(view, reading.station.name, t, format)
  } catch {
    return widgetOfflineText(await loadLastReading(), { units: preferences.units, now }, t, format)
  }
}

export function renderWeatherWidget(widgetName: string, text: WidgetText): WidgetRepresentation {
  const Widget = widgetName === WEATHER_WIDGET_WIDE ? WeatherWidgetWide : WeatherWidgetSmall
  return { light: <Widget text={text} theme="light" />, dark: <Widget text={text} theme="dark" /> }
}
