// Carga de los fixtures reales (ver README.md de esta carpeta).
import { readFileSync } from 'node:fs'
import type { CloudHistoryResponseDto } from '../../src/adapters/cloud-history/cloud-history.dto'
import type { DavisLiveDto } from '../../src/adapters/davis-live/davis-live.dto'

const read = <T>(name: string): T => JSON.parse(readFileSync(new URL(name, import.meta.url), 'utf8')) as T

export const liveFixture = (): DavisLiveDto & Record<string, unknown> => read('./wflexp-2026-10-24.json')
export const historyFixture = (): CloudHistoryResponseDto => read('./clean-weather-2026-10-19.json')
