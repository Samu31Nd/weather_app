/**
 * Geometría de las gráficas del histórico: escalas con marcas redondas, curva que pasa por cada punto sin rebasar
 * los valores, cortes en los huecos (nunca ceros), barras, área acumulada y rosa de los vientos.
 * Fuente: artboard `Main` (nice, smooth, runs, line, band, bars, rosa); docs/06-datos.md (D8); ADR-0006.
 * Requerimientos: RF-APP-07.
 */
import { describe, expect, it } from 'vitest'
import type { WindRose } from '../../src/application/history-view'
import { COMPASS_POINTS } from '../../src/domain/wind'
import {
  areaPath, bandPath, barsPath, linePath, linearY, monotoneSegments, niceScale, roseGeometry, runs, slotX, xTickIndices,
} from '../../src/charts/series'

const numbers = (d: string) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)

describe('escalas', () => {
  it('elige pasos de 1, 2 o 5 y contiene el rango', () => {
    expect(niceScale(12.3, 24.8, 4)).toEqual({ lo: 10, hi: 25, step: 5, ticks: [10, 15, 20, 25] })
    expect(niceScale(0, 0.7, 3).step).toBe(0.2)
  })

  it('un rango plano no divide entre cero', () => {
    expect(niceScale(5, 5, 4).hi).toBeGreaterThan(5)
  })

  it('el valor más bajo va abajo del lienzo y el más alto arriba', () => {
    const y = linearY({ lo: 10, hi: 20 }, 200)
    expect([y(10), y(20), y(15)]).toEqual([200, 0, 100])
  })
})

describe('series', () => {
  const y = linearY({ lo: 0, hi: 10 }, 100)

  it('cada valor va al centro de su intervalo', () => {
    expect(slotX(0, 4, 1000)).toBe(125)
    expect(slotX(3, 4, 1000)).toBe(875)
  })

  it('corta la línea en los huecos: dos tramos, dos "M"', () => {
    expect(runs([1, 2, null, 4])).toEqual([[0, 1], [3]])
    const d = linePath([1, 2, null, 4, 5], y, 1000)
    expect(d.match(/M/g)).toHaveLength(2)
  })

  it('la curva pasa exactamente por cada punto', () => {
    const points = [{ x: 0, y: 50 }, { x: 10, y: 20 }, { x: 20, y: 40 }, { x: 30, y: 10 }]
    const d = monotoneSegments(points)
    const ends = d.split('C').slice(1).map((segment) => numbers(segment).slice(4))
    expect(ends).toEqual([[10, 20], [20, 40], [30, 10]])
  })

  it('no inventa picos: en un tramo creciente los controles no rebasan los extremos', () => {
    const d = monotoneSegments([{ x: 0, y: 100 }, { x: 10, y: 50 }, { x: 20, y: 0 }])
    for (const value of numbers(d).filter((_, i) => i % 2 === 1)) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(100)
    }
  })

  it('la banda se cierra y omite los intervalos sin mínimo o máximo', () => {
    const d = bandPath([1, 2, null, 3], [4, 5, 6, 7], y, 1000)
    expect(d.match(/Z/g)).toHaveLength(2)
  })

  it('solo dibuja barras para intervalos con lluvia', () => {
    const d = barsPath([0, 2, null, 0.5], y, 1000, 100)
    expect(d.match(/M/g)).toHaveLength(2)
  })

  it('el área acumulada baja a la línea base al final', () => {
    expect(areaPath([0, 1, 3], y, 300, 100)).toMatch(/L250\.0 100L50\.0 100Z$/)
  })

  it('reparte hasta 6 marcas del eje x de punta a punta', () => {
    expect(xTickIndices(24)).toEqual([0, 5, 9, 14, 18, 23])
    expect(xTickIndices(3)).toEqual([0, 1, 2])
  })
})

describe('rosa de los vientos', () => {
  const rose: WindRose = {
    directions: COMPASS_POINTS.map((direction) => ({ direction, percentBySpeed: direction === 'N' ? [10, 20, 10] : [0, 0, 0] })),
    calmPercent: 60,
    maxPercent: 40,
  }
  const geometry = roseGeometry(rose)

  it('dibuja una cuña por banda de velocidad solo donde hubo viento', () => {
    expect(geometry.wedges.map((w) => (w.match(/M/g) ?? []).length)).toEqual([1, 1, 1])
  })

  it('el rumbo más frecuente llega al anillo exterior (radio 104)', () => {
    expect(geometry.wedges[2]).toContain('A104.0 104.0')
  })
})
