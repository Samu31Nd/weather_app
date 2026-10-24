/**
 * Animaciones del arte como datos (para React Native) y lector del SVG.
 * Verifica que el lector entienda todo el arte extraído, que cada clase animada tenga su transcripción y que
 * duraciones, retrasos y fotogramas coincidan con las hojas CSS del diseño, que siguen siendo la fuente.
 * Fuente: `@keyframes` de los artboards Sky* y LoadingWeb/LoadingMobile; ADR-0010.
 * Requerimientos: RF-APP-03, RF-APP-02, RNF-APP-05.
 */
import { describe, expect, it } from 'vitest'
import {
  ANIMATED_CLASSES, ANIMATED_PARENT_CLASSES, type MotionSpec, SKY_SCENE_ART, SKY_SCENE_CSS, STATION_ILLUSTRATION_CSS,
  STATION_ILLUSTRATION_SVG, type SvgElement, type SvgNode, approximateCenter, isElement, motionMatrix,
  parseSvgFragment, resolveMotion, sampleMotion,
} from '../src'

const ARTWORKS = [
  ...Object.entries(SKY_SCENE_ART).map(([scene, art]) => ({ name: scene, body: art.body, rootClasses: art.rootClass.split(' ') })),
  { name: 'estación (carga)', body: STATION_ILLUSTRATION_SVG, rootClasses: [] },
]
const CSS = SKY_SCENE_CSS + STATION_ILLUSTRATION_CSS
const MODIFIER_CLASSES = ['sky-windy', 'wx-load-k2', 'wx-load-k3', 'wx-load-w2', 'wx-load-w3', 'wx-load-dr2', 'wx-load-dr3', 'wx-load-sp2', 'wx-load-sp3']

interface Visit { element: SvgElement; parent?: SvgElement; index: number }

function visit(nodes: readonly SvgNode[], parent?: SvgElement): Visit[] {
  const elements = nodes.filter(isElement)
  return elements.flatMap((element, i) => [{ element, parent, index: i + 1 }, ...visit(element.children, element)])
}

const element = (markup: string) => parseSvgFragment(markup)[0] as SvgElement

describe('lector del SVG', () => {
  it.each(ARTWORKS)('lee completo el arte de $name', ({ body }) => {
    const elements = visit(parseSvgFragment(body))
    expect(elements.length).toBe((body.match(/<[a-zA-Z]/g) ?? []).length)
  })

  it('separa clases, estilo y atributos', () => {
    const g = element('<g class="sky-rain extra" style="--rs: 0.7s; --dx: -20px" stroke="#fff"><path d="M0 0"></path></g>')
    expect(g.classes).toEqual(['sky-rain', 'extra'])
    expect(g.style).toEqual({ '--rs': '0.7s', '--dx': '-20px' })
    expect(g.attrs).toEqual({ stroke: '#fff' })
    expect(g.children).toHaveLength(1)
  })

  it('conserva el texto de los elementos <text>', () => {
    expect(element('<text x="0">N</text>').children).toEqual([{ text: 'N' }])
  })

  it('rechaza marcado mal cerrado', () => {
    expect(() => parseSvgFragment('<g><path></g>')).toThrow(/mal formado/)
  })

  it('calcula el centro de figuras dibujadas alrededor de su origen (veleta) y de elipses', () => {
    const vane = element('<g><path d="M0 22V-14"></path><path d="M0 -22l7 10h-14z"></path><path d="M-6 22h12l-6-8z"></path></g>')
    expect(approximateCenter(vane)).toEqual({ x: 0, y: 0 })
    expect(approximateCenter(element('<ellipse cx="140" cy="112" rx="7" ry="2"></ellipse>'))).toEqual({ x: 140, y: 112 })
  })
})

describe('cobertura de las animaciones', () => {
  it.each(ARTWORKS)('$name solo usa clases transcritas', ({ body }) => {
    const known = new Set<string>([...ANIMATED_CLASSES, ...ANIMATED_PARENT_CLASSES, ...MODIFIER_CLASSES])
    for (const { element: el } of visit(parseSvgFragment(body))) {
      for (const name of el.classes) expect(known.has(name), name).toBe(true)
    }
  })

  it.each(ARTWORKS)('$name: todo elemento animado tiene su animación y no trae `transform` propio', ({ body, rootClasses }) => {
    for (const { element: el, parent, index } of visit(parseSvgFragment(body))) {
      const animatedSelf = el.classes.some((name) => (ANIMATED_CLASSES as readonly string[]).includes(name))
      const animatedChild = parent?.classes.some((name) => (ANIMATED_PARENT_CLASSES as readonly string[]).includes(name)) && el.tag !== 'g'
      const motion = resolveMotion(el, { parent, index, rootClasses })
      if (animatedSelf || animatedChild) {
        expect(motion, `${el.tag}.${el.classes.join('.')}`).not.toBeNull()
        // El renderizador móvil pone la matriz animada en el propio elemento: no debe pisar un transform.
        expect(el.attrs.transform).toBeUndefined()
      } else {
        expect(motion).toBeNull()
      }
    }
  })
})

