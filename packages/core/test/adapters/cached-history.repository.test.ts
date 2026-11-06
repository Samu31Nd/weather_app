/**
 * Caché del histórico por día de CDMX: solo se piden a la Cloud Function los días que faltan, agrupados en tramos
 * contiguos; los días cerrados hace más de 48 h no vencen y los recientes vencen a la hora (el histórico llega con
 * retraso, D7). Persiste en el almacén clave-valor, tolera basura y fallas del almacén y respeta un tope de días.
 * Fuente: pedido de no saturar el backend con consultas repetidas; docs/06-datos.md (D7, tope de 1000 filas).
 * Requerimientos: RF-APP-06, RNF-APP-03.
 */
import { describe, expect, it, vi } from 'vitest'
import { CachedHistoryRepository, FINAL_AFTER_MS, HISTORY_CACHE_PREFIX, MAX_CACHED_DAYS, RECENT_TTL_MS } from '../../src/adapters/cached-history.repository'
import type { DateRange, HistorySample } from '../../src/domain/history'
import type { HistoryRepository, KeyValueStorage } from '../../src/ports'

const DAY = 86_400_000
const HOUR = 3_600_000
/** Medianoche del 1-oct-2026 en CDMX (UTC−6). */
const OCT_1 = Date.parse('2026-10-01T06:00:00Z')
const day = (n: number) => new Date(OCT_1 + n * DAY)
const range = (from: number, to: number): DateRange => ({ start: day(from), end: day(to) })

function sampleAt(at: number): HistorySample {
  return {
    at: new Date(at), temperatureC: 15.5, temperatureMaxC: 16, temperatureMinC: 15, indoorTemperatureC: null, humidityPct: 60,
    indoorHumidityPct: null, windKmh: 3, gustKmh: 6, windDirection: 'NE', gustDirection: null, rainMm: 0, rainRateMmH: 0,
    seaLevelPressureHPa: 1027,
  }
}

/** Fuente simulada: cuatro muestras por día (y la del extremo final, como la Cloud Function). */
function source(): HistoryRepository & { getSamples: ReturnType<typeof vi.fn> } {
  return {
    getSamples: vi.fn(async ({ start, end }: DateRange) => {
      const samples: HistorySample[] = []
      for (let at = start.getTime(); at <= end.getTime(); at += 6 * HOUR) samples.push(sampleAt(at))
      return samples
    }),
  }
}

function memoryStorage(): KeyValueStorage & { values: Map<string, string> } {
  const values = new Map<string, string>()
  return { values, getItem: (k) => values.get(k) ?? null, setItem: (k, v) => void values.set(k, v), removeItem: (k) => void values.delete(k) }
}

function setup(nowMs = OCT_1 + 30 * DAY) {
  const clock = { now: () => new Date(nowMs) }
  const storage = memoryStorage()
  const upstream = source()
  const make = () => new CachedHistoryRepository(upstream, storage, clock)
  return { upstream, storage, make, advance: (ms: number) => (nowMs += ms) }
}

const requested = (upstream: ReturnType<typeof source>) =>
  upstream.getSamples.mock.calls.map(([r]) => [(r.start.getTime() - OCT_1) / DAY, (r.end.getTime() - OCT_1) / DAY])

