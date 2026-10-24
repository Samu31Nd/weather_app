// IBM Plex Sans y Mono del diseño. En React Native cada peso es una familia distinta, así que el peso se elige
// por nombre de familia y no con `fontWeight`.

import { IBMPlexMono_400Regular, IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono'
import {
  IBMPlexSans_300Light, IBMPlexSans_400Regular, IBMPlexSans_500Medium, IBMPlexSans_600SemiBold,
} from '@expo-google-fonts/ibm-plex-sans'

export const FONT_SOURCES = {
  IBMPlexSans_300Light, IBMPlexSans_400Regular, IBMPlexSans_500Medium, IBMPlexSans_600SemiBold,
  IBMPlexMono_400Regular, IBMPlexMono_500Medium,
}

export type FontWeight = 'light' | 'regular' | 'medium' | 'semibold'

const SANS: Record<FontWeight, keyof typeof FONT_SOURCES> = {
  light: 'IBMPlexSans_300Light',
  regular: 'IBMPlexSans_400Regular',
  medium: 'IBMPlexSans_500Medium',
  semibold: 'IBMPlexSans_600SemiBold',
}

/** Familia para un peso; las cifras (`mono`) solo existen en regular y medium, como en el diseño. */
export function fontFamily(weight: FontWeight, mono = false): string {
  if (mono) return weight === 'medium' || weight === 'semibold' ? 'IBMPlexMono_500Medium' : 'IBMPlexMono_400Regular'
  return SANS[weight]
}
