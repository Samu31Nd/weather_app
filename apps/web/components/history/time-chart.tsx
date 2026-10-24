// Gráfica de tiempo del artboard `Main`: rejilla con marcas del eje y, las curvas (que dibuja quien la usa en un
// lienzo de 1000 × `height`), la línea del cursor y una capa que convierte el puntero en el intervalo bajo él.
// El puntero cubre ratón, toque y lápiz, así que en una pantalla táctil se puede arrastrar el dedo.

import type { NiceScale } from '@tt/core'
import type { ReactNode } from 'react'

export const CHART_WIDTH = 1000

export interface ChartCursor {
  /** Intervalo bajo el puntero, o null. Es compartido por todas las gráficas. */
  readonly index: number | null
  readonly count: number
  readonly onChange: (index: number | null) => void
}

export function TimeChart({ height, label, scale, formatTick, cursor, children }: {
  height: number
  label: string
  scale: NiceScale
  formatTick: (value: number) => string
  cursor: ChartCursor
  children: ReactNode
}) {
  const span = scale.hi - scale.lo || 1
  const pickIndex = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const fraction = (event.clientX - box.left) / box.width
    if (fraction < 0 || fraction > 1 || cursor.count === 0) return
    cursor.onChange(Math.min(cursor.count - 1, Math.floor(fraction * cursor.count)))
  }
  return (
    <div role="img" aria-label={label} className="relative ml-11" style={{ height }}>
      {scale.ticks.map((tick) => (
        <div key={tick} className="absolute inset-x-0 border-t border-wx-gr" style={{ top: `${(1 - (tick - scale.lo) / span) * 100}%` }}>
          <span className="num absolute -left-11 -top-2 w-9 text-right text-[11px] text-wx-tm">{formatTick(tick)}</span>
        </div>
      ))}
      <svg viewBox={`0 0 ${CHART_WIDTH} ${height}`} preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 size-full overflow-visible">
        {children}
      </svg>
      {cursor.index !== null ? (
        <div className="pointer-events-none absolute inset-y-0 w-px bg-wx-crosshair" style={{ left: `${((cursor.index + 0.5) / cursor.count) * 100}%` }} />
      ) : null}
      <div
        className="absolute inset-0 cursor-crosshair touch-pan-y"
        onPointerMove={pickIndex}
        onPointerDown={pickIndex}
        onPointerLeave={() => cursor.onChange(null)}
      />
    </div>
  )
}

/** Marcas del eje x, debajo de una o varias gráficas. */
export function TimeAxis({ ticks }: { ticks: ReadonlyArray<{ readonly label: string; readonly fraction: number }> }) {
  return (
    <div className="relative ml-11 h-[18px]">
      {ticks.map((tick, i) => (
        <span
          key={`${tick.label}-${i}`}
          className="num absolute top-0 whitespace-nowrap text-[11px] text-wx-tm"
          style={{ left: `${tick.fraction * 100}%`, transform: i === 0 ? 'none' : i === ticks.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)' }}
        >
          {tick.label}
        </span>
      ))}
    </div>
  )
}

/** Muestras de la leyenda: línea, línea punteada o cuadro de color. */
export function LegendSwatch({ kind, colorClass }: { kind: 'line' | 'dashed' | 'box'; colorClass: string }) {
  if (kind === 'dashed') return <span className={`w-4 border-t-2 border-dashed ${colorClass}`} />
  if (kind === 'box') return <span className={`size-2.5 rounded-sm ${colorClass}`} />
  return <span className={`h-0.5 w-4 ${colorClass}`} />
}

export function LegendRow({ items, readout }: { items: ReactNode; readout: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[13px]">
      <div className="flex flex-wrap gap-x-[18px] gap-y-1.5 text-wx-t2">{items}</div>
      <div className="num min-h-[18px] text-[12.5px]" aria-live="polite">{readout}</div>
    </div>
  )
}

export function LegendItem({ swatch, children }: { swatch: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {swatch}
      {children}
    </span>
  )
}
