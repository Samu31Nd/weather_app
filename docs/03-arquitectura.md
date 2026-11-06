# 03 · Arquitectura

Se sigue el modelo C4 de forma ligera: contexto → contenedores → componentes. La regla central es la
**arquitectura hexagonal**: el dominio no conoce React, HTTP ni almacenamiento, y todo eso entra por puertos.

## Nivel 1 · Contexto

```mermaid
flowchart TB
  comunidad["👤 Comunidad ESCOM"]
  investigador["👤 Estudiante / investigador"]

  app["<b>App de la estación</b><br/>web (Next.js) y móvil (Expo)"]

  consola[("Consola Davis<br/>wflexp.json · HTTP")]
  fn["Cloud Function<br/>obtener-datos-clima"]
  pipeline["Pipeline ELT en GCP<br/>(proj-files)"]

  comunidad -->|consulta el clima| app
  investigador -->|consulta histórico, descarga| app
  app -->|dato en vivo, cada 60 s| consola
  app -->|histórico, HTTPS| fn
  pipeline -->|llena la BD que lee| fn
  pipeline -->|captura diaria| consola
```

La app **solo lee**. El pipeline ELT (fuera de este repo) es el único que escribe en la base de datos.

## Nivel 2 · Contenedores

```mermaid
flowchart LR
  subgraph cliente["Dispositivos del usuario"]
    browser["Navegador<br/>React (Next.js client)"]
    phone["App móvil<br/>Expo / React Native"]
  end

  subgraph servidor["Servidor web"]
    next["Servidor Next.js<br/>SSR + route handlers"]
    proxy["/api/live<br/>proxy del dato en vivo"]
    next --- proxy
  end

  consola[("Consola Davis<br/>HTTP, sin CORS")]
  fn["Cloud Function histórico<br/>HTTPS, CORS *"]

  browser -->|HTTPS| next
  browser -->|HTTPS /api/live| proxy
  browser -->|HTTPS| fn
  proxy -->|HTTP| consola
  phone -->|"HTTPS /api/live (por defecto)"| proxy
  phone -.->|"HTTP directo (opcional, red local)"| consola
  phone -->|HTTPS| fn
```

- **Por qué hay proxy.** La consola solo habla HTTP y no manda cabeceras CORS. Un navegador servido por HTTPS no
  puede llamarla. El proxy además oculta la IP de la consola y le baja la carga con caché de unos segundos
  ([ADR-0007](adr/0007-proxy-dato-en-vivo.md)).
- **El histórico va directo a la Cloud Function.** Ya tiene CORS abierto, así que no hay que pasarlo por el
  servidor.
- **El móvil usa el proxy por defecto.** Así evita configurar excepciones de *cleartext* en Android e iOS y
  funciona fuera de la red del IPN. La conexión directa queda como opción por variable de entorno.

## Nivel 3 · Componentes (hexagonal)

Las flechas se leen "depende de". Todas apuntan hacia el núcleo, y dentro de él, hacia el dominio.

```mermaid
flowchart TB
  subgraph apps["Apps (React)"]
    direction LR
    web["apps/web<br/>pantallas · providers · hooks<br/>proxy /api/live"]
    mobile["apps/mobile<br/>pantallas · providers · hooks<br/>widget de Android"]
  end

  subgraph presentacion["Paquetes de presentación"]
    direction LR
    i18n["@tt/i18n<br/>catálogos es/en · formato<br/>textos derivados"]
    tokens["@tt/tokens<br/>paleta · tipografía"]
    art["@tt/sky-art<br/>escenas · animaciones"]
  end

  subgraph core["@tt/core (TypeScript puro)"]
    direction TB
    container["createCore<br/>composition root"]
    aplicacion["Aplicación<br/>GetLiveWeather · GetHistory · ResolveCurrentSky<br/>Get/UpdatePreferences · liveStatus<br/>buildCurrentConditions · buildHistoryView · exportHistory"]
    charts["charts/<br/>escalas · trazos SVG · medidores"]
    adaptadores["Adaptadores<br/>HttpLiveWeatherRepository + mapper Davis<br/>HttpHistoryRepository + mapper del histórico<br/>CachedHistoryRepository · KeyValuePreferencesRepository"]
    puertos["Puertos<br/>LiveWeatherRepository · HistoryRepository<br/>PreferencesRepository · KeyValueStorage · Clock"]
    dominio["Dominio<br/>LiveReading · HistorySample · unidades · viento<br/>sensación térmica · pronóstico · escena del cielo"]
  end

  web --> container
  mobile --> container
  web --> presentacion
  mobile --> presentacion
  presentacion --> aplicacion
  container --> aplicacion
  container --> adaptadores
  aplicacion --> charts
  aplicacion --> puertos
  adaptadores -. implementan .-> puertos
  charts --> dominio
  puertos --> dominio
  adaptadores --> dominio
```

- **Plataforma.** Las apps solo aportan el almacén clave-valor (`localStorage` en web, AsyncStorage en móvil) que
  `createCore` usa para las preferencias y la caché del histórico, y la URL de cada fuente.
- **El proxy `/api/live`** no usa el núcleo: reenvía el JSON de la consola sin datos de red. El mapper corre en el
  cliente, igual que con la consola directa.
- **Recorrido por el código** de cada flujo, con los nombres de archivo: [12 · Implementación](12-implementacion.md).

### Regla de dependencias

| Desde \ hacia | dominio | aplicación | puertos | adaptadores | React / plataforma |
|---|---|---|---|---|---|
| **dominio** | ✓ | ✗ | ✗ | ✗ | ✗ |
| **aplicación** | ✓ | ✓ | ✓ | ✗ | ✗ |
| **adaptadores** (`core`) | ✓ | ✗ | ✓ | ✓ | ✗ (solo `fetch` estándar) |
| **apps** | ✓ | ✓ | ✓ | ✓ | ✓ |

La prueba `packages/core/test/architecture.test.ts` lo hace cumplir: lee cada archivo de `packages/core/src` y falla
si importa algo que no sea un archivo propio (nada de `react`, `react-native`, `next`, `expo` ni librerías, salvo
`hyparquet-writer`, aprobada por ADR-0012), o si el dominio importa de las otras capas.

### Composición (DI)

Cada app arma sus dependencias en un **composition root** (`apps/web/lib/core.ts`, `apps/mobile/src/lib/core.ts`):
`createCore({ liveUrl, historyUrl, storage })` devuelve los casos de uso ya conectados. Un provider de React los
reparte con `useCore()`. En los tests, `createCore` recibe dobles (`liveRepository`, `historyRepository`, un reloj
fijo) en lugar de los adaptadores reales.

## Despliegue

La arquitectura no depende de dónde se publique cada app. El servidor web solo necesita un runtime de Node que
pueda hacer HTTP saliente. El hosting y la entrega actuales se describen en el anexo operativo
[09 · Despliegue](09-despliegue.md).
