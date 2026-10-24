// Pantalla de carga (artboard `LoadingMobile`, RF-APP-02): la estación animada mientras llega el primer dato.
// Los pasos avanzan solos mientras se espera (lógica compartida `loadingProgress` de @tt/core); si la consola no
// responde, se avisa y se ofrece reintentar.

import {
  LOADING_LAST_WAITING_STEP, LOADING_STEP_INTERVAL_MS, LOADING_VARIABLES, type LoadingVariable, loadingProgress,
} from '@tt/core'
import { STATION_ILLUSTRATION_SVG, STATION_ILLUSTRATION_VIEWBOX } from '@tt/sky-art'
import type { Palette, TokenName } from '@tt/tokens'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg'
import { SvgArt } from '@/components/art/svg-art'
import { StationLogo } from '@/components/ui/icons'
import { Txt } from '@/components/ui/txt'
import { usePreferences } from '@/providers/app-providers'

const CLOUD = '<g class="wx-load-drift"><path d="M20 54h120a24 24 0 0 0 0-48 34 34 0 0 0-62-8A28 28 0 0 0 20 54z" fill="var(--cloud)" opacity="0.85"></path></g>'
const CLOUD_2 = '<g class="wx-load-drift2"><path d="M20 54h120a24 24 0 0 0 0-48 34 34 0 0 0-62-8A28 28 0 0 0 20 54z" fill="var(--cloud)" opacity="0.7"></path></g>'
const SOFT: Readonly<Record<LoadingVariable, TokenName>> = { temp: 'temp-soft', wind: 'wind-soft', rain: 'rain-soft', pres: 'pres-soft' }

