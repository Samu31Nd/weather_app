// Generación de variables CSS a partir de la paleta. La web inyecta la hoja resultante; la app móvil usa los
// mismos valores como objetos (PALETTES).

import { PALETTES, type ThemeName, TOKEN_NAMES } from './palette'

export function cssVariables(theme: ThemeName): string {
  const palette = PALETTES[theme]
  return TOKEN_NAMES.map((name) => `--${name}:${palette[name]}`).join(';')
}

/** Hoja con el tema claro en `lightSelector` y el oscuro en `darkSelector`. */
export function themeStylesheet(lightSelector = ':root', darkSelector = ':root.dark'): string {
  return [
    `${lightSelector}{color-scheme:light;${cssVariables('light')}}`,
    `${darkSelector}{color-scheme:dark;${cssVariables('dark')}}`,
  ].join('\n')
}
