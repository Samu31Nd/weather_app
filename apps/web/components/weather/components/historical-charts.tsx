'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useApp } from '@/components/app-provider'
import Box from '@mui/material/Box'
import { LineChart } from '@mui/x-charts/LineChart'
import { BarChart } from '@mui/x-charts/BarChart'
import { AlertCircle, Thermometer, Droplets, Wind, Gauge, CloudRain, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { HistoricalView, QueryMode, TemperatureEntity, WindEntity, RainEntity, PressureEntity } from '@/lib/domain/historical-weather.entity'
import { getCachedData, setCachedData, generateHistoricalCacheKey } from '@/lib/cache/cache'
import { ChartQueryControls } from './chartQueryControls'
import { useTheme } from '@mui/material/styles'
import { format } from 'date-fns'

interface ApiResponse<T> {
    total: number
    data: T[]
    meta: {
        view: string
        mode: string
        params: Record<string, unknown>
        fetchedAt: string
    }
}

interface ViewData {
    view: HistoricalView
    data: unknown[]
    total: number
    isCached: boolean
}

function ChartCard({
    title,
    icon: Icon,
    children,
    className,
    subtitle
}: {
    title: string
    icon: React.ElementType
    children: React.ReactNode
    className?: string
    subtitle?: string
}) {
    return (
        // <Card className={`border bg-card/60 backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:bg-card/80 ${className || ''}`}>
        //     <CardHeader className="flex flex-row items-center gap-3 pb-2 pt-5 px-5">
        //         <div className="rounded-xl bg-primary/10 p-2.5 shadow-sm">
        //             <Icon className="size-5 text-primary" />
        //         </div>
        //         <div>
        //             <CardTitle className="text-lg font-semibold tracking-tight">{title}</CardTitle>
        //             {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        //         </div>
        //     </CardHeader>
        //     <CardContent className="px-2 pb-5 pt-1 sm:px-4">
        //     </CardContent>
        // </Card>
        <Box sx={{
            width: '100%',
            height: 300,
            // Sin overflow hidden en el Box tampoco
            position: 'relative',
            zIndex: 0,
        }}>
            {children}
        </Box>
    )
}

export function HistoricalCharts() {
    const { t, isMetric, isDark } = useApp()

    // Query state - now supports multiple views
    const [selectedViews, setSelectedViews] = useState<HistoricalView[]>(['vw_temperatura'])
    const [mode, setMode] = useState<QueryMode>('last_n_days')
    const [specificDate, setSpecificDate] = useState(() => {
        const d = new Date()
        d.setDate(d.getDate() - 1)
        return d.toISOString().split('T')[0]
    })
    const [dateStart, setDateStart] = useState(() => {
        const d = new Date()
        d.setDate(d.getDate() - 2)
        return d.toISOString().slice(0, 16)
    })
    const [dateEnd, setDateEnd] = useState(() => {
        const d = new Date()
        d.setDate(d.getDate() - 1)
        return d.toISOString().slice(0, 16)
    })
    const [days, setDays] = useState(1)

    // Data state - stores data for each view
    const [viewsData, setViewsData] = useState<Map<HistoricalView, ViewData>>(new Map())
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fetchedAt, setFetchedAt] = useState<string | null>(null)

    // Generate cache key based on current query params
    const getCacheKey = useCallback((view: HistoricalView) => {
        return generateHistoricalCacheKey(view, mode, {
            specificDate: mode === 'specific_date' ? specificDate : undefined,
            dateStart: mode === 'date_range' ? dateStart : undefined,
            dateEnd: mode === 'date_range' ? dateEnd : undefined,
            days: mode === 'last_n_days' ? days : undefined,
        })
    }, [mode, specificDate, dateStart, dateEnd, days])

    // Fetch data for a single view
    const fetchViewData = useCallback(async (view: HistoricalView, skipCache = false): Promise<ViewData | null> => {
        const cacheKey = getCacheKey(view)

        // Try to get cached data first
        if (!skipCache) {
            const cached = getCachedData<ApiResponse<unknown>>(cacheKey)
            if (cached) {
                return {
                    view,
                    data: cached.data,
                    total: cached.total,
                    isCached: true,
                }
            }
        }

        try {
            const params = new URLSearchParams()
            params.set('view', view)
            params.set('mode', mode)

            if (mode === 'specific_date') {
                params.set('specific_date', specificDate)
            } else if (mode === 'date_range') {
                params.set('date_start', dateStart)
                params.set('date_end', dateEnd)
            } else if (mode === 'last_n_days') {
                params.set('days', String(days))
            }

            const response = await fetch(`/api/weather/historical?${params.toString()}`)

            if (!response.ok) {
                throw new Error('Failed to fetch data')
            }

            const result: ApiResponse<unknown> = await response.json()

            // Cache the result
            setCachedData(cacheKey, result, 6 * 60 * 60 * 1000) // 6 hours TTL

            return {
                view,
                data: result.data.reverse(),
                total: result.total,
                isCached: false,
            }
        } catch {
            return null
        }
    }, [mode, specificDate, dateStart, dateEnd, days, getCacheKey])

    // Fetch data for all selected views
    const fetchAllData = useCallback(async (skipCache = false) => {
        setIsLoading(true)
        setError(null)

        try {
            const results = await Promise.all(
                selectedViews.map(view => fetchViewData(view, skipCache))
            )

            const newViewsData = new Map<HistoricalView, ViewData>()
            let hasError = false

            results.forEach((result, index) => {
                if (result) {
                    newViewsData.set(selectedViews[index], result)
                } else {
                    hasError = true
                }
            })

            if (hasError && newViewsData.size === 0) {
                setError('Failed to fetch data')
            } else {
                setViewsData(newViewsData)
                setFetchedAt(new Date().toISOString())
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setIsLoading(false)
        }
    }, [selectedViews, fetchViewData])

    // Download JSON
    const handleDownloadJSON = useCallback(() => {
        const timestamp = format(new Date(), 'yyyyMMdd_HHmmss')
        const viewNames = selectedViews.map(v => v.replace('vw_', '')).join('-')

        const exportData: Record<string, unknown[]> = {}
        viewsData.forEach((vd, key) => {
            exportData[key] = vd.data
        })

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${timestamp}_dataset_${viewNames}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }, [selectedViews, viewsData])

    // Download CSV from external API
    const handleDownloadCSV = useCallback(() => {
        const timestamp = format(new Date(), 'yyyyMMdd_HHmmss')
        let url = process.env.NEXT_PUBLIC_API_URL! + 'webdl.php?action=text'

        if (mode === 'specific_date' && specificDate) {
            url += `&date=${specificDate}`
        } else if (mode === 'last_n_days') {
            url += `&days=${days}`
        } else if (mode === 'date_range' && dateStart) {
            // Use just the date part for the CSV API
            const dateOnly = dateStart.split('T')[0]
            url += `&date=${dateOnly}`
        }

        // Open in new tab - the browser will handle the download
        const a = document.createElement('a')
        a.href = url
        a.download = `${timestamp}_weather_data.csv`
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }, [mode, specificDate, dateStart, days])

    // Initial fetch
    useEffect(() => {
        fetchAllData()
    }, [])

    const theme = useTheme();

    // Chart styling
    const chartColors = {
        primary: theme.palette.primary.main,
        secondary: theme.palette.success?.main ?? '#059669',
        tertiary: theme.palette.error?.main ?? '#db2777',
        quaternary: theme.palette.info?.main ?? '#2563eb',
        grid: theme.palette.divider,
        text: theme.palette.text.secondary,
    }

    // Check if data spans multiple days
    const hasMultipleDays = useCallback((data: { fecha: Date; hora: string }[]): boolean => {
        if (data.length < 2) return false
        const dates = new Set(data.map(d => {
            const date = new Date(d.fecha)
            return date.toISOString().split('T')[0]
        }))
        return dates.size > 1
    }, [])

    // Format x-axis labels based on data span
    const formatTimeLabels = useCallback((data: { fecha: Date; hora: string }[]): string[] => {
        const multiDay = hasMultipleDays(data)

        return data.map(d => {
            const date = new Date(d.fecha)
            const time = d.hora?.slice(0, 5) || ''

            if (multiDay) {
                // For multiple days: show MM/DD HH:mm
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                return `${month}/${day} ${time}`
            }
            // For single day: just show time
            return time
        })
    }, [hasMultipleDays])

    // Chart base props with tick formatting for multi-day data
    const getChartProps = useCallback((dataLength: number, isMultiDay: boolean) => {
        const tickInterval = isMultiDay
            ? Math.max(1, Math.floor(dataLength / 12))
            : Math.max(1, Math.floor(dataLength / 24))

        return {
            height: 280,
            margin: { top: 20, right: 20, bottom: isMultiDay ? 50 : 35, left: 55 },
            // ✅ Solo overrides específicos, el resto lo maneja el tema
            sx: {
                '& .MuiLineElement-root': { strokeWidth: 2.5 },
                '& .MuiAreaElement-root': { fillOpacity: isDark ? 0.12 : 0.08 },
            },
            grid: { horizontal: true, vertical: false },
            slotProps: {
                legend: {
                    direction: 'row' as const,
                    position: { vertical: 'top' as const, horizontal: 'middle' as const },
                    padding: { bottom: 16 },
                },
            },
            skipAnimation: false,
            xAxis: [{
                scaleType: 'point' as const,
                tickLabelStyle: isMultiDay ? { angle: -45, textAnchor: 'end' as const } : undefined,
                tickInterval: (_: unknown, i: number) => i % tickInterval === 0,
            }],
        }
    }, [chartColors, isDark])

    // Calculate total records
    const totalRecords = useMemo(() => {
        let total = 0
        viewsData.forEach(vd => { total += vd.total })
        return total
    }, [viewsData])

    // Check if any data is cached
    const hasCachedData = useMemo(() => {
        let cached = false
        viewsData.forEach(vd => { if (vd.isCached) cached = true })
        return cached
    }, [viewsData])
    const hasData = viewsData.size > 0

    // Render temperature charts
    const renderTemperatureCharts = (tempData: TemperatureEntity[]) => {
        if (tempData.length === 0) return null

        console.log(tempData.at(0));

        const convertTemp = (val: number | null) => {
            if (val === null) return null
            return isMetric ? val : (val * 9 / 5) + 32
        }
        //const tempUnit = isMetric ? '°C' : '°F'
        const tempUnit = '°C'

        // Sample data if too many points
        const sampledData = tempData

        const isMultiDay = hasMultipleDays(sampledData as unknown as { fecha: Date; hora: string }[])
        const timeLabels = formatTimeLabels(sampledData as unknown as { fecha: Date; hora: string }[])
        const chartProps = getChartProps(sampledData.length, isMultiDay)

        // Only humidity data is available from the API
        const outdoorTemp = sampledData.map(d => d.temperatura_exterior)
        const indoorTemp = sampledData.map(d => d.temperatura_interior)
        const outdoorHum = sampledData.map(d => d.humedad_exterior)
        const indoorHum = sampledData.map(d => d.humedad_interior)

        return (
            <div className="space-y-5">
                <div className='y-3'>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Thermometer className="h-5 w-5 text-primary" />
                        {t.cards.humidity}
                    </h3>
                    <ChartCard title={t.charts.humidityChart} icon={Droplets} subtitle="%">
                        <LineChart
                            {...chartProps}
                            xAxis={[{ ...chartProps.xAxis[0], data: timeLabels }]}
                            yAxis={[{ label: tempUnit }]}
                            series={[
                                { data: outdoorHum, label: t.charts.outdoorHumidity, color: chartColors.primary, showMark: false, curve: 'catmullRom', area: true },
                                { data: indoorHum, label: t.charts.indoorHumidity, color: chartColors.secondary, showMark: false, curve: 'catmullRom' },
                            ]}
                        />
                    </ChartCard>
                </div>
                <div className='y-3'>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Thermometer className="h-5 w-5 text-primary" />
                        {t.charts.temperature}
                    </h3>

                    <ChartCard title={t.charts.temperatureChart} icon={Thermometer} subtitle={tempUnit} className="xl:col-span-2">
                        <LineChart
                            {...chartProps}
                            xAxis={[{ scaleType: 'point', data: timeLabels }]}
                            yAxis={[{ label: tempUnit }]}
                            series={[
                                { data: outdoorTemp, label: t.charts.outdoorTemp, color: chartColors.primary, showMark: false, curve: 'catmullRom', area: true },
                                { data: indoorTemp, label: t.charts.indoorTemp, color: chartColors.secondary, showMark: false, curve: 'catmullRom' },
                            ]}
                        />
                    </ChartCard>
                </div>
            </div>
        )
    }

    // Render wind charts
    const renderWindCharts = (windData: WindEntity[]) => {
        if (windData.length === 0) return null

        const sampledData = windData.length > 200
            ? windData.filter((_, i) => i % Math.ceil(windData.length / 200) === 0)
            : windData

        const isMultiDay = hasMultipleDays(sampledData as unknown as { fecha: Date; hora: string }[])
        const timeLabels = formatTimeLabels(sampledData as unknown as { fecha: Date; hora: string }[])
        const chartProps = getChartProps(sampledData.length, isMultiDay)

        const convertSpeed = (val: number | null) => {
            if (val === null) return null
            return isMetric ? val : val / 1.60934
        }

        const speeds = sampledData.map(d => convertSpeed(d.velocidad_kmh))
        const gusts = sampledData.map(d => convertSpeed(d.rafaga_kmh))
        const speedUnit = isMetric ? 'km/h' : 'mph'

        return (
            <div className="space-y-5">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Wind className="h-5 w-5 text-primary" />
                    {t.charts.wind}
                </h3>
                <ChartCard title={t.charts.windChart} icon={Wind} subtitle={speedUnit}>
                    <LineChart
                        {...chartProps}
                        height={320}
                        xAxis={[{ ...chartProps.xAxis[0], data: timeLabels }]}
                        yAxis={[{ label: speedUnit, min: 0 }]}
                        series={[
                            { data: gusts, label: t.charts.windGust, color: chartColors.tertiary, showMark: false, curve: 'catmullRom', area: true },
                            { data: speeds, label: t.charts.windSpeed, color: chartColors.primary, showMark: false, curve: 'catmullRom' },
                        ]}
                    />
                </ChartCard>
            </div>
        )
    }

    // Render rain charts - only accumulated
    const renderRainCharts = (rainData: RainEntity[]) => {
        if (rainData.length === 0) return null

        console.table(rainData);

        const sampledData = rainData.length > 200
            ? rainData.filter((_, i) => i % Math.ceil(rainData.length / 200) === 0)
            : rainData

        const isMultiDay = hasMultipleDays(sampledData as unknown as { fecha: Date; hora: string }[])
        const timeLabels = formatTimeLabels(sampledData as unknown as { fecha: Date; hora: string }[])
        const chartProps = getChartProps(sampledData.length, isMultiDay)

        const convertRain = (val: number | null) => {
            if (val === null) return null
            return isMetric ? val : val / 25.4
        }

        const amounts = sampledData.map(d => convertRain(d.lluvia_mm))
        const rainUnit = isMetric ? 'mm' : 'in'

        return (
            <div className="space-y-5">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <CloudRain className="h-5 w-5 text-primary" />
                    {t.charts.rain}
                </h3>
                <ChartCard title={t.charts.rainAmount} icon={CloudRain} subtitle={rainUnit}>
                    <BarChart
                        {...chartProps}
                        height={320}
                        xAxis={[{ scaleType: 'band', data: timeLabels, tickLabelStyle: isMultiDay ? { angle: -45, textAnchor: 'end' as const } : undefined }]}
                        yAxis={[{ label: rainUnit, min: 0 }]}
                        series={[
                            { data: amounts, label: t.charts.rainAmount, color: chartColors.quaternary },
                        ]}
                    />
                </ChartCard>
            </div>
        )
    }

    // Render pressure charts
    const renderPressureCharts = (pressureData: PressureEntity[]) => {
        if (pressureData.length === 0) return null

        console.table(pressureData);

        const sampledData = pressureData.length > 200
            ? pressureData.filter((_, i) => i % Math.ceil(pressureData.length / 200) === 0)
            : pressureData

        const isMultiDay = hasMultipleDays(sampledData as unknown as { fecha: Date; hora: string }[])
        const timeLabels = formatTimeLabels(sampledData as unknown as { fecha: Date; hora: string }[])
        const chartProps = getChartProps(sampledData.length, isMultiDay)

        const convertPressure = (val: number | null) => {
            if (val === null) return null
            return isMetric ? val : val / 33.8639
        }

        const pressures = sampledData.map(d => convertPressure(d.presion_hpa))
        const pressureUnit = isMetric ? 'hPa' : 'inHg'

        return (
            <div className="space-y-5">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-primary" />
                    {t.charts.barometer}
                </h3>
                <ChartCard title={t.charts.pressureChart} icon={Gauge} subtitle={pressureUnit}>
                    <LineChart
                        {...chartProps}
                        height={320}
                        xAxis={[{ ...chartProps.xAxis[0], data: timeLabels }]}
                        yAxis={[{ label: pressureUnit }]}
                        series={[
                            { data: pressures, label: t.charts.pressure, color: chartColors.secondary, showMark: false, curve: 'catmullRom', area: true },
                        ]}
                    />
                </ChartCard>
            </div>
        )
    }

    // Render all charts based on selected views
    const renderCharts = () => {
        if (viewsData.size === 0 && !isLoading) {
            return (
                <Card className="border-muted bg-muted/20 mt-6">
                    <CardContent className="flex flex-col items-center justify-center py-14 text-muted-foreground text-center">
                        <AlertCircle className="h-10 w-10 mb-3 opacity-50" />
                        <p className="font-medium">{t.charts.noData}</p>
                    </CardContent>
                </Card>
            )
        }

        return (
            <div className="space-y-8 mt-6">
                {selectedViews.map(view => {
                    const viewData = viewsData.get(view)
                    if (!viewData || viewData.data.length === 0) return null

                    switch (view) {
                        case 'vw_temperatura':
                            return <div key={view}>{renderTemperatureCharts(viewData.data as TemperatureEntity[])}</div>
                        case 'vw_viento':
                            return <div key={view}>{renderWindCharts(viewData.data as WindEntity[])}</div>
                        case 'vw_lluvia':
                            return <div key={view}>{renderRainCharts(viewData.data as RainEntity[])}</div>
                        case 'vw_presion':
                            return <div key={view}>{renderPressureCharts(viewData.data as PressureEntity[])}</div>
                        default:
                            return null
                    }
                })}
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        {t.charts.title}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        {t.charts.subtitle}
                    </p>
                </div>
                {fetchedAt && totalRecords > 0 && (
                    <div className="flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-full whitespace-nowrap">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {totalRecords} {t.charts.records}
                    </div>
                )}
            </div>

            {/* Query Controls */}
            <ChartQueryControls
                selectedViews={selectedViews}
                setSelectedViews={setSelectedViews}
                mode={mode}
                setMode={setMode}
                specificDate={specificDate}
                setSpecificDate={setSpecificDate}
                dateStart={dateStart}
                setDateStart={setDateStart}
                dateEnd={dateEnd}
                setDateEnd={setDateEnd}
                days={days}
                setDays={setDays}
                onFetch={() => fetchAllData(true)}
                isLoading={isLoading}
                isCached={hasCachedData}
                hasData={hasData}
                onDownloadCSV={handleDownloadCSV}
                onDownloadJSON={handleDownloadJSON}
            />

            {/* Error state */}
            {error && (
                <Card className="border-destructive/50 bg-destructive/10">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-destructive text-center">
                        <AlertCircle className="h-10 w-10 mb-3 opacity-80" />
                        <p className="font-medium">{t.charts.error}</p>
                        <p className="text-sm opacity-70 mt-1">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Loading state */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-3" />
                    <p>{t.charts.loading}</p>
                </div>
            )}

            {/* Charts */}
            {!isLoading && !error && renderCharts()}
        </div>
    )
}
