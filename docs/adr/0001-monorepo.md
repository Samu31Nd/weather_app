# ADR-0001 · Un monorepo con núcleo compartido

- **Estado:** Aceptada (2026-10-20)

## Contexto
Había dos apps en dos repos: `weather_app` (Expo) y `weather-dashboard` (Next.js). Cada una tenía su propio
`WeatherEntity`, sus mappers y sus conversores. Ya habían divergido: un error de máximos y mínimos estaba
corregido en una y no en la otra. Mantener dos copias de la lógica obliga a sincronizarlas a mano.

## Decisión
Un solo repo (`Samu31Nd/weather_app`) con `apps/web`, `apps/mobile` y `packages/*`. La lógica de dominio, los
casos de uso y los adaptadores HTTP viven una sola vez en `packages/core`. Las dos historias de git se conservan:
`git mv` para la app móvil y `git subtree add` para la web.

## Consecuencias
- Una corrección en `core` llega a las dos apps a la vez y se prueba una sola vez.
- El CI tiene que filtrar por rutas para no compilar y desplegar todo en cada cambio.
- El repo `weather-dashboard` se archiva.
