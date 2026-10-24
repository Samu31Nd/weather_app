// Histórico (artboard `MobileHistory`): llega en la fase 5. Mientras, la pestaña lo avisa con el tema y el idioma
// elegidos.

import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { HistoryTabIcon } from '@/components/ui/icons'
import { Txt } from '@/components/ui/txt'
import { usePreferences } from '@/providers/app-providers'

export default function HistoryScreen() {
  const { t, palette } = usePreferences()
  return (
    <SafeAreaView edges={['top']} style={[styles.root, { backgroundColor: palette.bg }]}>
      <View style={[styles.icon, { backgroundColor: palette['in-soft'] }]}>
        <HistoryTabIcon color={palette.tx} />
      </View>
      <Txt size={20} weight="semibold" accessibilityRole="header">{t.app.navHistory}</Txt>
      <Txt size={14} color="t2" style={styles.text}>{t.app.historySoon}</Txt>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 32 },
  icon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  text: { textAlign: 'center', lineHeight: 20 },
})
