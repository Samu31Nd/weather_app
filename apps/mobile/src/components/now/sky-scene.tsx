// Escena del cielo del héroe (RF-APP-03): el arte de @tt/sky-art, el mismo de la web, animado con reanimated.

import type { SkyScene as SkySceneId } from '@tt/core'
import { SKY_SCENE_ART } from '@tt/sky-art'
import { StyleSheet, View } from 'react-native'
import { SvgArt } from '@/components/art/svg-art'
import { Txt } from '@/components/ui/txt'

export function SkyScene({ scene, label, chip, height }: { scene: SkySceneId; label: string; chip: string; height: number }) {
  const art = SKY_SCENE_ART[scene]
  return (
    <View style={{ height }}>
      <SvgArt
        markup={art.body}
        viewBox={art.viewBox}
        rootClasses={art.rootClass.split(' ').filter(Boolean)}
        width="100%"
        height={height}
        preserveAspectRatio="xMidYMid slice"
        accessibilityLabel={label}
      />
      {/* La pastilla va sobre el cielo con colores fijos del diseño, legibles en ambos temas. */}
      <View style={styles.chip}>
        <Txt size={12} weight="medium" style={styles.chipText}>{chip}</Txt>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  chip: { position: 'absolute', left: 12, top: 12, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(239,241,245,0.86)' },
  chipText: { color: '#4c4f69' },
})
