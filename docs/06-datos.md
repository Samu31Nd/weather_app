# 06 · Datos

Hay dos fuentes y las dos son de solo lectura. El detalle de campos con ejemplos está en
`apps/web/docs/realtime-data-schema.md` y `apps/web/docs/historical-data-schema.md`. Este documento resume lo que
la app necesita y **corrige lo que cambió** desde entonces.

Verificado contra los endpoints reales el 2026-10-21 y el 2026-10-24 (fase 1).

## Dato en vivo · `wflexp.json` (consola Davis)

- **Transporte:** HTTP sin CORS. Se consulta por el proxy `/api/live` (ver [ADR-0007](adr/0007-proxy-dato-en-vivo.md)).
- **Formato:** una foto del instante actual, no una serie. Unidades **imperiales**, casi todo como *string*, y
  `---` cuando no hay dato.

| Grupo | Campos que usa la app | Unidad de origen → canónica |
|-------|-----------------------|-----------------------------|
| Exterior | `tempout`, `humout`, `dew`, `chill`, `heat` | °F → °C · % |
| Interior | `tempin`, `humin` | °F → °C · % |
| Viento | `windspd`, `windavg2`, `windavg10`, `gust`, `winddir`, `gustdir` | mph → km/h · grados |
| Presión | `bar`, `bartr`, `hlbar` | inHg → hPa |
| Lluvia | `rainr`, `rain15`, `rain1h`, `raind`, `rain24`, `storm`, `rainmon`, `rainyear` | in, in/h → mm, mm/h |
| Sol | `sunrt`, `sunst` | `"H:MM"` hora local |
| Pronóstico | `forrule` (0–194), `foreico` | código |
| Extremos | `hltempout`, `hlhumout`, `hlbar`, … (8 posiciones: hoy, mes y año; ver D1) | igual que su variable |
| Estación | `stnname`, `bat`, `rssi`, `uptime`, `loctime` | V · dBm · s · epoch |

**Datos que no se usan:**
- `mac`, `ip` y `ssid` son datos internos y no se muestran nunca (RF-APP-05).
- `uv`, `solar`, `thsw`, `et*`, `xt*`, etc. corresponden a sensores que la estación no tiene.

## Histórico · Cloud Function `obtener-datos-clima`

- **Transporte:** HTTPS con `CORS *`, sin autenticación. La URL se toma de una variable de entorno, porque cambia
  si la función se redespliega.
- **Parámetros:** `vista` y uno de estos filtros, aplicados en este orden de precedencia:
  `date_start[&date_end]`, `days`, `specific_date`.
- **Respuesta:** `{ total, data[] }`, ordenada de la más nueva a la más vieja, con **tope de 1000 filas**
  (unos 10 días), una fila cada 15 min y números como *string*.
- **Unidades:** métricas. Temperatura en °C, viento en km/h, lluvia en mm y mm/h, y presión en **mmHg**.

| Vista | Columnas |
|-------|----------|
| `vw_clean_weather` | `id, fecha, hora, temp_out, hi_temp, low_temp, in_temp, in_hum_pct, out_hum_pct, rain, rain_rate, bar, wind_speed, hi_speed, hi_dir, wind_dir, temp_units, bar_units, wind_units, rain_units, bar_ajuste_mmhg` |
| `vw_temperatura` | `id, fecha, hora, temp_exterior, temp_max, temp_min, temp_interior, humedad_exterior, humedad_interior` |
| `vw_viento` | `id, fecha, hora, velocidad_kmh, rafaga_kmh, direccion, direccion_rafaga` |
| `vw_lluvia` | `id, fecha, hora, lluvia_mm, tasa_mm_hr` |
| `vw_presion` | `id, fecha, hora, presion_hpa, variacion_hpa, tendencia, ajuste_mmhg` |

La app usa **`vw_clean_weather`**, que trae todo en una fila, para no hacer 4 consultas por tramo. Las demás vistas
se documentan como referencia.

