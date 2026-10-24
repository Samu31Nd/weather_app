// Árbol del SVG del diseño para plataformas sin DOM (React Native). El marcado viene de nuestra propia
// extracción (atributos entre comillas dobles, sin comentarios ni CDATA), así que basta un lector pequeño.

export interface SvgElement {
  readonly tag: string
  readonly attrs: Readonly<Record<string, string>>
  /** Propiedades del atributo `style` (`transform-origin`, variables `--rs`/`--dx`…). */
  readonly style: Readonly<Record<string, string>>
  readonly classes: readonly string[]
  readonly children: readonly SvgNode[]
}

export type SvgNode = SvgElement | { readonly text: string }

export const isElement = (node: SvgNode): node is SvgElement => 'tag' in node

const TOKEN = /<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:\s+[\w:-]+="[^"]*")*)\s*(\/?)>|([^<]+)/g
const ATTRIBUTE = /([\w:-]+)="([^"]*)"/g

export function parseSvgFragment(markup: string): SvgNode[] {
  const root: MutableElement = { tag: '#root', attrs: {}, style: {}, classes: [], children: [] }
  const stack: MutableElement[] = [root]
  for (const match of markup.matchAll(TOKEN)) {
    const [, closing, opening, rawAttributes = '', selfClosing, text] = match
    const parent = stack[stack.length - 1] as MutableElement
    if (closing) {
      if (parent.tag !== closing) throw new Error(`SVG mal formado: se esperaba </${parent.tag}> y llegó </${closing}>`)
      stack.pop()
    } else if (opening) {
      const element = createElement(opening, rawAttributes)
      parent.children.push(element)
      if (!selfClosing) stack.push(element)
    } else if (text && text.trim()) {
      parent.children.push({ text: decodeEntities(text.trim()) })
    }
  }
  if (stack.length !== 1) throw new Error(`SVG mal formado: falta cerrar <${stack[stack.length - 1]?.tag}>`)
  return root.children
}

interface MutableElement extends SvgElement {
  readonly children: SvgNode[]
}

function createElement(tag: string, rawAttributes: string): MutableElement {
  const attrs: Record<string, string> = {}
  for (const [, name, value = ''] of rawAttributes.matchAll(ATTRIBUTE)) attrs[name as string] = decodeEntities(value)
  const { style = '', class: className = '', ...rest } = attrs
  return { tag, attrs: rest, style: parseStyle(style), classes: className.split(/\s+/).filter(Boolean), children: [] }
}

function parseStyle(style: string): Record<string, string> {
  const entries = style
    .split(';')
    .map((declaration) => declaration.split(':'))
    .filter((parts): parts is [string, string] => parts.length === 2)
    .map(([name, value]) => [name.trim(), value.trim()])
  return Object.fromEntries(entries)
}

function decodeEntities(value: string): string {
  return value.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
}

/**
 * Centro aproximado de la caja de un elemento (`transform-box: fill-box; transform-origin: center`). Toma
 * círculos, elipses, rectángulos y los puntos finales de los trazos con comandos M/L/H/V (absolutos y
 * relativos), que son los que usan las figuras animadas así en el diseño.
 */
export function approximateCenter(element: SvgElement): { x: number; y: number } {
  const points = collectPoints(element)
  if (points.length === 0) return { x: 0, y: 0 }
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 }
}

function collectPoints(element: SvgElement): Array<{ x: number; y: number }> {
  const n = (name: string) => Number(element.attrs[name] ?? 0)
  switch (element.tag) {
    case 'circle':
      return [{ x: n('cx') - n('r'), y: n('cy') - n('r') }, { x: n('cx') + n('r'), y: n('cy') + n('r') }]
    case 'ellipse':
      return [{ x: n('cx') - n('rx'), y: n('cy') - n('ry') }, { x: n('cx') + n('rx'), y: n('cy') + n('ry') }]
    case 'rect':
      return [{ x: n('x'), y: n('y') }, { x: n('x') + n('width'), y: n('y') + n('height') }]
    case 'path':
      return pathPoints(element.attrs.d ?? '')
    default:
      return element.children.filter(isElement).flatMap(collectPoints)
  }
}

function pathPoints(d: string): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = []
  let x = 0
  let y = 0
  for (const [, command = '', args = ''] of d.matchAll(/([MmLlHhVvZz])([^MmLlHhVvZzCcSsQqTtAa]*)/g)) {
    const values = (args.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number)
    const relative = command === command.toLowerCase()
    const kind = command.toUpperCase()
    if (kind === 'H') for (const v of values) points.push({ x: (x = relative ? x + v : v), y })
    else if (kind === 'V') for (const v of values) points.push({ x, y: (y = relative ? y + v : v) })
    else if (kind === 'M' || kind === 'L') {
      for (let i = 0; i + 1 < values.length; i += 2) {
        x = relative ? x + (values[i] as number) : (values[i] as number)
        y = relative ? y + (values[i + 1] as number) : (values[i + 1] as number)
        points.push({ x, y })
      }
    }
  }
  return points
}
