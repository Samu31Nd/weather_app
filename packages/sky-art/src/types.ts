// Arte de una escena del cielo, tal como sale del artboard `project/Sky*.dc.html`.

export interface SkySceneArt {
  /** `viewBox` del SVG original (640 × 220). */
  readonly viewBox: string
  /** Clases del `<svg>` raíz (p. ej. `sky-windy`, que acelera las nubes). */
  readonly rootClass: string
  /** Descripción del artboard en español (el texto accesible final lo pone @tt/i18n). */
  readonly descriptionEs: string
  /** Contenido interno del `<svg>`: definiciones y figuras, con clases e ids ya prefijados. */
  readonly body: string
}
