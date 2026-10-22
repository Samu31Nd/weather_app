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

```mermaid
flowchart TB
  subgraph core["packages/core (TS puro)"]
    direction TB
    subgraph dominio["Dominio"]
      ent["Entidades<br/>LiveReading · HistorySeries"]
      vo["Value objects<br/>Temperature · Speed · Pressure · Rain<br/>Beaufort · CompassPoint · SkyScene"]
      reglas["Reglas puras<br/>sensación térmica · punto de rocío<br/>ForecastDecoder · SkySceneRules · KPIs"]
    end
    subgraph aplicacion["Aplicación (casos de uso)"]
      uc1["GetLiveWeather"]
      uc2["GetHistory"]
      uc3["ResolveSkyScene"]
      uc4["BuildChartSeries"]
      uc5["Get/UpdatePreferences"]
      uc6["ExportHistory"]
    end
    subgraph puertos["Puertos"]
      p1["LiveWeatherRepository"]
      p2["HistoryRepository"]
      p3["PreferencesRepository"]
      p4["Clock"]
    end
    subgraph adaptadoresComunes["Adaptadores compartidos"]
      a1["DavisLiveHttpAdapter + mapper"]
      a2["ProxyLiveHttpAdapter"]
      a3["CloudHistoryHttpAdapter + mapper"]
    end
    charts["charts/<br/>escalas · ticks · paths · rosa"]
  end

  subgraph web["apps/web (Next.js)"]
    wui["UI web<br/>componentes + SVG/CSS"]
    wctx["Providers<br/>Container · Preferences · Theme"]
    wroute["Route handler /api/live"]
    wstore["LocalStoragePreferences"]
  end

  subgraph mobile["apps/mobile (Expo)"]
    mui["UI móvil<br/>componentes + react-native-svg / reanimated"]
    mctx["Providers<br/>Container · Preferences · FontScale"]
    mstore["AsyncStoragePreferences"]
  end

  tokens["packages/tokens"]
  i18n["packages/i18n"]

  aplicacion --> dominio
  aplicacion --> puertos
  adaptadoresComunes -. implementa .-> p1
  adaptadoresComunes -. implementa .-> p2
  wstore -. implementa .-> p3
  mstore -. implementa .-> p3

  wui --> wctx --> aplicacion
  wui --> charts
  wui --> tokens
  wui --> i18n
  wroute --> a1
  mui --> mctx --> aplicacion
  mui --> charts
  mui --> tokens
  mui --> i18n
```

### Regla de dependencias

| Desde \ hacia | dominio | aplicación | puertos | adaptadores | React / plataforma |
|---|---|---|---|---|---|
| **dominio** | ✓ | ✗ | ✗ | ✗ | ✗ |
| **aplicación** | ✓ | ✓ | ✓ | ✗ | ✗ |
| **adaptadores** (`core`) | ✓ | ✗ | ✓ | ✓ | ✗ (solo `fetch` estándar) |
| **apps** | ✓ | ✓ | ✓ | ✓ | ✓ |

Una regla de lint (`no-restricted-imports`) lo hace cumplir en `packages/core`: no se permite importar `react`,
`react-native`, `next/*` ni `expo*`.

### Composición (DI)

Cada app arma sus dependencias en un **composition root**:
`createContainer({ liveUrl, historyUrl, preferencesRepository, clock })` devuelve los casos de uso ya conectados.
Un provider de React los reparte. En los tests se llama a `createContainer` con dobles (repositorios en memoria,
reloj fijo) en lugar de los adaptadores reales.

## Despliegue

La arquitectura no depende de dónde se publique cada app. El servidor web solo necesita un runtime de Node que
pueda hacer HTTP saliente. El hosting y la entrega actuales se describen en el anexo operativo
[09 · Despliegue](09-despliegue.md).
