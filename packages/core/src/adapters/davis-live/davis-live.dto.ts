// Forma cruda de `wflexp.json` (consola Davis WeatherLink). Solo los campos que usa la app; el resto
// (sensores no instalados, datos de red internos) se ignora a propósito. Ver docs/06-datos.md.

type Raw = string | null | undefined

/** Arreglo de 8 posiciones: [mín. hoy, máx. hoy, hora mín., hora máx., máx. mes, mín. mes, máx. año, mín. año]. */
export type DavisHighLow = readonly Raw[]

export interface DavisLiveDto {
  readonly stnname?: string
  readonly rssi?: number
  readonly uptime?: number
  readonly loctime?: number
  readonly utctime?: number
  readonly bat?: Raw
  readonly tempout?: Raw
  readonly humout?: Raw
  readonly tempin?: Raw
  readonly humin?: Raw
  readonly dew?: Raw
  readonly chill?: Raw
  readonly heat?: Raw
  readonly windspd?: Raw
  readonly winddir?: Raw
  readonly windavg2?: Raw
  readonly windavg10?: Raw
  readonly gust?: Raw
  readonly gustdir?: Raw
  readonly bar?: Raw
  readonly bartr?: Raw
  readonly rainr?: Raw
  readonly rain15?: Raw
  readonly rain1h?: Raw
  readonly raind?: Raw
  readonly rain24?: Raw
  readonly storm?: Raw
  readonly rainmon?: Raw
  readonly rainyear?: Raw
  readonly forrule?: Raw
  readonly sunrt?: Raw
  readonly sunst?: Raw
  readonly hltempout?: DavisHighLow
  readonly hlhumout?: DavisHighLow
  readonly hlbar?: DavisHighLow
}
