/**
 * Colores del widget de Android: cada tipo de clima tiene fondo en los dos temas, y el texto principal y el
 * secundario cumplen 4.5:1 (WCAG AA) sobre todos los fondos.
 * Fuente: artboards `WidgetsClaro`/`WidgetsOscuro`.
 * Requerimientos: RNF-APP-05.
 */
import { describe, expect, it } from 'vitest'
import { WIDGET_BACKGROUND_KINDS, WIDGET_PALETTES, contrastRatio } from '../src'

const cases = (['light', 'dark'] as const).flatMap((theme) => WIDGET_BACKGROUND_KINDS.map((kind) => [theme, kind] as const))

describe('colores del widget', () => {
  it.each(cases)('tema %s, fondo %s: texto y texto secundario legibles (≥ 4.5:1)', (theme, kind) => {
    const palette = WIDGET_PALETTES[theme]
    const background = palette.background[kind]
    expect(background).toMatch(/^#[0-9a-f]{6}$/)
    expect(contrastRatio(palette.text, background)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(palette.muted, background)).toBeGreaterThanOrEqual(4.5)
  })
})
