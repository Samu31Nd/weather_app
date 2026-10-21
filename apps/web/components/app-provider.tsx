'use client'

import { createContext, useContext, useState, useEffect, type ReactNode, useMemo } from 'react'
import { translations, type Language, type Translations } from '@/lib/language/translations'
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles'

type View = 'dashboard' | 'charts'

interface AppContextType {
    // Language
    language: Language
    setLanguage: (lang: Language) => void
    t: Translations
    // Units
    isMetric: boolean
    setIsMetric: (value: boolean) => void
    // Theme
    isDark: boolean
    setIsDark: (value: boolean) => void
    // Navigation
    currentView: View
    setCurrentView: (view: View) => void
    // Sidebar
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
    sidebarCollapsed: boolean
    setSidebarCollapsed: (collapsed: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('es')
    const [isMetric, setIsMetric] = useState(true)
    const [isDark, setIsDark] = useState(true)
    const [currentView, setCurrentView] = useState<View>('dashboard')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true) // Collapsed by default on desktop

    const muiTheme = useMemo(() =>
        createTheme({
            palette: {
                mode: isDark ? 'dark' : 'light',
                primary: { main: isDark ? '#818cf8' : '#4f46e5' },
                background: {
                    default: isDark ? '#0f1117' : '#f8fafc',
                    paper: isDark ? '#1a1d2e' : '#ffffff',
                },
            },
        }), [isDark])

    // Apply dark mode to document
    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark)
    }, [isDark])

    // Update html lang attribute
    useEffect(() => {
        document.documentElement.lang = language
    }, [language])

    const t = translations[language]

    return (
        <AppContext.Provider
            value={{
                language,
                t,
                isMetric,
                isDark,
                currentView,
                sidebarOpen,
                sidebarCollapsed,
                // SETTERS
                setLanguage,
                setIsMetric,
                setIsDark,
                setCurrentView,
                setSidebarOpen,
                setSidebarCollapsed,
            }}
        >
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
