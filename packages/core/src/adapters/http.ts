// Cliente HTTP mínimo sobre `fetch` estándar: timeout, reintentos con espera creciente y errores tipados.
// No depende de ninguna plataforma; en las pruebas se le inyecta `fetch` y `sleep`.

export type FetchFn = typeof fetch

export interface HttpOptions {
  readonly fetch?: FetchFn
  readonly timeoutMs?: number
  /** Reintentos después del primer intento (RNF-APP-02: máximo 3 intentos en total). */
  readonly retries?: number
  readonly backoffMs?: number
  readonly sleep?: (ms: number) => Promise<void>
}

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    readonly url: string,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export async function fetchJson<T>(url: string, options: HttpOptions = {}): Promise<T> {
  const {
    fetch: fetchFn = globalThis.fetch,
    timeoutMs = 8_000,
    retries = 2,
    backoffMs = 500,
    sleep = defaultSleep,
  } = options

  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await sleep(backoffMs * 2 ** (attempt - 1))
    try {
      return await fetchOnce<T>(fetchFn, url, timeoutMs)
    } catch (error) {
      lastError = error
      if (!isRetryable(error)) break
    }
  }
  throw lastError
}

async function fetchOnce<T>(fetchFn: FetchFn, url: string, timeoutMs: number): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchFn(url, { signal: controller.signal, headers: { Accept: 'application/json' } })
    if (!response.ok) throw new HttpError(`HTTP ${response.status}`, response.status, url)
    return (await response.json()) as T
  } catch (error) {
    if (error instanceof HttpError) throw error
    const reason = controller.signal.aborted ? `timeout tras ${timeoutMs} ms` : String(error)
    throw new HttpError(`Falló la petición: ${reason}`, null, url)
  } finally {
    clearTimeout(timer)
  }
}

/** Se reintenta ante fallas de red, timeouts y errores 5xx o 429; nunca ante otros 4xx. */
function isRetryable(error: unknown): boolean {
  if (!(error instanceof HttpError)) return false
  return error.status === null || error.status >= 500 || error.status === 429
}
