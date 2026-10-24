/**
 * Arte de las escenas del cielo extraído del canvas de diseño (`project/Sky*.dc.html`).
 * Verifica que la extracción sea completa y segura para mostrar varias escenas a la vez, y que toda animación
 * se apague con `prefers-reduced-motion`.
 * Fuente: canvas "Estación meteorológica" (21 artboards Sky*); scripts/extract-from-design.mjs.
 * Requerimientos: RF-APP-03, RNF-APP-05.
 */
import { SKY_SCENES } from '@tt/core'
import { describe, expect, it } from 'vitest'
import { SKY_SCENE_ART, SKY_SCENE_CSS } from '../src'

const entries = Object.entries(SKY_SCENE_ART)

describe('escenas extraídas', () => {
  it('hay arte para las 21 escenas del núcleo y nada más', () => {
    expect(Object.keys(SKY_SCENE_ART).sort()).toEqual([...SKY_SCENES].sort())
  })

  it.each(entries)('%s usa el lienzo de 640 × 220 y trae su descripción', (_scene, art) => {
    expect(art.viewBox).toBe('0 0 640 220')
    expect(art.descriptionEs.length).toBeGreaterThan(10)
  })

  it.each(entries)('%s solo referencia ids propios que existen', (scene, art) => {
    const ids = new Set([...art.body.matchAll(/id="([^"]+)"/g)].map((m) => m[1]))
    const refs = [...art.body.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1])
    for (const ref of refs) expect(ids.has(ref), `${scene}: url(#${ref})`).toBe(true)
    for (const id of ids) expect(id?.startsWith(`${scene}-`)).toBe(true)
  })

  it('no repite ids entre escenas', () => {
    const all = entries.flatMap(([, art]) => [...art.body.matchAll(/id="([^"]+)"/g)].map((m) => m[1]))
    expect(new Set(all).size).toBe(all.length)
  })

  it('no trae scripts ni manejadores de eventos', () => {
    for (const [, art] of entries) expect(art.body).not.toMatch(/<script|\son\w+=/i)
  })
})

describe('animaciones', () => {
  const animatedClasses = [...SKY_SCENE_CSS.matchAll(/\.(sky-[\w-]+)[^{}]*\{[^}]*animation:sky-/g)].map((m) => m[1])
  const reducedMotion = [...SKY_SCENE_CSS.matchAll(/@media \(prefers-reduced-motion: reduce\)\{([\s\S]*?)\}\}/g)].map((m) => m[1]).join(',')

  it('todas las clases y keyframes llevan el prefijo sky-', () => {
    expect(SKY_SCENE_CSS).not.toMatch(/@keyframes (?!sky-)/)
    expect(SKY_SCENE_CSS).not.toMatch(/animation:(?!sky-|none)/)
  })

  it('encuentra las clases animadas', () => {
    expect(animatedClasses.length).toBeGreaterThan(10)
  })

  it.each([...new Set(animatedClasses)])('%s se apaga con prefers-reduced-motion', (className) => {
    expect(reducedMotion).toContain(`.${className}`)
  })
})
