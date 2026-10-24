// Marcado del arte del diseño para `dangerouslySetInnerHTML`, con un objeto fijo por dibujo.
// La versión de React que trae Next vuelve a escribir el contenido cuando el objeto `{ __html }` es otro, aunque
// el texto sea el mismo. Eso recrea los elementos del SVG y reinicia sus animaciones CSS (con el reloj de la
// cabecera, cada segundo). Con objetos fijos el SVG solo se escribe al cambiar de escena.

import { SKY_SCENES, type SkyScene } from '@tt/core'
import { SKY_SCENE_ART, STATION_ILLUSTRATION_SVG } from '@tt/sky-art'

export interface Markup {
  readonly __html: string
}

export const SKY_SCENE_MARKUP: Readonly<Record<SkyScene, Markup>> = Object.fromEntries(
  SKY_SCENES.map((scene) => [scene, Object.freeze({ __html: SKY_SCENE_ART[scene].body })]),
) as Record<SkyScene, Markup>

export const STATION_ILLUSTRATION_MARKUP: Markup = Object.freeze({ __html: STATION_ILLUSTRATION_SVG })
