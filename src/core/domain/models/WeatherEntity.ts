// Domain Layer - Weather Entity (Core Business Model)
// This represents the clean domain model independent of external data sources

export interface WeatherEntity {
  // Station Information
  station: {
    name: string
    mac: string
    ip: string
    ssid: string
    signalStrength: number
    firmwareVersion: string
    batteryVoltage: number
    uptime: number
    lastBoot: number
  }

  // Outdoor Conditions
  outdoor: {
    temperature: number | null
    humidity: number | null
    dewPoint: number | null
    windChill: number | null
    heatIndex: number | null
  }

  // Indoor Conditions
  indoor: {
    temperature: number | null
    humidity: number | null
  }

  // Wind Data
  wind: {
    speed: number | null
    direction: number | null
    gust: number | null
    average2min: number | null
    average10min: number | null
    gustDirection: number | null
  }

  // Barometric Pressure
  barometer: {
    pressure: number | null
    trend: number
  }

  // Precipitation
  rain: {
    rate: number | null
    daily: number | null
    hourly: number | null
    last24h: number | null
    monthly: number | null
    yearly: number | null
    storm: number | null
  }

  // Astronomy
  astronomy: {
    sunrise: string
    sunset: string
  }

  // Forecast
  forecast: {
    icon: number
    rule: number
  }

  // Historical High/Low Data
  historical: {
    barometer: HistoricalRange
    wind: HistoricalRange
    outdoorTemp: HistoricalRange
    outdoorHumidity: HistoricalRange
    indoorTemp: HistoricalRange
    indoorHumidity: HistoricalRange
  }

  // Timestamps
  timestamps: {
    local: number
    utc: number
    timezone: number
  }
}

export interface HistoricalRange {
  low: number | null
  high: number | null
  lowTime: string
  highTime: string
  dayLow: number | null
  dayHigh: number | null
  monthLow: number | null
  monthHigh: number | null
}

// Port - Interface for fetching weather data (to be implemented by adapters)
export interface WeatherRepository {
  fetchWeatherData(): Promise<WeatherEntity>
}
