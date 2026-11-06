// Comparte un archivo generado (descarga del histórico, RF-APP-09): lo escribe en la caché de la app y abre la
// hoja de compartir del sistema, desde donde se guarda en Archivos o se manda a otra app.

import type { HistoryExport } from '@tt/core'
import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'

export async function shareFile(file: HistoryExport, dialogTitle: string): Promise<void> {
  const target = new File(Paths.cache, file.fileName)
  target.create({ overwrite: true })
  await target.write(file.content)
  await Sharing.shareAsync(target.uri, { mimeType: file.mimeType, dialogTitle, UTI: UTI_BY_MIME[file.mimeType] ?? 'public.data' })
}

/** Tipos de iOS para la hoja de compartir; Parquet no tiene uno propio y va como datos genéricos. */
const UTI_BY_MIME: Record<string, string> = {
  'text/csv': 'public.comma-separated-values-text',
  'application/json': 'public.json',
}
