# AGENTS.md

Guía para agentes (Claude Code, Codex, …) y bitácora de progreso del monorepo de la **Estación meteorológica
TT 2026-B033** (IPN, ESCOM). Si retomas el trabajo en otra conversación, empieza por "Estado por fase".

## Qué hay aquí

Un monorepo con npm workspaces y dos apps que comparten la lógica:

| Ruta | Qué es | Notas |
|------|--------|-------|
| `apps/mobile` | App Expo 58 (expo-router, reanimated, react-native-svg) | Ver `apps/mobile/AGENTS.md`. Leer la doc versionada de Expo antes de tocar código. |
| `apps/web` | App Next.js 16 (App Router, Tailwind 4) | Importada de `weather-dashboard` con su historial (`git log HEAD^2` del commit de import). Ver `apps/web/AGENTS.md`. |
| `packages/core` | `@tt/core`: dominio, puertos, casos de uso y adaptadores HTTP. TS puro: sin React ni APIs de plataforma. | Ver `packages/core/AGENTS.md`. |
| `packages/tokens` | `@tt/tokens`: paleta Catppuccin clara/oscura del diseño (+ variantes `*-text` con contraste AA), tipografía y hoja de variables CSS. | Test de contraste WCAG. |
| `packages/i18n` | `@tt/i18n`: catálogos es/en (mismas claves, verificado por test), formateador en hora de CDMX, frase del pronóstico y textos derivados que comparten las dos apps (`presenters.ts`). | |
| `packages/sky-art` | `@tt/sky-art`: SVG y animaciones CSS de las 21 escenas y de la ilustración de carga, extraídos del canvas con `npm run extract`; las mismas animaciones como datos para móvil. | ADR-0009, ADR-0010. |

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
- **móvil:** jest-expo + Testing Library (`test/setup.ts` sustituye reanimated por una versión estática).
- **Cómo se documenta cada archivo de test:**
  - un comentario de cabecera que dice qué regla cubre y de dónde sale (nota del diseño, doc de datos, bug);
  - `describe`/`it` en español, redactados como comportamiento ("convierte °F a °C con un decimal").
- Las herramientas de prueba (vitest, vite, msw) van en la raíz del monorepo; npm no resuelve bien el *hoisting* de
  vite si quedan en el paquete.
- El detalle está en `docs/08-calidad-pruebas.md`.

## Comandos

