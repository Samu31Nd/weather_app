// Gráfica de tiempo del artboard `MobileHistory`: rejilla con marcas del eje y, las curvas (en un lienzo de
// 1000 × `height` que se estira al ancho real), la línea del cursor y una capa táctil. Al tocar o arrastrar el
// dedo se elige el intervalo bajo él; si el gesto es vertical, el desplazamiento de la pantalla se queda con él.

import type { NiceScale } from '@tt/core'
import { type ReactNode, useState } from 'react'
import { type GestureResponderEvent, StyleSheet, View } from 'react-native'
import Svg from 'react-native-svg'
import { Txt } from '@/components/ui/txt'
import { usePreferences } from '@/providers/app-providers'

export const CHART_WIDTH = 1000
const AXIS_GUTTER = 34

export interface ChartCursor {
  readonly index: number | null
  readonly count: number
  readonly onChange: (index: number | null) => void
}

export function TimeChart({ height, label, scale, formatTick, cursor, children }: {
  height: number
  label: string
  scale: NiceScale
  formatTick: (value: number) => string
  cursor: ChartCursor
  children: ReactNode
}) {
  const { palette } = usePreferences()
  const [width, setWidth] = useState(0)
  const span = scale.hi - scale.lo || 1
  const pick = (event: GestureResponderEvent) => {
    if (width === 0 || cursor.count === 0) return
    const fraction = event.nativeEvent.locationX / width
    if (fraction >= 0 && fraction <= 1) cursor.onChange(Math.min(cursor.count - 1, Math.floor(fraction * cursor.count)))
  }
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label} style={[styles.chart, { height }]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {scale.ticks.map((tick) => (
        <View key={tick} style={[styles.gridLine, { top: `${(1 - (tick - scale.lo) / span) * 100}%`, borderTopColor: palette.gr }]}>
          <Txt size={10} mono color="tm" style={styles.tickLabel}>{formatTick(tick)}</Txt>
        </View>
      ))}
      <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${CHART_WIDTH} ${height}`} preserveAspectRatio="none">
        {children}
      </Svg>
      {cursor.index !== null ? (
        <View pointerEvents="none" style={[styles.cursor, { left: `${((cursor.index + 0.5) / cursor.count) * 100}%`, backgroundColor: palette.crosshair }]} />
      ) : null}
      <View
        style={StyleSheet.absoluteFill}
        onStartShouldSetResponder={() => true}
        onResponderGrant={pick}
        onResponderMove={pick}
        onResponderTerminationRequest={() => true}
      />
    </View>
  )
}

export function TimeAxis({ ticks }: { ticks: ReadonlyArray<{ readonly label: string; readonly fraction: number }> }) {
  return (
    <View style={styles.axis}>
      {ticks.map((tick, i) => (
        <Txt
          key={`${tick.label}-${i}`}
          size={10}
          mono
          color="tm"
          numberOfLines={1}
          style={[styles.axisLabel, { left: `${tick.fraction * 100}%`, ...edgeAlignment(i, ticks.length) }]}
        >
          {tick.label}
        </Txt>
      ))}
    </View>
  )
}

/** La primera marca se alinea a la izquierda, la última a la derecha y las demás al centro de su punto. */
function edgeAlignment(index: number, count: number) {
  if (index === 0) return { textAlign: 'left' as const }
  if (index === count - 1) return { textAlign: 'right' as const, transform: [{ translateX: -AXIS_LABEL_WIDTH }] }
  return { textAlign: 'center' as const, transform: [{ translateX: -AXIS_LABEL_WIDTH / 2 }] }
}

const AXIS_LABEL_WIDTH = 48

const styles = StyleSheet.create({
  chart: { marginLeft: AXIS_GUTTER },
  gridLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1 },
  tickLabel: { position: 'absolute', left: -AXIS_GUTTER, width: 28, top: -7, textAlign: 'right' },
  cursor: { position: 'absolute', top: 0, bottom: 0, width: 1.5 },
  axis: { height: 16, marginLeft: AXIS_GUTTER },
  axisLabel: { position: 'absolute', top: 0, width: AXIS_LABEL_WIDTH },
})
