/**
 * Ilustraciones del histórico: reflejan los datos del periodo (termómetro, gota, brújula, pluviómetro y barómetro).
 * Fuente: artboard `Main` (objeto `ill`).
 * Requerimientos: RF-APP-08.
 */
import { describe, expect, it } from 'vitest'
import type { HistorySummary } from '../../src/application/history-view'
import { historyArt } from '../../src/charts/history-art'

const summary = (overrides: { meanC?: number; humidity?: number; direction?: 'E' | null; rainy?: number; days?: number; total?: number; pressure?: number | null }): HistorySummary =>
  ({
    temperature: { mean: overrides.meanC ?? 17.5, humidityMean: overrides.humidity ?? 60 },
    wind: { dominantDirection: overrides.direction ?? null },
    rain: { rainyDays: overrides.rainy ?? 0, daysWithData: overrides.days ?? 10, total: overrides.total ?? 0 },
    pressure: { last: overrides.pressure ?? null },
  }) as HistorySummary

describe('ilustraciones del histórico', () => {
  it('el termómetro llega a la mitad con 17.5 °C y la gota se llena con la humedad', () => {
    const art = historyArt(summary({}))
    expect(art.thermometer).toEqual({ top: 28, height: 23 })
    expect(art.dropEmpty).toBe(0.4)
  })

  it('la brújula apunta al viento dominante (E = 90°) y queda al norte en calma', () => {
    expect(historyArt(summary({ direction: 'E' })).windNeedleDeg).toBe(90)
    expect(historyArt(summary({ direction: null })).windNeedleDeg).toBe(0)
  })

  it('las gotas y el tubo crecen con la proporción de días con lluvia', () => {
    const art = historyArt(summary({ rainy: 5, days: 10, total: 12 }))
    expect(art.drops).toEqual([1, 1, 0.25])
    expect(art.gauge).toEqual({ top: 35, height: 19 })
  })

  it('la aguja del barómetro recorre de −120° a +120° en la escala del medidor de "Ahora"', () => {
    expect(historyArt(summary({ pressure: 995 })).pressureNeedleDeg).toBe(-120)
    expect(historyArt(summary({ pressure: 1045 })).pressureNeedleDeg).toBe(120)
    expect(historyArt(summary({ pressure: null })).pressureNeedleDeg).toBe(0)
  })
})
