/**
 * Pantalla "Ahora" con una consola simulada (lectura real del fixture del núcleo): carga → dashboard, cambio de
 * idioma, de unidades y de tema, y ningún dato interno de red en la página.
 * Fuente: artboards `LoadingWeb` y `Dashboard`; docs/02-casos-de-uso.md (CU-01, CU-06).
 * Requerimientos: RF-APP-01, RF-APP-02, RF-APP-05, RF-APP-10, RNF-APP-07.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createCore, mapDavisLive, type LiveWeatherRepository } from '@tt/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NowScreen } from '@/components/now/now-screen'
import { AppProviders } from '@/components/providers/app-providers'

const fixture = JSON.parse(readFileSync(resolve(process.cwd(), '../../packages/core/test/fixtures/wflexp-2026-10-24.json'), 'utf8'))
const NOW = new Date('2026-10-24T15:59:58Z')

function renderNow(repository: LiveWeatherRepository) {
  const core = createCore({ liveRepository: repository, clock: { now: () => NOW } })
  return render(
    <AppProviders core={core}>
      <NowScreen />
    </AppProviders>,
  )
}

const workingConsole = (): LiveWeatherRepository => ({ getCurrent: vi.fn(async () => mapDavisLive(fixture)) })

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
  document.documentElement.className = ''
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

/** Primero llega la lectura; luego corre la pausa de 600 ms para mostrar "¡Listo!" antes de abrir el panel. */
async function waitForDashboard() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10)
  })
  await act(async () => {
    await vi.advanceTimersByTimeAsync(700)
  })
}

describe('pantalla "Ahora"', () => {
  it('muestra la carga y luego el panel con la temperatura real en °C', async () => {
    renderNow(workingConsole())
    expect(screen.getByText('Preparando tu estación')).toBeTruthy()
    await waitForDashboard()
    expect(screen.getByRole('region', { name: 'Condiciones actuales' })).toBeTruthy()
    expect(screen.getByText('17.8')).toBeTruthy()
    expect(screen.getAllByText('°C').length).toBeGreaterThan(0)
  })

  it('al volver de otra página abre el panel sin repetir la pantalla de carga', async () => {
    const repository = workingConsole()
    const core = createCore({ liveRepository: repository, clock: { now: () => NOW } })
    const page = (showNow: boolean) => <AppProviders core={core}>{showNow ? <NowScreen /> : <p>Histórico</p>}</AppProviders>
    const { rerender } = render(page(true))
    await waitForDashboard()
    rerender(page(false))
    rerender(page(true))
    expect(screen.queryByText('Preparando tu estación')).toBeNull()
    expect(screen.getByRole('region', { name: 'Condiciones actuales' })).toBeTruthy()
  })

  it('cambia a inglés y a unidades imperiales desde la cabecera', async () => {
    renderNow(workingConsole())
    await waitForDashboard()
    fireEvent.click(screen.getByRole('button', { name: 'EN' }))
    fireEvent.click(screen.getByRole('button', { name: 'IMPERIAL' }))
    expect(screen.getByRole('region', { name: 'Current conditions' })).toBeTruthy()
    expect(screen.getByText('64.1')).toBeTruthy()
    expect(document.documentElement.lang).toBe('en')
  })

  it('el botón de tema pone el tema oscuro en la página', async () => {
    renderNow(workingConsole())
    await waitForDashboard()
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar a tema oscuro' }))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('no muestra datos internos de red de la estación', async () => {
    const { container } = renderNow(workingConsole())
    await waitForDashboard()
    expect(container.innerHTML).not.toMatch(/00:00:00:00:00:00|10\.0\.0\.0|redacted/)
  })

  it('si la consola no responde, lo avisa y permite reintentar', async () => {
    const failing: LiveWeatherRepository = { getCurrent: vi.fn(async () => { throw new Error('sin red') }) }
    renderNow(failing)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })
    expect(screen.getByText('No se pudo conectar con la consola.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(failing.getCurrent).toHaveBeenCalledTimes(2)
  })
})
