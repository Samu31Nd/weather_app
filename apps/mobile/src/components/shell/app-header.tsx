// Cabecera compacta del artboard `MobileNow`: estación, vigencia del dato ("En vivo · hace 12 s · cada 60 s"),
// botón de actualizar y botón de ajustes (RF-APP-02, RF-APP-06…09).

import type { LiveStatus } from '@tt/core'
import { liveText } from '@tt/i18n'
import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  Easing, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated'
import { IconButton } from '@/components/ui/icon-button'
import { RefreshIcon, SlidersIcon, StationLogo } from '@/components/ui/icons'
import { Txt } from '@/components/ui/txt'
import { usePreferences } from '@/providers/app-providers'

export interface LiveIndicator {
  readonly status: LiveStatus
  readonly secondsSinceUpdate: number | null
  readonly observedAt: Date | null
  readonly refreshing: boolean
  readonly onRefresh: () => void
}

export function AppHeader({ stationName, live, onOpenSettings }: { stationName: string; live: LiveIndicator; onOpenSettings: () => void }) {
  const { t, format, palette } = usePreferences()
  const text = liveText(live, t, format)
  const dot = text.tone === 'ok' ? palette.green : text.tone === 'stale' ? palette.yellow : palette.red
  return (
    <View style={[styles.header, { backgroundColor: palette.bg }]}>
      <View style={styles.identity}>
        <View style={[styles.logo, { backgroundColor: palette['rain-soft'] }]}>
          <StationLogo />
        </View>
        <View style={styles.titles}>
          <Txt size={16} weight="semibold" numberOfLines={1}>{t.app.stationName(stationName)}</Txt>
          <View style={styles.live} accessibilityRole="text" accessibilityLiveRegion="polite">
            <LiveDot color={dot} pulsing={text.tone === 'ok'} />
            <Txt size={12} weight="semibold">{text.label}</Txt>
            <Txt size={12} mono color="t2" numberOfLines={1} style={styles.shrink}>{text.detail}</Txt>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <IconButton label={t.live.refresh} onPress={live.onRefresh} disabled={live.refreshing}>
          <Spinning active={live.refreshing}>
            <RefreshIcon color={palette.tx} />
          </Spinning>
        </IconButton>
        <IconButton label={t.settings.title} onPress={onOpenSettings}>
          <SlidersIcon color={palette.tx} />
        </IconButton>
      </View>
    </View>
  )
}

/** Punto de estado; en vivo late como el `.pulse` del diseño. */
function LiveDot({ color, pulsing }: { color: string; pulsing: boolean }) {
  const reduceMotion = useReducedMotion()
  const progress = useSharedValue(0)
  useEffect(() => {
    if (!pulsing || reduceMotion) return
    progress.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }), -1)
    return () => cancelAnimation(progress)
  }, [pulsing, reduceMotion, progress])
  const halo = useAnimatedStyle(() => ({ opacity: pulsing ? 0.6 * (1 - progress.value) : 0, transform: [{ scale: 1 + 1.6 * progress.value }] }))
  return (
    <View style={styles.dot}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.round, { backgroundColor: color }, halo]} />
      <View style={[StyleSheet.absoluteFill, styles.round, { backgroundColor: color }]} />
    </View>
  )
}

function Spinning({ active, children }: { active: boolean; children: React.ReactNode }) {
  const rotation = useSharedValue(0)
  useEffect(() => {
    if (!active) return
    rotation.value = 0
    rotation.value = withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1)
    return () => cancelAnimation(rotation)
  }, [active, rotation])
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${active ? rotation.value : 0}deg` }] }))
  return <Animated.View style={style}>{children}</Animated.View>
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  logo: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  titles: { gap: 2, flex: 1, minWidth: 0 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shrink: { flexShrink: 1 },
  actions: { flexDirection: 'row', gap: 6 },
  dot: { width: 7, height: 7 },
  round: { borderRadius: 4 },
})
