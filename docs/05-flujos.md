# 05 · Flujos

## Dato en vivo (CU-01, CU-02)

```mermaid
sequenceDiagram
  autonumber
  actor U as Usuario
  participant UI as Pantalla "Ahora"
  participant UC as GetLiveWeather
  participant R as ProxyLiveHttpAdapter
  participant P as /api/live (Next)
  participant C as Consola Davis

  U->>UI: abre la app
  UI->>UI: muestra la pantalla de carga
  loop cada 60 s, o al pulsar "Actualizar"
    UI->>UC: execute()
    UC->>R: getCurrent()
    R->>P: GET /api/live (HTTPS)
    alt hay caché de menos de 10 s
      P-->>R: JSON de la caché
    else
      P->>C: GET /wflexp.json (HTTP, timeout 8 s)
      C-->>P: JSON crudo (imperial, strings)
      P-->>R: JSON crudo + cabecera Date
    end
    R->>R: mapper: "---" → null, imperial → métrico, hl* con su orden
    R-->>UC: LiveReading
    UC-->>UI: LiveReading
    UI->>UI: ResolveSkyScene + convierte a la unidad elegida + pinta
  end
  Note over UI: si falla: conserva la última lectura y muestra "sin conexión"
```

## Histórico (CU-04, CU-05)

```mermaid
sequenceDiagram
  autonumber
  actor I as Investigador
  participant UI as Pantalla "Histórico"
  participant GH as GetHistory
  participant HR as CloudHistoryHttpAdapter
  participant F as Cloud Function
  participant BC as BuildChartSeries / SummarizeHistory

  I->>UI: elige periodo y resolución
  UI->>GH: execute(range)
  GH->>GH: parte el rango en tramos de 10 días o menos
  par por cada tramo
    GH->>HR: getSamples(tramo)
    HR->>F: GET ?vista=vw_clean_weather&date_start=…&date_end=…
    F-->>HR: {total, data[]} (descendente, strings)
    HR->>HR: mapper: parse, fecha+hora en CDMX, mmHg → hPa, corrección de dirección
  end
  GH->>GH: une, quita duplicados por instante, ordena ascendente
  GH-->>UI: HistorySeries
  UI->>BC: serie + resolución + unidades
  BC-->>UI: puntos de la gráfica + KPIs
  UI->>UI: dibuja las gráficas SVG
  opt descargar
    I->>UI: CSV / JSON
    UI->>UI: ExportHistory → descarga o menú de compartir
  end
```

## Cambio de preferencias (CU-06)

```mermaid
sequenceDiagram
  actor U as Usuario
  participant S as Panel de ajustes
  participant PP as PreferencesProvider
  participant UP as UpdatePreferences
  participant PR as PreferencesRepository<br/>(localStorage | AsyncStorage)

  U->>S: cambia el tema / idioma / unidades / tamaño
  S->>PP: update({ theme: "dark" })
  PP->>UP: execute(patch)
  UP->>UP: valida y combina con los valores por defecto
  UP->>PR: save(prefs)
  UP-->>PP: prefs
  PP->>PP: aplica: web → class en <html> / --font-scale / lang; móvil → Appearance + FontScaleContext
```

## Estados de la pantalla "Ahora"

```mermaid
stateDiagram-v2
  [*] --> Cargando
  Cargando --> Mostrando: primera lectura OK
  Cargando --> SinConexion: falla la primera consulta
  Mostrando --> Actualizando: tick de 60 s o botón
  Actualizando --> Mostrando: OK
  Actualizando --> SinConexionConDato: falla
  Mostrando --> Desactualizado: lectura de más de 2 min
  Desactualizado --> Actualizando: tick o botón
  SinConexionConDato --> Actualizando: tick o botón
  SinConexion --> Cargando: reintentar
```

## Staging por comentario y release (CU-09, CU-10)

```mermaid
sequenceDiagram
  autonumber
  actor M as Mantenedor
  participant GH as GitHub (PR)
  participant A as Actions
  participant CR as Cloud Run
  participant E as EAS Update

  M->>GH: comenta "cicd/deploy-staging-web" o "cicd/deploy-staging-app"
  GH->>A: issue_comment
  A->>A: ¿autor con permisos? ¿ci-ok en verde en el head del PR?
  alt web
    A->>CR: deploy weather-web-staging --tag pr-N --no-traffic
    CR-->>A: https://pr-N---weather-web-staging-….run.app
  else app
    A->>E: eas update --branch pr-N
    E-->>A: QR / URL de Expo Go
  end
  A->>GH: comenta el enlace y registra el Deployment
  M->>GH: merge a main
  GH->>A: push a main → CI → release
  A->>CR: weather-web 100 % del tráfico (si cambió web)
  A->>E: eas update --channel production (si cambió móvil)
  GH->>A: pull_request closed
  A->>CR: quita el tag pr-N
  A->>E: borra la rama pr-N
```
