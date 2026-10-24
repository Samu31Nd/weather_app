// Proxy del dato en vivo (ADR-0007, RNF-APP-10, RNF-APP-11). La consola Davis solo sirve HTTP y sin CORS, así
// que el navegador (y la app móvil) la consultan a través del servidor web:
// - consulta solo la URL configurada en el servidor (no es un proxy abierto) y no reenvía cabeceras del cliente;
// - guarda la última respuesta unos segundos para no saturar la consola con muchos usuarios a la vez;
// - quita los datos internos de red de la estación antes de responder.

export const LIVE_CACHE_MS = 10_000
const PRIVATE_FIELDS = ['mac', 'apmac', 'ip', 'ssid'] as const

export interface LiveProxyResult {
  readonly status: number
  readonly body: unknown
}

export interface LiveProxyOptions {
  readonly stationUrl: string | undefined
  readonly fetch?: typeof fetch
  readonly now?: () => number
  readonly timeoutMs?: number
  readonly cacheMs?: number
}

export function createLiveProxy(options: LiveProxyOptions): () => Promise<LiveProxyResult> {
  const { stationUrl, fetch: fetchFn = globalThis.fetch, now = Date.now, timeoutMs = 8_000, cacheMs = LIVE_CACHE_MS } = options
  let cached: { at: number; body: unknown } | null = null

  return async () => {
    if (!stationUrl) return { status: 500, body: { error: 'LIVE_STATION_URL no está configurada' } }
    if (cached && now() - cached.at < cacheMs) return { status: 200, body: cached.body }
    try {
      const response = await fetchFn(stationUrl, { signal: AbortSignal.timeout(timeoutMs), cache: 'no-store' })
      if (!response.ok) return { status: 502, body: { error: `La consola respondió ${response.status}` } }
      const body = withoutPrivateFields(await response.json())
      cached = { at: now(), body }
      return { status: 200, body }
    } catch {
      return { status: 504, body: { error: 'La consola no respondió' } }
    }
  }
}

function withoutPrivateFields(payload: unknown): unknown {
  if (payload === null || typeof payload !== 'object') return payload
  const copy: Record<string, unknown> = { ...(payload as Record<string, unknown>) }
  for (const field of PRIVATE_FIELDS) delete copy[field]
  return copy
}

/** URL de la consola: `LIVE_STATION_URL`, o la URL base que ya usaba la app (`NEXT_PUBLIC_API_URL`). */
export function stationUrlFromEnv(env: Record<string, string | undefined>): string | undefined {
  if (env.LIVE_STATION_URL) return env.LIVE_STATION_URL
  return env.NEXT_PUBLIC_API_URL ? `${env.NEXT_PUBLIC_API_URL}wflexp.json` : undefined
}
