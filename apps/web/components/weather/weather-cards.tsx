'use client'

import { useWeather } from './weather-provider'
import { useApp } from '@/components/app-provider'
import {
  formatTemperatureFromEntity,
  formatSpeedFromEntity,
  formatPressureFromEntity,
  formatRainFromEntity,
  getWindDirectionLabel,
  getBarometerTrendInfo,
} from '@/lib/application/get-weather.usecase'
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  CloudRain,
  Home,
  Sunrise,
  Sunset,
  TrendingUp,
  TrendingDown,
  Minus,
  Navigation,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card backdrop-blur-xl p-6 transition-all duration-300 hover:bg-card/80',
        className
      )}
    >
      {children}
    </div>
  )
}

function LoadingCard({ className }: { className?: string }) {
  return (
    <GlassCard className={cn('flex items-center justify-center', className)}>
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </GlassCard>
  )
}

function ErrorCard({ className, onRetry }: { className?: string; onRetry: () => void }) {
  const { t } = useApp()
  return (
    <GlassCard className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <p className="text-muted-foreground text-sm">Failed to load data</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm text-primary hover:bg-primary/20 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </GlassCard>
  )
}

export function PrimaryCard() {
  const { data, isLoading, error, refresh } = useWeather()
  const { isMetric, t } = useApp()

  if (isLoading && !data) return <LoadingCard className="h-full" />
  if (error && !data) return <ErrorCard className="h-full" onRetry={refresh} />

  const temp = data?.outdoor.temperature ?? null
  const humidity = data?.outdoor.humidity ?? null
  const feelsLike = data?.outdoor.heatIndex ?? data?.outdoor.windChill ?? null

  return (
    <GlassCard className="h-full flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
            {t.cards.temperature}
          </p>
          <p className="text-7xl font-light tracking-tight text-foreground mt-2">
            {formatTemperatureFromEntity(temp, isMetric)}
          </p>
        </div>
        <div className="rounded-full bg-primary/10 p-4">
          <Thermometer className="h-8 w-8 text-primary" />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-2">
            <Droplets className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {t.cards.humidity}
            </p>
            <p className="text-xl font-medium text-foreground">
              {humidity !== null ? `${humidity}%` : '--'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-chart-3/10 p-2">
            <Thermometer className="h-5 w-5 text-chart-3" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {t.cards.feelsLike}
            </p>
            <p className="text-xl font-medium text-foreground">
              {formatTemperatureFromEntity(feelsLike, isMetric)}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

export function WindCard() {
  const { data, isLoading, error, refresh } = useWeather()
  const { isMetric, t } = useApp()

  if (isLoading && !data) return <LoadingCard className="h-full" />
  if (error && !data) return <ErrorCard className="h-full" onRetry={refresh} />

  const speed = data?.wind.speed ?? null
  const gust = data?.wind.gust ?? null
  const direction = data?.wind.direction ?? null

  return (
    <GlassCard className="h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
            {t.cards.wind}
          </p>
          <p className="text-4xl font-light text-foreground mt-1">
            {formatSpeedFromEntity(speed, isMetric)}
          </p>
        </div>
        <div className="rounded-full bg-chart-2/10 p-3">
          <Wind className="h-6 w-6 text-chart-2" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase">{t.cards.gust}</p>
          <p className="text-lg font-medium text-foreground">
            {formatSpeedFromEntity(gust, isMetric)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Navigation
            className="h-5 w-5 text-chart-2 transition-transform"
            style={{ transform: `rotate(${(direction ?? 0) + 180}deg)` }}
          />
          <span className="text-lg font-medium text-foreground">
            {getWindDirectionLabel(direction)}
          </span>
        </div>
      </div>
    </GlassCard>
  )
}

export function BarometerCard() {
  const { data, isLoading, error, refresh } = useWeather()
  const { isMetric, t } = useApp()

  if (isLoading && !data) return <LoadingCard className="h-full" />
  if (error && !data) return <ErrorCard className="h-full" onRetry={refresh} />

  const pressure = data?.barometer.pressure ?? null
  const trendInfo = getBarometerTrendInfo(data?.barometer.trend ?? 20)

  const getTrendLabel = () => {
    if (trendInfo.direction === 'up') return t.cards.rising
    if (trendInfo.direction === 'down') return t.cards.falling
    return t.cards.steady
  }

  const TrendIcon =
    trendInfo.direction === 'up'
      ? TrendingUp
      : trendInfo.direction === 'down'
        ? TrendingDown
        : Minus

  return (
    <GlassCard className="h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
            {t.cards.barometer}
          </p>
          <p className="text-3xl font-light text-foreground mt-1">
            {formatPressureFromEntity(pressure, isMetric)}
          </p>
        </div>
        <div className="rounded-full bg-chart-4/10 p-3">
          <Gauge className="h-6 w-6 text-chart-4" />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <TrendIcon
          className={cn(
            'h-4 w-4',
            trendInfo.direction === 'up' && 'text-green-500',
            trendInfo.direction === 'down' && 'text-red-500',
            trendInfo.direction === 'steady' && 'text-muted-foreground'
          )}
        />
        <span className="text-sm text-muted-foreground">{getTrendLabel()}</span>
      </div>
    </GlassCard>
  )
}

export function RainCard() {
  const { data, isLoading, error, refresh } = useWeather()
  const { isMetric, t } = useApp()

  if (isLoading && !data) return <LoadingCard className="h-full" />
  if (error && !data) return <ErrorCard className="h-full" onRetry={refresh} />

  const rate = data?.rain.rate ?? null
  const daily = data?.rain.daily ?? null
  const yearly = data?.rain.yearly ?? null

  return (
    <GlassCard className="h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
            {t.cards.rainfall}
          </p>
          <p className="text-3xl font-light text-foreground mt-1">
            {formatRainFromEntity(rate, isMetric)}
            <span className="text-lg text-muted-foreground">/hr</span>
          </p>
        </div>
        <div className="rounded-full bg-chart-1/10 p-3">
          <CloudRain className="h-6 w-6 text-chart-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase">{t.cards.today}</p>
          <p className="text-lg font-medium text-foreground">
            {formatRainFromEntity(daily, isMetric)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase">{t.cards.yearly}</p>
          <p className="text-lg font-medium text-foreground">
            {formatRainFromEntity(yearly, isMetric)}
          </p>
        </div>
      </div>
    </GlassCard>
  )
}

export function IndoorCard() {
  const { data, isLoading, error, refresh } = useWeather()
  const { isMetric, t } = useApp()

  if (isLoading && !data) return <LoadingCard className="h-full" />
  if (error && !data) return <ErrorCard className="h-full" onRetry={refresh} />

  const temp = data?.indoor.temperature ?? null
  const humidity = data?.indoor.humidity ?? null

  return (
    <GlassCard className="h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
            {t.cards.indoor}
          </p>
          <p className="text-4xl font-light text-foreground mt-1">
            {formatTemperatureFromEntity(temp, isMetric)}
          </p>
        </div>
        <div className="rounded-full bg-chart-5/10 p-3">
          <Home className="h-6 w-6 text-chart-5" />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <Droplets className="h-4 w-4 text-accent" />
        <span className="text-lg font-medium text-foreground">
          {humidity !== null ? `${humidity}%` : '--'}
        </span>
        <span className="text-sm text-muted-foreground">{t.cards.humidity}</span>
      </div>
    </GlassCard>
  )
}

export function AstronomyCard() {
  const { data, isLoading, error, refresh } = useWeather()
  const { t } = useApp()

  if (isLoading && !data) return <LoadingCard className="h-full" />
  if (error && !data) return <ErrorCard className="h-full" onRetry={refresh} />

  return (
    <GlassCard className="h-full">
      <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-4">
        {t.cards.sunTimes}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-chart-3/10 p-2">
            <Sunrise className="h-5 w-5 text-chart-3" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">{t.cards.sunrise}</p>
            <p className="text-xl font-medium text-foreground">
              {data?.astronomy.sunrise || '--:--'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-chart-5/10 p-2">
            <Sunset className="h-5 w-5 text-chart-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">{t.cards.sunset}</p>
            <p className="text-xl font-medium text-foreground">
              {data?.astronomy.sunset || '--:--'}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
