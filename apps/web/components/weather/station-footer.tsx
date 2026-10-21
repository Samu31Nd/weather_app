'use client'

import { useApp } from '../app-provider'
import { useWeather } from './weather-provider'
import { Wifi, Battery, Clock } from 'lucide-react'

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`
}

export function StationFooter() {
  const { data } = useWeather()
  const { t } = useApp()

  if (!data) {
    return (
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>{t.header.connecting}</p>
      </footer>
    )
  }

  return (
    <footer className="mt-8 border-t border-border pt-6">
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{data.station.name}</span>
          <span className="text-xs bg-secondary px-2 py-0.5 rounded">
            v{data.station.firmwareVersion}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Wifi className="h-4 w-4" />
          <span>{data.station.signalStrength} dBm</span>
          {/* <span className="text-xs">({data.station.ssid})</span> */}
        </div>

        <div className="flex items-center gap-1.5">
          <Battery className="h-4 w-4" />
          <span>{data.station.batteryVoltage.toFixed(2)}V</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>Uptime: {formatUptime(data.station.uptime)}</span>
        </div>

        <div className="text-xs">
          IP: {data.station.ip}
        </div>
      </div>
    </footer>
  )
}
