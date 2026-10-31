// Las cuatro secciones del artboard `MobileHistory` (RF-APP-07, RF-APP-08), como acordeones. Solo dibujan: escalas,
// trazos, indicadores y textos llegan hechos de @tt/core y @tt/i18n, igual que en web.

import { type HistoryCharts, type HistoryView, ROSE, ROSE_SPEED_BINS_KMH, displaySpeed, roseGeometry } from '@tt/core'
import { type HistorySection, type HistorySummaryText, readoutText, valueText } from '@tt/i18n'
import { Pressable, StyleSheet, View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { Txt } from '@/components/ui/txt'
import { usePreferences } from '@/providers/app-providers'
import { AccordionSection, KpiGrid, Legend, Readout } from './accordion'
import { PressureArt, RainArt, TemperatureArt, WindArt } from './history-art'
import { type ChartCursor, TimeAxis, TimeChart } from './time-chart'

export interface SectionProps {
  readonly view: HistoryView
  readonly charts: HistoryCharts
  readonly summary: HistorySummaryText
  readonly headline: string
  readonly cursor: ChartCursor
  readonly axis: ReadonlyArray<{ readonly label: string; readonly fraction: number }>
  readonly showIndoor: boolean
  readonly open: boolean
  readonly onToggle: () => void
}

/** Grosor constante aunque el lienzo se estire al ancho de la pantalla. */
const THIN = 'non-scaling-stroke' as const

function useReadout(view: HistoryView, cursor: ChartCursor, showIndoor: boolean) {
  const { t, format } = usePreferences()
  return (section: HistorySection) => (cursor.index === null ? t.history.hoverHint : readoutText(view, cursor.index, section, showIndoor, t, format))
}

const decimalsFor = (step: number) => (step < 0.1 ? 2 : step < 1 ? 1 : 0)

export function TemperatureSection(props: SectionProps & { onToggleIndoor: () => void }) {
  const { view, charts, summary, headline, cursor, axis, showIndoor, open, onToggle, onToggleIndoor } = props
  const { t, format, palette } = usePreferences()
  const h = t.history
  const v = valueText(view.units, format)
  const readout = useReadout(view, cursor, showIndoor)
  const { temperature, humidity } = charts
  return (
    <AccordionSection
      title={h.sections.temperature.title}
      summary={headline}
      open={open}
      onToggle={onToggle}
      artBackground="temp-soft"
      art={<TemperatureArt art={view.art} label={h.illustrations.temperature(v.temperature(view.summary.temperature.mean), format.number(view.summary.temperature.humidityMean, 0))} />}
    >
      <Legend
        items={[
          { kind: 'line', color: 'temp', label: h.legend.outdoorMean },
          { kind: 'box', color: 'temp-band', label: h.legend.band },
        ]}
        extra={
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: showIndoor }}
            accessibilityLabel={h.showIndoor}
            onPress={onToggleIndoor}
            style={[styles.indoorChip, showIndoor ? { borderColor: palette.tx, borderStyle: 'solid', backgroundColor: palette.sf } : { borderColor: palette.gs, borderStyle: 'dashed' }]}
          >
            <View style={{ width: 14, borderTopWidth: 2, borderStyle: 'dashed', borderColor: palette.tm }} />
            <Txt size={11.5} weight="medium" color={showIndoor ? 'tx' : 't2'}>{h.legend.indoor}</Txt>
          </Pressable>
        }
      />
      <Readout text={readout('temperature')} />
      <TimeChart height={170} label={h.aria.temperature} scale={temperature.scale} formatTick={(value) => `${value}°`} cursor={cursor}>
        <Path d={temperature.band} fill={palette['temp-band']} />
        <Path d={temperature.indoor} fill="none" stroke={palette.tm} strokeWidth={1.5} strokeDasharray="4 3" vectorEffect={THIN} />
        <Path d={temperature.line} fill="none" stroke={palette.temp} strokeWidth={2.2} vectorEffect={THIN} />
      </TimeChart>
      <TimeAxis ticks={axis} />
      <View style={styles.subhead}>
        <Txt size={12} weight="semibold">{h.legend.relativeHumidity}</Txt>
        <Txt size={12} mono color="t2" numberOfLines={1} style={styles.shrink}>{cursor.index === null ? '' : readout('humidity')}</Txt>
      </View>
      <TimeChart height={70} label={h.aria.humidity} scale={humidity.scale} formatTick={(value) => `${value}%`} cursor={cursor}>
        <Path d={humidity.indoor} fill="none" stroke={palette.tm} strokeWidth={1.5} strokeDasharray="4 3" vectorEffect={THIN} />
        <Path d={humidity.line} fill="none" stroke={palette.hum} strokeWidth={2} vectorEffect={THIN} />
      </TimeChart>
      <KpiGrid kpis={[summary.temperature[0], summary.temperature[1], summary.temperature[3], summary.temperature[4]].filter((k) => k !== undefined)} />
    </AccordionSection>
  )
}

