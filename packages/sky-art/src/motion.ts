// Animaciones del diseño como datos, para plataformas sin CSS (React Native con reanimated). Es la transcripción
// de los `@keyframes` de `styles.generated.ts` (escenas) y de `STATION_ILLUSTRATION_CSS` (pantalla de carga);
// `test/motion.test.ts` comprueba que duraciones y retrasos coincidan con esas hojas.
//
// Diferencias aceptadas con CSS (ADR-0010): un retraso positivo se toma como desfase de fase (en CSS el elemento
// espera quieto la primera vez) y `transform-box: fill-box` usa el centro aproximado de la figura.
//
// `sampleMotion` y `motionMatrix` llevan la directiva 'worklet': reanimated las ejecuta en el hilo de UI.

import { type SvgElement, approximateCenter } from './svg-tree'

export type MotionProperty = 'translateX' | 'translateY' | 'rotate' | 'scaleX' | 'scaleY' | 'opacity' | 'strokeDashoffset'
/** Pares [desfase 0–1, valor] de una propiedad; como en CSS, cada propiedad interpola solo entre sus fotogramas. */
export type MotionTrack = ReadonlyArray<readonly [number, number]>
export type MotionEasing = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
export type MotionDirection = 'normal' | 'alternate' | 'alternate-reverse'

export interface MotionSpec {
  readonly tracks: Readonly<Partial<Record<MotionProperty, MotionTrack>>>
  readonly durationMs: number
  readonly easing: MotionEasing
  readonly direction: MotionDirection
  /** Retraso de CSS (negativo = empieza adelantada). */
  readonly delayMs: number
  /** Punto fijo de giros y escalas, en coordenadas del SVG. */
  readonly origin: { readonly x: number; readonly y: number }
  readonly strokeDasharray?: string
}

export type MotionSample = Readonly<Record<MotionProperty, number>>

// ── Fotogramas (copiados de los @keyframes del diseño) ─────────────────────────────────────────────────────

const t = (...pairs: Array<readonly [number, number]>): MotionTrack => pairs

const SKY_KEYFRAMES = {
  drift: { translateX: t([0, -16], [1, 16]) },
  inbound: { translateX: t([0, -260], [0.7, 0], [1, 0]), opacity: t([0, 0], [0.25, 1], [0.7, 1], [1, 1]) },
  outbound: { translateX: t([0, 0], [0.2, 0], [1, 320]), opacity: t([0, 1], [0.2, 1], [1, 0]) },
  streak: { strokeDashoffset: t([0, 220], [1, -220]), opacity: t([0, 0], [0.2, 0.85], [0.8, 0.85], [1, 0]) },
  spin: { rotate: t([0, 0], [1, 360]) },
  twinkle: { opacity: t([0, 0.3], [0.5, 1], [1, 0.3]) },
  glow: { opacity: t([0, 0.35], [0.5, 0.7], [1, 0.35]) },
  scan: { translateX: t([0, -200], [1, 800]) },
  blink: { opacity: t([0, 0.4], [0.5, 1], [1, 0.4]) },
  shimmer: { translateY: t([0, 0], [1, -40]), opacity: t([0, 0], [0.3, 0.7], [1, 0]) },
  fogband: { translateX: t([0, -60], [1, 60]) },
  rise: { translateY: t([0, 26], [1, 0]) },
  vaneturn: { rotate: t([0, 0], [0.15, 0], [0.55, -135], [1, -135]) },
  virga: { strokeDashoffset: t([0, 0], [1, -30]), opacity: t([0, 0], [0.3, 0.6], [1, 0]) },
  sigoff: { opacity: t([0, 0.15], [0.5, 0.55], [1, 0.15]) },
} as const

const fallKeyframes = (dx: number) => ({
  translateX: t([0, 0], [1, dx]),
  translateY: t([0, -16], [1, 34]),
  opacity: t([0, 0], [0.2, 1], [1, 0]),
})

// El anemómetro: cada copa recorre una elipse (desplazamiento + escala) y cada brazo se acorta en perspectiva.
const CUP_STEPS = [
  [48, 1], [41.6, 1.09], [24, 1.156], [0, 1.18], [-24, 1.156], [-41.6, 1.09], [-48, 1],
  [-41.6, 0.91], [-24, 0.844], [0, 0.82], [24, 0.844], [41.6, 0.91], [48, 1],
] as const
const ARM_STEPS = [1, 0.866, 0.5, 0.02, -0.5, -0.866, -1, -0.866, -0.5, 0.02, 0.5, 0.866, 1] as const
const at = (index: number) => Math.round((index / 12) * 10_000) / 10_000

