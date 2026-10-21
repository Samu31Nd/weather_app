'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { WeatherEntity } from '@/lib/domain/weather.entity'
import useSWR from 'swr'

interface WeatherContextType {
  data: WeatherEntity | null
  isLoading: boolean
  error: Error | null
  refresh: () => void
  lastUpdated: Date | null
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined)

// SWR fetcher
const fetcher = async (url: string): Promise<WeatherEntity> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch weather data')
  }
  return res.json()
}

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Use SWR for data fetching with auto-refresh every 60 seconds
  const { data, error, isLoading, mutate } = useSWR<WeatherEntity>(
    '/api/weather',
    fetcher,
    {
      refreshInterval: 60000 * 5, // Refresh every 60 seconds
      revalidateOnFocus: true,
      dedupingInterval: 10000,
      onSuccess: () => {
        setLastUpdated(new Date())
      },
    }
  )

  const refresh = useCallback(() => {
    mutate()
  }, [mutate])

  return (
    <WeatherContext.Provider
      value={{
        data: data ?? null,
        isLoading,
        error: error ?? null,
        refresh,
        lastUpdated,
      }}
    >
      {children}
    </WeatherContext.Provider>
  )
}

export function useWeather() {
  const context = useContext(WeatherContext)
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider')
  }
  return context
}
