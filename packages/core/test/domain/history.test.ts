/**
 * Rangos del histórico: partir en tramos y unir sin duplicados.
 * Fuente: docs/06-datos.md (tope de 1000 filas ≈ 10 días; `date_start`/`date_end` incluyen ambos extremos).
 * Requerimientos: RF-APP-06.
 */
import { describe, expect, it } from 'vitest'
import { type HistorySample, mergeSamples, splitRange } from '../../src/domain/history'

const day = (n: number) => new Date(Date.UTC(2026, 9, n, 6))

describe('partición de rangos', () => {
  it('no parte un rango de 7 días', () => {
    expect(splitRange({ start: day(1), end: day(8) })).toEqual([{ start: day(1), end: day(8) }])
  })

  it('parte 30 días en 3 tramos contiguos de 10 días', () => {
    const chunks = splitRange({ start: day(1), end: day(31) })
    expect(chunks).toEqual([
      { start: day(1), end: day(11) },
      { start: day(11), end: day(21) },
      { start: day(21), end: day(31) },
    ])
  })

  it('deja el último tramo más corto si no alcanza', () => {
    expect(splitRange({ start: day(1), end: day(13) }).at(-1)).toEqual({ start: day(11), end: day(13) })
  })

  it('devuelve una lista vacía si el rango está invertido o vacío', () => {
    expect(splitRange({ start: day(5), end: day(5) })).toEqual([])
    expect(splitRange({ start: day(5), end: day(1) })).toEqual([])
  })
})

describe('unión de tramos', () => {
  const sample = (iso: string) => ({ at: new Date(iso) }) as HistorySample

  it('quita la muestra repetida en la frontera entre tramos y ordena ascendente', () => {
    const merged = mergeSamples([
      [sample('2026-10-11T06:00:00Z'), sample('2026-10-11T05:45:00Z')],
      [sample('2026-10-11T06:15:00Z'), sample('2026-10-11T06:00:00Z')],
    ])
    expect(merged.map((s) => s.at.toISOString())).toEqual([
      '2026-10-11T05:45:00.000Z', '2026-10-11T06:00:00.000Z', '2026-10-11T06:15:00.000Z',
    ])
  })
})
