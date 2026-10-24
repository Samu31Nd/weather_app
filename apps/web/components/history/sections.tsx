// Las cuatro secciones del artboard `Main` (RF-APP-07, RF-APP-08). Solo dibujan: escalas, trazos, indicadores y
// textos llegan hechos de @tt/core (`historyCharts`, `buildHistoryView`) y @tt/i18n (`historySummaryText`,
// `readoutText`).

import { type HistoryCharts, type HistoryView, ROSE, ROSE_SPEED_BINS_KMH, displaySpeed, roseGeometry } from '@tt/core'
import { type HistorySection, type HistorySummaryText, readoutText, valueText } from '@tt/i18n'
import { usePreferences } from '@/components/providers/app-providers'
import { PressureArt, RainArt, TemperatureArt, WindArt } from './history-art'
import { HistorySection as Section } from './section'
import { type ChartCursor, LegendItem, LegendRow, LegendSwatch, TimeAxis, TimeChart } from './time-chart'

export interface SectionProps {
  readonly view: HistoryView
  readonly charts: HistoryCharts
  readonly summary: HistorySummaryText
  readonly cursor: ChartCursor
  readonly axis: ReadonlyArray<{ readonly label: string; readonly fraction: number }>
  readonly showIndoor: boolean
}

const thin = { vectorEffect: 'non-scaling-stroke' } as const

function useReadout(view: HistoryView, cursor: ChartCursor, showIndoor: boolean) {
  const { t, format } = usePreferences()
  return (section: HistorySection) => (cursor.index === null ? t.history.hoverHint : readoutText(view, cursor.index, section, showIndoor, t, format))
}

export function TemperatureSection({ view, charts, summary, cursor, axis, showIndoor }: SectionProps) {
  const { t, format } = usePreferences()
  const h = t.history
  const v = valueText(view.units, format)
  const readout = useReadout(view, cursor, showIndoor)
  const { temperature, humidity } = charts
  return (
    <Section
      label={h.sections.temperature.title}
      title={h.sections.temperature.title}
      description={h.sections.temperature.description}
      kpis={summary.temperature}
      artBackground="bg-wx-temp-soft"
      art={<TemperatureArt art={view.art} label={h.illustrations.temperature(v.temperature(view.summary.temperature.mean), format.number(view.summary.temperature.humidityMean, 0))} />}
    >
      <LegendRow
        readout={readout('temperature')}
        items={
          <>
            <LegendItem swatch={<LegendSwatch kind="line" colorClass="bg-wx-temp" />}>{h.legend.outdoorMean}</LegendItem>
            <LegendItem swatch={<LegendSwatch kind="box" colorClass="bg-wx-temp-band" />}>{h.legend.band}</LegendItem>
            {showIndoor ? <LegendItem swatch={<LegendSwatch kind="dashed" colorClass="border-wx-tm" />}>{h.legend.indoor}</LegendItem> : null}
          </>
        }
      />
      <TimeChart height={220} label={h.aria.temperature} scale={temperature.scale} formatTick={(value) => `${value}°`} cursor={cursor}>
        <path d={temperature.band} fill="var(--temp-band)" />
        <path d={temperature.indoor} fill="none" stroke="var(--tm)" strokeWidth="1.5" strokeDasharray="4 3" style={thin} />
        <path d={temperature.line} fill="none" stroke="var(--temp)" strokeWidth="2" strokeLinejoin="round" style={thin} />
      </TimeChart>
      <TimeAxis ticks={axis} />
      <LegendRow
        readout={readout('humidity')}
        items={
          <>
            <span className="font-medium text-wx-tx">{h.legend.relativeHumidity}</span>
            <LegendItem swatch={<LegendSwatch kind="line" colorClass="bg-wx-hum" />}>{h.legend.outdoor}</LegendItem>
            {showIndoor ? <LegendItem swatch={<LegendSwatch kind="dashed" colorClass="border-wx-tm" />}>{h.legend.indoor}</LegendItem> : null}
          </>
        }
      />
      <TimeChart height={110} label={h.aria.humidity} scale={humidity.scale} formatTick={(value) => `${value}%`} cursor={cursor}>
        <path d={humidity.indoor} fill="none" stroke="var(--tm)" strokeWidth="1.5" strokeDasharray="4 3" style={thin} />
        <path d={humidity.line} fill="none" stroke="var(--hum)" strokeWidth="2" strokeLinejoin="round" style={thin} />
      </TimeChart>
      <TimeAxis ticks={axis} />
    </Section>
  )
}

