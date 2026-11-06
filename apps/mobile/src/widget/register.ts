// Registro de los widgets y actualización a pedido desde la app. Este módulo importa la librería nativa: cárgalo
// solo si `WIDGETS_AVAILABLE`.

import type { LiveReading } from '@tt/core'
import { registerWidgetTaskHandler, requestWidgetUpdate } from 'react-native-android-widget'
import { weatherWidgetTaskHandler } from './task-handler'
import { WEATHER_WIDGET_SMALL, WEATHER_WIDGET_WIDE } from './weather-widget'
import { loadWidgetText, renderWeatherWidget } from './widget-content'

export function registerWeatherWidgets(): void {
  registerWidgetTaskHandler(weatherWidgetTaskHandler)
}

/** Redibuja los widgets que haya en la pantalla de inicio con la lectura que la app acaba de recibir. */
export async function refreshWeatherWidgets(reading: LiveReading): Promise<void> {
  const text = await loadWidgetText(reading)
  await Promise.all(
    [WEATHER_WIDGET_SMALL, WEATHER_WIDGET_WIDE].map((widgetName) => requestWidgetUpdate({ widgetName, renderWidget: () => renderWeatherWidget(widgetName, text) })),
  )
}
