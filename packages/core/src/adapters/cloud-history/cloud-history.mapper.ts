// Fila de `vw_clean_weather` → `HistorySample`. Corrige: texto → número, mmHg → hPa (D2) y fecha + hora de
// Ciudad de México → instante (D9). Las columnas de dirección se leen tal cual: el intercambio
// `wind_dir`/`hi_dir` (D5) se corrige en el pipeline, no en la app.

import type { HistorySample } from '../../domain/history'
import { instantFromMexicoCityWallTime } from '../../domain/time'
import { mapNullable, mmHgToHPa } from '../../domain/units'
import { type CompassPoint, isCompassPoint } from '../../domain/wind'
import { parseNumber } from '../parse'
import type { CleanWeatherRowDto } from './cloud-history.dto'

export function mapCleanWeatherRow(row: CleanWeatherRowDto): HistorySample {
  return {
    at: instantFromMexicoCityWallTime(row.fecha, row.hora),
    temperatureC: parseNumber(row.temp_out),
    temperatureMaxC: parseNumber(row.hi_temp),
    temperatureMinC: parseNumber(row.low_temp),
    indoorTemperatureC: parseNumber(row.in_temp),
    humidityPct: parseNumber(row.out_hum_pct),
    indoorHumidityPct: parseNumber(row.in_hum_pct),
    windKmh: parseNumber(row.wind_speed),
    gustKmh: parseNumber(row.hi_speed),
    windDirection: parseCompassPoint(row.wind_dir),
    gustDirection: parseCompassPoint(row.hi_dir),
    rainMm: parseNumber(row.rain),
    rainRateMmH: parseNumber(row.rain_rate),
    seaLevelPressureHPa: mapNullable(parseNumber(row.bar), mmHgToHPa),
  }
}

function parseCompassPoint(value: string | null): CompassPoint | null {
  const normalized = value?.trim().toUpperCase() ?? ''
  return isCompassPoint(normalized) ? normalized : null
}
