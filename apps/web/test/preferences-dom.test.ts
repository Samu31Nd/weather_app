/**
 * Preferencias aplicadas al documento: clase `dark`, `lang` y tamaño de texto. El script de arranque hace lo
 * mismo antes del primer pintado leyendo las claves `wx-*` (sin destello del tema equivocado).
 * Fuente: artboards `Dashboard`/`LoadingWeb` (claves wx-*) y RF-APP-10 (el tema manual funciona en web).
 * Requerimientos: RF-APP-10, RNF-APP-07.
 */
import { DEFAULT_PREFERENCES } from '@tt/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PREFERENCES_BOOT_SCRIPT, applyPreferencesToDocument } from '@/lib/preferences/apply'

const root = () => document.documentElement
const mockSystemDark = (dark: boolean) =>
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: dark && query.includes('dark'), addEventListener() {}, removeEventListener() {} }))

beforeEach(() => {
  root().className = ''
  root().lang = ''
  delete root().dataset.textSize
  localStorage.clear()
})

describe('aplicar preferencias', () => {
  it('pone el tema oscuro elegido aunque el sistema esté en claro', () => {
    applyPreferencesToDocument(root(), { ...DEFAULT_PREFERENCES, theme: 'dark' }, false)
    expect(root().classList.contains('dark')).toBe(true)
  })

  it('sigue al sistema con el tema "system"', () => {
    applyPreferencesToDocument(root(), DEFAULT_PREFERENCES, true)
    expect(root().classList.contains('dark')).toBe(true)
    applyPreferencesToDocument(root(), DEFAULT_PREFERENCES, false)
    expect(root().classList.contains('dark')).toBe(false)
  })

  it('pone el idioma y el tamaño de texto', () => {
    applyPreferencesToDocument(root(), { ...DEFAULT_PREFERENCES, language: 'en', textSize: 'l' }, false)
    expect(root().lang).toBe('en')
    expect(root().dataset.textSize).toBe('l')
  })
})

describe('script de arranque', () => {
  const runBootScript = () => new Function(PREFERENCES_BOOT_SCRIPT)()

  it('aplica lo guardado en wx-theme, wx-lang y wx-size', () => {
    mockSystemDark(false)
    localStorage.setItem('wx-theme', 'dark')
    localStorage.setItem('wx-lang', 'en')
    localStorage.setItem('wx-size', 's')
    runBootScript()
    expect([root().classList.contains('dark'), root().lang, root().dataset.textSize]).toEqual([true, 'en', 's'])
  })

  it('sin nada guardado usa el sistema, español y tamaño mediano', () => {
    mockSystemDark(true)
    runBootScript()
    expect([root().classList.contains('dark'), root().lang, root().dataset.textSize]).toEqual([true, 'es', 'm'])
  })
})
