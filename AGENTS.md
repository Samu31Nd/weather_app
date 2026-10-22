# AGENTS.md

Guía para agentes (Claude Code, Codex, …) y bitácora de progreso del monorepo de la **Estación meteorológica
TT 2026-B033** (IPN, ESCOM). Si retomas el trabajo en otra conversación, empieza por "Estado por fase".

## Qué hay aquí

Un monorepo con npm workspaces y dos apps que comparten la lógica:

| Ruta | Qué es | Notas |
|------|--------|-------|
| `apps/mobile` | App Expo 57 (expo-router, uniwind, reanimated, react-native-svg) | Ver `apps/mobile/AGENTS.md`. Leer la doc versionada de Expo antes de tocar código. |
| `apps/web` | App Next.js 16 (App Router, Tailwind 4) | Importada de `weather-dashboard` con su historial (`git log HEAD^2` del commit de import). Ver `apps/web/AGENTS.md`. |
| `packages/core` | *(fase 1)* Dominio, puertos, casos de uso y adaptadores HTTP. TS puro: sin React ni APIs de plataforma. | |
| `packages/tokens` | *(fase 2)* Paleta clara/oscura, tipografía y escalas de tamaño del diseño. | |
| `packages/i18n` | *(fase 2)* Catálogos es/en y formateo. | |

## Especificación (`docs/`)

**Lee `docs/` antes de programar una fase.** Ahí están la visión, los requerimientos (`RF-APP-NN`, `RNF-APP-NN`),
los casos de uso (`CU-NN`), la arquitectura, el modelo de dominio, los flujos, el diccionario de datos, la
interfaz, las pruebas con su matriz de trazabilidad, el despliegue y los ADR.
- Los PR y las cabeceras de los tests citan esos IDs.
- Si un cambio contradice `docs/`, actualiza `docs/` en el mismo PR.
- La tesis tomará después una versión resumida de esto.

## Reglas de arquitectura

- **Hexagonal.** Las dependencias van hacia dentro: `apps/* → packages/core`; `core` nunca importa de las apps
  ni de React. Los puertos (interfaces) viven en `core`; los adaptadores que usan APIs de plataforma
  (`localStorage`, AsyncStorage, route handlers) viven en cada app.
- **DI explícita.** Cada app arma sus dependencias con una fábrica (`createContainer(config)`) y las reparte con
  un provider. Nada de singletons de módulo, para que los tests puedan inyectar dobles.
- **La UI se separa por plataforma.** Web y móvil tienen componentes propios. Lo que se comparte es la lógica:
  cálculos, mapeos, reglas de escena y geometría de gráficas.
- **Clean Code.** Nombres que expliquen la intención, funciones cortas, sin código muerto ni bloques comentados.
  Las rarezas de los datos se corrigen en un solo lugar, el mapper, y se documentan con un test.

## Tests

- **core:** Vitest (unitarios con tablas y de integración de adaptadores con MSW y fixtures reales).
- **web:** Vitest + Testing Library.
- **móvil:** jest-expo + Testing Library.
- **Cómo se documenta cada archivo de test:**
  - un comentario de cabecera que dice qué regla cubre y de dónde sale (nota del diseño, doc de datos, bug);
  - `describe`/`it` en español, redactados como comportamiento ("convierte °F a °C con un decimal").
- El detalle está en `docs/testing.md` *(fase 1)*.

## Comandos

```bash
npm install                 # en la raíz: instala todos los workspaces
npm run web                 # Next dev server (apps/web)
npm run mobile              # Expo dev server (apps/mobile)
npm run typecheck           # tsc en todos los workspaces
npm test                    # tests en todos los workspaces
npm run build --workspace=web
```

Cada app lee su propio `.env`. Las plantillas son `apps/mobile/.env.example` y `apps/web/.env.template`; nunca se
commitean valores reales.

## Datos (fuente de verdad: `~/Descargas/proj-files`)

- **En vivo.** `wflexp.json` de la consola Davis. Va por HTTP y sin CORS, así que en web se pasa por el route
  handler de Next. Tiene un mapa de campos en `apps/web/docs/realtime-data-schema.md`.
- **Histórico.** Cloud Function `obtener-datos-clima`.
  - Es pública y responde con `CORS *`.
  - Parámetros: `vista` y `date_start/date_end|days|specific_date`. El esquema está en
    `apps/web/docs/historical-data-schema.md`.
  - **Rarezas:**
    - `LIMIT 1000` (unos 10 días).
    - Los números llegan como strings y las filas de la más nueva a la más vieja.
    - Los datos llegan con 1 día de retraso.
    - `days` corta a medianoche UTC; mejor usar `date_start`.
    - `presion_hpa` en realidad está en mmHg.
    - Desde el 20-oct la presión de las dos fuentes viene reducida a nivel del mar (~770 mmHg). `bartr` es el
      código Davis de tendencia (−60…60), no un delta.
    - En las filas de la captura automática, `wind_dir` y `hi_dir` vienen intercambiados (por confirmar).
  - La lista completa con su corrección está en `docs/06-datos.md`.
