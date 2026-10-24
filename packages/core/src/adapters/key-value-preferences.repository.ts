// Preferencias guardadas en un almacén clave-valor. Sirve igual para `localStorage` (web, síncrono) y para
// AsyncStorage (móvil, asíncrono), porque el puerto acepta ambas formas. Claves `wx-*` del diseño.

import { type UserPreferences, normalizePreferences } from '../domain/preferences'
import type { KeyValueStorage, PreferencesRepository } from '../ports'

export const PREFERENCE_KEYS: Readonly<Record<keyof UserPreferences, string>> = {
  theme: 'wx-theme',
  language: 'wx-lang',
  units: 'wx-units',
  textSize: 'wx-size',
}

const FIELDS = Object.keys(PREFERENCE_KEYS) as Array<keyof UserPreferences>

export class KeyValuePreferencesRepository implements PreferencesRepository {
  constructor(private readonly storage: KeyValueStorage) {}

  async load(): Promise<UserPreferences> {
    const entries = await Promise.all(FIELDS.map(async (field) => [field, await this.read(PREFERENCE_KEYS[field])] as const))
    return normalizePreferences(Object.fromEntries(entries))
  }

  async save(preferences: UserPreferences): Promise<void> {
    await Promise.all(FIELDS.map((field) => this.write(PREFERENCE_KEYS[field], preferences[field])))
  }

  // Un almacén bloqueado (modo privado, cuota llena) no debe romper la app: se usan los valores por defecto.
  private async read(key: string): Promise<string | null> {
    try {
      return await this.storage.getItem(key)
    } catch {
      return null
    }
  }

  private async write(key: string, value: string): Promise<void> {
    try {
      await this.storage.setItem(key, value)
    } catch {
      // Sin persistencia: la preferencia sigue aplicada en memoria durante la sesión.
    }
  }
}