const STATION_KEYFRAMES = {
  cup: {
    translateX: CUP_STEPS.map(([x], i) => [at(i), x] as const),
    scaleX: CUP_STEPS.map(([, s], i) => [at(i), s] as const),
    scaleY: CUP_STEPS.map(([, s], i) => [at(i), s] as const),
  },
  arm: { scaleX: ARM_STEPS.map((s, i) => [at(i), s] as const) },
  vane: { scaleX: t([0, 1], [0.35, 0.55], [0.6, 0.9], [0.8, 0.7], [1, 1]) },
  wave: { scaleX: t([0, 1], [1, 5]), scaleY: t([0, 1], [1, 5]), opacity: t([0, 0.75], [1, 0]) },
  drop: { translateY: t([0, 0], [1, 72]), opacity: t([0, 0], [0.15, 0.9], [0.85, 0.9], [1, 0]) },
  splash: {
    scaleX: t([0, 0.2], [0.8, 0.2], [1, 1.4]),
    scaleY: t([0, 0.2], [0.8, 0.2], [1, 1.4]),
    opacity: t([0, 0], [0.8, 0], [0.9, 0.8], [1, 0]),
  },
  bob: { translateY: t([0, 0], [0.5, -6], [1, 0]) },
  drift: { translateX: t([0, -30], [1, 30]) },
} as const

// ── Reglas: qué animación lleva cada elemento (equivalente a los selectores CSS) ──────────────────────────

export interface MotionContext {
  /** Elemento padre (para reglas como `.sky-rain path`). */
  readonly parent?: SvgElement
  /** Posición del elemento entre los hermanos, desde 1 (para `:nth-child`). */
  readonly index: number
  /** Clases del `<svg>` raíz (`sky-windy`). */
  readonly rootClasses?: readonly string[]
  /** Duración de una vuelta del anemómetro (`--spin` de la pantalla de carga). */
  readonly spinMs?: number
}

const NO_ORIGIN = { x: 0, y: 0 }
const DEFAULT_SPIN_MS = 1100

const spec = (
  tracks: MotionSpec['tracks'],
  durationMs: number,
  easing: MotionEasing,
  extra: Partial<Omit<MotionSpec, 'tracks' | 'durationMs' | 'easing'>> = {},
): MotionSpec => ({ tracks, durationMs, easing, direction: 'normal', delayMs: 0, origin: NO_ORIGIN, ...extra })

/** Animación de un elemento del arte, o `null` si es estático. */
export function resolveMotion(element: SvgElement, context: MotionContext): MotionSpec | null {
  return ownMotion(element, context) ?? childMotion(element, context)
}

/** Clases con animación propia; sirven para verificar que el arte no use una clase sin transcribir. */
export const ANIMATED_CLASSES = [
  'sky-drift', 'sky-drift2', 'sky-inbound', 'sky-outbound', 'sky-rays', 'sky-bow', 'sky-scan', 'sky-blink',
  'sky-fog1', 'sky-fog2', 'sky-rise', 'sky-vaneturn', 'sky-sigoff',
  'wx-load-cup', 'wx-load-arm', 'wx-load-vane', 'wx-load-wave', 'wx-load-drop', 'wx-load-splash', 'wx-load-bob',
  'wx-load-drift', 'wx-load-drift2',
] as const

/** Clases cuyos hijos se animan (`.sky-rain path`, `.sky-stars circle`…). */
export const ANIMATED_PARENT_CLASSES = ['sky-rain', 'sky-streak', 'sky-stars', 'sky-shimmer', 'sky-virga'] as const

