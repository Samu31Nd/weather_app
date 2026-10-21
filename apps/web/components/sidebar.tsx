'use client'

import { useApp } from './app-provider'
import {
  LayoutDashboard,
  LineChart,
  X,
  Sun,
  Moon,
  Languages,
  Ruler,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const {
    t,
    language,
    setLanguage,
    isMetric,
    setIsMetric,
    isDark,
    setIsDark,
    currentView,
    setCurrentView,
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
  } = useApp()

  const navItems = [
    { id: 'dashboard' as const, icon: LayoutDashboard, label: t.nav.dashboard },
    { id: 'charts' as const, icon: LineChart, label: t.nav.charts },
  ]

  return (
    <>
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Collapsed toggle button - visible when sidebar is collapsed on desktop */}
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="hidden lg:flex fixed top-4 left-4 z-30 items-center justify-center w-10 h-10 rounded-lg bg-card/95 backdrop-blur-xl border border-border text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Open sidebar"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-card/95 backdrop-blur-xl border-r border-border',
          'transform transition-all duration-300 ease-in-out',
          'flex flex-col',
          // Mobile: slide in/out
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: show/hide based on collapsed state
          'lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto',
          sidebarCollapsed ? 'lg:hidden' : 'lg:flex',
          // Width
          'w-72',
          'lg:h-screen'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {t.nav.settings}
          </h2>
          <div className="flex items-center gap-1">
            {/* Collapse button - desktop only */}
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="hidden lg:flex p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-5 w-5" />
            </button>
            {/* Close button - mobile only */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setCurrentView(item.id)
                    setSidebarOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    currentView === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {currentView === item.id && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1" />

        {/* Settings Section */}
        <div className="p-4 border-t border-border space-y-4">
          {/* Language */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Languages className="h-4 w-4" />
              {t.settings.language}
            </label>
            <div className="flex rounded-lg bg-secondary p-1">
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                  language === 'en'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t.settings.english}
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={cn(
                  'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                  language === 'es'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t.settings.spanish}
              </button>
            </div>
          </div>

          {/* Units */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Ruler className="h-4 w-4" />
              {t.settings.units}
            </label>
            <div className="flex rounded-lg bg-secondary p-1">
              <button
                onClick={() => setIsMetric(false)}
                className={cn(
                  'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                  !isMetric
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t.settings.imperial}
              </button>
              <button
                onClick={() => setIsMetric(true)}
                className={cn(
                  'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                  isMetric
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t.settings.metric}
              </button>
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {t.settings.theme}
            </label>
            <div className="flex rounded-lg bg-secondary p-1">
              <button
                onClick={() => setIsDark(false)}
                className={cn(
                  'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2',
                  !isDark
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Sun className="h-4 w-4" />
                {t.settings.light}
              </button>
              <button
                onClick={() => setIsDark(true)}
                className={cn(
                  'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2',
                  isDark
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Moon className="h-4 w-4" />
                {t.settings.dark}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
