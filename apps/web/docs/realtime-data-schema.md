# Weather Dashboard — Esqueleto de datos en tiempo real

Fuente: consola Davis WeatherLink (`wflexp.json`), consultada vía `/api/weather` (proxy de Next.js).
Es **una sola foto del instante actual**, no una serie: para graficar evolución en el tiempo hay que acumularla en el cliente o usar el endpoint histórico.
Frecuencia de refresco usada en la app: 60 s – 5 min (la consola actualiza ~cada 2.5 s – 1 min según el sensor).

## Reglas generales

- **Unidades imperiales**: °F, mph, inHg, in (pulgadas de lluvia). La conversión a métrico se hace al mostrar (`°C = (F-32)·5/9`, `km/h = mph·1.60934`, `hPa = inHg·33.8639`, `mm = in·25.4`).
- Casi todos los valores llegan como **string**. Un sensor ausente o sin lectura llega como `"---"` → tratarlo como `null`.
- **Sensores NO instalados en esta estación** (siempre `"---"`): `uv`, `solar`, `thsw`, `xt*`, `xlt*`, `xst*`, `xh*`, `xsm*`, `xlw*`, `et*` (ET en 0). No diseñar gráficas para ellos.
- Dirección del viento: **grados 0–360** (en el histórico es rosa de 16 vientos, aquí no).
- Datos de red de la estación (`mac`, `ip`, `ssid`) son internos: no mostrarlos en UI pública.

## Ejemplo de payload crudo (recortado, identificadores reemplazados)

```json
{
  "stnname": "Liz",
  "mac": "XX:XX:XX:XX:XX:XX",
  "ip": "10.x.x.x",
  "ssid": "Wi-Fi ...",
  "rssi": -57,
  "wflver": "2.41",
  "uptime": 92,
  "lastboot": 1791868333,
  "loctime": 1791850423,
  "utctime": 1791868423,
  "tzone": 7,
  "units": 189,

  "tempout": "60.4",
  "humout": "91",
  "tempin": "72.1",
  "humin": "58",
  "dew": "58",
  "chill": "60",
  "heat": "61",

  "windspd": "0.0",
  "winddir": "268",
  "windavg2": "0.0",
  "windavg10": "0.0",
  "gust": "2.0",
  "gustdir": "227",

  "bar": "22.753",
  "bartr": "0",

  "rainr": "0.00000",
  "storm": "0.18110",
  "rain15": "0.00000",
  "rain1h": "0.00000",
  "raind": "0.00000",
  "rain24": "0.18110",
  "rainmon": "0.99212",
  "rainyear": "18.70075",

  "bat": "4.72",
  "foreico": "3",
  "forrule": "192",
  "sunrt": "7:31",
  "sunst": "19:16",

  "hltempout": ["60.5", "60.7", "0:07", "0:00", "80.9", "56.1", "91.8", "37.1"],
  "hlhumout":  ["91", "91", "0:00", "0:00", "95", "43", "98", "3"],
  "hlbar":     ["22.752", "22.756", "0:12", "0:00", "22.800", "22.517", "30.491", "22.517"]
}
```

## Variables por grupo

### Exterior

| Campo | Unidad | Ejemplo | Notas |
|---|---|---|---|
| `tempout` | °F | `"60.4"` | Temperatura exterior |
| `humout` | % | `"91"` | |
| `dew` | °F | `"58"` | Punto de rocío (entero). `cdew` es el mismo con decimales |
| `chill` | °F | `"60"` | Sensación por viento. Solo relevante con viento y frío |
| `heat` | °F | `"61"` | Índice de calor. Solo relevante con calor/humedad |

Sensación térmica: la app usa `heat ?? chill`. Si ambos son `"---"` usar `tempout`.

### Interior

`tempin` (°F), `humin` (%).

### Viento

| Campo | Unidad | Notas |
|---|---|---|
| `windspd` | mph | Instantáneo |
| `winddir` | ° | 0 = N, 90 = E. Con calma puede quedar el último valor |
| `windavg2` / `windavg10` | mph | Promedio 2 y 10 min (más estables para mostrar) |
| `gust` | mph | Ráfaga máxima reciente |
| `gustdir` | ° | Dirección de la ráfaga |

Gráficas posibles: brújula con aguja (`winddir`) + marcador de ráfaga (`gustdir`); barra de velocidad con escala Beaufort; comparar `windspd` vs `windavg2` vs `windavg10`.

### Presión

| Campo | Unidad | Notas |
|---|---|---|
| `bar` | inHg | `22.753` inHg = 770 hPa = 578 mmHg: **presión de estación** (~2240 m), no a nivel del mar |
| `bartr` | ? | Tendencia. En la muestra es `"0"`. **Semántica sin confirmar**: el dashboard web lo trata como código (umbral 20) y la app Expo como delta de presión en inHg. Verificar con valores distintos de 0 antes de diseñar |

