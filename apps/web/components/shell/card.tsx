// Piezas visuales comunes del diseño: tarjeta, encabezado de tarjeta con ícono y fila "etiqueta · valor".

import type { ReactNode } from 'react'

export function Card({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <section aria-label={label} className={`flex flex-col gap-3.5 rounded-[20px] border border-wx-bd bg-wx-sf p-5 ${className}`}>
      {children}
    </section>
  )
}

export function CardHeader({ icon, iconBg, title, subtitle, badge }: {
  icon: ReactNode
  iconBg: string
  title: string
  subtitle?: string
  badge?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex items-center gap-2.5">
        <div className={`flex size-9 items-center justify-center rounded-[11px] ${iconBg}`}>{icon}</div>
        <div className="flex flex-col">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          {subtitle ? <span className="text-xs text-wx-t2">{subtitle}</span> : null}
        </div>
      </div>
      {badge}
    </div>
  )
}

export function Badge({ className, children }: { className: string; children: ReactNode }) {
  return <span className={`rounded-full px-2.5 py-[5px] text-xs font-medium ${className}`}>{children}</span>
}

export function LabelValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-wx-bg px-3 py-2.5 text-[13px]">
      <span className="text-wx-t2">{label}</span>
      <span className="num font-medium">{value}</span>
    </div>
  )
}
