// Controles del artboard `Main` (RF-APP-06, RF-APP-07, RF-APP-09): variables visibles, descarga CSV/JSON, rango
// (atajos o últimos N días), resolución permitida para ese rango y sensores interiores.

import {
  type ExportFormat, HISTORY_PRESETS, HISTORY_VARIABLES, type HistoryVariable, RESOLUTIONS, estimatedPoints, isResolutionAllowed,
} from '@tt/core'
import { periodBounds } from '@tt/i18n'
import { useState } from 'react'
import { usePreferences } from '@/components/providers/app-providers'
import type { HistoryState } from '@/hooks/use-history'

const pill = (active: boolean, disabled = false) =>
  `min-h-11 rounded-lg px-3.5 text-[13px] font-medium ${
    disabled
      ? 'cursor-not-allowed border border-dashed border-wx-gs text-wx-tm'
      : active
        ? 'cursor-pointer border border-wx-tx bg-wx-tx text-wx-sf'
        : 'cursor-pointer border border-wx-gs bg-wx-sf'
  }`

const label = 'text-xs font-medium uppercase leading-4 tracking-[0.06em] text-wx-t2'

export function HistoryControls({ history, onDownload }: { history: HistoryState; onDownload: (format: ExportFormat) => void }) {
  const { t } = usePreferences()
  const h = t.history
  const visibleCount = Object.values(history.visible).filter(Boolean).length
  const points = history.view?.buckets.length ?? estimatedPoints(history.days, history.resolution)

  return (
    <section aria-label={h.controls} className="flex flex-col gap-4 rounded-2xl border border-wx-bd bg-wx-sf px-5 py-4">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="flex flex-col gap-2">
          <span className={label}>{h.variables}</span>
          <div className="flex flex-wrap gap-1.5">
            {HISTORY_VARIABLES.map((variable) => (
              <VariableChip key={variable} variable={variable} history={history} lastOne={history.visible[variable] && visibleCount === 1} />
            ))}
            <button type="button" className={pill(visibleCount === 4)} aria-pressed={visibleCount === 4} onClick={history.showAllVariables}>
              {h.all}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="num text-right text-xs text-wx-t2">{h.downloadSummary(points, visibleCount, h.resolutions[history.resolution])}</span>
          <div role="group" aria-label={h.downloadAria} className="inline-flex overflow-hidden rounded-lg border border-wx-gs bg-wx-sf">
            <span className="inline-flex min-h-11 items-center gap-2 border-r border-wx-gs px-3.5 text-[13px] font-medium text-wx-t2">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 2.5v8M4.5 7L8 10.5 11.5 7M3 13.5h10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {h.download}
            </span>
            {(['csv', 'json'] as const).map((format, i) => (
              <button
                key={format}
                type="button"
                title={format === 'csv' ? h.csvTitle : h.jsonTitle}
                disabled={history.view === null}
                onClick={() => onDownload(format)}
                className={`num min-h-11 min-w-16 cursor-pointer px-3.5 text-[13px] font-medium disabled:cursor-progress disabled:opacity-60 ${i === 0 ? 'border-r border-wx-gs' : ''}`}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-wx-bd" />

      <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
        <div className="flex flex-col gap-2">
          <span className={label}>{h.range}</span>
          <div className="flex flex-wrap gap-1.5">
            {HISTORY_PRESETS.map((preset) => {
              const active = history.period.kind === 'preset' && history.period.preset === preset
              return (
                <button key={preset} type="button" className={pill(active)} aria-pressed={active} onClick={() => history.selectPeriod({ kind: 'preset', preset })}>
                  {h.presets[preset]}
                </button>
              )
            })}
            <CustomDays history={history} />
          </div>
          <CustomHint history={history} />
        </div>
        <div className="flex flex-col gap-2">
          <span className={label}>{h.resolution}</span>
          <div className="flex flex-wrap gap-1.5">
            {RESOLUTIONS.map((resolution) => {
              const allowed = isResolutionAllowed(history.days, resolution)
              const estimate = estimatedPoints(history.days, resolution)
              const active = resolution === history.resolution
              return (
                <button
                  key={resolution}
                  type="button"
                  disabled={!allowed}
                  aria-pressed={active}
                  title={allowed ? h.pointsApprox(estimate) : estimate > 800 ? h.tooMany(estimate) : h.tooFew(estimate)}
                  className={pill(active, !allowed)}
                  onClick={() => history.selectResolution(resolution)}
                >
                  {h.resolutions[resolution]}
                </button>
              )
            })}
          </div>
        </div>
        <div className="mt-6 flex min-h-11 min-w-0 flex-[1_1_220px] flex-col justify-center gap-1">
          <div className="num text-[13px]">
            {h.caption(points, h.resolutions[history.resolution], history.view?.emptyBuckets ?? 0)}
          </div>
          <div className="text-[13px] text-wx-t2">{h.resolutionHow[history.resolution]}</div>
        </div>
        <label className="mt-6 flex min-h-11 cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={history.showIndoor}
            onChange={(event) => history.setShowIndoor(event.target.checked)}
            className="size-[18px] accent-[var(--tx)]"
          />
          {h.showIndoor}
        </label>
      </div>
    </section>
  )
}

function VariableChip({ variable, history, lastOne }: { variable: HistoryVariable; history: HistoryState; lastOne: boolean }) {
  const { t } = usePreferences()
  const h = t.history
  const active = history.visible[variable]
  const name = h.variableNames[variable]
  return (
    <button
      type="button"
      aria-pressed={active}
      title={lastOne ? h.keepOne : active ? h.hide(name) : h.show(name)}
      onClick={() => history.toggleVariable(variable)}
      className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3.5 text-[13px] font-medium ${
        active ? 'border border-wx-tx bg-wx-sf shadow-[inset_0_0_0_1px_var(--tx)]' : 'border border-dashed border-wx-gs text-wx-t2'
      }`}
    >
      <VariableIcon variable={variable} />
      {name}
      {active ? (
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </button>
  )
}

function VariableIcon({ variable }: { variable: HistoryVariable }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      {variable === 'temperature' ? (
        <>
          <path d="M6.5 9.6V3a1.5 1.5 0 0 1 3 0v6.6a3 3 0 1 1-3 0z" fill="none" stroke="var(--temp)" strokeWidth="1.5" />
          <circle cx="8" cy="12" r="1.3" fill="var(--temp)" />
        </>
      ) : variable === 'wind' ? (
        <path d="M2 6h8a2 2 0 1 0-2-2M2 10h10a2 2 0 1 1-2 2" fill="none" stroke="var(--wind)" strokeWidth="1.5" strokeLinecap="round" />
      ) : variable === 'rain' ? (
        <>
          <path d="M4.5 9h7a2.5 2.5 0 0 0 0-5 3.5 3.5 0 0 0-6.6-.9A2.5 2.5 0 0 0 4.5 9z" fill="none" stroke="var(--blue)" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M6 11.5l-.8 2M9.5 11.5l-.8 2" stroke="var(--blue)" strokeWidth="1.4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M2.8 11.5a5.5 5.5 0 1 1 10.4 0" fill="none" stroke="var(--pres)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8 10l2.5-3.5" stroke="var(--pres)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8" cy="10" r="1.2" fill="var(--pres)" />
        </>
      )}
    </svg>
  )
}

/** "Últimos [60] días": el número se puede escribir; vacío o fuera de rango no cambia el periodo. */
function CustomDays({ history }: { history: HistoryState }) {
  const { t } = usePreferences()
  const h = t.history
  const active = history.period.kind === 'custom'
  const [text, setText] = useState('60')
  const apply = (value: string) => {
    setText(value)
    const days = Number.parseInt(value, 10)
    if (days > 0) history.selectPeriod({ kind: 'custom', days })
  }
  return (
    <div
      className={`inline-flex min-h-11 items-center gap-2 rounded-lg border bg-wx-sf pl-3.5 pr-3 text-[13px] font-medium ${
        active ? 'border-wx-tx shadow-[inset_0_0_0_1px_var(--tx)]' : 'border-wx-gs'
      }`}
    >
      <label htmlFor="history-days" className="cursor-pointer">{h.lastN}</label>
      <input
        id="history-days"
        type="number"
        inputMode="numeric"
        min={1}
        max={history.maxDays}
        value={text}
        aria-describedby="history-days-hint"
        onFocus={() => apply(text)}
        onChange={(event) => apply(event.target.value)}
        className="num h-[30px] w-[58px] rounded-md border border-wx-gs bg-wx-sf px-1.5 text-right text-[13px]"
      />
      <span>{h.days}</span>
    </div>
  )
}

function CustomHint({ history }: { history: HistoryState }) {
  const { t } = usePreferences()
  const h = t.history
  const period = history.period
  const bounds = history.view ? periodBounds(history.view.range, t) : null
  const text =
    period.kind !== 'custom'
      ? h.customHintIdle(history.maxDays)
      : period.days > history.maxDays
        ? h.customHintMax(history.maxDays)
        : bounds
          ? h.customHintRange(bounds.from, bounds.to)
          : ''
  return (
    <span id="history-days-hint" className="text-xs text-wx-t2">
      {text}
    </span>
  )
}
