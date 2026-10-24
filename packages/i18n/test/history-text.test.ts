/**
 * Textos del histórico: fechas de cada intervalo según la resolución en hora de CDMX, etiquetas del eje,
 * indicadores del periodo y la lectura bajo el cursor (incluido "sin datos" en los huecos).
 * Fuente: artboard `Main` (fmt, KPIs, rd); docs/06-datos.md (D8, D9).
 * Requerimientos: RF-APP-07, RF-APP-08, RNF-APP-07.
 */
import { type HistorySample, buildHistoryView } from '@tt/core'
import { describe, expect, it } from 'vitest'
import { CATALOGS, axisLabel, createFormatter, historySectionSummaries, historySummaryText, intervalLabel, periodLabel, readoutText } from '../src'

const t = CATALOGS.es
const format = createFormatter('es', t)
const range = { start: new Date('2026-10-17T06:00:00Z'), end: new Date('2026-10-24T06:00:00Z') }
const at = new Date('2026-10-23T20:15:00Z') // viernes 23-oct, 14:15 en CDMX

const sample: HistorySample = {
  at, temperatureC: 22.4, temperatureMaxC: 23, temperatureMinC: 21, indoorTemperatureC: 21, humidityPct: 48, indoorHumidityPct: 50,
  windKmh: 6.2, gustKmh: 14.5, windDirection: 'NW', gustDirection: 'NW', rainMm: 1.2, rainRateMmH: 4.8, seaLevelPressureHPa: 1026.4,
}

describe('fechas de los intervalos (CDMX)', () => {
  it.each([
    ['15m', '23 oct, 14:15'], ['1h', '23 oct, 14:00–15:00'], ['1d', 'vie 23 oct'], ['1w', 'semana del 23 oct'], ['1M', 'octubre 2026'],
  ] as const)('%s → "%s"', (resolution, expected) => {
    expect(intervalLabel(at, resolution, t)).toBe(expected)
  })

  it('el eje muestra horas en un día, meses con resolución mensual y fechas en lo demás', () => {
    expect(axisLabel(at, '15m', 1, t)).toBe('14:15')
    expect(axisLabel(at, '1M', 180, t)).toBe('oct')
    expect(axisLabel(at, '1d', 30, t)).toBe('23 oct')
  })

  it('el periodo va del primer al último día (el final es exclusivo)', () => {
    expect(periodLabel(range, t)).toBe('17 oct – 23 oct')
  })

  it('en inglés usa el orden mes-día', () => {
    expect(intervalLabel(at, '1d', CATALOGS.en)).toBe('Fri Oct 23')
  })
})

describe('indicadores y lectura del cursor', () => {
  const view = buildHistoryView([sample], { resolution: '1d', units: 'metric', range })

  it('arma los indicadores de cada sección con su detalle', () => {
    const text = historySummaryText(view, t, format)
    expect(text.temperature[0]).toEqual({ label: 'Máxima', value: '23.0 °C', detail: '23 oct, 14:15' })
    expect(text.wind[2]).toEqual({ label: 'Dirección dominante', value: 'NO', detail: '100 % de las lecturas' })
    expect(text.rain[1]).toEqual({ label: 'Días con lluvia', value: '1', detail: 'de 1 días' })
    expect(text.pressure[0]?.value).toBe('1,026 hPa')
  })

  it('la lectura dice el intervalo y sus valores; en un hueco dice "sin datos"', () => {
    const thursday = view.buckets.findIndex((b) => !b.empty)
    expect(readoutText(view, thursday, 'temperature', true, t, format)).toBe('vie 23 oct · ext 22.4 °C (21–23) · int 21.0 °C')
    expect(readoutText(view, thursday, 'wind', false, t, format)).toBe('vie 23 oct · media 6.2 km/h · ráfaga 14.5 km/h')
    expect(readoutText(view, 0, 'rain', false, t, format)).toBe('sáb 17 oct · sin datos (estación sin reporte)')
  })

  it('resume cada sección en una línea para los acordeones móviles', () => {
    expect(historySectionSummaries(view, t, format)).toEqual({
      temperature: '22.4 °C · 21.0 °C – 23.0 °C',
      wind: '6.2 km/h · sobre todo NO',
      rain: '1.2 mm · 1 día con lluvia',
      pressure: '1,026 hPa · —',
    })
  })
})
