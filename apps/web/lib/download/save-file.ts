// Guarda un archivo generado en el navegador (descarga del histórico, RF-APP-09).

import type { HistoryExport } from '@tt/core'

export function saveFile(file: HistoryExport): void {
  const url = URL.createObjectURL(new Blob([file.content], { type: `${file.mimeType};charset=utf-8` }))
  const link = document.createElement('a')
  link.href = url
  link.download = file.fileName
  link.click()
  URL.revokeObjectURL(url)
}
