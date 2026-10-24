// Dibuja el arte del diseño (@tt/sky-art) con react-native-svg y lo anima con reanimated. Las animaciones son las
// mismas que la web hace con CSS, descritas como datos en `resolveMotion` (ADR-0010). Con "reducir movimiento"
// activado en el sistema, el arte queda quieto, como hace `prefers-reduced-motion` en web.

import { type MotionSpec, type SvgElement, type SvgNode, isElement, motionMatrix, parseSvgFragment, resolveMotion, sampleMotion } from '@tt/sky-art'
import type { Palette } from '@tt/tokens'
import { type ComponentType, type ReactNode, useEffect, useMemo } from 'react'
import Animated, { type SharedValue, useAnimatedProps, useFrameCallback, useReducedMotion, useSharedValue } from 'react-native-reanimated'
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg'
import { fontFamily } from '@/theme/fonts'

export interface SvgArtProps {
  readonly markup: string
  readonly viewBox: string
  readonly width: number | `${number}%`
  readonly height: number | `${number}%`
  readonly preserveAspectRatio?: string
  /** Clases del `<svg>` raíz (`sky-windy`). */
  readonly rootClasses?: readonly string[]
  /** Colores para `var(--…)` del arte de la pantalla de carga. */
  readonly palette?: Palette
  /** Duración de una vuelta del anemómetro (pantalla de carga). */
  readonly spinMs?: number
  /** Elementos que deben ocultarse (la lluvia de la ilustración antes de "recibirla"). */
  readonly isHidden?: (element: SvgElement) => boolean
  readonly accessibilityLabel?: string
}

interface RenderContext {
  readonly rootClasses: readonly string[]
  readonly palette?: Palette
  readonly spinMs?: number
  readonly isHidden?: (element: SvgElement) => boolean
  readonly clock: SharedValue<number> | null
}

/** Etiquetas SVG que sabe dibujar; el test verifica que cubran todo el arte del diseño. */
export const SUPPORTED_TAGS = ['g', 'path', 'circle', 'ellipse', 'rect', 'line', 'text', 'defs', 'linearGradient', 'radialGradient', 'stop'] as const

const COMPONENTS: Readonly<Record<string, ComponentType<Record<string, unknown>>>> = {
  g: G, path: Path, circle: Circle, ellipse: Ellipse, rect: Rect, line: Line, text: SvgText, defs: Defs,
  linearGradient: LinearGradient, radialGradient: RadialGradient, stop: Stop,
} as unknown as Record<string, ComponentType<Record<string, unknown>>>

const ANIMATED_COMPONENTS: Readonly<Record<string, ComponentType<Record<string, unknown>>>> = {
  g: Animated.createAnimatedComponent(G),
  path: Animated.createAnimatedComponent(Path),
  circle: Animated.createAnimatedComponent(Circle),
  ellipse: Animated.createAnimatedComponent(Ellipse),
  rect: Animated.createAnimatedComponent(Rect),
} as unknown as Record<string, ComponentType<Record<string, unknown>>>

export function SvgArt({ markup, viewBox, width, height, preserveAspectRatio, rootClasses = [], palette, spinMs, isHidden, accessibilityLabel }: SvgArtProps) {
  const nodes = useMemo(() => parseSvgFragment(markup), [markup])
  const reduceMotion = useReducedMotion()
  const clock = useSharedValue(0)
  const ticker = useFrameCallback((frame) => {
    clock.value = frame.timeSinceFirstFrame
  }, false)
  useEffect(() => ticker.setActive(!reduceMotion), [ticker, reduceMotion])

  const context: RenderContext = { rootClasses, palette, spinMs, isHidden, clock: reduceMotion ? null : clock }
  return (
    <Svg
      width={width}
      height={height}
      viewBox={viewBox}
      preserveAspectRatio={preserveAspectRatio}
      accessible={accessibilityLabel !== undefined}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      {renderChildren(nodes, undefined, context)}
    </Svg>
  )
}

function renderChildren(nodes: readonly SvgNode[], parent: SvgElement | undefined, context: RenderContext): ReactNode[] {
  let index = 0
  return nodes.map((node, position) => {
    if (!isElement(node)) return node.text
    index += 1
    return renderElement(node, { parent, index }, context, position)
  })
}

function renderElement(element: SvgElement, place: { parent?: SvgElement; index: number }, context: RenderContext, key: number): ReactNode {
  const Component = COMPONENTS[element.tag]
  if (!Component) return null
  const props = svgProps(element, context.palette)
  if (context.isHidden?.(element)) props.opacity = 0
  const children = renderChildren(element.children, element, context)
  const motion = resolveMotion(element, { ...place, rootClasses: context.rootClasses, spinMs: context.spinMs })
  const AnimatedComponent = ANIMATED_COMPONENTS[element.tag]

  if (motion && context.clock && AnimatedComponent) {
    return (
      <MovingElement key={key} Component={AnimatedComponent} motion={motion} clock={context.clock} props={props}>
        {children}
      </MovingElement>
    )
  }
  if (motion?.strokeDasharray) props.strokeDasharray = motion.strokeDasharray
  return (
    <Component key={key} {...props}>
      {children}
    </Component>
  )
}

function MovingElement({ Component, motion, clock, props, children }: {
  Component: ComponentType<Record<string, unknown>>
  motion: MotionSpec
  clock: SharedValue<number>
  props: Record<string, unknown>
  children: ReactNode
}) {
  const animatesOpacity = motion.tracks.opacity !== undefined
  const animatesDash = motion.tracks.strokeDashoffset !== undefined
  const hidden = props.opacity === 0
  const animatedProps = useAnimatedProps(() => {
    const sample = sampleMotion(motion, clock.value)
    const next: Record<string, unknown> = { matrix: motionMatrix(sample, motion.origin) }
    if (animatesOpacity && !hidden) next.opacity = sample.opacity
    if (animatesDash) next.strokeDashoffset = sample.strokeDashoffset
    return next
  })
  return (
    <Component {...props} strokeDasharray={motion.strokeDasharray ?? props.strokeDasharray} animatedProps={animatedProps}>
      {children}
    </Component>
  )
}

/** Atributos SVG → props de react-native-svg (camelCase, colores de la paleta y la fuente del diseño). */
function svgProps(element: SvgElement, palette?: Palette): Record<string, unknown> {
  const props: Record<string, unknown> = {}
  for (const [name, raw] of Object.entries(element.attrs)) {
    if (name.startsWith('data-') || name.startsWith('aria-') || name === 'role') continue
    const value = palette ? raw.replace(/var\(--([\w-]+)\)/g, (match, token: string) => palette[token as keyof Palette] ?? match) : raw
    props[camelCase(name)] = value
  }
  if (element.tag === 'text') {
    const bold = Number(element.attrs['font-weight'] ?? 400) >= 600
    props.fontFamily = fontFamily(bold ? 'semibold' : 'regular')
    delete props.fontWeight
  }
  return props
}

const camelCase = (name: string) => name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