```bash
npm install                 # en la raíz: instala todos los workspaces
npm run web                 # Next dev server (apps/web)
npm run mobile              # Expo dev server (apps/mobile)
npm run typecheck           # tsc en todos los workspaces
npm test                    # tests en todos los workspaces
npm run build --workspace=web
npm run build:android        # APK local (no usa el cupo de EAS Build)
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
| D. Documentación técnica | `docs/`: visión, RF/RNF, casos de uso, arquitectura C4, dominio, flujos, datos, interfaz, pruebas y trazabilidad, anexo de despliegue, ADR 0001–0008. Actores: solo usuarios (sin mantenedor); CI/CD solo en el anexo 09 | `docs/especificacion-tecnica` (#3) | ✅ Hecho |
| 0b. CI/CD | `ci.yml` (filtros por ruta + `ci-ok` requerido), `staging.yml` (comentario `cicd/deploy-staging-web` o `cicd/deploy-staging-app`), `cleanup-pr.yml`, `release.yml`; Cloud Run + WIF (`proj-files/infra/web_hosting.tf`); `eas.json` + `expo-updates`; imagen *standalone* de Next | `feat/ci-cd` (#4) | ✅ Hecho |
| 1. `packages/core` | `@tt/core` con dominio, mappers con las rarezas corregidas, `ResolveCurrentSky`, `GetHistory` por tramos, `createCore`; 191 tests documentados, cobertura ~99 %, tests de contrato; job `core` en el CI; las dos apps ya importan `@tt/core` | `feat/core` (#7) | ✅ Hecho |
| 2. Tokens, tema, i18n, tamaño de fuente, preferencias | `@tt/tokens`, `@tt/i18n`, `@tt/sky-art`; en `@tt/core`: `UserPreferences`, `KeyValuePreferencesRepository` (claves `wx-*`), modelo de vista `CurrentConditions`, `liveStatus`, geometría de indicadores; tema web con variables CSS | `feat/design-web-now` (#8) | ✅ Hecho |
| 3. Web · Ahora + carga | `/` según los artboards `Dashboard` y `LoadingWeb` (claro/oscuro, es/en, métrico/imperial, tamaño s/m/l), escena del cielo, proxy `/api/live`, tests web; `/historico` provisional; MUI sigue solo en el histórico | `feat/design-web-now` (#8) | ✅ Hecho |
| 4. Móvil · Ahora + carga | "Ahora" y carga según `MobileNow`/`LoadingMobile` (claro/oscuro, es/en, métrico/imperial, tamaño s/m/l) con la hoja de ajustes; 21 escenas y la ilustración animadas con reanimated (ADR-0010); textos derivados y avance de carga compartidos con la web; jest-expo; íconos cuadrados; UI vieja, uniwind y axios fuera | `feat/mobile-now` (#9) | ✅ Hecho |
| 5. Histórico | En `@tt/core`: periodos y resoluciones en hora de CDMX, `buildHistoryView` (agregación, huecos, rosa, indicadores), `historyCharts` (escalas y trazos SVG), `historyArt`, `exportHistory` (CSV/JSON); textos en `@tt/i18n`. Web `/historico` según `Main` y móvil según `MobileHistory` (acordeones, hoja de compartir). Fuera MUI, recharts, shadcn y `/api/weather/historical` (la web pasa de 50+ a 7 dependencias) | `feat/history` (#11) | ✅ Hecho |
| 6. Cierre | ~~archivar `weather-dashboard`~~ (hecho 24-oct, Vercel retirado); README del monorepo; `docs/10-notas-tesis.md` (qué cambia en los caps. 6 y 7 y de dónde sale el texto); diagrama UML de casos de uso en `docs/diagramas/casos-de-uso.puml`; QR de la actualización móvil de producción en el release y el resumen de `release.yml` | `docs/cierre` (#12) | ✅ Hecho |
| 7. Widget de Android | Widgets 2×2 y 4×2 según `WidgetsClaro`/`WidgetsOscuro` con `react-native-android-widget` (ADR-0011): ícono por clima, dato contextual, tema del sistema, fuente del usuario, ↻ y respaldo sin conexión; reglas, textos, colores AA e íconos en los paquetes; solo en el APK | `feat/android-widget` | 🔄 En revisión |

Notas de la fase 0:
- Se usa **npm workspaces** en lugar de pnpm, que el plan proponía. Así no hace falta instalar herramientas
  globales, y Expo y Next funcionan sin configuración extra.
- React (19.3.0 desde el SDK 58), `@types/react` y TypeScript (~6.0.3) están alineados entre las dos apps para que no se
  dupliquen.
- Errores de tipos que salieron al quitar `ignoreBuildErrors`:
  - web: tipo `Translations` demasiado literal y la leyenda de MUI X v9;
  - móvil: `ResponsiveNavBar` importaba `@react-navigation/bottom-tabs`, que no está instalado, y
    `unmountOnBlur` ya no existe.
- Se verificó en dev el 21-oct: `/api/weather` y `/api/weather/historical` responden 200 con datos reales.

Notas de la fase 0b:
- Producción web: `https://weather-web-nspsuyfpwa-uc.a.run.app`. Móvil: canal `production` de EAS Update.
- `main` está protegida: exige `ci-ok`, no permite bypass a administradores y las ramas se borran al mergear.
- En CI no existe `expo-env.d.ts`, que se genera en local. La referencia a los tipos de Expo vive versionada en
  `apps/mobile/src/types/expo.d.ts`.
