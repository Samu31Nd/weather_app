'use client'

// Providers de la app: el núcleo (@tt/core) y las preferencias con su catálogo y formateador. Solo conectan los
// casos de uso con React; la lógica vive en los paquetes compartidos.

import { type Core, DEFAULT_PREFERENCES, type LiveReading, type UserPreferences } from '@tt/core'
import { type Catalog, type Formatter, catalogFor, createFormatter } from '@tt/i18n'
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createWebCore } from '@/lib/core'
import { applyPreferencesToDocument } from '@/lib/preferences/apply'

interface PreferencesContextValue {
  readonly preferences: UserPreferences
  readonly update: (changes: Partial<UserPreferences>) => void
  readonly isDark: boolean
  readonly t: Catalog
  readonly format: Formatter
}

/** Última lectura en vivo, para que "Ahora" no vuelva a la pantalla de carga al regresar de otra página. */
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

const browserStorage = (): Storage | undefined => {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

export function AppProviders({ children, core: injectedCore }: { children: ReactNode; core?: Core }) {
  const [core] = useState(() => injectedCore ?? createWebCore(typeof window === 'undefined' ? undefined : browserStorage()))
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
  const systemPrefersDark = useSystemPrefersDark()

  useEffect(() => {
    void core.getPreferences.execute().then(setPreferences)
  }, [core])

  useEffect(() => {
    applyPreferencesToDocument(document.documentElement, preferences, systemPrefersDark)
  }, [preferences, systemPrefersDark])

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
    const isDark = preferences.theme === 'dark' || (preferences.theme === 'system' && systemPrefersDark)
    return { preferences, update, isDark, t, format: createFormatter(preferences.language, t) }
  }, [preferences, update, systemPrefersDark])

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

function useSystemPrefersDark(): boolean {
  const [prefersDark, setPrefersDark] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    setPrefersDark(query.matches)
    const onChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return prefersDark
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
