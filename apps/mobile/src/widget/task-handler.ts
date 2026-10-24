// Manejador que Android llama al agregar, actualizar (cada 30 min), redimensionar o tocar un widget. El toque
// general abre la app (lo resuelve Android); el ícono ↻ pide datos nuevos.

import type { WidgetTaskHandlerProps } from 'react-native-android-widget'
import { REFRESH_ACTION } from './weather-widget'
import { loadWidgetText, renderWeatherWidget } from './widget-content'

export async function weatherWidgetTaskHandler({ widgetInfo, widgetAction, clickAction, renderWidget }: WidgetTaskHandlerProps): Promise<void> {
  if (widgetAction === 'WIDGET_DELETED') return
  if (widgetAction === 'WIDGET_CLICK' && clickAction !== REFRESH_ACTION) return
  renderWidget(renderWeatherWidget(widgetInfo.widgetName, await loadWidgetText()))
}
