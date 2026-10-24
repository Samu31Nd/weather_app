// El sol hoy (RF-APP-01): amanecer, mediodía solar, ocaso y la posición del sol sobre su arco.

import { type CurrentConditions, sunArcPath, sunArcPoint } from '@tt/core'
import { Badge, Card, CardHeader } from '@/components/shell/card'
import { usePreferences } from '@/components/providers/app-providers'

export function SunCard({ sun }: { sun: CurrentConditions['sun'] }) {
  const { t, format } = usePreferences()
  const progress = sun.progress
  const position = progress === null ? null : sunArcPoint(progress)
  const badge =
    sun.minutesToNextEvent === null
      ? null
      : sun.isDay
        ? t.sun.daylightLeft(format.duration(sun.minutesToNextEvent))
        : t.sun.sunriseIn(format.duration(sun.minutesToNextEvent))
  const elapsed = progress === null ? null : sunArcPath(progress)

  return (
    <Card label={t.sun.title} className="flex-1 justify-between gap-2.5">
      <CardHeader
        iconBg="bg-wx-sun-soft"
        title={t.sun.title}
        icon={
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="10" cy="10" r="4" fill="var(--yellow)" />
            <path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6L16 16M4 16l1.4-1.4M14.6 5.4L16 4" stroke="var(--yellow)" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        }
        badge={badge ? <Badge className="bg-wx-sun-soft">{badge}</Badge> : null}
      />
      <svg
        viewBox="0 0 320 96"
        role="img"
        aria-label={t.sun.pathLabel(format.time(sun.sunrise), format.time(sun.sunset), progress === null ? null : Math.round(progress * 100))}
        className="block h-auto w-full"
      >
        <path d="M20 88H300" stroke="var(--gs)" strokeWidth="1.2" strokeDasharray="4 4" />
        <path d={sunArcPath(1)} fill="none" stroke="var(--gs)" strokeWidth="2" strokeDasharray="3 4" />
        {elapsed ? <path d={elapsed} fill="none" stroke="var(--yellow)" strokeWidth="3" strokeLinecap="round" /> : null}
        {position ? (
          <g>
            <circle cx={position.x} cy={position.y} r="11" fill="var(--yellow)" opacity="0.25" />
            <circle cx={position.x} cy={position.y} r="6.5" fill="var(--yellow)" />
          </g>
        ) : null}
      </svg>
      <div className="num grid grid-cols-3 gap-2 text-[13px]">
        <SunTime label={t.sun.sunrise} value={format.time(sun.sunrise)} />
        <SunTime label={t.sun.solarNoon} value={format.time(sun.solarNoon)} align="items-center" />
        <SunTime label={t.sun.sunset} value={format.time(sun.sunset)} align="items-end" />
      </div>
    </Card>
  )
}

function SunTime({ label, value, align = '' }: { label: string; value: string; align?: string }) {
  return (
    <div className={`flex flex-col gap-0.5 ${align}`}>
      <span className="font-sans text-xs text-wx-t2">{label}</span>
      <span>{value}</span>
    </div>
  )
}
