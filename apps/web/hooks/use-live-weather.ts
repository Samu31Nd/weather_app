'use client'

// Dato en vivo para "Ahora" (RF-APP-02): consulta al montar, cada 60 s y a pedido; cuenta los segundos desde la
// última actualización y calcula la vigencia con `liveStatus` de @tt/core.

import { type LiveReading, type LiveStatus, liveStatus } from '@tt/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useCore } from '@/components/providers/app-providers'

export const REFRESH_INTERVAL_MS = 60_000

export interface LiveWeatherState {
  readonly reading: LiveReading | null
  readonly status: LiveStatus
  readonly secondsSinceUpdate: number | null
  readonly refreshing: boolean
  readonly refresh: () => void
  readonly now: Date
}

export function useLiveWeather(): LiveWeatherState {
  const core = useCore()
  const [reading, setReading] = useState<LiveReading | null>(null)
  const [lastSuccessAt, setLastSuccessAt] = useState<Date | null>(null)
  const [lastFailed, setLastFailed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [now, setNow] = useState(() => core.clock.now())
  const inFlight = useRef(false)

  const refresh = useCallback(() => {
    if (inFlight.current) return
    inFlight.current = true
    setRefreshing(true)
    core.getLiveWeather
      .execute()
      .then((next) => {
        setReading(next)
        setLastSuccessAt(core.clock.now())
        setLastFailed(false)
      })
      .catch(() => setLastFailed(true))
      .finally(() => {
        inFlight.current = false
        setRefreshing(false)
        setNow(core.clock.now())
      })
  }, [core])

  useEffect(() => {
    refresh()
    const poll = setInterval(refresh, REFRESH_INTERVAL_MS)
    const tick = setInterval(() => setNow(core.clock.now()), 1_000)
    return () => {
      clearInterval(poll)
      clearInterval(tick)
    }
  }, [core, refresh])

  return {
    reading,
    status: liveStatus({ now, lastSuccessAt, observedAt: reading?.observedAt ?? null, lastFailed }),
    secondsSinceUpdate: lastSuccessAt === null ? null : Math.max(0, Math.floor((now.getTime() - lastSuccessAt.getTime()) / 1000)),
    refreshing,
    refresh,
    now,
  }
}
