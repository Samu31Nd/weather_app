// Infrastructure Layer - Mapper
// Transforms API DTO to Domain Entity

import type { WeatherEntity, HistoricalRange } from '../domain/weather.entity'
import type { WeatherApiResponse } from './weather-api.dto'

function parseValue(value: string | undefined | null): number | null {
  if (!value || value === '---' || value === '' || value === 'null') return null
  const parsed = parseFloat(value)
  return isNaN(parsed) ? null : parsed
}

function parseHistoricalRange(data: string[] | undefined): HistoricalRange {
  if (!data || data.length < 8) {
    return {
      low: null,
      high: null,
      lowTime: '--:--',
      highTime: '--:--',
      dayLow: null,
      dayHigh: null,
      monthLow: null,
      monthHigh: null,
    }
  }

  return {
    low: parseValue(data[0]),
    high: parseValue(data[1]),
    lowTime: data[2] || '--:--',
    highTime: data[3] || '--:--',
    dayLow: parseValue(data[4]),
    dayHigh: parseValue(data[5]),
    monthLow: parseValue(data[6]),
    monthHigh: parseValue(data[7]),
  }
}

export function mapApiResponseToEntity(response: WeatherApiResponse): WeatherEntity {
  return {
    station: {
      name: response.stnname || 'Unknown',
      mac: response.mac || '',
      ip: response.ip || '',
      ssid: response.ssid || '',
      signalStrength: response.rssi || 0,
      firmwareVersion: response.wflver || String(response.ver) || '',
      batteryVoltage: parseValue(response.bat) || 0,
      uptime: response.uptime || 0,
      lastBoot: response.lastboot || 0,
    },

    outdoor: {
      temperature: parseValue(response.tempout),
      humidity: parseValue(response.humout),
      dewPoint: parseValue(response.dew),
      windChill: parseValue(response.chill),
      heatIndex: parseValue(response.heat),
    },

    indoor: {
      temperature: parseValue(response.tempin),
      humidity: parseValue(response.humin),
    },

    wind: {
      speed: parseValue(response.windspd),
      direction: parseValue(response.winddir),
      gust: parseValue(response.gust),
      average2min: parseValue(response.windavg2),
      average10min: parseValue(response.windavg10),
      gustDirection: parseValue(response.gustdir),
    },

    barometer: {
      pressure: parseValue(response.bar),
      trend: parseValue(response.bartr) || 20,
    },

    rain: {
      rate: parseValue(response.rainr),
      daily: parseValue(response.raind),
      hourly: parseValue(response.rain1h),
      last24h: parseValue(response.rain24),
      monthly: parseValue(response.rainmon),
      yearly: parseValue(response.rainyear),
      storm: parseValue(response.storm),
    },

    astronomy: {
      sunrise: response.sunrt || '--:--',
      sunset: response.sunst || '--:--',
    },

    forecast: {
      icon: parseValue(response.foreico) || 0,
      rule: parseValue(response.forrule) || 0,
    },

    historical: {
      barometer: parseHistoricalRange(response.hlbar),
      wind: parseHistoricalRange(response.hlwind),
      outdoorTemp: parseHistoricalRange(response.hltempout),
      outdoorHumidity: parseHistoricalRange(response.hlhumout),
      indoorTemp: parseHistoricalRange(response.hltempin),
      indoorHumidity: parseHistoricalRange(response.hlhumin),
    },

    timestamps: {
      local: response.loctime || 0,
      utc: response.utctime || 0,
      timezone: response.tzone || 0,
    },
  }
}
