// Pronóstico de la consola (RF-APP-03): frase compuesta por partes en el idioma elegido, con su ícono.

import { type Forecast, forecastIcon } from '@tt/core'
import { forecastText } from '@tt/i18n'
import { StyleSheet, View } from 'react-native'
import Svg, { Circle, G, Path } from 'react-native-svg'
import { Card } from '@/components/ui/card'
import { Txt } from '@/components/ui/txt'
import { usePreferences } from '@/providers/app-providers'

export function ForecastCard({ forecast }: { forecast: Forecast }) {
  const { t, palette } = usePreferences()
  const text = forecastText(forecast, t)
  const parts = [
    { label: t.forecast.sky, value: text.sky },
    { label: t.forecast.temperature, value: text.temperature },
    { label: t.forecast.rain, value: text.precipitation },
    { label: t.forecast.wind, value: text.wind },
  ]
  return (
    <Card label={t.forecast.aria}>
      <View style={styles.summary}>
        <View style={[styles.icon, { backgroundColor: palette['rain-soft'] }]}>
          <ForecastIcon forecast={forecast} />
        </View>
        <View style={styles.summaryText}>
          <Txt size={11} weight="semibold" color="t2" style={styles.caps}>{t.forecast.title.toUpperCase()}</Txt>
          <Txt size={14} weight="medium" style={styles.sentence}>{text.summary}</Txt>
        </View>
      </View>
      <View style={styles.parts}>
        {parts.map((part) => (
          <View key={part.label} style={[styles.part, { backgroundColor: palette.bg }]}>
            <Txt size={10} color="t2" style={styles.caps}>{part.label.toUpperCase()}</Txt>
            <Txt size={12.5} weight="medium">{part.value}</Txt>
          </View>
        ))}
      </View>
    </Card>
  )
}

function ForecastIcon({ forecast }: { forecast: Forecast }) {
  const { palette } = usePreferences()
  const icon = forecastIcon(forecast)
  return (
    <Svg width={38} height={38} viewBox="0 0 48 48">
      {icon.sun ? <Circle cx={31} cy={15} r={8} fill="#fab387" /> : null}
      {icon.cloud ? (
        <Path d="M11 32h22a7.5 7.5 0 0 0 0-15 10 10 0 0 0-19-2.5A8.5 8.5 0 0 0 11 32z" fill={palette.sf} stroke={palette.blue} strokeWidth={2} strokeLinejoin="round" />
      ) : null}
      {icon.rain ? (
        <G stroke={palette.blue} strokeWidth={2.2} strokeLinecap="round">
          <Path d="M15 37l-2 5" />
          <Path d="M23 37l-2 5" />
          <Path d="M31 37l-2 5" />
        </G>
      ) : null}
    </Svg>
  )
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  summaryText: { flex: 1, gap: 2 },
  caps: { letterSpacing: 0.5 },
  sentence: { lineHeight: 20 },
  parts: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  part: { flexBasis: '48%', flexGrow: 1, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, gap: 1 },
})
