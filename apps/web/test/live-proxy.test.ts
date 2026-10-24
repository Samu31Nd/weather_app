/**
 * Proxy del dato en vivo (`/api/live`): solo la URL configurada, caché de 10 s, sin datos de red de la estación
 * y errores claros si la consola falla.
 * Fuente: ADR-0007 y docs/05-flujos.md (secuencia del dato en vivo).
 * Requerimientos: RNF-APP-10 (no es un proxy abierto, sin datos internos), RNF-APP-11 (no saturar la consola).
 */
import { describe, expect, it, vi } from 'vitest'
import { createLiveProxy, stationUrlFromEnv } from '@/lib/live/live-proxy'

const STATION = 'http://consola.test/wflexp.json'
const payload = { tempout: '64.1', mac: 'AA:BB', apmac: 'CC:DD', ip: '10.0.0.1', ssid: 'Red interna' }
const okFetch = () => vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 }))

describe('proxy del dato en vivo', () => {
  it('consulta la URL configurada y quita MAC, IP y SSID', async () => {
    const fetch = okFetch()
    const result = await createLiveProxy({ stationUrl: STATION, fetch })()
    expect(fetch).toHaveBeenCalledWith(STATION, expect.objectContaining({ cache: 'no-store' }))
    expect(result).toEqual({ status: 200, body: { tempout: '64.1' } })
  })

  it('responde desde la caché durante 10 s y vuelve a consultar después', async () => {
    const fetch = okFetch()
    let now = 0
    const proxy = createLiveProxy({ stationUrl: STATION, fetch, now: () => now })
    await proxy()
    now = 9_999
    await proxy()
    expect(fetch).toHaveBeenCalledTimes(1)
    now = 10_000
    await proxy()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('responde 502 si la consola contesta con error y no guarda nada en caché', async () => {
    const fetch = vi.fn(async () => new Response('', { status: 503 }))
    const proxy = createLiveProxy({ stationUrl: STATION, fetch })
    expect((await proxy()).status).toBe(502)
    await proxy()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('responde 504 si la consola no responde', async () => {
    const fetch = vi.fn(async () => { throw new Error('timeout') })
    expect(await createLiveProxy({ stationUrl: STATION, fetch })()).toMatchObject({ status: 504 })
  })

  it('responde 500 si falta la configuración, sin intentar ninguna URL', async () => {
    const fetch = okFetch()
    expect(await createLiveProxy({ stationUrl: undefined, fetch })()).toMatchObject({ status: 500 })
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('URL de la consola desde el entorno', () => {
  it('prefiere LIVE_STATION_URL y si no, arma la URL con la base previa', () => {
    expect(stationUrlFromEnv({ LIVE_STATION_URL: STATION, NEXT_PUBLIC_API_URL: 'http://otra/' })).toBe(STATION)
    expect(stationUrlFromEnv({ NEXT_PUBLIC_API_URL: 'http://consola.test/' })).toBe(STATION)
    expect(stationUrlFromEnv({})).toBeUndefined()
  })
})