describe('caché del histórico por día', () => {
  it('la primera vez pide el rango y devuelve sus muestras sin la del extremo final', async () => {
    const { upstream, make } = setup()
    const samples = await make().getSamples(range(0, 3))
    expect(requested(upstream)).toEqual([[0, 3]])
    expect(samples).toHaveLength(12)
    expect(samples.at(-1)?.at.getTime()).toBeLessThan(day(3).getTime())
  })

  it('un rango que se traslapa solo pide los días que faltan', async () => {
    const { upstream, make } = setup()
    const repository = make()
    await repository.getSamples(range(5, 8))
    upstream.getSamples.mockClear()
    const samples = await repository.getSamples(range(0, 10))
    expect(requested(upstream)).toEqual([[0, 5], [8, 10]])
    expect(samples).toHaveLength(40)
    expect(samples.map((s) => s.at.getTime())).toEqual([...samples.map((s) => s.at.getTime())].sort((a, b) => a - b))
  })

  it('persiste en el almacén: otra instancia (otra sesión) no vuelve a pedir y recupera las muestras idénticas', async () => {
    const { upstream, make } = setup()
    const first = await make().getSamples(range(0, 2))
    upstream.getSamples.mockClear()
    const second = await make().getSamples(range(0, 2))
    expect(upstream.getSamples).not.toHaveBeenCalled()
    expect(second).toEqual(first)
  })

  it('guarda cada día con su fecha de CDMX en la clave', async () => {
    const { storage, make } = setup()
    await make().getSamples(range(0, 1))
    expect(storage.values.has(`${HISTORY_CACHE_PREFIX}2026-10-01`)).toBe(true)
  })

  it('un día cerrado hace más de 48 h no vence', async () => {
    const { upstream, make, advance } = setup()
    await make().getSamples(range(0, 1))
    advance(90 * DAY)
    upstream.getSamples.mockClear()
    await make().getSamples(range(0, 1))
    expect(upstream.getSamples).not.toHaveBeenCalled()
  })

  it('un día reciente (aún puede completarse) vence a la hora', async () => {
    const yesterday = 29
    const { upstream, make, advance } = setup(OCT_1 + 30 * DAY + 8 * HOUR)
    const repository = make()
    await repository.getSamples(range(yesterday, 30))
    upstream.getSamples.mockClear()
    advance(RECENT_TTL_MS - 1)
    await repository.getSamples(range(yesterday, 30))
    expect(upstream.getSamples).not.toHaveBeenCalled()
    advance(2)
    await repository.getSamples(range(yesterday, 30))
    expect(requested(upstream)).toEqual([[yesterday, 30]])
  })

  it('un día pedido ya cerrado del todo deja de vencer aunque se haya pedido como reciente antes', async () => {
    const { upstream, make, advance } = setup(OCT_1 + 30 * DAY)
    await make().getSamples(range(29, 30))
    advance(FINAL_AFTER_MS + DAY)
    await make().getSamples(range(29, 30))
    upstream.getSamples.mockClear()
    advance(30 * DAY)
    await make().getSamples(range(29, 30))
    expect(upstream.getSamples).not.toHaveBeenCalled()
  })

  it('guarda también los días sin lecturas para no volver a pedirlos', async () => {
    const { upstream, make } = setup()
    upstream.getSamples.mockResolvedValueOnce([])
    const repository = make()
    expect(await repository.getSamples(range(0, 2))).toEqual([])
    expect(await repository.getSamples(range(0, 2))).toEqual([])
    expect(upstream.getSamples).toHaveBeenCalledTimes(1)
  })

  it('no guarda nada si la fuente falla', async () => {
    const { upstream, storage, make } = setup()
    upstream.getSamples.mockRejectedValueOnce(new Error('sin red'))
    await expect(make().getSamples(range(0, 2))).rejects.toThrow('sin red')
    expect([...storage.values.keys()].filter((k) => !k.endsWith('index'))).toEqual([])
  })

  it('una entrada dañada se vuelve a pedir', async () => {
    const { upstream, storage, make } = setup()
    storage.values.set(`${HISTORY_CACHE_PREFIX}2026-10-01`, '{roto')
    await make().getSamples(range(0, 1))
    expect(requested(upstream)).toEqual([[0, 1]])
  })

  it('si el almacén falla, sigue funcionando contra la fuente', async () => {
    const upstream = source()
    const broken: KeyValueStorage = { getItem: () => { throw new Error('x') }, setItem: () => { throw new Error('x') } }
    const repository = new CachedHistoryRepository(upstream, broken, { now: () => day(30) })
    expect(await repository.getSamples(range(0, 2))).toHaveLength(8)
  })

  it('nunca pide más de 10 días en una consulta', async () => {
    const { upstream, make } = setup(OCT_1 + 60 * DAY)
    await make().getSamples(range(0, 25))
    expect(requested(upstream)).toEqual([[0, 10], [10, 20], [20, 25]])
  })

  it('un rango que no empieza a medianoche de CDMX pasa directo a la fuente', async () => {
    const { upstream, storage, make } = setup()
    const odd = { start: new Date(OCT_1 + HOUR), end: day(2) }
    await make().getSamples(odd)
    expect(upstream.getSamples).toHaveBeenCalledWith(odd)
    expect(storage.values.size).toBe(0)
  })

  it(`no guarda más de ${MAX_CACHED_DAYS} días: borra los usados hace más tiempo`, async () => {
    const { storage, make, advance } = setup(OCT_1 + 400 * DAY)
    const repository = make()
    for (let start = 0; start < MAX_CACHED_DAYS + 10; start += 10) {
      await repository.getSamples(range(start, start + 10))
      advance(1)
    }
    const days = [...storage.values.keys()].filter((k) => !k.endsWith('index'))
    expect(days).toHaveLength(MAX_CACHED_DAYS)
    expect(days).not.toContain(`${HISTORY_CACHE_PREFIX}2026-10-01`)
  })
})
