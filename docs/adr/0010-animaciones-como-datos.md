# ADR-0010 · Las animaciones del diseño se describen como datos para móvil

- **Estado:** Aceptada (2026-10-24)

## Contexto
El arte del diseño (21 escenas del cielo y la ilustración de carga, [ADR-0009](0009-arte-del-diseno-por-extraccion.md))
se anima con CSS: nubes a la deriva, lluvia, rayos que giran, estrellas que titilan, el anemómetro… En web basta
con la hoja de estilos. React Native no tiene CSS: `react-native-svg` dibuja el SVG, pero las animaciones hay que
hacerlas con reanimated. Reescribirlas a mano en cada componente duplicaría el diseño y se desfasaría de la web.

## Decisión
- `@tt/sky-art` incluye un lector pequeño del SVG (`parseSvgFragment`) y la transcripción de cada `@keyframes` como
  datos (`resolveMotion`): pistas por propiedad, duración, curva, dirección, retraso y punto de giro, con las mismas
  reglas de selección que el CSS (`.sky-rain path:nth-child(3n)`, `.sky-windy .sky-drift`, `--rs`, `--dx`, `--spin`).
- `sampleMotion` y `motionMatrix` son funciones puras marcadas `'worklet'`: reanimated las ejecuta en el hilo de UI
  y vitest las prueba como cualquier función.
- En móvil, `SvgArt` recorre el árbol, pone los colores de la paleta y anima cada elemento con un único reloj por
  dibujo (`useFrameCallback`). Con "reducir movimiento" activado en el sistema, el arte queda quieto.
- Un test compara duraciones, curvas y direcciones con las hojas CSS extraídas, y verifica que toda clase animada del
  arte tenga su transcripción.

## Consecuencias
- Web y móvil muestran las mismas animaciones con una sola fuente: el canvas de diseño.
- Diferencias aceptadas: un retraso positivo se toma como desfase de fase (en CSS el elemento espera quieto la
  primera vez) y `transform-box: fill-box` usa el centro aproximado de la figura.
- Si el diseño agrega una animación nueva, el test de cobertura falla hasta transcribirla en `motion.ts`.