export function WindSection({ view, charts, summary, headline, cursor, axis, showIndoor, open, onToggle }: SectionProps) {
  const { t, format, palette } = usePreferences()
  const h = t.history
  const readout = useReadout(view, cursor, showIndoor)
  const rose = roseGeometry(view.rose)
  const dominant = view.summary.wind.dominantDirection
  const speedLimit = (kmh: number) => format.number(displaySpeed(kmh, view.units), view.units === 'metric' ? 0 : 1)
  const speeds = h.roseSpeeds(speedLimit(ROSE_SPEED_BINS_KMH[0]), speedLimit(ROSE_SPEED_BINS_KMH[1]), valueText(view.units, format).symbols.speed)
  return (
    <AccordionSection
      title={h.sections.wind.title}
      summary={headline}
      open={open}
      onToggle={onToggle}
      artBackground="wind-soft"
      art={<WindArt art={view.art} label={h.illustrations.wind(dominant ? t.wind.compass[dominant] : t.hero.calm)} />}
    >
      <Legend items={[{ kind: 'line', color: 'wind', label: h.legend.speed }, { kind: 'line', color: 'gust', label: h.legend.gust }]} />
      <Readout text={readout('wind')} />
      <TimeChart height={130} label={h.aria.wind} scale={charts.wind.scale} formatTick={(value) => format.number(value, decimalsFor(charts.wind.scale.step))} cursor={cursor}>
        <Path d={charts.wind.gust} fill="none" stroke={palette.gust} strokeWidth={1.5} vectorEffect={THIN} />
        <Path d={charts.wind.line} fill="none" stroke={palette.wind} strokeWidth={2.2} vectorEffect={THIN} />
      </TimeChart>
      <TimeAxis ticks={axis} />
      <View style={styles.roseRow}>
        <View accessible accessibilityRole="image" accessibilityLabel={h.aria.rose} style={styles.rose}>
          <Svg width={150} height={150} viewBox="0 0 240 240">
            <Path d={rose.grid} fill="none" stroke={palette.gr} strokeWidth={1.5} />
            <Path d={rose.wedges[2]} fill={palette['rose-2']} stroke={palette.sf} strokeWidth={1.5} />
            <Path d={rose.wedges[1]} fill={palette['rose-1']} stroke={palette.sf} strokeWidth={1.5} />
            <Path d={rose.wedges[0]} fill={palette['rose-0']} stroke={palette.sf} strokeWidth={1.5} />
            <Circle cx={ROSE.center} cy={ROSE.center} r={ROSE.inner} fill={palette.sf} stroke={palette.gs} strokeWidth={1.5} />
          </Svg>
          <Txt size={10} weight="semibold" style={styles.roseNorth}>N</Txt>
        </View>
        <View style={styles.roseLegend}>
          <Txt size={13} weight="semibold">{h.rose}</Txt>
          <Legend
            items={(['rose-0', 'rose-1', 'rose-2'] as const).map((color, i) => ({ kind: 'box' as const, color, label: speeds[i] as string }))}
          />
          <Txt size={10.5} mono color="t2" style={styles.caption}>
            {h.roseCaption(format.number(view.rose.maxPercent, 1), format.number(view.rose.calmPercent, 0))}
          </Txt>
        </View>
      </View>
      <KpiGrid kpis={[summary.wind[1], summary.wind[2], summary.wind[0], summary.wind[3]].filter((k) => k !== undefined)} />
    </AccordionSection>
  )
}

