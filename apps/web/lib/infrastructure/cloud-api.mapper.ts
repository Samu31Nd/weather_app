// Mappers to transform Cloud API DTOs to domain entities

import type {
  TemperatureDto,
  WindDto,
  RainDto,
  PressureDto,
  CleanWeatherDto,
} from './cloud-api.dto'

import type {
  TemperatureEntity,
  WindEntity,
  RainEntity,
  PressureEntity,
  CleanWeatherEntity,
} from '../domain/historical-weather.entity'

function parseNumber(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '' || value === '---') return null
  const parsed = parseFloat(value)
  return isNaN(parsed) ? null : parsed
}

function parseDate(dateStr: string): Date {
  return new Date(dateStr)
}

export function mapTemperatureDto(dto: TemperatureDto): TemperatureEntity {
  return {
    id: dto.id,
    fecha: parseDate(dto.fecha),
    hora: dto.hora,
    temperatura_exterior: parseNumber(dto.temp_exterior),
    temperatura_interior: parseNumber(dto.temp_interior),
    humedad_exterior: parseNumber(dto.humedad_exterior),
    humedad_interior: parseNumber(dto.humedad_interior),
    sensacion_termica: parseNumber(dto.temp_max),
  }
}

export function mapWindDto(dto: WindDto): WindEntity {
  return {
    id: dto.id,
    fecha: parseDate(dto.fecha),
    hora: dto.hora,
    velocidad_kmh: parseNumber(dto.velocidad_kmh),
    rafaga_kmh: parseNumber(dto.rafaga_kmh),
    direccion: dto.direccion,
    direccion_rafaga: dto.direccion_rafaga,
  }
}

export function mapRainDto(dto: RainDto): RainEntity {
  return {
    id: dto.id,
    fecha: parseDate(dto.fecha),
    hora: dto.hora,
    lluvia_mm: parseNumber(dto.lluvia_mm),
    tasa_lluvia: parseNumber(dto.tasa_mm_hr),
  }
}

export function mapPressureDto(dto: PressureDto): PressureEntity {
  return {
    id: dto.id,
    fecha: parseDate(dto.fecha),
    hora: dto.hora,
    presion_hpa: parseNumber(dto.presion_hpa),
    tendencia: dto.tendencia,
  }
}

export function mapCleanWeatherDto(dto: CleanWeatherDto): CleanWeatherEntity {
  return {
    id: dto.id,
    fecha: parseDate(dto.fecha),
    hora: dto.hora,
    temperatura_exterior: parseNumber(dto.temp_out),
    temperatura_interior: parseNumber(dto.in_temp),
    humedad_exterior: parseNumber(dto.out_hum_pct),
    humedad_interior: parseNumber(dto.in_hum_pct),
    velocidad_kmh: parseNumber(dto.wind_speed),
    rafaga_kmh: parseNumber(dto.hi_speed),
    direccion: dto.wind_dir,
    presion_hpa: parseNumber(dto.bar),
    lluvia_mm: parseNumber(dto.rain),
    tasa_lluvia: parseNumber(dto.rain_rate),
  }
}
