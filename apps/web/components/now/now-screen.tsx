'use client'

// Pantalla "Ahora" (CU-01, CU-02): carga → dashboard. Arma el modelo de vista con @tt/core y lo reparte a las
// tarjetas, en la cuadrícula del artboard `Dashboard` (3 columnas; 2 en tableta; 1 en móvil).

import { buildCurrentConditions } from '@tt/core'
import { useEffect, useState } from 'react'
import { useCore, usePreferences } from '@/components/providers/app-providers'
import { SiteHeader } from '@/components/shell/site-header'
import { useLiveWeather } from '@/hooks/use-live-weather'
import { ForecastCard } from './forecast-card'
import { HeroCard } from './hero-card'
import { HumidityCard } from './humidity-card'
import { LoadingScreen } from './loading-screen'
import { PressureCard } from './pressure-card'
import { RainCard } from './rain-card'
import { StationFooter } from './station-footer'
import { SunCard } from './sun-card'
import { WindCard } from './wind-card'

/** Tiempo para que se vea el último paso de la carga ("¡Listo!") antes de abrir el panel. */
const REVEAL_DELAY_MS = 600

export function NowScreen() {
  const core = useCore()
  const { preferences } = usePreferences()
  const live = useLiveWeather()
  const revealed = useRevealAfterFirstReading(live.reading !== null)

  if (live.reading === null || !revealed) {
    return <LoadingScreen done={live.reading !== null} failed={live.status === 'offline'} onRetry={live.refresh} />
  }

  const scene = live.status === 'offlineWithData' ? 'offline' : core.resolveCurrentSky.execute(live.reading)
  const view = buildCurrentConditions(live.reading, { units: preferences.units, now: live.now, scene })

  return (
    <div className="wx-zoom min-h-screen bg-wx-bg">
      <SiteHeader
        active="now"
        now={live.now}
        stationName={live.reading.station.name}
        live={{
          status: live.status,
          secondsSinceUpdate: live.secondsSinceUpdate,
          observedAt: live.reading.observedAt,
          refreshing: live.refreshing,
          onRefresh: live.refresh,
        }}
      />
      <main className="mx-auto box-border grid max-w-[1360px] grid-cols-1 items-stretch gap-5 px-6 pb-16 pt-6 md:grid-cols-2 lg:grid-cols-3">
        <HeroCard view={view} />
        <div className="flex min-w-0 flex-col gap-5">
          <ForecastCard forecast={view.forecast} />
          <SunCard sun={view.sun} />
        </div>
        <WindCard wind={view.wind} units={view.units} />
        <PressureCard pressure={view.pressure} units={view.units} />
        <HumidityCard humidity={view.humidity} units={view.units} />
        <RainCard rain={view.rain} units={view.units} />
        <StationFooter station={view.station} />
      </main>
    </div>
  )
}

/** La carga solo se ve la primera vez: si ya hay lectura al montar (se volvió de otra página), abre directo. */
function useRevealAfterFirstReading(hasReading: boolean): boolean {
  const [revealed, setRevealed] = useState(hasReading)
  useEffect(() => {
    if (!hasReading || revealed) return
    const timer = setTimeout(() => setRevealed(true), REVEAL_DELAY_MS)
    return () => clearTimeout(timer)
  }, [hasReading, revealed])
  return revealed
}
