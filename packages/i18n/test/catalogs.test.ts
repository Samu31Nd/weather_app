/**
 * Catálogos es/en: misma estructura, sin textos vacíos y cobertura completa de lo que enumera el núcleo.
 * Fuente: `I18N()` de los artboards del diseño; RNF-APP-07 (todo texto sale de catálogos con las mismas claves).
 * Requerimientos: RNF-APP-07, RF-APP-10, RF-APP-04.
 */
import { COMPASS_POINTS, SKY_SCENES } from '@tt/core'
import { describe, expect, it } from 'vitest'
import { CATALOGS } from '../src'

type Shape = string | { [key: string]: Shape } | Shape[]

/** Estructura comparable: los textos se vuelven "texto" y las funciones, su número de parámetros. */
function shapeOf(value: unknown): Shape {
  if (typeof value === 'function') return `fn/${value.length}`
  if (Array.isArray(value)) return value.map(shapeOf)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, shapeOf(v)]))
  }
  return typeof value
}

function leafStrings(value: unknown, path = ''): Array<[string, string]> {
  if (typeof value === 'string') return [[path, value]]
  if (value !== null && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => leafStrings(v, `${path}.${k}`))
  return []
}

describe('paridad de catálogos', () => {
  it('español e inglés tienen exactamente las mismas claves, listas y parámetros', () => {
    expect(shapeOf(CATALOGS.en)).toEqual(shapeOf(CATALOGS.es))
  })

  it.each(['es', 'en'] as const)('el catálogo %s no tiene textos vacíos', (language) => {
    expect(leafStrings(CATALOGS[language]).filter(([, text]) => text.trim() === '')).toEqual([])
  })
})

describe('cobertura de lo que enumera el núcleo', () => {
  it.each(['es', 'en'] as const)('%s nombra las 21 escenas, los 16 rumbos y las 13 fuerzas de Beaufort', (language) => {
    const catalog = CATALOGS[language]
    expect(Object.keys(catalog.scene.names).sort()).toEqual([...SKY_SCENES].sort())
    expect(Object.keys(catalog.wind.compass).sort()).toEqual([...COMPASS_POINTS].sort())
    expect(catalog.wind.beaufortNames).toHaveLength(13)
  })

  it('usa O (oeste) en español y W en inglés', () => {
    expect(CATALOGS.es.wind.compass.WSW).toBe('OSO')
    expect(CATALOGS.en.wind.compass.WSW).toBe('WSW')
  })
})
