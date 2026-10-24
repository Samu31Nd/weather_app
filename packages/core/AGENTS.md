# AGENTS.md — packages/core (`@tt/core`)

Núcleo hexagonal que comparten la app web y la móvil. Las reglas generales, los requerimientos y las fases están en
el `AGENTS.md` raíz y en `docs/`.

## Reglas

- **TypeScript puro.** Solo importa archivos propios, con rutas relativas: nada de React, React Native, Next,
  Expo ni librerías. Lo verifica `test/architecture.test.ts`.
- **Unidades canónicas métricas** (°C, km/h, mm, hPa). Los mappers convierten al entrar; las apps convierten a
  imperial solo para mostrar.
- **Las rarezas de las fuentes se corrigen solo en los mappers** (`src/adapters/*/…mapper.ts`) y cada una tiene un
  test que cita su ID de `docs/06-datos.md` (D1–D13).
- `null` significa "sin dato". Nunca se convierte en 0.
- Las apps usan `createCore({ liveUrl, historyUrl })` y solo importan desde `@tt/core` (`src/index.ts`).

## Estructura

| Carpeta | Contenido |
|---------|-----------|
| `src/domain/` | Reglas puras: unidades, viento, presión, sensación térmica, tiempo (CDMX y reloj de la consola), sol, pronóstico (`forecast-rules.ts` = 195 reglas Davis), escena del cielo, histórico |
| `src/ports.ts` | `LiveWeatherRepository`, `HistoryRepository`, `Clock` |
| `src/application/` | `GetLiveWeather`, `GetHistory` (tramos ≤ 10 días), `ResolveCurrentSky` |
| `src/adapters/` | `http.ts` (timeout + reintentos), `davis-live/` (consola o proxy `/api/live`), `cloud-history/` (Cloud Function) |
| `src/container.ts` | `createCore`: composition root inyectable |
| `test/` | Un archivo por módulo, `fixtures/` reales con su README, `contract/` contra las fuentes reales |

## Comandos

```bash
npm test --workspace=@tt/core               # tests + cobertura (mínimo 80 % de líneas)
npm run test:contract --workspace=@tt/core  # fuentes reales
npm run typecheck --workspace=@tt/core
```
