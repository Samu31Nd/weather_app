# 14 · Mantenimiento y traspaso

Qué hace falta para que el sistema siga funcionando cuando cambie quien lo mantiene: qué cuentas y accesos hay que
entregar, qué tareas se repiten, cómo actualizar las piezas que envejecen y qué hacer cuando algo falla. Complementa
el anexo operativo [09 · Despliegue](09-despliegue.md), que describe el CI/CD en detalle.

## Inventario: de qué depende la app

| Pieza | Dónde vive | Quién la administra hoy | Qué pasa si se pierde el acceso |
|-------|------------|--------------------------|---------------------------------|
| Código | GitHub `Samu31Nd/weather_app` | El autor (dueño del repo) | Nadie puede mergear a `main` ni cambiar variables del CI; se puede hacer *fork*, pero hay que reconfigurar todo el CI/CD |
| Web | Cloud Run, proyecto GCP `estacion-meteorologica-b033-2` (`us-central1`), servicios `weather-web` y `weather-web-staging` | Cuenta de facturación del proyecto | La web sigue en línea mientras la facturación siga activa, pero no se puede desplegar |
| Infraestructura como código | Terraform en `proj-files/infra` (fuera de este repo) | El autor | Hay que recrear a mano Cloud Run, Artifact Registry y la federación de identidad |
| Móvil (actualizaciones y builds) | EAS, proyecto `@samu31nds-team/tt-b033` | Equipo de Expo `samu31nds-team` | Las apps instaladas siguen funcionando con la última versión, pero no reciben actualizaciones |
| Token del CI para EAS | Secreto `EXPO_TOKEN` del repo (robot user con rol Developer) | Equipo de Expo | Fallan los jobs móviles de `staging.yml` y `release.yml` |
| Dato en vivo | Consola Davis Vantage Vue en la red de ESCOM | Responsable de la estación | La app muestra "sin conexión"; el histórico sigue |
| Histórico | Cloud Function `obtener-datos-clima` y el pipeline ELT (en `proj-files`) | Responsable del pipeline | "Histórico" deja de cargar días nuevos; la caché local conserva los ya vistos |
| Diseño | Canvas de Claude Design "Estación meteorológica" (ver `AGENTS.md`) | El autor | Sin él no se pueden extraer escenas nuevas; el arte actual ya está en `@tt/sky-art` |

### Lista para el traspaso

Al entregar el proyecto a una nueva persona responsable (o a la ESCOM):

- [ ] **GitHub:** transferir el repositorio a una organización institucional o agregar a la nueva persona como
      *admin*. Al transferirlo, revisar que la federación de identidad de GCP (WIF) siga apuntando al nombre nuevo
      del repo: está restringida a este repo (`proj-files/infra/web_hosting.tf`).
- [ ] **GCP:** dar a la nueva persona el rol *Owner* (o *Editor* + *Billing*) del proyecto, y confirmar quién paga
      la cuenta de facturación. Crear la alerta de presupuesto de 1 USD, que sigue pendiente.
- [ ] **Expo/EAS:** invitarla al equipo `samu31nds-team` como *Owner*, o transferir el proyecto a otra cuenta. Si
      cambia de cuenta, generar un `EXPO_TOKEN` nuevo y guardarlo en los secretos del repo.
- [ ] **Terraform:** entregar `proj-files/infra` y su estado (`*.tfstate`) por un canal privado. **Nunca** por el
      repo: contiene datos sensibles.
- [ ] **Consola Davis:** contacto de quien tiene acceso físico y de red a la estación.
- [ ] **Variables:** revisar que las variables de GitHub (*Settings → Secrets and variables → Actions*) y las de
      EAS (`eas env:list --environment production`) sigan siendo correctas.
- [ ] **Firma del APK:** EAS guarda el *keystore* de Android del proyecto. Sin él, un APK nuevo no puede
      actualizar al instalado (Android lo trata como otra app). Descargar un respaldo con `eas credentials`.

## Tareas periódicas

