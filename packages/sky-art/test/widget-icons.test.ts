/**
 * Íconos del widget de Android: un SVG completo y bien formado por tipo de clima y tema, sin scripts, y la luna
 * recortada con el color de fondo del widget.
 * Fuente: artboards `WidgetsClaro`/`WidgetsOscuro`.
 * Requerimientos: RF-APP-03.
 */
import { describe, expect, it } from 'vitest'
import { type WidgetIconKind, parseSvgFragment, widgetIconSvg, widgetRefreshSvg } from '../src'

const KINDS: WidgetIconKind[] = ['clear', 'night', 'partly', 'rain', 'storm', 'fog', 'offline']
const cases = (['light', 'dark'] as const).flatMap((theme) => KINDS.map((kind) => [kind, theme] as const))

describe('íconos del widget', () => {
  it.each(cases)('%s en tema %s es un SVG de 48 × 48 bien formado', (kind, theme) => {
    const svg = widgetIconSvg(kind, theme, '#24223a')
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 48 48">/)
    expect(() => parseSvgFragment(svg)).not.toThrow()
    expect(svg).not.toMatch(/<script|\son\w+=/i)
  })

  it('la luna se recorta con el fondo del widget', () => {
    expect(widgetIconSvg('night', 'light', '#e4e2f6')).toContain('<circle cx="30" cy="19" r="11" fill="#e4e2f6"/>')
  })

  it('las gotas cambian de color con el tema', () => {
    expect(widgetIconSvg('rain', 'light', '#fff')).toContain('#1e66f5')
    expect(widgetIconSvg('rain', 'dark', '#000')).toContain('#89b4fa')
  })

  it('el ícono de actualizar toma el color pedido', () => {
    expect(widgetRefreshSvg('#a6adc8')).toContain('stroke="#a6adc8"')
  })
})
