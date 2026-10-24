// Providers de la app: el núcleo (@tt/core), la última lectura en vivo y las preferencias con su catálogo,
// formateador, paleta y escala de texto. Solo conectan los casos de uso con React; la lógica vive en los paquetes.

import { type Core, DEFAULT_PREFERENCES, type LiveReading, TEXT_SCALE, type UserPreferences } from '@tt/core'
import { type Catalog, type Formatter, catalogFor, createFormatter } from '@tt/i18n'
import { PALETTES, type Palette } from '@tt/tokens'
import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useColorScheme } from 'react-native'
import { createMobileCore } from '@/lib/core'

interface PreferencesContextValue {
  readonly preferences: UserPreferences
  readonly update: (changes: Partial<UserPreferences>) => void
  /** Ya se leyeron las preferencias guardadas (evita pintar un momento con las de fábrica). */
  readonly loaded: boolean
  readonly isDark: boolean
  readonly palette: Palette
  readonly textScale: number
  readonly t: Catalog
  readonly format: Formatter
}

/** Última lectura en vivo, para que "Ahora" no vuelva a la pantalla de carga al regresar de otra pestaña. */
export interface LiveSnapshot {
  readonly reading: LiveReading
  readonly receivedAt: Date
}

interface LiveSnapshotStore {
  current: LiveSnapshot | null
}

const CoreContext = createContext<Core | null>(null)
const LiveSnapshotContext = createContext<LiveSnapshotStore | null>(null)
const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function AppProviders({ children, core: injectedCore }: { children: ReactNode; core?: Core }) {
  const [core] = useState(() => injectedCore ?? createMobileCore())
  const [liveSnapshot] = useState<LiveSnapshotStore>(() => ({ current: null }))
  return (
    <CoreContext.Provider value={core}>
      <LiveSnapshotContext.Provider value={liveSnapshot}>
        <PreferencesProvider core={core}>{children}</PreferencesProvider>
      </LiveSnapshotContext.Provider>
    </CoreContext.Provider>
  )
}

function PreferencesProvider({ core, children }: { core: Core; children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [loaded, setLoaded] = useState(false)
  const systemScheme = useColorScheme()

  useEffect(() => {
    void core.getPreferences.execute().then((stored) => {
      setPreferences(stored)
      setLoaded(true)
    })
  }, [core])

  const current = useRef(preferences)
  current.current = preferences

  const update = useCallback(
    (changes: Partial<UserPreferences>) => {
      setPreferences({ ...current.current, ...changes })
      void core.updatePreferences.execute(current.current, changes)
    },
    [core],
  )

  const value = useMemo<PreferencesContextValue>(() => {
    const t = catalogFor(preferences.language)
    const isDark = preferences.theme === 'dark' || (preferences.theme === 'system' && systemScheme === 'dark')
    return {
      preferences,
      update,
      loaded,
      isDark,
      palette: PALETTES[isDark ? 'dark' : 'light'],
      textScale: TEXT_SCALE[preferences.textSize],
      t,
      format: createFormatter(preferences.language, t),
    }
  }, [preferences, update, loaded, systemScheme])

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function useCore(): Core {
  const core = useContext(CoreContext)
  if (!core) throw new Error('useCore debe usarse dentro de <AppProviders>')
  return core
}

export function useLiveSnapshot(): LiveSnapshotStore {
  const store = useContext(LiveSnapshotContext)
  if (!store) throw new Error('useLiveSnapshot debe usarse dentro de <AppProviders>')
  return store
}

export function usePreferences(): PreferencesContextValue {
  const value = useContext(PreferencesContext)
  if (!value) throw new Error('usePreferences debe usarse dentro de <AppProviders>')
  return value
}
