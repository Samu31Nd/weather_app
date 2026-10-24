// Presión (RF-APP-01): medidor de 270° con el rango de hoy, valor a nivel del mar, tendencia de 3 h y aviso
// si un extremo del mes o del año no es creíble (lecturas sin corregir, rareza D3).

import { type CurrentConditions, gaugeAngle, gaugeArcPath } from '@tt/core'
import { pressureText, valueText } from '@tt/i18n'
import { Badge, Card, CardHeader, LabelValueRow } from '@/components/shell/card'
import { usePreferences } from '@/components/providers/app-providers'

export function PressureCard({ pressure, units }: { pressure: CurrentConditions['pressure']; units: CurrentConditions['units'] }) {
  const { t, format } = usePreferences()
  const v = valueText(units, format)
  const gauge = pressure.gauge
  const text = pressureText(pressure, units, t, format)

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
        badge={text.trend ? <Badge className="bg-wx-pres-soft">{text.trend}</Badge> : null}
      />
      <div className="flex flex-col items-center gap-1">
        <svg
          width="190"
          height="132"
          viewBox="0 0 150 106"
          role="img"
          aria-label={text.accessibilityLabel}
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
          <text x="16" y="104" fontSize="9" fill="var(--tm)" className="num">{text.scaleLow}</text>
          <text x="134" y="104" fontSize="9" fill="var(--tm)" textAnchor="end" className="num">{text.scaleHigh}</text>
        </svg>
        <span className="flex items-baseline gap-1.5">
          <span className="num text-[32px]">{v.pressure(pressure.value)}</span>
          <span className="text-[13px] text-wx-t2">{v.symbols.pressure}</span>
        </span>
        {text.alternate ? <span className="num text-xs text-wx-t2">{text.alternate}</span> : null}
      </div>
      <div className="mt-auto">
        <LabelValueRow label={t.pressure.dayChange} value={text.dayRange} />
      </div>
      {text.implausibleNote ? <p className="text-xs leading-[1.45] text-wx-t2">{text.implausibleNote}</p> : null}
    </Card>
  )
}
