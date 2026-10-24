'use client'

// Pantalla de carga (artboard `LoadingWeb`, RF-APP-02): la estación animada mientras llega el primer dato.
// Los pasos avanzan solos mientras se espera; al llegar la respuesta se completan. Si la consola no responde,
// se avisa y se ofrece reintentar.

import { LOADING_LAST_WAITING_STEP, LOADING_STEP_INTERVAL_MS, LOADING_VARIABLES, loadingProgress } from '@tt/core'
import { STATION_ILLUSTRATION_CSS, STATION_ILLUSTRATION_VIEWBOX } from '@tt/sky-art'
import { useEffect, useState } from 'react'
import { usePreferences } from '@/components/providers/app-providers'
import { StationLogo } from '@/components/shell/station-logo'
import { STATION_ILLUSTRATION_MARKUP } from '@/lib/art/markup'

const SOFT_BACKGROUND = { temp: 'bg-wx-temp-soft border-wx-temp-soft', wind: 'bg-wx-wind-soft border-wx-wind-soft', rain: 'bg-wx-rain-soft border-wx-rain-soft', pres: 'bg-wx-pres-soft border-wx-pres-soft' }

export function LoadingScreen({ done, failed, onRetry }: { done: boolean; failed: boolean; onRetry: () => void }) {
  const { t, preferences } = usePreferences()
  const [waitingStep, setWaitingStep] = useState(0)

  useEffect(() => {
    if (done || failed) return
    const timer = setInterval(() => setWaitingStep((step) => Math.min(step + 1, LOADING_LAST_WAITING_STEP)), LOADING_STEP_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [done, failed])

  const { step, percent, variables, rainVisible, spinMs } = loadingProgress(waitingStep, done)

  return (
    <div
      className="wx-load-root wx-zoom relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,var(--sky1),var(--sky2))]"
      data-rain-on={rainVisible}
      style={{ ['--spin' as string]: `${spinMs}ms` }}
    >
      <style>{STATION_ILLUSTRATION_CSS}</style>
      <svg viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[220px] w-full">
        <path d="M0 120C160 70 320 80 480 112S800 60 1000 96V200H0z" fill="var(--hill)" />
        <path d="M0 160C200 128 380 136 560 156S860 128 1000 140V200H0z" fill="var(--hill2)" />
      </svg>
      <svg className="wx-load-drift absolute left-[8%] top-[9%] h-[60px] w-[200px]" viewBox="0 0 200 60" aria-hidden="true">
        <path d="M20 54h120a24 24 0 0 0 0-48 34 34 0 0 0-62-8A28 28 0 0 0 20 54z" fill="var(--cloud)" opacity="0.85" />
      </svg>
      <svg className="wx-load-drift2 absolute right-[10%] top-[18%] h-[45px] w-[150px]" viewBox="0 0 200 60" aria-hidden="true">
        <path d="M20 54h120a24 24 0 0 0 0-48 34 34 0 0 0-62-8A28 28 0 0 0 20 54z" fill="var(--cloud)" opacity="0.7" />
      </svg>

      <main className="relative mx-auto box-border flex min-h-screen max-w-[1120px] flex-wrap items-center justify-center gap-x-[72px] gap-y-8 px-6 py-12">
        <div className="relative flex flex-[0_1_420px] justify-center">
          <div aria-hidden="true" className="absolute left-1/2 top-[42%] size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--halo)_0%,transparent_70%)]" />
          <svg
            viewBox={STATION_ILLUSTRATION_VIEWBOX}
            role="img"
            aria-label={t.loading.illustration}
            className="relative h-auto w-full max-w-[360px] overflow-visible"
            dangerouslySetInnerHTML={STATION_ILLUSTRATION_MARKUP}
          />
        </div>

        <div className="flex max-w-[460px] flex-[1_1_360px] flex-col gap-[22px]">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-wx-rain-soft">
              <StationLogo size={22} />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold">{t.app.stationName('Liz')}</span>
              <span className="text-xs text-wx-t2">{t.loading.place}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-[40px] font-light leading-[1.1] tracking-[-0.02em]">{t.loading.title}</h1>
            <p className="text-[15px] leading-normal text-wx-t2">{t.loading.subtitle}</p>
          </div>

          <div role="status" aria-live="polite" className="flex flex-col gap-2.5" lang={preferences.language}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium">{failed ? t.loading.failed : t.loading.steps[step]}</span>
              <span className="num text-[13px] text-wx-t2">{percent}%</span>
            </div>
            <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={t.loading.progress} className="h-2 overflow-hidden rounded-lg bg-wx-gr">
              <div className="h-full rounded-lg bg-[linear-gradient(90deg,var(--hum),var(--wind),var(--temp))] transition-[width] duration-600 ease-out" style={{ width: `${percent}%` }} />
            </div>
          </div>

          {failed ? (
            <button type="button" onClick={onRetry} className="min-h-11 cursor-pointer self-start rounded-xl border border-wx-bd bg-wx-sf px-5 text-sm font-medium">
              {t.live.retry}
            </button>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {LOADING_VARIABLES.map((variable) => {
                const received = variables[variable] === 'received'
                const receiving = variables[variable] === 'receiving'
                return (
                  <li
                    key={variable}
                    className={`flex min-h-10 items-center gap-2 rounded-full border-[1.5px] px-3.5 text-[13px] font-medium transition-colors ${
                      received ? SOFT_BACKGROUND[variable] : receiving ? 'border-wx-tx bg-wx-sf' : 'border-wx-gr text-wx-tm opacity-70'
                    }`}
                  >
                    {t.loading.variables[variable]}
                    <span className="sr-only">: {received ? t.loading.received : receiving ? t.loading.receiving : t.loading.waiting}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
