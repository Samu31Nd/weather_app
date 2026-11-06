// Lectura en vivo como texto, para guardarla en un almacén clave-valor y volver a dibujarla sin red (el widget de
// Android y la app la conservan entre ejecuciones). `JSON.stringify` deja las fechas en ISO; al leerla se vuelven
// `Date` solo las que el modelo declara. Un texto dañado o de otra versión da `null`, nunca una lectura a medias.

import type { Extremes, LiveReading } from '../domain/live-reading'

export function serializeLiveReading(reading: LiveReading): string {
  return JSON.stringify(reading)
}

export function parseLiveReading(raw: string): LiveReading | null {
  try {
    const data = JSON.parse(raw) as LiveReading
    const observedAt = toDate(data.observedAt)
    if (observedAt === null || !data.station || !data.outdoor || !data.wind || !data.rain || !data.sun || !data.extremes) return null
    return {
      ...data,
      observedAt,
      sun: { sunrise: toDate(data.sun.sunrise), sunset: toDate(data.sun.sunset) },
      extremes: {
        outdoorTemperatureC: reviveExtremes(data.extremes.outdoorTemperatureC),
        outdoorHumidityPct: reviveExtremes(data.extremes.outdoorHumidityPct),
        seaLevelPressureHPa: reviveExtremes(data.extremes.seaLevelPressureHPa),
      },
    }
  } catch {
    return null
  }
}

function reviveExtremes(extremes: Extremes): Extremes {
  return { ...extremes, today: { ...extremes.today, lowAt: toDate(extremes.today.lowAt), highAt: toDate(extremes.today.highAt) } }
}

function toDate(value: unknown): Date | null {
  if (typeof value !== 'string' && !(value instanceof Date)) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
