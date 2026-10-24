// Forma cruda de la Cloud Function `obtener-datos-clima` con `vista=vw_clean_weather`. Los números llegan
// como texto, en unidades métricas, y la presión en mmHg (docs/06-datos.md, D2).

type Raw = string | number | null | undefined

export interface CleanWeatherRowDto {
  readonly id: number
  /** ISO a medianoche UTC; solo importa la parte de fecha (D9). */
  readonly fecha: string
  /** `HH:mm:ss` en hora de Ciudad de México. */
  readonly hora: string
  readonly temp_out: Raw
  readonly hi_temp: Raw
  readonly low_temp: Raw
  readonly in_temp: Raw
  readonly in_hum_pct: Raw
  readonly out_hum_pct: Raw
  readonly rain: Raw
  readonly rain_rate: Raw
  readonly bar: Raw
  readonly wind_speed: Raw
  readonly hi_speed: Raw
  readonly wind_dir: string | null
  readonly hi_dir: string | null
}

export interface CloudHistoryResponseDto {
  readonly total: number
  readonly data: readonly CleanWeatherRowDto[]
}
