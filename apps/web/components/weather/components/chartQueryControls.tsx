'use client'

import { useState } from 'react'
import { useApp } from '@/components/app-provider'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
// import type { DateRange } from 'react-day-picker'

type DateRange = { from: Date | undefined; to?: Date | undefined }

import {
    Calendar as CalendarIcon,
    Search,
    Download,
    FileJson,
    FileSpreadsheet,
    ChevronDown,
    ChevronUp,
    Settings2,
    Thermometer,
    Wind,
    CloudRain,
    Gauge,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Card, CardContent } from '@/components/ui/card'
import type { HistoricalView, QueryMode } from '@/lib/domain/historical-weather.entity'

interface QueryControlsProps {
    selectedViews: HistoricalView[]
    setSelectedViews: (views: HistoricalView[]) => void
    mode: QueryMode
    setMode: (mode: QueryMode) => void
    specificDate: string
    setSpecificDate: (date: string) => void
    dateStart: string
    setDateStart: (date: string) => void
    dateEnd: string
    setDateEnd: (date: string) => void
    days: number
    setDays: (days: number) => void
    onFetch: () => void
    onDownloadJSON: () => void
    onDownloadCSV: () => void
    isLoading: boolean
    isCached: boolean
    hasData: boolean
}

const VIEW_CONFIG: Record<HistoricalView, { icon: React.ElementType; color: string }> = {
    vw_temperatura: { icon: Thermometer, color: 'text-rose-500' },
    vw_viento: { icon: Wind, color: 'text-sky-500' },
    vw_lluvia: { icon: CloudRain, color: 'text-blue-500' },
    vw_presion: { icon: Gauge, color: 'text-emerald-500' },
    vw_clean_weather: { icon: Thermometer, color: 'text-violet-500' }, // ← add this
}

