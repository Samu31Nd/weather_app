/**
 * Integración HTTP de los repositorios contra fuentes simuladas con MSW: forma de la petición, reintentos con
 * espera creciente, errores y tope de filas.
 * Fuente: docs/05-flujos.md (secuencias), docs/06-datos.md (parámetros de la Cloud Function, tope de 1000).
 * Requerimientos: RF-APP-01, RF-APP-06, RNF-APP-02.
 */
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  HttpHistoryRepository, SOURCE_ROW_LIMIT, TruncatedHistoryError,
} from '../../src/adapters/cloud-history/http-history.repository'
import { HttpLiveWeatherRepository } from '../../src/adapters/davis-live/http-live-weather.repository'
import { HttpError, fetchJson } from '../../src/adapters/http'
import { historyFixture, liveFixture } from '../fixtures/load'

const LIVE_URL = 'https://estacion.test/api/live'
const HISTORY_URL = 'https://historico.test/'
const server = setupServer()
const noWait = { sleep: () => Promise.resolve() }

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('repositorio del dato en vivo', () => {
  it('pide el JSON y lo entrega ya mapeado', async () => {
    server.use(http.get(LIVE_URL, () => HttpResponse.json(liveFixture())))
    const reading = await new HttpLiveWeatherRepository(LIVE_URL, noWait).getCurrent()
    expect(reading.outdoor.temperatureC).toBeCloseTo(17.83, 2)
  })

  it('reintenta ante un 503 y entrega la lectura al segundo intento', async () => {
    let calls = 0
    server.use(http.get(LIVE_URL, () => (++calls === 1 ? new HttpResponse(null, { status: 503 }) : HttpResponse.json(liveFixture()))))
    await new HttpLiveWeatherRepository(LIVE_URL, noWait).getCurrent()
    expect(calls).toBe(2)
  })

  it('se rinde después de 3 intentos y reporta el estado HTTP', async () => {
    let calls = 0
    server.use(http.get(LIVE_URL, () => { calls++; return new HttpResponse(null, { status: 502 }) }))
    await expect(new HttpLiveWeatherRepository(LIVE_URL, noWait).getCurrent()).rejects.toMatchObject({ name: 'HttpError', status: 502 })
    expect(calls).toBe(3)
  })

  it('no reintenta un 404', async () => {
    let calls = 0
    server.use(http.get(LIVE_URL, () => { calls++; return new HttpResponse(null, { status: 404 }) }))
    await expect(new HttpLiveWeatherRepository(LIVE_URL, noWait).getCurrent()).rejects.toBeInstanceOf(HttpError)
    expect(calls).toBe(1)
  })
})

describe('cliente HTTP', () => {
  it('espera 500 ms y luego 1000 ms entre intentos (espera creciente)', async () => {
    const sleep = vi.fn(() => Promise.resolve())
    server.use(http.get(LIVE_URL, () => HttpResponse.error()))
    await expect(fetchJson(LIVE_URL, { sleep })).rejects.toMatchObject({ status: null })
    expect(sleep.mock.calls).toEqual([[500], [1000]])
  })

  it('aborta por timeout y lo reporta como falla de red reintentable', async () => {
    const neverResolves: typeof fetch = (_url, init) =>
      new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new Error('aborted'))))
    await expect(fetchJson(LIVE_URL, { fetch: neverResolves, timeoutMs: 5, retries: 0 })).rejects.toThrow(/timeout tras 5 ms/)
  })
})

describe('repositorio del histórico', () => {
  const range = { start: new Date('2026-10-19T06:00:00Z'), end: new Date('2026-10-20T06:00:00Z') }

  it('pide `vw_clean_weather` con el rango en hora de pared de CDMX', async () => {
    let requested: URL | undefined
    server.use(http.get(HISTORY_URL, ({ request }) => { requested = new URL(request.url); return HttpResponse.json(historyFixture()) }))
    const samples = await new HttpHistoryRepository(HISTORY_URL, noWait).getSamples(range)
    expect(Object.fromEntries(requested!.searchParams)).toEqual({
      vista: 'vw_clean_weather', date_start: '2026-10-19T00:00:00', date_end: '2026-10-20T00:00:00',
    })
    expect(samples).toHaveLength(96)
  })

  it('falla en vez de entregar datos truncados si la fuente devuelve el tope de filas', async () => {
    const row = historyFixture().data[0]!
    server.use(http.get(HISTORY_URL, () => HttpResponse.json({ total: SOURCE_ROW_LIMIT, data: Array(SOURCE_ROW_LIMIT).fill(row) })))
    await expect(new HttpHistoryRepository(HISTORY_URL, noWait).getSamples(range)).rejects.toBeInstanceOf(TruncatedHistoryError)
  })
})
