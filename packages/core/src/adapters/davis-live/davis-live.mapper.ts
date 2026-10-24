// `wflexp.json` → `LiveReading`. Aquí, y solo aquí, se corrigen las rarezas del dato en vivo
// (docs/06-datos.md): `---` → null, imperial → métrico, orden real de los extremos `hl*`, `bartr` como código
// de tendencia y horas de la consola (reloj de pared en CDMX, pero zona horaria mal configurada: D12). Los datos de red internos (MAC, IP, SSID) no pasan.

import type { Extremes, LiveReading } from '../../domain/live-reading'
import { pressureTrendFromDavisCode } from '../../domain/pressure'
import { MEXICO_CITY_UTC_OFFSET_MINUTES, consoleClockToInstant, instantFromMexicoCityEpochWallTime } from '../../domain/time'
import { fahrenheitToCelsius, inHgToHPa, inchesToMillimeters, mapNullable, mphToKmh } from '../../domain/units'
import { parseNumber } from '../parse'
import type { DavisHighLow, DavisLiveDto } from './davis-live.dto'

const identity = (value: number) => value

export function mapDavisLive(dto: DavisLiveDto, receivedAt: Date = new Date()): LiveReading {
  const observedAt = dto.loctime ? instantFromMexicoCityEpochWallTime(dto.loctime) : receivedAt
  // La consola calcula amanecer y ocaso en la zona que cree tener; los extremos `hl*` van en su reloj de pared.
  const consoleZoneOffsetMinutes =
    dto.loctime && dto.utctime ? (dto.loctime - dto.utctime) / 60 : MEXICO_CITY_UTC_OFFSET_MINUTES
  const atWallClock = (clock: string | null | undefined) =>
    consoleClockToInstant(clock, observedAt, MEXICO_CITY_UTC_OFFSET_MINUTES)
  const atConsoleZone = (clock: string | null | undefined) =>
    consoleClockToInstant(clock, observedAt, consoleZoneOffsetMinutes)

  const fahrenheit = (raw: string | null | undefined) => mapNullable(parseNumber(raw), fahrenheitToCelsius)
  const mph = (raw: string | null | undefined) => mapNullable(parseNumber(raw), mphToKmh)
  const inches = (raw: string | null | undefined) => mapNullable(parseNumber(raw), inchesToMillimeters)

  return {
    observedAt,
    station: {
      name: dto.stnname?.trim() || 'Estación',
      batteryVolts: parseNumber(dto.bat),
      signalDbm: parseNumber(dto.rssi),
      uptimeSeconds: parseNumber(dto.uptime),
    },
    outdoor: {
      temperatureC: fahrenheit(dto.tempout),
      humidityPct: parseNumber(dto.humout),
      dewPointC: fahrenheit(dto.dew),
      heatIndexC: fahrenheit(dto.heat),
      windChillC: fahrenheit(dto.chill),
    },
    indoor: {
      temperatureC: fahrenheit(dto.tempin),
      humidityPct: parseNumber(dto.humin),
    },
    wind: {
      speedKmh: mph(dto.windspd),
      avg2MinKmh: mph(dto.windavg2),
      avg10MinKmh: mph(dto.windavg10),
      gustKmh: mph(dto.gust),
      directionDeg: parseNumber(dto.winddir),
      gustDirectionDeg: parseNumber(dto.gustdir),
    },
    pressure: {
      seaLevelHPa: mapNullable(parseNumber(dto.bar), inHgToHPa),
      trend: pressureTrendFromDavisCode(parseNumber(dto.bartr)),
    },
    rain: {
      rateMmH: inches(dto.rainr),
      last15MinMm: inches(dto.rain15),
      lastHourMm: inches(dto.rain1h),
      todayMm: inches(dto.raind),
      last24hMm: inches(dto.rain24),
      stormMm: inches(dto.storm),
      monthMm: inches(dto.rainmon),
      yearMm: inches(dto.rainyear),
    },
    sun: {
      sunrise: atConsoleZone(dto.sunrt),
      sunset: atConsoleZone(dto.sunst),
    },
    forecastRule: parseNumber(dto.forrule),
    extremes: {
      outdoorTemperatureC: mapExtremes(dto.hltempout, fahrenheitToCelsius, atWallClock),
      outdoorHumidityPct: mapExtremes(dto.hlhumout, identity, atWallClock),
      seaLevelPressureHPa: mapExtremes(dto.hlbar, inHgToHPa, atWallClock),
    },
  }
}

function mapExtremes(
  highLow: DavisHighLow | undefined,
  convert: (value: number) => number,
  atWallClock: (clock: string | null | undefined) => Date | null,
): Extremes {
  const value = (index: number) => mapNullable(parseNumber(highLow?.[index]), convert)
  return {
    today: { low: value(0), high: value(1), lowAt: atWallClock(highLow?.[2]), highAt: atWallClock(highLow?.[3]) },
    month: { high: value(4), low: value(5) },
    year: { high: value(6), low: value(7) },
  }
}
