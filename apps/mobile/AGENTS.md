# AGENTS.md — apps/mobile

App móvil (Expo SDK 58, Expo Router, react-native-svg, reanimated 4). Las reglas generales, los requerimientos y
las fases están en el `AGENTS.md` raíz y en `docs/`.

**Expo cambia rápido:** lee la documentación versionada (<https://docs.expo.dev/versions/v58.0.0/>) antes de tocar
APIs de Expo. Ejemplo: en Expo Router 58, `tabBar` recibe `emitter` + `navigateToTab` en vez de `navigation`.

## Rutas

| Ruta | Qué es | Estado |
|------|--------|--------|
| `src/app/(tabs)/index.tsx` | "Ahora": carga → panel del artboard `MobileNow` | Fase 4 |
| `src/app/(tabs)/historico.tsx` | Histórico del artboard `MobileHistory`: periodo, acordeones por sección y descarga | Fase 5 |

Los ajustes (idioma, tema, tamaño de letra, unidades) son una hoja que se abre desde la cabecera, no una pestaña.

## Estructura

- `src/lib/core.ts`: composition root (`createMobileCore`), con AsyncStorage para las preferencias.
- `src/providers/app-providers.tsx`: `useCore()`, `useLiveSnapshot()` (última lectura, para no repetir la carga
  al volver de otra pestaña) y `usePreferences()` (preferencias, catálogo `t`, formateador, `palette` y
  `textScale`).
- `src/hooks/use-live-weather.ts`: consulta cada 60 s y a pedido. Es la misma lógica que el hook web.
- `src/components/now/`: una tarjeta por bloque del artboard. Reciben el modelo de vista `CurrentConditions` de
  `@tt/core`; los textos derivados salen de `@tt/i18n` (`valueText`, `windText`, `rainText`…).
- `src/components/art/svg-art.tsx`: dibuja el arte de `@tt/sky-art` y lo anima con reanimated (ADR-0010).
- `src/hooks/use-history.ts` y `src/components/history/`: el histórico. Gráficas, indicadores y exportación vienen
  de `@tt/core`; la descarga se entrega con la hoja de compartir (`src/lib/share-file.ts`, expo-file-system y
  expo-sharing).
- `src/components/ui/`: `Txt` (tipografía, color y escala), `Card`, `Segmented`, `IconButton`, íconos.
- `src/components/shell/`: cabecera, hoja de ajustes y barra de pestañas.

## Estilos

- Colores: siempre de `palette` (`@tt/tokens`), nunca hexadecimales sueltos. El tema cambia la paleta completa.
- Texto: usar `Txt`, que pone IBM Plex (Sans o Mono con `mono`), el color y la escala s/m/l. En React Native cada
  peso es una familia distinta (`src/theme/fonts.ts`); no usar `fontWeight`.
- Para texto de color usar las variantes `*-text` (contraste AA en tema claro).

## Comandos

Desde la raíz del repo:

```bash
npm run mobile                          # Expo dev server (Expo Go)
npm run typecheck --workspace=mobile
npm test --workspace=mobile             # jest-expo + Testing Library
npm run build:android                   # APK local (eas build --local)
```

## Entorno

- `EXPO_PUBLIC_WEATHER_STATION_URL`: el proxy `/api/live` de la web (ADR-0007). En desarrollo puede apuntar directo a
  la consola: Expo Go permite HTTP. El APK no lleva excepción de *cleartext*.
- `EXPO_PUBLIC_HISTORY_API_URL`: Cloud Function de histórico. En CI sale de la variable `NEXT_PUBLIC_API_CLOUD_URL`.
