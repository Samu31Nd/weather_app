// Raw CSV row structure from the weather station API
// Headers: Date,Time,Temp Units,Bar Units,Wind Units,Rain Units,Temp Out,Hi Temp,Low Temp,Rain,Rain Rate,BAR,Solar Rad.,In Temp,In Hum,Out Hum,Wind Speed,Hi Speed,Hi Dir,Wind Dir,UV Index,ET,Hi Solar Rad.,Hi UV
export interface HistoricalCsvRow {
  Date: string           // "19:04:2026" (DD:MM:YYYY format)
  Time: string           // "00:15"
  'Temp Units': string   // "C"
  'Bar Units': string    // "mm"
  'Wind Units': string   // "km/h"
  'Rain Units': string   // "mm"
  'Temp Out': string     // "19"
  'Hi Temp': string      // "19"
  'Low Temp': string     // "19"
  'Rain': string         // "0.00"
  'Rain Rate': string    // "0.00"
  'BAR': string          // "768.6"
  'Solar Rad.': string   // "---"
  'In Temp': string      // "24"
  'In Hum': string       // "25"
  'Out Hum': string      // "34"
  'Wind Speed': string   // "3.2"
  'Hi Speed': string     // "11.3"
  'Hi Dir': string       // "NW"
  'Wind Dir': string     // "NNW"
  'UV Index': string     // "---"
  'ET': string           // "---"
  'Hi Solar Rad.': string // "---"
  'Hi UV': string        // "---"
}

// Parsed and cleaned historical data point
export interface HistoricalDataPoint {
  timestamp: Date
  date: string
  time: string
  units: {
    temp: string
    bar: string
    wind: string
    rain: string
  }
  outdoor: {
    temperature: number | null
    highTemp: number | null
    lowTemp: number | null
    humidity: number | null
  }
  indoor: {
    temperature: number | null
    humidity: number | null
  }
  wind: {
    speed: number | null
    direction: string
    highSpeed: number | null
    highDirection: string
  }
  barometer: {
    pressure: number | null
  }
  rain: {
    amount: number | null
    rate: number | null
  }
  solar: {
    radiation: number | null
    highRadiation: number | null
    uvIndex: number | null
    highUv: number | null
  }
}
