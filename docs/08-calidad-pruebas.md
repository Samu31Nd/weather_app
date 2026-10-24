# 08 · Calidad y pruebas

## Estrategia por capa

| Capa | Herramienta | Qué se prueba | Dobles |
|------|-------------|---------------|--------|
| Dominio (`core/domain`) | Vitest | Reglas puras (y `test/architecture.test.ts`: el núcleo solo importa archivos propios): conversiones, Beaufort, rumbos, sensación térmica, decodificación del pronóstico, escena del cielo, KPIs, remuestreo, geometría de gráficas | Ninguno: entradas y salidas |
| Aplicación (`core/application`) | Vitest | Orquestación: partir rangos, unir y quitar duplicados, validar preferencias | Repositorios en memoria, `Clock` fijo |
| Adaptadores (`core/adapters`) | Vitest + MSW | Integración HTTP: mapeo de fixtures reales, `---`, errores, timeouts, reintentos | MSW sirve los fixtures de `packages/core/test/fixtures/` |
| Contrato | Vitest (`npm run test:contract`) | Que las fuentes reales siguen dando la forma esperada. No corre en cada PR | Ninguno: endpoints reales. Se activa con `CONTRACT=1` |
| Web | Vitest + Testing Library | Componentes clave (tarjetas, estados, ajustes) y el route handler del proxy | `createContainer` con dobles; MSW para el proxy |
| Web e2e | Playwright | Smoke: carga, cambio de tema, cambio de idioma, navegación, descarga | Fixtures servidos por el proxy en modo de prueba |
| Móvil | jest-expo + RN Testing Library | Hooks y pantallas: estados, preferencias, tamaño de texto | `createContainer` con dobles |

## Cómo se documenta una prueba

Cada archivo empieza con un bloque que dice qué cubre, de dónde sale la regla y qué requerimientos traza:

```ts
/**
 * Escena del cielo — capa 3 (lluvia medida manda sobre el pronóstico).
 * Fuente: nota `skyMap` del canvas de diseño; docs/06-datos.md#escena-del-cielo.
 * Requerimientos: RF-APP-03.
 */
describe('ResolveSkyScene · lluvia', () => {
  it('elige llovizna cuando 0 < rainr < 0.5 mm/h aunque el pronóstico diga despejado', () => { … })
})
```

- Los `describe` e `it` van en español y se redactan como comportamiento observable.
- Las tablas (`it.each`) llevan una columna `caso` que explica por qué existe cada fila. Por ejemplo: "límite
  inferior de Beaufort 4".
- Los fixtures tienen un `README.md` que dice de dónde salieron (endpoint y fecha) y que confirma que no traen
  datos internos: la MAC, la IP y el SSID van anonimizados.

## Cómo correrlas

```bash
npm test --workspace=@tt/core          # unitarias + integración, con cobertura
npm run test:contract --workspace=@tt/core   # contra las fuentes reales (no corre en el CI)
npx vitest --root packages/core        # modo watch
npm test --workspace=web               # Vitest + Testing Library (jsdom)
npm test --workspace=mobile            # jest-expo + RN Testing Library
```

En móvil, `test/setup.ts` sustituye reanimated por una versión estática: el mock oficial de reanimated 4 carga el
módulo nativo y falla en jest. Las animaciones se prueban como datos en `packages/sky-art/test/motion.test.ts`.

## Umbrales

- Cobertura de líneas de `packages/core` ≥ 80 % (RNF-APP-09). El CI falla si baja de ahí.
- En las apps no se exige cobertura. Se exige que **cada RF** tenga al menos una prueba en la matriz.

## Matriz de trazabilidad

Se llena conforme avanzan las fases. "Componente" es el módulo que implementa el requerimiento y "Prueba" es el
archivo de test.