export function ChartQueryControls({
    selectedViews,
    setSelectedViews,
    mode,
    setMode,
    specificDate,
    setSpecificDate,
    dateStart,
    setDateStart,
    dateEnd,
    setDateEnd,
    days,
    setDays,
    onFetch,
    onDownloadJSON,
    onDownloadCSV,
    isLoading,
    isCached,
    hasData,
}: QueryControlsProps) {
    const { t, language } = useApp()
    const [isOpen, setIsOpen] = useState(true)
    const locale = language === 'es' ? es : enUS

    const views: { id: HistoricalView; label: string }[] = [
        { id: 'vw_temperatura', label: t.charts.temperature },
        { id: 'vw_viento', label: t.charts.wind },
        { id: 'vw_lluvia', label: t.charts.rain },
        { id: 'vw_presion', label: t.charts.barometer },
    ]

    const modes: { id: QueryMode; label: string }[] = [
        { id: 'specific_date', label: t.charts.specificDate },
        { id: 'date_range', label: t.charts.dateRange },
        { id: 'last_n_days', label: t.charts.lastNDays },
    ]

    const toggleView = (viewId: HistoricalView) => {
        if (selectedViews.includes(viewId)) {
            if (selectedViews.length > 1) {
                setSelectedViews(selectedViews.filter(v => v !== viewId))
            }
        } else {
            setSelectedViews([...selectedViews, viewId])
        }
    }

    // Parse string dates to Date objects for Calendar
    const specificDateObj = specificDate ? new Date(specificDate + 'T00:00:00') : undefined
    const dateRangeObj: DateRange | undefined = dateStart && dateEnd
        ? { from: new Date(dateStart), to: new Date(dateEnd) }
        : dateStart
            ? { from: new Date(dateStart), to: undefined }
            : undefined

    // Get yesterday's date as max date (API updates at 12:00 with previous day's data)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const handleSpecificDateSelect = (date: Date | undefined) => {
        if (date) {
            setSpecificDate(format(date, 'yyyy-MM-dd'))
        }
    }

    const handleDateRangeSelect = (range: DateRange | undefined) => {
        if (range?.from) {
            setDateStart(format(range.from, "yyyy-MM-dd'T'HH:mm"))
            if (range.to) {
                setDateEnd(format(range.to, "yyyy-MM-dd'T'HH:mm"))
            }
        }
    }

    const formatDateDisplay = (dateStr: string) => {
        if (!dateStr) return t.charts.selectDate
        const date = new Date(dateStr)
        return format(date, 'PPP', { locale })
    }

    const formatRangeDisplay = () => {
        if (!dateStart) return t.charts.selectDate
        const from = new Date(dateStart)
        if (!dateEnd) return format(from, 'PP', { locale })
        const to = new Date(dateEnd)
        return `${format(from, 'PP', { locale })} - ${format(to, 'PP', { locale })}`
    }

    const selectedViewsLabel = selectedViews.map(v =>
        views.find(view => view.id === v)?.label
    ).join(', ')

    const currentModeLabel = modes.find(m => m.id === mode)?.label

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <Card className="border bg-card/50 backdrop-blur-md overflow-hidden">
                {/* Header - Always visible */}
                <CollapsibleTrigger asChild>
                    <div
                        role='button'
                        tabIndex={0}
                        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <Settings2 className="size-4 text-primary" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-foreground">{t.charts.queryControls}</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {selectedViewsLabel} | {currentModeLabel}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isCached && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    {t.charts.cachedData}
                                </span>
                            )}
                            {hasData && !isOpen && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => e.stopPropagation()}
                                            className="gap-1.5"
                                        >
                                            <Download className="size-4" />
                                            <span className="hidden sm:inline">{t.charts.download}</span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-52" align="end">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-xs text-muted-foreground mb-2 font-medium px-2">
                                                {t.charts.downloadFormat}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="justify-start gap-2"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onDownloadJSON()
                                                }}
                                            >
                                                <FileJson className="size-4" />
                                                JSON ({t.charts.processedData})
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="justify-start gap-2"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onDownloadCSV()
                                                }}
                                            >
                                                <FileSpreadsheet className="size-4" />
                                                CSV ({t.charts.rawData})
                                            </Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )}
                            {isOpen ? (
                                <ChevronUp className="size-5 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="size-5 text-muted-foreground" />
                            )}
                        </div>
                    </div>
                </CollapsibleTrigger>

                {/* Collapsible Content */}
                <CollapsibleContent>
                    <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 border-t border-border/50">
                        <div className="space-y-6 pt-4">
                            {/* Data View Multi-Selection */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-3 block">
                                    {t.charts.dataView} ({t.charts.selectMultiple})
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {views.map((v) => {
                                        const isSelected = selectedViews.includes(v.id)
                                        const config = VIEW_CONFIG[v.id]
                                        const Icon = config.icon
                                        return (
                                            <button
                                                key={v.id}
                                                onClick={() => toggleView(v.id)}
                                                className={cn(
                                                    'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-2',
                                                    isSelected
                                                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                                        : 'bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground'
                                                )}
                                            >
                                                <Icon className={cn('size-4', isSelected ? 'text-primary-foreground' : config.color)} />
                                                <span className="truncate">{v.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Query Mode Selection */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-3 block">
                                    {t.charts.queryMode}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {modes.map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => setMode(m.id)}
                                            className={cn(
                                                'px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border',
                                                mode === m.id
                                                    ? 'bg-accent text-accent-foreground border-accent shadow-sm'
                                                    : 'bg-secondary/30 text-muted-foreground border-transparent hover:bg-secondary/50 hover:text-foreground'
                                            )}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mode-specific inputs */}
                            <div className="bg-secondary/30 rounded-xl p-4">
                                {mode === 'specific_date' && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground mb-3 block">
                                            {t.charts.selectDate}
                                        </label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full sm:w-80 justify-start text-left font-normal h-11',
                                                        !specificDate && 'text-muted-foreground'
                                                    )}
                                                >
                                                    <CalendarIcon className="size-4 mr-2" />
                                                    {formatDateDisplay(specificDate)}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={specificDateObj}
                                                    onSelect={handleSpecificDateSelect}
                                                    disabled={(date: Date) => date > yesterday}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}

                                {mode === 'date_range' && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground mb-3 block">
                                            {t.charts.dateRange}
                                        </label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full sm:w-105 justify-start text-left font-normal h-11',
                                                        !dateStart && 'text-muted-foreground'
                                                    )}
                                                >
                                                    <CalendarIcon className="size-4 mr-2" />
                                                    {formatRangeDisplay()}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="range"
                                                    selected={dateRangeObj}
                                                    onSelect={handleDateRangeSelect}
                                                    numberOfMonths={2}
                                                    disabled={(date: Date) => date > yesterday}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}

                                {mode === 'last_n_days' && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground mb-3 block">
                                            {t.charts.days}: <span className="text-foreground font-semibold">{days}</span>
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                min={1}
                                                max={30}
                                                value={days}
                                                onChange={(e) => setDays(parseInt(e.target.value, 10))}
                                                className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                            <input
                                                type="number"
                                                min={1}
                                                max={365}
                                                value={days}
                                                onChange={(e) => setDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                                className={cn(
                                                    'w-20 px-3 py-2 rounded-lg border bg-background text-foreground text-center',
                                                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                                                )}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                            <span>1</span>
                                            <span>30</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    onClick={() => {
                                        onFetch()
                                        setIsOpen(false)
                                    }}
                                    disabled={isLoading}
                                    className="gap-2 shadow-lg hover:shadow-xl"
                                >
                                    <Search className={cn('size-4', isLoading && 'animate-spin')} />
                                    {t.charts.fetchData}
                                </Button>

                                {hasData && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="gap-2">
                                                <Download className="size-4" />
                                                {t.charts.download}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-52" align="start">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-xs text-muted-foreground mb-2 font-medium px-2">
                                                    {t.charts.downloadFormat}
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="justify-start gap-2"
                                                    onClick={onDownloadJSON}
                                                >
                                                    <FileJson className="size-4" />
                                                    JSON ({t.charts.processedData})
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="justify-start gap-2"
                                                    onClick={onDownloadCSV}
                                                >
                                                    <FileSpreadsheet className="size-4" />
                                                    CSV ({t.charts.rawData})
                                                </Button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    )
}
