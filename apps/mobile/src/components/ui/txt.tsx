// Texto con la tipografía del diseño: IBM Plex Sans (o Mono para cifras), color de la paleta y tamaño escalado
// por la preferencia s/m/l. El tamaño de letra del sistema también se respeta (lo aplica React Native).

import type { TokenName } from '@tt/tokens'
import type { ReactNode } from 'react'
import { type StyleProp, Text, type TextProps, type TextStyle } from 'react-native'
import { usePreferences } from '@/providers/app-providers'
import { type FontWeight, fontFamily } from '@/theme/fonts'

export interface TxtProps extends Omit<TextProps, 'style'> {
  readonly size?: number
  readonly weight?: FontWeight
  /** Cifras en IBM Plex Mono (tabulares), como la clase `.num` del diseño. */
  readonly mono?: boolean
  readonly color?: TokenName
  readonly style?: StyleProp<TextStyle>
  readonly children?: ReactNode
}

export function Txt({ size = 14, weight = 'regular', mono = false, color = 'tx', style, children, ...rest }: TxtProps) {
  const { palette, textScale } = usePreferences()
  const fontSize = size * textScale
  return (
    <Text {...rest} style={[{ fontFamily: fontFamily(weight, mono), fontSize, color: palette[color] }, style]}>
      {children}
    </Text>
  )
}
