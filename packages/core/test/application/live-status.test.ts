/**
 * Vigencia del dato en vivo: cargando, al día, desactualizado y sin conexión.
 * Fuente: docs/05-flujos.md (estados de "Ahora") y RF-APP-02 (aviso a los 2 min). Se mide desde la última
 * consulta exitosa porque el reloj de la consola deriva (D12).
 * Requerimientos: RF-APP-02.
 */
import { describe, expect, it } from 'vitest'
import { liveStatus } from '../../src/application/live-status'

const at = (minutes: number) => new Date(Date.UTC(2026, 9, 24, 16, minutes))

describe('vigencia del dato en vivo', () => {
  it.each([
    { caso: 'aún no hay respuesta', input: { lastSuccessAt: null, observedAt: null, lastFailed: false }, estado: 'loading' },
    { caso: 'la primera consulta falló', input: { lastSuccessAt: null, observedAt: null, lastFailed: true }, estado: 'offline' },
    { caso: 'consulta reciente', input: { lastSuccessAt: at(9), observedAt: at(8), lastFailed: false }, estado: 'ok' },
    { caso: 'sin consultas exitosas desde hace 3 min', input: { lastSuccessAt: at(7), observedAt: at(7), lastFailed: false }, estado: 'stale' },
    { caso: 'la consola entrega la misma lectura de hace 20 min', input: { lastSuccessAt: at(10), observedAt: at(-10), lastFailed: false }, estado: 'stale' },
    { caso: 'falló la última consulta pero hay dato previo', input: { lastSuccessAt: at(9), observedAt: at(9), lastFailed: true }, estado: 'offlineWithData' },
  ] as const)('$caso → $estado', ({ input, estado }) => {
    expect(liveStatus({ now: at(10), ...input })).toBe(estado)
  })
})
