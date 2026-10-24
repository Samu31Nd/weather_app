/**
 * Casos de uso y composition root, con repositorios en memoria y un reloj fijo (sin red).
 * Fuente: docs/04-modelo-dominio.md (casos de uso) y docs/03-arquitectura.md (DI con `createCore`).
 * Requerimientos: RF-APP-01, RF-APP-03, RF-APP-06, RNF-APP-08.
 */
import { describe, expect, it, vi } from 'vitest'
import { mapDavisLive } from '../../src/adapters/davis-live/davis-live.mapper'
import { GetHistory } from '../../src/application/get-history'
import { ResolveCurrentSky } from '../../src/application/resolve-current-sky'
import { createCore } from '../../src/container'
import type { DateRange, HistorySample } from '../../src/domain/history'
import type { HistoryRepository, LiveWeatherRepository } from '../../src/ports'
import { liveFixture } from '../fixtures/load'

const fixedClock = (iso: string) => ({ now: () => new Date(iso) })

class InMemoryHistory implements HistoryRepository {
  readonly requests: DateRange[] = []
  async getSamples(range: DateRange): Promise<HistorySample[]> {
    this.requests.push(range)
    // Devuelve una muestra en cada extremo del tramo: los extremos se repiten entre tramos contiguos.
    return [range.end, range.start].map((at) => ({ at }) as HistorySample)
  }
}

describe('GetHistory', () => {
  it('pide 30 días en 3 tramos y entrega las muestras sin duplicados y en orden', async () => {
    const repository = new InMemoryHistory()
    const start = new Date('2026-09-20T06:00:00Z')
    const end = new Date('2026-10-20T06:00:00Z')
    const samples = await new GetHistory(repository).execute({ start, end })
    expect(repository.requests).toHaveLength(3)
    expect(samples.map((s) => s.at.toISOString())).toEqual([
      '2026-09-20T06:00:00.000Z', '2026-09-30T06:00:00.000Z', '2026-10-10T06:00:00.000Z', '2026-10-20T06:00:00.000Z',
    ])
  })

  it('no consulta la fuente si el periodo está vacío', async () => {
    const repository = new InMemoryHistory()
    const at = new Date('2026-10-20T06:00:00Z')
    expect(await new GetHistory(repository).execute({ start: at, end: at })).toEqual([])
    expect(repository.requests).toHaveLength(0)
  })
})

describe('ResolveCurrentSky', () => {
  const reading = mapDavisLive(liveFixture())

  it('elige "despejado de día" para la lectura real (regla 1, 09:59 en CDMX)', () => {
    expect(new ResolveCurrentSky(fixedClock('2026-10-24T15:59:58Z')).execute(reading)).toBe('clearDay')
  })

  it('elige "amanecer" si la misma lectura se evalúa 20 min después de que salió el sol', () => {
    expect(new ResolveCurrentSky(fixedClock('2026-10-24T12:55:00Z')).execute(reading)).toBe('dawn')
  })

  it('elige "sin conexión" si no hay lectura', () => {
    expect(new ResolveCurrentSky(fixedClock('2026-10-24T15:00:00Z')).execute(null)).toBe('offline')
  })

  it('asume de día si la consola no dio amanecer ni ocaso', () => {
    const withoutSun = { ...reading, sun: { sunrise: null, sunset: null } }
    expect(new ResolveCurrentSky(fixedClock('2026-10-25T05:00:00Z')).execute(withoutSun)).toBe('clearDay')
  })
})

describe('createCore', () => {
  it('conecta los casos de uso con los repositorios inyectados', async () => {
    const live: LiveWeatherRepository = { getCurrent: vi.fn(async () => mapDavisLive(liveFixture())) }
    const core = createCore({ liveRepository: live, historyRepository: new InMemoryHistory(), clock: fixedClock('2026-10-24T15:00:00Z') })
    const reading = await core.getLiveWeather.execute()
    expect(live.getCurrent).toHaveBeenCalledOnce()
    expect(core.resolveCurrentSky.execute(reading)).toBe('clearDay')
  })

  it('crea los repositorios HTTP a partir de las URLs', () => {
    expect(() => createCore({ liveUrl: 'https://a.test/live', historyUrl: 'https://b.test/' })).not.toThrow()
  })

  it('exige las URLs si no se inyectan repositorios', () => {
    expect(() => createCore({ historyUrl: 'https://b.test/' })).toThrow(/liveUrl/)
    expect(() => createCore({ liveUrl: 'https://a.test/live' })).toThrow(/historyUrl/)
  })
})
