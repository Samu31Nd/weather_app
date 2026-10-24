// Estado del histórico (CU-04, RF-APP-06…08): periodo, resolución, variables visibles e interiores. Pide las
// lecturas del periodo con `GetHistory` (por tramos) y arma la vista con `buildHistoryView` de @tt/core. Guarda
// cada periodo ya pedido para que volver a él no repita las consultas.

import {
  type HistoryPeriod, type HistorySample, type HistoryVariable, type HistoryView, type Resolution, availableDays, buildHistoryView,
  effectiveDays, periodRange, resolveResolution, startOfMexicoCityDay,
} from '@tt/core'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useCore, usePreferences } from '@/providers/app-providers'

export type HistoryStatus = 'loading' | 'ready' | 'failed'

export interface HistoryState {
  readonly status: HistoryStatus
  readonly view: HistoryView | null
  readonly period: HistoryPeriod
  readonly days: number
  readonly maxDays: number
  readonly resolution: Resolution
  readonly visible: Readonly<Record<HistoryVariable, boolean>>
  readonly showIndoor: boolean
  readonly selectPeriod: (period: HistoryPeriod) => void
  readonly selectResolution: (resolution: Resolution) => void
  readonly toggleVariable: (variable: HistoryVariable) => void
  readonly showAllVariables: () => void
  readonly setShowIndoor: (show: boolean) => void
  readonly retry: () => void
}

const ALL_VISIBLE: Record<HistoryVariable, boolean> = { temperature: true, wind: true, rain: true, pressure: true }

export function useHistory(): HistoryState {
  const core = useCore()
  const { preferences } = usePreferences()
  const [period, setPeriod] = useState<HistoryPeriod>({ kind: 'preset', preset: '7d' })
  const [requestedResolution, setRequestedResolution] = useState<Resolution | null>(null)
  const [visible, setVisible] = useState(ALL_VISIBLE)
  const [showIndoor, setShowIndoor] = useState(true)
  const [samples, setSamples] = useState<readonly HistorySample[] | null>(null)
  const [status, setStatus] = useState<HistoryStatus>('loading')
  const [attempt, setAttempt] = useState(0)
  const cache = useRef(new Map<string, readonly HistorySample[]>())

  const now = core.clock.now()
  // El periodo solo cambia al empezar otro día en CDMX, no con cada render.
  const today = startOfMexicoCityDay(now).getTime()
  const range = useMemo(() => periodRange(period, new Date(today)), [period, today])
  const days = effectiveDays(period, now)
  const resolution = resolveResolution(days, requestedResolution)
  const rangeKey = `${range.start.toISOString()}|${range.end.toISOString()}`

  useEffect(() => {
    const cached = cache.current.get(rangeKey)
    if (cached) {
      setSamples(cached)
      setStatus('ready')
      return
    }
    let current = true
    setStatus('loading')
    core.getHistory
      .execute(range)
      .then((result) => {
        cache.current.set(rangeKey, result)
        if (!current) return
        setSamples(result)
        setStatus('ready')
      })
      .catch(() => {
        if (current) setStatus('failed')
      })
    return () => {
      current = false
    }
  }, [core, range, rangeKey, attempt])

  const view = useMemo(
    () => (samples === null ? null : buildHistoryView(samples, { resolution, units: preferences.units, range })),
    [samples, resolution, preferences.units, range],
  )

  const toggleVariable = useCallback((variable: HistoryVariable) => {
    setVisible((current) => {
      const next = { ...current, [variable]: !current[variable] }
      return Object.values(next).some(Boolean) ? next : current
    })
  }, [])

  return {
    status,
    view: status === 'ready' ? view : null,
    period,
    days,
    maxDays: availableDays(now),
    resolution,
    visible,
    showIndoor,
    selectPeriod: (next) => {
      setPeriod(next)
      setRequestedResolution(null)
    },
    selectResolution: setRequestedResolution,
    toggleVariable,
    showAllVariables: () => setVisible(ALL_VISIBLE),
    setShowIndoor,
    retry: () => setAttempt((n) => n + 1),
  }
}
