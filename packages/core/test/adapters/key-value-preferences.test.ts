/**
 * Repositorio de preferencias sobre un almacén clave-valor, con las claves `wx-*` del diseño.
 * Debe funcionar igual con un almacén síncrono (localStorage) y uno asíncrono (AsyncStorage), y no romper la app
 * si el almacén falla (modo privado, cuota llena).
 * Requerimientos: RF-APP-10, RNF-APP-02.
 */
import { describe, expect, it } from 'vitest'
import { KeyValuePreferencesRepository, PREFERENCE_KEYS } from '../../src/adapters/key-value-preferences.repository'
import { GetPreferences, UpdatePreferences } from '../../src/application/preferences'
import { DEFAULT_PREFERENCES } from '../../src/domain/preferences'
import type { KeyValueStorage } from '../../src/ports'

const syncStorage = (initial: Record<string, string> = {}) => {
  const values = new Map(Object.entries(initial))
  return { values, storage: { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => void values.set(k, v) } }
}

describe('repositorio de preferencias clave-valor', () => {
  it('usa las claves del diseño', () => {
    expect(PREFERENCE_KEYS).toEqual({ theme: 'wx-theme', language: 'wx-lang', units: 'wx-units', textSize: 'wx-size' })
  })

  it('lee lo guardado por el diseño y valida cada valor', async () => {
    const { storage } = syncStorage({ 'wx-theme': 'dark', 'wx-lang': 'en', 'wx-size': 'xl' })
    expect(await new KeyValuePreferencesRepository(storage).load()).toEqual({ ...DEFAULT_PREFERENCES, theme: 'dark', language: 'en' })
  })

  it('funciona con un almacén asíncrono (como AsyncStorage)', async () => {
    const values = new Map<string, string>()
    const asyncStorage: KeyValueStorage = {
      getItem: async (k) => values.get(k) ?? null,
      setItem: async (k, v) => void values.set(k, v),
    }
    const repository = new KeyValuePreferencesRepository(asyncStorage)
    await repository.save({ ...DEFAULT_PREFERENCES, units: 'imperial' })
    expect((await repository.load()).units).toBe('imperial')
  })

  it('usa los valores por defecto si el almacén falla al leer o escribir', async () => {
    const broken: KeyValueStorage = {
      getItem: () => { throw new Error('SecurityError') },
      setItem: () => { throw new Error('QuotaExceededError') },
    }
    const repository = new KeyValuePreferencesRepository(broken)
    await expect(repository.save(DEFAULT_PREFERENCES)).resolves.toBeUndefined()
    expect(await repository.load()).toEqual(DEFAULT_PREFERENCES)
  })
})

describe('casos de uso de preferencias', () => {
  it('cambia solo lo pedido, lo valida y lo guarda', async () => {
    const { values, storage } = syncStorage()
    const repository = new KeyValuePreferencesRepository(storage)
    const current = await new GetPreferences(repository).execute()
    const next = await new UpdatePreferences(repository).execute(current, { textSize: 'l' })
    expect(next).toEqual({ ...DEFAULT_PREFERENCES, textSize: 'l' })
    expect(values.get('wx-size')).toBe('l')
  })
})
