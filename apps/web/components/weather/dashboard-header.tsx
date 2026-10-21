'use client'

import { useState, useEffect } from 'react'
import { useWeather } from './weather-provider'
import { useApp } from '@/components/app-provider'
import { Radio, RefreshCw, Loader2, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DashboardHeader() {
  const { data, refresh, isLoading, lastUpdated } = useWeather()
  const { t, setSidebarOpen } = useApp()
  const [displayTime, setDisplayTime] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Ensure consistent SSR/client rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update display time only on client to avoid hydration mismatch
  useEffect(() => {
    if (lastUpdated) {
      setDisplayTime(lastUpdated.toLocaleTimeString())
    }
  }, [lastUpdated])

  // Use consistent value for SSR
  const buttonDisabled = mounted ? isLoading : false

  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Radio className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              {data?.station.name || t.header.weatherStation}
            </h1>
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1 ml-11">
            {displayTime
              ? `${t.header.lastUpdated}: ${displayTime}`
              : t.header.connecting}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Refresh Button */}
        <button
          onClick={refresh}
          disabled={buttonDisabled}
          className={cn(
            'rounded-lg bg-secondary p-2.5 text-muted-foreground hover:text-foreground transition-colors',
            buttonDisabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-label={t.header.refresh}
        >
          <RefreshCw className={cn('h-5 w-5', buttonDisabled && 'animate-spin')} />
        </button>
      </div>
    </header>
  )
}
