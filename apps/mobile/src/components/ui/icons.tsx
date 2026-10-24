// Íconos de línea del artboard `MobileNow`, con los colores de la paleta.

import Svg, { Circle, Path } from 'react-native-svg'
import { usePreferences } from '@/providers/app-providers'

export function StationLogo({ size = 24 }: { size?: number }) {
  const { palette } = usePreferences()
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path d="M16 29V9" stroke={palette.t2} strokeWidth={2} strokeLinecap="round" />
      <Path d="M7 11h18" stroke={palette.t2} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={7} cy={7.5} r={2.4} fill={palette.wind} />
      <Path d="M7 11V7.5" stroke={palette.t2} strokeWidth={1.4} />
      <Path d="M25 11V7M20 7h9" stroke={palette.t2} strokeWidth={1.4} strokeLinecap="round" />
      <Path d="M19 7l3-2v4z" fill={palette.wind} />
      <Path d="M10 21h7l-1 3h-5z" fill={palette.blue} />
    </Svg>
  )
}

export function RefreshIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 16 16">
      <Path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3.2h-3.2" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function SlidersIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Path d="M3 6h9M15 6h2M3 14h2M8 14h9" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx={13.5} cy={6} r={2} fill="none" stroke={color} strokeWidth={1.6} />
      <Circle cx={6.5} cy={14} r={2} fill="none" stroke={color} strokeWidth={1.6} />
    </Svg>
  )
}

export function WindIcon() {
  const { palette } = usePreferences()
  return (
    <Svg width={18} height={18} viewBox="0 0 16 16">
      <Path d="M2 6h8a2 2 0 1 0-2-2M2 10h10a2 2 0 1 1-2 2" fill="none" stroke={palette.wind} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  )
}

export function RainIcon() {
  const { palette } = usePreferences()
  return (
    <Svg width={18} height={18} viewBox="0 0 16 16">
      <Path d="M4.5 9h7a2.5 2.5 0 0 0 0-5 3.5 3.5 0 0 0-6.6-.9A2.5 2.5 0 0 0 4.5 9z" fill="none" stroke={palette.blue} strokeWidth={1.4} strokeLinejoin="round" />
      <Path d="M6 11.5l-.8 2M9.5 11.5l-.8 2" stroke={palette.blue} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  )
}

export function HomeIcon() {
  const { palette } = usePreferences()
  return (
    <Svg width={22} height={22} viewBox="0 0 44 44">
      <Path d="M7 21L22 8l15 13" fill="none" stroke={palette.lav} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M11 18v18h22V18" fill="none" stroke={palette.lav} strokeWidth={3} strokeLinejoin="round" />
    </Svg>
  )
}

export function NowTabIcon({ color, background }: { color: string; background: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Circle cx={9} cy={9} r={4} fill="none" stroke={color} strokeWidth={1.7} />
      <Path d="M9 2v1.5M2 9h1.5M4 4l1 1M14 4l-1 1" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Path d="M9 20h9a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.4 1.2A3.5 3.5 0 0 0 9 20z" fill={background} stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
    </Svg>
  )
}

export function HistoryTabIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path d="M3 20h18" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Path d="M4 16c3-1 4-7 7-7s3 5 6 4 3-6 3-6" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}
