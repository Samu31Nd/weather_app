// Pantalla "Ahora" (CU-01, CU-02): carga → panel. Arma el modelo de vista con @tt/core y lo reparte a las
// tarjetas en una columna, como el artboard `MobileNow`.

import { buildCurrentConditions } from '@tt/core'
import { useEffect, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppHeader } from '@/components/shell/app-header'
import { SettingsSheet } from '@/components/shell/settings-sheet'
import { useLiveWeather } from '@/hooks/use-live-weather'
import { useCore, usePreferences } from '@/providers/app-providers'
import { WIDGETS_AVAILABLE } from '@/widget/availability'
import { Bento } from './bento'
import { ForecastCard } from './forecast-card'
import { HeroCard } from './hero-card'
import { LoadingScreen } from './loading-screen'
import { RainCard } from './rain-card'
import { StationStrip } from './station-strip'
import { WindCard } from './wind-card'

/** Tiempo para que se vea el último paso de la carga ("¡Listo!") antes de abrir el panel. */
const REVEAL_DELAY_MS = 600

export function NowScreen() {
  const core = useCore()
  const { preferences, palette } = usePreferences()
  const live = useLiveWeather()
  const revealed = useRevealAfterFirstReading(live.reading !== null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  useWidgetRefresh(live.reading?.observedAt.getTime() ?? null)

  if (live.reading === null || !revealed) {
    return <LoadingScreen done={live.reading !== null} failed={live.status === 'offline'} onRetry={live.refresh} />
  }

  const scene = live.status === 'offlineWithData' ? 'offline' : core.resolveCurrentSky.execute(live.reading)
  const view = buildCurrentConditions(live.reading, { units: preferences.units, now: live.now, scene })

  return (
    <SafeAreaView edges={['top']} style={[styles.root, { backgroundColor: palette.bg }]}>
      <AppHeader
        stationName={live.reading.station.name}
        live={{
          status: live.status,
          secondsSinceUpdate: live.secondsSinceUpdate,
          observedAt: live.reading.observedAt,
          refreshing: live.refreshing,
          onRefresh: live.refresh,
        }}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={live.refreshing} onRefresh={live.refresh} tintColor={palette.t2} />}
      >
        <HeroCard view={view} />
        <ForecastCard forecast={view.forecast} />
        <WindCard wind={view.wind} units={view.units} />
        <Bento view={view} />
        <RainCard rain={view.rain} units={view.units} />
        <StationStrip station={view.station} />
      </ScrollView>
      <SettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </SafeAreaView>
  )
}

/** Con cada lectura nueva, los widgets de la pantalla de inicio se redibujan sin esperar los 30 min de Android. */
function useWidgetRefresh(readingTime: number | null) {
  useEffect(() => {
    if (!WIDGETS_AVAILABLE || readingTime === null) return
    const { refreshWeatherWidgets } = require('@/widget/register') as typeof import('@/widget/register')
    refreshWeatherWidgets().catch(() => undefined)
  }, [readingTime])
}

/** La carga solo se ve la primera vez: si ya hay lectura al montar (se volvió de otra pestaña), abre directo. */
function useRevealAfterFirstReading(hasReading: boolean): boolean {
  const [revealed, setRevealed] = useState(hasReading)
  useEffect(() => {
    if (!hasReading || revealed) return
    const timer = setTimeout(() => setRevealed(true), REVEAL_DELAY_MS)
    return () => clearTimeout(timer)
  }, [hasReading, revealed])
  return revealed
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingTop: 4, paddingHorizontal: 16, paddingBottom: 24, gap: 14 },
})