export function LoadingScreen({ done, failed, onRetry }: { done: boolean; failed: boolean; onRetry: () => void }) {
  const { t, palette } = usePreferences()
  const [waitingStep, setWaitingStep] = useState(0)

  useEffect(() => {
    if (done || failed) return
    const timer = setInterval(() => setWaitingStep((step) => Math.min(step + 1, LOADING_LAST_WAITING_STEP)), LOADING_STEP_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [done, failed])

  const progress = loadingProgress(waitingStep, done)

  return (
    <View style={styles.root}>
      <Backdrop palette={palette} />
      <SafeAreaView style={styles.main}>
        <View style={styles.identity}>
          <View style={[styles.logo, { backgroundColor: palette['rain-soft'] }]}>
            <StationLogo size={22} />
          </View>
          <View>
            <Txt size={15} weight="semibold">{t.app.stationName('Liz')}</Txt>
            <Txt size={12} color="t2">{t.loading.place}</Txt>
          </View>
        </View>

        <View style={styles.art}>
          <Halo palette={palette} />
          <SvgArt
            markup={STATION_ILLUSTRATION_SVG}
            viewBox={STATION_ILLUSTRATION_VIEWBOX}
            width="100%"
            height="100%"
            palette={palette}
            spinMs={progress.spinMs}
            isHidden={(element) => element.attrs['data-rain'] === 'true' && !progress.rainVisible}
            accessibilityLabel={t.loading.illustration}
          />
        </View>

        <View style={styles.gap6}>
          <Txt size={28} weight="light" accessibilityRole="header" style={styles.title}>{t.loading.title}</Txt>
          <Txt size={14} color="t2" style={styles.subtitle}>{t.loading.subtitle}</Txt>
        </View>

        <View style={styles.gap16}>
          <View style={styles.gap10} accessibilityLiveRegion="polite">
            <View style={styles.statusRow}>
              <Txt size={14} weight="medium">{failed ? t.loading.failed : t.loading.steps[progress.step]}</Txt>
              <Txt size={13} mono color="t2">{progress.percent}%</Txt>
            </View>
            <ProgressBar percent={progress.percent} label={t.loading.progress} palette={palette} />
          </View>
          {failed ? (
            <Pressable accessibilityRole="button" onPress={onRetry} style={[styles.retry, { backgroundColor: palette.sf, borderColor: palette.bd }]}>
              <Txt size={14} weight="medium">{t.live.retry}</Txt>
            </Pressable>
          ) : (
            <View style={styles.variables}>
              {LOADING_VARIABLES.map((variable) => {
                const state = progress.variables[variable]
                const stateLabel = state === 'received' ? t.loading.received : state === 'receiving' ? t.loading.receiving : t.loading.waiting
                return (
                  <View key={variable} style={styles.variable} accessibilityLabel={`${t.loading.variables[variable]}: ${stateLabel}`}>
                    <View
                      style={[
                        styles.variableCircle,
                        state === 'received'
                          ? { backgroundColor: palette[SOFT[variable]], borderColor: palette[SOFT[variable]] }
                          : state === 'receiving'
                            ? { backgroundColor: palette.sf, borderColor: palette.tx }
                            : { borderColor: palette.gr, opacity: 0.7 },
                      ]}
                    >
                      <VariableIcon variable={variable} palette={palette} />
                    </View>
                    <Txt size={11} weight="medium" color="t2">{t.loading.variables[variable]}</Txt>
                  </View>
                )
              })}
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  )
}

/** Cielo degradado, colinas y dos nubes que van a la deriva. */
function Backdrop({ palette }: { palette: Palette }) {
  return (
    <>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={palette.sky1} />
            <Stop offset="1" stopColor={palette.sky2} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#sky)" />
      </Svg>
      <Svg style={styles.hills} viewBox="0 0 1000 200" preserveAspectRatio="none">
        <Path d="M0 120C160 70 320 80 480 112S800 60 1000 96V200H0z" fill={palette.hill} />
        <Path d="M0 160C200 128 380 136 560 156S860 128 1000 140V200H0z" fill={palette.hill2} />
      </Svg>
      <View style={styles.cloud1}>
        <SvgArt markup={CLOUD} viewBox="0 0 200 60" width={200} height={60} palette={palette} />
      </View>
      <View style={styles.cloud2}>
        <SvgArt markup={CLOUD_2} viewBox="0 0 200 60" width={150} height={45} palette={palette} />
      </View>
    </>
  )
}

function Halo({ palette }: { palette: Palette }) {
  return (
    <Svg style={styles.halo} width={320} height={320}>
      <Defs>
        <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={palette.halo} stopOpacity={1} />
          <Stop offset="0.7" stopColor={palette.halo} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={160} cy={160} r={160} fill="url(#halo)" />
    </Svg>
  )
}

function ProgressBar({ percent, label, palette }: { percent: number; label: string; palette: Palette }) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={[styles.progressTrack, { backgroundColor: palette.gr }]}
    >
      <Svg width={`${percent}%`} height={8}>
        <Defs>
          <LinearGradient id="progress" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={palette.hum} />
            <Stop offset="0.5" stopColor={palette.wind} />
            <Stop offset="1" stopColor={palette.temp} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height={8} rx={4} fill="url(#progress)" />
      </Svg>
    </View>
  )
}

function VariableIcon({ variable, palette }: { variable: LoadingVariable; palette: Palette }) {
  switch (variable) {
    case 'temp':
      return (
        <Svg width={18} height={18} viewBox="0 0 16 16">
          <Path d="M6.5 9.6V3a1.5 1.5 0 0 1 3 0v6.6a3 3 0 1 1-3 0z" fill="none" stroke={palette.temp} strokeWidth={1.5} />
          <Circle cx={8} cy={12} r={1.3} fill={palette.temp} />
        </Svg>
      )
    case 'wind':
      return (
        <Svg width={18} height={18} viewBox="0 0 16 16">
          <Path d="M2 6h8a2 2 0 1 0-2-2M2 10h10a2 2 0 1 1-2 2" fill="none" stroke={palette.wind} strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
      )
    case 'rain':
      return (
        <Svg width={18} height={18} viewBox="0 0 16 16">
          <Path d="M4.5 9h7a2.5 2.5 0 0 0 0-5 3.5 3.5 0 0 0-6.6-.9A2.5 2.5 0 0 0 4.5 9z" fill="none" stroke={palette.blue} strokeWidth={1.4} strokeLinejoin="round" />
          <Path d="M6 11.5l-.8 2M9.5 11.5l-.8 2" stroke={palette.blue} strokeWidth={1.4} strokeLinecap="round" />
        </Svg>
      )
    case 'pres':
      return (
        <Svg width={18} height={18} viewBox="0 0 16 16">
          <Path d="M2.8 11.5a5.5 5.5 0 1 1 10.4 0" fill="none" stroke={palette.pres} strokeWidth={1.5} strokeLinecap="round" />
          <Path d="M8 10l2.5-3.5" stroke={palette.pres} strokeWidth={1.5} strokeLinecap="round" />
          <Circle cx={8} cy={10} r={1.2} fill={palette.pres} />
        </Svg>
      )
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  main: { flex: 1, paddingTop: 28, paddingHorizontal: 20, paddingBottom: 32, gap: 18 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  art: { flex: 1, minHeight: 0, maxHeight: 380, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', alignSelf: 'center', top: '45%', marginTop: -160 },
  gap6: { gap: 6 },
  gap10: { gap: 10 },
  gap16: { gap: 16 },
  title: { letterSpacing: -0.5, lineHeight: 32 },
  subtitle: { lineHeight: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  progressTrack: { height: 8, borderRadius: 8, overflow: 'hidden' },
  retry: { alignSelf: 'flex-start', minHeight: 44, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, justifyContent: 'center' },
  variables: { flexDirection: 'row', gap: 8 },
  variable: { flex: 1, alignItems: 'center', gap: 6 },
  variableCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  hills: { position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 170 },
  cloud1: { position: 'absolute', left: '8%', top: '9%' },
  cloud2: { position: 'absolute', right: '10%', top: '18%' },
})
