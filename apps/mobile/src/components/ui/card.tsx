// Tarjeta y piezas comunes del artboard `MobileNow`: superficie con borde, encabezado con ícono y pastilla.

import type { TokenName } from '@tt/tokens'
import type { ReactNode } from 'react'
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'
import { usePreferences } from '@/providers/app-providers'
import { Txt } from './txt'

export function Card({ label, radius = 20, padding = 16, gap = 12, style, children }: {
  label: string
  radius?: number
  padding?: number
  gap?: number
  style?: StyleProp<ViewStyle>
  children: ReactNode
}) {
  const { palette } = usePreferences()
  return (
    <View
      accessibilityLabel={label}
      style={[styles.card, { backgroundColor: palette.sf, borderColor: palette.bd, borderRadius: radius, padding, gap }, style]}
    >
      {children}
    </View>
  )
}

export function CardHeader({ icon, iconBackground, title, subtitle, badge }: {
  icon: ReactNode
  iconBackground: TokenName
  title: string
  subtitle?: string
  badge?: ReactNode
}) {
  const { palette } = usePreferences()
  return (
    <View style={styles.header}>
      <View style={styles.headerTitle}>
        <View style={[styles.icon, { backgroundColor: palette[iconBackground] }]}>{icon}</View>
        <View>
          <Txt size={15} weight="semibold" accessibilityRole="header">{title}</Txt>
          {subtitle ? <Txt size={11} color="t2">{subtitle}</Txt> : null}
        </View>
      </View>
      {badge}
    </View>
  )
}

export function Pill({ background, children }: { background: TokenName; children: ReactNode }) {
  const { palette } = usePreferences()
  return (
    <View style={[styles.pill, { backgroundColor: palette[background] }]}>
      <Txt size={11} weight="medium">{children}</Txt>
    </View>
  )
}

/** Barra horizontal de 0 a 1 (promedios de viento, ventanas de lluvia). */
export function Meter({ fraction, height, track, fill }: { fraction: number; height: number; track: TokenName; fill: TokenName }) {
  const { palette } = usePreferences()
  return (
    <View style={{ height, borderRadius: height, backgroundColor: palette[track], overflow: 'hidden' }}>
      <View style={{ height: '100%', width: `${Math.min(1, Math.max(0, fraction)) * 100}%`, borderRadius: height, backgroundColor: palette[fill] }} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  icon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  pill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
})
