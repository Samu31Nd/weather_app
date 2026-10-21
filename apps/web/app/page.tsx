'use client'

import { AppProvider, useApp } from '@/components/app-provider'
import { WeatherProvider } from '@/components/weather/weather-provider'
import { Sidebar } from '@/components/sidebar'
import { DashboardView } from '@/components/weather/dashboard-view'
import { ChartsView } from '@/components/weather/charts-view'

function MainContent() {
  const { currentView } = useApp()

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'charts' && <ChartsView />}
      </div>
    </main>
  )
}

export default function WeatherDashboard() {
  return (
    <AppProvider>
      <WeatherProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 lg:ml-0">
            <MainContent />
          </div>
        </div>
      </WeatherProvider>
    </AppProvider>
  )
}