### Lluvia (todas en pulgadas, acumulados)

| Campo | Ventana |
|---|---|
| `rainr` | Intensidad instantánea (in/h) |
| `rain15` | Últimos 15 min |
| `rain1h` | Última hora |
| `raind` | Hoy (desde medianoche) |
| `rain24` | Últimas 24 h |
| `storm` | Tormenta actual |
| `rainmon` | Mes |
| `rainyear` | Año |

Gráficas posibles: barras comparativas por ventana (15 min / 1 h / 24 h / mes / año); indicador de intensidad `rainr`.

### Astronomía

`sunrt`, `sunst`: strings `"H:MM"` hora local 24 h (`"7:31"`, `"19:16"`). Parsear a minutos para dibujar la trayectoria solar y calcular progreso del día.

### Estación

`bat` (V batería, `"4.72"`), `rssi` (dBm, más cercano a 0 = mejor), `uptime`, `lastboot` (epoch), `loctime`/`utctime` (epoch s), `tzone`, `wflver`.

### Máximos y mínimos `hl*`

Arrays de 8 posiciones, para `hltempout`, `hltempin`, `hlhumout`, `hlhumin`, `hlbar`, `hlwind`, `hldew`, `hlchil`, `hlheat`, `hlrainr`:

| Índice | Significado observado |
|---|---|
| 0, 1 | Mínimo / máximo de una ventana corta (con hora en 2 y 3). Ventana exacta sin confirmar |
| 4 | **Máximo del día** |
| 5 | **Mínimo del día** |
| 6 | **Máximo del mes** |
| 7 | **Mínimo del mes** |

⚠️ Esto es lo observado en la muestra (`hltempout[4]=80.9 > [5]=56.1`). El mapper actual (`weather.mapper.ts`) asigna `dayLow = data[4]` y `dayHigh = data[5]`, o sea **máximo y mínimo están invertidos**. Lo mismo con `monthLow/monthHigh`.

## Forecast (pronóstico del propio equipo)

Es el único bloque que **no es una medición**: la consola Davis calcula internamente un pronóstico cualitativo (~12–24 h) a partir de presión, tendencia, viento y temperatura, y lo entrega como **dos códigos numéricos** que hay que decodificar con un `switch`.

| Campo | Ejemplo | Qué es |
|---|---|---|
| `forrule` | `"192"` | Regla de pronóstico, entero **0 – 194**. Se traduce a una frase |
| `foreico` | `"3"` | Icono de pronóstico (bitmask Davis VP2: despejado, parcialmente nublado, nublado, con lluvia, con nieve…). Convención Davis, valores exactos por confirmar |

### Cómo se decodifica

Existe un decodificador en `../expoApp/src/core/domain/utils/ForecastDecoder.ts`: `decodeForecastRule(frule: number): string`, un `switch` de 195 casos que devuelve texto en inglés.

```ts
decodeForecastRule(192)
// "Mostly cloudy and cooler. Precipitation possible within 12 hours, possibly heavy at times. Windy."
```

Casos especiales:

| Código | Resultado |
|---|---|
| `193` | `"Forecast requires 3 hrs of recent data to generate accurate trends."` (la consola acaba de arrancar) |
| fuera de 0–194 | `"Condition data temporarily unavailable."` |

### Estructura de la frase (útil para diseñar)

Las 195 reglas son combinaciones de pocos componentes. Muchas son idénticas ("Partly cloudy with little temperature change." aparece decenas de veces):

| Componente | Valores |
|---|---|
| Cielo | Mostly clear · Partly cloudy · Increasing clouds · Mostly cloudy · Clearing |
| Temperatura | cooler · warmer · little temperature change |
| Precipitación | ninguna · possible · likely · continuing · ending, con ventana (6 / 6–12 / 12 / 12–24 / 24 / 24–48 hrs) y a veces "possibly heavy at times" |
| Viento | Windy · Increasing winds · Possible wind shift to W, NW, or N |

### Qué se puede mostrar (y qué no)

- **Sí**: una descripción breve y cualitativa ("Cielo parcialmente nublado, sin cambios de temperatura") como tarjeta de texto, con el icono derivado de `foreico`.
- **No**: probabilidades, temperaturas pronosticadas ni horas exactas. La regla es aproximada, no un modelo numérico.
- **Ojo**: la app Expo muestra una línea de tiempo de 5 horas con temperatura, probabilidad de lluvia y viento **inventados (mock)**; solo el texto del decodificador es real. No copiar esa tira como si fuera pronóstico.
- El decodificador solo da inglés; la app es bilingüe ES/EN. Para traducir conviene que devuelva una estructura (`sky`, `temp`, `precip`, `window`, `windy`, `windShift`) y componer la frase por idioma, en vez de 195 frases completas.
- Estado actual en este repo: `forecast.rule` y `forecast.icon` ya llegan en `WeatherEntity` pero **ninguna tarjeta los usa**.
