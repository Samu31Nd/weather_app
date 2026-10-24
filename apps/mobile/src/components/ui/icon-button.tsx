// Botón cuadrado de 44 px con ícono (cabeceras de "Ahora" e "Histórico"); el nombre va en `accessibilityLabel`.

import type { ReactNode } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { usePreferences } from '@/providers/app-providers'

export function IconButton({ label, onPress, disabled = false, children }: { label: string; onPress: () => void; disabled?: boolean; children: ReactNode }) {
  const { palette } = usePreferences()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy: disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, { borderColor: palette.bd, backgroundColor: palette.sf, opacity: disabled ? 0.75 : 1 }]}
    >
      {children}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
})