- El push de cambios en `.github/workflows/` necesita SSH o un `gh` con el scope `workflow`.
- La alerta de presupuesto (1 USD) está pendiente: la debe crear el administrador de facturación desde la consola.
Notas de la migración a Expo SDK 58 (24-oct):
- Expo Go solo abre proyectos del SDK más reciente; por eso se migró de 57 a 58 (RN 0.88, React 19.3).
- Hay que regenerar `package-lock.json` desde cero al cambiar de SDK. Si no, npm deja copias viejas de
  reanimated/worklets en la raíz y TypeScript toma la versión vieja de `react-native` (desaparece `className`).
- Expo Router 58 cambió la API de `tabBar`: ahora recibe `emitter` + `navigateToTab` en vez de `navigation`.
- `expo-doctor` avisa que `icon.png` y `android-icon-foreground.png` no son cuadrados (512×504). Hay que
  arreglarlos antes de generar el APK.

Notas de la fase 1 (24-oct):
- **Hallazgos en datos reales** (detalle en `docs/06-datos.md`):
  - **D1:** `hl*` = [hoy mín, hoy máx, horas, mes máx, mes mín, año máx, año mín]. Los dos mappers previos estaban mal.
  - **D12:** el reloj de pared de la consola es correcto, pero su zona horaria está en UTC−5. `utctime` sale 1 h
    atrasado y `sunrt`/`sunst` 1 h adelantados. Conviene corregirlo en la consola.
  - **D5:** el intercambio `wind_dir`/`hi_dir` se arregla en el pipeline, no en la app.
- La UI vieja de las dos apps **todavía no usa** `LiveReading`. Pasa a usar el núcleo cuando se rehaga en las fases
  3 y 4; por ahora solo comparten `compassPointFromDegrees`, como prueba de que Next y Metro empaquetan `@tt/core`.
- El push de esta rama necesita SSH: modifica `.github/workflows/ci.yml` (job `core`).

Notas de las fases 2 y 3 (24-oct):
- Paleta: en tema claro, `tm` y los acentos usados como texto no llegaban a 4.5:1. Se agregaron variantes `*-text`
  más oscuras y se oscureció `tm`; los acentos del diseño siguen igual en gráficos. Lo verifica
  `packages/tokens/test/tokens.test.ts`.
- El texto del diseño "presión de estación, no a nivel del mar" ya no es cierto (D3): la tarjeta dice "Reducida a
  nivel del mar", y el medidor va de 995 a 1045 hPa.
- Las 21 escenas reemplazan a la escena simple del héroe del artboard `Dashboard`.
- La vigencia del dato se mide desde la última consulta exitosa, porque el reloj de la consola deriva (D12).
- La web ya no depende de `@vercel/analytics`, `swr`, `zod` ni `@hookform/resolvers`. MUI, recharts y los
  componentes shadcn que solo usa el histórico se quitan en la fase 5.
- Capturas: Brave *headless* sirve para revisar la UI (`--virtual-time-budget` avanza los temporizadores), pero
  dejó de responder durante la sesión; `/historico` se revisa en el staging.
- El push de esta rama necesita SSH: modifica `.github/workflows/ci.yml` (job `packages`).

Notas de la fase 4 (24-oct):
- Lógica movida a los paquetes para que web y móvil no la dupliquen: textos derivados (`@tt/i18n/presenters`),
  avance de la pantalla de carga (`loadingProgress`), ícono del pronóstico (`forecastIcon`) y la ilustración de carga
  (`@tt/sky-art`). El hook `useLiveWeather` sigue copiado en cada app: es React y los paquetes no lo usan.
- Animaciones en móvil: `sampleMotion`/`motionMatrix` llevan `'worklet'` y viven en `@tt/sky-art`. Se verificó en
  el bundle de Android que reanimated las transforma (`sampleMotion_motionTs1`…). Falta verlas en un dispositivo.
- El móvil lee el dato en vivo del proxy `/api/live` de la web (ADR-0007). La variable `MOBILE_WEATHER_STATION_URL`
  del repo debe apuntar a `https://weather-web-nspsuyfpwa-uc.a.run.app/api/live`.
- TypeScript 6 ya no incluye `@types` automáticamente: el `tsconfig` móvil declara `"types": ["jest"]`.
- El mock oficial de reanimated 4 falla en jest (carga el módulo nativo); `test/setup.ts` usa uno estático.

