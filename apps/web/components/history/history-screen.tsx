'use client'

// Pantalla "Histórico" provisional: cabecera nueva + gráficas previas (MUI) adaptadas a las preferencias nuevas.
// La fase 5 la reemplaza por el componente `WeatherHistory` del diseño (artboard `Main`).

import { useEffect, useState } from 'react'
import { AppProvider } from '@/components/app-provider'
import { useCore } from '@/components/providers/app-providers'
import { SiteHeader } from '@/components/shell/site-header'
import { HistoricalCharts } from '@/components/weather/components/historical-charts'

export function HistoryScreen() {
  const now = useClock()
  return (
    <div className="wx-zoom min-h-screen bg-wx-bg">
      <SiteHeader active="history" now={now} stationName="Liz" />
      <main className="mx-auto max-w-[1360px] px-6 pb-16 pt-6">
        <AppProvider>
          <HistoricalCharts />
        </AppProvider>
      </main>
    </div>
  )
}

function useClock(): Date {
  const core = useCore()
  const [now, setNow] = useState(() => core.clock.now())
  useEffect(() => {
    const tick = setInterval(() => setNow(core.clock.now()), 1_000)
    return () => clearInterval(tick)
  }, [core])
  return now
}
