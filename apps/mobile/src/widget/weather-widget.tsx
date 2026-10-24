// Widgets de Android del artboard `WidgetsClaro`/`WidgetsOscuro`: 2×2 (ícono, estación y hora, temperatura,
// condición y un dato contextual) y 4×2 (lo mismo + sensación térmica y una columna con humedad, viento y lluvia).
// Fondo sólido tintado por el clima, esquinas de 24 dp y la fuente del sistema: sin `fontFamily`, Android usa la
// fuente que eligió el usuario, y `allowFontScaling` (activo por defecto) respeta su tamaño de letra.
// Tocar el widget abre la app; el ícono ↻ del 4×2 lo actualiza.

import type { WidgetText } from '@tt/i18n'
import { widgetIconSvg, widgetRefreshSvg } from '@tt/sky-art'
import { WIDGET_PALETTES } from '@tt/tokens'
import { FlexWidget, type HexColor, SvgWidget, TextWidget } from 'react-native-android-widget'

export const WEATHER_WIDGET_SMALL = 'WeatherSmall'
export const WEATHER_WIDGET_WIDE = 'WeatherWide'
export const REFRESH_ACTION = 'REFRESH'

type Theme = 'light' | 'dark'

function colors(text: WidgetText, theme: Theme) {
  const palette = WIDGET_PALETTES[theme]
  const background = palette.background[text.kind] as HexColor
  return {
    background,
    text: palette.text as HexColor,
    muted: palette.muted as HexColor,
    divider: palette.divider as HexColor,
    temperature: (text.stale ? palette.muted : palette.text) as HexColor,
    icon: widgetIconSvg(text.kind, theme, background),
  }
}

export function WeatherWidgetSmall({ text, theme }: { text: WidgetText; theme: Theme }) {
  const c = colors(text, theme)
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel={text.summary}
      style={{
        height: 'match_parent', width: 'match_parent', backgroundColor: c.background, borderRadius: 24,
        paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'column', justifyContent: 'space-between',
      }}
    >
      <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between' }}>
        <SvgWidget svg={c.icon} style={{ width: 44, height: 44 }} />
        <TextWidget text={text.station} style={{ fontSize: 11, color: c.muted }} />
      </FlexWidget>
      <FlexWidget style={{ flexDirection: 'column', flexGap: 2 }}>
        <TextWidget text={text.temperature} style={{ fontSize: 44, fontWeight: '300', color: c.temperature }} />
        <TextWidget text={text.condition} maxLines={1} truncate="END" style={{ fontSize: 13, fontWeight: '500', color: c.text }} />
        <TextWidget text={text.detail} maxLines={1} truncate="END" style={{ fontSize: 11.5, color: c.muted }} />
      </FlexWidget>
    </FlexWidget>
  )
}

export function WeatherWidgetWide({ text, theme }: { text: WidgetText; theme: Theme }) {
  const c = colors(text, theme)
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel={text.summary}
      style={{
        height: 'match_parent', width: 'match_parent', backgroundColor: c.background, borderRadius: 24,
        paddingHorizontal: 18, paddingVertical: 14, flexDirection: 'row', flexGap: 16,
      }}
    >
      <FlexWidget style={{ flex: 1, height: 'match_parent', flexDirection: 'column', justifyContent: 'space-between' }}>
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 10 }}>
          <SvgWidget svg={c.icon} style={{ width: 52, height: 52 }} />
          <TextWidget text={text.temperature} style={{ fontSize: 52, fontWeight: '300', color: c.temperature }} />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: 'column', flexGap: 2 }}>
          <TextWidget text={text.condition} maxLines={1} truncate="END" style={{ fontSize: 14, fontWeight: '500', color: c.text }} />
          <TextWidget text={text.feelsLike} maxLines={1} truncate="END" style={{ fontSize: 12, color: c.muted }} />
          <TextWidget text={text.range} maxLines={1} truncate="END" style={{ fontSize: 12, color: c.muted }} />
        </FlexWidget>
      </FlexWidget>
      <FlexWidget style={{ width: 1, height: 'match_parent', backgroundColor: c.divider }} />
      <FlexWidget style={{ width: 138, height: 'match_parent', flexDirection: 'column', justifyContent: 'space-between' }}>
        <FlexWidget style={{ width: 'match_parent', flexDirection: 'column', flexGap: 9, paddingTop: 4 }}>
          {text.facts.map((fact) => (
            <FlexWidget key={fact.label} style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between' }}>
              <TextWidget text={fact.label} style={{ fontSize: 13, color: c.muted }} />
              <TextWidget text={fact.value} style={{ fontSize: 13, fontWeight: '500', color: c.text }} />
            </FlexWidget>
          ))}
        </FlexWidget>
        <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextWidget text={text.station} style={{ fontSize: 11, color: c.muted }} />
          <SvgWidget svg={widgetRefreshSvg(c.muted)} clickAction={REFRESH_ACTION} accessibilityLabel={text.refreshLabel} style={{ width: 24, height: 24, padding: 5 }} />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  )
}
