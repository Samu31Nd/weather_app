/**
 * Modelo de vista del histórico: agregación por intervalo (promedio, banda mín–máx, suma de lluvia, máximos de
 * ráfaga e intensidad), huecos como intervalos vacíos, lluvia acumulada, rosa de los vientos e indicadores del
 * periodo. Los valores esperados se calculan a mano sobre muestras pequeñas; el fixture real (19-oct) comprueba
 * extremos y conteos.
 * Fuente: artboard `Main` (agg, KPIs, rosa); docs/06-datos.md (D3, D8).
 * Requerimientos: RF-APP-07, RF-APP-08.
 */
import { describe, expect, it } from 'vitest'
import { mapCleanWeatherRow } from '../../src/adapters/cloud-history/cloud-history.mapper'
import { buildHistoryView } from '../../src/application/history-view'
import type { DateRange, HistorySample } from '../../src/domain/history'
import { historyFixture } from '../fixtures/load'

const DAY: DateRange = { start: new Date('2026-10-19T06:00:00Z'), end: new Date('2026-10-20T06:00:00Z') }

function sample(isoUtc: string, overrides: Partial<HistorySample> = {}): HistorySample {
  return {
    at: new Date(isoUtc),
    temperatureC: 15, temperatureMaxC: 15, temperatureMinC: 15, indoorTemperatureC: 21,
    humidityPct: 60, indoorHumidityPct: 50,
    windKmh: 3, gustKmh: 6, windDirection: 'N', gustDirection: 'N',
    rainMm: 0, rainRateMmH: 0, seaLevelPressureHPa: 1027,
    ...overrides,
  }
}

describe('agregación por intervalo', () => {
  // 10:00, 10:15, 10:30 y 10:45 de CDMX (16:00–16:45 UTC) caen en la misma hora.
  const hour = [
    sample('2026-10-19T16:00:00Z', { temperatureC: 14, temperatureMinC: 13.5, temperatureMaxC: 14, rainMm: 0.2, gustKmh: 8, rainRateMmH: 1 }),
    sample('2026-10-19T16:15:00Z', { temperatureC: 15, temperatureMaxC: 15.5, rainMm: 0.4, gustKmh: 12, rainRateMmH: 3 }),
    sample('2026-10-19T16:30:00Z', { temperatureC: 16, rainMm: null }),
    sample('2026-10-19T16:45:00Z', { temperatureC: 17, temperatureMaxC: 17.2, seaLevelPressureHPa: 1029 }),
  ]
  const view = buildHistoryView(hour, { resolution: '1h', units: 'metric', range: DAY })
  const tenAm = view.buckets.find((b) => b.start.toISOString() === '2026-10-19T16:00:00.000Z')

  it('un día a 1 h son 24 intervalos y los que no tienen lecturas quedan vacíos', () => {
    expect(view.buckets).toHaveLength(24)
    expect(view.emptyBuckets).toBe(23)
    expect(view.buckets[0]?.empty).toBe(true)
  })

  it('promedia la temperatura y la banda va del mínimo al máximo', () => {
    expect(tenAm?.temperature).toEqual({ mean: 15.5, min: 13.5, max: 17.2 })
  })

  it('suma la lluvia (ignorando huecos) y toma el máximo de ráfaga e intensidad', () => {
    expect(tenAm?.rain).toBeCloseTo(0.6)
    expect(tenAm?.gust).toBe(12)
    expect(tenAm?.rainRate).toBe(3)
    expect(tenAm?.pressure).toEqual({ mean: 1027.5, min: 1027, max: 1029 })
  })

  it('la lluvia acumulada crece hasta el final del periodo', () => {
    expect(view.buckets[23]?.cumulativeRain).toBeCloseTo(0.6)
    expect(view.buckets[0]?.cumulativeRain).toBe(0)
  })

  it('convierte a imperial al construir la vista', () => {
    const imperial = buildHistoryView(hour, { resolution: '1h', units: 'imperial', range: DAY })
    const bucket = imperial.buckets.find((b) => !b.empty)
    expect(bucket?.temperature?.mean).toBeCloseTo(59.9)
    expect(bucket?.rain).toBeCloseTo(0.6 / 25.4)
  })

  it('descarta presiones no creíbles (lecturas sin corregir, D3)', () => {
    const view = buildHistoryView([sample('2026-10-19T16:00:00Z', { seaLevelPressureHPa: 770 })], { resolution: '1h', units: 'metric', range: DAY })
    expect(view.buckets.find((b) => !b.empty)?.pressure).toBeNull()
  })
})

