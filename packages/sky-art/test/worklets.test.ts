/**
 * Las funciones de muestreo sobreviven a la transformación de reanimated.
 * El plugin de worklets convierte cada función 'worklet' en una constante que captura sus dependencias al
 * definirse; si una función llama a otra definida más abajo, captura `undefined` y la app móvil se cae al abrir
 * ("undefined is not a function" en `sampleMotion`). Aquí se transforma `motion.ts` con el mismo plugin que usa
 * Metro y se ejecuta el resultado.
 * Fuente: bug de la fase 4 (staging móvil no abría); ADR-0010.
 * Requerimientos: RF-APP-02, RF-APP-03.
 */
import { transformFileSync } from '@babel/core'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseSvgFragment, resolveMotion, sampleMotion, type SvgElement } from '../src'

const require = createRequire(import.meta.url)
const source = resolve(process.cwd(), 'src/motion.ts')

function loadTransformedMotion() {
  const { code } = transformFileSync(source, {
    babelrc: false,
    configFile: false,
    presets: [require.resolve('@babel/preset-typescript')],
    plugins: [require.resolve('react-native-worklets/plugin'), require.resolve('@babel/plugin-transform-modules-commonjs')],
  }) as { code: string }
  const module = { exports: {} as Record<string, unknown> }
  const stubRequire = (name: string) => (name === './svg-tree' ? { approximateCenter: () => ({ x: 0, y: 0 }) } : require(name))
  new Function('module', 'exports', 'require', code)(module, module.exports, stubRequire)
  return module.exports as typeof import('../src/motion')
}

describe('muestreo transformado por el plugin de worklets', () => {
  const transformed = loadTransformedMotion()
  const drift = resolveMotion(parseSvgFragment('<g class="sky-drift"></g>')[0] as SvgElement, { index: 1 })

  it('sampleMotion corre y da lo mismo que sin transformar', () => {
    expect(drift).not.toBeNull()
    for (const elapsed of [0, 4000, 8000, 20_000]) {
      expect(transformed.sampleMotion(drift!, elapsed)).toEqual(sampleMotion(drift!, elapsed))
    }
  })

  it('motionMatrix corre después de la transformación', () => {
    const matrix = transformed.motionMatrix(transformed.sampleMotion(drift!, 0), { x: 0, y: 0 })
    expect(matrix[4]).toBeCloseTo(-16)
  })
})