- No copiar secretos de `proj-files` (`terraform.tfvars`, `*.tfstate`, `backups/`).

## Diseño

Canvas de Claude Design "Estación meteorológica":
<https://claude.ai/artifact/20bb9e0e-2d1d-4854-89ee-aefb52c44c34>. Se lee con la herramienta Artifact (`read`
con `path`).

| Pantalla | Artboards |
|----------|-----------|
| Web · Ahora | `project/Dashboard.dc.html`, `DashboardClaro` |
| Web · Histórico | `project/Main.dc.html`, `MainClaro` |
| Móvil · Ahora | `project/MobileNow.dc.html`, `MobileNowClaro` |
| Móvil · Histórico | `project/MobileHistory.dc.html`, `MobileHistoryClaro` |
| Carga | `LoadingWeb*`, `LoadingMobile*` |
| Escena del cielo | `project/Sky*.dc.html`; la regla para elegirla está en la nota `skyMap` de `project/canvas.json` |

Las preferencias del diseño son `size` s/m/l, `units`, `theme` (sistema/claro/oscuro) y `lang` es/en. Se guardan
en las claves `wx-*`. La UI también trae "actualizar datos" y el aviso "hace N s · cada 60 s".

## Git

- `main` está protegida: solo se entra por PR y con CI en verde. Las ramas son `feat/…`, `fix/…`, `refactor/…`
  y se borran al mergear.
- Conventional Commits cortos (título + 1–3 líneas), **sin** `Co-Authored-By`.

## Estado por fase

Plan completo: `~/.claude/plans/tenemos-mucho-codigo-en-jaunty-fiddle.md`. Actualiza esta tabla al cerrar cada
fase. Orden: 0 → D → 0b → 1 … 6.

| Fase | Entregables | Rama / PR | Estado |
|------|-------------|-----------|--------|
| 0. Base del monorepo | npm workspaces; `apps/mobile` (git mv) y `apps/web` (subtree con historial); `ignoreBuildErrors` fuera; sobrantes borrados; las dos apps compilan | `refactor/monorepo-base` | ✅ Hecho |
| D. Documentación técnica | `docs/`: visión, RF/RNF, casos de uso, arquitectura C4, dominio, flujos, datos, interfaz, pruebas y trazabilidad, anexo de despliegue, ADR 0001–0008. Actores: solo usuarios (sin mantenedor); CI/CD solo en el anexo 09 | `docs/especificacion-tecnica` | 🔄 En revisión |
| 0b. CI/CD | `ci.yml` (filtros por ruta + `ci-ok` requerido), `staging.yml` (comentario `cicd/deploy-staging-web` o `cicd/deploy-staging-app`), `cleanup-pr.yml`, `release.yml`; Cloud Run + WIF; `eas.json` | — | ⏳ Pendiente |
| 1. `packages/core` | entidades y mappers unificados, bugs de datos corregidos, `ResolveSkyScene`, DI, tests documentados | — | ⏳ Pendiente |
| 2. Tokens, tema, i18n, tamaño de fuente, preferencias | `packages/tokens`, `packages/i18n`, `UserPreferences` + adaptadores, tema web con CSS vars | — | ⏳ Pendiente |
| 3. Web · Ahora + carga | dashboard según diseño, escena del cielo SVG/CSS, proxy `/api/live`, MUI fuera | — | ⏳ Pendiente |
| 4. Móvil · Ahora + carga | widgets rehechos, escena del cielo con reanimated | — | ⏳ Pendiente |
| 5. Histórico | casos de uso de series/KPIs, gráficas SVG propias, CSV/JSON | — | ⏳ Pendiente |
| 6. Cierre | archivar `weather-dashboard`, README, notas para los caps. 6 y 7 de `documentTT`, diagrama UML de casos de uso exportable (PlantUML) | — | ⏳ Pendiente |

Notas de la fase 0:
- Se usa **npm workspaces** en lugar de pnpm, que el plan proponía. Así no hace falta instalar herramientas
  globales, y Expo y Next funcionan sin configuración extra.
- React (19.2.3), `@types/react` y TypeScript (~6.0.3) están alineados entre las dos apps para que no se
  dupliquen.
- Errores de tipos que salieron al quitar `ignoreBuildErrors`:
  - web: tipo `Translations` demasiado literal y la leyenda de MUI X v9;
  - móvil: `ResponsiveNavBar` importaba `@react-navigation/bottom-tabs`, que no está instalado, y
    `unmountOnBlur` ya no existe.
- Se verificó en dev el 21-oct: `/api/weather` y `/api/weather/historical` responden 200 con datos reales.
