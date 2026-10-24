/**
 * Pantalla "Histórico" en móvil con una Cloud Function simulada (lecturas reales del 19-oct): acordeones con su
 * resumen, abrir y cerrar todas, resoluciones no permitidas deshabilitadas y descarga por la hoja de compartir.
 * Fuente: artboard `MobileHistory`; docs/02-casos-de-uso.md (CU-04, CU-05).
 * Requerimientos: RF-APP-06, RF-APP-07, RF-APP-08, RF-APP-09.
 */
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { type HistoryRepository, createCore, mapCleanWeatherRow } from '@tt/core'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { HistoryScreen } from '@/components/history/history-screen'
import { shareFile } from '@/lib/share-file'
import { AppProviders } from '@/providers/app-providers'
import fixture from '../../../packages/core/test/fixtures/clean-weather-2026-10-19.json'

jest.mock('@/lib/share-file', () => ({ shareFile: jest.fn(async () => undefined) }))

const samples = fixture.data.map((row) => mapCleanWeatherRow(row as never))
const NOW = new Date('2026-10-20T18:00:00Z') // el 19-oct es "ayer"
const SAFE_AREA = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } }

const source = (): HistoryRepository => ({
  getSamples: jest.fn(async ({ start, end }) => samples.filter((s) => s.at >= start && s.at <= end)),
})

async function renderHistory(repository: HistoryRepository) {
  const core = createCore({ historyRepository: repository, clock: { now: () => NOW } })
  const view = await render(
    <SafeAreaProvider initialMetrics={SAFE_AREA}>
      <AppProviders core={core}>
        <HistoryScreen />
      </AppProviders>
    </SafeAreaProvider>,
  )
  await act(async () => {
    await Promise.resolve()
  })
  return view
}

describe('pantalla "Histórico" (móvil)', () => {
  it('abre la temperatura con su resumen y deja las demás secciones cerradas', async () => {
    await renderHistory(source())
    expect(await screen.findByText('1 de 4 secciones abiertas')).toBeTruthy()
    expect(screen.getByText(/ · 12\.0 °C – 25\.0 °C$/)).toBeTruthy() // promedio · mínima – máxima del 19-oct
    expect(screen.getByLabelText('Temperatura en el tiempo')).toBeTruthy()
    expect(screen.queryByLabelText('Velocidad y ráfaga de viento en el tiempo')).toBeNull()
  })

  it('"Abrir todas" despliega las cuatro secciones', async () => {
    await renderHistory(source())
    await screen.findByText('Abrir todas')
    await fireEvent.press(screen.getByText('Abrir todas'))
    expect(screen.getByText('4 de 4 secciones abiertas')).toBeTruthy()
    expect(screen.getByLabelText('Presión en el tiempo')).toBeTruthy()
  })

  it('en 24 h deshabilita la resolución semanal', async () => {
    await renderHistory(source())
    await screen.findByText('24 h')
    await fireEvent.press(screen.getByText('24 h'))
    expect(screen.getByRole('button', { name: '1 semana' }).props.accessibilityState).toMatchObject({ disabled: true })
  })

  it('descarga CSV de las secciones abiertas por la hoja de compartir', async () => {
    await renderHistory(source())
    await screen.findByText('1 de 4 secciones abiertas')
    await fireEvent.press(screen.getByLabelText('Descargar lo que estás viendo'))
    await fireEvent.press(screen.getByText('CSV'))
    const [file] = (shareFile as jest.Mock).mock.calls[0]
    expect(file.fileName).toMatch(/\.csv$/)
    expect(file.content.split('\n')[0]).toBe(
      'time_america_mexico_city,temperature_degC,temperature_min_degC,temperature_max_degC,humidity_pct,indoor_temperature_degC,indoor_humidity_pct',
    )
  })
})
