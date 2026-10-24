/**
 * Preferencias de presentación: valores por defecto, validación y tema efectivo.
 * Fuente: panel de ajustes de los artboards `Dashboard` y `MobileNow` (tamaño s/m/l, unidades, tema, idioma).
 * Requerimientos: RF-APP-10.
 */
import { describe, expect, it } from 'vitest'
import { DEFAULT_PREFERENCES, TEXT_SCALE, normalizePreferences, resolveTheme } from '../../src/domain/preferences'

describe('preferencias', () => {
  it('usa español, métrico, tema del sistema y texto mediano por defecto', () => {
    expect(DEFAULT_PREFERENCES).toEqual({ theme: 'system', language: 'es', units: 'metric', textSize: 'm' })
    expect(normalizePreferences({})).toEqual(DEFAULT_PREFERENCES)
  })

  it('conserva los valores válidos y reemplaza los desconocidos por el valor por defecto', () => {
    expect(normalizePreferences({ theme: 'dark', language: 'fr', units: 'imperial', textSize: 42 })).toEqual({
      theme: 'dark', language: 'es', units: 'imperial', textSize: 'm',
    })
  })

  it('escala el texto como el diseño: 0.9, 1 y 1.15', () => {
    expect(TEXT_SCALE).toEqual({ s: 0.9, m: 1, l: 1.15 })
  })

  it.each([
    { tema: 'system', oscuro: true, efectivo: 'dark' },
    { tema: 'system', oscuro: false, efectivo: 'light' },
    { tema: 'light', oscuro: true, efectivo: 'light' },
    { tema: 'dark', oscuro: false, efectivo: 'dark' },
  ] as const)('el tema $tema con sistema oscuro=$oscuro se ve $efectivo', ({ tema, oscuro, efectivo }) => {
    expect(resolveTheme(tema, oscuro)).toBe(efectivo)
  })
})
