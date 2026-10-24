/**
 * Tokens de diseño: las dos paletas tienen los mismos nombres, la hoja CSS los expone y el texto cumple
 * WCAG 2.2 AA en los dos temas.
 * Fuente: estilos `.wx` / `.wx.dark` del canvas de diseño; ajuste de contraste documentado en src/palette.ts.
 * Requerimientos: RNF-APP-04 (sigue el diseño), RNF-APP-05 (contraste ≥ 4.5:1 en ambos temas).
 */
import { describe, expect, it } from 'vitest'
import { PALETTES, TOKEN_NAMES, type ThemeName, contrastRatio, cssVariables, themeStylesheet } from '../src'

const THEMES: ThemeName[] = ['light', 'dark']
const TEXT_TOKENS = ['tx', 't2', 'tm', 'temp-text', 'hum-text', 'blue-text', 'wind-text', 'pres-text', 'green-text'] as const
const SURFACES = ['bg', 'sf'] as const

describe('paletas', () => {
  it.each(THEMES)('el tema %s define todos los tokens con un color hexadecimal (con transparencia opcional)', (theme) => {
    expect(Object.keys(PALETTES[theme]).sort()).toEqual([...TOKEN_NAMES].sort())
    for (const value of Object.values(PALETTES[theme])) expect(value).toMatch(/^#[0-9a-f]{6}([0-9a-f]{2})?$/)
  })

  it('conserva los colores base del diseño (Catppuccin Latte y Mocha)', () => {
    expect(PALETTES.light.sf).toBe('#eff1f5')
    expect(PALETTES.dark.sf).toBe('#1e1e2e')
    expect(PALETTES.light.temp).toBe('#fe640b')
  })
})

describe('contraste del texto (WCAG 2.2 AA)', () => {
  const pairs = THEMES.flatMap((theme) =>
    TEXT_TOKENS.flatMap((text) => SURFACES.map((surface) => ({ theme, text, surface }))),
  )

  it.each(pairs)('$text sobre $surface en tema $theme alcanza 4.5:1', ({ theme, text, surface }) => {
    expect(contrastRatio(PALETTES[theme][text], PALETTES[theme][surface])).toBeGreaterThanOrEqual(4.5)
  })

  it('calcula el contraste como WCAG: negro sobre blanco es 21:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
  })
})

describe('variables CSS', () => {
  it('expone cada token como variable con el nombre corto del diseño', () => {
    expect(cssVariables('dark')).toContain('--sf:#1e1e2e')
    expect(cssVariables('light').split(';')).toHaveLength(TOKEN_NAMES.length)
  })

  it('genera la hoja con el tema claro en :root y el oscuro en :root.dark', () => {
    const sheet = themeStylesheet()
    expect(sheet).toMatch(/^:root\{color-scheme:light;--bg:#e6e9ef/)
    expect(sheet).toContain(':root.dark{color-scheme:dark;--bg:#181825')
  })
})