describe('coinciden con las hojas CSS del diseño', () => {
  const OWN_CLASS_DURATIONS: Array<[string, string]> = [
    ['sky-drift', 'sky-drift'], ['sky-drift2', 'sky-drift'], ['sky-inbound', 'sky-inbound'], ['sky-outbound', 'sky-outbound'],
    ['sky-rays', 'sky-spin'], ['sky-bow', 'sky-glow'], ['sky-scan', 'sky-scan'], ['sky-blink', 'sky-blink'],
    ['sky-fog1', 'sky-fogband'], ['sky-fog2', 'sky-fogband'], ['sky-rise', 'sky-rise'], ['sky-vaneturn', 'sky-vaneturn'],
    ['sky-sigoff', 'sky-sigoff'], ['wx-load-vane', 'wx-load-vane'], ['wx-load-wave', 'wx-load-wave'], ['wx-load-drop', 'wx-load-drop'],
    ['wx-load-splash', 'wx-load-splash'], ['wx-load-bob', 'wx-load-bob'], ['wx-load-drift', 'wx-load-drift'], ['wx-load-drift2', 'wx-load-drift'],
  ]

  it.each(OWN_CLASS_DURATIONS)('.%s dura lo mismo que en CSS y usa su curva y dirección', (className, keyframes) => {
    const rule = CSS.match(new RegExp(`\\.${className}\\{animation:${keyframes} ([\\d.]+)s ([a-z-]+) infinite(?: ([a-z-]+))?`))
    expect(rule, className).not.toBeNull()
    const [, seconds, easing, direction = 'normal'] = rule as RegExpMatchArray
    const motion = resolveMotion(element(`<g class="${className}"></g>`), { index: 1 }) as MotionSpec
    expect(motion.durationMs).toBe(Number(seconds) * 1000)
    expect(motion.easing).toBe(easing)
    expect(motion.direction).toBe(direction)
  })

  it('las nubes van más rápido en escenas con viento (.sky-windy)', () => {
    expect(CSS).toContain('.sky-windy .sky-drift{animation-duration:5s}')
    expect(resolveMotion(element('<g class="sky-drift"></g>'), { index: 1, rootClasses: ['sky-windy'] })?.durationMs).toBe(5000)
  })

  it('las gotas toman velocidad y desvío del grupo y los retrasos de :nth-child como en la cascada de CSS', () => {
    const rain = element('<g class="sky-rain" style="--rs: 0.7s; --dx: -20px"><path></path></g>')
    const drop = (index: number) => resolveMotion(rain.children[0] as SvgElement, { parent: rain, index }) as MotionSpec
    expect(drop(1).durationMs).toBe(700)
    expect(drop(1).delayMs).toBe(0)
    expect(drop(2).delayMs).toBeCloseTo(-0.35 * 700)
    expect(drop(6).delayMs).toBeCloseTo(-0.7 * 700) // 2n y 3n: gana 3n, que va después
    expect(drop(10).delayMs).toBeCloseTo(-0.15 * 700) // 2n y 5n: gana 5n
    expect(sampleMotion(drop(1), 700 - 1e-6).translateX).toBeCloseTo(-20)
  })

  it('las copas del anemómetro siguen la vuelta de --spin y van desfasadas un tercio', () => {
    const cup = (className: string) => resolveMotion(element(`<g class="${className}"></g>`), { index: 1, spinMs: 900 }) as MotionSpec
    expect(cup('wx-load-cup').durationMs).toBe(900)
    expect(cup('wx-load-cup wx-load-k2').delayMs).toBeCloseTo(-0.3333 * 900)
    expect(cup('wx-load-arm wx-load-k3').delayMs).toBeCloseTo(-0.6667 * 900)
    expect(cup('wx-load-cup').origin).toEqual({ x: 246, y: 96 })
  })

  it('el giro de los rayos usa el transform-origin del elemento', () => {
    const rays = resolveMotion(element('<g class="sky-rays" style="transform-origin: 470px 64px"></g>'), { index: 1 })
    expect(rays?.origin).toEqual({ x: 470, y: 64 })
  })
})

describe('muestreo', () => {
  const drift = resolveMotion(element('<g class="sky-drift"></g>'), { index: 1 }) as MotionSpec
  const inbound = resolveMotion(element('<g class="sky-inbound"></g>'), { index: 1 }) as MotionSpec

  it('empieza en el primer fotograma y en alternate regresa en la vuelta impar', () => {
    expect(sampleMotion(drift, 0).translateX).toBe(-16)
    expect(sampleMotion(drift, 16_000 * 0.999).translateX).toBeCloseTo(16, 0)
    expect(sampleMotion(drift, 16_000 * 1.5).translateX).toBeCloseTo(0)
    expect(sampleMotion(drift, 16_000 * 1.999).translateX).toBeCloseTo(-16, 0)
  })

  it('cada propiedad interpola solo entre sus propios fotogramas', () => {
    const sample = sampleMotion(inbound, 11_000 * 0.25)
    expect(sample.opacity).toBeCloseTo(1)
    expect(sample.translateX).toBeLessThan(0)
    expect(sample.translateX).toBeGreaterThan(-260)
  })

  it('aplica las curvas de CSS (ease-in-out es simétrica; ease-in empieza lento)', () => {
    expect(sampleMotion(drift, 8000).translateX).toBeCloseTo(0, 4)
    const easeIn = { ...drift, easing: 'ease-in' as const, direction: 'normal' as const }
    const halfway = (sampleMotion(easeIn, 8000).translateX + 16) / 32
    expect(halfway).toBeCloseTo(0.3153, 3)
  })

  it('deja en su valor base las propiedades sin pista', () => {
    expect(sampleMotion(drift, 0)).toMatchObject({ opacity: 1, rotate: 0, scaleX: 1, scaleY: 1, translateY: 0 })
  })

  it('arma la matriz alrededor del origen', () => {
    const [a, b, c, d, e, f] = motionMatrix({ translateX: 0, translateY: 0, rotate: 90, scaleX: 1, scaleY: 1, opacity: 1, strokeDashoffset: 0 }, { x: 10, y: 10 })
    const apply = (x: number, y: number) => [a * x + c * y + e, b * x + d * y + f]
    const [x, y] = apply(20, 10)
    expect(x).toBeCloseTo(10)
    expect(y).toBeCloseTo(20)
  })
})
