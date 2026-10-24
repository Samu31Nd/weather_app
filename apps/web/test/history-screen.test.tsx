/**
 * Pantalla "Histórico" con una Cloud Function simulada (lecturas reales del 19-oct): pide el periodo por tramos,
 * dibuja las secciones con sus indicadores, oculta variables (siempre queda una), deshabilita resoluciones que no
 * caben en el rango y descarga lo que se ve.
 * Fuente: artboard `Main`; docs/02-casos-de-uso.md (CU-04, CU-05).
 * Requerimientos: RF-APP-06, RF-APP-07, RF-APP-08, RF-APP-09.
 */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type HistoryRepository, createCore, mapCleanWeatherRow } from '@tt/core'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HistoryScreen } from '@/components/history/history-screen'
import { AppProviders } from '@/components/providers/app-providers'

const fixture = JSON.parse(readFileSync(resolve(process.cwd(), '../../packages/core/test/fixtures/clean-weather-2026-10-19.json'), 'utf8'))
const samples = fixture.data.map(mapCleanWeatherRow)
const NOW = new Date('2026-10-20T18:00:00Z') // el 19-oct es "ayer": entra completo en 24 h y en 7 días

function renderHistory(repository: HistoryRepository) {
  const core = createCore({ historyRepository: repository, clock: { now: () => NOW } })
  return render(
    <AppProviders core={core}>
      <HistoryScreen />
    </AppProviders>,
  )
}

const workingSource = (): HistoryRepository => ({
  getSamples: vi.fn(async ({ start, end }) => samples.filter((s: { at: Date }) => s.at >= start && s.at <= end)),
})

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('pantalla "Histórico"', () => {
  it('muestra las cuatro secciones con los indicadores del periodo', async () => {
    renderHistory(workingSource())
    expect(await screen.findByRole('region', { name: 'Temperatura y humedad' })).toBeTruthy()
    for (const name of ['Viento', 'Lluvia', 'Presión barométrica']) expect(screen.getByRole('region', { name })).toBeTruthy()
    expect(screen.getByText('25.0 °C')).toBeTruthy() // máxima real del 19-oct
    // 7 días a 1 h = 168 puntos; solo el 19-oct tiene lecturas y el resto se ve como hueco.
    expect(screen.getByText('168 puntos · resolución 1 hora · 144 sin datos (hueco visible)')).toBeTruthy()
  })

  it('ocultar una variable quita su sección, pero la última no se puede ocultar', async () => {
    renderHistory(workingSource())
    await screen.findByRole('region', { name: 'Viento' })
    fireEvent.click(screen.getByRole('button', { name: /^Viento/ }))
    expect(screen.queryByRole('region', { name: 'Viento' })).toBeNull()
    for (const name of [/^Temperatura y humedad/, /^Lluvia/]) fireEvent.click(screen.getByRole('button', { name }))
    fireEvent.click(screen.getByRole('button', { name: /^Presión/ }))
    expect(screen.getByRole('region', { name: 'Presión barométrica' })).toBeTruthy()
  })

  it('en 24 h no deja elegir resolución semanal ni mensual', async () => {
    renderHistory(workingSource())
    await screen.findByRole('region', { name: 'Viento' })
    fireEvent.click(screen.getByRole('button', { name: '24 h' }))
    expect((screen.getByRole('button', { name: '1 semana' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: '15 min' }) as HTMLButtonElement).getAttribute('aria-pressed')).toBe('true')
  })

  it('pide 90 días en tramos de 10 días', async () => {
    const source = workingSource()
    renderHistory(source)
    await screen.findByRole('region', { name: 'Viento' })
    fireEvent.click(screen.getByRole('button', { name: '90 días' }))
    await waitFor(() => expect(source.getSamples).toHaveBeenCalledTimes(1 + 9))
  })

  it('descarga lo que se ve como CSV', async () => {
    const created: Blob[] = []
    vi.stubGlobal('URL', { createObjectURL: (blob: Blob) => (created.push(blob), 'blob:x'), revokeObjectURL: () => undefined })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    renderHistory(workingSource())
    await screen.findByRole('region', { name: 'Viento' })
    fireEvent.click(screen.getByRole('button', { name: 'CSV' }))
    expect(click).toHaveBeenCalledTimes(1)
    const text = await (created[0] as Blob).text()
    expect(text.split('\n')[0]).toMatch(/^time_america_mexico_city,temperature_degC/)
  })

  it('si la fuente falla, lo avisa y permite reintentar', async () => {
    const source: HistoryRepository = { getSamples: vi.fn(async () => { throw new Error('sin red') }) }
    renderHistory(source)
    expect(await screen.findByText('No se pudo cargar el histórico.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    await waitFor(() => expect(source.getSamples).toHaveBeenCalledTimes(2))
  })
})
