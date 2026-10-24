// Hoja de descarga del artboard `MobileHistory` (RF-APP-09): CSV o JSON de lo que se está viendo. El archivo se
// entrega con la hoja de compartir del sistema.

import type { ExportFormat } from '@tt/core'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '@/components/ui/txt'
import { usePreferences } from '@/providers/app-providers'

export function DownloadSheet({ visible, summary, onPick, onClose }: { visible: boolean; summary: string; onPick: (format: ExportFormat) => void; onClose: () => void }) {
  const { t, palette } = usePreferences()
  const insets = useSafeAreaInsets()
  const h = t.history
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable accessibilityRole="button" accessibilityLabel={t.settings.close} onPress={onClose} style={styles.backdrop} />
        <View accessibilityViewIsModal style={[styles.sheet, { backgroundColor: palette.sf, paddingBottom: 28 + insets.bottom }]}>
          <View style={[styles.grabber, { backgroundColor: palette.gs }]} />
          <View style={styles.titleRow}>
            <Txt size={18} weight="semibold" accessibilityRole="header" style={styles.title}>{h.downloadAria}</Txt>
            <Pressable accessibilityRole="button" onPress={onClose} style={[styles.done, { backgroundColor: palette.bg }]}>
              <Txt size={14} weight="semibold">{t.settings.done}</Txt>
            </Pressable>
          </View>
          <Txt size={12} mono color="t2">{summary}</Txt>
          {(['csv', 'json'] as const).map((format) => (
            <Pressable
              key={format}
              accessibilityRole="button"
              onPress={() => onPick(format)}
              style={[styles.option, { borderColor: palette.bd, backgroundColor: palette.bg }]}
            >
              <Txt size={14} weight="semibold" mono style={styles.format}>{format.toUpperCase()}</Txt>
              <Txt size={13} color="t2" style={styles.shrink}>{format === 'csv' ? h.csvTitle : h.jsonTitle}</Txt>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(17,17,27,0.42)' },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, paddingHorizontal: 20, gap: 14,
    shadowColor: '#11111b', shadowOpacity: 0.18, shadowRadius: 30, shadowOffset: { width: 0, height: -8 }, elevation: 12,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { flexShrink: 1 },
  done: { minHeight: 44, paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center' },
  option: { minHeight: 60, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  format: { width: 52 },
  shrink: { flexShrink: 1 },
})