export function RainSection({ view, charts, summary, headline, cursor, axis, showIndoor, open, onToggle }: SectionProps) {
  const { t, format, palette } = usePreferences()
  const h = t.history
  const v = valueText(view.units, format)
  const readout = useReadout(view, cursor, showIndoor)
  const unit = v.symbols.rain
  const barLabel = view.resolution === '15m' ? h.legend.rainPerReading(unit) : h.legend.rainPer(h.legend.intervals[view.resolution], unit)
  return (
    <AccordionSection
      title={h.sections.rain.title}
      summary={headline}
      open={open}
      onToggle={onToggle}
      artBackground="rain-soft"
      art={<RainArt art={view.art} label={h.illustrations.rain(view.summary.rain.rainyDays, view.summary.rain.daysWithData)} />}
    >
      <Legend items={[{ kind: 'box', color: 'blue', label: barLabel }]} />
      <Readout text={readout('rain')} />
      <TimeChart height={110} label={h.aria.rain} scale={charts.rain.scale} formatTick={(value) => format.number(value, decimalsFor(charts.rain.scale.step))} cursor={cursor}>
        <Path d={charts.rain.bars} fill={palette.blue} />
      </TimeChart>
      <Legend items={[{ kind: 'line', color: 'blue', label: h.legend.cumulative(unit) }]} />
      <TimeChart height={60} label={h.aria.cumulative} scale={charts.cumulative.scale} formatTick={(value) => format.number(value, decimalsFor(charts.cumulative.scale.step))} cursor={cursor}>
        <Path d={charts.cumulative.area} fill={palette['cum-fill']} />
        <Path d={charts.cumulative.line} fill="none" stroke={palette.blue} strokeWidth={2} vectorEffect={THIN} />
      </TimeChart>
      <TimeAxis ticks={axis} />
      <KpiGrid kpis={summary.rain} />
    </AccordionSection>
  )
}

export function PressureSection({ view, charts, summary, headline, cursor, axis, showIndoor, open, onToggle }: SectionProps) {
  const { t, format, palette } = usePreferences()
  const h = t.history
  const v = valueText(view.units, format)
  const readout = useReadout(view, cursor, showIndoor)
  const trend = view.summary.pressure.trend
  return (
    <AccordionSection
      title={h.sections.pressure.title}
      summary={headline}
      open={open}
      onToggle={onToggle}
      artBackground="pres-soft"
      art={<PressureArt art={view.art} label={h.illustrations.pressure(v.pressureShort(view.summary.pressure.last), trend ? t.pressure.trends[trend] : '—')} />}
    >
      <Legend items={[{ kind: 'line', color: 'pres', label: h.legend.mean }, { kind: 'box', color: 'pres-band', label: h.legend.band }]} />
      <Txt size={11} color="tm">{h.legend.zoomedAxis}</Txt>
      <Readout text={readout('pressure')} />
      <TimeChart height={130} label={h.aria.pressure} scale={charts.pressure.scale} formatTick={(value) => format.number(value, decimalsFor(charts.pressure.scale.step))} cursor={cursor}>
        <Path d={charts.pressure.band} fill={palette['pres-band']} />
        <Path d={charts.pressure.line} fill="none" stroke={palette.pres} strokeWidth={2.2} vectorEffect={THIN} />
      </TimeChart>
      <TimeAxis ticks={axis} />
      <KpiGrid kpis={summary.pressure} />
    </AccordionSection>
  )
}

const styles = StyleSheet.create({
  indoorChip: { minHeight: 32, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  subhead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 2 },
  shrink: { flexShrink: 1 },
  roseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  rose: { width: 150, height: 150 },
  roseNorth: { position: 'absolute', top: -4, alignSelf: 'center' },
  roseLegend: { flex: 1, minWidth: 0, gap: 6 },
  caption: { lineHeight: 14 },
})
