// Presión (RF-APP-01): medidor de 270° con el rango de hoy, valor a nivel del mar, tendencia de 3 h y aviso
// si un extremo del mes o del año no es creíble (lecturas sin corregir, rareza D3).

import { type CurrentConditions, PRESSURE_GAUGE_HPA, displayPressure, gaugeAngle, gaugeArcPath, hPaToInHg } from '@tt/core'
import { Badge, Card, CardHeader, LabelValueRow } from '@/components/shell/card'
import { usePreferences } from '@/components/providers/app-providers'
import { valueText } from './values'

export function PressureCard({ pressure, units }: { pressure: CurrentConditions['pressure']; units: CurrentConditions['units'] }) {
  const { t, format } = usePreferences()
  const v = valueText(units, format)
  const gauge = pressure.gauge
  const alternate =
    pressure.hPa === null || pressure.mmHg === null
      ? null
      : `${format.number(pressure.mmHg, 1)} mmHg · ${
          units === 'metric' ? `${format.number(hPaToInHg(pressure.hPa), 3)} inHg` : `${format.number(pressure.hPa, 1)} hPa`
        }`
  const scaleDecimals = units === 'metric' ? 0 : 2
  const scaleLow = format.number(displayPressure(PRESSURE_GAUGE_HPA.min, units), scaleDecimals)
  const scaleHigh = format.number(displayPressure(PRESSURE_GAUGE_HPA.max, units), scaleDecimals)

  return (
    <Card label={t.hero.pressure}>
      <CardHeader
        iconBg="bg-wx-pres-soft"
        title={t.hero.pressure}
        subtitle={t.pressure.subtitle}
        icon={
          <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2.8 11.5a5.5 5.5 0 1 1 10.4 0" fill="none" stroke="var(--pres)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 10l2.5-3.5" stroke="var(--pres)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="10" r="1.2" fill="var(--pres)" />
          </svg>
        }
        badge={pressure.trend ? <Badge className="bg-wx-pres-soft">{t.pressure.trends[pressure.trend]}</Badge> : null}
      />
      <div className="flex flex-col items-center gap-1">
        <svg
          width="190"
          height="132"
          viewBox="0 0 150 106"
          role="img"
          aria-label={t.pressure.label(v.pressureShort(pressure.value), v.pressure(pressure.todayLow), v.pressure(pressure.todayHigh))}
        >
          <path d="M18 92A60 60 0 1 1 132 92" fill="none" stroke="var(--pres-soft)" strokeWidth="14" strokeLinecap="round" />
          {gauge ? (
            <>
              <path d={gaugeArcPath(gauge.todayFrom, gauge.todayTo)} fill="none" stroke="var(--pres)" strokeWidth="14" strokeLinecap="round" opacity="0.45" />
              <g transform={`rotate(${gaugeAngle(gauge.needle)} 75 72)`}>
                <path d="M75 72V26" stroke="var(--tx)" strokeWidth="3" strokeLinecap="round" />
              </g>
            </>
          ) : null}
          <circle cx="75" cy="72" r="6" fill="var(--tx)" />
          <text x="16" y="104" fontSize="9" fill="var(--tm)" className="num">{scaleLow}</text>
          <text x="134" y="104" fontSize="9" fill="var(--tm)" textAnchor="end" className="num">{scaleHigh}</text>
        </svg>
        <span className="flex items-baseline gap-1.5">
          <span className="num text-[32px]">{v.pressure(pressure.value)}</span>
          <span className="text-[13px] text-wx-t2">{v.symbols.pressure}</span>
        </span>
        {alternate ? <span className="num text-xs text-wx-t2">{alternate}</span> : null}
      </div>
      <div className="mt-auto">
        <LabelValueRow label={t.pressure.dayChange} value={`${v.pressure(pressure.todayLow)} – ${v.pressure(pressure.todayHigh)}`} />
      </div>
      {pressure.implausibleExtreme !== null ? (
        <p className="text-xs leading-[1.45] text-wx-t2">{t.pressure.implausible(v.pressureShort(pressure.implausibleExtreme))}</p>
      ) : null}
    </Card>
  )
}
