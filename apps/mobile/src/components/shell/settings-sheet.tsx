// Hoja de ajustes del artboard `MobileNow` (RF-APP-06…09): idioma, tema, tamaño de letra y unidades. Cada cambio
// se aplica al momento y se guarda con las claves `wx-*`.

import { LANGUAGES, TEXT_SIZES, THEMES, UNIT_SYSTEMS } from '@tt/core'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Segmented } from '@/components/ui/segmented'
import { Txt } from '@/components/ui/txt'
import { usePreferences } from '@/providers/app-providers'

export function SettingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t, preferences, update, palette } = usePreferences()
  const insets = useSafeAreaInsets()
  const s = t.settings
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable accessibilityRole="button" accessibilityLabel={s.close} onPress={onClose} style={styles.backdrop} />
        <View
          accessibilityViewIsModal
          style={[styles.sheet, { backgroundColor: palette.sf, paddingBottom: 28 + insets.bottom }]}
        >
          <View style={[styles.grabber, { backgroundColor: palette.gs }]} />
          <View style={styles.titleRow}>
            <Txt size={18} weight="semibold" accessibilityRole="header">{s.title}</Txt>
            <Pressable accessibilityRole="button" onPress={onClose} style={[styles.done, { backgroundColor: palette.bg }]}>
              <Txt size={14} weight="semibold">{s.done}</Txt>
            </Pressable>
          </View>
          <Segmented
            label={s.language}
            value={preferences.language}
            options={LANGUAGES.map((value) => ({ value, label: s.languageNames[value] }))}
            onChange={(language) => update({ language })}
          />
          <Segmented
            label={s.theme}
            value={preferences.theme}
            options={THEMES.map((value) => ({ value, label: s.themes[value] }))}
            onChange={(theme) => update({ theme })}
          />
          <Segmented
            label={s.textSize}
            value={preferences.textSize}
            options={TEXT_SIZES.map((value) => ({ value, label: s.textSizeNames[value] }))}
            onChange={(textSize) => update({ textSize })}
          />
          <Segmented
            label={s.units}
            value={preferences.units}
            options={UNIT_SYSTEMS.map((value) => ({ value, label: s.unitNames[value] }))}
            onChange={(units) => update({ units })}
          />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(17,17,27,0.42)' },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, paddingHorizontal: 20, gap: 18,
    shadowColor: '#11111b', shadowOpacity: 0.18, shadowRadius: 30, shadowOffset: { width: 0, height: -8 }, elevation: 12,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  done: { minHeight: 44, paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center' },
})