| Cada… | Tarea | Cómo |
|-------|-------|------|
| Mes | Revisar que producción responde | Abrir la web; `curl -s <web>/api/live` debe dar JSON; abrir "Histórico" de 7 días |
| Mes | Revisar costos | Consola de facturación de GCP (esperado ≈ 0 USD, ver [09](09-despliegue.md#costos-estimados-rnf-app-11)) |
| Semestre | Revisar que las fuentes no cambiaron de forma | `npm run test:contract --workspace=@tt/core` con las URLs reales |
| Semestre | Actualizar dependencias menores | Abajo |
| Año (o cuando Expo Go deje de abrir la app) | Migrar al SDK nuevo de Expo | Abajo |
| Versión de la app | Revisión con TalkBack | Lista manual de [08](08-calidad-pruebas.md#accesibilidad-rnf-app-05) |

## Actualizar dependencias

```bash
npm outdated                          # en la raíz: qué está atrasado en cada workspace
npm update                            # solo versiones compatibles (^ y ~)
npm run typecheck && npm test && npm run build --workspace=web
```

- Para la app móvil, usa `npx expo install --check` desde `apps/mobile`: Expo sabe qué versiones van con el SDK y
  las versiones "más nuevas" de npm suelen romperlo.
- React, `@types/react` y TypeScript deben tener **la misma versión en las dos apps**; si no, npm instala dos
  copias y aparecen errores de tipos raros.
- Si cambia una dependencia nativa (cualquier cosa con código Android/iOS), la app instalada no la recibe por EAS
  Update: hace falta un APK nuevo y subir `version` en `app.json` (`runtimeVersion` sigue a `appVersion`).

## Actualizar el SDK de Expo

Expo Go solo abre proyectos del SDK más reciente, así que esto se vuelve obligatorio aproximadamente una vez al año.
La migración de 57 a 58 dejó estas lecciones:

1. Lee la guía de migración y el *changelog* del SDK nuevo en <https://docs.expo.dev>.
2. En `apps/mobile`: `npx expo install expo@^<nuevo>` y luego `npx expo install --fix`.
3. **Regenera `package-lock.json` desde cero** (borra `node_modules` y el lock en la raíz, `npm install`). Si no,
   npm deja copias viejas de reanimated/worklets en la raíz y TypeScript toma la versión vieja de React Native.
4. Alinea `react`, `react-dom` y `@types/react` en `apps/web` con la versión que pide el SDK.
5. `npx expo-doctor` desde `apps/mobile` y corrige lo que reporte.
6. Corre todo (`typecheck`, `test`, `build` de la web, `npx expo export --platform android`) y abre la app en
   Expo Go y en un APK de prueba. Revisa APIs que suelen cambiar (en el 58 cambió `tabBar` de Expo Router).
7. Sube `version` en `app.json`: el SDK nuevo cambia el código nativo, así que hace falta un APK nuevo.
8. Actualiza las versiones en `AGENTS.md`, `apps/mobile/AGENTS.md` y [12 · Implementación](12-implementacion.md).

## Cambios de configuración frecuentes

| Cambio | Dónde |
|--------|-------|
| Cambió la IP o URL de la consola | Variable `NEXT_PUBLIC_API_URL` del repo (la usa el build de la web) y volver a desplegar la web (merge a `main` o *re-run* de `release.yml`). La móvil no cambia: usa el proxy |
| Cambió la URL de la Cloud Function | Variable `NEXT_PUBLIC_API_CLOUD_URL` del repo **y** `EXPO_PUBLIC_HISTORY_API_URL` en EAS (`eas env:update`); redesplegar web y publicar una actualización móvil |
| Cambió la URL de la web | `MOBILE_WEATHER_STATION_URL` del repo y `EXPO_PUBLIC_WEATHER_STATION_URL` en EAS |
| El pipeline corrigió datos viejos (por ejemplo, D5) | Subir `HISTORY_CACHE_PREFIX` en `cached-history.repository.ts` a `wx-history-v2:` |
| Venció o se filtró `EXPO_TOKEN` | Crear otro token del robot user en expo.dev y reemplazar el secreto del repo |
| Renovar la vista previa de staging | Comentar otra vez `cicd/deploy-staging-web` o `cicd/deploy-staging-app` en el PR |

## Cuando algo falla en producción

| Síntoma | Dónde mirar | Qué hacer |
|---------|-------------|-----------|
| "Ahora" dice "sin conexión" para todos | `curl <web>/api/live`: 504 = la consola no responde; 502 = respondió con error; 500 = falta la URL | Revisar la consola (energía, red del IPN) o la variable de la URL |
| "Ahora" funciona en local pero no en producción | Logs del servicio en Cloud Run (`gcloud run services logs read weather-web`) | Ver si la URL llegó al build |
| "Histórico" no carga | Abrir la URL de la Cloud Function con `?vista=vw_clean_weather&date_start=…&date_end=…` | Si falla ahí, es del pipeline, no de la app |
| El histórico tiene huecos | [06 · Datos](06-datos.md) (D7, D8) | Días perdidos o el día de hoy: es lo esperado; se dibujan como cortes |
| La rosa de los vientos se ve rara | D5 | Pendiente del pipeline (abajo) |
| El CI falla sin cambios propios | La pestaña *Actions* del PR | Volver a correr; si persiste, puede ser una acción o versión de Node que cambió |
| Un despliegue rompió producción | — | *Rollback* según [09](09-despliegue.md#rollback) y luego revertir el commit con un PR |
| La app instalada no recibe un cambio | Canal `production` en expo.dev | Si el cambio es nativo, necesita APK nuevo; si no, revisar que `release.yml` publicó |

## Pendientes conocidos

Lo que quedó fuera del alcance y conviene retomar:

- **D5 en el pipeline:** en las filas de la captura automática, `wind_dir` y `hi_dir` vienen intercambiados. Se
  corrige en el `INSERT` del pipeline y migrando esas filas; después, subir el prefijo de la caché.
- **D12 en la consola:** su zona horaria está en UTC−5. La app ya lo compensa; si alguien la corrige a UTC−6, la
  app sigue funcionando sin cambios.
- **Alerta de presupuesto** en GCP (1 USD): la debe crear quien administre la facturación.
- **Pruebas e2e** con Playwright: están en la estrategia de [08](08-calidad-pruebas.md) pero aún no se escriben.
- **Ideas:** fases de la luna calculadas por fecha (la consola no las publica); un paquete `@tt/react` con los hooks
  compartidos; iOS (el código es multiplataforma, pero nunca se compiló ni probó un binario de iOS).
