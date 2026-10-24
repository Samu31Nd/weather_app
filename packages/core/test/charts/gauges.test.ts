/**
 * Geometría de los indicadores de "Ahora": arco del sol, medidor de presión y anillo de humedad.
 * Fuente: fórmulas del script de los artboards `Dashboard` y `MobileNow` (arcPt, gPt, arc, dash).
 * Requerimientos: RF-APP-01, RNF-APP-08 (la misma geometría en web y móvil).
 */
import { describe, expect, it } from 'vitest'
import { gaugeAngle, gaugeArcPath, gaugePoint, ringDashArray, sunArcPath, sunArcPoint } from '../../src/charts/gauges'

describe('arco del sol', () => {
  it('sale en (20, 88), culmina en (160, 16) y se pone en (300, 88)', () => {
    expect(sunArcPoint(0)).toEqual({ x: 20, y: 88 })
    expect(sunArcPoint(0.5)).toEqual({ x: 160, y: 16 })
    expect(sunArcPoint(1)).toEqual({ x: 300, y: 88 })
  })

  it('recorta los valores fuera de 0–1', () => {
    expect(sunArcPoint(-1)).toEqual(sunArcPoint(0))
    expect(sunArcPoint(2)).toEqual(sunArcPoint(1))
  })

  it('dibuja el path completo con 41 puntos y termina donde va el sol', () => {
    const path = sunArcPath(1)
    expect(path.startsWith('M20 88L')).toBe(true)
    expect(path.match(/[ML]/g)).toHaveLength(41)
    expect(sunArcPath(0.5).endsWith('L160 16')).toBe(true)
  })
})

describe('medidor de presión (270°)', () => {
  it('va de −135° a +135°', () => {
    expect(gaugeAngle(0)).toBe(-135)
    expect(gaugeAngle(0.5)).toBe(0)
    expect(gaugeAngle(1)).toBe(135)
  })

  it('ubica los extremos y la cima en el círculo de radio 60 con centro (75, 72)', () => {
    expect(gaugePoint(0.5)).toEqual({ x: 75, y: 12 })
    expect(gaugePoint(0)).toEqual({ x: 32.6, y: 114.4 })
  })

  it('usa el arco largo solo si el tramo supera 180°', () => {
    expect(gaugeArcPath(0.4, 0.45)).toMatch(/A60 60 0 0 1/)
    expect(gaugeArcPath(0, 1)).toMatch(/A60 60 0 1 1/)
  })
})

describe('anillo de humedad', () => {
  it('llena el perímetro proporcional al porcentaje (r = 34)', () => {
    expect(ringDashArray(100)).toBe('213.6 999')
    expect(ringDashArray(61)).toBe('130.3 999')
    expect(ringDashArray(0)).toBe('0 999')
  })
})
