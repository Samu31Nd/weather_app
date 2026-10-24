/**
 * Formateo por idioma: números, horas en Ciudad de México, fechas largas y duraciones.
 * Fuente: RNF-APP-07 (fechas en America/Mexico_City, números con el formato del idioma); artboard `Dashboard`
 * (reloj, "Quedan 9 h 35 min de luz", "hace 4 min").
 * Requerimientos: RNF-APP-07.
 */
import { describe, expect, it } from 'vitest'
import { CATALOGS, createFormatter } from '../src'

const es = createFormatter('es', CATALOGS.es)
const en = createFormatter('en', CATALOGS.en)
const instant = new Date('2026-10-24T15:59:58Z') // sábado 24-oct, 09:59:58 en CDMX

describe('números', () => {
  it('usa el separador de miles del idioma y los decimales pedidos', () => {
    expect(es.number(1029.234, 1)).toBe('1,029.2')
    expect(en.number(17.833, 1)).toBe('17.8')
    expect(es.number(61, 0)).toBe('61')
  })

  it('muestra "—" sin dato, nunca 0', () => {
    expect(es.number(null)).toBe('—')
    expect(es.number(Number.NaN)).toBe('—')
  })
})

describe('fechas y horas en Ciudad de México', () => {
  it('da la hora de pared de CDMX sin importar la zona del dispositivo', () => {
    expect(es.time(instant)).toBe('09:59')
    expect(es.clock(instant)).toBe('09:59:58')
    expect(es.time(null)).toBe('—')
  })

  it('escribe la fecha larga en cada idioma', () => {
    expect(es.longDate(instant)).toBe('sábado 24 de octubre')
    expect(en.longDate(instant)).toBe('Saturday, October 24')
  })
})

describe('duraciones', () => {
  it('escribe horas y minutos con ceros a la izquierda', () => {
    expect(es.duration(575)).toBe('9 h 35 min')
    expect(en.duration(5)).toBe('0 h 05 min')
  })

  it('elige la unidad del tiempo encendido como el diseño', () => {
    expect(es.uptime(226)).toBe('4 min')
    expect(es.uptime(30)).toBe('1 min')
    expect(es.uptime(7200)).toBe('2 h')
    expect(en.uptime(3 * 86_400)).toBe('3 days')
  })
})
