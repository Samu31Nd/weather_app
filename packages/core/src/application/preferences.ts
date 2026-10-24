// Casos de uso de preferencias (RF-APP-10): leerlas y cambiar una o varias a la vez.

import { type UserPreferences, normalizePreferences } from '../domain/preferences'
import type { PreferencesRepository } from '../ports'

export class GetPreferences {
  constructor(private readonly repository: PreferencesRepository) {}

  execute(): Promise<UserPreferences> {
    return this.repository.load()
  }
}

export class UpdatePreferences {
  constructor(private readonly repository: PreferencesRepository) {}

  async execute(current: UserPreferences, changes: Partial<UserPreferences>): Promise<UserPreferences> {
    const next = normalizePreferences({ ...current, ...changes })
    await this.repository.save(next)
    return next
  }
}
