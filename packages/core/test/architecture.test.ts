/**
 * Regla de dependencias de la arquitectura hexagonal: el núcleo es TypeScript puro.
 * Fuente: docs/03-arquitectura.md (regla de dependencias) y ADR-0001.
 * - `src/` solo importa archivos propios (rutas relativas): nada de React, React Native, Next, Expo ni librerías.
 * - El dominio no depende de la aplicación, de los puertos ni de los adaptadores.
 * Requerimientos: RNF-APP-08.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = new URL('../src/', import.meta.url).pathname

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? sourceFiles(join(dir, entry.name)) : entry.name.endsWith('.ts') ? [join(dir, entry.name)] : [],
  )
}

function importsOf(file: string): string[] {
  const source = readFileSync(file, 'utf8')
  return [...source.matchAll(/^\s*(?:import|export)[^'"]*from\s+['"]([^'"]+)['"]/gm)].map((match) => match[1] as string)
}

const files = sourceFiles(SRC).map((file) => ({ path: relative(SRC, file), imports: importsOf(file) }))

describe('regla de dependencias del núcleo', () => {
  it('encuentra los archivos del núcleo', () => {
    expect(files.length).toBeGreaterThan(10)
  })

  it.each(files)('$path solo importa archivos propios', ({ imports }) => {
    expect(imports.filter((specifier) => !specifier.startsWith('.'))).toEqual([])
  })

  it.each(files.filter((f) => f.path.startsWith('domain/')))('$path (dominio) no depende de capas externas', ({ imports }) => {
    expect(imports.filter((specifier) => /\/(application|adapters|ports|container)\b/.test(specifier))).toEqual([])
  })
})
