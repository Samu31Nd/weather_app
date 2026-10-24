/**
 * Renderizador del arte del diseño en móvil: las 21 escenas y la ilustración de carga se dibujan con
 * react-native-svg sin perder figuras, con los colores de la paleta y ocultando la lluvia hasta "recibirla".
 * Fuente: @tt/sky-art (artboards Sky* y LoadingMobile); ADR-0010.
 * Requerimientos: RF-APP-02, RF-APP-03.
 */
import { render } from '@testing-library/react-native'
import { SKY_SCENE_ART, STATION_ILLUSTRATION_SVG, STATION_ILLUSTRATION_VIEWBOX } from '@tt/sky-art'
import { PALETTES } from '@tt/tokens'
import { SUPPORTED_TAGS, SvgArt } from '@/components/art/svg-art'

const ARTWORKS = [...Object.values(SKY_SCENE_ART).map((art) => art.body), STATION_ILLUSTRATION_SVG]

describe('arte del diseño en react-native-svg', () => {
  it('sabe dibujar todas las etiquetas que usa el arte', () => {
    const tags = new Set(ARTWORKS.flatMap((markup) => [...markup.matchAll(/<([a-zA-Z]+)/g)].map((m) => m[1])))
    for (const tag of tags) expect(SUPPORTED_TAGS).toContain(tag)
  })

  it.each(Object.entries(SKY_SCENE_ART))('dibuja la escena %s con su etiqueta accesible', async (_scene, art) => {
    const screen = await render(<SvgArt markup={art.body} viewBox={art.viewBox} width={320} height={110} accessibilityLabel="escena" />)
    expect(screen.getByLabelText('escena')).toBeTruthy()
  })

  it('resuelve los colores var(--…) de la ilustración con la paleta', async () => {
    const { toJSON } = await render(<SvgArt markup={STATION_ILLUSTRATION_SVG} viewBox={STATION_ILLUSTRATION_VIEWBOX} width={320} height={450} palette={PALETTES.dark} />)
    const json = JSON.stringify(toJSON())
    expect(json).not.toContain('var(--')
  })

  it('oculta la lluvia de la ilustración mientras no se "recibe"', async () => {
    const hidden = await render(
      <SvgArt markup={'<g data-rain="true"><path d="M0 0"></path></g>'} viewBox="0 0 10 10" width={10} height={10} isHidden={(el) => el.attrs['data-rain'] === 'true'} />,
    )
    expect(JSON.stringify(hidden.toJSON())).toMatch(/"opacity":0/)
  })
})
