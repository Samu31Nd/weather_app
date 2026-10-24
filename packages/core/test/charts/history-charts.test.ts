/**
 * Gráficas del histórico listas para dibujar: escalas que contienen los datos (también los interiores), eje de
 * humedad fijo de 0 a 100 %, eje de presión con un rango mínimo y trazos cortados en los huecos.
 * Fuente: artboard `Main` (tempC, humC, windC, rainC, presC).
 * Requerimientos: RF-APP-07.
 */
import { describe, expect, it } from 'vitest'
import { buildHistoryView } from '../../src/application/history-view'
import { historyCharts } from '../../src/charts/history-charts'
import type { HistorySample } from '../../src/domain/history'

const range = { start: new Date('2026-10-19T06:00:00Z'), end: new Date('2026-10-20T06:00:00Z') }
const sample = (iso: string, overrides: Partial<HistorySample> = {}): HistorySample => ({
  at: new Date(iso), temperatureC: 15, temperatureMaxC: 16, temperatureMinC: 14, indoorTemperatureC: 26, humidityPct: 60, indoorHumidityPct: 50,
  windKmh: 3, gustKmh: 22, windDirection: 'N', gustDirection: 'N', rainMm: 0, rainRateMmH: 0, seaLevelPressureHPa: 1027, ...overrides,
})
const view = buildHistoryView([sample('2026-10-19T16:00:00Z'), sample('2026-10-19T19:00:00Z', { rainMm: 2.4 })], { resolution: '1h', units: 'metric', range })

describe('gráficas del histórico', () => {
  it('la escala de temperatura incluye el interior solo si se muestra', () => {
    expect(historyCharts(view, { showIndoor: true, width: 1000 }).temperature.scale.hi).toBeGreaterThanOrEqual(26)
    expect(historyCharts(view, { showIndoor: false, width: 1000 }).temperature.scale.hi).toBeLessThan(26)
    expect(historyCharts(view, { showIndoor: false, width: 1000 }).temperature.indoor).toBe('')
  })

  it('la humedad va siempre de 0 a 100 % y el viento llega a la ráfaga máxima', () => {
    const charts = historyCharts(view, { showIndoor: false, width: 1000 })
    expect(charts.humidity.scale.ticks).toEqual([0, 50, 100])
    expect(charts.wind.scale.hi).toBeGreaterThanOrEqual(22)
  })

  it('la presión casi constante no se ve como un cambio grande: el eje abre al menos 2.7 hPa', () => {
    const { scale } = historyCharts(view, { showIndoor: false, width: 1000 }).pressure
    expect(scale.hi - scale.lo).toBeGreaterThanOrEqual(2.7)
  })

  it('las horas sin lecturas cortan las líneas: dos lecturas separadas son dos tramos', () => {
    const { temperature, rain } = historyCharts(view, { showIndoor: false, width: 1000 })
    expect(temperature.line.match(/M/g)).toHaveLength(2)
    expect(rain.bars.match(/M/g)).toHaveLength(1)
  })

  it('acepta los altos de otra plataforma', () => {
    const charts = historyCharts(view, { showIndoor: false, width: 340, heights: { temperature: 120, humidity: 60, wind: 90, rain: 70, cumulative: 50, pressure: 80 } })
    expect(charts.rain.bars).toMatch(/ 70V/)
  })
})
