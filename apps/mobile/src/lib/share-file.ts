// Comparte un archivo generado (descarga del histórico, RF-APP-09): lo escribe en la caché de la app y abre la
// hoja de compartir del sistema, desde donde se guarda en Archivos o se manda a otra app.

import type { HistoryExport } from '@tt/core'
import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'

export async function shareFile(file: HistoryExport, dialogTitle: string): Promise<void> {
  const target = new File(Paths.cache, file.fileName)
  target.create({ overwrite: true })
  await target.write(file.content)
  await Sharing.shareAsync(target.uri, { mimeType: file.mimeType, dialogTitle, UTI: file.mimeType === 'text/csv' ? 'public.comma-separated-values-text' : 'public.json' })
}
