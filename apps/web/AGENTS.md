# AGENTS.md — apps/web

App web (Next.js 16, App Router, Tailwind 4). Las reglas generales, los requerimientos y las fases están en el
`AGENTS.md` raíz y en `docs/`.

## Rutas

| Ruta | Qué es | Estado |
|------|--------|--------|
| `/` | "Ahora": carga → dashboard del artboard `Dashboard` | Nuevo (fase 3) |
| `/historico` | Gráficas previas (MUI) con la cabecera nueva, adaptadas a las preferencias nuevas | Provisional hasta la fase 5 |
| `/api/live` | Proxy del dato en vivo: solo la consola configurada, caché de 10 s y sin MAC/IP/SSID | `lib/live/live-proxy.ts` |
| `/api/weather/historical` | Proxy previo del histórico (lo usa `/historico`) | Hasta la fase 5 |

## Estructura

- `app/layout.tsx`: fuentes IBM Plex, hoja de tokens (`themeStylesheet()` de `@tt/tokens`) y script de arranque
  que aplica tema, idioma y tamaño desde las claves `wx-*` antes del primer pintado.
- `components/providers/app-providers.tsx`: `useCore()` (composition root, `lib/core.ts`) y `usePreferences()`
  (preferencias, catálogo `t` y formateador `format` de `@tt/i18n`).
- `hooks/use-live-weather.ts`: consulta cada 60 s y a pedido; vigencia con `liveStatus` de `@tt/core`.
- `components/now/`: una tarjeta por bloque del artboard. Reciben el modelo de vista `CurrentConditions` de
  `@tt/core` (ya en las unidades elegidas) y solo lo dibujan.
- `components/shell/`: cabecera común, tarjeta y controles segmentados.
- `components/app-provider.tsx` y `components/weather/components/*`: histórico previo (MUI); se borran en la fase 5.

## Estilos

- Colores: las utilidades `bg-wx-*`, `text-wx-*` y `border-wx-*` mapean los tokens del diseño (ver
  `app/globals.css`). **No usar variantes `dark:`**: las variables cambian solas con la clase `.dark` de `<html>`.
- Para texto de color usar las variantes `*-text` (`text-wx-temp-text`…), que cumplen 4.5:1 en tema claro.
- Cifras: clase `num` (IBM Plex Mono, tabulares). Tamaño de texto: el contenedor lleva `wx-zoom`.

## Comandos

Desde la raíz del repo:

```bash
npm run web                          # dev server en :3000
npm run build --workspace=web
npm run typecheck --workspace=web
npm test --workspace=web             # Vitest + Testing Library (jsdom)
```

## Entorno

- `LIVE_STATION_URL`: URL de `wflexp.json`. Solo la usa el servidor. Si falta, se usa `NEXT_PUBLIC_API_URL` +
  `wflexp.json`.
- `NEXT_PUBLIC_API_CLOUD_URL`: Cloud Function de histórico.

## Docker

`apps/web/Dockerfile` se construye **desde la raíz** y copia `packages/`. Si se agrega un paquete compartido,
también hay que agregar su `package.json` al `Dockerfile`.
