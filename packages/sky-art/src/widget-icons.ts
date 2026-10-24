// Íconos del widget de Android (artboards `WidgetsClaro`/`WidgetsOscuro`): versiones estáticas y simplificadas de
// las escenas del cielo, como SVG completos (el widget los pinta con `SvgWidget`). Lienzo de 48 × 48.

export type WidgetIconKind = 'clear' | 'night' | 'partly' | 'rain' | 'storm' | 'fog' | 'offline'

interface IconColors {
  readonly cloud: { readonly partly: string; readonly rain: string; readonly storm: string }
  readonly outline: string
  readonly drops: string
}

const SUN = '#fab387'
const MOON = '#f5e0dc'
const FOG_SUN = '#f9e2af'
const OFFLINE_MARK = '#d20f39'

const COLORS: Readonly<Record<'light' | 'dark', IconColors>> = {
  light: { cloud: { partly: '#ffffff', rain: '#dfe2ea', storm: '#c3c8d5' }, outline: '#8c8fa1', drops: '#1e66f5' },
  dark: { cloud: { partly: '#cdd6f4', rain: '#9399b2', storm: '#7f849c' }, outline: '#9399b2', drops: '#89b4fa' },
}

const CLOUD = 'M0 16h20a7 7 0 0 0 0-14 9.5 9.5 0 0 0-17.5-2A8 8 0 0 0 0 16z'
const drop = (x: number, color: string) => `<path d="M${x} 37l-2 5" stroke="${color}" stroke-width="2.4" stroke-linecap="round"/>`

function iconBody(kind: WidgetIconKind, theme: 'light' | 'dark', background: string): string {
  const c = COLORS[theme]
  switch (kind) {
    case 'clear':
      return `<circle cx="24" cy="24" r="9" fill="${SUN}"/><g stroke="${SUN}" stroke-width="2.4" stroke-linecap="round"><path d="M24 6v4M24 38v4M6 24h4M38 24h4M11 11l3 3M34 34l3 3M11 37l3-3M34 14l3-3"/></g>`
    case 'night':
      // La luna se recorta con un círculo del color del fondo del widget.
      return `<circle cx="24" cy="24" r="12" fill="${MOON}"/><circle cx="30" cy="19" r="11" fill="${background}"/><circle cx="38" cy="10" r="1.4" fill="${MOON}"/><circle cx="9" cy="14" r="1.1" fill="${MOON}"/>`
    case 'partly':
      return `<circle cx="30" cy="16" r="8" fill="${SUN}"/><path transform="translate(6 18) scale(1.15)" d="${CLOUD}" fill="${c.cloud.partly}" stroke="${c.outline}" stroke-width="1.22" stroke-linejoin="round"/>`
    case 'rain':
      return `<path transform="translate(6 8) scale(1.3)" d="${CLOUD}" fill="${c.cloud.rain}" stroke="${c.outline}" stroke-width="1.08" stroke-linejoin="round"/>${[14, 22, 30].map((x) => drop(x, c.drops)).join('')}`
    case 'storm':
      return `<path transform="translate(4 6) scale(1.4)" d="${CLOUD}" fill="${c.cloud.storm}" stroke="${c.outline}" stroke-width="1" stroke-linejoin="round"/>${[14, 22, 30, 38].map((x) => drop(x, c.drops)).join('')}<g stroke="${c.outline}" stroke-width="2" stroke-linecap="round" fill="none"><path d="M2 30h9M30 44h12"/></g>`
    case 'fog':
      return `<circle cx="24" cy="18" r="9" fill="${FOG_SUN}" opacity="0.8"/><g stroke="${c.outline}" stroke-width="3" stroke-linecap="round"><path d="M8 28h32M12 35h28M8 42h22"/></g>`
    case 'offline':
      return `<g fill="none" stroke="${c.outline}" stroke-width="2" stroke-dasharray="3 3"><path transform="translate(6 12) scale(1.3)" d="${CLOUD}"/></g><path d="M30 34l10 10M40 34l-10 10" stroke="${OFFLINE_MARK}" stroke-width="2.4" stroke-linecap="round"/>`
  }
}

/** SVG completo del ícono de clima del widget, para un tema y el color de fondo del widget. */
export function widgetIconSvg(kind: WidgetIconKind, theme: 'light' | 'dark', background: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${iconBody(kind, theme, background)}</svg>`
}

/** Ícono ↻ de "actualizar" del widget 4×2. */
export function widgetRefreshSvg(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3.2h-3.2" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
}