## Rarezas y dónde se corrigen

Todas se corrigen en el mapper correspondiente de `packages/core`, y cada una tiene su test.

| # | Rareza | Corrección | Estado |
|---|--------|------------|--------|
| D1 | Los arreglos `hl*` tienen 8 posiciones: **[mín. hoy, máx. hoy, hora mín., hora máx., máx. mes, mín. mes, máx. año, mín. año]**. Los dos mappers previos estaban mal: el web invertía máx. y mín., y los dos leían 4–7 como día y mes | `davis-live.mapper` usa el orden real (verificado con la lectura del 24-oct y con `hlbar`, cuyo mínimo del mes y del año es el valor sin corregir de antes del 20-oct) | Corregido en `@tt/core` |
| D2 | `presion_hpa` y `bar` del histórico vienen en **mmHg**, aunque el nombre diga hPa | Convertir mmHg → hPa (× 1.33322) | Confirmado (`bar_units: "mm"`) |
| D3 | **Presión corregida.** Desde el 2026-07-03, la calibración de la consola (`BARCAL`) bajaba `bar` 192.1 mmHg. Las vistas suman `ajuste_mmhg` y desde el 2026-10-20 la consola ya entrega el valor bueno. Hoy las dos fuentes dan unos 770 mmHg (unos 1027 hPa), un valor **reducido a nivel del mar**, comparable con METAR. **No es** la presión de estación (unos 578 mmHg a 2240 m), que mostraba la documentación vieja | La app etiqueta la presión como "a nivel del mar". Plausible: 740–790 mmHg; fuera de ese rango se trata como sospechosa | Confirmado: vivo `bar=30.430` inHg, histórico `bar=770.9` |
| D4 | `bartr` es el **código Davis de tendencia**, no un delta: −60 baja rápido, −20 baja lento, 0 estable, 20 sube lento, 60 sube rápido | Mapear a `PressureTrend` | Confirmado: `bartr=60` con presión subiendo |
| D5 | En las filas de la captura automática, `wind_dir` y `hi_dir` vienen **intercambiados** (el INSERT guarda `Hi Dir` en `wind_dir`). Las filas importadas en julio y agosto están bien. La API no expone el origen de cada fila, así que no hay forma fiable de saber cuáles corregir | **Se corrige en el pipeline**, no en la app: arreglar el INSERT y migrar los datos. La app lee las columnas tal cual | Confirmado en `proj-files/docs/RECONCILIACION.md`; pendiente en el pipeline |
| D6 | `days=N` corta a medianoche UTC, no de Ciudad de México | No se usa `days`; siempre `date_start` y `date_end` | Decisión |
| D7 | El histórico llega con **un día de retraso** (la captura corre a las 01:00) | Avisar en la UI si el rango incluye hoy (CU-04 A2) | Por diseño del pipeline |
| D8 | Días perdidos para siempre: 2026-09-07, 09-15 y 09-16. Algunos días tienen menos de 96 filas | Los huecos se dibujan como cortes; nunca se interpolan | Por diseño |
| D9 | `fecha` llega como ISO a medianoche UTC; la hora real está en `hora` | El instante se arma con `fecha[0..10] + hora` en America/Mexico_City | Decisión |
| D10 | El dato en vivo trae `---` en sensores ausentes | Se convierte a `null` | Ya existe `parseValue` |
| D11 | `date_start`/`date_end` aceptan `YYYY-MM-DD`, `YYYY-MM-DD HH:mm:ss` y `YYYY-MM-DDTHH:mm[:ss]`. Se comparan contra `fecha + hora` como hora de pared de CDMX, con **ambos extremos incluidos** (08:00–10:00 da 9 filas) | `HttpHistoryRepository` manda la hora de pared de CDMX y `GetHistory` quita el duplicado en la unión de tramos | Confirmado (la prueba anterior consultaba un día que aún no llegaba, por D7) |
| D12 | El **reloj de pared** de la consola (`loctime`, horas de `hl*`) marca bien la hora de CDMX, pero su **zona horaria está configurada en UTC−5** (horario de verano abolido en 2022). Por eso `utctime` sale **1 h atrasado** y el amanecer y ocaso que calcula (`sunrt`, `sunst`) salen **1 h adelantados** (consola 7:35; real ≈ 06:35) | El instante sale de `loctime` como hora de CDMX; los `hl*` se leen como hora de CDMX; amanecer y ocaso se corrigen con el desfase que la consola cree tener (`loctime − utctime`), así que siguen bien si alguien arregla la consola | Confirmado el 24-oct comparando con el reloj del sistema. **Recomendado:** poner la consola en UTC−6 sin horario de verano |
| D13 | Las horas del histórico vienen del reloj de pared de la consola, que es correcto (D12). Coincide con que la mínima del 19-oct sea a las 06:15, justo antes del amanecer real | Ninguna | Probable; confirmar en el pipeline |

