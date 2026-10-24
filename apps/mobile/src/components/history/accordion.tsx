// Piezas de las secciones del artboard `MobileHistory`: acordeón con ilustración y resumen, leyenda, lectura del
// cursor e indicadores en rejilla de 2 columnas.

import type { KpiText } from '@tt/i18n'
import type { TokenName } from '@tt/tokens'
import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { Card } from '@/components/ui/card'
import { Txt } from '@/components/ui/txt'
import { usePreferences } from '@/providers/app-providers'

export function AccordionSection({ title, summary, art, artBackground, open, onToggle, children }: {
  title: string
  summary: string
  art: ReactNode
  artBackground: TokenName
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  const { palette } = usePreferences()
  return (
    <Card label={title} padding={0} gap={0} style={styles.clip}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={onToggle} style={styles.header}>
        <View style={[styles.art, { backgroundColor: palette[artBackground] }]}>{art}</View>
        <View style={styles.titles}>
          <Txt size={16} weight="semibold">{title}</Txt>
          <Txt size={12} mono color="t2" numberOfLines={1}>{summary}</Txt>
        </View>
        <Svg width={20} height={20} viewBox="0 0 20 20" style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <Path d="M5 8l5 5 5-5" fill="none" stroke={palette.t2} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </Card>
  )
}

export type SwatchKind = 'line' | 'dashed' | 'box'

export function Legend({ items, extra }: { items: ReadonlyArray<{ readonly kind: SwatchKind; readonly color: TokenName; readonly label: string }>; extra?: ReactNode }) {
  const { palette } = usePreferences()
  return (
    <View style={styles.legend}>
      {items.map((item) => (
        <View key={item.label} style={styles.legendItem}>
          <View
            style={
              item.kind === 'dashed'
                ? { width: 14, borderTopWidth: 2, borderStyle: 'dashed', borderColor: palette[item.color] }
                : item.kind === 'box'
                  ? { width: 10, height: 10, borderRadius: 2, backgroundColor: palette[item.color] }
                  : { width: 14, height: 2, backgroundColor: palette[item.color] }
            }
          />
          <Txt size={11.5} color="t2">{item.label}</Txt>
        </View>
      ))}
      {extra}
    </View>
  )
}

export function Readout({ text }: { text: string }) {
  const { palette } = usePreferences()
  return (
    <View style={[styles.readout, { backgroundColor: palette.bg }]} accessibilityLiveRegion="polite">
      <Txt size={11.5} mono style={styles.readoutText}>{text}</Txt>
    </View>
  )
}

export function KpiGrid({ kpis }: { kpis: readonly KpiText[] }) {
  const { palette } = usePreferences()
  return (
    <View style={styles.kpis}>
      {kpis.map((kpi) => (
        <View key={kpi.label} style={[styles.kpi, { backgroundColor: palette.bg }]}>
          <Txt size={11} color="t2">{kpi.label}</Txt>
          <Txt size={17} mono>{kpi.value}</Txt>
          <Txt size={10.5} color="t2">{kpi.detail}</Txt>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  header: { minHeight: 76, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  art: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titles: { flex: 1, minWidth: 0, gap: 3 },
  body: { paddingHorizontal: 14, paddingBottom: 16, gap: 10 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 12, rowGap: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  readout: { minHeight: 30, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  readoutText: { lineHeight: 15.5 },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  kpi: { flexBasis: '47%', flexGrow: 1, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, gap: 2 },
})
