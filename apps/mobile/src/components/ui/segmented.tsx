// Control segmentado de la hoja de ajustes (artboard `MobileNow`): opciones de 44 px de alto (RNF-APP-05).

import { Pressable, StyleSheet, View } from 'react-native'
import { usePreferences } from '@/providers/app-providers'
import { Txt } from './txt'

export interface SegmentedOption<T extends string> {
  readonly value: T
  readonly label: string
}

export function Segmented<T extends string>({ label, options, value, onChange }: {
  label: string
  options: ReadonlyArray<SegmentedOption<T>>
  value: T
  onChange: (value: T) => void
}) {
  const { palette } = usePreferences()
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.group}>
      <Txt size={12} weight="semibold" color="t2" style={styles.label}>{label.toUpperCase()}</Txt>
      <View style={[styles.track, { backgroundColor: palette.bg }]}>
        {options.map((option) => {
          const active = option.value === value
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(option.value)}
              style={[styles.option, active && { backgroundColor: palette.sf, ...styles.activeShadow }]}
            >
              <Txt size={14} weight="semibold" color={active ? 'tx' : 't2'}>{option.label}</Txt>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  label: { letterSpacing: 0.7 },
  track: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 14 },
  option: { flex: 1, minHeight: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  activeShadow: { shadowColor: '#4c4f69', shadowOpacity: 0.18, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
})
