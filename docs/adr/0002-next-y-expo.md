# ADR-0002 · Next.js para web y Expo para móvil, en vez de solo Expo

- **Estado:** Aceptada (2026-10-20)

## Contexto
Expo puede generar la web con react-native-web. Al probarlo, el cambio manual de tema claro/oscuro no funcionaba
en web: uniwind y `Appearance` no se reflejaban. Además, el dato en vivo necesita un servidor por CORS, y la app
web de Next ya tenía el histórico, los route handlers de proxy y Tailwind web nativo.

## Decisión
- **Web:** Next.js (App Router), con CSS real. El tema se aplica con una clase en `<html>` y variables CSS.
- **Móvil:** Expo.
- Las dos comparten `packages/core`, `packages/tokens` y `packages/i18n`, pero **cada una tiene sus propios
  componentes de UI**.

## Consecuencias
- Se escriben dos UIs, pero cada una aprovecha su plataforma: en web, CSS, media queries y `prefers-*`; en móvil,
  reanimated y gestos.
- El tema web deja de depender de react-native-web.
- La consistencia visual se cuida con tokens compartidos y con los artboards del diseño (RNF-APP-16).
