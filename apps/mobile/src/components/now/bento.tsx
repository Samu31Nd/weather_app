// Bloque 2 × 2 del artboard `MobileNow` (RF-APP-01, RF-APP-04): presión, humedad, interior y el sol, en versión
// compacta. La geometría de los indicadores sale de @tt/core, igual que en web.

import { type CurrentConditions, gaugeAngle, gaugeArcPath, ringDashArray, sunArcPath, sunArcPoint } from '@tt/core'
import { humidityInsightText, indoorText, pressureText, sunBadgeText, valueText } from '@tt/i18n'
import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg'
import { Card } from '@/components/ui/card'
import { HomeIcon } from '@/components/ui/icons'
import { Txt } from '@/components/ui/txt'
import { usePreferences } from '@/providers/app-providers'
import { fontFamily } from '@/theme/fonts'

export function Bento({ view }: { view: CurrentConditions }) {
  return (
    <View style={styles.grid}>
      <PressureTile pressure={view.pressure} units={view.units} />
      <HumidityTile humidity={view.humidity} units={view.units} />
      <IndoorTile indoor={view.indoor} units={view.units} />
      <SunTile sun={view.sun} />
    </View>
  )
}

function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Card label={label} padding={14} gap={6} style={styles.tile}>
      {children}
    </Card>
  )
}

function PressureTile({ pressure, units }: { pressure: CurrentConditions['pressure']; units: CurrentConditions['units'] }) {
  const { t, format, palette } = usePreferences()
  const v = valueText(units, format)
  const text = pressureText(pressure, units, t, format)
  const gauge = pressure.gauge
  return (
    <Tile label={t.hero.pressure}>
      <Txt size={13} weight="semibold">{t.hero.pressure}</Txt>
      <Svg width="100%" height={78} viewBox="0 0 150 106" accessible accessibilityRole="image" accessibilityLabel={text.accessibilityLabel}>
        <Path d="M18 92A60 60 0 1 1 132 92" fill="none" stroke={palette['pres-soft']} strokeWidth={16} strokeLinecap="round" />
        {gauge ? (
          <>
            <Path d={gaugeArcPath(gauge.todayFrom, gauge.todayTo)} fill="none" stroke={palette.pres} strokeWidth={16} strokeLinecap="round" opacity={0.45} />
            <G rotation={gaugeAngle(gauge.needle)} origin="75, 72">
              <Path d="M75 72V26" stroke={palette.tx} strokeWidth={4} strokeLinecap="round" />
            </G>
          </>
        ) : null}
        <Circle cx={75} cy={72} r={7} fill={palette.tx} />
      </Svg>
      <View style={styles.valueRow}>
        <Txt size={20} mono>{v.pressure(pressure.value)}</Txt>
        <Txt size={11} color="t2">{v.symbols.pressure}</Txt>
      </View>
      {text.alternate ? <Txt size={10.5} mono color="t2" style={styles.centered}>{text.alternate}</Txt> : null}
      {text.trend ? <Txt size={11} weight="medium" color="pres-text" style={styles.centered}>{text.trend}</Txt> : null}
    </Tile>
  )
}

function HumidityTile({ humidity, units }: { humidity: CurrentConditions['humidity']; units: CurrentConditions['units'] }) {
  const { t, format, palette } = usePreferences()
  const v = valueText(units, format)
  const insight = humidityInsightText(humidity, t, format)
  return (
    <Tile label={t.hero.humidity}>
      <Txt size={13} weight="semibold">{t.hero.humidity}</Txt>
      <View style={styles.centeredRow}>
        <Svg width={78} height={78} viewBox="0 0 84 84" accessible accessibilityRole="image" accessibilityLabel={t.humidity.label(format.number(humidity.now, 0))}>
          <Circle cx={42} cy={42} r={34} fill="none" stroke={palette['hum-soft']} strokeWidth={10} />
          <Circle
            cx={42} cy={42} r={34} fill="none" stroke={palette.hum} strokeWidth={10} strokeLinecap="round"
            strokeDasharray={ringDashArray(humidity.now ?? 0)} rotation={-90} origin="42, 42"
          />
          <SvgText x={42} y={47} textAnchor="middle" fontSize={16} fontFamily={fontFamily('regular', true)} fill={palette.tx}>
            {v.percent(humidity.now)}
          </SvgText>
        </Svg>
      </View>
      <Txt size={11} color="t2" style={styles.centered}>
        {t.humidity.dewPoint} <Txt size={11} mono>{v.temperature(humidity.dewPoint)}</Txt>
      </Txt>
      <Txt size={10.5} color="t2" style={styles.centered}>{t.humidity.today(format.number(humidity.todayLow, 0), format.number(humidity.todayHigh, 0))}</Txt>
      {insight ? <Txt size={10.5} color="t2" style={styles.note}>{insight}</Txt> : null}
    </Tile>
  )
}

function IndoorTile({ indoor, units }: { indoor: CurrentConditions['indoor']; units: CurrentConditions['units'] }) {
  const { t, format, palette } = usePreferences()
  const v = valueText(units, format)
  const text = indoorText(indoor, t, format)
  return (
    <Tile label={t.indoor.title}>
      <View style={styles.titleRow}>
        <Txt size={13} weight="semibold">{t.indoor.title}</Txt>
        <HomeIcon />
      </View>
      <Txt size={20} mono>{v.temperature(indoor.temperature)}</Txt>
      <Txt size={13} mono color="t2">{v.percent(indoor.humidity)}</Txt>
      {text.comfort ? (
        <View style={[styles.badge, { backgroundColor: palette[text.comfortable ? 'ok-soft' : 'sun-soft'] }]}>
          <Txt size={11} weight="medium">{text.comfort}</Txt>
        </View>
      ) : null}
      {text.difference ? <Txt size={10.5} color="t2">{text.difference}</Txt> : null}
    </Tile>
  )
}

function SunTile({ sun }: { sun: CurrentConditions['sun'] }) {
  const { t, format, palette } = usePreferences()
  const position = sun.progress === null ? null : sunArcPoint(sun.progress)
  const elapsed = sun.progress === null ? null : sunArcPath(sun.progress)
  const label = t.sun.pathLabel(format.time(sun.sunrise), format.time(sun.sunset), sun.progress === null ? null : Math.round(sun.progress * 100))
  return (
    <Tile label={t.sun.title}>
      <Txt size={13} weight="semibold">{t.sun.title}</Txt>
      <Svg width="100%" height={56} viewBox="0 0 320 96" accessible accessibilityRole="image" accessibilityLabel={label}>
        <Path d="M20 88H300" stroke={palette.gs} strokeWidth={2} strokeDasharray="6 6" />
        <Path d={sunArcPath(1)} fill="none" stroke={palette.gs} strokeWidth={3} strokeDasharray="5 6" />
        {elapsed ? <Path d={elapsed} fill="none" stroke={palette.yellow} strokeWidth={5} strokeLinecap="round" /> : null}
        {position ? <Circle cx={position.x} cy={position.y} r={12} fill={palette.yellow} /> : null}
      </Svg>
      <View style={styles.titleRow}>
        <Txt size={11} mono color="t2">{format.time(sun.sunrise)}</Txt>
        <Txt size={11} mono color="t2">{format.time(sun.sunset)}</Txt>
      </View>
      <Txt size={11} weight="medium" style={styles.centered}>{sunBadgeText(sun, t, format) ?? ''}</Txt>
    </Tile>
  )
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { flexBasis: '46%', flexGrow: 1 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 4 },
  centered: { textAlign: 'center' },
  centeredRow: { alignItems: 'center' },
  note: { textAlign: 'center', lineHeight: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
})
