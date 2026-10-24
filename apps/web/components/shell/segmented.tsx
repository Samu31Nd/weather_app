// Grupo de botones excluyentes con estilo de píldora (unidades, idioma, tamaño de texto) del diseño.

export interface SegmentOption<T extends string> {
  readonly value: T
  readonly label: string
  readonly ariaLabel?: string
  readonly lang?: string
  readonly className?: string
}

export function Segmented<T extends string>({ label, options, value, onChange }: {
  label: string
  options: ReadonlyArray<SegmentOption<T>>
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-0.5 rounded-full bg-wx-bg p-[3px]">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            aria-label={option.ariaLabel}
            title={option.ariaLabel}
            lang={option.lang}
            onClick={() => onChange(option.value)}
            className={`min-h-[30px] min-w-[34px] cursor-pointer rounded-full px-3 text-[11px] font-semibold tracking-[0.04em] ${
              active ? 'bg-wx-sf text-wx-tx shadow-[0_1px_2px_rgba(76,79,105,0.15)]' : 'text-wx-t2'
            } ${option.className ?? ''}`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
