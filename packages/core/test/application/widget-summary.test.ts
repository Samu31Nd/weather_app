/**
 * Widget de Android: el ícono que resume cada escena del cielo y el dato contextual del tamaño 2×2, con su orden de
 * prioridad (ráfaga, lluvia, neblina, rango del día) y el umbral de ráfaga también en unidades imperiales.
 * Fuente: artboards `WidgetsClaro`/`WidgetsOscuro` y su nota de diseño.
 * Requerimientos: RF-APP-01, RF-APP-03.
 */
import { describe, expect, it } from 'vitest'
import { type CurrentConditions, SKY_SCENES, WIDGET_KINDS, widgetDetail, widgetKind } from '../../src'

const view = (overrides: { scene?: CurrentConditions['scene']; gust?: number | null; intensity?: CurrentConditions['rain']['intensity']; units?: CurrentConditions['units'] }) =>
  ({
    scene: overrides.scene ?? 'clearDay',
    units: overrides.units ?? 'metric',
    wind: { gust: overrides.gust ?? 10 },
    rain: { intensity: overrides.intensity ?? 'none' },
  }) as CurrentConditions

describe('ícono del widget', () => {
  it('toda escena del cielo tiene un ícono del diseño', () => {
    for (const scene of SKY_SCENES) expect(WIDGET_KINDS).toContain(widgetKind(scene))
  })

  it.each([
    ['clearDay', 'clear'], ['clearNight', 'night'], ['cloudy', 'partly'], ['nightRain', 'rain'], ['storm', 'storm'], ['fog', 'fog'], ['offline', 'offline'],
  ] as const)('%s → %s', (scene, kind) => {
    expect(widgetKind(scene)).toBe(kind)
  })
})

describe('dato contextual del 2×2', () => {
  it('sin nada especial muestra máx/mín del día', () => {
    expect(widgetDetail(view({}))).toBe('range')
  })

  it('la ráfaga de 29 km/h o más manda sobre la lluvia', () => {
    expect(widgetDetail(view({ gust: 44, intensity: 'heavy' }))).toBe('gust')
    expect(widgetDetail(view({ gust: 28.9, intensity: 'moderate' }))).toBe('rainToday')
  })

  it('el umbral se compara en las unidades de la vista (29 km/h ≈ 18 mph)', () => {
    expect(widgetDetail(view({ units: 'imperial', gust: 19 }))).toBe('gust')
    expect(widgetDetail(view({ units: 'imperial', gust: 17 }))).toBe('range')
  })

  it('con neblina muestra la humedad y sin conexión la hora de la última lectura', () => {
    expect(widgetDetail(view({ scene: 'fog' }))).toBe('humidity')
    expect(widgetDetail(view({ scene: 'offline', gust: 50 }))).toBe('lastReading')
  })
})