function ownMotion(element: SvgElement, context: MotionContext): MotionSpec | null {
  const has = (name: string) => element.classes.includes(name)
  const windy = context.rootClasses?.includes('sky-windy') ?? false
  const origin = originOf(element)
  const spin = context.spinMs ?? DEFAULT_SPIN_MS
  const anemometerDelay = has('wx-load-k2') ? -0.3333 * spin : has('wx-load-k3') ? -0.6667 * spin : 0
  const delayByClass = (delays: Record<string, number>) =>
    Object.entries(delays).find(([name]) => has(name))?.[1] ?? 0

  if (has('sky-drift')) return spec(SKY_KEYFRAMES.drift, windy ? 5000 : 16_000, 'ease-in-out', { direction: 'alternate' })
  if (has('sky-drift2')) return spec(SKY_KEYFRAMES.drift, windy ? 7000 : 23_000, 'ease-in-out', { direction: 'alternate-reverse' })
  if (has('sky-inbound')) return spec(SKY_KEYFRAMES.inbound, 11_000, 'ease-out')
  if (has('sky-outbound')) return spec(SKY_KEYFRAMES.outbound, 11_000, 'ease-in')
  if (has('sky-rays')) return spec(SKY_KEYFRAMES.spin, 40_000, 'linear', { origin })
  if (has('sky-bow')) return spec(SKY_KEYFRAMES.glow, 6000, 'ease-in-out')
  if (has('sky-scan')) return spec(SKY_KEYFRAMES.scan, 2800, 'ease-in-out')
  if (has('sky-blink')) return spec(SKY_KEYFRAMES.blink, 1400, 'ease-in-out')
  if (has('sky-fog1')) return spec(SKY_KEYFRAMES.fogband, 14_000, 'ease-in-out', { direction: 'alternate' })
  if (has('sky-fog2')) return spec(SKY_KEYFRAMES.fogband, 19_000, 'ease-in-out', { direction: 'alternate-reverse' })
  if (has('sky-rise')) return spec(SKY_KEYFRAMES.rise, 9000, 'ease-out', { direction: 'alternate' })
  if (has('sky-vaneturn')) return spec(SKY_KEYFRAMES.vaneturn, 6000, 'ease-in-out', { direction: 'alternate', origin })
  if (has('sky-sigoff')) return spec(SKY_KEYFRAMES.sigoff, 2000, 'ease-in-out')

  const anemometer = { x: 246, y: 96 }
  if (has('wx-load-cup')) return spec(STATION_KEYFRAMES.cup, spin, 'linear', { origin: anemometer, delayMs: anemometerDelay })
  if (has('wx-load-arm')) return spec(STATION_KEYFRAMES.arm, spin, 'linear', { origin: anemometer, delayMs: anemometerDelay })
  if (has('wx-load-vane')) return spec(STATION_KEYFRAMES.vane, 5000, 'ease-in-out', { origin: { x: 125, y: 296 } })
  if (has('wx-load-wave')) {
    return spec(STATION_KEYFRAMES.wave, 2400, 'ease-out', { origin: { x: 64.5, y: 104 }, delayMs: delayByClass({ 'wx-load-w2': 800, 'wx-load-w3': 1600 }) })
  }
  if (has('wx-load-drop')) return spec(STATION_KEYFRAMES.drop, 1600, 'ease-in', { delayMs: delayByClass({ 'wx-load-dr2': 550, 'wx-load-dr3': 1100 }) })
  if (has('wx-load-splash')) {
    return spec(STATION_KEYFRAMES.splash, 1600, 'ease-out', { origin: approximateCenter(element), delayMs: delayByClass({ 'wx-load-sp2': 550, 'wx-load-sp3': 1100 }) })
  }
  if (has('wx-load-bob')) return spec(STATION_KEYFRAMES.bob, 6000, 'ease-in-out')
  if (has('wx-load-drift')) return spec(STATION_KEYFRAMES.drift, 18_000, 'ease-in-out', { direction: 'alternate' })
  if (has('wx-load-drift2')) return spec(STATION_KEYFRAMES.drift, 26_000, 'ease-in-out', { direction: 'alternate-reverse' })
  return null
}

function childMotion(element: SvgElement, { parent, index }: MotionContext): MotionSpec | null {
  if (!parent) return null
  const inParent = (name: string, tag: string) => parent.classes.includes(name) && element.tag === tag
  // Varias reglas `:nth-child(kn)` pueden aplicar a la vez; como en CSS, gana la última de la hoja.
  const lastMatching = (delays: Array<readonly [number, number]>) =>
    delays.reduce((delay, [every, value]) => (index % every === 0 ? value : delay), 0)

  if (inParent('sky-rain', 'path')) {
    const durationMs = seconds(parent.style['--rs'], 1.1) * 1000
    const dx = Number.parseFloat(parent.style['--dx'] ?? '0')
    const delayMs = lastMatching([[2, -0.35 * durationMs], [3, -0.7 * durationMs], [5, -0.15 * durationMs]])
    return spec(fallKeyframes(dx), durationMs, 'linear', { delayMs })
  }
  if (inParent('sky-streak', 'path')) {
    const delayMs = index === 2 ? 900 : index === 3 ? 1700 : 0
    return spec(SKY_KEYFRAMES.streak, 2600, 'ease-in-out', { delayMs, strokeDasharray: '90 220' })
  }
  if (inParent('sky-stars', 'circle')) return spec(SKY_KEYFRAMES.twinkle, 3000, 'ease-in-out', { delayMs: lastMatching([[2, 1300], [3, 600]]) })
  if (inParent('sky-shimmer', 'path')) {
    return spec(SKY_KEYFRAMES.shimmer, 3200, 'ease-out', { delayMs: index === 2 ? 1100 : index === 3 ? 2100 : 0 })
  }
  if (inParent('sky-virga', 'path')) return spec(SKY_KEYFRAMES.virga, 2400, 'linear', { delayMs: lastMatching([[2, 800]]), strokeDasharray: '4 6' })
  return null
}