describe('rosa de los vientos', () => {
  const view = buildHistoryView(
    [
      sample('2026-10-19T16:00:00Z', { windDirection: 'N', windKmh: 1.5 }),
      sample('2026-10-19T16:15:00Z', { windDirection: 'N', windKmh: 4 }),
      sample('2026-10-19T16:30:00Z', { windDirection: 'SW', windKmh: 8 }),
      sample('2026-10-19T16:45:00Z', { windDirection: null, windKmh: 0 }),
    ],
    { resolution: '1h', units: 'metric', range: DAY },
  )

  it('reparte el tiempo por rumbo y velocidad (< 2, 2–5, > 5 km/h) y cuenta la calma aparte', () => {
    const north = view.rose.directions.find((d) => d.direction === 'N')
    expect(north?.percentBySpeed).toEqual([25, 25, 0])
    expect(view.rose.directions.find((d) => d.direction === 'SW')?.percentBySpeed).toEqual([0, 0, 25])
    expect(view.rose.calmPercent).toBe(25)
    expect(view.rose.maxPercent).toBe(50)
  })

  it('la dirección dominante y la calma salen en los indicadores', () => {
    expect(view.summary.wind.dominantDirection).toBe('N')
    expect(view.summary.wind.dominantPercent).toBe(50)
    expect(view.summary.wind.calmPercent).toBe(25)
  })
})

describe('indicadores del periodo', () => {
  const twoDays: DateRange = { start: new Date('2026-10-19T06:00:00Z'), end: new Date('2026-10-21T06:00:00Z') }
  const samples = [
    sample('2026-10-19T12:00:00Z', { temperatureMinC: 10, temperatureC: 11, rainMm: 0.2, rainRateMmH: 2.4, seaLevelPressureHPa: 1025 }),
    sample('2026-10-19T21:00:00Z', { temperatureMaxC: 24, temperatureC: 23, gustKmh: 30, rainMm: 1.0 }),
    sample('2026-10-20T12:00:00Z', { temperatureMinC: 12, temperatureC: 12, seaLevelPressureHPa: 1026 }),
    sample('2026-10-20T15:00:00Z', { temperatureMaxC: 20, temperatureC: 20, seaLevelPressureHPa: 1028 }),
  ]
  const { summary } = buildHistoryView(samples, { resolution: '1h', units: 'metric', range: twoDays })

  it('extremos con su momento, promedio y oscilación diaria media', () => {
    expect(summary.temperature.max).toEqual({ value: 24, at: new Date('2026-10-19T21:00:00Z') })
    expect(summary.temperature.min).toEqual({ value: 10, at: new Date('2026-10-19T12:00:00Z') })
    expect(summary.temperature.mean).toBe(16.5)
    expect(summary.temperature.dailySwing).toBe(11) // (24 − 10 + 20 − 12) / 2
  })

  it('lluvia: total, días con lluvia, día más lluvioso e intensidad máxima', () => {
    expect(summary.rain.total).toBeCloseTo(1.2)
    expect(summary.rain.rainyDays).toBe(1)
    expect(summary.rain.daysWithData).toBe(2)
    expect(summary.rain.wettestDay?.value).toBeCloseTo(1.2)
    expect(summary.rain.wettestDay?.at.toISOString()).toBe('2026-10-19T06:00:00.000Z')
    expect(summary.rain.maxRate).toEqual({ value: 2.4, at: new Date('2026-10-19T12:00:00Z') })
  })

  it('presión: última, cambio en el periodo y tendencia de las últimas 3 h', () => {
    expect(summary.pressure.last).toBe(1028)
    expect(summary.pressure.change).toBe(3)
    expect(summary.pressure.trend).toBe('risingRapidly') // +2 hPa en 3 h
    expect([summary.pressure.min, summary.pressure.max]).toEqual([1025, 1028])
  })

  it('sin lluvia no hay día más lluvioso ni intensidad máxima', () => {
    const dry = buildHistoryView([sample('2026-10-19T12:00:00Z')], { resolution: '1h', units: 'metric', range: DAY })
    expect(dry.summary.rain.wettestDay).toBeNull()
    expect(dry.summary.rain.maxRate).toBeNull()
  })
})

describe('con datos reales (19-oct)', () => {
  const samples = historyFixture().data.map(mapCleanWeatherRow)
  const view = buildHistoryView(samples, { resolution: '1h', units: 'metric', range: DAY })

  it('96 lecturas en 24 horas, sin horas vacías', () => {
    expect(view.readings).toBe(96)
    expect(view.emptyBuckets).toBe(0)
  })

  it('máxima de 25 °C y mínima de 12 °C, como el fixture', () => {
    expect(view.summary.temperature.max?.value).toBe(25)
    expect(view.summary.temperature.min?.value).toBe(12)
  })
})
