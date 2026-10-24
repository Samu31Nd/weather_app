// Ilustraciones de los acordeones del artboard `MobileHistory`: se mueven con los datos del periodo (`view.art`).

import type { HistoryArt } from '@tt/core'
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg'
import { usePreferences } from '@/providers/app-providers'

const SIZE = 44

export function TemperatureArt({ art, label }: { art: HistoryArt; label: string }) {
  const { palette } = usePreferences()
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 64 64" accessible accessibilityRole="image" accessibilityLabel={label}>
      <Defs>
        <LinearGradient id="history-drop-fill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset={art.dropEmpty} stopColor={palette.hum} stopOpacity={0} />
          <Stop offset={art.dropEmpty} stopColor={palette.hum} stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Rect x={14} y={6} width={12} height={42} rx={6} fill={palette.sf} stroke={palette.temp} strokeWidth={2.4} />
      <Rect x={17} y={art.thermometer.top} width={6} height={art.thermometer.height} rx={3} fill={palette.temp} />
      <Circle cx={20} cy={51} r={8} fill={palette.temp} />
      <Path d="M48 22c0 0-9 11-9 17.5a9 9 0 0 0 18 0C57 33 48 22 48 22z" fill="url(#history-drop-fill)" stroke={palette.hum} strokeWidth={2.4} strokeLinejoin="round" />
    </Svg>
  )
}

export function WindArt({ art, label }: { art: HistoryArt; label: string }) {
  const { palette } = usePreferences()
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 64 64" accessible accessibilityRole="image" accessibilityLabel={label}>
      <Circle cx={32} cy={32} r={25} fill={palette.sf} stroke={palette.wind} strokeWidth={2.4} />
      <Path d="M29.6 18.5v-5l4.8 5v-5" fill="none" stroke={palette.t2} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <G rotation={art.windNeedleDeg} origin="32, 32">
        <Path d="M32 15l5 17h-10z" fill={palette.wind} />
        <Path d="M32 49l5-17h-10z" fill={palette.gs} />
      </G>
      <Circle cx={32} cy={32} r={3} fill={palette.sf} stroke={palette.wind} strokeWidth={1.5} />
    </Svg>
  )
}

export function RainArt({ art, label }: { art: HistoryArt; label: string }) {
  const { palette } = usePreferences()
  const drop = (x: number, y: number) => `M${x} ${y}c0 0-3.5 4.6-3.5 7a3.5 3.5 0 0 0 7 0c0-2.4-3.5-7-3.5-7z`
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 64 64" accessible accessibilityRole="image" accessibilityLabel={label}>
      <Path d="M13 32h25a8 8 0 0 0 0-16 11 11 0 0 0-21-2.5A9.5 9.5 0 0 0 13 32z" fill={palette.sf} stroke={palette.blue} strokeWidth={2.4} strokeLinejoin="round" />
      <Path d={drop(17, 38)} fill={palette.blue} opacity={art.drops[0]} />
      <Path d={drop(27, 42)} fill={palette.blue} opacity={art.drops[1]} />
      <Path d={drop(37, 38)} fill={palette.blue} opacity={art.drops[2]} />
      <Rect x={47} y={14} width={11} height={42} rx={3} fill={palette.sf} stroke={palette.blue} strokeWidth={2.4} />
      <Rect x={49.5} y={art.gauge.top} width={6} height={art.gauge.height} rx={1.5} fill={palette.blue} />
    </Svg>
  )
}

export function PressureArt({ art, label }: { art: HistoryArt; label: string }) {
  const { palette } = usePreferences()
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 64 64" accessible accessibilityRole="image" accessibilityLabel={label}>
      <Circle cx={32} cy={34} r={26} fill={palette.sf} stroke={palette.pres} strokeWidth={2.4} />
      <Path d="M11.2 46A24 24 0 1 1 52.8 46" fill="none" stroke={palette.tm} strokeWidth={4} strokeDasharray="1.5 6.3" />
      <G rotation={art.pressureNeedleDeg} origin="32, 34">
        <Path d="M32 34V14" stroke={palette.pres} strokeWidth={2.5} strokeLinecap="round" />
      </G>
      <Circle cx={32} cy={34} r={3.5} fill={palette.pres} />
    </Svg>
  )
}
