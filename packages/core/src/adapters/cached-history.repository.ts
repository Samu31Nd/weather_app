// Caché del histórico por día de Ciudad de México (RNF-APP-03): decora otro `HistoryRepository` y solo le pide los
// días que no tiene, agrupados en tramos contiguos. Los periodos se traslapan (24 h, 7 y 30 días comparten días), así
// que cambiar de periodo o volver a abrir la app casi no consulta la Cloud Function.
// - Un día que cerró hace más de `FINAL_AFTER_MS` ya no cambia y se guarda sin vencimiento; uno más reciente (el
//   histórico llega con retraso, D7) vence a la hora (`RECENT_TTL_MS`).
// - Se guarda en el almacén clave-valor de la app (`localStorage`, AsyncStorage) en formato compacto: una fila de
//   valores por muestra. Hasta `MAX_CACHED_DAYS` días; al pasarse se borran los usados hace más tiempo.
// - Si el almacén falla o trae basura, ese día cuenta como no guardado y se vuelve a pedir.
// - Un rango que no empieza y termina a medianoche de CDMX pasa directo a la fuente.

import { startOfMexicoCityDay } from '../domain/history-period'
import { type DateRange, type HistorySample, MAX_DAYS_PER_REQUEST, mergeSamples, splitRange } from '../domain/history'
import { toMexicoCityWallTime } from '../domain/time'
import type { Clock, HistoryRepository, KeyValueStorage } from '../ports'

const DAY_MS = 86_400_000
export const FINAL_AFTER_MS = 2 * DAY_MS
export const RECENT_TTL_MS = 3_600_000
export const MAX_CACHED_DAYS = 200
export const HISTORY_CACHE_PREFIX = 'wx-history-v1:'
const INDEX_KEY = `${HISTORY_CACHE_PREFIX}index`

/** Orden de los campos en la fila compacta; `at` va primero. */
const FIELDS = [
  'temperatureC', 'temperatureMaxC', 'temperatureMinC', 'indoorTemperatureC', 'humidityPct', 'indoorHumidityPct',
  'windKmh', 'gustKmh', 'windDirection', 'gustDirection', 'rainMm', 'rainRateMmH', 'seaLevelPressureHPa',
] as const satisfies ReadonlyArray<keyof HistorySample>

type Row = [number, ...Array<number | string | null>]

interface DayEntry {
  readonly fetchedAt: number
  readonly samples: readonly HistorySample[]
}

export class CachedHistoryRepository implements HistoryRepository {
  private readonly memory = new Map<number, DayEntry>()
  private index: Record<string, number> | null = null

  constructor(
    private readonly source: HistoryRepository,
    private readonly storage: KeyValueStorage,
    private readonly clock: Clock,
  ) {}

  async getSamples(range: DateRange): Promise<HistorySample[]> {
    const days = daysOf(range)
    if (days === null) return this.source.getSamples(range)

    const entries = await Promise.all(days.map((day) => this.read(day)))
    const missing = days.filter((_, i) => entries[i] === null)
    const fetched = await Promise.all(contiguousRuns(missing).flatMap((run) => splitRange(run, MAX_DAYS_PER_REQUEST)).map((run) => this.fetchRun(run)))
    await this.touch(days)

    const samples = [...entries.flatMap((entry) => entry?.samples ?? []), ...fetched.flat()]
    return mergeSamples([samples.filter((s) => s.at >= range.start && s.at < range.end)])
  }

  private async fetchRun(run: DateRange): Promise<HistorySample[]> {
    const samples = await this.source.getSamples(run)
    const fetchedAt = this.clock.now().getTime()
    const byDay = new Map<number, HistorySample[]>()
    for (let day = run.start.getTime(); day < run.end.getTime(); day += DAY_MS) byDay.set(day, [])
    for (const sample of samples) byDay.get(startOfMexicoCityDay(sample.at).getTime())?.push(sample)
    await Promise.all([...byDay].map(([day, daySamples]) => this.write(day, { fetchedAt, samples: daySamples })))
    return [...byDay.values()].flat()
  }

