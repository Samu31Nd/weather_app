// Geometría de las gráficas del histórico (artboards `Main` y `MobileHistory`, ADR-0006): escalas con marcas
// redondas, curvas que pasan por cada punto sin inventar picos, bandas mín–máx, barras y la rosa de los vientos.
// Devuelve `d` de paths SVG en un lienzo de `width` × `height`; la web y la móvil los dibujan igual.
// Un `null` es un intervalo sin datos: la línea se corta ahí (D8), nunca baja a cero.

import type { WindRose } from '../application/history-view'
import type { Point } from './gauges'

export interface NiceScale {
  readonly lo: number
  readonly hi: number
  readonly step: number
  readonly ticks: readonly number[]
}

/** Escala con `count` divisiones aproximadas y pasos de 1, 2 o 5 × 10ⁿ que contienen [lo, hi]. */
export function niceScale(lo: number, hi: number, count: number): NiceScale {
  const top = hi - lo < 1e-9 ? lo + 1 : hi
  const raw = (top - lo) / count
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const normalized = raw / magnitude
  const step = (normalized < 1.5 ? 1 : normalized < 3 ? 2 : normalized < 7 ? 5 : 10) * magnitude
  const start = Math.floor(lo / step) * step
  const end = Math.ceil(top / step) * step
  const ticks: number[] = []
  for (let value = start; value <= end + step / 2; value += step) ticks.push(Math.round(value * 1000) / 1000)
  return { lo: start, hi: end, step, ticks }
}

/** Valor → coordenada y (0 arriba) en un lienzo de altura `height`. */
export function linearY(scale: { lo: number; hi: number }, height: number): (value: number) => number {
  const span = scale.hi - scale.lo || 1
  return (value) => height - ((value - scale.lo) / span) * height
}

/** Posición x del centro del intervalo `index` de `count` en un lienzo de ancho `width`. */
export const slotX = (index: number, count: number, width: number): number => ((index + 0.5) * width) / count

/** Tramos continuos (índices) sin huecos. */
export function runs(values: ReadonlyArray<number | null>): number[][] {
  const result: number[][] = []
  let current: number[] = []
  values.forEach((value, index) => {
    if (value === null) {
      if (current.length) result.push(current)
      current = []
    } else current.push(index)
  })
  if (current.length) result.push(current)
  return result
}

const fixed = (value: number) => value.toFixed(1)

/**
 * Curva monótona (Fritsch–Carlson, como `d3.curveMonotoneX`) desde el primer punto: pasa exactamente por cada
 * punto y no rebasa los valores reales entre dos lecturas. Devuelve los segmentos después del `M` inicial.
 */
export function monotoneSegments(points: readonly Point[]): string {
  const k = points.length
  if (k < 2) return ''
  const p = (i: number) => points[i] as Point
  if (k === 2) return `L${fixed(p(1).x)} ${fixed(p(1).y)}`
  const slopes: number[] = []
  for (let i = 0; i < k - 1; i++) slopes.push((p(i + 1).y - p(i).y) / (p(i + 1).x - p(i).x))
  const tangents = [slopes[0] as number]
  for (let i = 1; i < k - 1; i++) {
    const before = slopes[i - 1] as number
    const after = slopes[i] as number
    if (before * after <= 0) tangents.push(0)
    else {
      const h0 = p(i).x - p(i - 1).x
      const h1 = p(i + 1).x - p(i).x
      const weighted = (before * h1 + after * h0) / (h0 + h1)
      tangents.push(Math.sign(after) * Math.min(Math.abs(before), Math.abs(after), 0.5 * Math.abs(weighted)) * 2)
    }
  }
  tangents.push(slopes[k - 2] as number)
  let d = ''
  for (let i = 0; i < k - 1; i++) {
    const a = p(i)
    const b = p(i + 1)
    const h = (b.x - a.x) / 3
    d += `C${fixed(a.x + h)} ${fixed(a.y + (tangents[i] as number) * h)} ${fixed(b.x - h)} ${fixed(b.y - (tangents[i + 1] as number) * h)} ${fixed(b.x)} ${fixed(b.y)}`
  }
  return d
}

const pointsOf = (indices: readonly number[], values: ReadonlyArray<number | null>, y: (v: number) => number, width: number): Point[] =>
  indices.map((i) => ({ x: slotX(i, values.length, width), y: y(values[i] as number) }))

