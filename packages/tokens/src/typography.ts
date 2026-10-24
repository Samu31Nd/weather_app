// Tipografía del diseño: IBM Plex Sans para texto e IBM Plex Mono (cifras tabulares) para números.

export const FONT_FAMILIES = {
  sans: 'IBM Plex Sans',
  mono: 'IBM Plex Mono',
} as const

export const FONT_WEIGHTS = {
  sans: [300, 400, 500, 600],
  mono: [400, 500],
} as const

export const FALLBACK_STACKS = {
  sans: 'system-ui, sans-serif',
  mono: 'ui-monospace, monospace',
} as const