  private isFresh(day: number, entry: DayEntry): boolean {
    const dayEnd = day + DAY_MS
    if (entry.fetchedAt >= dayEnd + FINAL_AFTER_MS) return true
    return this.clock.now().getTime() - entry.fetchedAt < RECENT_TTL_MS
  }

  private async read(day: number): Promise<DayEntry | null> {
    const entry = this.memory.get(day) ?? (await this.load(day))
    if (entry === null || !this.isFresh(day, entry)) return null
    this.memory.set(day, entry)
    return entry
  }

  private async load(day: number): Promise<DayEntry | null> {
    try {
      const raw = await this.storage.getItem(dayKey(day))
      return raw === null ? null : decode(raw)
    } catch {
      return null
    }
  }

  private async write(day: number, entry: DayEntry): Promise<void> {
    this.memory.set(day, entry)
    try {
      await this.storage.setItem(dayKey(day), encode(entry))
    } catch {
      // Sin espacio o sin almacén: el día queda solo en memoria.
    }
  }

  /** Marca los días como usados y borra los menos usados si se pasa del tope. */
  private async touch(days: readonly number[]): Promise<void> {
    const index = await this.loadIndex()
    const now = this.clock.now().getTime()
    for (const day of days) index[dayKey(day)] = now
    const stale = Object.entries(index).sort((a, b) => b[1] - a[1]).slice(MAX_CACHED_DAYS).map(([key]) => key)
    for (const key of stale) delete index[key]
    try {
      await Promise.all(stale.map((key) => this.storage.removeItem?.(key)))
      await this.storage.setItem(INDEX_KEY, JSON.stringify(index))
    } catch {
      // El índice solo sirve para el tope; si no se guarda, se rehace con el uso.
    }
  }

  private async loadIndex(): Promise<Record<string, number>> {
    if (this.index !== null) return this.index
    try {
      const raw = await this.storage.getItem(INDEX_KEY)
      const parsed: unknown = raw === null ? {} : JSON.parse(raw)
      this.index = parsed !== null && typeof parsed === 'object' ? (parsed as Record<string, number>) : {}
    } catch {
      this.index = {}
    }
    return this.index
  }
}

/** Días (medianoches de CDMX) que cubre el rango, o `null` si no empieza y termina a medianoche. */
function daysOf(range: DateRange): number[] | null {
  const start = range.start.getTime()
  const end = range.end.getTime()
  if (end <= start || startOfMexicoCityDay(range.start).getTime() !== start || startOfMexicoCityDay(range.end).getTime() !== end) return null
  const days: number[] = []
  for (let day = start; day < end; day += DAY_MS) days.push(day)
  return days
}

function contiguousRuns(days: readonly number[]): DateRange[] {
  const runs: DateRange[] = []
  for (const day of days) {
    const last = runs.at(-1)
    if (last && last.end.getTime() === day) runs[runs.length - 1] = { start: last.start, end: new Date(day + DAY_MS) }
    else runs.push({ start: new Date(day), end: new Date(day + DAY_MS) })
  }
  return runs
}

/** `wx-history-v1:2026-10-19`: la fecha del día en CDMX. */
const dayKey = (day: number) => `${HISTORY_CACHE_PREFIX}${toMexicoCityWallTime(new Date(day)).slice(0, 10)}`

function encode(entry: DayEntry): string {
  const rows = entry.samples.map((s): Row => [s.at.getTime(), ...FIELDS.map((field) => s[field])])
  return JSON.stringify({ f: entry.fetchedAt, s: rows })
}

function decode(raw: string): DayEntry | null {
  const data = JSON.parse(raw) as { f?: unknown; s?: unknown }
  if (typeof data.f !== 'number' || !Array.isArray(data.s)) return null
  const rows = data.s as unknown[]
  if (!rows.every((row) => Array.isArray(row) && row.length === FIELDS.length + 1 && typeof row[0] === 'number')) return null
  const samples = (rows as Row[]).map(([at, ...values]) => {
    const fields = Object.fromEntries(FIELDS.map((field, i) => [field, values[i] ?? null]))
    return { ...fields, at: new Date(at) } as unknown as HistorySample
  })
  return { fetchedAt: data.f, samples }
}
