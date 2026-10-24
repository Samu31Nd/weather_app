// Barra inferior del artboard `MobileNow`: "Ahora" e "Histórico", con la pastilla de la pestaña activa.

import type { Tabs } from 'expo-router'
import type { ComponentProps } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HistoryTabIcon, NowTabIcon } from '@/components/ui/icons'
import { Txt } from '@/components/ui/txt'
import { usePreferences } from '@/providers/app-providers'

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0]

export function TabBar({ state, emitter, navigateToTab }: TabBarProps) {
  const { t, palette } = usePreferences()
  const insets = useSafeAreaInsets()
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={t.app.sections}
      style={[styles.bar, { backgroundColor: palette.sf, borderTopColor: palette.bd, paddingBottom: 14 + insets.bottom }]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index
        const color = focused ? palette.tx : palette.t2
        const isNow = route.name === 'index'
        const onPress = () => {
          const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
          if (!focused && !event.defaultPrevented) navigateToTab(route.key)
        }
        return (
          <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected: focused }} onPress={onPress} style={styles.tab}>
            <View style={[styles.pill, { backgroundColor: focused ? palette['in-soft'] : 'transparent' }]}>
              {isNow ? <NowTabIcon color={color} background={palette.sf} /> : <HistoryTabIcon color={color} />}
            </View>
            <Txt size={12} weight={focused ? 'semibold' : 'medium'} color={focused ? 'tx' : 't2'}>
              {isNow ? t.app.navNow : t.app.navHistory}
            </Txt>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', justifyContent: 'center', gap: 24, paddingTop: 8, paddingHorizontal: 24, borderTopWidth: 1 },
  tab: { flex: 1, maxWidth: 160, alignItems: 'center', gap: 4, paddingTop: 2 },
  pill: { width: 64, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
})
