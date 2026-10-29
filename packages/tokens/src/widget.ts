// Colores del widget de Android (artboards `WidgetsClaro` y `WidgetsOscuro`): fondo sólido tintado según el clima
// (sin degradados, que los widgets no soportan bien), texto y divisor, en tema claro y oscuro. Android elige el
// tema del sistema.

export const WIDGET_BACKGROUND_KINDS = ['clear', 'night', 'partly', 'rain', 'storm', 'fog', 'offline'] as const
export type WidgetBackgroundKind = (typeof WIDGET_BACKGROUND_KINDS)[number]

export interface WidgetPalette {
  readonly background: Readonly<Record<WidgetBackgroundKind, string>>
  readonly text: string
  /** Texto secundario: etiquetas, hora, dato contextual. */
  readonly muted: string
  readonly divider: string
}

export const WIDGET_PALETTES: Readonly<Record<'light' | 'dark', WidgetPalette>> = {
  light: {
    background: { clear: '#dbe8fb', partly: '#e3e9f6', rain: '#dde1ea', storm: '#d4d8e3', night: '#e4e2f6', fog: '#e6e8ec', offline: '#e8e9ed' },
    text: '#4c4f69',
    // El diseño usa #6c6f85, que no llega a 4.5:1 sobre los fondos claros; se oscurece lo mínimo (RNF-APP-05).
    muted: '#5b5d70',
    divider: '#ccd0da',
  },
  dark: {
    background: { clear: '#24324d', partly: '#262c42', rain: '#232839', storm: '#1e2233', night: '#24223a', fog: '#2a2c38', offline: '#25262f' },
    text: '#cdd6f4',
    muted: '#a6adc8',
    divider: '#45475a',
  },
}
