'use client'

// Pantalla "Histórico" (CU-04, CU-05; artboard `Main`): controles y las secciones de temperatura y humedad, viento,
// lluvia y presión. Pide los datos con `useHistory`; las gráficas comparten la posición del cursor.

import { type ExportFormat, HISTORY_VARIABLES, WEB_CHART_HEIGHTS, exportHistory, historyCharts, xTickIndices } from '@tt/core'
import { axisLabel, historySummaryText, periodLabel } from '@tt/i18n'
import { useEffect, useMemo, useState } from 'react'
import { useCore, usePreferences } from '@/components/providers/app-providers'
import { SiteHeader } from '@/components/shell/site-header'
import { useHistory } from '@/hooks/use-history'
import { saveFile } from '@/lib/download/save-file'
import { StationArt } from './history-art'
import { HistoryControls } from './history-controls'
import { PressureSection, RainSection, type SectionProps, TemperatureSection, WindSection } from './sections'
import { CHART_WIDTH } from './time-chart'

export function HistoryScreen() {
  const now = useClock()
  const { t, format } = usePreferences()
  const history = useHistory()
  const [cursorIndex, setCursorIndex] = useState<number | null>(null)
  const { view, showIndoor } = history
  const h = t.history

  useEffect(() => setCursorIndex(null), [view])

  // Gráficas, indicadores y eje solo cambian con los datos; el cursor cambia con cada movimiento del puntero.
  const prepared = useMemo(() => {
    if (view === null) return null
    const count = view.buckets.length
    return {
      charts: historyCharts(view, { showIndoor, width: CHART_WIDTH, heights: WEB_CHART_HEIGHTS }),
      summary: historySummaryText(view, t, format),
      axis: xTickIndices(count).map((i) => ({
        label: axisLabel(view.buckets[i]?.start as Date, view.resolution, history.days, t),
        fraction: (i + 0.5) / count,
      })),
    }
  }, [view, showIndoor, t, format, history.days])

  const download = (formatName: ExportFormat) => {
    if (view === null) return
    const variables = HISTORY_VARIABLES.filter((variable) => history.visible[variable])
    saveFile(exportHistory(view, { format: formatName, variables, includeIndoor: showIndoor }))
  }

  const props: SectionProps | null =
    view && prepared ? { view, showIndoor, ...prepared, cursor: { index: cursorIndex, count: view.buckets.length, onChange: setCursorIndex } } : null

  return (
    <div className="wx-zoom min-h-screen bg-wx-bg">
      <SiteHeader active="history" now={now} stationName="Liz" />
      <main className="mx-auto box-border flex max-w-[1248px] flex-col gap-5 px-6 pb-16 pt-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-[18px]">
            <StationArt label={h.stationArt} />
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[28px] font-semibold tracking-[-0.01em]">{h.title}</h1>
              <p className="text-sm text-wx-t2">{h.subtitle}</p>
            </div>
          </div>
          {view ? (
            <p className="text-[13px] text-wx-t2">
              <span className="num text-wx-tx">{periodLabel(view.range, t)}</span> · {h.delayNote}
            </p>
          ) : null}
        </header>

        <HistoryControls history={history} onDownload={download} />

        {history.status === 'loading' ? <StatusCard>{h.loading}</StatusCard> : null}
        {history.status === 'failed' ? (
          <StatusCard>
            {h.failed}{' '}
            <button type="button" onClick={history.retry} className="ml-2 min-h-11 cursor-pointer rounded-xl border border-wx-bd bg-wx-sf px-5 font-medium">
              {t.live.retry}
            </button>
          </StatusCard>
        ) : null}
        {props?.view.readings === 0 ? <StatusCard>{h.empty}</StatusCard> : null}
        {props && props.view.readings > 0 ? (
          <>
            {history.visible.temperature ? <TemperatureSection {...props} /> : null}
            {history.visible.wind ? <WindSection {...props} /> : null}
            {history.visible.rain ? <RainSection {...props} /> : null}
            {history.visible.pressure ? <PressureSection {...props} /> : null}
          </>
        ) : null}
      </main>
    </div>
  )
}

function StatusCard({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" className="flex min-h-[120px] items-center justify-center rounded-2xl border border-wx-bd bg-wx-sf px-6 text-sm text-wx-t2">
      {children}
    </div>
  )
}

function useClock(): Date {
  const core = useCore()
  const [now, setNow] = useState(() => core.clock.now())
  useEffect(() => {
    const tick = setInterval(() => setNow(core.clock.now()), 1_000)
    return () => clearInterval(tick)
  }, [core])
  return now
}
