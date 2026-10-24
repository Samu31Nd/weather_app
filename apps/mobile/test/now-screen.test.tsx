/**
 * Pantalla "Ahora" en móvil con una consola simulada (lectura real del fixture del núcleo): carga → panel, cambio
 * de idioma y de unidades desde la hoja de ajustes, y preferencias guardadas con las claves `wx-*`.
 * Fuente: artboards `LoadingMobile` y `MobileNow`; docs/02-casos-de-uso.md (CU-01, CU-06).
 * Requerimientos: RF-APP-01, RF-APP-02, RF-APP-06, RF-APP-08, RF-APP-10.
 */
import AsyncStorage from '@react-native-async-storage/async-storage'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { type LiveWeatherRepository, createCore, mapDavisLive } from '@tt/core'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NowScreen } from '@/components/now/now-screen'
import { AppProviders } from '@/providers/app-providers'
import fixture from '../../../packages/core/test/fixtures/wflexp-2026-10-24.json'

const NOW = new Date('2026-10-24T15:59:58Z')
const SAFE_AREA = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } }

const workingConsole = (): LiveWeatherRepository => ({ getCurrent: jest.fn(async () => mapDavisLive(fixture as never)) })
const failingConsole = (): LiveWeatherRepository => ({ getCurrent: jest.fn(async () => { throw new Error('sin red') }) })

async function renderNow(repository: LiveWeatherRepository) {
  const core = createCore({ liveRepository: repository, clock: { now: () => NOW }, storage: AsyncStorage })
  return await render(
    <SafeAreaProvider initialMetrics={SAFE_AREA}>
      <AppProviders core={core}>
        <NowScreen />
      </AppProviders>
    </SafeAreaProvider>,
  )
}

/** Llega la lectura y corre la pausa de 600 ms que deja ver "¡Listo!" antes de abrir el panel. */
async function waitForDashboard() {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(10)
  })
  await act(async () => {
    await jest.advanceTimersByTimeAsync(700)
  })
}

beforeEach(async () => {
  jest.useFakeTimers()
  await AsyncStorage.clear()
})
afterEach(() => {
  jest.useRealTimers()
})

describe('pantalla "Ahora" (móvil)', () => {
  it('muestra la carga y luego el panel con la temperatura real en °C', async () => {
    await renderNow(workingConsole())
    expect(screen.getByText('Preparando tu estación')).toBeTruthy()
    await waitForDashboard()
    expect(screen.getByLabelText('Condiciones actuales')).toBeTruthy()
    expect(screen.getByText('17.8')).toBeTruthy()
    expect(screen.getByText('En vivo')).toBeTruthy()
  })

  it('cambia a inglés e imperial desde la hoja de ajustes y lo guarda con las claves wx-*', async () => {
    await renderNow(workingConsole())
    await waitForDashboard()
    await fireEvent.press(screen.getByLabelText('Ajustes'))
    await fireEvent.press(screen.getByText('English'))
    await fireEvent.press(screen.getByText('Imperial'))
    await act(async () => {
      await jest.advanceTimersByTimeAsync(10)
    })
    expect(screen.getByLabelText('Current conditions')).toBeTruthy()
    expect(screen.getByText('64.1')).toBeTruthy()
    expect(await AsyncStorage.getItem('wx-lang')).toBe('en')
    expect(await AsyncStorage.getItem('wx-units')).toBe('imperial')
  })

  it('si la consola no responde, lo avisa y permite reintentar', async () => {
    const repository = failingConsole()
    await renderNow(repository)
    await act(async () => {
      await jest.advanceTimersByTimeAsync(10)
    })
    expect(screen.getByText('No se pudo conectar con la consola.')).toBeTruthy()
    await fireEvent.press(screen.getByText('Reintentar'))
    expect(repository.getCurrent).toHaveBeenCalledTimes(2)
  })
})
