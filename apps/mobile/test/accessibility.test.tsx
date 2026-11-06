/**
 * Revisión automática de accesibilidad en móvil, lo que TalkBack necesita para leer cada control: todo lo que se
 * puede tocar tiene un rol (`accessibilityRole`), un nombre (texto visible o `accessibilityLabel`) y un área táctil
 * de al menos 44 dp (alto, o alto + `hitSlop`). Recorre la carga, "Ahora", la hoja de ajustes, "Histórico" y la
 * hoja de descarga. La lectura real con TalkBack es manual: lista en docs/08-calidad-pruebas.md.
 * Fuente: docs/07-interfaz.md (Accesibilidad).
 * Requerimientos: RNF-APP-05.
 */
import AsyncStorage from '@react-native-async-storage/async-storage'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { type HistoryRepository, createCore, mapCleanWeatherRow, mapDavisLive } from '@tt/core'
import type { ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import type { TestInstance } from 'test-renderer'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { HistoryScreen } from '@/components/history/history-screen'
import { NowScreen } from '@/components/now/now-screen'
import { AppProviders } from '@/providers/app-providers'
import history from '../../../packages/core/test/fixtures/clean-weather-2026-10-19.json'
import live from '../../../packages/core/test/fixtures/wflexp-2026-10-24.json'

jest.mock('@/lib/share-file', () => ({ shareFile: jest.fn(async () => undefined) }))

const SAFE_AREA = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } }
const MIN_TARGET_DP = 44
const samples = history.data.map((row) => mapCleanWeatherRow(row as never))
const historyRepository: HistoryRepository = { getSamples: async ({ start, end }) => samples.filter((s) => s.at >= start && s.at <= end) }

async function renderWith(node: ReactNode, now: Date) {
  const core = createCore({
    liveRepository: { getCurrent: async () => mapDavisLive(live as never) },
    historyRepository,
    clock: { now: () => now },
    storage: AsyncStorage,
  })
  await render(
    <SafeAreaProvider initialMetrics={SAFE_AREA}>
      <AppProviders core={core}>{node}</AppProviders>
    </SafeAreaProvider>,
  )
}

/** Elementos nativos que responden a un toque (lo que TalkBack anuncia como control). */
function touchables(): TestInstance[] {
  return screen.container.queryAll((node) => typeof node.props.onClick === 'function')
}

function accessibleName(node: TestInstance): string {
  if (node.props.accessibilityLabel) return String(node.props.accessibilityLabel)
  const texts = [node, ...node.queryAll((child) => child.type === 'Text')]
  return texts.flatMap((text) => text.children.filter((c): c is string => typeof c === 'string')).join(' ').trim()
}

function targetHeight(node: TestInstance): number {
  const style = StyleSheet.flatten(node.props.style) ?? {}
  // Un fondo a pantalla completa (`absoluteFill`, p. ej. tocar fuera de una hoja para cerrarla) siempre alcanza.
  if (style.position === 'absolute' && style.top === 0 && style.bottom === 0) return Number.POSITIVE_INFINITY
  const height = Number(style.minHeight ?? style.height ?? 0)
  const slop = node.props.hitSlop
  const extra = typeof slop === 'number' ? 2 * slop : (slop?.top ?? 0) + (slop?.bottom ?? 0)
  return height + extra
}

function problems(): string[] {
  return touchables().flatMap((node) => {
    const name = accessibleName(node) || '(sin nombre)'
    const issues: string[] = []
    if (!node.props.accessibilityRole && !node.props.role) issues.push(`${name}: sin rol`)
    if (name === '(sin nombre)') issues.push(`control sin nombre (${node.props.testID ?? node.type})`)
    if (targetHeight(node) < MIN_TARGET_DP) issues.push(`${name}: área táctil de ${targetHeight(node)} dp`)
    return issues
  })
}

beforeEach(async () => {
  jest.useFakeTimers()
  await AsyncStorage.clear()
})
afterEach(() => jest.useRealTimers())

describe('accesibilidad de los controles (móvil)', () => {
  it('la carga, "Ahora" y la hoja de ajustes', async () => {
    await renderWith(<NowScreen />, new Date('2026-10-24T15:59:58Z'))
    await act(async () => { await jest.advanceTimersByTimeAsync(10) })
    await act(async () => { await jest.advanceTimersByTimeAsync(700) })
    expect(touchables().length).toBeGreaterThan(0)
    expect(problems()).toEqual([])
    await fireEvent.press(screen.getByLabelText('Ajustes'))
    expect(problems()).toEqual([])
  })

  it('"Histórico" y la hoja de descarga', async () => {
    await renderWith(<HistoryScreen />, new Date('2026-10-20T18:00:00Z'))
    await screen.findByText('1 de 4 secciones abiertas')
    expect(problems()).toEqual([])
    await fireEvent.press(screen.getByLabelText('Descargar lo que estás viendo'))
    expect(problems()).toEqual([])
  })
})
