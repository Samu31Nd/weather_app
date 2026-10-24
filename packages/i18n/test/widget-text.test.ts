/**
 * Textos del widget de Android con la lectura real del 24-oct: cifras enteras, condición corta, dato contextual,
 * columna de detalles y la hora de la lectura junto a la estación; y el caso sin conexión con la última lectura.
 * Fuente: artboards `WidgetsClaro`/`WidgetsOscuro` y su nota de diseño.
 * Requerimientos: RF-APP-01, RF-APP-02, RNF-APP-07.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildCurrentConditions, mapDavisLive } from '@tt/core'
import { describe, expect, it } from 'vitest'
import { CATALOGS, createFormatter, widgetOfflineText, widgetText } from '../src'

const t = CATALOGS.es
const format = createFormatter('es', t)
const reading = mapDavisLive(JSON.parse(readFileSync(resolve(process.cwd(), '../core/test/fixtures/wflexp-2026-10-24.json'), 'utf8')))
const now = new Date('2026-10-24T15:59:58Z')
const view = (scene: Parameters<typeof buildCurrentConditions>[1]['scene'], units: 'metric' | 'imperial' = 'metric') =>
  buildCurrentConditions(reading, { units, now, scene })

describe('widget con datos', () => {
  const text = widgetText(view('partly'), 'Liz', t, format)

  it('muestra la temperatura entera, la condición corta y la hora de la lectura', () => {
    expect(text.temperature).toBe('18°')
    expect(text.condition).toBe('Parcialmente nublado')
    expect(text.station).toMatch(/^Liz · \d{2}:\d{2}$/)
    expect(text.summary).toBe('Parcialmente nublado, 18°')
    expect(text.stale).toBe(false)
  })

  it('sin lluvia ni ráfaga fuerte, el dato del 2×2 es el máximo y mínimo del día', () => {
    expect(text.detail).toBe(text.range)
    expect(text.range).toMatch(/^Máx \d+° · Mín \d+°$/)
  })

  it('la columna del 4×2 trae humedad, viento y lluvia de hoy', () => {
    expect(text.facts.map((fact) => fact.label)).toEqual(['Humedad', 'Viento', 'Lluvia hoy'])
    expect(text.facts[0]?.value).toMatch(/^\d+ %$/)
  })

  it('con neblina el dato del 2×2 es la humedad', () => {
    expect(widgetText(view('fog'), 'Liz', t, format).detail).toMatch(/^Humedad \d+ %$/)
  })

  it('en inglés e imperial cambia el idioma y las unidades', () => {
    const en = widgetText(view('clearDay', 'imperial'), 'Liz', CATALOGS.en, createFormatter('en', CATALOGS.en))
    expect(en.temperature).toBe('64°')
    expect(en.condition).toBe('Clear')
    expect(en.facts[2]?.value).toMatch(/ in$/)
  })
})

describe('widget sin conexión', () => {
  it('muestra la última temperatura en gris y su hora; lo demás en blanco', () => {
    const text = widgetOfflineText({ stationName: 'Liz', temperatureC: 16.2, observedAt: new Date('2026-10-25T00:40:00Z') }, { units: 'metric', now }, t, format)
    expect(text).toMatchObject({ kind: 'offline', temperature: '16°', stale: true, condition: 'Sin conexión', detail: 'Última: 18:40' })
    expect(text.facts.every((fact) => fact.value === '—')).toBe(true)
  })

  it('si nunca hubo lectura, la temperatura queda vacía', () => {
    expect(widgetOfflineText(null, { units: 'metric', now }, t, format).temperature).toBe('—')
  })
})
