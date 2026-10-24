// API pública de @tt/i18n.

import type { Language } from '@tt/core'
import { en } from './catalogs/en'
import { type Catalog, es } from './catalogs/es'

export type { Catalog }
export const CATALOGS: Readonly<Record<Language, Catalog>> = { es, en }

export function catalogFor(language: Language): Catalog {
  return CATALOGS[language]
}

export * from './format'
export * from './forecast-text'
export * from './presenters'
export * from './history-text'
