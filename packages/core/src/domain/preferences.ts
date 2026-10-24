// Preferencias de presentación (RF-APP-10). Vienen del panel de ajustes del diseño: tema, idioma, unidades y
// tamaño de texto. Todo valor desconocido o ausente cae en el valor por defecto.

export const THEMES = ['system', 'light', 'dark'] as const
export const LANGUAGES = ['es', 'en'] as const
export const UNIT_SYSTEMS = ['metric', 'imperial'] as const
export const TEXT_SIZES = ['s', 'm', 'l'] as const

export type ThemePreference = (typeof THEMES)[number]
export type Language = (typeof LANGUAGES)[number]
export type TextSize = (typeof TEXT_SIZES)[number]

export interface UserPreferences {
  readonly theme: ThemePreference
  readonly language: Language
  readonly units: (typeof UNIT_SYSTEMS)[number]
  readonly textSize: TextSize
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'es',
  units: 'metric',
  textSize: 'm',
}

/** Factor de escala de cada tamaño de texto (el diseño usa 0.9 / 1 / 1.15). */
export const TEXT_SCALE: Readonly<Record<TextSize, number>> = { s: 0.9, m: 1, l: 1.15 }

const oneOf = <T extends string>(options: readonly T[], value: unknown, fallback: T): T =>
  typeof value === 'string' && (options as readonly string[]).includes(value) ? (value as T) : fallback

/** Valida un objeto parcial de cualquier origen (almacenamiento, URL, formulario). */
export function normalizePreferences(raw: Partial<Record<keyof UserPreferences, unknown>>): UserPreferences {
  return {
    theme: oneOf(THEMES, raw.theme, DEFAULT_PREFERENCES.theme),
    language: oneOf(LANGUAGES, raw.language, DEFAULT_PREFERENCES.language),
    units: oneOf(UNIT_SYSTEMS, raw.units, DEFAULT_PREFERENCES.units),
    textSize: oneOf(TEXT_SIZES, raw.textSize, DEFAULT_PREFERENCES.textSize),
  }
}

/** Tema efectivo: resuelve "sistema" con la preferencia del dispositivo. */
export function resolveTheme(theme: ThemePreference, systemPrefersDark: boolean): 'light' | 'dark' {
  if (theme === 'system') return systemPrefersDark ? 'dark' : 'light'
  return theme
}
