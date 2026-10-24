/**
 * Modelo de vista de "Ahora" con la lectura real del 24-oct (09:59 en CDMX).
 * Fuente: artboards `Dashboard` y `MobileNow` (barra del rango, medidor de presión, insight de humedad,
 * intensidad de lluvia, barras de señal y batería); test/fixtures/README.md (valores de referencia).
 * Requerimientos: RF-APP-01, RF-APP-03, RF-APP-04, RF-APP-05.
 */
import { describe, expect, it } from 'vitest'
import { mapDavisLive } from '../../src/adapters/davis-live/davis-live.mapper'
import { buildCurrentConditions, rainIntensity, signalLevel } from '../../src/application/current-conditions'
import { liveFixture } from '../fixtures/load'

const now = new Date('2026-10-24T15:59:58Z')
const reading = mapDavisLive(liveFixture())
const metric = buildCurrentConditions(reading, { units: 'metric', now, scene: 'clearDay' })

describe('condiciones actuales (métrico)', () => {
  it('da temperatura, sensación y su motivo', () => {
    expect(metric.temperature.now).toBeCloseTo(17.83, 2)
    expect(metric.temperature.feelsLikeReason).toBe('none')
    expect(metric.temperature.feelsLike).toBeCloseTo(17.83, 2)
  })

  it('ubica el día dentro del mes en la barra: hoy 10.0–18.3 °C dentro de 7.8–28.2 °C', () => {
    const { range } = metric.temperature
    expect(range.swing).toBeCloseTo(8.28, 2)
    expect(range.bar?.todayStart).toBeCloseTo((10 - 7.83) / (28.22 - 7.83), 2)
    expect(range.bar?.current).toBeCloseTo((17.83 - 7.83) / (28.22 - 7.83), 2)
  })

  it('clasifica la humedad con la distancia al punto de rocío (7.8 °C: aire seco)', () => {
    expect(metric.humidity.spread).toBeCloseTo(7.83, 2)
    expect(metric.humidity.insight).toBe('dry')
  })

  it('describe el viento: calma, sin dirección dominante pero con ráfaga del ESE', () => {
    expect(metric.wind.calm).toBe(true)
    expect(metric.wind.beaufort).toBe(0)
    expect(metric.wind.direction).toBe('ESE')
    expect(metric.wind.gust).toBeCloseTo(9.66, 2)
  })

  it('pone la aguja de la presión dentro del medidor y marca el extremo no creíble del mes', () => {
    expect(metric.pressure.value).toBeCloseTo(1029.2, 1)
    expect(metric.pressure.gauge?.needle).toBeCloseTo((1029.23 - 995) / 50, 2)
    expect(metric.pressure.implausibleExtreme).toBeCloseTo(762.5, 0) // 22.517 inHg sin corregir
  })

  it('sin lluvia, la intensidad es "none"', () => {
    expect(metric.rain.intensity).toBe('none')
    expect(metric.rain.today).toBe(0)
  })

  it('compara el interior con el exterior y evalúa el confort', () => {
    expect(metric.indoor.temperature).toBeCloseTo(19.61, 2) // 67.3 °F
    expect(metric.indoor.differenceFromOutdoor).toBeCloseTo(1.78, 2)
    expect(metric.indoor.comfort).toEqual({ thermal: 'cold', moisture: 'comfortable' }) // < 20 °C, 49 %
  })

  it('calcula el sol: de día, avance y minutos de luz restantes', () => {
    expect(metric.sun.isDay).toBe(true)
    expect(metric.sun.minutesToNextEvent).toBe(488) // 09:59:58 → 18:08
    expect(metric.sun.progress).toBeGreaterThan(0.2)
  })

  it('resume la estación: batería, barras de señal y tiempo encendida', () => {
    expect(metric.station.batteryLevel).toBeCloseTo(0.74, 2)
    expect(metric.station.signalLevel).toBe(3) // -58 dBm
    expect(metric.station.uptimeSeconds).toBe(226)
  })
})

describe('condiciones actuales (imperial)', () => {
  const imperial = buildCurrentConditions(reading, { units: 'imperial', now, scene: 'clearDay' })

  it('entrega los mismos datos en °F, mph, in e inHg', () => {
    expect(imperial.temperature.now).toBeCloseTo(64.1, 1)
    expect(imperial.temperature.range.swing).toBeCloseTo(14.9, 1)
    expect(imperial.wind.gust).toBeCloseTo(6, 6)
    expect(imperial.pressure.value).toBeCloseTo(30.393, 3)
  })
})

describe('noche y datos faltantes', () => {
  it('de noche cuenta los minutos hasta el próximo amanecer', () => {
    const night = buildCurrentConditions(reading, { units: 'metric', now: new Date('2026-10-25T03:00:00Z'), scene: 'clearNight' })
    expect(night.sun.isDay).toBe(false)
    expect(night.sun.minutesToNextEvent).toBe(575) // 21:00 → 06:35 del día siguiente
  })

  it('sin temperatura no hay barra del rango ni diferencia interior', () => {
    const empty = buildCurrentConditions({ ...reading, outdoor: { ...reading.outdoor, temperatureC: null } }, { units: 'metric', now, scene: 'offline' })
    expect(empty.temperature.range.bar).toBeNull()
    expect(empty.indoor.differenceFromOutdoor).toBeNull()
    expect(empty.humidity.insight).toBeNull()
  })
})

describe('categorías', () => {
  it.each([
    { mmh: 0, cat: 'none' }, { mmh: 0.2, cat: 'light' }, { mmh: 2.5, cat: 'moderate' },
    { mmh: 7.6, cat: 'heavy' }, { mmh: 50, cat: 'torrential' }, { mmh: null, cat: 'none' },
  ] as const)('$mmh mm/h es lluvia $cat', ({ mmh, cat }) => {
    expect(rainIntensity(mmh)).toBe(cat)
  })

  it.each([
    { dbm: -50, barras: 4 }, { dbm: -55, barras: 3 }, { dbm: -64, barras: 3 }, { dbm: -70, barras: 2 }, { dbm: -80, barras: 1 },
  ] as const)('$dbm dBm son $barras barras', ({ dbm, barras }) => {
    expect(signalLevel(dbm)).toBe(barras)
  })
})