function originOf(element: SvgElement): { x: number; y: number } {
  if (element.style['transform-box'] === 'fill-box') return approximateCenter(element)
  const [x = 0, y = 0] = (element.style['transform-origin'] ?? '').split(/\s+/).map((part) => Number.parseFloat(part) || 0)
  return { x, y }
}

function seconds(value: string | undefined, fallback: number): number {
  const parsed = Number.parseFloat(value ?? '')
  return Number.isFinite(parsed) ? parsed : fallback
}

// ── Muestreo (hilo de UI) ──────────────────────────────────────────────────────────────────────────────────

const BASE_SAMPLE: MotionSample = { translateX: 0, translateY: 0, rotate: 0, scaleX: 1, scaleY: 1, opacity: 1, strokeDashoffset: 0 }

/** Valores de la animación `elapsedMs` después de empezar (con su retraso, dirección y curvas). */
export function sampleMotion(motion: MotionSpec, elapsedMs: number): MotionSample {
  'worklet'
  const cycles = (elapsedMs - motion.delayMs) / motion.durationMs
  const iteration = Math.floor(cycles)
  let progress = cycles - iteration
  const odd = Math.abs(iteration) % 2 === 1
  if ((motion.direction === 'alternate' && odd) || (motion.direction === 'alternate-reverse' && !odd)) progress = 1 - progress

  const sample: Record<string, number> = { ...BASE_SAMPLE }
  const tracks = motion.tracks as Record<string, MotionTrack | undefined>
  for (const property in tracks) {
    const track = tracks[property]
    if (!track || track.length === 0) continue
    sample[property] = sampleTrack(track, progress, motion.easing)
  }
  return sample as MotionSample
}

function sampleTrack(track: MotionTrack, progress: number, easing: MotionEasing): number {
  'worklet'
  const first = track[0] as readonly [number, number]
  if (progress <= first[0]) return first[1]
  for (let i = 1; i < track.length; i++) {
    const to = track[i] as readonly [number, number]
    if (progress <= to[0]) {
      const from = track[i - 1] as readonly [number, number]
      const span = to[0] - from[0]
      const local = span === 0 ? 1 : (progress - from[0]) / span
      return from[1] + (to[1] - from[1]) * ease(easing, local)
    }
  }
  return (track[track.length - 1] as readonly [number, number])[1]
}

// Curvas de CSS (cubic-bezier) resueltas por bisección: suficiente para 60 fps y sin tablas.
function ease(easing: MotionEasing, x: number): number {
  'worklet'
  if (easing === 'linear') return x
  const x1 = easing === 'ease-out' ? 0 : 0.42
  const x2 = easing === 'ease-in' ? 1 : 0.58
  const bezier = (p1: number, p2: number, s: number) => 3 * p1 * s * (1 - s) * (1 - s) + 3 * p2 * s * s * (1 - s) + s * s * s
  let low = 0
  let high = 1
  let s = x
  for (let i = 0; i < 30; i++) {
    s = (low + high) / 2
    if (bezier(x1, x2, s) < x) low = s
    else high = s
  }
  return bezier(0, 1, s)
}

/** Matriz SVG [a b c d e f] de la muestra alrededor de `origin` (traslación, giro y escala, en ese orden). */
export function motionMatrix(sample: MotionSample, origin: { x: number; y: number }): [number, number, number, number, number, number] {
  'worklet'
  const radians = (sample.rotate * Math.PI) / 180
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const a = cos * sample.scaleX
  const b = sin * sample.scaleX
  const c = -sin * sample.scaleY
  const d = cos * sample.scaleY
  const e = origin.x + sample.translateX - (a * origin.x + c * origin.y)
  const f = origin.y + sample.translateY - (b * origin.x + d * origin.y)
  return [a, b, c, d, e, f]
}
