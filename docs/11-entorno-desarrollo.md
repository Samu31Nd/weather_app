# 11 · Entorno de desarrollo

Cómo dejar una computadora lista para correr, probar y modificar las dos apps. No hace falta experiencia previa
con Expo ni con Next.js: cada paso dice qué hace y cómo saber que salió bien.

## Lo que se necesita

| Herramienta | Versión | Para qué | ¿Obligatoria? |
|-------------|---------|----------|---------------|
| Git | cualquiera reciente | Clonar el repo y trabajar en ramas | Sí |
| Node.js | 22 o más reciente (`engines` del `package.json` raíz) | Correr todo: apps, tests, scripts | Sí |
| npm | el que trae Node | Instalar dependencias (el repo usa *npm workspaces*, ADR-0003) | Sí |
| Editor | VS Code recomendado (`.vscode/extensions.json` sugiere extensiones) | Editar con TypeScript y autocompletado | Recomendado |
| Expo Go | la que corresponde al **SDK 58** (tiendas de Android/iOS) | Abrir la app móvil en un teléfono sin compilarla | Para móvil |
| JDK 17 + Android SDK | (por ejemplo, con Android Studio) | Compilar el APK en local | Solo para el APK |
| EAS CLI | `npm i -g eas-cli` | Compilar el APK, publicar actualizaciones, ver variables de EAS | Solo para el APK y la operación |
| `gh` (GitHub CLI) | cualquiera reciente | Abrir PR y revisar el CI desde la terminal | Opcional |

No hace falta instalar pnpm, yarn, Docker ni Java para desarrollar: solo para el APK (Java) o para probar la
imagen de producción de la web (Docker).

## Primeros pasos

```bash
git clone https://github.com/Samu31Nd/weather_app.git
cd weather_app
npm install            # en la raíz: instala las dos apps y los cuatro paquetes de una vez
```

`npm install` siempre se corre **en la raíz**, nunca dentro de `apps/web` o `apps/mobile`. Los *workspaces*
enlazan los paquetes `@tt/*` dentro de `node_modules/@tt/`, así que las apps los importan como si fueran
librerías publicadas, pero leen el código fuente directo (no hay paso de compilación de los paquetes).

### Variables de entorno

Cada app lee su propio `.env`. Las plantillas están versionadas y los valores reales **nunca** se commitean:

```bash
cp apps/web/.env.template apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env
```

| App | Variable | Valor |
|-----|----------|-------|
| web | `NEXT_PUBLIC_API_URL` | URL base de la consola Davis (termina en `/`; el proxy le agrega `wflexp.json`). Alternativa: `LIVE_STATION_URL` con la URL completa de `wflexp.json` |
| web | `NEXT_PUBLIC_API_CLOUD_URL` | URL de la Cloud Function `obtener-datos-clima` |
| móvil | `EXPO_PUBLIC_WEATHER_STATION_URL` | El proxy de la web: `https://<servicio>.run.app/api/live`. En desarrollo también puede ser la consola directa (`http://<ip>/wflexp.json`), porque Expo Go permite HTTP |
| móvil | `EXPO_PUBLIC_HISTORY_API_URL` | La misma Cloud Function de la web |

Las URLs vigentes las tiene quien opera el sistema; las de producción también están en las variables del
repositorio de GitHub (*Settings → Secrets and variables → Actions*) y en las variables de entorno de EAS
(`eas env:list --environment production`). Todas son URLs públicas, no secretos. Lo que **sí** es secreto
(`EXPO_TOKEN`, el estado de Terraform de `proj-files`) no se copia nunca al repo.

> **Sin acceso a la consola.** La consola Davis está en la red del IPN. Desde fuera, apunta la app móvil al proxy
> de producción y la web a una copia de `wflexp.json` servida localmente. Por ejemplo, con
> `python3 -m http.server 8080 -d packages/core/test/fixtures` y
> `LIVE_STATION_URL=http://localhost:8080/wflexp-2026-10-24.json` en `apps/web/.env`, "Ahora" muestra esa lectura
> real del 24-oct. El histórico sí es accesible desde cualquier red.

