/**
 * Contenido del widget: con la consola respondiendo usa el idioma y las unidades guardados y recuerda la lectura;
 * si la consola no responde, muestra esa última lectura como "sin conexión". Devuelve las versiones clara y oscura.
 * Fuente: nota de diseño de los widgets (estado sin conexión, tema del sistema).
 * Requerimientos: RF-APP-02, RF-APP-10.
 */
import AsyncStorage from '@react-native-async-storage/async-storage'
import { type LiveWeatherRepository, mapDavisLive } from '@tt/core'
import { loadWidgetText, renderWeatherWidget } from '@/widget/widget-content'
import fixture from '../../../packages/core/test/fixtures/wflexp-2026-10-24.json'

jest.mock('react-native-android-widget', () => ({ FlexWidget: () => null, TextWidget: () => null, SvgWidget: () => null }))

const mockLive: { repository: LiveWeatherRepository } = { repository: { getCurrent: async () => mapDavisLive(fixture as never) } }
jest.mock('@/lib/core', () => ({
  createMobileCore: () =>
    jest.requireActual('@tt/core').createCore({
      liveRepository: { getCurrent: () => mockLive.repository.getCurrent() },
      storage: require('@react-native-async-storage/async-storage'),
      clock: { now: () => new Date('2026-10-24T15:59:58Z') },
    }),
}))

beforeEach(async () => {
  await AsyncStorage.clear()
  mockLive.repository = { getCurrent: async () => mapDavisLive(fixture as never) }
})

describe('contenido del widget', () => {
  it('usa las preferencias guardadas (inglés, imperial)', async () => {
    await AsyncStorage.multiSet([['wx-lang', 'en'], ['wx-units', 'imperial']])
    const text = await loadWidgetText()
    expect(text.temperature).toBe('64°')
    expect(text.facts[0]?.label).toBe('Humidity')
    expect(text.stale).toBe(false)
  })

  it('si la consola falla después, muestra la última lectura como sin conexión', async () => {
    await loadWidgetText()
    mockLive.repository = { getCurrent: async () => { throw new Error('sin red') } }
    const text = await loadWidgetText()
    expect(text).toMatchObject({ kind: 'offline', temperature: '18°', stale: true, condition: 'Sin conexión' })
  })

  it('entrega la versión clara y la oscura para que Android elija según el sistema', async () => {
    const representation = renderWeatherWidget('WeatherWide', await loadWidgetText()) as { light: { props: { theme: string } }; dark: { props: { theme: string } } }
    expect([representation.light.props.theme, representation.dark.props.theme]).toEqual(['light', 'dark'])
  })
})
