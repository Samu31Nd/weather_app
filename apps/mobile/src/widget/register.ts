// Registro de los widgets y actualización a pedido desde la app. Este módulo importa la librería nativa: cárgalo
// solo si `WIDGETS_AVAILABLE`.

import { registerWidgetTaskHandler, requestWidgetUpdate } from 'react-native-android-widget'
import { weatherWidgetTaskHandler } from './task-handler'
import { WEATHER_WIDGET_SMALL, WEATHER_WIDGET_WIDE } from './weather-widget'
import { loadWidgetText, renderWeatherWidget } from './widget-content'

export function registerWeatherWidgets(): void {
  registerWidgetTaskHandler(weatherWidgetTaskHandler)
}

/** Redibuja los widgets que haya en la pantalla de inicio (p. ej. al abrir la app con un dato nuevo). */
export async function refreshWeatherWidgets(): Promise<void> {
  const text = await loadWidgetText()
  await Promise.all(
    [WEATHER_WIDGET_SMALL, WEATHER_WIDGET_WIDE].map((widgetName) => requestWidgetUpdate({ widgetName, renderWidget: () => renderWeatherWidget(widgetName, text) })),
  )
}
