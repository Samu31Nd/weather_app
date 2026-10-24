'use client'

// Cabecera común (artboard `Dashboard`): estación, estado en vivo, navegación, actualizar, unidades, tamaño de
// texto, idioma, tema y reloj de Ciudad de México.

import type { LiveStatus } from '@tt/core'
import Link from 'next/link'
import { usePreferences } from '@/components/providers/app-providers'
import { Segmented } from './segmented'
import { StationLogo } from './station-logo'

export interface LiveIndicator {
  readonly status: LiveStatus
  readonly secondsSinceUpdate: number | null
  readonly observedAt: Date | null
  readonly refreshing: boolean
  readonly onRefresh: () => void
}

export function SiteHeader({ active, live, now, stationName }: {
  active: 'now' | 'history'
  live?: LiveIndicator
  now: Date
  stationName: string
}) {
  const { t, format, preferences, update, isDark } = usePreferences()
  return (
    <header className="border-b border-wx-bd bg-wx-sf">
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-wx-rain-soft">
              <StationLogo />
            </div>
            <div className="flex flex-col gap-px">
              <span className="text-base font-semibold">{t.app.stationName(stationName)}</span>
              <span className="text-xs text-wx-t2">{t.app.place}</span>
            </div>
          </div>
          {live ? <LiveBadge live={live} /> : null}
        </div>

        <nav aria-label={t.app.sections} className="flex gap-1 rounded-xl bg-wx-bg p-1">
          <NavLink href="/" current={active === 'now'} label={t.app.navNow} />
          <NavLink href="/historico" current={active === 'history'} label={t.app.navHistory} />
        </nav>

        <div className="flex flex-wrap items-center gap-2.5">
          {live ? (
            <button
              type="button"
              onClick={live.onRefresh}
              disabled={live.refreshing}
              aria-label={t.live.refresh}
              title={t.live.refresh}
              className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-[10px] border border-wx-bd bg-wx-sf px-3 text-xs font-medium text-wx-tx disabled:cursor-progress disabled:opacity-75"
            >
              <svg className={live.refreshing ? 'wx-spin' : undefined} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3.2h-3.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {live.refreshing ? t.live.refreshing : t.live.refreshShort}
            </button>
          ) : null}
          <Segmented
            label={t.settings.units}
            value={preferences.units}
            onChange={(units) => update({ units })}
            options={[{ value: 'metric', label: t.settings.metric }, { value: 'imperial', label: t.settings.imperial }]}
          />
          <Segmented
            label={t.settings.textSize}
            value={preferences.textSize}
            onChange={(textSize) => update({ textSize })}
            options={[
              { value: 's', label: 'A', ariaLabel: t.settings.textSizes.s, className: 'text-[12px] px-2' },
              { value: 'm', label: 'A', ariaLabel: t.settings.textSizes.m, className: 'text-[14px] px-2' },
              { value: 'l', label: 'A', ariaLabel: t.settings.textSizes.l, className: 'text-[17px] px-2' },
            ]}
          />
          <Segmented
            label={t.settings.language}
            value={preferences.language}
            onChange={(language) => update({ language })}
            options={[{ value: 'es', label: 'ES', lang: 'es' }, { value: 'en', label: 'EN', lang: 'en' }]}
          />
          <button
            type="button"
            onClick={() => update({ theme: isDark ? 'light' : 'dark' })}
            aria-label={isDark ? t.settings.toLight : t.settings.toDark}
            title={isDark ? t.settings.toLight : t.settings.toDark}
            className="flex size-9 cursor-pointer items-center justify-center rounded-[10px] border border-wx-bd bg-wx-sf text-wx-t2"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <div className="flex flex-col items-end gap-px">
            <span className="num text-[15px] font-medium">{format.clock(now)}</span>
            <span className="text-[11px] text-wx-t2">{format.longDate(now)}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

function LiveBadge({ live }: { live: LiveIndicator }) {
  const { t, format } = usePreferences()
  const healthy = live.status === 'ok' || live.status === 'loading'
  const label = live.status === 'stale' ? t.live.stale : healthy ? t.live.live : t.live.offline
  const detail =
    live.status === 'offlineWithData'
      ? t.live.offlineSince(format.time(live.observedAt))
      : live.secondsSinceUpdate === null || live.secondsSinceUpdate < 2
        ? t.live.justUpdated
        : t.live.secondsAgo(live.secondsSinceUpdate)
  const dot = healthy ? 'bg-wx-green' : live.status === 'stale' ? 'bg-wx-yellow' : 'bg-wx-red'
  return (
    <div role="status" className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ${healthy ? 'bg-wx-ok-soft' : 'bg-wx-sun-soft'}`}>
      <span className="relative inline-block size-2">
        {healthy ? <span className={`wx-pulse absolute inset-0 rounded-full ${dot}`} /> : null}
        <span className={`absolute inset-0 rounded-full ${dot}`} />
      </span>
      <span className="font-semibold">{label}</span>
      <span className="num text-wx-t2">{detail}</span>
    </div>
  )
}

function NavLink({ href, current, label }: { href: string; current: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      className={`inline-flex min-h-9 items-center rounded-[9px] px-4 text-[13px] no-underline ${
        current ? 'bg-wx-sf font-semibold text-wx-tx shadow-[0_1px_2px_rgba(76,79,105,0.12)]' : 'font-medium text-wx-t2'
      }`}
    >
      {label}
    </Link>
  )
}

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <circle cx="9" cy="9" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M3.7 14.3l1.4-1.4M12.9 5.1l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path d="M14.5 11.2A6 6 0 0 1 6.8 3.5a6 6 0 1 0 7.7 7.7z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)
