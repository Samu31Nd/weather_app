// Periodo del artboard `MobileHistory` (RF-APP-06, RF-APP-07): atajos o últimos N días y la resolución permitida
// para ese rango, en filas que se desplazan de lado.

import { HISTORY_PRESETS, RESOLUTIONS, estimatedPoints, isResolutionAllowed } from '@tt/core'
import { periodBounds } from '@tt/i18n'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { Card } from '@/components/ui/card'
import { Txt } from '@/components/ui/txt'
import type { HistoryState } from '@/hooks/use-history'
import { usePreferences } from '@/providers/app-providers'
import { fontFamily } from '@/theme/fonts'

export function HistoryControls({ history }: { history: HistoryState }) {
  const { t } = usePreferences()
  const h = t.history
  const points = history.view?.buckets.length ?? estimatedPoints(history.days, history.resolution)
  return (
    <Card label={h.controls} padding={14} gap={10} style={styles.clip}>
      <Txt size={11} weight="semibold" color="t2" style={styles.caps}>{h.range.toUpperCase()}</Txt>
      <ChipRow>
        {HISTORY_PRESETS.map((preset) => {
          const active = history.period.kind === 'preset' && history.period.preset === preset
          return <Chip key={preset} label={h.presets[preset]} active={active} onPress={() => history.selectPeriod({ kind: 'preset', preset })} />
        })}
        <CustomDays history={history} />
      </ChipRow>
      <Txt size={12} color="t2">{customHint(history, t)}</Txt>
      <Txt size={11} weight="semibold" color="t2" style={[styles.caps, styles.spaced]}>{h.resolution.toUpperCase()}</Txt>
      <ChipRow>
        {RESOLUTIONS.map((resolution) => {
          const allowed = isResolutionAllowed(history.days, resolution)
          const estimate = estimatedPoints(history.days, resolution)
          return (
            <Chip
              key={resolution}
              label={h.resolutions[resolution]}
              active={resolution === history.resolution}
              disabled={!allowed}
              hint={allowed ? h.pointsApprox(estimate) : estimate > 800 ? h.tooMany(estimate) : h.tooFew(estimate)}
              onPress={() => history.selectResolution(resolution)}
            />
          )
        })}
      </ChipRow>
      <Txt size={12} mono color="t2">{h.caption(points, h.resolutions[history.resolution], history.view?.emptyBuckets ?? 0)}</Txt>
    </Card>
  )
}

function customHint(history: HistoryState, t: ReturnType<typeof usePreferences>['t']): string {
  const h = t.history
  if (history.period.kind !== 'custom') return h.customHintIdle(history.maxDays)
  if (history.period.days > history.maxDays) return h.customHintMax(history.maxDays)
  if (!history.view) return ''
  const { from, to } = periodBounds(history.view.range, t)
  return h.customHintRange(from, to)
}

function ChipRow({ children }: { children: ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row} contentContainerStyle={styles.rowContent}>
      {children}
    </ScrollView>
  )
}

function Chip({ label, active, disabled = false, hint, onPress }: { label: string; active: boolean; disabled?: boolean; hint?: string; onPress: () => void }) {
  const { palette } = usePreferences()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      accessibilityHint={hint}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.chip,
        disabled
          ? { borderColor: palette.gs, borderStyle: 'dashed' }
          : active
            ? { borderColor: palette.tx, borderStyle: 'solid', backgroundColor: palette.tx }
            : { borderColor: palette.gs, borderStyle: 'solid', backgroundColor: palette.sf },
      ]}
    >
      <Txt size={13} weight="medium" color={disabled ? 'tm' : active ? 'sf' : 'tx'}>{label}</Txt>
    </Pressable>
  )
}

/** "Últimos [60] días": vacío o cero no cambia el periodo. */
function CustomDays({ history }: { history: HistoryState }) {
  const { t, palette, textScale } = usePreferences()
  const h = t.history
  const active = history.period.kind === 'custom'
  const [text, setText] = useState('60')
  const apply = (value: string) => {
    setText(value)
    const days = Number.parseInt(value, 10)
    if (days > 0) history.selectPeriod({ kind: 'custom', days })
  }
  return (
    <View style={[styles.chip, styles.custom, { backgroundColor: palette.sf, borderColor: active ? palette.tx : palette.gs, borderWidth: active ? 2 : 1 }]}>
      <Txt size={13} weight="medium">{h.lastN}</Txt>
      <TextInput
        accessibilityLabel={`${h.lastN} ${h.days}`}
        value={text}
        keyboardType="number-pad"
        maxLength={3}
        onFocus={() => apply(text)}
        onChangeText={apply}
        style={[styles.input, { borderColor: palette.gs, color: palette.tx, fontFamily: fontFamily('medium', true), fontSize: 14 * textScale }]}
      />
      <Txt size={13} weight="medium">{h.days}</Txt>
    </View>
  )
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  caps: { letterSpacing: 0.66 },
  spaced: { marginTop: 4 },
  row: { marginHorizontal: -14 },
  rowContent: { gap: 6, paddingHorizontal: 14, paddingVertical: 2 },
  chip: { minHeight: 44, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  custom: { flexDirection: 'row', gap: 8, paddingRight: 12 },
  input: { width: 48, height: 30, paddingHorizontal: 6, paddingVertical: 0, borderRadius: 8, borderWidth: 1, textAlign: 'right' },
})
