// Estado de la estación (RF-APP-05): batería, señal y tiempo encendida. Nunca datos internos de red.

import type { CurrentConditions } from '@tt/core'
import { stationText } from '@tt/i18n'
import { StyleSheet, View } from 'react-native'
import { Card } from '@/components/ui/card'
import { Txt } from '@/components/ui/txt'
import { usePreferences } from '@/providers/app-providers'

export function StationStrip({ station }: { station: CurrentConditions['station'] }) {
  const { t, format } = usePreferences()
  const text = stationText(station, t, format)
  const items = [
    { label: t.station.battery, value: text.battery },
    { label: t.station.signal, value: text.signal },
    { label: t.station.uptime, value: text.uptime },
  ]
  return (
    <Card label={t.station.title} radius={16} padding={12} style={styles.strip}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <Txt size={11} color="t2">{item.label}</Txt>
          <Txt size={12} mono style={styles.value}>{item.value}</Txt>
        </View>
      ))}
    </Card>
  )
}

const styles = StyleSheet.create({
  strip: { flexDirection: 'row', justifyContent: 'space-around', gap: 8 },
  item: { flex: 1, alignItems: 'center', gap: 2 },
  value: { textAlign: 'center' },
})
