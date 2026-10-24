# ADR-0009 · El arte del diseño se extrae del canvas con un script

- **Estado:** Aceptada (2026-10-24)

## Contexto
Las 21 escenas del cielo y la ilustración de carga son SVG con animaciones CSS dentro de los artboards del canvas
de Claude Design. Copiarlos a mano a cada app es lento, propenso a errores y se desactualiza cuando cambia el
diseño. Además, sus clases (`.drift`, `.rain`, `.spin`) e ids chocarían con los estilos de la app.

## Decisión
- `packages/sky-art/scripts/extract-from-design.mjs` lee los `project/Sky*.dc.html` descargados del canvas y genera
  `src/scenes.generated.ts` y `src/styles.generated.ts`.
- Las clases y keyframes llevan el prefijo `sky-`, y los ids el nombre de la escena.
- Las etiquetas visibles no se copian: las pone `@tt/i18n` en el idioma elegido.
- Un test verifica que estén las 21 escenas, que las referencias `url(#…)` sean válidas, que los ids no se repitan
  y que toda animación se apague con `prefers-reduced-motion`.
- La ilustración de carga se extrajo de la misma forma, con el prefijo `wx-load-`.

## Consecuencias
- Si el diseño cambia, se vuelve a descargar del canvas y se corre `npm run extract --workspace=@tt/sky-art`.
- El SVG se inyecta como contenido propio (`dangerouslySetInnerHTML`). El test garantiza que no trae scripts ni
  manejadores de eventos.
- En móvil el mismo SVG se dibuja con `react-native-svg` y las animaciones se reproducen como datos
  ([ADR-0010](0010-animaciones-como-datos.md)).
