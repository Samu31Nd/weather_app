'use client'

// Adaptador temporal para el histórico previo (fase 5 lo reemplaza): expone a los componentes viejos el idioma,
// las unidades y el tema de las preferencias nuevas, con la forma que esperaban (`useApp`), y el tema de MUI.

import { createContext, useContext, type ReactNode, useMemo } from 'react'
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { usePreferences } from '@/components/providers/app-providers'
import { translations, type Language, type Translations } from '@/lib/language/translations'

interface AppContextType {
    language: Language
    t: Translations
    isMetric: boolean
    isDark: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
    const { preferences, isDark } = usePreferences()
    const language = preferences.language

    const muiTheme = useMemo(() =>
        createTheme({
            palette: {
                mode: isDark ? 'dark' : 'light',
                primary: { main: isDark ? '#89b4fa' : '#1e66f5' },
                background: {
                    default: isDark ? '#181825' : '#e6e9ef',
                    paper: isDark ? '#1e1e2e' : '#eff1f5',
                },
            },
            typography: { fontFamily: 'var(--font-plex-sans), system-ui, sans-serif' },
        }), [isDark])

    const value = useMemo(
        () => ({ language, t: translations[language], isMetric: preferences.units === 'metric', isDark }),
        [language, preferences.units, isDark],
    )

    return (
        <AppContext.Provider value={value}>
            <MuiThemeProvider theme={muiTheme}>
                {children}
            </MuiThemeProvider>
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useApp must be used within an AppProvider')
    }
    return context
}
