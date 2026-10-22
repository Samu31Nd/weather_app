# 08 · Calidad y pruebas

## Estrategia por capa

| Capa | Herramienta | Qué se prueba | Dobles |
|------|-------------|---------------|--------|
| Dominio (`core/domain`) | Vitest | Reglas puras: conversiones, Beaufort, rumbos, sensación térmica, decodificación del pronóstico, escena del cielo, KPIs, remuestreo, geometría de gráficas | Ninguno: entradas y salidas |
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

## Umbrales

- Cobertura de líneas de `packages/core` ≥ 80 % (RNF-APP-12). El CI falla si baja de ahí.
- En las apps no se exige cobertura. Se exige que **cada RF** tenga al menos una prueba en la matriz.

## Matriz de trazabilidad

Se llena conforme avanzan las fases. "Componente" es el módulo que implementa el requerimiento y "Prueba" es el
archivo de test.

| RF / RNF | CU | Componente | Prueba | Fase |
|----------|----|------------|--------|------|
| RF-APP-01 | CU-01 | `core/adapters/davis-live` (mapper) · tarjetas "Ahora" | — | 1, 3, 4 |
| RF-APP-02 | CU-01, 02 | `useLiveWeather` (web/móvil) | — | 3, 4 |
| RF-APP-03 | CU-08 | `core/domain/sky-scene` | — | 1 |
| RF-APP-04 | CU-01 | `core/domain/forecast` · `packages/i18n` | — | 1, 2 |
| RF-APP-05 | CU-01 | `core/domain/sun` | — | 1 |
| RF-APP-06 | CU-01 | `core/domain/wind` (Beaufort, rumbos) | — | 1 |
| RF-APP-07 | CU-01 | `core/domain/pressure` | — | 1 |
| RF-APP-08 | CU-01, 03 | `core/domain/humidity` · textos i18n | — | 1, 2 |
| RF-APP-09 | CU-01 | mapper de lluvia | — | 1 |
| RF-APP-10 | CU-01 | `core/domain/comfort` | — | 1 |
| RF-APP-11 | CU-01 | mapper de `hl*` | — | 1 |
| RF-APP-12 | CU-07 | mapper (descarta MAC/IP/SSID) · tarjeta de estado | — | 1, 3, 4 |
| RF-APP-13 | CU-04 | `GetHistory` · controles de periodo | — | 1, 5 |
| RF-APP-14 | CU-04 | `core/domain/resample` | — | 1, 5 |
| RF-APP-15…18 | CU-04 | `core/charts` · gráficas web/móvil | — | 5 |
| RF-APP-19 | CU-04 | `SummarizeHistory` | — | 5 |
| RF-APP-20 | CU-05 | `ExportHistory` | — | 5 |
| RF-APP-21 | CU-04 | `GetHistory` (tramos) | — | 1 |
| RF-APP-22…26 | CU-06 | `UserPreferences` · adaptadores de almacenamiento · providers | — | 2 |
| RF-APP-27 | CU-03 | `packages/i18n` (textos de ayuda) | — | 2 |
| RF-APP-28 | CU-01 | pantallas de carga | — | 3, 4 |
| RF-APP-29 | CU-01 | máquina de estados de "Ahora" | — | 3, 4 |
| RF-APP-30 | — | navegación | — | 3, 4 |
| RNF-APP-05 | — | todas las UI | auditoría axe (web) | 3–5 |
| RNF-APP-09 | CU-01 | `/api/live` | test del proxy (host fijo, sin reenviar cabeceras) | 3 |
| RNF-APP-11 | — | `packages/core` | lint `no-restricted-imports` | 1 |
| RNF-APP-12 | — | `packages/core` | umbral de cobertura en CI | 0b, 1 |
| RNF-APP-13 | — | `packages/i18n` | test: es y en tienen las mismas claves | 2 |
