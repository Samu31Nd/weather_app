/**
 * Widget de Android: con la lectura real del 24-oct dibuja los textos del diseño en los dos tamaños, toma los colores
 * del tema claro y oscuro (texto en gris si no hay conexión), no fija la fuente (respeta la del usuario) y el
 * manejador solo vuelve a pedir datos al tocar ↻.
 * Fuente: artboards `WidgetsClaro`/`WidgetsOscuro` y su nota de diseño.
 * Requerimientos: RF-APP-01, RF-APP-02, RNF-APP-05.
 */
import { type CurrentConditions, buildCurrentConditions, mapDavisLive } from '@tt/core'
import { CATALOGS, createFormatter, widgetOfflineText, widgetText } from '@tt/i18n'
import { WIDGET_PALETTES } from '@tt/tokens'
import type { ReactElement, ReactNode } from 'react'
import { REFRESH_ACTION, WeatherWidgetSmall, WeatherWidgetWide } from '@/widget/weather-widget'
import { weatherWidgetTaskHandler } from '@/widget/task-handler'
import fixture from '../../../packages/core/test/fixtures/wflexp-2026-10-24.json'

jest.mock('react-native-android-widget', () => {
  const widget = (name: string) => Object.assign(() => null, { displayName: name })
  return { FlexWidget: widget('FlexWidget'), TextWidget: widget('TextWidget'), SvgWidget: widget('SvgWidget') }
})
jest.mock('@/widget/widget-content', () => ({
  loadWidgetText: jest.fn(async () => ({ stub: true })),
  renderWeatherWidget: jest.fn(() => 'rendered'),
}))

const t = CATALOGS.es
const format = createFormatter('es', t)
const reading = mapDavisLive(fixture as never)
const view: CurrentConditions = buildCurrentConditions(reading, { units: 'metric', now: new Date('2026-10-24T15:59:58Z'), scene: 'partly' })
const text = widgetText(view, 'Liz', t, format)

type Node = ReactElement<{ children?: ReactNode; text?: string; style?: Record<string, unknown>; clickAction?: string }>

/** Recorre el árbol del widget (los componentes de la librería no se ejecutan: Android los lee como datos). */
function nodes(element: ReactNode): Node[] {
  if (!element || typeof element !== 'object') return []
  if (Array.isArray(element)) return element.flatMap(nodes)
  const node = element as Node
  return [node, ...nodes(node.props.children)]
}
const texts = (element: ReactNode) => nodes(element).filter((n) => (n.type as { displayName?: string }).displayName === 'TextWidget')

describe('widget 2×2', () => {
  const tree = WeatherWidgetSmall({ text, theme: 'dark' })

  it('muestra estación y hora, temperatura, condición y el dato contextual', () => {
    expect(texts(tree).map((n) => n.props.text)).toEqual([text.station, '18°', 'Parcialmente nublado', text.detail])
  })

  it('usa el fondo del clima en el tema oscuro y abre la app al tocarlo', () => {
    expect(tree.props.style).toMatchObject({ backgroundColor: WIDGET_PALETTES.dark.background.partly, borderRadius: 24 })
    expect(tree.props.clickAction).toBe('OPEN_APP')
  })

  it('no fija la fuente: Android usa la del usuario', () => {
    for (const node of texts(tree)) expect(node.props.style?.fontFamily).toBeUndefined()
  })
})

describe('widget 4×2', () => {
  const tree = WeatherWidgetWide({ text, theme: 'light' })

  it('agrega sensación térmica y la columna de humedad, viento y lluvia', () => {
    const shown = texts(tree).map((n) => n.props.text)
    expect(shown).toEqual(expect.arrayContaining([text.feelsLike, 'Humedad', 'Viento', 'Lluvia hoy']))
  })

  it('el ícono ↻ pide una actualización', () => {
    expect(nodes(tree).some((n) => n.props.clickAction === REFRESH_ACTION)).toBe(true)
  })

  it('sin conexión, la temperatura va en gris', () => {
    const offline = widgetOfflineText(null, { units: 'metric', now: new Date() }, t, format)
    const temperature = texts(WeatherWidgetWide({ text: offline, theme: 'light' })).find((n) => n.props.text === offline.temperature)
    expect(temperature?.props.style?.color).toBe(WIDGET_PALETTES.light.muted)
  })
})

describe('manejador de Android', () => {
  const widgetInfo = { widgetName: 'WeatherSmall', widgetId: 1, width: 170, height: 170, screenInfo: { screenHeightDp: 800, screenWidthDp: 400, density: 3, densityDpi: 480, fontScale: 1 } }

  it.each(['WIDGET_ADDED', 'WIDGET_UPDATE', 'WIDGET_RESIZED'] as const)('%s dibuja el widget', async (widgetAction) => {
    const renderWidget = jest.fn()
    await weatherWidgetTaskHandler({ widgetInfo, widgetAction, renderWidget })
    expect(renderWidget).toHaveBeenCalledWith('rendered')
  })

  it('solo el toque en ↻ vuelve a pedir datos; borrar el widget no hace nada', async () => {
    const renderWidget = jest.fn()
    await weatherWidgetTaskHandler({ widgetInfo, widgetAction: 'WIDGET_CLICK', clickAction: 'OTHER', renderWidget })
    await weatherWidgetTaskHandler({ widgetInfo, widgetAction: 'WIDGET_DELETED', renderWidget })
    expect(renderWidget).not.toHaveBeenCalled()
    await weatherWidgetTaskHandler({ widgetInfo, widgetAction: 'WIDGET_CLICK', clickAction: REFRESH_ACTION, renderWidget })
    expect(renderWidget).toHaveBeenCalledTimes(1)
  })
})
