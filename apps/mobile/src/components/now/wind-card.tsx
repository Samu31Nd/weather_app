// Viento (RF-APP-01): brújula con aguja y ráfaga, velocidad actual, promedios y escala de Beaufort.

import type { CurrentConditions } from '@tt/core'
import { valueText, windText } from '@tt/i18n'
import { StyleSheet, View } from 'react-native'
import Svg, { Circle, G, Path } from 'react-native-svg'
import { Card, CardHeader, Meter } from '@/components/ui/card'
import { WindIcon } from '@/components/ui/icons'
import { Txt } from '@/components/ui/txt'
import { usePreferences } from '@/providers/app-providers'

const BEAUFORT_CELLS = 9 // el diseño muestra 0–8; de 9 en adelante se marca la última celda
const COMPASS_SIZE = 144

export function WindCard({ wind, units }: { wind: CurrentConditions['wind']; units: CurrentConditions['units'] }) {
  const { t, format, palette } = usePreferences()
  const v = valueText(units, format)
  const text = windText(wind, units, t, format)
  const activeCell = Math.min(wind.beaufort, BEAUFORT_CELLS - 1)

  return (
    <Card label={t.hero.wind}>
      <CardHeader icon={<WindIcon />} iconBackground="wind-soft" title={t.hero.wind} subtitle={t.wind.subtitle} />
      <View style={styles.row}>
        <View style={styles.compass}>
          <Svg width={COMPASS_SIZE} height={COMPASS_SIZE} viewBox="0 0 200 200" accessible accessibilityRole="image" accessibilityLabel={text.accessibilityLabel}>
            <Circle cx={100} cy={100} r={92} fill={palette['wind-soft']} />
            <Circle cx={100} cy={100} r={68} fill="none" stroke={palette.sf} strokeWidth={2} />
            <Path d="M100 14v10M100 176v10M14 100h10M176 100h10" stroke={palette.tm} strokeWidth={2.4} strokeLinecap="round" />
            <G rotation={wind.gustDirectionDeg ?? 0} origin="100, 100">
              <Path d="M100 8l8 13h-16z" fill={palette.gust} />
            </G>
            <G rotation={wind.directionDeg ?? 0} origin="100, 100" opacity={wind.calm ? 0.35 : 1}>
              <Path d="M100 26l11 74h-22z" fill={palette.wind} />
              <Path d="M100 174l11-74h-22z" fill={palette.gs} />
            </G>
            <Circle cx={100} cy={100} r={34} fill={palette.sf} />
          </Svg>
          <Txt size={10} weight="semibold" style={styles.north} importantForAccessibility="no">N</Txt>
          <View style={styles.center} importantForAccessibility="no-hide-descendants">
            <Txt size={15} weight="medium" mono>{text.center}</Txt>
            <Txt size={9} mono color="t2">{text.centerDetail}</Txt>
          </View>
        </View>

        <View style={styles.readings}>
          <View>
            <View style={styles.speed}>
              <Txt size={30} mono>{wind.calm ? '0' : format.number(wind.speed, 1)}</Txt>
              <Txt size={12} color="t2">{v.symbols.speed}</Txt>
            </View>
            <Txt size={12} weight="medium" color="wind-text">{text.beaufortName}</Txt>
          </View>
          {text.bars.map((bar) => (
            <View key={bar.label} style={styles.bar}>
              <View style={styles.barLabel}>
                <Txt size={11} color="t2" numberOfLines={1} style={styles.shrink}>{bar.label}</Txt>
                <Txt size={11} mono>{bar.value}</Txt>
              </View>
              <Meter fraction={bar.fraction} height={5} track="gr" fill={bar.gust ? 'gust' : 'wind'} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.beaufort} accessibilityLabel={`${t.wind.beaufort}: ${text.beaufortSummary}`}>
        {Array.from({ length: BEAUFORT_CELLS }, (_, force) => {
          const active = force === activeCell
          const passed = force < activeCell
          return (
            <View
              key={force}
              style={[styles.cell, { backgroundColor: active ? palette['wind-text'] : passed ? palette['wind-soft'] : palette.bg }]}
            >
              <Txt size={10} mono weight={active ? 'semibold' : 'regular'} color={active ? 'sf' : passed ? 't2' : 'tm'}>{force}</Txt>
            </View>
          )
        })}
      </View>
      <Txt size={11} color="t2" style={styles.caption}>{`${t.wind.beaufort} · ${text.beaufortSummary}`}</Txt>
    </Card>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  compass: { width: COMPASS_SIZE, height: COMPASS_SIZE },
  north: { position: 'absolute', top: 17, alignSelf: 'center' },
  center: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  readings: { flex: 1, minWidth: 0, gap: 8 },
  speed: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  bar: { gap: 3 },
  barLabel: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  shrink: { flexShrink: 1 },
  beaufort: { flexDirection: 'row', gap: 3 },
  cell: { flex: 1, height: 20, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  caption: { textAlign: 'center' },
})
