/**
 * Arranque nativo del APK: Android 12+ siempre muestra una pantalla de arranque del sistema. Para que no se vea un
 * splash propio antes de la carga, va sin ícono (imagen transparente) y con el color de arriba del cielo de la
 * pantalla de carga (`sky1`) en cada tema; así el paso a la carga no se nota.
 * Fuente: pedido de quitar el splash del APK (5-nov); artboard `LoadingMobile`. Requerimiento: RF-APP-02.
 */
import { PALETTES } from '@tt/tokens'
import app from '../app.json'

const plugin = app.expo.plugins.find((entry) => Array.isArray(entry) && entry[0] === 'expo-splash-screen')
const splash = (plugin as [string, { backgroundColor: string; image: string; dark: { backgroundColor: string; image: string } }])[1]

describe('pantalla de arranque nativa', () => {
  it('usa el cielo de la pantalla de carga en tema claro y oscuro', () => {
    expect(splash.backgroundColor).toBe(PALETTES.light.sky1)
    expect(splash.dark.backgroundColor).toBe(PALETTES.dark.sky1)
  })

  it('no dibuja ningún ícono', () => {
    expect(splash.image).toBe('./assets/images/splash-blank.png')
    expect(splash.dark.image).toBe(splash.image)
  })
})
