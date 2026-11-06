/**
 * Contenido del widget: con la consola respondiendo usa el idioma y las unidades guardados y recuerda la lectura;
 * si la consola no responde, dibuja completa la última lectura guardada (por el widget o por la app), en gris y con
 * su hora; "sin conexión" queda solo si nunca hubo una. Devuelve las versiones clara y oscura.
 * Fuente: nota de diseño de los widgets (estado sin conexión, tema del sistema); reporte de uso (el widget quedaba
 * "sin conexión" casi siempre que se dejaba solo, aunque ya había visto datos).
 * Requerimientos: RF-APP-02, RF-APP-10.
 */
import AsyncStorage from '@react-native-async-storage/async-storage'
import { type LiveWeatherRepository, mapDavisLive } from '@tt/core'
import { LEGACY_WIDGET_KEY, saveLastReading } from '@/lib/last-reading'
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

  const failing = () => { mockLive.repository = { getCurrent: async () => { throw new Error('sin red') } } }

  it('si la consola falla después, dibuja completa la última lectura, en gris y con su hora', async () => {
    await loadWidgetText()
    failing()
    const text = await loadWidgetText()
    expect(text).toMatchObject({ temperature: '18°', stale: true })
    expect(text.kind).not.toBe('offline')
    expect(text.condition).not.toBe('Sin conexión')
    expect(text.detail).toMatch(/^Última: \d{2}:\d{2}$/)
    expect(text.facts[0]?.value).toMatch(/^\d+ %$/)
  })

  it('usa la lectura que guardó la app aunque el widget nunca haya conectado', async () => {
    await saveLastReading(mapDavisLive(fixture as never))
    failing()
    expect(await loadWidgetText()).toMatchObject({ temperature: '18°', stale: true })
  })

  it('con la lectura que le pasa la app no vuelve a pedirla', async () => {
    const getCurrent = jest.fn(async () => mapDavisLive(fixture as never))
    mockLive.repository = { getCurrent }
    const text = await loadWidgetText(mapDavisLive(fixture as never))
    expect(text.stale).toBe(false)
    expect(getCurrent).not.toHaveBeenCalled()
  })

  it('solo sin ninguna lectura guardada queda "sin conexión"', async () => {
    failing()
    expect(await loadWidgetText()).toMatchObject({ kind: 'offline', condition: 'Sin conexión', temperature: '—' })
  })

  it('si solo hay el respaldo del formato anterior, muestra esa temperatura', async () => {
    await AsyncStorage.setItem(LEGACY_WIDGET_KEY, JSON.stringify({ stationName: 'Liz', temperatureC: 20, observedAt: '2026-10-24T15:00:00Z' }))
    failing()
    expect(await loadWidgetText()).toMatchObject({ kind: 'offline', temperature: '20°' })
  })

  it('entrega la versión clara y la oscura para que Android elija según el sistema', async () => {
    const representation = renderWeatherWidget('WeatherWide', await loadWidgetText()) as { light: { props: { theme: string } }; dark: { props: { theme: string } } }
    expect([representation.light.props.theme, representation.dark.props.theme]).toEqual(['light', 'dark'])
  })
})
