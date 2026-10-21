# Weather Dashboard — Esqueleto de datos históricos

Estación meteorológica Davis (Ciudad de México aprox., ~2240 m de altitud). Una muestra cada **15 minutos** (~96 filas/día).
Los datos vienen de una Cloud Function que expone 5 "vistas" de la base de datos.

## Reglas generales (aplican a todas las vistas)

- Respuesta: `{ "total": number, "data": Row[] }`
- Orden: **descendente** (más reciente primero).
- Tope duro: **1000 filas** por consulta (~10 días).
- `fecha` es ISO UTC a medianoche (solo la fecha); la hora real va en `hora` (`"HH:MM:SS"`). Timestamp completo = `fecha` (día) + `hora`.
- **Todos los valores numéricos llegan como string** (`"15"`, `"0.00"`) y hay que parsearlos. Pueden ser `null`.
- Ya vienen en **unidades métricas** (°C, km/h, mm, mm/h). No hay conversión que hacer salvo para mostrar imperial.
- Modos de consulta: `days=N` (últimos N días desde hoy), `specific_date=YYYY-MM-DD`, `date_start` + `date_end`.

## 1. `vw_temperatura`

```json
{
  "total": 95,
  "data": [
    {
      "id": 15605,
      "fecha": "2026-10-10T00:00:00.000Z",
      "hora": "23:45:00",
      "temp_exterior": "15",
      "temp_max": "15",
      "temp_min": "15",
      "temp_interior": "22",
      "humedad_exterior": "91",
      "humedad_interior": "57"
    }
  ]
}
```

| Campo | Unidad | Rango observado (1 día) | Notas |
|---|---|---|---|
| `temp_exterior` | °C | 14 – 22 | Temperatura exterior promedio del intervalo |
| `temp_max` | °C | 14 – 22 | Máxima del intervalo de 15 min (**no** sensación térmica) |
| `temp_min` | °C | 14 – 22 | Mínima del intervalo de 15 min |
| `temp_interior` | °C | 20 – 22 | Sensor interior, casi constante |
| `humedad_exterior` | % | 62 – 93 | Se mueve inverso a la temperatura |
| `humedad_interior` | % | 56 – 65 | |

Gráficas posibles: línea temp exterior con banda min/max; línea doble exterior vs interior; humedad como eje secundario; área de humedad.

## 2. `vw_viento`

```json
{
  "total": 95,
  "data": [
    {
      "id": 15605,
      "fecha": "2026-10-10T00:00:00.000Z",
      "hora": "23:45:00",
      "velocidad_kmh": "0.0",
      "rafaga_kmh": "0.0",
      "direccion": null,
      "direccion_rafaga": null
    }
  ]
}
```

| Campo | Tipo | Valores |
|---|---|---|
| `velocidad_kmh` | km/h | 0.0 – ~5 (1 día); la ráfaga llega a ~21 |
| `rafaga_kmh` | km/h | 0.0 – 20.9, pasos de 1.6 (0.0, 1.6, 3.2, 4.8, 6.4, 8.0 …) |
| `direccion` | rosa de 16 vientos | `N, NNE, NE, ENE, E, ESE, SE, SSE, S, SSW, SW, WSW, W, WNW, NW, NNW` o `null` |
| `direccion_rafaga` | igual | igual, o `null` |

- `direccion` es `null` cuando hay calma (velocidad 0): ~40 % de las filas en la muestra. Tratar `null` como "calma", no como dato faltante.
- La dirección es **categórica**, no grados.

Gráficas posibles: línea velocidad + ráfaga; rosa de los vientos (conteo o velocidad media por dirección); barras de frecuencia por dirección; heatmap hora × dirección.

## 3. `vw_lluvia`

```json
{
  "total": 95,
  "data": [
    {
      "id": 15605,
      "fecha": "2026-10-10T00:00:00.000Z",
      "hora": "23:45:00",
      "lluvia_mm": "0.00",
      "tasa_mm_hr": "0.00"
    }
  ]
}
```

