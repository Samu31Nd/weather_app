# ADR-0006 · Gráficas en SVG propio con geometría compartida

- **Estado:** Aceptada (2026-10-21)

## Contexto
La web usaba MUI X Charts (con emotion y MUI completos) y el móvil SVG a mano. El diseño pide gráficas
específicas (banda mín./máx., rosa de los vientos, acumulado de lluvia, eje de presión ajustado) en las dos
plataformas. No hay una librería que funcione igual en web y en React Native.

## Decisión
- Las escalas, los ticks, los paths y la rosa de los vientos se calculan en `packages/core/charts` como funciones
  puras.
- Cada app solo dibuja: `<svg>` en web y `react-native-svg` en móvil.
- Se quitan MUI y recharts.

## Consecuencias
- Las gráficas son idénticas en las dos plataformas y su geometría tiene tests unitarios.
- El bundle web es más chico.
- La interacción (tooltips, cursor) hay que escribirla para cada plataforma.
