/**
 * El marcado del arte usa un objeto fijo por dibujo. La versión de React que trae Next reescribe
 * `dangerouslySetInnerHTML` cuando cambia el objeto, aunque el texto sea igual; eso recreaba el SVG cada segundo
 * (reloj de la cabecera) y reiniciaba las animaciones de nubes y sol. En jsdom, con el React de npm, no se
 * reproduce; se verificó en Brave midiendo `document.getAnimations()`.
 * Fuente: bug reportado en web tras la fase 4.
 * Requerimientos: RF-APP-02, RF-APP-03.
 */
import { SKY_SCENES } from '@tt/core'
import { SKY_SCENE_ART, STATION_ILLUSTRATION_SVG } from '@tt/sky-art'
import { describe, expect, it } from 'vitest'
import { SKY_SCENE_MARKUP, STATION_ILLUSTRATION_MARKUP } from '@/lib/art/markup'

describe('marcado del arte', () => {
  it.each([...SKY_SCENES])('la escena %s tiene un único objeto con su SVG', (scene) => {
    expect(SKY_SCENE_MARKUP[scene]).toBe(SKY_SCENE_MARKUP[scene])
    expect(SKY_SCENE_MARKUP[scene].__html).toBe(SKY_SCENE_ART[scene].body)
    expect(Object.isFrozen(SKY_SCENE_MARKUP[scene])).toBe(true)
  })

  it('la ilustración de carga también', () => {
    expect(STATION_ILLUSTRATION_MARKUP.__html).toBe(STATION_ILLUSTRATION_SVG)
    expect(Object.isFrozen(STATION_ILLUSTRATION_MARKUP)).toBe(true)
  })
})