| RF / RNF | CU | Componente | Prueba | Fase |
|----------|----|------------|--------|------|
| RF-APP-01 | CU-01 | mapper de `core/adapters/davis-live` · reglas de `core/domain` (sensación, Beaufort, rumbos, sol, confort) · textos de `i18n/presenters` · tarjetas de "Ahora" | `packages/core/test/adapters/davis-live.mapper.test.ts`, `domain/{units,wind,thermal,time-and-sun}.test.ts`; `packages/i18n/test/presenters.test.ts`; `apps/mobile/test/now-screen.test.tsx` | 1, 3, 4 |
| RF-APP-02 | CU-01, 02 | `useLiveWeather` y máquina de estados de "Ahora" (web y móvil) · pantallas de carga (`loadingProgress`) | `apps/web/test/now-screen.test.tsx`, `apps/mobile/test/now-screen.test.tsx` (carga → panel, reintento); `packages/core/test/application/{live-status,loading-progress}.test.ts` | 3, 4 |
| RF-APP-03 | CU-08 | `core/domain/sky-scene` · `core/domain/forecast` · arte y animaciones de `@tt/sky-art` · escena web y móvil (`SvgArt`) | `packages/core/test/domain/sky-scene.test.ts` (21 escenas), `domain/forecast.test.ts`, `application/use-cases.test.ts`; `packages/sky-art/test/{sky-art,motion}.test.ts`; `apps/mobile/test/svg-art.test.tsx` | 1, 3, 4 |
| RF-APP-04 | CU-03 | `core/domain/interpretation` · textos de ayuda en `packages/i18n` | `packages/core/test/domain/thermal.test.ts` (bandas y confort; los textos llegan en la fase 2) | 1, 2 |
| RF-APP-05 | CU-07 | mapper (descarta MAC/IP/SSID) · tarjeta de estado | `packages/core/test/adapters/davis-live.mapper.test.ts` (sin MAC/IP/SSID) | 1, 3, 4 |
| RF-APP-06 | CU-04 | `GetHistory` (tramos, unión, orden) · controles de periodo | `packages/core/test/domain/history.test.ts`, `application/use-cases.test.ts`, `adapters/http.test.ts` | 1, 5 |
| RF-APP-07 | CU-04 | `core/domain/resample` · `core/charts` · gráficas web y móvil | — | 5 |
| RF-APP-08 | CU-04 | `SummarizeHistory` | — | 5 |
| RF-APP-09 | CU-05 | `ExportHistory` | — | 5 |
| RF-APP-10 | CU-06 | `UserPreferences` · adaptadores de almacenamiento · providers de tema, idioma y tamaño · hoja de ajustes móvil | `packages/core/test/domain/preferences.test.ts`, `adapters/key-value-preferences.test.ts`; `apps/web/test/preferences-dom.test.ts`, `now-screen.test.tsx` (idioma, unidades, tema); `apps/mobile/test/now-screen.test.tsx` (ajustes y claves `wx-*` en AsyncStorage) | 2, 4 |
| RNF-APP-01 | CU-01, 04 | mappers de `core/adapters` | `packages/core/test/adapters/*.mapper.test.ts` con fixtures reales; `test/contract/` contra las fuentes | 1 |
| RNF-APP-02 | CU-01, 04 | adaptadores HTTP (reintentos) · estados de pantalla | `packages/core/test/adapters/http.test.ts` (reintentos, timeout, 4xx/5xx, tope de filas) | 1, 3, 4 |
| RNF-APP-05 | — | todas las UI | `packages/tokens/test/tokens.test.ts` (contraste AA en ambos temas), `packages/sky-art/test` (movimiento reducido en web; en móvil `SvgArt` usa `useReducedMotion`); auditoría axe pendiente | 2–5 |
| RNF-APP-07 | — | `packages/i18n` | `packages/i18n/test/catalogs.test.ts` (paridad es/en), `format.test.ts`, `forecast-text.test.ts` | 2 |
| RNF-APP-08 | — | `packages/core` | `packages/core/test/architecture.test.ts` (regla de dependencias) | 1 |
| RNF-APP-09 | — | `packages/core` | umbral de cobertura en `packages/core/vitest.config.ts` (job `core` del CI) | 0b, 1 |
| RNF-APP-10 | CU-01 | `/api/live` | `apps/web/test/live-proxy.test.ts` (URL fija, sin MAC/IP/SSID); `now-screen.test.tsx` | 3 |
| RNF-APP-11 | CU-01 | `/api/live` (caché) · caché de sesión del histórico | `apps/web/test/live-proxy.test.ts` (caché de 10 s) | 3, 5 |
