// Héroe (artboard `MobileNow`, RF-APP-01, RF-APP-03): escena del cielo, temperatura, sensación térmica, hoy dentro
// del mes y los cuatro indicadores rápidos.

import type { CurrentConditions } from '@tt/core'
import { valueText } from '@tt/i18n'
import type { TokenName } from '@tt/tokens'
import { StyleSheet, View } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { Card } from '@/components/ui/card'
import { Txt } from '@/components/ui/txt'
import { usePreferences } from '@/providers/app-providers'
import { SkyScene } from './sky-scene'

export function HeroCard({ view }: { view: CurrentConditions }) {
  const { t, format } = usePreferences()
  const v = valueText(view.units, format)
  const { temperature } = view
  const sceneName = t.scene.names[view.scene]

  return (
    <Card label={t.hero.aria} radius={24} padding={0} gap={0} style={styles.clip}>
      <SkyScene scene={view.scene} label={t.scene.label(sceneName)} chip={sceneName} height={150} />
      <View style={styles.body}>
        <View style={styles.temperatureRow}>
          <View style={styles.gap2}>
            <Txt size={12} color="t2">{t.hero.outdoorTemperature}</Txt>
            <View style={styles.temperature}>
              <Txt size={64} weight="light" style={styles.bigNumber}>{format.number(temperature.now, 1)}</Txt>
              <Txt size={24} color="temp-text" style={styles.unit}>{v.symbols.temperature}</Txt>
            </View>
          </View>
          <View style={styles.feelsLike}>
            <Txt size={12} color="t2">{t.hero.feelsLike}</Txt>
            <Txt size={22} weight="medium" mono color="temp-text">{v.degrees(temperature.feelsLike)}</Txt>
            <Txt size={11} color="t2" style={styles.right}>{t.hero.feelsLikeReason[temperature.feelsLikeReason]}</Txt>
          </View>
        </View>

        <RangeBar range={temperature.range} />

        <View style={styles.tiles}>
          <Tile label={t.hero.humidity} value={v.percent(view.humidity.now)} background="hum-soft" />
          <Tile label={t.hero.wind} value={view.wind.calm ? t.hero.calm : v.speed(view.wind.speed)} background="wind-soft" />
          <Tile label={t.hero.rainToday} value={v.rain(view.rain.today)} background="rain-soft" />
          <Tile label={t.hero.pressure} value={v.pressureShort(view.pressure.value)} background="pres-soft" />
        </View>
      </View>
    </Card>
  )
}

/** Hoy dentro del rango del mes: tramo de hoy (de humedad a temperatura) y la lectura actual. */
function RangeBar({ range }: { range: CurrentConditions['temperature']['range'] }) {
  const { t, format, palette, preferences } = usePreferences()
  const v = valueText(preferences.units, format)
  const bar = range.bar
  return (
    <View style={styles.gap6} accessibilityLabel={t.hero.todayWithinMonth}>
      <View style={styles.rangeTrack}>
        <View style={[styles.rangeRail, { backgroundColor: palette.gr }]} />
        {bar ? (
          <>
            <Svg style={[styles.rangeToday, { left: `${bar.todayStart * 100}%`, width: `${bar.todayWidth * 100}%` }]} height={8}>
              <Defs>
                <LinearGradient id="today" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={palette.hum} />
                  <Stop offset="1" stopColor={palette.temp} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height={8} rx={4} fill="url(#today)" />
            </Svg>
            <View style={[styles.rangeNow, { left: `${bar.current * 100}%`, backgroundColor: palette.sf, borderColor: palette.tx }]} />
          </>
        ) : null}
      </View>
      <View style={styles.rangeLabels}>
        <Txt size={11} mono color="t2">{t.hero.monthLow(v.degrees(range.monthLow))}</Txt>
        <Txt size={11} mono color="t2">{t.hero.todayRange(v.degrees(range.todayLow), v.degrees(range.todayHigh))}</Txt>
        <Txt size={11} mono color="t2">{t.hero.monthHigh(v.degrees(range.monthHigh))}</Txt>
      </View>
    </View>
  )
}

function Tile({ label, value, background }: { label: string; value: string; background: TokenName }) {
  const { palette } = usePreferences()
  return (
    <View style={[styles.tile, { backgroundColor: palette[background] }]}>
      <Txt size={11} color="t2">{label}</Txt>
      <Txt size={18} mono>{value}</Txt>
    </View>
  )
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  body: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 18, gap: 14 },
  temperatureRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  gap2: { gap: 2 },
  gap6: { gap: 6 },
  temperature: { flexDirection: 'row', alignItems: 'flex-start', gap: 3 },
  bigNumber: { letterSpacing: -2.5 },
  unit: { marginTop: 6 },
  feelsLike: { alignItems: 'flex-end', gap: 2, maxWidth: 150 },
  right: { textAlign: 'right', lineHeight: 15 },
  rangeTrack: { height: 14 },
  rangeRail: { position: 'absolute', left: 0, right: 0, top: 5, height: 4, borderRadius: 4 },
  rangeToday: { position: 'absolute', top: 3 },
  rangeNow: { position: 'absolute', top: 0, width: 14, height: 14, marginLeft: -7, borderRadius: 7, borderWidth: 3 },
  rangeLabels: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { flexBasis: '47%', flexGrow: 1, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, gap: 2 },
})
