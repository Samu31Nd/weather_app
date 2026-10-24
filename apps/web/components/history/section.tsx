// Marco de cada sección del histórico (artboard `Main`): ilustración con los datos del periodo, título,
// explicación en lenguaje llano e indicadores (RF-APP-08).

import type { KpiText } from '@tt/i18n'
import type { ReactNode } from 'react'

export function HistorySection({ label, art, artBackground, title, description, kpis, children }: {
  label: string
  art: ReactNode
  artBackground: string
  title: string
  description: string
  kpis: readonly KpiText[]
  children: ReactNode
}) {
  return (
    <section aria-label={label} className="flex flex-col gap-4 rounded-2xl border border-wx-bd bg-wx-sf px-6 py-5">
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
        <div className="flex max-w-[460px] items-center gap-3.5">
          <div className={`flex size-[72px] flex-none items-center justify-center rounded-[18px] ${artBackground}`}>{art}</div>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-[13px] leading-[1.45] text-wx-t2">{description}</p>
          </div>
        </div>
        <dl className="flex flex-wrap gap-x-8 gap-y-3">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="flex flex-col gap-0.5">
              <dt className="text-xs text-wx-t2">{kpi.label}</dt>
              <dd className="num text-[22px]">{kpi.value}</dd>
              <dd className="text-xs text-wx-t2">{kpi.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
      {children}
    </section>
  )
}
