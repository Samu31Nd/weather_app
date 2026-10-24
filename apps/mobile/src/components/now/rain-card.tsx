// Lluvia (RF-APP-01): intensidad actual, acumulados por ventana de tiempo y totales de tormenta, mes y año.

import type { CurrentConditions } from '@tt/core'
import { rainText } from '@tt/i18n'
import { StyleSheet, View } from 'react-native'
import { Card, CardHeader, Meter, Pill } from '@/components/ui/card'
import { RainIcon } from '@/components/ui/icons'
import { Txt } from '@/components/ui/txt'
import { usePreferences } from '@/providers/app-providers'

export function RainCard({ rain, units }: { rain: CurrentConditions['rain']; units: CurrentConditions['units'] }) {
  const { t, format, palette } = usePreferences()
  const text = rainText(rain, units, t, format)
  return (
    <Card label={t.rain.title}>
      <CardHeader icon={<RainIcon />} iconBackground="rain-soft" title={t.rain.title} badge={<Pill background="rain-soft">{text.badge}</Pill>} />
      {text.windows.map((window) => (
        <View key={window.label} style={styles.window}>
          <Txt size={12} color="t2" style={styles.windowLabel}>{window.label}</Txt>
          <View style={styles.meter}>
            <Meter fraction={window.fraction} height={10} track="rain-soft" fill="blue" />
          </View>
          <Txt size={12} mono style={styles.windowValue}>{window.value}</Txt>
        </View>
      ))}
      <View style={styles.totals}>
        {text.totals.map((total) => (
          <View key={total.label} style={[styles.total, { backgroundColor: palette.bg }]}>
            <Txt size={10.5} color="t2">{total.label}</Txt>
            <Txt size={14} weight="medium" mono>{total.value}</Txt>
          </View>
        ))}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  window: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  windowLabel: { width: 56 },
  meter: { flex: 1 },
  windowValue: { width: 64, textAlign: 'right' },
  totals: { flexDirection: 'row', gap: 6 },
  total: { flex: 1, paddingHorizontal: 10, paddingVertical: 9, borderRadius: 12, gap: 3 },
})