| Campo | Unidad | Notas |
|---|---|---|
| `lluvia_mm` | mm | Lluvia **por intervalo de 15 min**, no acumulada. Pasos de 0.2 mm (resolución del pluviómetro), 0.00 – 1.40 en la muestra |
| `tasa_mm_hr` | mm/h | Intensidad instantánea, 0.00 – ~16 |

- Se obtiene el acumulado diario sumando `lluvia_mm` (**la API no lo da**).
- Mayoría de filas en `0.00`: datos muy esparcidos.

Gráficas posibles: barras de `lluvia_mm`; línea de acumulado (calculada); barras por hora/día; tasa como línea secundaria.

## 4. `vw_presion`

```json
{
  "total": 95,
  "data": [
    {
      "id": 15605,
      "fecha": "2026-10-10T00:00:00.000Z",
      "hora": "23:45:00",
      "presion_hpa": "577.6",
      "variacion_hpa": "-0.1",
      "tendencia": "Descendente"
    }
  ]
}
```

| Campo | Notas |
|---|---|
| `presion_hpa` | 573.7 – 577.9 en la muestra. **El nombre dice hPa pero el valor está en mmHg** (la vista clean lo confirma con `bar_units: "mm"`; 577 mmHg ≈ 770 hPa, consistente con ~2240 m de altitud). Es presión de estación, no al nivel del mar |
| `variacion_hpa` | Cambio contra la muestra previa. `-0.4 … 0.4`, string |
| `tendencia` | Categórica: `"Creciente"`, `"Descendente"`, `"Estable"` |

Gráficas posibles: línea de presión con eje Y acotado (cambia poco, no iniciar en 0); barras divergentes de variación; color/marcador por tendencia.

## 5. `vw_clean_weather` (todo en una sola fila)

```json
{
  "total": 95,
  "data": [
    {
      "id": 15605,
      "fecha": "2026-10-10T00:00:00.000Z",
      "hora": "23:45:00",
      "temp_out": "15",
      "hi_temp": "15",
      "low_temp": "15",
      "in_temp": "22",
      "in_hum_pct": "57",
      "out_hum_pct": "91",
      "rain": "0.00",
      "rain_rate": "0.00",
      "bar": "577.6",
      "wind_speed": "0.0",
      "hi_speed": "0.0",
      "hi_dir": null,
      "wind_dir": null,
      "temp_units": "C",
      "bar_units": "mm",
      "wind_units": "km/h",
      "rain_units": "mm"
    }
  ]
}
```

Equivalencias con las otras vistas:

| `vw_clean_weather` | Equivale a |
|---|---|
| `temp_out`, `hi_temp`, `low_temp`, `in_temp` | `temp_exterior`, `temp_max`, `temp_min`, `temp_interior` |
| `out_hum_pct`, `in_hum_pct` | `humedad_exterior`, `humedad_interior` |
| `wind_speed`, `hi_speed` | `velocidad_kmh`, `rafaga_kmh` |
| `wind_dir`, `hi_dir` | `direccion`, `direccion_rafaga` |
| `rain`, `rain_rate` | `lluvia_mm`, `tasa_mm_hr` |
| `bar` | `presion_hpa` (mmHg) |
| `*_units` | Unidades literales, siempre `C`, `mm`, `km/h`, `mm` |

Útil para correlaciones entre variables (temperatura vs humedad, presión vs lluvia) porque comparten fila/timestamp.

## Transformaciones recomendadas antes de graficar

1. Parsear strings a `number`; mapear `null` / `""` / `"---"` a `null`.
2. Construir timestamp: `fecha.slice(0,10) + 'T' + hora`.
3. Ordenar ascendente por timestamp.
4. Para rangos de varios días, agregar (promedio/max/min por hora o día) para no pasar de ~1000 puntos.
5. Para lluvia, calcular acumulado con suma corrida.
