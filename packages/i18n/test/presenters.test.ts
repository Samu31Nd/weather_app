/**
 * Textos derivados que web y móvil muestran igual: valores con unidad y decimales del diseño, confort interior,
 * aviso del sol, estado de la estación y vigencia del dato en vivo.
 * Fuente: artboards `Dashboard` y `MobileNow` (decimales por magnitud, "hace 12 s · cada 60 s", insignias).
 * Requerimientos: RF-APP-01, RF-APP-02, RF-APP-05, RF-APP-10, RNF-APP-07.
 */
import type { CurrentConditions } from '@tt/core'
import { describe, expect, it } from 'vitest'
import { CATALOGS, createFormatter, indoorText, liveText, stationText, sunBadgeText, valueText } from '../src'

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