export function WindSection({ view, charts, summary, cursor, axis, showIndoor }: SectionProps) {
  const { t, format } = usePreferences()
  const h = t.history
  const readout = useReadout(view, cursor, showIndoor)
  const rose = roseGeometry(view.rose)
  const dominant = view.summary.wind.dominantDirection
  const speedLimit = (kmh: number) => format.number(displaySpeed(kmh, view.units), view.units === 'metric' ? 0 : 1)
  const speeds = h.roseSpeeds(speedLimit(ROSE_SPEED_BINS_KMH[0]), speedLimit(ROSE_SPEED_BINS_KMH[1]), valueText(view.units, format).symbols.speed)
  return (
    <Section
      label={h.sections.wind.title}
      title={h.sections.wind.title}
      description={h.sections.wind.description}
      kpis={summary.wind}
      artBackground="bg-wx-wind-soft"
      art={<WindArt art={view.art} label={h.illustrations.wind(dominant ? t.wind.compass[dominant] : t.hero.calm)} />}
    >
      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-3">
          <LegendRow
            readout={readout('wind')}
            items={
              <>
                <LegendItem swatch={<LegendSwatch kind="line" colorClass="bg-wx-wind" />}>{h.legend.speed}</LegendItem>
                <LegendItem swatch={<LegendSwatch kind="line" colorClass="bg-wx-gust" />}>{h.legend.gust}</LegendItem>
              </>
            }
          />
          <TimeChart height={170} label={h.aria.wind} scale={charts.wind.scale} formatTick={(value) => format.number(value, charts.wind.scale.step < 1 ? 1 : 0)} cursor={cursor}>
            <path d={charts.wind.gust} fill="none" stroke="var(--gust)" strokeWidth="1.5" strokeLinejoin="round" style={thin} />
            <path d={charts.wind.line} fill="none" stroke="var(--wind)" strokeWidth="2" strokeLinejoin="round" style={thin} />
          </TimeChart>
          <TimeAxis ticks={axis} />
        </div>
        <div className="flex flex-[1_1_260px] flex-col items-center gap-2.5">
          <div className="self-start text-[13px] font-medium">{h.rose}</div>
          <div role="img" aria-label={h.aria.rose} className="relative size-60">
            <svg viewBox="0 0 240 240" aria-hidden="true" className="block size-60">
              <path d={rose.grid} fill="none" stroke="var(--gr)" strokeWidth="1" />
              <path d={rose.wedges[2]} fill="var(--rose-2)" stroke="var(--sf)" strokeWidth="1" />
              <path d={rose.wedges[1]} fill="var(--rose-1)" stroke="var(--sf)" strokeWidth="1" />
              <path d={rose.wedges[0]} fill="var(--rose-0)" stroke="var(--sf)" strokeWidth="1" />
              <circle cx={ROSE.center} cy={ROSE.center} r={ROSE.inner} fill="var(--sf)" stroke="var(--gs)" strokeWidth="1" />
            </svg>
            <span aria-hidden="true" className="absolute -top-0.5 left-1/2 -translate-x-1/2 text-xs font-semibold">N</span>
            <span aria-hidden="true" className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-xs font-semibold">S</span>
            <span aria-hidden="true" className="absolute -right-0.5 top-1/2 -translate-y-1/2 text-xs font-semibold">E</span>
            <span aria-hidden="true" className="absolute -left-0.5 top-1/2 -translate-y-1/2 text-xs font-semibold">{t.wind.west}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-3.5 gap-y-1.5 text-xs text-wx-t2">
            {(['bg-wx-rose-0', 'bg-wx-rose-1', 'bg-wx-rose-2'] as const).map((swatch, i) => (
              <LegendItem key={swatch} swatch={<LegendSwatch kind="box" colorClass={swatch} />}>{speeds[i]}</LegendItem>
            ))}
          </div>
          <div className="num text-center text-xs text-wx-t2">
            {h.roseCaption(format.number(view.rose.maxPercent, 1), format.number(view.rose.calmPercent, 0))}
          </div>
        </div>
      </div>
    </Section>
  )
}

