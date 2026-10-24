// Avance de la pantalla de carga (artboards `LoadingWeb` y `LoadingMobile`, RF-APP-02): mientras se espera el
// primer dato, los pasos avanzan solos hasta "Recibiendo presión…"; al llegar la respuesta se completan.

export const LOADING_VARIABLES = ['temp', 'wind', 'rain', 'pres'] as const
export type LoadingVariable = (typeof LOADING_VARIABLES)[number]
export type LoadingVariableState = 'received' | 'receiving' | 'waiting'

/** Cada cuánto avanza un paso mientras se espera. */
export const LOADING_STEP_INTERVAL_MS = 700
/** Último paso al que se llega sin respuesta ("Recibiendo presión…"). */
export const LOADING_LAST_WAITING_STEP = 4
/** Paso final ("¡Listo! Abriendo el panel…"). */
export const LOADING_DONE_STEP = 5

export interface LoadingProgress {
  /** Índice del mensaje de `loading.steps`. */
  readonly step: number
  readonly percent: number
  readonly variables: Readonly<Record<LoadingVariable, LoadingVariableState>>
  /** La lluvia de la ilustración aparece al "recibir" la lluvia. */
  readonly rainVisible: boolean
  /** Duración de una vuelta del anemómetro: arranca lento, gira rápido al recibir y se calma al terminar. */
  readonly spinMs: number
}

export function loadingProgress(waitingStep: number, done: boolean): LoadingProgress {
  const step = done ? LOADING_DONE_STEP : Math.min(Math.max(waitingStep, 0), LOADING_LAST_WAITING_STEP)
  const stateOf = (index: number): LoadingVariableState =>
    done || step > index + 1 ? 'received' : step === index + 1 ? 'receiving' : 'waiting'
  const variables = Object.fromEntries(LOADING_VARIABLES.map((variable, index) => [variable, stateOf(index)])) as Record<LoadingVariable, LoadingVariableState>
  return {
    step,
    percent: Math.round((step / LOADING_DONE_STEP) * 100),
    variables,
    rainVisible: step >= LOADING_LAST_WAITING_STEP,
    spinMs: done ? 2600 : step === 0 ? 1600 : 900,
  }
}
