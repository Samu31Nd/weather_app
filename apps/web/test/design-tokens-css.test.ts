/**
 * Cada token de @tt/tokens tiene su utilidad de Tailwind (`bg-wx-…`, `text-wx-…`) en app/globals.css.
 * Si se agrega un token al paquete y no se mapea aquí, este test lo detecta.
 * Requerimientos: RNF-APP-04 (la UI usa los tokens del diseño).
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { TOKEN_NAMES } from '@tt/tokens'
import { describe, expect, it } from 'vitest'

// Vitest corre desde apps/web (en jsdom, import.meta.url no es una ruta de archivo).
const css = readFileSync(resolve(process.cwd(), 'app/globals.css'), 'utf8')

describe('utilidades de tokens en globals.css', () => {
  it.each([...TOKEN_NAMES])('mapea --%s a --color-wx-%s', (token) => {
    expect(css).toContain(`--color-wx-${token}: var(--${token});`)
  })
})
