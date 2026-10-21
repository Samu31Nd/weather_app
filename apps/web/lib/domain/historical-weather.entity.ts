// Domain entities for historical weather data from Cloud Functions API

// Query parameters for historical data
export type HistoricalView = 'vw_clean_weather' | 'vw_temperatura' | 'vw_viento' | 'vw_lluvia' | 'vw_presion'

export type QueryMode = 'specific_date' | 'date_range' | 'last_n_days'

export interface HistoricalQueryParams {
  view: HistoricalView
  mode: QueryMode
  // For specific_date mode
  specificDate?: string // YYYY-MM-DD
  // For date_range mode
  dateStart?: string // ISO 8601
  dateEnd?: string // ISO 8601
  // For last_n_days mode
  days?: number
}

// Base entity for all historical data
export interface BaseHistoricalEntity {
  id: number
  fecha: Date
  hora: string
}

// Temperature view entity
export interface TemperatureEntity extends BaseHistoricalEntity {
  temperatura_exterior: number | null
  temperatura_interior: number | null
  humedad_exterior: number | null
  humedad_interior: number | null
  sensacion_termica: number | null
}

// Wind view entity
export interface WindEntity extends BaseHistoricalEntity {
  velocidad_kmh: number | null
  rafaga_kmh: number | null
  direccion: string | null
  direccion_rafaga: string | null
}

// Rain view entity
export interface RainEntity extends BaseHistoricalEntity {
  lluvia_mm: number | null
  tasa_lluvia: number | null
}

// Pressure view entity
export interface PressureEntity extends BaseHistoricalEntity {
  presion_hpa: number | null
  tendencia: string | null
}

// Clean weather view entity (all data combined)
export interface CleanWeatherEntity extends BaseHistoricalEntity {
  temperatura_exterior: number | null
  temperatura_interior: number | null
  humedad_exterior: number | null
  humedad_interior: number | null
  velocidad_kmh: number | null
  rafaga_kmh: number | null
  direccion: string | null
  presion_hpa: number | null
  lluvia_mm: number | null
  tasa_lluvia: number | null
}

// Union type for all historical entities
export type HistoricalEntity = 
  | TemperatureEntity 
  | WindEntity 
  | RainEntity 
  | PressureEntity 
  | CleanWeatherEntity

// Repository port interface
export interface HistoricalWeatherRepository {
  fetchHistoricalData<T extends HistoricalEntity>(params: HistoricalQueryParams): Promise<{
    total: number
    data: T[]
  }>
}

// Cache key generator
export function generateCacheKey(params: HistoricalQueryParams): string {
  const parts: string[] = [params.view, params.mode]
  
  if (params.specificDate) parts.push(params.specificDate)
  if (params.dateStart) parts.push(params.dateStart)
  if (params.dateEnd) parts.push(params.dateEnd)
  if (params.days) parts.push(String(params.days))
  
  return parts.join('_')
}
