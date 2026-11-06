/**
 * Arranque nativo del APK: Android 12+ siempre muestra una pantalla de arranque del sistema. Para que no se vea un
 * splash propio antes de la carga, va sin ícono (imagen transparente) y con el color de arriba del cielo de la
 * pantalla de carga (`sky1`) en cada tema; así el paso a la carga no se nota.
 * Fuente: pedido de quitar el splash del APK (5-nov); artboard `LoadingMobile`. Requerimiento: RF-APP-02.
 */
import { PALETTES } from '@tt/tokens'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const app = JSON.parse(readFileSync(resolve(__dirname, '../app.json'), 'utf8'))
const [, splash] = app.expo.plugins.find((plugin: unknown) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen')

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