export function RainSection({ view, charts, summary, cursor, axis, showIndoor }: SectionProps) {
  const { t, format } = usePreferences()
  const h = t.history
  const v = valueText(view.units, format)
  const readout = useReadout(view, cursor, showIndoor)
  const unit = v.symbols.rain
  const barLabel = view.resolution === '15m' ? h.legend.rainPerReading(unit) : h.legend.rainPer(h.legend.intervals[view.resolution], unit)
  const decimals = (step: number) => (step < 1 ? (step < 0.1 ? 2 : 1) : 0)
  return (
    <Section
      label={h.sections.rain.title}
      title={h.sections.rain.title}
      description={h.sections.rain.description}
      kpis={summary.rain}
      artBackground="bg-wx-rain-soft"
      art={<RainArt art={view.art} label={h.illustrations.rain(view.summary.rain.rainyDays, view.summary.rain.daysWithData)} />}
    >
      <LegendRow readout={readout('rain')} items={<LegendItem swatch={<LegendSwatch kind="box" colorClass="bg-wx-blue" />}>{barLabel}</LegendItem>} />
      <TimeChart height={140} label={h.aria.rain} scale={charts.rain.scale} formatTick={(value) => format.number(value, decimals(charts.rain.scale.step))} cursor={cursor}>
        <path d={charts.rain.bars} fill="var(--blue)" />
      </TimeChart>
      <div className="mt-1 flex flex-wrap gap-x-[18px] text-[13px] text-wx-t2">
        <LegendItem swatch={<LegendSwatch kind="line" colorClass="bg-wx-blue" />}>{h.legend.cumulative(unit)}</LegendItem>
      </div>
      <TimeChart height={80} label={h.aria.cumulative} scale={charts.cumulative.scale} formatTick={(value) => format.number(value, decimals(charts.cumulative.scale.step))} cursor={cursor}>
        <path d={charts.cumulative.area} fill="var(--cum-fill)" />
        <path d={charts.cumulative.line} fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinejoin="round" style={thin} />
      </TimeChart>
      <TimeAxis ticks={axis} />
    </Section>
  )
}

export function PressureSection({ view, charts, summary, cursor, axis, showIndoor }: SectionProps) {
  const { t, format } = usePreferences()
  const h = t.history
  const v = valueText(view.units, format)
  const readout = useReadout(view, cursor, showIndoor)
  const trend = view.summary.pressure.trend
  const step = charts.pressure.scale.step
  return (
    <Section
      label={h.sections.pressure.title}
      title={h.sections.pressure.title}
      description={h.sections.pressure.description}
      kpis={summary.pressure}
      artBackground="bg-wx-pres-soft"
      art={<PressureArt art={view.art} label={h.illustrations.pressure(v.pressureShort(view.summary.pressure.last), trend ? t.pressure.trends[trend] : '—')} />}
    >
      <LegendRow
        readout={readout('pressure')}
        items={
          <>
            <LegendItem swatch={<LegendSwatch kind="line" colorClass="bg-wx-pres" />}>{h.legend.mean}</LegendItem>
            <LegendItem swatch={<LegendSwatch kind="box" colorClass="bg-wx-pres-band" />}>{h.legend.band}</LegendItem>
            <span className="text-wx-tm">{h.legend.zoomedAxis}</span>
          </>
        }
      />
      <TimeChart height={150} label={h.aria.pressure} scale={charts.pressure.scale} formatTick={(value) => format.number(value, step < 0.1 ? 2 : step < 1 ? 1 : 0)} cursor={cursor}>
        <path d={charts.pressure.band} fill="var(--pres-band)" />
        <path d={charts.pressure.line} fill="none" stroke="var(--pres)" strokeWidth="2" strokeLinejoin="round" style={thin} />
      </TimeChart>
      <TimeAxis ticks={axis} />
    </Section>
  )
}