Notas de la fase 5 (25-oct):
- **Periodo:** termina a la medianoche de hoy en CDMX, porque el histórico llega con un día de retraso (D7). Hay
  datos desde el **19-abr-2026** (`HISTORY_FIRST_DAY`); "últimos N días" se recorta a eso. 90 días son 9 consultas
  en paralelo de ~0.5 s cada una.
- **Agregación:** días, semanas (lun–dom) y meses en hora de CDMX. Un intervalo sin lecturas queda vacío y se dibuja
  como corte. Las presiones fuera de 740–790 mmHg (sin corregir, D3) se descartan.
- **Diferencias con el artboard:** la presión usa las unidades de las preferencias (sin selector mmHg/hPa) y la
  tendencia sale del cambio en 3 h con los umbrales Davis. La descarga exporta lo que se ve (resolución y variables
  visibles); se ajustó el criterio de RF-APP-09 en `docs/01-requerimientos.md`.
- **shadcn redefinía los radios de Tailwind** (`--radius: 1rem`): `rounded-md` daba 14 px. Al quitarlo, "Ahora"
  usa los radios estándar, que coinciden con el diseño.
- El hook `useHistory` está copiado en web y móvil, como `useLiveWeather`. Si crecen, conviene un paquete
  `@tt/react` con los hooks que reciban el núcleo como parámetro.
- El push de esta rama necesita SSH: agrega `EXPO_PUBLIC_HISTORY_API_URL` a `staging.yml` y `release.yml`.
- PR #10 (`fix/web-sky-animation`, mergeado antes de esta rama): las animaciones web se reiniciaban cada segundo porque `dangerouslySetInnerHTML` recibía un objeto nuevo en cada render.

Notas de la fase 6 (25-oct):
- El diagrama PlantUML no se exportó aquí (no hay PlantUML instalado). Se exporta con
  `plantuml -tsvg docs/diagramas/casos-de-uso.puml`, la extensión de PlantUML de VS Code o plantuml.com.
- El push de esta rama necesita SSH: modifica `release.yml` y la acción `release-tag`.
- **Pendientes fuera del plan:** auditoría de accesibilidad con axe (web) y TalkBack (móvil) para cerrar
  RNF-APP-05; corregir `wind_dir`/`hi_dir` en el pipeline (D5), que ya afecta la rosa del histórico; zona horaria
  de la consola en UTC−6 (D12); alerta de presupuesto en GCP.
- **Ideas para después:** fases de la luna calculadas por fecha (la consola no las publica en `wflexp.json`).

Notas de la fase 7 (25-oct):
- El widget solo existe en el APK. `react-native-android-widget` falla al importarse sin su módulo nativo, así que
  `index.ts` lo registra solo si `WIDGETS_AVAILABLE` (Android fuera de Expo Go) y lo carga con `require` diferido.
  La app usa `index.ts` como entrada (`"main"`), que después arranca Expo Router.
- `expo prebuild` agregó `android.package: com.samu31nd.ttb033` a `app.json`. Es el identificador permanente del
  APK: confirmarlo antes de distribuir la primera versión.
- `/android` y `/ios` están en `.gitignore`: el proyecto nativo se genera en cada build (CNG). Si se corre
  `expo prebuild` en local, revisar que no cambie los scripts de `package.json`.
- El texto secundario claro del widget se oscureció a `#5b5d70` (el diseño usa `#6c6f85`) para cumplir AA.
- **Primer APK (28-oct) sin datos ni widget.** (1) `eas build --local` no copia `.env` (está en `.gitignore`):
  las URLs se declaran en el perfil `base` de `eas.json`; pendiente pasarlas a variables de entorno de EAS.
  (2) R8 quitaba el constructor de `OverwritingInputMerger` y el trabajo del widget fallaba: regla de ProGuard con
  `expo-build-properties` (ADR-0011). Se diagnosticó con `adb logcat --pid=$(adb shell pidof com.samu31nd.ttb033)`.