## Correr las apps

```bash
npm run web       # Next.js en http://localhost:3000 (recarga al guardar)
npm run mobile    # Expo: muestra un QR
```

- **Web.** Abre <http://localhost:3000>. Debe aparecer la pantalla de carga y luego "Ahora". Si se queda en
  "sin conexión", revisa `NEXT_PUBLIC_API_URL`: <http://localhost:3000/api/live> debe responder JSON.
- **Móvil.** Escanea el QR con Expo Go (Android) o con la cámara (iOS); el teléfono y la computadora deben estar en
  la misma red. Si no lo están, `npx expo start --tunnel` desde `apps/mobile`. Las variables `EXPO_PUBLIC_*` se
  leen al iniciar el servidor: después de cambiar `.env`, reinicia con `npx expo start -c` (borra la caché de
  Metro).
- **Widget de Android.** No existe en Expo Go (es código nativo, ADR-0011). Para verlo hay que instalar un APK.

## Verificar antes de subir cambios

Son los mismos pasos que corre el CI (`.github/workflows/ci.yml`):

```bash
npm run typecheck                 # TypeScript en los seis workspaces
npm test                          # todas las pruebas (core con umbral de cobertura)
npm run build --workspace=web     # compila la web de producción
```

Comandos útiles para trabajar en una parte:

```bash
npm test --workspace=@tt/core              # o @tt/i18n, @tt/tokens, @tt/sky-art, web, mobile
npx vitest --root packages/core            # modo watch: corre de nuevo al guardar
npx vitest run --root packages/core test/domain/wind.test.ts   # un solo archivo
npm test --workspace=mobile -- now-screen  # jest: filtra por nombre de archivo
npm run test:contract --workspace=@tt/core # contra las fuentes reales (necesita red y URLs)
```

## Compilar el APK

Solo hace falta para probar el widget o una dependencia nativa; los demás cambios llegan a la app instalada por
EAS Update (ver [09 · Despliegue](09-despliegue.md)).

```bash
mkdir -p ~/tmp-build
eas login                                    # cuenta con acceso al proyecto @samu31nds-team/tt-b033
TMPDIR=~/tmp-build npm run build:android     # eas build --local; deja el .apk en apps/mobile/
adb install -r apps/mobile/*.apk
```

`TMPDIR` debe estar en disco: Gradle usa unos 3.5 GB y, si `/tmp` está en RAM, falla con *No space left on
device*. Las URLs del APK salen de las variables de entorno de EAS, no de `.env`.

## Problemas comunes

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| `Cannot find module '@tt/core'` | `npm install` se corrió dentro de una app | Borra `node_modules` de esa app y corre `npm install` en la raíz |
| TypeScript no encuentra `className` en componentes de RN, o hay dos copias de reanimated | `package-lock.json` arrastra versiones viejas tras cambiar de SDK de Expo | Regenera el lock desde cero (ver [14 · Mantenimiento](14-mantenimiento.md#actualizar-el-sdk-de-expo)) |
| Expo Go dice que el proyecto es incompatible | Expo Go solo abre el SDK más reciente | Actualiza Expo Go; si el SDK nuevo ya salió, toca migrar el proyecto |
| La móvil no ve un cambio de `.env` | Metro cachea las `EXPO_PUBLIC_*` | `npx expo start -c` |
| "Ahora" muestra "sin conexión" en local | La consola no es accesible desde tu red | Usa el proxy de producción o un `wflexp.json` local (arriba) |
| El histórico de hoy sale vacío | El pipeline carga los datos con un día de retraso (D7) | Es lo esperado: el periodo termina a la medianoche de hoy |
| El APK abre sin datos | El APK no lee `.env` | Revisa `eas env:list --environment production` |
| `npx expo lint` creó `eslint.config.js` | Ese comando instala ESLint si no existe | Descarta los archivos nuevos si no querías agregar ESLint |
