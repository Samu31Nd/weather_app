// Extrae el arte de las 21 escenas del cielo de los artboards `project/Sky*.dc.html` del canvas de diseño y
// genera `src/scenes.generated.ts` y `src/styles.generated.ts`.
//
// Uso: npm run extract --workspace=@tt/sky-art -- <carpeta con los Sky*.dc.html>
//
// Transformaciones (para poder mostrar varias escenas a la vez sin choques):
// - clases CSS y nombres de keyframes con prefijo `sky-` (`.drift` → `.sky-drift`);
// - `id` y `url(#…)` con prefijo de la escena (`sky_SkyRain` → `rain-sky_SkyRain`);
// - se descarta la etiqueta (chip) del artboard: el texto lo pone @tt/i18n.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const sourceDir = process.argv[2]
if (!sourceDir) {
  console.error('Falta la carpeta con los archivos Sky*.dc.html')
  process.exit(1)
}

const toSceneId = (file) => {
  const name = file.replace(/^Sky/, '').replace(/\.dc\.html$/, '')
  return name.charAt(0).toLowerCase() + name.slice(1)
}

const files = readdirSync(sourceDir).filter((f) => /^Sky.+\.dc\.html$/.test(f)).sort()
const cssRules = new Set()
const keyframes = new Map()
const scenes = {}

for (const file of files) {
  const html = readFileSync(join(sourceDir, file), 'utf8')
  const scene = toSceneId(file)
  const style = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? ''
  collectCss(style)

  const svg = html.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)
  const svgOpen = html.match(/<svg([^>]*)>/)?.[1] ?? ''
  if (!svg) throw new Error(`${file}: no tiene <svg>`)
  const viewBox = svgOpen.match(/viewBox="([^"]+)"/)?.[1]
  const ariaLabel = svgOpen.match(/aria-label="([^"]+)"/)?.[1] ?? ''
  const rootClass = svgOpen.match(/class="([^"]*)"/)?.[1]?.trim() ?? ''

  let body = svg[1].trim()
  body = body.replace(/class="([^"]*)"/g, (_, classes) => `class="${prefixClasses(classes)}"`)
  const ids = [...body.matchAll(/id="([^"]+)"/g)].map((m) => m[1])
  for (const id of ids) {
    body = body.replaceAll(`id="${id}"`, `id="${scene}-${id}"`).replaceAll(`url(#${id})`, `url(#${scene}-${id})`)
  }
  scenes[scene] = { viewBox, rootClass: prefixClasses(rootClass), descriptionEs: ariaLabel, body }
}

function prefixClasses(classes) {
  return classes.split(/\s+/).filter(Boolean).map((c) => `sky-${c}`).join(' ')
}

function collectCss(css) {
  const withoutBody = css.replace(/body\{margin:0\}/g, '')
  for (const match of withoutBody.matchAll(/@keyframes\s+([\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g)) {
    keyframes.set(match[1], `@keyframes sky-${match[1]}{${match[2]}}`)
  }
  const rest = withoutBody.replace(/@keyframes\s+[\w-]+\s*\{(?:[^{}]*\{[^{}]*\})*\s*\}/g, '')
  for (const media of rest.matchAll(/@media([^{]+)\{((?:[^{}]*\{[^{}]*\})*)\}/g)) {
    cssRules.add(`@media${media[1]}{${transformRules(media[2])}}`)
  }
  const plain = rest.replace(/@media[^{]+\{(?:[^{}]*\{[^{}]*\})*\}/g, '')
  cssRules.add(transformRules(plain))
}

function transformRules(css) {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map(([, selector, declarations]) => {
      const scopedSelector = selector.trim().replace(/\.([a-zA-Z][\w-]*)/g, '.sky-$1')
      const scopedDeclarations = declarations.replace(/(animation(?:-name)?\s*:\s*)([\w-]+)/g, (_, prop, name) =>
        name === 'none' ? `${prop}${name}` : `${prop}sky-${name}`,
      )
      return `${scopedSelector}{${scopedDeclarations}}`
    })
    .join('\n')
}

const header = '// Generado por scripts/extract-from-design.mjs a partir del canvas de diseño. No editar a mano.\n'
const css = [...keyframes.values(), ...[...cssRules].filter(Boolean)].join('\n')
writeFileSync(
  new URL('../src/styles.generated.ts', import.meta.url),
  `${header}\nexport const SKY_SCENE_CSS = ${JSON.stringify(css)}\n`,
)
writeFileSync(
  new URL('../src/scenes.generated.ts', import.meta.url),
  `${header}\nimport type { SkyScene } from '@tt/core'\nimport type { SkySceneArt } from './types'\n\n` +
    `export const SKY_SCENE_ART: Readonly<Record<SkyScene, SkySceneArt>> = ${JSON.stringify(scenes, null, 2)}\n`,
)
console.log(`Escenas: ${Object.keys(scenes).length}; reglas CSS: ${css.split('\n').length}`)
