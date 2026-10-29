// API pública de @tt/sky-art: arte de las 21 escenas y de la pantalla de carga, sus hojas de animación (web) y
// las mismas animaciones como datos, con un lector del SVG (móvil).

export type { SkySceneArt } from './types'
export { SKY_SCENE_ART } from './scenes.generated'
export { SKY_SCENE_CSS } from './styles.generated'
export { STATION_ILLUSTRATION_CSS, STATION_ILLUSTRATION_SVG, STATION_ILLUSTRATION_VIEWBOX } from './station-illustration'
export { type SvgElement, type SvgNode, approximateCenter, isElement, parseSvgFragment } from './svg-tree'
export {
  ANIMATED_CLASSES, ANIMATED_PARENT_CLASSES, type MotionContext, type MotionSample, type MotionSpec, motionMatrix,
  resolveMotion, sampleMotion,
} from './motion'
export { type WidgetIconKind, widgetIconSvg, widgetRefreshSvg } from './widget-icons'
