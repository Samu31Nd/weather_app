/**
 * Periodos y resoluciones del histórico: atajos y días personalizados recortados a lo que hay de datos, periodo
 * que termina a la medianoche de hoy (el histórico llega con un día de retraso), resolución por defecto y regla
 * de 4–800 puntos, e intervalos en hora de Ciudad de México.
 * Fuente: artboard `Main` (RANGES, RES, allowed); docs/06-datos.md (D7, D9); docs/01-requerimientos.md (RF-APP-07).
 * Requerimientos: RF-APP-06, RF-APP-07.
 */
import { describe, expect, it } from 'vitest'
import {
  availableDays, bucketStart, defaultResolution, effectiveDays, estimatedPoints, isResolutionAllowed, nextBucket, periodRange,
  resolveResolution,
} from '../../src'

const NOW = new Date('2026-10-24T15:59:58Z') // sábado 24-oct, 09:59 en CDMX

describe('periodo', () => {
  it('los últimos 7 días terminan a la medianoche de hoy en CDMX (ayer es el último día completo)', () => {
    const range = periodRange({ kind: 'preset', preset: '7d' }, NOW)
    expect(range.end.toISOString()).toBe('2026-10-24T06:00:00.000Z')
    expect(range.start.toISOString()).toBe('2026-10-17T06:00:00.000Z')
  })

  it('24 h es el día de ayer completo', () => {
    const range = periodRange({ kind: 'preset', preset: '24h' }, NOW)
    expect(range.start.toISOString()).toBe('2026-10-23T06:00:00.000Z')
  })

  it('hay datos desde el 19 de abril: un periodo más largo se recorta', () => {
    expect(availableDays(NOW)).toBe(188)
    expect(effectiveDays({ kind: 'custom', days: 400 }, NOW)).toBe(188)
    expect(periodRange({ kind: 'custom', days: 400 }, NOW).start.toISOString()).toBe('2026-04-19T06:00:00.000Z')
  })

  it('un número de días inválido cuenta como 1', () => {
    expect(effectiveDays({ kind: 'custom', days: 0 }, NOW)).toBe(1)
    expect(effectiveDays({ kind: 'custom', days: 2.7 }, NOW)).toBe(2)
  })
})

describe('resolución', () => {
  it('por defecto: 15 min para 1 día, 1 h para 7 días y 1 día para 30 o 90 (RF-APP-07)', () => {
    expect([1, 7, 30, 90].map(defaultResolution)).toEqual(['15m', '1h', '1d', '1d'])
  })

  it('solo permite resoluciones que den de 4 a 800 puntos', () => {
    expect(estimatedPoints(7, '15m')).toBe(672)
    expect(isResolutionAllowed(7, '15m')).toBe(true)
    expect(isResolutionAllowed(30, '15m')).toBe(false) // 2880 puntos
    expect(isResolutionAllowed(1, '1d')).toBe(false) // 1 punto
    expect(isResolutionAllowed(90, '1w')).toBe(true)
  })

  it('si la pedida no cabe en el periodo, usa la de por defecto', () => {
    expect(resolveResolution(30, '15m')).toBe('1d')
    expect(resolveResolution(30, '1h')).toBe('1h')
    expect(resolveResolution(7, null)).toBe('1h')
  })
})

describe('intervalos en hora de CDMX', () => {
  const at = (iso: string) => new Date(iso)

  it('el día empieza a la medianoche de CDMX, no de UTC', () => {
    expect(bucketStart(at('2026-10-24T05:30:00Z'), '1d').toISOString()).toBe('2026-10-23T06:00:00.000Z') // 23:30 del 23
    expect(bucketStart(at('2026-10-24T06:30:00Z'), '1d').toISOString()).toBe('2026-10-24T06:00:00.000Z')
  })

  it('la semana va de lunes a domingo', () => {
    // sábado 24-oct → lunes 19-oct
    expect(bucketStart(at('2026-10-24T15:00:00Z'), '1w').toISOString()).toBe('2026-10-19T06:00:00.000Z')
  })

  it('el mes empieza el día 1 y el siguiente respeta la longitud de cada mes', () => {
    const october = bucketStart(at('2026-10-24T15:00:00Z'), '1M')
    expect(october.toISOString()).toBe('2026-10-01T06:00:00.000Z')
    expect(nextBucket(october, '1M').toISOString()).toBe('2026-11-01T06:00:00.000Z')
  })

  it('15 min y 1 h redondean hacia abajo', () => {
    expect(bucketStart(at('2026-10-24T15:59:58Z'), '15m').toISOString()).toBe('2026-10-24T15:45:00.000Z')
    expect(bucketStart(at('2026-10-24T15:59:58Z'), '1h').toISOString()).toBe('2026-10-24T15:00:00.000Z')
  })
})
