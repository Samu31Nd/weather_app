# Estación meteorológica · TT 2026-B033

App web y móvil de la **Plataforma de Monitoreo y Visualización Meteorológica** (IPN, ESCOM). Muestra en vivo la
estación Davis de ESCOM —temperatura, viento, lluvia, presión y el estado del cielo— y su histórico con gráficas,
indicadores y descarga de datos, en español o inglés, tema claro u oscuro.

- **Web:** <https://weather-web-nspsuyfpwa-uc.a.run.app> (Next.js en Cloud Run).
- **Móvil:** app Expo; las actualizaciones llegan por EAS Update al canal `production`. El APK se genera a pedido.

## Estructura

```
apps/web          Next.js 16 · "Ahora", "Histórico" y el proxy /api/live
apps/mobile       Expo SDK 58 · las mismas pantallas en versión móvil
packages/core     @tt/core   · dominio, casos de uso, mappers y geometría de gráficas (TS puro, hexagonal)
packages/tokens   @tt/tokens · paleta clara/oscura y tipografía del diseño
packages/i18n     @tt/i18n   · catálogos es/en y textos derivados
packages/sky-art  @tt/sky-art· escenas del cielo e ilustración de carga, con sus animaciones
docs/             especificación: requerimientos, casos de uso, arquitectura, datos, pruebas, despliegue y ADR
```

La lógica se escribe una sola vez en `packages/`; cada app solo aporta su interfaz y sus adaptadores de
plataforma. El porqué de cada decisión está en [`docs/adr/`](docs/adr/).

## Correr en local

Requiere Node 22 o más reciente.

```bash
npm install
cp apps/web/.env.template apps/web/.env          # y llenar las URLs
cp apps/mobile/.env.example apps/mobile/.env
npm run web       # http://localhost:3000
npm run mobile    # Expo: escanear el QR con Expo Go (SDK 58)
```

## Verificar

```bash
npm run typecheck
npm test                          # todos los paquetes y las dos apps
npm run build --workspace=web
npm run build:android             # APK local con eas build --local
```

## Flujo de trabajo

- `main` está protegida: los cambios entran por PR con el check `ci-ok` en verde.
- En un PR, comentar `cicd/deploy-staging-web` o `cicd/deploy-staging-app` publica una vista previa; se borra al
  cerrar el PR.
- Al mergear, se publica en producción solo la app que cambió (web en Cloud Run, móvil por EAS Update). El release
  `mobile-v…` trae el QR para abrir la versión publicada en Expo Go.
- Detalle en [`docs/09-despliegue.md`](docs/09-despliegue.md).

## Documentación

- [`AGENTS.md`](AGENTS.md): guía para retomar el trabajo, reglas de arquitectura y avance por fase.
- [`docs/`](docs/README.md): especificación técnica completa. La tesis toma una versión resumida
  ([`docs/10-notas-tesis.md`](docs/10-notas-tesis.md)).