## Escena del cielo

Viene de la nota `skyMap` del canvas de diseño. Las capas se evalúan **en orden** y una capa posterior puede
reemplazar la escena que eligió una anterior.

| Capa | Entrada | Regla | Escena |
|------|---------|-------|--------|
| 1. Hora del día | `sunrt`, `sunst`, hora actual | ±50 min del amanecer → amanecer; ±50 min del ocaso → atardecer; entre ambos → día; si no → noche | base `clearDay` / `clearNight` / `dawn` / `twilight` |
| 2. Cielo | texto de `forrule` | "Mostly clear" → despejado · "Partly cloudy" → `partly` · "Increasing clouds" → `increasing` · "Mostly cloudy" → `cloudy` (de noche `nightCloudy`) · "Clearing" o "Precipitation ending" → `clearing` | |
| 3. Lluvia (manda la medición) | `rainr` (mm/h) | 0 < r < 0.5 → `drizzle` · r ≥ 0.5 → `rain` (de noche `nightRain`) · r ≥ 7.6, o "possibly heavy at times" con lluvia medida → `storm` · sin lluvia medida pero con "Precipitation likely/continuing" → `likely` | |
| 4. Viento | texto, ráfaga | "Windy" / "Increasing winds" o ráfaga ≥ 29 km/h → `windy` · "Possible wind shift to the W, NW, or N" → `windShift` | |
| 5. Temperatura | texto | Solo con cielo despejado o parcial: "warmer" → `warmer`; "cooler" → `cooler` | |
| 6. Neblina | humedad, temperatura, rocío, hora | humedad ≥ 90 % y (temperatura − rocío) < 2.5 °C, de noche o al amanecer y sin lluvia → `fog` | |
| 7. Sistema | `forrule`, conexión | regla 193 → `calibrating`; código fuera de 0–194 o la consola no responde → `offline` | |

Hay 21 escenas. Cada una tiene su artboard `project/Sky*.dc.html` y un caso de prueba que la produce
(RF-APP-03).

## Interpretación de variables (RF-APP-04)

Los umbrales que se usen en los textos de ayuda se documentan aquí antes de implementarlos:

| Variable | Rangos para el texto | Fuente |
|----------|---------------------|--------|
| Humedad relativa | < 30 % seca · 30–60 % cómoda · 60–80 % húmeda · > 80 % muy húmeda | Uso común (ASHRAE) |
| Diferencia temperatura − rocío | < 2.5 °C: probable neblina o rocío | Nota `skyMap` |
| Confort interior | 20–24 °C y 40–60 % = cómodo | ASHRAE 55 (simplificado) |
| Beaufort | Tabla oficial 0–12 con su descripción | OMM |
| Tendencia de presión | Sube → mejora probable · baja → empeora probable · estable | Davis / convención |
