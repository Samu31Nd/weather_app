// Composition root de la web (ADR-0001): el núcleo con el proxy del dato en vivo, la Cloud Function de histórico
// y las preferencias en localStorage. Solo se crea en el navegador.

import { createCore, type Core } from '@tt/core'

export function createWebCore(storage: Storage | undefined): Core {
  return createCore({
    liveUrl: '/api/live',
    historyUrl: process.env.NEXT_PUBLIC_API_CLOUD_URL,
    storage,
  })
}
