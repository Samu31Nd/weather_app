/**
 * Textos derivados que web y móvil muestran igual: valores con unidad y decimales del diseño, confort interior,
 * aviso del sol, estado de la estación y vigencia del dato en vivo.
 * Fuente: artboards `Dashboard` y `MobileNow` (decimales por magnitud, "hace 12 s · cada 60 s", insignias).
 * Requerimientos: RF-APP-01, RF-APP-02, RF-APP-05, RF-APP-10, RNF-APP-07.
 */
import type { CurrentConditions } from '@tt/core'
import { describe, expect, it } from 'vitest'
import {
  CATALOGS, createFormatter, humidityInsightText, indoorText, liveText, pressureText, rainText, stationText, sunBadgeText, valueText, windText,
} from '../src'

const t = CATALOGS.es
const format = createFormatter('es', t)

describe('valores con unidad', () => {
  const metric = valueText('metric', format)
  const imperial = valueText('imperial', format)

  it('usa los decimales del diseño en cada sistema', () => {
    expect(metric.temperature(17.83)).toBe('17.8 °C')
    expect(metric.pressureShort(1029.4)).toBe('1,029 hPa')
    expect(imperial.pressureShort(30.394)).toBe('30.39 inHg')
    expect(metric.pressure(1029.44)).toBe('1,029.4')
    expect(imperial.pressure(30.3944)).toBe('30.394')
  })

  it('la lluvia métrica pierde el decimal desde 10 mm; la imperial siempre lleva 2', () => {
    expect(metric.rain(4.57)).toBe('4.6 mm')
    expect(metric.rain(12.3)).toBe('12 mm')
    expect(imperial.rain(0.18)).toBe('0.18 in')
  })

  it('sin dato muestra "—" sin unidad', () => {
    expect(metric.temperature(null)).toBe('—')
    expect(metric.percent(null)).toBe('—')
    expect(metric.degrees(null)).toBe('—')
  })
})

describe('interior', () => {
  const indoor = (overrides: Partial<CurrentConditions['indoor']>): CurrentConditions['indoor'] => ({
    temperature: 22, humidity: 50, comfort: { thermal: 'comfortable', moisture: 'comfortable' }, differenceFromOutdoor: 4.2, ...overrides,
  })

  it('dice "Confortable" solo si temperatura y humedad están en zona', () => {
    expect(indoorText(indoor({}), t, format)).toEqual({ comfort: 'Confortable', comfortable: true, difference: '4.2° más cálido que afuera' })
  })

  it('la temperatura fuera de zona manda sobre la humedad', () => {
    const text = indoorText(indoor({ comfort: { thermal: 'cold', moisture: 'humid' } }), t, format)
    expect(text.comfortable).toBe(false)
    expect(text.comfort).toBe(t.indoor.cold)
  })

  it('menos de medio grado de diferencia cuenta como igual que afuera', () => {
    expect(indoorText(indoor({ differenceFromOutdoor: -0.3 }), t, format).difference).toBe('Igual que afuera')
  })

  it('sin lecturas no inventa textos', () => {
    expect(indoorText(indoor({ comfort: null, differenceFromOutdoor: null }), t, format)).toEqual({ comfort: null, comfortable: false, difference: null })
  })
})

describe('aviso del sol', () => {
  const sun = (isDay: boolean, minutesToNextEvent: number | null) => ({ isDay, minutesToNextEvent }) as CurrentConditions['sun']

  it('de día cuenta la luz que queda y de noche lo que falta para amanecer', () => {
    expect(sunBadgeText(sun(true, 190), t, format)).toBe('Quedan 3 h 10 min de luz')
    expect(sunBadgeText(sun(false, 575), t, format)).toBe('Amanece en 9 h 35 min')
  })

  it('sin horas del sol no hay aviso', () => {
    expect(sunBadgeText(sun(true, null), t, format)).toBeNull()
  })
})

describe('estado de la estación', () => {
  it('muestra batería, señal con su nivel y tiempo encendida', () => {
    const text = stationText({ batteryVolts: 4.721, batteryLevel: 0.72, signalDbm: -57, signalLevel: 3, uptimeSeconds: 92 * 60 }, t, format)
    expect(text).toEqual({ battery: '4.72 V', signal: 'Buena · -57 dBm', uptime: `hace ${format.uptime(92 * 60)}` })
  })

  it('sin datos muestra "—"', () => {
    const text = stationText({ batteryVolts: null, batteryLevel: null, signalDbm: null, signalLevel: null, uptimeSeconds: null }, t, format)
    expect(text).toEqual({ battery: '—', signal: '—', uptime: '—' })
  })
})

