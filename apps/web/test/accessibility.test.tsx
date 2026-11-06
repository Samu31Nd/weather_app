/**
 * Auditoría automática de accesibilidad con axe-core (WCAG 2.0–2.2 A y AA) sobre la carga, "Ahora" e "Histórico":
 * nombres accesibles, roles y ARIA válidos, etiquetas de formularios, jerarquía de encabezados y foco.
 * El contraste no se mide aquí (jsdom no calcula estilos): lo cubre `packages/tokens/test/tokens.test.ts` en los
 * dos temas, y el tema solo cambia variables de color, no la estructura.
 * Fuente: docs/07-interfaz.md (Accesibilidad); docs/08-calidad-pruebas.md (auditoría axe).
 * Requerimientos: RNF-APP-05.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, cleanup, render, screen } from '@testing-library/react'
import { type HistoryRepository, type LiveWeatherRepository, createCore, mapCleanWeatherRow, mapDavisLive } from '@tt/core'
import axe from 'axe-core'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HistoryScreen } from '@/components/history/history-screen'
import { NowScreen } from '@/components/now/now-screen'
import { AppProviders } from '@/components/providers/app-providers'

const fixtures = resolve(process.cwd(), '../../packages/core/test/fixtures')
const live = JSON.parse(readFileSync(`${fixtures}/wflexp-2026-10-24.json`, 'utf8'))
const history = JSON.parse(readFileSync(`${fixtures}/clean-weather-2026-10-19.json`, 'utf8')).data.map(mapCleanWeatherRow)

const liveRepository: LiveWeatherRepository = { getCurrent: async () => mapDavisLive(live) }
const historyRepository: HistoryRepository = {
  getSamples: async ({ start, end }) => history.filter((s: { at: Date }) => s.at >= start && s.at <= end),
}

function renderWith(screenNode: ReactNode, now: Date) {
  const core = createCore({ liveRepository, historyRepository, clock: { now: () => now } })
  return render(<AppProviders core={core}>{screenNode}</AppProviders>)
}

async function violations(): Promise<string[]> {
  const result = await axe.run(document.body, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    rules: { 'color-contrast': { enabled: false } },
  })
  return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('accesibilidad (axe)', () => {
  it('la pantalla de carga no tiene violaciones', async () => {
    renderWith(<NowScreen />, new Date('2026-10-24T15:59:58Z'))
    expect(await violations()).toEqual([])
  })

  it('"Ahora" no tiene violaciones', async () => {
    renderWith(<NowScreen />, new Date('2026-10-24T15:59:58Z'))
    await act(async () => { await vi.advanceTimersByTimeAsync(10) })
    await act(async () => { await vi.advanceTimersByTimeAsync(700) })
    await screen.findByRole('region', { name: 'Condiciones actuales' })
    expect(await violations()).toEqual([])
  })

  it('"Histórico" no tiene violaciones', async () => {
    renderWith(<HistoryScreen />, new Date('2026-10-20T18:00:00Z'))
    await screen.findByRole('region', { name: 'Viento' })
    expect(await violations()).toEqual([])
  })
})
