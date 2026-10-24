// Geometría de los indicadores de "Ahora" (artboards `Dashboard` y `MobileNow`): arco del sol, medidor de
// presión de 270° y anillo de humedad. Funciones puras que devuelven coordenadas y `d` de paths SVG; la web
// las dibuja con <svg> y la móvil con react-native-svg.

export interface Point {
  readonly x: number
  readonly y: number
}

const round1 = (value: number) => Math.round(value * 10) / 10
const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

/** Arco del sol en el lienzo de 320 × 96 del diseño: de (20, 88) a (300, 88), con altura máxima 72. */
export const SUN_ARC = { left: 20, width: 280, baseline: 88, height: 72, segments: 40 } as const

export function sunArcPoint(progress: number): Point {
  const k = clamp01(progress)
  return { x: round1(SUN_ARC.left + SUN_ARC.width * k), y: round1(SUN_ARC.baseline - SUN_ARC.height * Math.sin(Math.PI * k)) }
}

/** Path del arco desde el amanecer hasta `progress` (1 = el arco completo). */
export function sunArcPath(progress: number): string {
  const end = clamp01(progress)
  return Array.from({ length: SUN_ARC.segments + 1 }, (_, i) => {
    const { x, y } = sunArcPoint((end * i) / SUN_ARC.segments)
    return `${i === 0 ? 'M' : 'L'}${x} ${y}`
  }).join('')
}

/** Medidor de presión de 270° (de −135° a +135°) con centro (75, 72) y radio 60 del diseño. */
export const PRESSURE_GAUGE = { cx: 75, cy: 72, r: 60, sweepDeg: 270, startDeg: -135 } as const

/** Ángulo de la aguja en grados para una fracción 0–1 del medidor. */
export function gaugeAngle(fraction: number): number {
  return round1(PRESSURE_GAUGE.startDeg + PRESSURE_GAUGE.sweepDeg * clamp01(fraction))
}

export function gaugePoint(fraction: number): Point {
  const radians = (gaugeAngle(fraction) * Math.PI) / 180
  return { x: round1(PRESSURE_GAUGE.cx + PRESSURE_GAUGE.r * Math.sin(radians)), y: round1(PRESSURE_GAUGE.cy - PRESSURE_GAUGE.r * Math.cos(radians)) }
}

/** Arco del medidor entre dos fracciones (p. ej. el rango de hoy). */
export function gaugeArcPath(from: number, to: number): string {
  const start = gaugePoint(from)
  const end = gaugePoint(to)
  const largeArc = (clamp01(to) - clamp01(from)) * PRESSURE_GAUGE.sweepDeg > 180 ? 1 : 0
  return `M${start.x} ${start.y}A${PRESSURE_GAUGE.r} ${PRESSURE_GAUGE.r} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

/** `stroke-dasharray` de un anillo de radio `r` lleno al `percent` %. */
export function ringDashArray(percent: number, r = 34): string {
  return `${round1(2 * Math.PI * r * clamp01(percent / 100))} 999`
}