/** Línea de una serie, cortada en los huecos. Un tramo de un solo punto se dibuja como un punto. */
export function linePath(values: ReadonlyArray<number | null>, y: (v: number) => number, width: number): string {
  return runs(values)
    .map((indices) => {
      const points = pointsOf(indices, values, y, width)
      const first = points[0] as Point
      return `M${fixed(first.x)} ${fixed(first.y)}${points.length === 1 ? 'h0.1' : monotoneSegments(points)}`
    })
    .join('')
}

/** Franja entre mínimos y máximos, cortada en los huecos. */
export function bandPath(lows: ReadonlyArray<number | null>, highs: ReadonlyArray<number | null>, y: (v: number) => number, width: number): string {
  return runs(lows.map((low, i) => (low === null || highs[i] === null ? null : low)))
    .map((indices) => {
      const top = pointsOf(indices, highs, y, width)
      const bottom = pointsOf([...indices].reverse(), lows, y, width)
      const a = top[0] as Point
      const b = bottom[0] as Point
      return `M${fixed(a.x)} ${fixed(a.y)}${monotoneSegments(top)}L${fixed(b.x)} ${fixed(b.y)}${monotoneSegments(bottom)}Z`
    })
    .join('')
}

/** Área bajo una serie sin huecos (lluvia acumulada) hasta la línea base `height`. */
export function areaPath(values: readonly number[], y: (v: number) => number, width: number, height: number): string {
  if (values.length === 0) return ''
  const line = linePath(values, y, width)
  return `${line}L${fixed(slotX(values.length - 1, values.length, width))} ${height}L${fixed(slotX(0, values.length, width))} ${height}Z`
}

/** Barras de cada intervalo con valor > 0, desde la base `height`. Más delgadas cuando hay muchas. */
export function barsPath(values: ReadonlyArray<number | null>, y: (v: number) => number, width: number, height: number): string {
  const n = values.length
  const barWidth = Math.max(0.6, (width / n) * (n > 200 ? 0.8 : 0.66))
  return values
    .map((value, i) => {
      if (!value) return ''
      const center = slotX(i, n, width)
      return `M${fixed(center - barWidth / 2)} ${height}V${fixed(y(value))}H${fixed(center + barWidth / 2)}V${height}Z`
    })
    .join('')
}

/** Índices de hasta `count` marcas del eje x repartidas de punta a punta. */
export function xTickIndices(length: number, count = 6): number[] {
  if (length === 0) return []
  const n = Math.min(count, length)
  if (n === 1) return [0]
  return Array.from({ length: n }, (_, k) => Math.round((k * (length - 1)) / (n - 1)))
}

/** Rosa de los vientos del diseño: lienzo de 240 × 240, centro (120, 120), radio interior 14 y exterior 104. */
export const ROSE = { center: 120, inner: 14, outer: 104 } as const

export interface RoseGeometry {
  /** Un path por banda de velocidad (lenta, media, rápida), con las 16 cuñas de esa banda. */
  readonly wedges: readonly [string, string, string]
  /** Anillos (mitad y exterior) y cruz de los ejes. */
  readonly grid: string
}

export function roseGeometry(rose: WindRose): RoseGeometry {
  const { center: c, inner, outer } = ROSE
  const scale = rose.maxPercent || 1
  const radius = (percent: number) => inner + (percent / scale) * (outer - inner)
  const point = (r: number, angle: number) => `${fixed(c + r * Math.sin(angle))} ${fixed(c - r * Math.cos(angle))}`
  const wedges = [0, 1, 2].map((bin) =>
    rose.directions
      .map(({ percentBySpeed }, i) => {
        const below = percentBySpeed.slice(0, bin).reduce((a, b) => a + b, 0)
        const current = percentBySpeed[bin] as number
        if (current <= 0) return ''
        const ra = radius(below)
        const rb = radius(below + current)
        const angle = (i * Math.PI) / 8
        const a0 = angle - Math.PI / 20
        const a1 = angle + Math.PI / 20
        return `M${point(ra, a0)}L${point(rb, a0)}A${fixed(rb)} ${fixed(rb)} 0 0 1 ${point(rb, a1)}L${point(ra, a1)}A${fixed(ra)} ${fixed(ra)} 0 0 0 ${point(ra, a0)}Z`
      })
      .join(''),
  ) as [string, string, string]
  const ring = (r: number) => `M${fixed(c - r)} ${c}a${fixed(r)} ${fixed(r)} 0 1 0 ${fixed(2 * r)} 0a${fixed(r)} ${fixed(r)} 0 1 0 ${fixed(-2 * r)} 0`
  const grid = `${ring(radius(scale / 2))}${ring(outer)}M${c} ${c - outer}V${c + outer}M${c - outer} ${c}H${c + outer}`
  return { wedges, grid }
}