describe('vigencia del dato en vivo', () => {
  const observedAt = new Date('2026-10-24T15:42:00Z') // 09:42 en CDMX

  it('al día: "En vivo" con los segundos desde la última consulta', () => {
    expect(liveText({ status: 'ok', secondsSinceUpdate: 12, observedAt }, t, format)).toEqual({ tone: 'ok', label: 'En vivo', detail: 'hace 12 s · cada 60 s' })
    expect(liveText({ status: 'ok', secondsSinceUpdate: 1, observedAt }, t, format).detail).toBe('actualizado ahora')
  })

  it('dato viejo y sin conexión cambian el tono y el texto', () => {
    expect(liveText({ status: 'stale', secondsSinceUpdate: 200, observedAt }, t, format).tone).toBe('stale')
    const offline = liveText({ status: 'offlineWithData', secondsSinceUpdate: 400, observedAt }, t, format)
    expect(offline).toEqual({ tone: 'offline', label: 'Sin conexión', detail: 'Sin conexión · último dato a las 09:42' })
  })
})

describe('viento', () => {
  const wind = (overrides: Partial<CurrentConditions['wind']>): CurrentConditions['wind'] => ({
    speed: 8, calm: false, directionDeg: 315, direction: 'NW', beaufort: 2, avg2Min: 6, avg10Min: 5, gust: 30, gustDirectionDeg: 300, gustDirection: 'WNW', ...overrides,
  })

  it('nombra la dirección con la rosa del idioma y escala las barras con la ráfaga', () => {
    const text = windText(wind({}), 'metric', t, format)
    expect(text.center).toBe('NO')
    expect(text.centerDetail).toBe('315°')
    expect(text.bars.map((bar) => bar.fraction)).toEqual([6 / 30, 5 / 30, 1])
    expect(text.bars[2]).toMatchObject({ label: 'Ráfaga · desde ONO', gust: true })
  })

  it('en calma muestra "Calma" y la última dirección', () => {
    const text = windText(wind({ calm: true, speed: 0 }), 'metric', t, format)
    expect(text.center).toBe(t.hero.calm)
    expect(text.centerDetail).toBe(t.wind.lastDirection('NO', 315))
    expect(text.accessibilityLabel).toBe(t.wind.calmLabel('NO'))
  })
})

describe('lluvia', () => {
  const rain: CurrentConditions['rain'] = { rate: 1.2, intensity: 'light', last15Min: 0.2, lastHour: 0.8, today: 2, last24h: 4, storm: 4, month: 25, year: 475 }

  it('la barra más llena es la ventana más grande y la insignia da intensidad y tasa', () => {
    const text = rainText(rain, 'metric', t, format)
    expect(text.windows.map((w) => w.fraction)).toEqual([0.05, 0.2, 0.5, 1])
    expect(text.badge).toBe(`${t.rain.intensity.light} · 1.2 mm/h`)
    expect(text.totals.map((total) => total.value)).toEqual(['4.0 mm', '25 mm', '475 mm'])
  })

  it('sin lluvia, la escala mínima evita barras llenas por centésimas', () => {
    const dry = rainText({ ...rain, intensity: 'none', last15Min: 0, lastHour: 0, today: 0.2, last24h: 0.2 }, 'metric', t, format)
    expect(dry.badge).toBe(t.rain.noRainNow)
    expect(dry.windows[3]?.fraction).toBeCloseTo(0.2)
  })
})

describe('presión', () => {
  const pressure = { value: 1029.4, hPa: 1029.4, mmHg: 772.1, trend: 'steady', todayLow: 1027.1, todayHigh: 1029.8, gauge: null, implausibleExtreme: null } as CurrentConditions['pressure']

  it('da la lectura en las otras unidades y la escala del medidor', () => {
    const text = pressureText(pressure, 'metric', t, format)
    expect(text.alternate).toBe('772.1 mmHg · 30.398 inHg')
    expect([text.scaleLow, text.scaleHigh]).toEqual(['995', '1,045'])
    expect(text.dayRange).toBe('1,027.1 – 1,029.8')
    expect(text.trend).toBe(t.pressure.trends.steady)
    expect(text.implausibleNote).toBeNull()
  })

  it('avisa si un extremo del mes no es creíble', () => {
    expect(pressureText({ ...pressure, implausibleExtreme: 1032 }, 'metric', t, format).implausibleNote).toBe(t.pressure.implausible('1,032 hPa'))
  })
})

describe('humedad', () => {
  it('interpreta la distancia al punto de rocío', () => {
    const humidity = { now: 91, todayLow: 80, todayHigh: 95, dewPoint: 14.4, spread: 1.4, insight: 'saturated' } as CurrentConditions['humidity']
    expect(humidityInsightText(humidity, t, format)).toBe(t.humidity.insight.saturated('1.4'))
    expect(humidityInsightText({ ...humidity, insight: null }, t, format)).toBeNull()
  })
})
