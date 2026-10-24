/**
 * Escena del cielo: las siete capas de la nota `skyMap` del canvas de diseño, en orden.
 * Fuente: canvas "Estación meteorológica", nota `skyMap`; tabla en docs/06-datos.md#escena-del-cielo.
 * Cada escena tiene su artboard `project/Sky*.dc.html`; aquí hay un caso que produce cada una (21 en total).
 * Interpretación de precedencia: la lluvia medida manda sobre el viento; temperatura solo con cielo
 * despejado o parcial de día; la neblina solo de noche o al amanecer y sin lluvia; estados del sistema primero.
 * Requerimientos: RF-APP-03.
 */
import { describe, expect, it } from 'vitest'
import { decodeForecast } from '../../src/domain/forecast'
import { SKY_SCENES, type SkyScene, type SkySceneInput, resolveSkyScene } from '../../src/domain/sky-scene'

// Reglas reales de la consola usadas como entrada del pronóstico.
const RULE = {
  mostlyClearNoChange: 1,
  mostlyClearWarmer: 8,
  mostlyClearCooler: 0,
  partlyCloudyNoChange: 6,
  increasingClouds: 29,
  mostlyCloudyHeavyWindy: 192,
  clearingEnding: 70,
  precipitationLikely: 189,
  windShift: 177,
  increasingWinds: 24,
} as const

function input(overrides: Partial<SkySceneInput> & { rule?: number }): SkySceneInput {
  const { rule = RULE.mostlyClearNoChange, ...rest } = overrides
  return {
    forecast: decodeForecast(rule),
    phase: 'day',
    rainRateMmH: 0,
    gustKmh: 5,
    humidityPct: 50,
    temperatureC: 20,
    dewPointC: 9,
    ...rest,
  }
}

const cases: ReadonlyArray<{ escena: SkyScene; caso: string; entrada: SkySceneInput }> = [
  { escena: 'clearDay', caso: 'día despejado sin cambios', entrada: input({}) },
  { escena: 'clearNight', caso: 'noche despejada', entrada: input({ phase: 'night' }) },
  { escena: 'dawn', caso: 'amanecer despejado', entrada: input({ phase: 'dawn' }) },
  { escena: 'twilight', caso: 'atardecer parcialmente nublado', entrada: input({ phase: 'dusk', rule: RULE.partlyCloudyNoChange }) },
  { escena: 'partly', caso: 'día parcialmente nublado', entrada: input({ rule: RULE.partlyCloudyNoChange }) },
  { escena: 'increasing', caso: 'nubes en aumento de día', entrada: input({ rule: RULE.increasingClouds }) },
  { escena: 'cloudy', caso: 'mayormente nublado de día, sin lluvia ni viento', entrada: input({ rule: 135 }) },
  { escena: 'nightCloudy', caso: 'nubes en aumento de noche', entrada: input({ phase: 'night', rule: RULE.increasingClouds }) },
  { escena: 'clearing', caso: 'despejando: precipitación terminando', entrada: input({ rule: RULE.clearingEnding }) },
  { escena: 'drizzle', caso: 'llovizna medida (0.3 mm/h)', entrada: input({ rainRateMmH: 0.3 }) },
  { escena: 'rain', caso: 'lluvia medida de día (2 mm/h)', entrada: input({ rainRateMmH: 2 }) },
  { escena: 'nightRain', caso: 'lluvia medida de noche', entrada: input({ phase: 'night', rainRateMmH: 2 }) },
  { escena: 'storm', caso: 'lluvia fuerte medida (≥ 7.6 mm/h)', entrada: input({ rainRateMmH: 7.6 }) },
  { escena: 'likely', caso: 'sin lluvia medida pero probable', entrada: input({ rule: RULE.precipitationLikely }) },
  { escena: 'windy', caso: 'ráfaga de 29 km/h con cielo despejado', entrada: input({ gustKmh: 29 }) },
  { escena: 'windShift', caso: 'posible cambio de viento al W, NW o N', entrada: input({ rule: RULE.windShift, rainRateMmH: 0 }) },
  { escena: 'warmer', caso: 'despejado y más cálido', entrada: input({ rule: RULE.mostlyClearWarmer }) },
  { escena: 'cooler', caso: 'despejado y más fresco', entrada: input({ rule: RULE.mostlyClearCooler }) },
  { escena: 'fog', caso: 'neblina de noche: 95 % y rocío a 1 °C', entrada: input({ phase: 'night', humidityPct: 95, temperatureC: 11, dewPointC: 10 }) },
  { escena: 'calibrating', caso: 'regla 193: la consola necesita 3 h de datos', entrada: input({ rule: 193 }) },
  { escena: 'offline', caso: 'la consola no respondió', entrada: { ...input({}), forecast: null } },
]

describe('una escena por artboard del canvas', () => {
  it('cubre las 21 escenas', () => {
    expect(new Set(cases.map((c) => c.escena))).toEqual(new Set(SKY_SCENES))
  })

  it.each(cases)('$escena: $caso', ({ escena, entrada }) => {
    expect(resolveSkyScene(entrada)).toBe(escena)
  })
})

describe('precedencia entre capas', () => {
  it('la lluvia medida manda sobre un pronóstico despejado', () => {
    expect(resolveSkyScene(input({ rule: RULE.mostlyClearNoChange, rainRateMmH: 1 }))).toBe('rain')
  })

  it('con "possibly heavy at times" y lluvia medida, aunque sea poca, es lluvia fuerte', () => {
    expect(resolveSkyScene(input({ rule: RULE.mostlyCloudyHeavyWindy, rainRateMmH: 0.2 }))).toBe('storm')
  })

  it('el viento no reemplaza a una escena de lluvia', () => {
    expect(resolveSkyScene(input({ rainRateMmH: 2, gustKmh: 40 }))).toBe('rain')
  })

  it('"Increasing winds" vuelve ventoso un día despejado aunque la ráfaga sea baja', () => {
    expect(resolveSkyScene(input({ rule: RULE.increasingWinds, gustKmh: 3 }))).toBe('windy')
  })

  it('la temperatura no cambia un cielo nublado', () => {
    expect(resolveSkyScene(input({ rule: RULE.increasingClouds }))).toBe('increasing')
  })

  it('no hay neblina de día ni con lluvia medida', () => {
    const saturated = { humidityPct: 95, temperatureC: 11, dewPointC: 10 }
    expect(resolveSkyScene(input({ ...saturated, phase: 'day' }))).toBe('clearDay')
    expect(resolveSkyScene(input({ ...saturated, phase: 'night', rainRateMmH: 0.2 }))).toBe('drizzle')
  })

  it('la neblina requiere los tres datos (humedad, temperatura y rocío)', () => {
    expect(resolveSkyScene(input({ phase: 'night', humidityPct: 95, temperatureC: null, dewPointC: 10 }))).toBe('clearNight')
  })

  it('una regla fuera de rango se trata como sin conexión', () => {
    expect(resolveSkyScene(input({ rule: 250 }))).toBe('offline')
  })
})
