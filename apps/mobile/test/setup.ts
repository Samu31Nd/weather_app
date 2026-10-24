// Entorno de pruebas: AsyncStorage en memoria y un reanimated mínimo y estático (el mock oficial de reanimated 4
// carga el módulo nativo y falla en jest). Las pruebas verifican qué se muestra, no las animaciones; estas se
// prueban como datos en @tt/sky-art.

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'))

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native')
  const identity = (value: unknown) => value
  const easing = () => identity
  return {
    __esModule: true,
    default: { View, createAnimatedComponent: identity },
    Easing: { linear: identity, ease: identity, out: easing, in: easing, inOut: easing },
    useSharedValue: (value: unknown) => ({ value }),
    useAnimatedStyle: () => ({}),
    useAnimatedProps: () => ({}),
    useFrameCallback: () => ({ setActive: () => undefined, isActive: false }),
    useReducedMotion: () => true,
    withRepeat: identity,
    withTiming: identity,
    cancelAnimation: () => undefined,
  }
})
