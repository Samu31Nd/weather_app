// Lectura defensiva de los valores crudos de las fuentes: números como texto, `---` y vacíos (RNF-APP-01).

const MISSING_VALUES = new Set(['', '---', 'null', 'nan'])

export function parseNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const trimmed = value.trim()
  if (MISSING_VALUES.has(trimmed.toLowerCase())) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}
